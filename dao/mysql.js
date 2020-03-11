
const Sequelize = require("sequelize");
exports.defineModel = async function defineModel(swc){
	swc.dao.models.admins = swc.dao.seq.define("admins", {
		user_id : {type : Sequelize.STRING(40)}, //唯一ID
		nick_name : {type : Sequelize.TEXT}, //昵称
		
		name : {type : Sequelize.STRING(100)},
		password : {type : Sequelize.STRING(32)},

		create_by : {type : Sequelize.STRING(40)},
		update_by : {type : Sequelize.STRING(40)},
		create_at : {type : Sequelize.STRING(13)},
		update_at : {type : Sequelize.STRING(13)},
	})
	return swc;
}

exports.defineIndex = async function defineIndex(swc){
	// swc.dao.models.demos.belongsTo(swc.dao.models.admins, {
	// 	foreignKey : 'create_by', //多的一个数据实体
	// 	targetKey : 'admin_id', //少的一个数据实体
	// 	as : 'admin'
	// })

	swc.log.info('载入:数据索引');
	return swc;
}
