const { exec } = require('child-process-promise');

let base = 'd:\\sites\\';
let paths = ['tools', '7z', 'git\\bin', 'node-v10.24.1-win-x64', 'nssm-2.24']

async function run () {
	const ret = await exec('reg.exe query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path');
	let str =  ret.stdout;
	console.log(str);

	str = str.match(/\s+Path\s+REG_EXPAND_SZ\s+(.*)/)
	let strPath = str[1];
	aPath = strPath.split(';');
	//str = str.split(/\s+/);
	hPath = aPath.reduce((hash, p)=>{
		hash[p] = 0;
		return hash;
	}, {});
		
	paths.forEach((p)=>{
		let path = `${base}${p}`;
		if (hPath[path]){}
		else{
			hPath[path] = 1;
		}
	});	
	//console.log(hPath);
	strPath = '';
	for (var k in hPath) {
		if (k != ''){
			strPath = strPath+k+';'
		}
	}
	//console.log(strPath);
	
	let cmd = `reg.exe add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path /d "${strPath}" /t REG_EXPAND_SZ /f`;
	console.log(cmd);
	await exec(cmd);
}

run()