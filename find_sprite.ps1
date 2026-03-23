Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\Angel\Downloads\Bomberman\assets\SNES - Super Bomberman - Playable Characters - Bomberman.png")
$bmp = new-object System.Drawing.Bitmap($img)

$out = "Image size: " + $bmp.Width + "x" + $bmp.Height + "`r`n"

for ($y = 0; $y -lt 120; $y += 1) {
  $line = ""
  for ($x = 0; $x -lt 80; $x += 1) {
    $c = $bmp.GetPixel($x, $y)
    if ($c.R -lt 50 -and $c.G -gt 200 -and $c.B -gt 200) { $line += "C" }
    elseif ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) { $line += "W" }
    elseif ($c.R -gt 200 -and $c.G -lt 100 -and $c.B -gt 200) { $line += "P" }
    elseif ($c.R -gt 200 -and $c.G -lt 100 -and $c.B -lt 100) { $line += "R" }
    elseif ($c.R -lt 50 -and $c.G -lt 50 -and $c.B -lt 50) { $line += "B" }
    elseif ($c.G -gt $c.R -and $c.G -gt $c.B) { $line += "." }
    else { $line += " " }
  }
  $out += $y.ToString("D3") + " " + $line + "`r`n"
}

Set-Content -Path "C:\Users\Angel\Downloads\Bomberman\sprite_dump.txt" -Value $out
