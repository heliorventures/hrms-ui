"""Publish an integrity-checked public catalog to the existing HRMS UI media mount."""
import argparse
import datetime
import fcntl
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import uuid

ASSET = re.compile(r"assets/[a-f0-9]{64}\.(mp4|png|jpg|webp)\Z")
VIDEO_ID = re.compile(r"[a-z0-9][a-z0-9-]{0,79}\Z")
MAX_FILE = 100 * 1024 * 1024
MAX_TOTAL = 2 * 1024 * 1024 * 1024


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(file):
    value = hashlib.sha256()
    with open(file, "rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def inside(root, path):
    resolved = path.resolve()
    require(resolved != root and root in resolved.parents, "Refused a path outside the application folder.")
    return resolved


def validate_host(app, container):
    result = subprocess.run(["docker", "inspect", container], capture_output=True, text=True, check=True)
    mounts = json.loads(result.stdout)[0]["Mounts"]
    expected = (app / "media/video-guides").resolve()
    require(any(mount["Destination"] == "/srv/video-guides" and Path(mount["Source"]).resolve() == expected and not mount["RW"] for mount in mounts),
            "Deploy the updated HRMS UI and compose template first: the read-only video media mount is missing.")
    result = subprocess.run(["docker", "exec", container, "nginx", "-T"], capture_output=True, text=True, check=True)
    require("video-guides-storage-v1" in result.stdout and "alias /srv/video-guides/catalog.json;" in result.stdout,
            "Deploy the updated HRMS UI image first: its video media route is missing.")


def valid_text(value, maximum):
    return isinstance(value, str) and 0 < len(value.strip()) <= maximum


def valid_date(value):
    if not valid_text(value, 40):
        return False
    try:
        return datetime.datetime.fromisoformat(value.replace("Z", "+00:00")).tzinfo is not None
    except ValueError:
        return False


def validate_catalog(catalog, asset_names):
    require(isinstance(catalog, dict) and catalog.get("schemaVersion") == 1, "Invalid catalog schema.")
    videos = catalog.get("videos")
    require(isinstance(videos, list) and 0 < len(videos) <= 1000, "Invalid number of guides.")
    require(valid_date(catalog.get("updatedAt")), "Invalid catalog date.")
    ids = set()
    for video in videos:
        require(isinstance(video, dict), "Invalid guide.")
        identity = video.get("id")
        require(isinstance(identity, str) and VIDEO_ID.fullmatch(identity) and identity not in ids, "Invalid or duplicate guide ID.")
        ids.add(identity)
        for field, limit in [("title", 160), ("feature", 80), ("description", 1000)]:
            require(valid_text(video.get(field), limit), "Invalid guide metadata.")
        duration = video.get("durationSeconds")
        require(type(duration) in (int, float) and math.isfinite(duration) and 0 < duration <= 60, "Videos must be at most 60 seconds.")
        keywords = video.get("keywords")
        require(isinstance(keywords, list) and len(keywords) <= 20 and all(valid_text(word, 80) for word in keywords), "Invalid search keywords.")
        require(video.get("disclosure") in ("demo", "sample-payroll", "simulated-gps"), "Missing recording disclosure.")
        require(valid_date(video.get("updatedAt")), "Invalid guide date.")
        for field in ("src", "poster"):
            if field == "poster" and field not in video:
                continue
            url = video.get(field)
            require(isinstance(url, str) and url.startswith("/video-guides/"), "Invalid media URL.")
            name = url.removeprefix("/video-guides/")
            require(ASSET.fullmatch(name) and name in asset_names, "A guide refers to missing media.")
            require(name.endswith(".mp4") == (field == "src"), "Invalid media type.")
    return ids


def unpack(archive, stage):
    with tarfile.open(archive, "r:gz") as source:
        members = source.getmembers()
        require(len(members) <= 2003 and sum(member.size for member in members) <= MAX_TOTAL, "Upload bundle is too large.")
        names = set()
        for member in members:
            if member.isdir() and member.name.rstrip("/") == "assets":
                continue
            require(member.isfile() and member.name not in names, "Bundle contains a link, duplicate or unexpected entry.")
            require(member.name in ("catalog.json", "bundle.json") or ASSET.fullmatch(member.name), "Unsafe archive path.")
            limit = MAX_FILE if member.name.startswith("assets/") else 2 * 1024 * 1024
            require(0 < member.size <= limit, "Invalid upload file size.")
            names.add(member.name)
            target = stage / member.name
            target.parent.mkdir(parents=True, exist_ok=True)
            with source.extractfile(member) as reader, open(target, "xb") as writer:
                shutil.copyfileobj(reader, writer)
        require({"catalog.json", "bundle.json"} <= names, "Incomplete upload bundle.")
    bundle = json.loads((stage / "bundle.json").read_text())
    require(bundle.get("schemaVersion") == 1 and bundle.get("catalogSha256") == digest(stage / "catalog.json"), "Catalog integrity failed.")
    assets = bundle.get("assets")
    require(isinstance(assets, list), "Invalid asset manifest.")
    assets_by_name = {asset["file"]: asset["sha256"] for asset in assets}
    require(len(assets_by_name) == len(assets) and set(assets_by_name) == names - {"catalog.json", "bundle.json"}, "Asset manifest mismatch.")
    for name, checksum in assets_by_name.items():
        require(ASSET.fullmatch(name) and checksum == Path(name).stem and digest(stage / name) == checksum, "Media integrity failed.")
    catalog = json.loads((stage / "catalog.json").read_text())
    return catalog, validate_catalog(catalog, assets_by_name), assets_by_name


def publish(app, archive, expected, container):
    validate_host(app, container)
    media = inside(app, app / "media/video-guides")
    media.mkdir(parents=True, exist_ok=True)
    media.chmod(0o755)
    backup = inside(app, app / "backups/video-guides")
    backup.mkdir(parents=True, exist_ok=True)
    with open(inside(app, app / "media/.video-guides.lock"), "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        current = inside(app, media / "catalog.json")
        require((digest(current) if current.exists() else "none") == expected, "The remote catalog changed during upload. Retry after reviewing the current catalog.")
        with tempfile.TemporaryDirectory(prefix="video-guides-", dir=archive.parent) as temporary:
            stage = Path(temporary)
            catalog, ids, assets = unpack(archive, stage)
            if current.exists():
                previous = json.loads(current.read_text())
                previous_ids = {video["id"] for video in previous["videos"]}
                require(previous_ids <= ids, "The local catalog omits existing server guides. Synchronize it before uploading; removal is not supported by this script.")
                stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
                shutil.copyfile(current, backup / f"catalog-{stamp}-{uuid.uuid4().hex[:8]}.json")
            (media / "assets").mkdir(exist_ok=True)
            (media / "assets").chmod(0o755)
            for name, checksum in assets.items():
                destination = inside(app, media / name)
                if destination.exists():
                    require(digest(destination) == checksum, "Existing server media failed its integrity check.")
                    continue
                pending = destination.with_name(f".{destination.name}.{uuid.uuid4().hex}.tmp")
                try:
                    shutil.copyfile(stage / name, pending)
                    pending.chmod(0o644)
                    os.replace(pending, destination)
                finally:
                    pending.unlink(missing_ok=True)
            pending = media / f".catalog-{uuid.uuid4().hex}.tmp"
            try:
                shutil.copyfile(stage / "catalog.json", pending)
                pending.chmod(0o644)
                with open(pending, "rb") as stream:
                    os.fsync(stream.fileno())
                os.replace(pending, current)
            finally:
                pending.unlink(missing_ok=True)
    return len(catalog["videos"])


def main():
    require(sys.version_info >= (3, 9), "Python 3.9 or later is required on the server.")
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-dir", required=True)
    parser.add_argument("--archive", required=True)
    parser.add_argument("--sha256", required=True)
    parser.add_argument("--expected-catalog", required=True)
    parser.add_argument("--container", default="kabipay-ui")
    args = parser.parse_args()
    app = Path(args.app_dir).resolve(strict=True)
    require(app != Path("/"), "Refused the filesystem root as an application folder.")
    archive = inside(app, Path(args.archive))
    require(app / "uploads/video-guides" in archive.parents, "Upload must be in the video-guides staging folder.")
    require(re.fullmatch(r"[a-f0-9]{64}", args.sha256) and digest(archive) == args.sha256, "Upload archive integrity failed.")
    count = publish(app, archive, args.expected_catalog, args.container)
    print(json.dumps({"status": "published", "videos": count, "catalog": str(app / "media/video-guides/catalog.json")}))
    archive.unlink()
    helper = Path(__file__).resolve()
    if helper.parent == archive.parent:
        helper.unlink()
        helper.parent.rmdir()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError, tarfile.TarError, subprocess.SubprocessError) as error:
        raise SystemExit(f"Video publication stopped: {error}")
