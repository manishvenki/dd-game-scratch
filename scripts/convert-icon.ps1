Add-Type -AssemblyName System.Drawing

function Convert-PngToIco {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SourcePng,
        [Parameter(Mandatory=$true)]
        [string]$OutputIco
    )

    $srcPath = (Resolve-Path $SourcePng).Path
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $sizes = @(256, 128, 64, 48, 32, 16)
    $images = @()

    foreach ($sz in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap $sz, $sz
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($src, 0, 0, $sz, $sz)
        $g.Dispose()

        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        $bytes = $ms.ToArray()
        $images += ,@($sz, $bytes)
        $ms.Dispose()
    }
    $src.Dispose()

    $fs = [System.IO.File]::Create($OutputIco)
    $bw = New-Object System.IO.BinaryWriter $fs

    # ICONDIR Header (6 bytes): Reserved=0, Type=1 (ICO), Count=N
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$images.Count)

    $offset = 6 + (16 * $images.Count)
    foreach ($img in $images) {
        $sz = $img[0]
        $bytes = $img[1]
        $w = if ($sz -ge 256) { 0 } else { [byte]$sz }
        $h = if ($sz -ge 256) { 0 } else { [byte]$sz }

        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0)              # Palette colors
        $bw.Write([byte]0)              # Reserved
        $bw.Write([uint16]1)            # Color planes
        $bw.Write([uint16]32)           # Bits per pixel
        $bw.Write([uint32]$bytes.Length)# Image data size
        $bw.Write([uint32]$offset)      # Image data offset
        $offset += $bytes.Length
    }

    foreach ($img in $images) {
        $bw.Write($img[1])
    }

    $bw.Flush()
    $bw.Close()
    $fs.Close()
    Write-Output "Successfully wrote ICO: $OutputIco"
}

$source = Join-Path $PSScriptRoot "..\public\assets\branding\dd-game-icon.png"
$targetBranding = Join-Path $PSScriptRoot "..\public\assets\branding\dd-game-icon.ico"
$targetScripts = Join-Path $PSScriptRoot "dd-game-icon.ico"

Convert-PngToIco -SourcePng $source -OutputIco $targetBranding
Convert-PngToIco -SourcePng $source -OutputIco $targetScripts
