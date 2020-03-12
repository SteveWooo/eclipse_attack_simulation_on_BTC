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

    /**
     * 控制全局事件状态；init attack
     */
    this.status = "init"; 

    /**
     * 更新时间的地方。
     */
    this.update = async function(_swc, _options) {
        that.now += 1000;
    }

    return this;
}