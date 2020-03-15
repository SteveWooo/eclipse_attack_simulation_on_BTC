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
    this.BUCKET_COUNT = 64;
    this.IP_PER_BUCKET = 64;
    this.GROUP_COUNT = 4;

    this.BUCKET_COUNT = 8;
    this.IP_PER_BUCKET = 8;
    this.GROUP_COUNT = 2;
    this.buckets = [];

     /**
     * 初始化bucket
     */
    for(let i=0;i<that.BUCKET_COUNT;i++) {
        that.buckets[i] = [];
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
     * 如果要插入的篮子满了，就要调用这两个个函数来删除一些东西
     * 删除最老节点，ShinkTired必须删除至少一个节点
     */
    async function shinkTerrible(_swc, _options) {

    }
    async function ShinkTired(_swc, _options) {
        // 随机选择4个出来
        let bucketPos = _options.bucketPos;
        let tempNum = [];
        let choosenNum = [];
        for(var i=0;i<that.buckets[bucketPos].length;i++) {
            tempNum.push(i);
        }
        for(var i=0;i<4;i++) {
            let index = Math.floor(Math.random() * tempNum.length);
            choosenNum.push(tempNum[index]);
        }

        // 挑选出最久没更新的
        let minConnect = global.swc.timer.now;
        let minIndex = 0;
        for(var i=0;i<choosenNum.length;i++) {
            if(that.buckets[bucketPos][choosenNum[i]].lastConnected < minConnect) {
                minConnect = that.buckets[bucketPos][choosenNum[i]].lastConnected;
                minIndex = i;
            }
        }
        let shinkIndex = choosenNum[minIndex];
        return that.buckets[bucketPos].splice(shinkIndex, 1)[0];
    }

    /**
     * 往大篮子添加IP的操作
     * @param options.nodeInfo.ip
     */
    this.add = async function(_swc, _options){
        let node = null;
        let bucketPos = await selectBucket(_swc, {
            nodeInfo : _options.nodeInfo
        })
        if(that.buckets[bucketPos].length >= that.IP_PER_BUCKET) {
            await shinkTerrible(_swc, _options);
        }

        if(that.buckets[bucketPos].length >= that.IP_PER_BUCKET) {
            node = await ShinkTired(_swc, {
                bucketPos : bucketPos
            });

        }

        // 标注时间戳
        _options.nodeInfo.createAt = global.swc.timer.now;
        _options.nodeInfo.updateAt = global.swc.timer.now;
        _options.nodeInfo.lastConnected = global.swc.timer.now;
        that.buckets[bucketPos].push(_options.nodeInfo);

        // 返回被踢出去的节点，要加入new桶里
        return node;
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
                let flag = false;
                for(var out = 0;out<connections.outBound.length;out++) {
                    if(that.buckets[i][k].ip == connections.outBound[out].ip){
                        flag = true;
                        break ;
                    }
                }
                for(var inb = 0;inb<connections.inBound.length;inb++) {
                    if(that.buckets[i][k].ip == connections.inBound[inb].ip){
                        flag = true;
                        break ;
                    }
                }
                if(flag == true) {
                    continue ;
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
     * 检查这个node在不在Bucket
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
                    if(_options.updateConnect) {
                        that.buckets[i][k].lastConnected = now;
                    }
                    that.buckets[i][k].updateAt = now;
                    return flag;
                }
            }
        }

        return flag;
    }

    /**
     * 获取桶内节点总数
     */
    this.getCount = function(_swc, _options) {
        let count = 0;

        for(var i=0;i<that.buckets.length;i++) {
            for(var k=0;k<that.buckets[i].length;k++) {
                count ++; 
            }
        }

        return count;
    }

    return this;
}