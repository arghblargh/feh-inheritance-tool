[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# function Remove-StringNormalize
# {
#     PARAM ([string]$String)
#     $String = $String -Replace ":","" -Replace " ","_" -Replace '"',"" -Replace "'",""
#     [Text.Encoding]::ASCII.GetString([Text.Encoding]::GetEncoding("Cyrillic").GetBytes($String))
# }
$weapon = @([psobject][ordered]@{name="";unlock=1},[psobject][ordered]@{name="";unlock=2},[psobject][ordered]@{name="";unlock=3},[psobject][ordered]@{name=""})
$skill = @([psobject][ordered]@{name="";unlock=1})

$Units = Get-Content src/data/units.json -raw | ConvertFrom-Json
$FullList = Get-Content src/data/stats/rarity.json -raw | ConvertFrom-Json | ForEach-Object { $_.PSObject.Properties | Select-Object -Expand Name }
$CurrentList = $Units | ForEach-Object { $_.PSObject.Properties | Select-Object -Expand Name }
$DiffList = $FullList | Where-Object { $CurrentList -notcontains $_ }

$DiffList.foreach({
    $name = $_.Split(": ")
    $unit = [psobject][ordered]@{name=$name[0];title=$name[1];color="";wpnType="";movType="";skills=[psobject][ordered]@{weapon=$weapon;assist=$skill;special=$skill;passiveA=$skill;passiveB=$skill;passiveC=$skill}}
    $Units | Add-Member -TypeName PSObject -NotePropertyName $_ -NotePropertyValue $unit
})
$Units | ConvertTo-Json -depth 32 | Set-Content src/data/units.json
