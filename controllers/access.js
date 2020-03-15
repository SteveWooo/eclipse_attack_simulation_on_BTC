module.exports = async (swc, options)=>{
	swc = await swc.registerService(swc, {
        serviceName : 'eas',
        path : `${__dirname}/../services/eas/service`
	})
	
	swc = await swc.registerModel(swc, {
		modelName : 'Counter',
		path : `${__dirname}/../models/eas/Counter`
	})
	swc = await swc.registerModel(swc, {
		modelName : 'NodeContainer',
		path : `${__dirname}/../models/eas/NodeContainer`
	})
	swc = await swc.registerModel(swc, {
		modelName : 'Timer',
		path : `${__dirname}/../models/eas/Timer`
	})
	swc = await swc.registerModel(swc, {
		modelName : 'Node',
		path : `${__dirname}/../models/eas/Node/Node`
	})

	swc = await swc.registerModel(swc, {
		modelName : 'Node/NewBucket',
		path : `${__dirname}/../models/eas/Node/NewBucket`
	})
	swc = await swc.registerModel(swc, {
		modelName : 'Node/TiredBucket',
		path : `${__dirname}/../models/eas/Node/TiredBucket`
	})	

	swc = await swc.registerModel(swc, {
		modelName : 'Node/FixNewBucket',
		path : `${__dirname}/../models/eas/Node/FixNewBucket`
	})
	swc = await swc.registerModel(swc, {
		modelName : 'Node/FixTiredBucket',
		path : `${__dirname}/../models/eas/Node/FixTiredBucket`
	})	

	// 记录全局常量为主
	global.config = {
		mainLogVersion : +new Date(),
		examTime : 1
	}

	/**
	 * 流程入口
	 */
	await swc.services.eas.startup(swc, options);

	return swc;
}
	