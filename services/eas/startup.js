/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */
const fs = require('fs');

async function sleep(time) {
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, time)
    })
}

/**
 * 分配IP地址
 */
async function getIpList(swc, options) {
    var file = fs.readFileSync(`${__dirname}/../../unionTest/eas/ipList`).toString().split('\n');
    var result = {
        victim : file.splice(0, 1), // 一个受害者
        normal : file.splice(0, 200), // 一万个普通节点
        attacker : file.splice(0, 200), // 两万个坏人
    }

    return result;
}

/** 
 * 初始化全局变量，初始化时间
 */
async function init(swc, options){
    global.swc = {
		/**
		 * 时光老头
		 */
		timer : new swc.models.Timer(swc, {}),

		/**
		 * 存节点的
		 */
		nodeContainer : new swc.models.NodeContainer(swc, {}),

		/**
		 * 存日志的
		 */
		counter : new swc.models.Counter(swc, {}),
    }

    /**
     * 创建节点，这里应该封装到nodeContainer里面进行
     */
    var ipList = await getIpList(swc, options);
    // var ipList = ['11.22.33.44', '11.22.5.4', '11.22.3.2', '11.22.3.4', '11.22.1.1', '11.22.1.2', '11.22.1.3', '11.22.1.4', '11.22.1.5'];
    for(var i=0;i<ipList.normal.length;i++) {
        global.swc.nodeContainer.nodes.normal[ipList.normal[i]] = new swc.models.Node(swc, {
            ip : ipList.normal[i],
            type : 'normal'
        });
    }

    // ipList = ['1.2.3.4'];
    for(var i=0;i<ipList.victim.length;i++) {
        global.swc.nodeContainer.nodes.victim[ipList.victim[i]] = new swc.models.Node(swc, {
            ip : ipList.victim[i],
            type : 'victim'
        });
    }

    // ipList = ['3.1.1.1', '3.1.1.2', '3.1.1.3', '3.1.1.4', '3.1.1.5', '3.1.1.6', '3.1.1.7', '3.1.1.8', '3.1.1.9'];
    for(var i=0;i<ipList.attacker.length;i++) {
        global.swc.nodeContainer.nodes.attacker[ipList.attacker[i]] = new swc.models.Node(swc, {
            ip : ipList.attacker[i],
            type : 'attacker'
        });
    }

    /**
     * 创建实验子日志目录，为了多次实验取平均
     */
    let now = +new Date();
    global.swc.timer.subLogVersion = now;
    try {
        fs.mkdirSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}`);
    }catch(e) {}
    try {
        fs.writeFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-nb`, '');
        fs.writeFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-tb`, '');
        fs.writeFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-oc`, '');
        fs.writeFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-ic`, '');
    }catch(e) {}

}

/**
 * 记录实验结果
 */
async function writeLog(swc, options) {

}

/** 
 * 实验正式流程入口，实验中的时间控制在这里
 */
async function entryExam(swc, options) {
    while(true) {
        await global.swc.timer.update(swc, options);
        await global.swc.nodeContainer.update(swc, options);
        await global.swc.counter.update(swc, options);
        // await sleep(100);
        if(global.swc.timer.end == true) {
            break ;
        }
    }
}

module.exports = async function(swc, options){
     /**
     * 创建日志主目录
     */
    try {
        fs.mkdirSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}`);
    }catch(e) {
        process.exit();
    }


    for(var i=0;i<10;i++) {
        /**
         * 每次进入实验之前都要先初始化
         */
        await init(swc, options);

        /**
         * 实验需要一个主流程入口
         */
        await entryExam(swc, options);
        console.log(`done : ${i}`);
        global.config.examTime ++;
    }

    var out = require('child_process').spawn(`node ${__dirname}/../../unionTest/eas/gnuplotTemp/build.js ${global.config.mainLogVersion}`, {
        shell : true,
        // detached : true, // 使子进程独立于其父进程运行，保持gnuplot的图像可见
    });

}