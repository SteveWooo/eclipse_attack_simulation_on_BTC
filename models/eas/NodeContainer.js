/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

 /**
  * 这里主要用来存各种节点对象。用IP地址来做hash key
  */
module.exports = function(swc, options) {
    /**
     * 3种类型的节点
     */
    this.victim = {};
    this.normal = {};
    this.bad = {};

    return this;
}