// 角色基础信息excel to json转化
let common = require("./../common.js");

function Parse(json, setup, client) {
	json.map(function (record) {
		common.strToStrArray(record, "iconRes", "itemRes", "nameRes");
		common.strToNumArray(record, "hpBarOffset", "statusListOffset", "previewOffset");
		//console.log(record);
	});

	return json;
}

exports.Parse = Parse;
