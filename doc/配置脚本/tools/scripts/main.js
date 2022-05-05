let xlsx = require("xlsx");
let common = require("./common.js");
const prompt = require("prompt-sync")({ sigint: true });
const { performance } = require("perf_hooks");

let msg = "1. 全部脚本生成json(回车)\r\n2. 只生成客户端json\r\n3. 只生成服务器json\r\n4. 单独脚本生成json\r\n";
console.log(msg);

const selection = prompt();
let selectionNum = Number(selection);
let excelsDir = "./../";

// 客户端脚本输出路径
let outClientDir = "./../../../Code/Client/JHProject/Assets/Configs/";
// 服务器脚本输出路径
let ourServerDir = "./../../../Code/server/JHApi/src/FurionApi.Web.Entry/Configs/";

// test only
outClientDir = "./../output/client/";
ourServerDir = "./../output/server/";

let jsonsFileSetup = {
	"ActorConfig.json": {
		// 生成的json名
		from: ["角色基础信息.xlsx"], // 源excel脚本, 可以是多个excel脚本合成一个json
		parser: ["actorConfigParser.js"], // excel脚本分析转换代码
		isClient: true, // 是否生成客户端版本
		isServer: false,
	}, // 是否生成服务器版本
};

function GenerateJson(jsonFilename, client) {
	var startTime = performance.now();
	let jsonSetup = jsonsFileSetup[jsonFilename];

	if (client == true && jsonSetup.isClient == false) {
		return;
	}
	if (client == false && jsonSetup.isServer == false) {
		return;
	}

	let from = jsonSetup.from;
	let parser = jsonSetup.parser;
	let jsonObjs = [];
	for (let i = 0; i < from.length; ++i) {
		let excelFilename = from[i];

		let parserFilename = parser ? parser[i] : undefined;
		let wb = xlsx.readFile(excelsDir + excelFilename);
		let jsonObj = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { range: 1 });
		if (parserFilename && common.fileExists("./scripts/parsers/" + parserFilename)) {
			let parser = require("./parsers/" + parserFilename);
			if (parser && parser.Parse) {
				jsonObj = parser.Parse(jsonObj, jsonSetup, client);
				jsonObjs.push(jsonObj);
			}
		} else {
			jsonObjs.push(jsonObj);
		}
	}
	let combinerFilename = jsonSetup.combiner;

	let finalJsonObj = null;
	if (from.length > 1) {
		if (combinerFilename == undefined) {
			console.error(jsonFilename + "生成失败， 缺少合并代码");
			return;
		}

		if (common.fileExists("./scripts/combiners/" + combinerFilename)) {
			let combiner = require("./combiners/" + combinerFilename);
			if (combiner && combiner.Combine) {
				finalJsonObj = combiner.Combine(jsonObjs, jsonSetup, client);
			}
		}
	} else {
		finalJsonObj = jsonObjs[0];
	}

	var jsonStr = JSON.stringify(finalJsonObj, undefined, 2);
	if (client == true) {
		common.writeFileSync(outClientDir + jsonFilename, jsonStr);
	} else {
		common.writeFileSync(ourServerDir + jsonFilename, jsonStr);
	}

	var endTime = performance.now();
	//console.log("生成 [" + jsonFilename + "] 耗时: " + Math.floor(endTime - startTime) + "豪秒");
}

if (selectionNum == 1) {
	console.log("正在为所有脚本生成json");

	console.log("正在生成客户端json");
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		GenerateJson(jsonFilename, true);
	});
	console.log("正在生成服务器json");
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		GenerateJson(jsonFilename, false);
	});
} else if (selectionNum == 2) {
	console.log("正在生成客户端json");

	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		let jsonSetup = jsonsFileSetup[jsonFilename];
		if (jsonSetup.isClient == true) {
			GenerateJson(jsonFilename, true);
		}
	});
} else if (selectionNum == 3) {
	console.log("正在生成服务器json");
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		let jsonSetup = jsonsFileSetup[jsonFilename];
		if (jsonSetup.isServer == true) {
			GenerateJson(jsonFilename, false);
		}
	});
} else if (selectionNum == 4) {
	console.log("选择生成哪个脚本");
	let indexToJson = [];
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		indexToJson.push(jsonFilename);

		console.log(indexToJson.length + ". " + jsonFilename);
	});

	const selectionSub = prompt();
	let selectionSubNum = Number(selectionSub) - 1;
	let filename = indexToJson[selectionSubNum];
	if (filename != undefined) {
		GenerateJson(filename, true);
		GenerateJson(filename, false);
	}
} else {
	console.log("正在为所有脚本生成json");

	console.log("----------------开始生成客户端json----------------");
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		GenerateJson(jsonFilename, true);
	});
	console.log("----------------完成生成客户端json----------------");

	console.log("----------------开始生成服务器json----------------");
	Object.keys(jsonsFileSetup).forEach((jsonFilename) => {
		GenerateJson(jsonFilename, false);
	});
	console.log("----------------完成生成服务器json----------------");
}
