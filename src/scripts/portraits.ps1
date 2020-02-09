[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Remove-StringNormalize
{
    PARAM ([string]$String)
    $String = $String -Replace ":","" -Replace " ","_" -Replace '"',"" -Replace "'",""
    [Text.Encoding]::ASCII.GetString([Text.Encoding]::GetEncoding("Cyrillic").GetBytes($String))
}

$StatList = Get-Content src/data/stats/rarity.json -raw | ConvertFrom-Json | ForEach-Object { $_.PSObject.Properties | Select-Object -Expand Name } | ForEach-Object { Remove-StringNormalize -String $_ }
$UnitList = Get-Content src/data/units.json -raw | ConvertFrom-Json | ForEach-Object { $_.PSObject.Properties | Select-Object -Expand Name } | ForEach-Object { Remove-StringNormalize -String $_ }
$FullList = $StatList + $UnitList | Select -uniq
$CurrentList = Get-ChildItem -Path src/img/portrait/* | ForEach-Object { [io.path]::GetFileNameWithoutExtension($_) }

$DiffList = $FullList | Where-Object { $CurrentList -notcontains $_ } | ForEach-Object { "https://feheroes.gamepedia.com/File:" + $_ + "_Face_FC.webp" } | ForEach-Object { (Invoke-WebRequest $_).Links | Where-Object { $_.href -match "Face_FC.webp" } | Select-Object href -First 1 -ExpandProperty href }
$DiffList.foreach({ 
    $fileName = [System.Web.HttpUtility]::UrlDecode($_) -replace "_Face_FC","" | Split-Path -Leaf
    $fileName = $fileName.Substring(0, $fileName.IndexOf('?'))
    Invoke-WebRequest -Uri $_ -OutFile src/img/$fileName
    magick convert src/img/$fileName -resize 75x75 src/img/$fileName
})
Get-ChildItem -Path src/img/*.webp | Move-Item -Force -Destination src/img/portrait
