function Format-Json([Parameter(Mandatory, ValueFromPipeline)][String] $json) {
  $indent = 0;
  ($json -Split '\n' |
    % {
      if ($_ -match '[\}\]]') {
        # This line contains  ] or }, decrement the indentation level
        $indent--
      }
      $line = (' ' * $indent * 4) + $_.TrimStart().Replace(':  ', ': ')
      if ($_ -match '[\{\[]') {
        # This line contains [ or {, increment the indentation level
        $indent++
      }
      $line
  }) -Join "`n"
}

function Copy-Property ($From, $To) {
	foreach ($p in Get-Member -InputObject $From -MemberType NoteProperty) {
		Add-Member -InputObject $To -MemberType NoteProperty -Name $p.Name -Value $From.$($p.Name) -Force
	}
}

function SortObject ([Parameter(Mandatory, ValueFromPipeline)] $In) {
	$sorted = [ordered] @{}
	$out = New-Object PSCustomObject
	Get-Member -Type NoteProperty -InputObject $In | Sort-Object Name | % { $sorted[$_.Name] = $In.$($_.Name) }
	Add-Member -InputObject $out -NotePropertyMembers $sorted
	return $out
}

$infile = Get-Content input_data.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json
$assists = Get-Content data/assists.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json
$specials = Get-Content data/specials.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json
$units = Get-Content data/units.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json
$weapons = Get-Content data/weapons.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json
$passives = Get-Content data/passives.json | Where-Object {$_ -NotMatch '//'} | ConvertFrom-Json

Copy-Property -From $infile.assists -To $assists
Copy-Property -From $infile.specials -To $specials
Copy-Property -From $infile.units -To $units
Copy-Property -From $infile.weapons -To $weapons
Copy-Property -From $infile.passives.A -To $passives.A
Copy-Property -From $infile.passives.B -To $passives.B
Copy-Property -From $infile.passives.C -To $passives.C

$assists | SortObject | ConvertTo-Json -Depth 50 | Format-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content data/assists.json
$specials | SortObject | ConvertTo-Json -Depth 50 | Format-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content data/specials.json
$units | SortObject | ConvertTo-Json -Depth 50 | Format-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content data/units.json
$weapons | SortObject | ConvertTo-Json -Depth 50 | Format-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content data/weapons.json
$passives.A = $passives.A | SortObject
$passives.B = $passives.B | SortObject
$passives.C = $passives.C | SortObject
$passives | SortObject | ConvertTo-Json -Depth 50 | Format-Json | % { [System.Text.RegularExpressions.Regex]::Unescape($_) } | Set-Content data/passives.json