$FullList = (Get-Content src/data/units.json) -join "`n" | ConvertFrom-Json | ForEach-Object { $_.PSObject.Properties | Select-Object -Expand Name } | ForEach-Object { $_ -Replace ":","" -Replace " ","_" -Replace '"',"" -Replace "'","" }
$CurrentList = Get-ChildItem -Path src/img/portrait/*.png | ForEach-Object { $_.Name -Replace ".png","" }

$DiffList = $FullList | Where-Object { $CurrentList -notcontains $_ } | ForEach-Object { "https://feheroes.gamepedia.com/File:" + $_ + "_Face_FC.png" } | ForEach-Object { (Invoke-WebRequest $_).Images | Where-Object { $_.src -match "Face_FC" } | Select-Object src -First 1 -ExpandProperty src }
$DiffList.foreach({ 
    $fileName = [System.Web.HttpUtility]::UrlDecode($_) -replace "_Face_FC","" | Split-Path -Leaf
    $fileName = $fileName.Substring(0, $fileName.IndexOf('?'))
    Invoke-WebRequest -Uri $_ -OutFile src/img/$fileName
    magick convert src/img/$fileName -resize 75x75 src/img/$fileName
})
Get-ChildItem -Path src/img/*.png | Move-Item -Force -Destination src/img/portrait
