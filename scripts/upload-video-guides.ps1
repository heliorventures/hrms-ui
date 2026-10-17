<#
.SYNOPSIS
    Add, replace, import and publish the HRMS in-app video guides.
.DESCRIPTION
    Native OpenSSH asks for the server password interactively. This script never
    reads, stores or passes a password. The public catalog is the local source
    of truth; keep it and its ignored media assets together between uploads.
.EXAMPLE
    .\scripts\upload-video-guides.ps1 -Action Import -PrepareOnly
.EXAMPLE
    .\scripts\upload-video-guides.ps1 -Action Upload -VpsHost 159.198.70.19 -VpsUser root
.EXAMPLE
    .\scripts\upload-video-guides.ps1 -Action Add -VpsHost 159.198.70.19 -VpsUser deploy
#>
[CmdletBinding()]
param(
    [ValidateSet('Choose', 'Import', 'Add', 'Replace', 'Upload')]
    [string]$Action = 'Choose',
    [ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9.-]*$')]
    [string]$VpsHost = '159.198.70.19',
    [ValidatePattern('^[a-z_][a-z0-9_-]*$')]
    [string]$VpsUser,
    [ValidateRange(1, 65535)]
    [int]$SshPort = 22,
    [ValidatePattern('^/[a-zA-Z0-9_/-]+$')]
    [string]$AppDir = '/opt/apps',
    [ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9_.-]*$')]
    [string]$UiContainer = 'kabipay-ui',
    [string]$PublicBaseUrl = 'https://heliorsoft.com',
    [string]$RecorderCatalog,
    [switch]$PrepareOnly
)

$ErrorActionPreference = 'Stop'
$UiRoot = Split-Path -Parent $PSScriptRoot
$Manager = Join-Path $PSScriptRoot 'video-guides/manage.mjs'
$Publisher = Join-Path $PSScriptRoot 'video-guides/publish_remote.py'

function Require-NativeCommand([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "$Name is required on PATH." }
}

function Invoke-Native([string]$Executable, [string[]]$Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Executable failed. Publication stopped; no retry was attempted." }
}

function Read-Required([string]$Prompt) {
    $value = (Read-Host $Prompt).Trim()
    if ([string]::IsNullOrWhiteSpace($value)) { throw 'A required value was empty.' }
    return $value
}

function Get-EditArguments([string]$Operation) {
    Write-Host 'Feature examples: Getting started, Attendance, Leave, Payroll, Expenses & travel.'
    if ($Operation -eq 'Replace') {
        Write-Host 'Use an existing ID. Blank fields keep their current values; a blank MP4 path edits metadata only.'
        $localCatalog = Join-Path $UiRoot 'public/video-guides/catalog.json'
        if (Test-Path -LiteralPath $localCatalog) {
            $guides = (Get-Content -LiteralPath $localCatalog -Raw -Encoding UTF8 | ConvertFrom-Json).videos
            foreach ($guide in $guides) { Write-Host "  $($guide.id): $($guide.title) [$($guide.feature)]" }
        }
    }
    $editArguments = @($Manager, $Operation.ToLowerInvariant(), '--id', (Read-Required 'Video ID (for example punch or leave-apply)'))
    $questions = [ordered]@{
        file = 'MP4 file path'
        title = 'Video title'
        feature = 'Feature category'
        description = 'Short description'
        keywords = 'Search keywords, separated by commas'
        poster = 'Optional poster file path (PNG, JPG or WebP; blank generates a poster)'
    }
    foreach ($field in $questions.Keys) {
        $value = (Read-Host $questions[$field]).Trim()
        if ($value) { $editArguments += @("--$field", $value.Trim('"')) }
    }
    $disclosure = (Read-Host 'Recording label: demo, sample-payroll or simulated-gps (blank keeps current/default demo)').Trim()
    if ($disclosure) { $editArguments += @('--disclosure', $disclosure) }
    return $editArguments
}

