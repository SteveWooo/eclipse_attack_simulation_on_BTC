/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

/**
 * 全局时间控制的对象。主要做实验时间戳的控制，以及控制更新时间事件。
 */
module.exports = function(swc, options) {
    this.time = 0; // 全局时间

    /**
     * 全局更新调用入口
     */
    this.update = async function(_swc, _options) {

    }

    return this;
}