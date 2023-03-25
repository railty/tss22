#install winget in ms store

#under pwershell administrator
#set-executionpolicy remotesigned

winget install --id=Microsoft.WindowsTerminal -e

wsl --install --inbox --no-distribution
shutdown -r