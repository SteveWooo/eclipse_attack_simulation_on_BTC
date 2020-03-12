/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

 /**
  * 这里主要用来存各种节点对象。用IP地址来做hash key
  */
module.exports = function(swc, options) {
    let that = this;
    /**
     * 3种类型的节点
     */
    this.nodes = {
        victim : {},
        normal : {},
        attacker : {}
    }

    /**
     * 更新调用入口
     */
    this.update = async function(_swc, _options) {
        for(var type in that.nodes) {
            for(var node in that.nodes[type]) {
                await that.nodes[type][node].update(_swc, {});
            }
        }
    }

    /**
     * 根据ip拿具体节点
     * @param options.nodeInfo.ip
     */
    this.getNode = async function(_swc, _options){
        let node = null;
        for(var i in that.nodes){
            if(_options.nodeInfo.ip in that.nodes[i]) {
                node = that.nodes[i][_options.nodeInfo.ip];
                node = {
                    type : i,
                    ip : _options.nodeInfo.ip
                }
                break;
            }
        }
        return node;
    }

    return this;
}