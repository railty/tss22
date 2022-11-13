start cmd as admin
powershell -Command "Start-Process cmd -Verb RunAs"

npm install
copy config.json.template config.json
copy db/tss.sqlite.template db/tss.sqlite
copy db/punch.sqlite.template db/punch.sqlite


.\node_modules\.bin\electron-packager.cmd .