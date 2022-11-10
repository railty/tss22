#under pwershell administrator
#set-executionpolicy remotesigned

#scite
#copy \\hqsvr2\pris\scite*

# nodejs
# Invoke-webRequest -Uri "https://nodejs.org/dist/v10.16.0/node-v10.16.0-win-x86.zip"
Invoke-webRequest -Uri "https://nodejs.org/dist/v10.16.0/node-v10.16.0-win-x64.zip" -OutFile ..\node-v10.16.0-win-x64.zip

# git
#Invoke-webRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.22.0.windows.1/PortableGit-2.22.0-32-bit.7z.exe"
#Invoke-webRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.22.0.windows.1/PortableGit-2.22.0-64-bit.7z.exe"

#use nssm to setup the service, do not use pm2 (too complicated) or node-windows (not working)