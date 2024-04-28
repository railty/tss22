mkdir c:\sites\tss
mkdir c:\sites\tsse

wsl --import tss c:\sites\tss .\tss.tar.gz

rem wsl --list -v
rem wsl --shutdown
rem wsl --export wlm C:\temp\tss.tar
rem wsl --unregister wlm