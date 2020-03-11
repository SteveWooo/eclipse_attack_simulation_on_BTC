/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

async function sleep(time) {
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, time)
    })
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
     * 创建节点
     */
    var ipList = ['11.22.33.44', '22.33.44.55'];
    for(var i=0;i<ipList.length;i++) {
        global.swc.nodeContainer.normal[ipList[i]] = new swc.models.Node(swc, {
            ip : ipList[i]
        });
    }
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

}

module.exports = async function(swc, options){
    /**
     * 每次进入实验之前都要先初始化
     */
    await init(swc, options);

    /**
     * 实验需要一个主流程入口
     */
    await entryExam(swc, options);
}