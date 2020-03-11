
	const fs = require('fs');
/**
* 1、修改config，选到指定打包目录
* 2、打包后的文件会保存在index.html同个目录，把access入口修改成打包文件，即可上线
*/

var config = [
{
	version : '1.1.7',
	path : `${ __dirname }/../web`
}, 
// {
// 	version : '1.0.9',
// 	path : `${ __dirname } /../sharePage`
// },
// {
// 	version : '1.0.4',
// 	path : `${ __dirname } /../main`
// }
]

async function getFiles(_config){
	var files = [];
	var accessFile = fs.readFileSync(`${ _config.path } /conf/access.js`).toString();
	files.push(accessFile);

	var modelDirs = fs.readdirSync(`${ _config.path } /models`);
	for (var i = 0; i < modelDirs.length; i++) {
		var pageFile = fs.readFileSync(`${_config.path}/models/${modelDirs[i]}/${modelDirs[i]}Page.js`).toString();
		var modelFile = fs.readFileSync(`${_config.path}/models/${modelDirs[i]}/${modelDirs[i]}Model.js`).toString();
		files.push(pageFile);
		files.push(modelFile);
	}

	return files.join('\n');
}

async function main() {
	try {

		for (var i = 0; i < config.length; i++) {
			var _config = config[i];

			var fileData = await getFiles(_config);
			var fileStat = fs.existsSync(`${_config.path}/out/bundle-${_config.version}.js`);
			if (fileStat == true) {
				console.log('目标版本已存在！请修改版本号');
				return;
			}
			fs.writeFileSync(`${_config.path}/out/bundle-${_config.version}.js`, fileData);
		}
	} catch (e) {
		console.log(e);
	}


}

main();
	