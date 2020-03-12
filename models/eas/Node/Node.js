/**
 * Author : Create by SteveWooo on 2020/3/11
 * Email  : SteveWoo23@gmail.com
 * Github : https://github.com/stevewooo
 */

module.exports = function(swc, options) {
    let that = this;

    this.MAX_CONNECTION = 125;
    this.OUTBOUND_CONNECTION = 8;

    /**
     * 索引主要用到的IP
     */
    this.ip = options.ip;
    this.type = options.type;

    /**
     * 创建两个篮子
     */
    this.newBucket = new swc.models['Node/NewBucket'](swc, {});
    this.tiredBucket = new swc.models['Node/TiredBucket'](swc, {});

    /**
     * 连接池
     */
    this.connections = {
        outBound : [],
        inBound : []
    }

    async function cleanConnectPool(_swc, _options) {
        that.connections.outBound = [];
        that.connections.inBound = [];
    }

    /**
     * 选择节点进行连接
     */
    let tryOutBoundConnect = async function(_swc, _options) {
        if(that.connections.outBound.length >= that.OUTBOUND_CONNECTION) {
            return ;
        }

        // 50% 概率选择新旧篮子
        let nodeInfo = {};
        if(Math.round(Math.random()) == 1) {
            nodeInfo = await that.newBucket.select(_swc, {
                connections : that.connections
            });
        } else {
            nodeInfo = await that.tiredBucket.select(_swc, {
                connections : that.connections
            });
        }

        if(nodeInfo == null){
            return ;
        }
        let nodeData = await global.swc.nodeContainer.getNode(_swc, {
            nodeInfo : nodeInfo
        })
        let node = global.swc.nodeContainer.nodes[nodeData.type][nodeData.ip];
        var connResult = await node.connect(_swc, {
            nodeInfo : {
                ip : that.ip
            }
        })

        // 连接成功，加入tired桶里
        if(connResult == false) {
            return ;
        }

        // 如果节点在new桶 删除
        if(await that.newBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : nodeData.ip
            }
        })) {
            var result = await that.newBucket.deleteNode(_swc, {
                nodeInfo : {
                    ip : nodeData.ip
                }
            })
        }

        // 加入前先检查一它在不在里面
        if(await that.tiredBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : nodeData.ip
            }
        })) {
            await that.tiredBucket.updateNode(_swc, {
                nodeInfo : {
                    ip : nodeData.ip
                }
            })
            return ;
        }
        var addBucketResult = await that.tiredBucket.add(_swc, {
            nodeInfo : {
                ip : nodeData.ip
            }
        })
        
        // 如果有节点从tired中被丢出来，就把它加入new桶
        if(addBucketResult == null) {
            return ;
        }
        // 加入之前也要先检查一下
        if(await that.newBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : addBucketResult.ip
            }
        })) {
            await that.newBucket.updateNode(_swc, {
                nodeInfo : {
                    ip : addBucketResult.ip
                }
            })
            return ;
        }
        await that.newBucket.add(_swc, {
            nodeInfo : {
                ip : addBucketResult.ip
            }
        })
    }

    /**
     * 被动连接
     * @param options.nodeInfo 发起连接的节点信息
     */
    this.connect = async function(_swc, _options) {
        if(that.connections.inBound.length >= that.MAX_CONNECTION - that.OUTBOUND_CONNECTION) {
            // TODO : 满连接之后怎么处理？
            return false;
        }
        var nodeInfo = _options.nodeInfo;

        /**
         * 连接成功的话，就把这个节点从new桶删除，加入tired桶
         */

         // 如果节点在new桶 删除
        if(await that.newBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : nodeInfo.ip
            }
        })) {
            await that.newBucket.deleteNode(_swc, {
                nodeInfo : {
                    ip : nodeInfo.ip
                }
            })
        }

        // 加入前先检查一它在不在tired里面，如果已经在了，就不用做别的操作了
        if(await that.tiredBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : nodeInfo.ip
            }
        })) {
            await that.tiredBucket.updateNode(_swc, {
                nodeInfo : {
                    ip : nodeData.ip
                }
            })
            return ;
        }
        var addBucketResult = await that.tiredBucket.add(_swc, {
            nodeInfo : {
                ip : nodeInfo.ip
            }
        })

        // 如果有节点从tired中被丢出来，就把它加入new桶
        if(addBucketResult == null) {
            return ;
        }
        // 加入之前也要先检查一下
        if(await that.newBucket.checkNodeExist(_swc, {
            nodeInfo : {
                ip : addBucketResult.ip
            }
        })) {
            await that.newBucket.updateNode(_swc, {
                nodeInfo : {
                    ip : addBucketResult.ip
                }
            })
            return ;
        }
        await that.newBucket.add(_swc, {
            nodeInfo : {
                ip : addBucketResult.ip
            }
        })

        return true;
    }

    /**
     * 节点初始化调用，受害节点初始化的时候要跟大量normal节点进行addr通信
     */
    this.init = async function(_swc, _options) {

    }

    /**
     * 被动触发的函数，用msg_开头
     * @param options.nodeInfo 节点信息
     * @param options.otherNodeInfo 其他节点的信息
     */
    this.msg_addr = async function(_swc, _options){
        let nodeInfo = _options.nodeInfo;
        let newFlag = false, tiredFlag = false
        if(await that.newBucket.checkNodeExist(_swc, {
            nodeInfo : _options.nodeInfo
        })) {
            newFlag = true;
            await that.newBucket.updateNode(_swc, {
                nodeInfo : _options.nodeInfo
            })
        }

        if(await that.tiredBucket.checkNodeExist(_swc, {
            nodeInfo : _options.nodeInfo
        })) {
            tiredFlag = true;
            await that.tiredBucket.updateNode(_swc, {
                nodeInfo : _options.nodeInfo
            })
        }

        if(!newFlag && !tiredFlag) {
            await that.newBucket.add(_swc, {
                nodeInfo : _options.nodeInfo
            })
        }

    }

    /**
     * 主动发送addr请求
     */
    async function sendAddr_normalNode(_swc, _options) {
        let status = global.swc.timer.status;
        /**
         * victim的初始化阶段，尽可能和别的normal node建立联系
         */
        if(status == 'init' && (that.type == 'victim' || that.type == 'normal')) {
            for(var i in global.swc.nodeContainer.nodes.normal) {
                if(global.swc.nodeContainer.nodes.normal[i].ip == that.ip) {
                    continue;
                }
                await global.swc.nodeContainer.nodes.normal[i]['msg_addr'](_swc, {
                    nodeInfo : {
                        ip : that.ip
                    }
                })
            }
            for(var i in global.swc.nodeContainer.nodes.victim) {
                if(global.swc.nodeContainer.nodes.victim[i].ip == that.ip) {
                    continue;
                }
                await global.swc.nodeContainer.nodes.victim[i]['msg_addr'](_swc, {
                    nodeInfo : {
                        ip : that.ip
                    }
                })
            }
        }
    }

    /**
     * 每个普通节点保持监控自己的连接状态，尽可能保持8个outbound连接
     */
    async function connectOther_normalNode(_swc, _options) {
        let status = global.swc.timer.status;
        await tryOutBoundConnect(_swc, {});
    }

    /**
     * 全局调用更新的时候调用此函数
     */
    this.update = async function(_swc, _options){
        var now = global.swc.timer.now;
        let status = global.swc.timer.status;
        // 每5秒发送一次addr
        if(that.type == 'normal' || that.type == 'victim'){
            if(now % 1000 == 0) {
                await sendAddr_normalNode(_swc, _options);
                await connectOther_normalNode(_swc, {});
            }
        }
        if(that.type == 'victim') {
            console.log(`ip : ${that.ip} -> newBucket`);
            console.log(that.newBucket.buckets);
            console.log(`ip : ${that.ip} -> tiredBucket`);
            console.log(that.tiredBucket.buckets);
            console.log('\n')
        }
    }

    return this;
}