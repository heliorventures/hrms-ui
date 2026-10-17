# In-app video guides

The public React route is `/hrms-demos`. It belongs to `hrms-ui` and is linked
from the marketing page and the application Help menu. No separate site or
video service is needed. Individual links use `/hrms-demos?video=punch`.

## What is stored where

- `src/modules/video-guides/`: lazy-loaded screen, category filters, search,
  single video player, and shared runtime catalog validation.
- `public/video-guides/catalog.json`: reviewed, version-controlled metadata.
- `public/video-guides/assets/`: local media, ignored by Git and Docker builds.
- `.video-guides-build/`: upload archives and temporary local files, ignored.
- VPS `$AppDir/media/video-guides/`: persistent public catalog and assets.
- VPS `$AppDir/backups/video-guides/`: previous catalog versions.

Titles, feature categories, descriptions and comma-separated keywords are
searchable. Categories are derived from the catalog, so a new feature needs no
UI changes. Media filenames contain SHA-256 hashes; replacing a video preserves
its stable guide ID and share link while changing the media URL. Existing
assets are retained so cached pages and previous catalogs still work.

## Prerequisites

Local: Node.js 22, native OpenSSH (`ssh`, `scp`), `tar`, and FFmpeg for preparing
or uploading media. The tool uses the demo recorder's installed `ffmpeg-static`
when available, otherwise `ffmpeg` on PATH. Set `VIDEO_GUIDES_FFMPEG` to an
explicit executable path if needed. Videos must be H.264 MP4, no longer than
60 seconds and no larger than 100 MiB. Guides use visible captions burned into
the recording; include those captions in new recordings as well.

VPS: Python 3.9 or later, `sha256sum`, and Docker access for the SSH user. The user must
be able to write within `$AppDir`. The publisher checks the existing UI
container's read-only media mount and Nginx route before publishing anything.

## First deployment

1. Deploy the changed `hrms-ui` image through the existing release process.
   Sync the updated `hrms-documentation/deploy/docker-compose.prod.yml`.
   Its UI service mounts `./media/video-guides:/srv/video-guides:ro`.
   The deployment script creates the host directory before starting containers.
   Use the usual application deployment inputs; no database migration is
   introduced by this feature. Do not overwrite the existing runtime config.
2. Prepare the nine existing recorder videos (run from `hrms-ui`):

   ```powershell
   .\scripts\upload-video-guides.ps1 -Action Import -PrepareOnly
   ```

3. Publish, supplying the server's actual SSH username:

   ```powershell
   .\scripts\upload-video-guides.ps1 -Action Upload -VpsHost 159.198.70.19 -VpsUser YOUR_SSH_USERNAME
   ```

4. Open `https://heliorsoft.com/hrms-demos`. Confirm search, category filters,
   playback, seeking, the sample payroll label, and the GPS demonstration label
   before sharing the URL. The URL is public, including the videos themselves.

The script invokes native OpenSSH password authentication. OpenSSH displays
masked password prompts in your terminal for each connection (normally three).
Passwords are never read by the script, saved, supplied as arguments, or sent to
chat. Host key verification remains enabled. If the server disables password
authentication, use its administrator-approved authentication setup instead;
this script does not change the SSH server configuration.

## Add a new video

```powershell
.\scripts\upload-video-guides.ps1 -Action Add -VpsUser YOUR_SSH_USERNAME
```

Enter a new stable ID such as `employee-profile`, MP4 path, title, feature,
description and keywords. The script can generate a poster, or you can supply
a PNG/JPG/WebP. Choose `demo`, `sample-payroll` or `simulated-gps` truthfully.
Use `-PrepareOnly` to prepare and review locally without any server connection.

## Replace a video or edit its metadata

```powershell
.\scripts\upload-video-guides.ps1 -Action Replace -VpsUser YOUR_SSH_USERNAME
```

Enter its existing ID. Blank metadata fields keep the previous values. Leave
the MP4 path blank to edit metadata only; provide a new MP4 to replace the
recording. A replacement generates a new poster unless you supply one.

`-Action Import` refreshes known recorder IDs from the latest recorder gallery
and preserves custom IDs. Review metadata afterwards: imports restore the
standard feature labels and descriptions for those recorder IDs.

## Publication behavior and recovery

- Local preparation validates metadata and MP4 duration/format, hashes assets,
  and includes only referenced public media in the archive. Credentials and
  raw recording manifests are excluded.
- The server verifies the archive checksum, safe entry paths, file hashes,
  catalog schema, media references and recording duration metadata. It does
  not independently decode MP4 contents; duration/encoding probing is local.
- An exclusive server lock and comparison with the preflight catalog hash
  stop simultaneous updates from silently overwriting one another.
- The complete local catalog is authoritative. Keep the tracked catalog and
  its ignored media together (or restore media from the original recordings).
  The publisher refuses a catalog that omits IDs already on the server.
  It supports adding and replacing guides; deletion is intentionally excluded.
- Files are uploaded before the catalog is atomically replaced. A failed
  pre-publication step leaves the prior catalog active. If a connection is lost,
  inspect the public catalog before retrying: publication may have completed.
- Previous catalogs are backed up outside the served directory. Restoring a
  previous catalog is sufficient for rollback because old media is retained.
  Ask the server administrator to restore it with an atomic file replacement.
- Successful staging archives are removed; failed uploads remain under
  `$AppDir/uploads/video-guides/` for investigation. Manage old assets and
  backups deliberately; this script never recursively deletes server media.

## Execution status

The nine existing guides were imported locally, and `Upload -PrepareOnly`
created a publication archive without connecting to the VPS. Source
implementation and local preparation are separate from deployment
acceptance. No application tests, typecheck, lint or build were run
as part of this implementation. The password-prompting remote publisher has
not been executed against the VPS. Deploy and verify through the existing
review/release process before claiming the public URL is live.
