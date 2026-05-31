Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("public\logo.png")
Write-Host "$($img.Width)x$($img.Height)"
$img.Dispose()