Require-NativeCommand 'node'
Require-NativeCommand 'tar'
if ($Action -eq 'Choose') {
    $Action = Read-Required 'Choose Import (recorder videos), Add, Replace or Upload (current library)'
    if ($Action -notin @('Import', 'Add', 'Replace', 'Upload')) { throw 'Choose Import, Add, Replace or Upload.' }
}

if ($Action -eq 'Import') {
    $importArguments = @($Manager, 'import')
    if ($RecorderCatalog) { $importArguments += @('--source', $RecorderCatalog) }
    Invoke-Native 'node' $importArguments
} elseif ($Action -in @('Add', 'Replace')) {
    Invoke-Native 'node' (Get-EditArguments $Action)
}

$packageOutput = & node $Manager package
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare the video upload package.' }
$package = $packageOutput | ConvertFrom-Json
Write-Host "Prepared $($package.videos) guides: $($package.archive)"
if ($PrepareOnly) {
    Write-Host 'Prepared locally. No server connection or publication was attempted.'
    return
}

Require-NativeCommand 'ssh'
Require-NativeCommand 'scp'
if (-not $VpsUser) { $VpsUser = Read-Required 'SSH username' }
if ($VpsUser -notmatch '^[a-z_][a-z0-9_-]*$') { throw 'Invalid SSH username.' }
$publicUri = [Uri]$PublicBaseUrl
if ($publicUri.Scheme -ne 'https' -or $publicUri.UserInfo -or $publicUri.Query -or $publicUri.Fragment -or $publicUri.AbsolutePath -ne '/') {
    throw 'PublicBaseUrl must be an HTTPS origin with no credentials, path, query or fragment.'
}
$AppDir = $AppDir.TrimEnd('/')
if (-not $AppDir -or $AppDir -match '//') { throw 'Use a specific absolute application directory.' }
$uploadId = [Guid]::NewGuid().ToString('N')
$remote = "${VpsUser}@${VpsHost}"
$remoteDirectory = "$AppDir/uploads/video-guides/$uploadId"
$remoteArchive = "$remoteDirectory/" + [IO.Path]::GetFileName($package.archive)
$remotePublisher = "$remoteDirectory/publish_remote.py"
$authentication = @('-o', 'BatchMode=no', '-o', 'PubkeyAuthentication=no', '-o', 'PreferredAuthentications=keyboard-interactive,password', '-o', 'StrictHostKeyChecking=ask', '-o', 'ConnectTimeout=20')
$sshOptions = $authentication + @('-p', "$SshPort")
$scpOptions = $authentication + @('-P', "$SshPort")

Write-Host "Publishing the public library to $remote."
Write-Host 'OpenSSH will prompt for the server password for each connection. Passwords are not stored.'
Write-Host 'This updates the video library only. Deploy the updated UI image and compose template once before the first upload.'
$preflight = "set -eu; command -v python3 >/dev/null; command -v sha256sum >/dev/null; test -d '$AppDir'; umask 077; mkdir -p '$remoteDirectory'; if test -f '$AppDir/media/video-guides/catalog.json'; then sha256sum '$AppDir/media/video-guides/catalog.json' | cut -d ' ' -f 1; else echo none; fi"
$preflightOutput = & ssh @sshOptions $remote $preflight
if ($LASTEXITCODE -ne 0) { throw 'Server preflight failed. Check SSH access, Python 3 and the application directory.' }
$expectedCatalog = @($preflightOutput | Where-Object { $_ -match '^(none|[a-f0-9]{64})$' })
if ($expectedCatalog.Count -ne 1) { throw 'Could not determine the current server catalog identity.' }

Invoke-Native 'scp' ($scpOptions + @($package.archive, $Publisher, "${remote}:$remoteDirectory/"))
$publishCommand = "python3 '$remotePublisher' --app-dir '$AppDir' --archive '$remoteArchive' --sha256 '$($package.sha256)' --expected-catalog '$($expectedCatalog[0])' --container '$UiContainer'"
Invoke-Native 'ssh' ($sshOptions + @($remote, $publishCommand))
Write-Host "Published. Open $($publicUri.GetLeftPart([UriPartial]::Authority))/hrms-demos"
Write-Host 'Confirm video playback and seeking in your browser before sharing the link.'
