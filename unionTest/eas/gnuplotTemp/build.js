const fs = require('fs');
const mainLogVersion = process.argv[2];

let result = {
    'victim-ic' : {
        index : {},
        length : 0
    },
    'victim-oc' : {
        index : {},
        length : 0
    },
    'victim-nb' : {
        index: {},
        length : 0
    },
    'victim-tb' : {
        index : {},
        length : 0
    }
}

let mainDir = fs.readdirSync(`${__dirname}/../logs/${mainLogVersion}`);
/**
 * 取数据出来
 */
for(var sub=0;sub<mainDir.length;sub++) {
    let subDir = fs.readdirSync(`${__dirname}/../logs/${mainLogVersion}/${mainDir[sub]}`);
    for(var i=0;i<subDir.length;i++) {
        let filename = subDir[i];
        let file = fs.readFileSync(`${__dirname}/../logs/${mainLogVersion}/${mainDir[sub]}/${filename}`).toString().split('\n');
        for(var line=0;line<file.length;line++) {
            var temp = file[line].split(' ');
            if(temp.length != 2) {
                continue ;
            }

            let index = temp[0];
            let data = parseFloat(temp[1]);
            if(!(index in result[filename].index)) {
                result[filename].index[index] = 0;
            }

            result[filename].index[index] += data;
        }

        result[filename].length ++; // 每个文件
    }
}
// 计算平均数
for(var item in result) {
    for(var i in result[item].index) {
        result[item].index[i] = result[item].index[i] / result[item].length;
    }
}

// 写进gnuplot文件
for(var item in result) {
    fs.writeFileSync(`${__dirname}/tempData/${item}`, '');
    let data = [];
    for(var i in result[item].index) {
        data.push(`${i} ${result[item].index[i]}`);
    }
    fs.writeFileSync(`${__dirname}/tempData/${item}`, data.join('\n'));
}

var out = require('child_process').spawn(`${__dirname}/draw.bat`, {
    shell : true,
    detached : true, // 使子进程独立于其父进程运行，保持gnuplot的图像可见
});