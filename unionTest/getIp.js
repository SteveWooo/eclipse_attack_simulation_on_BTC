const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input : fs.createReadStream(`${__dirname}/../../data/AppDDos.pcap`)
})

rl.on('line', function(data){
    console.log(data.toString());
})