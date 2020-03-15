const fs = require('fs');

// 拿那一堆TLD的目录
let authDir = fs.readdirSync(`${__dirname}/../../root_union/unionTest/zoneFiles/auth`);

/**
 * 一个一个IP拿出来吧，hashmap排重
 */
let ipList = {};
for(var i=0;i<authDir.length;i++) {
    var file = fs.readFileSync(`${__dirname}/../../root_union/unionTest/zoneFiles/auth/${authDir[i]}`).toString().split('\r\n');
    var ip1Location = file[2].split('\t');
    var ip2Location = file[4].split('\t');
    
    ipList[ip1Location[4]] = true;
    ipList[ip2Location[4]] = true;

    if(i % 1000 == 0) {
        console.log(`done : ${i}/${authDir.length}`)
    }
}
console.log('hash done');
let result = [];
for(var i in ipList) {
    result.push(i)
}
console.log(result.length);
fs.writeFileSync(`${__dirname}/eas/ipList`, result.join('\n'));