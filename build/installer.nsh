!macro customInstall
  File /oname=$PLUGINSDIR\create-shortcuts.ps1 "${BUILD_RESOURCES_DIR}\create-shortcuts.ps1"
  ExecWait '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\create-shortcuts.ps1" -Target "$appExe" -Desktop "$newDesktopLink" -StartMenu "$newStartMenuLink"' $0
  ${if} $0 != 0
    Abort "Não foi possível criar os atalhos do Universo Interativo."
  ${endIf}

  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
