const { exec } = require('child-process-promise');

let base = 'c:\\sites\\';
let shellPath = 'tss6\\tsse-win32-x64\\tsse.exe';

async function run () {
	let ret = await exec('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v Shell');
	let str =  ret.stdout;
	//console.log(str);
	str = str.match(/\s+Shell\s+REG_SZ\s+(.*)/)
	let strShellBak = str[1];
	console.log(strShellBak);

	if (strShellBak == 'explorer.exe'){
		let cmd = `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v Shell.bak /d "${strShellBak}" /t REG_SZ /f`;
		console.log(cmd);
		await exec(cmd);
		console.log("shell is backuped to shell.bak");

		cmd = `reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon" /v Shell /d "${base}${shellPath}" /t REG_SZ /f`;
		console.log(cmd);
		await exec(cmd);
		console.log(`shell is now [${base}${shellPath}]`);
	}
	else{
		console.log("shell is not explorer.exe, abort");
	}
}
run()