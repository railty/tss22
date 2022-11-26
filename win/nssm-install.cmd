nssm install tss c:\sites\node\npm.cmd run server-win --workspace tss
nssm set tss Application C:\sites\node-v18.12.1-win-x64\npm.cmd
nssm set tss AppDirectory C:\sites\tss22
nssm set tss AppParameters run server-win --workspace tss
nssm set tss ObjectName .\tss 123456

nssm install tss-sync c:\sites\node\npm.cmd run start --workspace sync
nssm set tss-sync Application C:\sites\node-v18.12.1-win-x64\npm.cmd
nssm set tss-sync AppDirectory C:\sites\tss22
nssm set tss-sync AppParameters run start --workspace sync
nssm set tss-sync ObjectName .\tss 123456

