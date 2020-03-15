/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

const fs = require('fs');
module.exports = function(swc, options) {
    let that = this;

    /**
     * 把数据规范写入日志中
     */
    async function writeLog(_swc, _options) {
        let data = _options.data;
        let now = global.swc.timer.now;
        now = now / 1000;
        // return ;
        let nb = data.newBucketCount == 0 ? 0 : data.newBucketAttackerCount / data.newBucketCount;
        let tb = data.tiredBucketCount == 0 ? 0 : data.tiredBucketAttackerCount / data.tiredBucketCount;
        let oc = data.outBoundCount == 0 ? 0 : data.outBoundAttackerCount / data.outBoundCount;
        let ic = data.inBoundCount == 0 ? 0 : data.inBoundAttackerCount / data.inBoundCount
        fs.appendFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-nb`, `${now} ${nb}\n`);
        fs.appendFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-tb`, `${now} ${tb}\n`);
        fs.appendFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-oc`, `${now} ${oc}\n`);
        fs.appendFileSync(`${__dirname}/../../unionTest/eas/logs/${global.config.mainLogVersion}/${global.swc.timer.subLogVersion}/victim-ic`, `${now} ${ic}\n`);
    }

    /**
     * @param bucket 被测量的IP
     */
    function checkAttackerInBucket(_swc, _options) {
        let count = 0;
        for(var i=0;i<_options.bucket.length;i++) {
            for(var k=0;k<_options.bucket[i].length;k++) {
                if(_options.bucket[i][k] == undefined) {
                    continue;
                }
                if(_options.bucket[i][k].ip in global.swc.nodeContainer.nodes['attacker']) {
                    count ++ ;
                }
            }
            
        }
        
        return count;
    }

    /**
     * @param connection 被测量的IP
     */
    function checkAttackerInConnection(_swc, _options) {
        let count = 0;
        for(var i=0;i<_options.connection.length;i++) {
            if(_options.connection[i].ip in global.swc.nodeContainer.nodes['attacker']) {
                count ++ ;
            }
        }
        
        return count;
    }

    async function checkNode(_swc, _options) {
        for(var i in global.swc.nodeContainer.nodes['victim']) {
            let node = global.swc.nodeContainer.nodes['victim'][i];
            let data = {
                newBucketCount : node.newBucket.getCount(),
                newBucketAttackerCount : checkAttackerInBucket(_swc, {
                    bucket : node.newBucket.buckets
                }),
                tiredBucketCount : node.tiredBucket.getCount(),
                tiredBucketAttackerCount : checkAttackerInBucket(_swc, {
                    bucket : node.tiredBucket.buckets
                }),

                outBoundCount : node.connections.outBound.length || 0,
                outBoundAttackerCount : checkAttackerInConnection(_swc, {
                    connection : node.connections.outBound
                }),
                inBoundCount : node.connections.inBound.length || 0,
                inBoundAttackerCount : checkAttackerInConnection(_swc, {
                    connection : node.connections.inBound
                })
            }
            // console.log(data);
            await writeLog(_swc, {
                data : data,
                ip : node.ip
            })
        }
    }

    /**
     * 更新入口，本对象主要用于检查全局状况，输出数据
     */
    this.update = async function(_swc, _options) {
        // for(var i in global.swc.nodeContainer.nodes['victim']) {
        //     let node = global.swc.nodeContainer.nodes['victim'][i];
        //     console.log(`outBound Conn : ${node.connections.outBound.length}`);
        //     console.log(`inBound  Conn : ${node.connections.inBound.length}`);

        //     let tirBucketData = [];
        //     for(var i=0;i<node.tiredBucket.buckets.length;i++) {
        //         if(node.tiredBucket.buckets[i].length > 0) {
        //             tirBucketData.push(`${i}'s length : ${node.tiredBucket.buckets[i].length}`);
        //         }
        //     }
        //     console.log(`tiredBucket:\n ${tirBucketData.join('; ')}`);

        //     let newBucketData = [];
        //     for(var i=0;i<node.newBucket.buckets.length;i++) {
        //         if(node.newBucket.buckets[i].length > 0) {
        //             newBucketData.push(`${i}'s length : ${node.newBucket.buckets[i].length}`);
        //         }
        //     }
        //     console.log(`newBucket:\n ${newBucketData.join('; ')}`);
        // }
        let now = global.swc.timer.now;
        // 一段时间写一次就行了
        if(now % (5 * 1000) == 0) {
            await checkNode(_swc, _options);
        }
    }

    return this;
}