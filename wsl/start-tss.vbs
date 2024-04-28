Set tss = CreateObject("Wscript.Shell")
tss.run "wsl -u sning /bin/bash -lc /etc/start-tss.sh", vbhide

Set redirect = CreateObject("Wscript.Shell")
redirect.run "powershell -file c:\sites\tss-wsl2\port-redirect.ps1", vbhide

Set sync = CreateObject("Wscript.Shell")
sync.run "wsl -u sning /bin/bash -lc /etc/start-sync.sh", vbhide

Set tsse = CreateObject("Wscript.Shell")
tsse.CurrentDirectory = "C:\sites\tsse-win32-x64\"
tsse.run "C:\sites\tsse-win32-x64\tsse.exe"