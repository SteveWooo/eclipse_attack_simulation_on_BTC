/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

const crypto = require('crypto');
let hash = function(str) {
    let result = crypto.createHash('sha512').update(str).digest();
    return result;
}

module.exports = function(swc, options) {
    let that = this;

    // 篮子数量
    this.BUCKET_COUNT = 256;
    this.IP_PER_BUCKET = 64;
    this.GROUP_COUNT = 32;

    this.BUCKET_COUNT = 1;
    this.IP_PER_BUCKET = 8;
    this.GROUP_COUNT = 1;
    this.buckets = [];

    /**
     * 初始化bucket
     */
    for(let i=0;i<that.BUCKET_COUNT;i++) {
        that.buckets[i] = [];
    }

    /**
     * 如果要插入的篮子满了，就要调用这两个个函数来删除一些东西
     * 先删除离谱的节点，再删除最老节点，shinkNew必须删除至少一个节点
     * @param options.bucketPos
     */
    async function shinkTerrible(_swc, _options) {

    }
    async function shinkNew(_swc, _options) {
        // 随机选择4个出来
        let bucketPos = _options.bucketPos;
        let tempNode = [];
        for(var i=0;i<4;i++) {
            
        }
    }

    /**
     * 根据IP选择小篮子
     * @param options.nodeInfo.ip
     */
    async function selectBucket(_swc, _options) {
        // 获取细分组  % that.GROUP_COUNT
        let groupNum = hash(_options.nodeInfo.ip);
        let groupNumTemp = 0;
        for(var i=0;i<groupNum.length;i++){
            groupNumTemp += groupNum[i] % that.GROUP_COUNT;
        }
        groupNum = groupNumTemp % that.GROUP_COUNT;

        // 获取ip前缀
        let prefix = _options.nodeInfo.ip.split('.');
        prefix = [prefix[0], prefix[1]].join('.');

        // 获取具体bucket位置 % that.BUCKET_COUNT
        let bucketPos = hash(prefix, groupNum);
        let bucketPosTemp = 0;
        for(var i=0;i<bucketPos.length;i++){
            bucketPosTemp += bucketPos[i] % that.BUCKET_COUNT;
        }
        bucketPos = bucketPosTemp % that.BUCKET_COUNT;

        return bucketPos;
    }

    /**
     * 往大篮子添加IP的操作
     * @param options.nodeInfo.ip
     */
    this.add = async function(_swc, _options){
        let bucketPos = await selectBucket(_swc, {
            nodeInfo : _options.nodeInfo
        })
        if(that.buckets[bucketPos].length >= that.IP_PER_BUCKET) {
            await shinkTerrible(_swc, _options);
        }

        if(that.buckets[bucketPos].length >= that.IP_PER_BUCKET) {
            console.log('full next step will unlock this function.');
            return ;
            await shinkNew(_swc, _options);
        }

        // 标注时间戳
        _options.nodeInfo.createAt = global.swc.timer.now;
        _options.nodeInfo.updateAt = global.swc.timer.now;
        that.buckets[bucketPos].push(_options.nodeInfo);

        return ;
    }

    /**
     * 进行节点选择连接，这里处理选择的优先级
     * @param options.connections 已经成功连接的列表
     */
    this.select = async function(_swc, _options){
        let connections = _options.connections;

        // 先随机选择吧
        let tempNodes = []; // 有东西的bucket
        for(var i=0;i<that.buckets.length;i++) {
            for(var k=0;k<that.buckets[i].length;k++) {
                // 不要重复连接
                for(var out = 0;out<connections.outBound.length;out++) {
                    if(that.buckets[i][k].ip == connections.outBound[out].ip){
                        continue ;
                    }
                }
                for(var inb = 0;inb<connections.inBound.length;inb++) {
                    if(that.buckets[i][k].ip == connections.inBound[inb].ip){
                        continue ;
                    }
                }

                tempNodes.push(that.buckets[i][k]);
            }
        }

        if(tempNodes.length == 0) {
            return null;
        }

        let nodeInfoIndex = Math.floor(Math.random() * tempNodes.length);
        return tempNodes[nodeInfoIndex];
    }

    /**
     * 检查这个node在不在newBucket，一般要配合tiredBucket的check一起用
     * @param options.nodeInfo
     */
    this.checkNodeExist = async function(_swc, _options){
        let nodeInfo = _options.nodeInfo;
        let flag = false;
        for(var i=0;i<that.buckets.length;i++) {
            for(var k=0;k<that.buckets[i].length;k++) {
                if(nodeInfo.ip == that.buckets[i][k].ip) {
                    flag = true;
                    return flag;
                }
            }
        }
        return flag;
    }

    /**
     * 更新这个节点的时间戳吧
     * @param options.nodeInfo
     */
    this.updateNode = async function(_swc, _options){
        let now = global.swc.timer.now;
        let nodeInfo = _options.nodeInfo;
        let flag = false;
        for(var i=0;i<that.buckets.length;i++) {
            for(var k=0;k<that.buckets[i].length;k++) {
                if(nodeInfo.ip == that.buckets[i][k].ip) {
                    that.buckets[i][k].updateAt = now;
                    return flag;
                }
            }
        }

        return flag;
    }

    /**
     * 从桶中删除节点
     * @param options.nodeInfo.ip 
     */
    this.deleteNode = async function(_swc, _options) {
        var nodeInfo = _options.nodeInfo;
        for(var i=0;i<that.buckets.length;i++) {
            for(var k=0;k<that.buckets[i].length;k++) {
                if(nodeInfo.ip == that.buckets[i][k].ip) {
                    that.buckets[i].splice(k, 1);
                    i--;
                    return true;
                }
            }
        }
        
        return false;
    }

    return this;
}