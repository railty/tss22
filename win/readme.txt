1. enable windows developer mode, to enable mklink
git config --global core.symlinks true
git config core.symlinks true
git clone https://github.com/railty/tss22

copy win\nssm.exe c:\windows\system32\
copy win\sqlite3.exe c:\windows\system32\
copy win\scite* c:\windows\system32\

2. 
npm run build --workspace tsse
copy config.json.sample config.json
copy config.json packages\tsse\tsse-xxxxx\

cd db
copy tss.sqlite.template tss.sqlite
copy punch.sqlite.template punch.sqlite

npm run build --workspace tss
npm run server-win --workspace tss

softether

startup folder
C:\Users\tss\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup