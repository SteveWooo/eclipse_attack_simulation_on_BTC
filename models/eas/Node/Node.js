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
    // this.newBucket = new swc.models['Node/NewBucket'](swc, {});
    // this.tiredBucket = new swc.models['Node/TiredBucket'](swc, {});
    
    /**
     * 优化算法
     */
    this.newBucket = new swc.models['Node/FixNewBucket'](swc, {});
    this.tiredBucket = new swc.models['Node/FixTiredBucket'](swc, {});

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

        if(connResult == false) {
            return ;
        }
        // 连接成功，加入tired桶里
        that.connections.outBound.push(nodeInfo);

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

        // 检查一下是不是已经连接过了
        let flag = false;
        for(var i=0;i<that.connections.outBound.length;i++) {
            if(that.connections.outBound[i].ip == nodeInfo.ip) {
                flag = true;
                break
            }
        }
        for(var i=0;i<that.connections.inBound.length;i++) {
            if(that.connections.inBound[i].ip == nodeInfo.ip) {
                flag = true;
                break
            }
        }
        // 已经连接过了不需要连接了
        if(flag == true) {
            // swc.log.error(`${that.ip} -- reject conn to ${nodeInfo.ip}`);
            let node = await global.swc.nodeContainer.getNode(_swc, {
                nodeInfo : nodeInfo
            })
            // console.log(global.swc.nodeContainer.nodes[node.type][node.ip].connections);
            return false;
        }
        that.connections.inBound.push(nodeInfo);

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
                    ip : nodeInfo.ip
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
         * victim的初始化阶段，尽可能和别的normal node建立联系，也就是组网过程
         */
        if(that.type == 'victim' || that.type == 'normal') {
            var count = 0;
            for(var i in global.swc.nodeContainer.nodes.normal) {
                if(global.swc.nodeContainer.nodes.normal[i].ip == that.ip) {
                    continue;
                }
                await global.swc.nodeContainer.nodes.normal[i]['msg_addr'](_swc, {
                    nodeInfo : {
                        ip : that.ip
                    }
                })

                /**
                 * 只连接几个节点就够了，不然慢成狗。重要是都得连接受害者节点
                 */
                count ++ ;
                if(count >= 40) {
                    break 
                }
            }

            // new bucket尽量填满
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
        if(status == 'init') {
            // 尽可能连接被害者节点
            if(that.type == 'normal') {
                for(var i in global.swc.nodeContainer.nodes['victim']) {
                    var result = await global.swc.nodeContainer.nodes['victim'][i].connect(_swc, {
                        nodeInfo : {
                            ip : that.ip
                        }
                    })
                }
            }
        }

        await tryOutBoundConnect(_swc, {});
        
    }

    /**
     * 恶意节点行为：
     * 1、不断发送addr_msg给受害节点
     * 2、不断尝试与受害节点进行连接
     */
    async function attackerAction(_swc, _options) {
        for(var i in global.swc.nodeContainer.nodes['victim']) {
            global.swc.nodeContainer.nodes['victim'][i].msg_addr(_swc, {
                nodeInfo : {
                    ip : that.ip
                }
            })

            global.swc.nodeContainer.nodes['victim'][i].connect(_swc, {
                nodeInfo : {
                    ip : that.ip
                }
            })
        }
    }

    /**
     * 随机掉线算法，需要制造一些随机掉线节点，来腾出位置给攻击节点玩
     */
    async function randomOffline(_swc, _options) {
        // 50%掉in和out
        if(Math.round(Math.random()) == 1) {
            let index = Math.floor(Math.random() * that.connections.outBound.length);
            that.connections.outBound.splice(index, 1);
        } else {
            let index = Math.floor(Math.random() * that.connections.inBound.length);
            that.connections.inBound.splice(index, 1);
        }
    }

    /**
     * 全局调用更新的时候调用此函数
     */
    this.update = async function(_swc, _options){
        var now = global.swc.timer.now;
        let status = global.swc.timer.status;

        if(status == 'attack' && that.type == 'attacker') {
            if(now % 5000 == 0) {
                await attackerAction(_swc, _options);
            }
        }
        // 定期发送一次addr
        if(that.type == 'normal' || that.type == 'victim'){
            if(now % 10000 == 0) {
                await sendAddr_normalNode(_swc, _options);
                await connectOther_normalNode(_swc, {});
            }

            /**
             * 定期掉线
             */
            if(now % (11 * 1000) == 0) {
                await randomOffline(_swc, {});
            }
        }
    }

    return this;
}