/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

/**
 * 全局时间控制的对象。主要做实验时间戳的控制，以及控制更新时间事件。
 */
module.exports = function(swc, options) {
    let that = this;
    this.now = 0; // 全局时间
    this.subLogVersion = 0; // 子日志
    this.end = false; // 控制程序跳出
    this.TOTAL_TIME = 4 * 60 * 60 * 1000; // 总共实验观察时间

    /**
     * 控制全局事件状态；init attack
     */
    this.status = "init"; 

    /**
     * 更新时间的地方。
     */
    this.update = async function(_swc, _options) {
        that.now += 1000;
        // 只观察一个钟
        if(that.now === that.TOTAL_TIME) {
            global.swc.timer.end = true
        }

        if(that.now === 16 * 1000) {
            global.swc.timer.status = 'normal';
        }

        // 一段时间后后发动攻击
        if(that.now === 20 * 60 * 1000) {
            global.swc.timer.status = 'attack';
        }
        // console.log(that.now)
        // 定期输出一下时间
        if(that.now % (5 * 60 * 1000) == 0) {
            console.log(`Exam NO.${global.config.examTime} - ${that.now} / ${that.TOTAL_TIME}`)
        }
    }

    return this;
}