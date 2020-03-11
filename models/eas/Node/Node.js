/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

module.exports = function(swc, options) {
    /**
     * 全局调用更新的时候调用此函数
     */
    this.update = async function(_swc, _options){

    }

    /**
     * 索引主要用到的IP
     */
    this.ip = options.ip;

    /**
     * 创建两个篮子
     */
    this.newBucket = new swc.models['Node/NewBucket'](swc, {});
    this.tiredBucket = new swc.models['Node/tiredBucket'](swc, {});

    return this;
}