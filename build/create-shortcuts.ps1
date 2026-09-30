param(
  [Parameter(Mandatory = $true)] [string] $Target,
  [Parameter(Mandatory = $true)] [string] $Desktop,
  [Parameter(Mandatory = $true)] [string] $StartMenu
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $Target -PathType Leaf)) {
  throw "Executável instalado não encontrado: $Target"
}

$shell = New-Object -ComObject WScript.Shell
$workingDirectory = [System.IO.Path]::GetDirectoryName($Target)
$iconLocation = "$Target,0"

foreach ($shortcutPath in @($Desktop, $StartMenu)) {
  $shortcutDirectory = [System.IO.Path]::GetDirectoryName($shortcutPath)
  if (-not (Test-Path -LiteralPath $shortcutDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $shortcutDirectory -Force | Out-Null
  }

  $temporaryShortcutPath = "$shortcutPath.new.lnk"
  Remove-Item -LiteralPath $temporaryShortcutPath -Force -ErrorAction SilentlyContinue

  $shortcut = $shell.CreateShortcut($temporaryShortcutPath)
  $shortcut.TargetPath = $Target
  $shortcut.WorkingDirectory = $workingDirectory
  $shortcut.IconLocation = $iconLocation
  $shortcut.Description = 'Universo Interativo'
  $shortcut.Save()

  $savedShortcut = $shell.CreateShortcut($temporaryShortcutPath)
  if ($savedShortcut.TargetPath -ne $Target -or $savedShortcut.IconLocation -ne $iconLocation) {
    Remove-Item -LiteralPath $temporaryShortcutPath -Force -ErrorAction SilentlyContinue
    throw "Atalho temporário gravado com destino ou ícone inválido: $shortcutPath"
  }

  Move-Item -LiteralPath $temporaryShortcutPath -Destination $shortcutPath -Force
  $installedShortcut = $shell.CreateShortcut($shortcutPath)
  if ($installedShortcut.TargetPath -ne $Target -or $installedShortcut.IconLocation -ne $iconLocation) {
    throw "Atalho instalado com destino ou ícone inválido: $shortcutPath"
  }
}
