// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as axios from 'axios';
// 引入 TreeViewProvider 的类
import { ITEM_ICON_MAP, TreeItemNode, TreeViewProvider,addSlfProj,addSlfFile ,addDarwinFold, addDarwinFiles} from './TreeViewProvider';
import {getConvertorDataPageV2, getConvertorModelPageV2,getConvertorPageV2,getANNSNNConvertPage,getSNNSimuPage,getSNNModelPage, getPreprocessPage,getPreprocessVisPage} from "./get_convertor_page_v2";
import {getSegDataVisPage, getSegSimulatePage, getANNSNNConvertSegPage} from "./get_seg_pages";
import {getSpeechClsDataPage, getANNSNNConvertSpeechPage, getSNNSimuSpeechPage} from "./get_speech_pages";
import {getFatigueDataVisPage, getANNSNNConvertFatiguePage, getSNNSimuFatiguePage} from "./get_fatigue_pages";
import {ChildProcess, exec, execSync, spawn, spawnSync} from "child_process";
const decode = require('audio-decode');
var encoding = require('encoding');
const iconv = require('iconv-lite');

let PYTHON_INTERPRETER = 'python ';
let NEWLINE = '\r\n';
if(process.platform === 'linux'){
	PYTHON_INTERPRETER = 'python3 ';
	NEWLINE = '\n';
}


// 点击darwinlang json 文件单独显示SNN结构的界面
function darlangWebContent() {
    return `<!DOCTYPE html>
	<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>

    <body>
        <div id="draw_region" style="width: 100vw;height: 100vh;"></div>
        <script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts-en.min.js"></script>
        <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script>
            function net_structure_show(elementId, map_file_url) {
                // 基于准备好的dom，初始化echarts实例
                var myChart = echarts.init(document.getElementById(elementId)); //初始化
                myChart.showLoading();
                $.get(map_file_url, function (map_file) {
                    var node_data = map_file.data;
                    var node_link = map_file.links;
                    var node_class = map_file.layers;
                    var ratios = map_file.ratio;
                    var num = map_file.nums;

                    var categories = [];
                    for (var i = 0; i < node_class.length; i++) {
                        categories[i] = {
                            name: node_class[i],
                        };
                    }
                    // 指定图表的配置项和数据
                    let option = {
                        title: {
                            show: true,
                            // text: 'Network Structure Diagram',
                            text: 'ratio     1 : ' + ratios,
                            textStyle:{
                                fontSize:10
                            },
                            bottom: '3%',
                            left: 'center'
                        },
                        backgroundColor: '#FFFFFF',//背景色
                        tooltip: {}, //提示信息
                        legend: {   //图例组件
                            top: "0%",   //距离顶部5%
                            // bottom: "88%",
                            // left: "5%",
                            data: node_class,
                            formatter: function (name) {
                                var neuron_num;
                                for (var i = 0; i < node_class.length; i++) {
                                    if (node_class[i] === name) {
                                        neuron_num = num[i];
                                        break;
                                    }
                                }
                                // var arr = [
                                //     name,
                                //     '(' + neuron_num + ')'
                                // ];
                                var arr = [
                                    '{a|' + name + '}',
                                    '{b|(' + neuron_num + ')}'
                                ];
                                return arr.join('\\n');
                            },
                            textStyle: {
                                rich: {
                                    a: {
                                        fontSize: 14,
                                        verticalAlign: 'top',
                                        align: 'center',
                                        padding: [0, 0, 20, 0]
                                    },
                                    b: {
                                        fontSize: 8,
                                        align: 'center',
                                        padding: [0, 10, 0, 0],
                                        lineHeight: 25
                                    }
                                }
                            }
                        },
                        animationDuration: 1500,
                        animationEasingUpdate: "quinticInOut",
                        series: [ //系列列表
                            {

                                name: "Les Miserables",  //系列名称
                                type: "graph",   //系列图表类型  ——  关系图
                                // layout: "circular",
                                // top: "15%",
                                // bottom: "8%",
                                symbolSize: 5,  //图元的大小
                                data: node_data,
                                links: node_link,
                                roam: true,
                                // focusNodeAdjacency: true,
                                categories: categories,
                            },
                        ],
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    myChart.hideLoading();
                    myChart.setOption(option); //使用json
                });
            }

        </script>

        <script>
            window.addEventListener('message', event => {
                const message = event.data; 
                net_structure_show("draw_region", message.resultUri);
            });
            
        </script>
    </body>
            
    </html>`;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 实现树视图的初始化
	let treeview = TreeViewProvider.initTreeViewItem("treeView-item");
	let treeviewConvertor = TreeViewProvider.initTreeViewItem("item_convertor");
	let treeViewSimulator = TreeViewProvider.initTreeViewItem("item_simulator");
	let treeViewConvertDarLang = TreeViewProvider.initTreeViewItem("item_darwinLang_convertor");
	let treeViewItemsImportFiles = TreeViewProvider.initTreeViewItem("act_import_files-item");
	let treeViewProcess = TreeViewProvider.initTreeViewItem("item_preprocess");
	// let treeViewSNNModelView = TreeViewProvider.initTreeViewItem("item_snn_model_view");

	let treeviewHome = vscode.window.createTreeView("treeView-item", {treeDataProvider: treeview});
	let treeViewCvtor = vscode.window.createTreeView("item_convertor", {treeDataProvider: treeviewConvertor});
	let treeViewSim = vscode.window.createTreeView("item_simulator", {treeDataProvider:treeViewSimulator});
	let treeViewCvtDarLang = vscode.window.createTreeView("item_darwinLang_convertor", {treeDataProvider:treeViewConvertDarLang});
	let treeViewImportFiles = vscode.window.createTreeView("act_import_files-item", {treeDataProvider: treeViewItemsImportFiles});
	let treeViewPreprocessView = vscode.window.createTreeView("item_preprocess", {treeDataProvider: treeViewProcess});
	// let treeViewSNNMD = vscode.window.createTreeView("item_snn_model_view", {treeDataProvider: treeViewSNNModelView});

	let currPanelDisposed:boolean = false;
	let tmpDarlangWebview: vscode.WebviewPanel|undefined = undefined;

	let isCompiling:boolean = false;
	let isConversionExeced = false;

	let compileSubProc: undefined|ChildProcess = undefined;
	let binaryCompilingInterval:NodeJS.Timeout|undefined = undefined;

	function isAllOtherTreeViewInvisible(){
		return !treeviewHome.visible && !treeViewCvtor.visible && !treeViewSim.visible && !treeViewCvtDarLang.visible && !treeViewPreprocessView.visible;
	}


	if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target"))){
		fs.mkdirSync(path.join(__dirname, "darwin2sim", "target"));
	}
	if(!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out"))){
		fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out"));
		if(!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", "br2_models"))){
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", "br2_models"));
		}
	}


	treeViewCvtor.onDidChangeVisibility((evt)=>{
		currentPanel?.reveal();
		if(evt.visible){
			console.log("activity bar 转换图标被点击, treeview convertor 可见...");
			if(currentPanel && currentPanel.title === "ANN-SNN转换"){
				currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
				treeviewHome.reveal(treeview.data[0]);
			}
		}else{
			setTimeout(()=>{
				if(isAllOtherTreeViewInvisible()){
					if(currentPanel && currentPanel.title === "ANN-SNN转换"){
						currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
						treeviewHome.reveal(treeview.data[0]);
					}
				}
				treeviewHome.reveal(treeview.data[0]);
			}, 100);
		}
	});

	treeViewImportFiles.onDidChangeVisibility((evt)=>{
		currentPanel?.reveal();
		if (evt.visible) {
			console.log("treeviewImportFiles activity icon 点击, visibility 可见....");
			currentPanel!.webview.postMessage(JSON.stringify({"import_files": "yes"}));
			treeviewHome.reveal(treeview.data[0]);
		} else {
			setTimeout(() => {
				if (isAllOtherTreeViewInvisible()) {
					currentPanel!.webview.postMessage(JSON.stringify({"import_files": "yes"}));
				}
				treeviewHome.reveal(treeview.data[0]);
			}, 100);
		}
	});
	
	treeViewSim.onDidChangeVisibility((evt)=>{
		panelSNNModelVis?.reveal();
		if(evt.visible){
			console.log("模拟页面可用！");
			// 点击仿真器快捷方式，启动仿真
			treeviewHome.reveal(treeview.data[0]);
			vscode.commands.executeCommand("item_simulator.start_simulate");
		}else{
			setTimeout(()=>{
				if(isAllOtherTreeViewInvisible()){
					treeviewHome.reveal(treeview.data[0]);
					// 点击仿真器快捷方式，启动仿真
					vscode.commands.executeCommand("item_simulator.start_simulate");
					console.log("模拟页面隐藏...");
				}else{
					return;
				}
			},100);
		}
	});

	// treeViewSNNMD.onDidChangeVisibility((evt)=>{
	// 	if(evt.visible){
	// 		console.log("SNN模型页面可用！");
	// 		treeviewHome.reveal(treeview.data[0]);
	// 		vscode.commands.executeCommand("snn_model_ac.show_snn_model");
	// 	}else{
	// 		setTimeout(()=>{
	// 			if(isAllOtherTreeViewInvisible()){
	// 				// treeViewSNNMD.reveal(treeViewSNNModelView.data[0]);
	// 				treeviewHome.reveal(treeview.data[0]);
	// 				vscode.commands.executeCommand("snn_model_ac.show_snn_model");
	// 			}else{
	// 				return;
	// 			}
	// 		},100);
	// 	}
	// });

	treeViewCvtDarLang.onDidChangeVisibility((evt)=>{
		if(evt.visible){
			console.log("转换darwinlang页面可用!");
			//启动转换生成darwinlang
			treeviewHome.reveal(treeview.data[0]);
			vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
		}else{
			setTimeout(()=>{
				if(isAllOtherTreeViewInvisible()){
					treeviewHome.reveal(treeview.data[0]);
					//启动转换生成darwinlang
					vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
				}
			},100);
		}
	});

	treeViewPreprocessView.onDidChangeVisibility((evt)=>{
		if (evt.visible) {
			console.log("预处理界面！");
			treeviewHome.reveal(treeview.data[0]);
			vscode.commands.executeCommand("item_preprocess.open");
		} else {
			setTimeout(() => {
				if (isAllOtherTreeViewInvisible()) {
					treeviewHome.reveal(treeview.data[0]);
					vscode.commands.executeCommand("item_preprocess.open");
				}
			}, 100);
		}
	});

	let inMemTreeViewStruct:Array<TreeItemNode>=new Array();
	// treeViewBinConvertDarLang.data = inMemTreeViewStruct;
	let X_NORM_DATA_PATH:string|undefined = undefined;
	let X_COLOR_DATA_PATH:string|undefined = undefined; // rgb colored image data, for semantic segmentation task
	let X_ORIGIN_COLOR_DATA_PATH:string| undefined = undefined; // rgb origin un-segmented image or original audio seq for speech classification
	let X_TEST_DATA_PATH:string|undefined = undefined;
	let Y_TEST_DATA_PATH:string|undefined = undefined;
	let ANN_MODEL_FILE_PATH:string|undefined = undefined;

	let SNN_VTH:string = "1";

	let DARWIN_LANG_FILE_PATHS:Array<String> = new Array();
	let DARWIN_LANG_BIN_PATHS:Array<String> = new Array();

	let CONVERT_SCRIPT_PARAMS:string|undefined = undefined;

	let LOG_OUTPUT_CHANNEL:vscode.OutputChannel | undefined = undefined;

	let panelDataVis:vscode.WebviewPanel|undefined = undefined;
	let panelAnnModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNVisWeb:vscode.WebviewPanel|undefined = undefined;
	let panelPreprocess:vscode.WebviewPanel|undefined = undefined;
	let panelPreprocessVis:vscode.WebviewPanel|undefined = undefined;

	let sampleImgsDir = path.join(__dirname, "..", "src", "resources", "script_res");
	let snnInfoFileDir = path.join(__dirname, "inner_scripts");
	let SNAP_SHOT_FNAME = "proj_snap_shot.pkl";
	let snapshotScript = path.join(__dirname, "darwin2sim", "proj_snapshot.py");
	let snapshotApplyScript = path.join(__dirname, "darwin2sim", "proj_snapshot_apply.py");

	let PROJ_DESC_INFO = {
		"project_name":"",
		"project_type":"",
		"python_type":"",
		"ann_lib_type":""
	};
	let PROJ_SAVE_PATH:string|undefined = undefined;

	// 删除treeview item
	function rmTreeViewFileItemByLabelName(root: TreeItemNode, targetLabelName:string){
		if(root === undefined || root.children === undefined || root.children.length === 0){
			return;
		}
		for(let i=0;i<root.children.length;++i){
			if(root.children[i].label === targetLabelName){
				root.children.splice(i,1);
				return;
			}else{
				rmTreeViewFileItemByLabelName(root.children[i], targetLabelName);
			}
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand("treeView-item.rm-item", (item: TreeItemNode)=>{
		console.log("当前删除的treeview item 标签名称："+item.label);
		rmTreeViewFileItemByLabelName(inMemTreeViewStruct[0], item.label);
		treeview.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand("treeView.edit_file", (treeItem: TreeItemNode)=>{
		// 编辑darwinlang
		let fileTarget:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"darlang_out",treeItem.label));
		vscode.workspace.openTextDocument(fileTarget).then((doc:vscode.TextDocument)=>{
			vscode.window.showTextDocument(doc, 1,false);
		}, (err)=>{
			console.log(err);
		});
	}));
    
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
		// vscode.window.showInformationMessage(label);
		console.log("label is :["+label+"]");
		if(label.search("snn_digit_darlang") !== -1){
			if (tmpDarlangWebview) {
				return;
			}
			// 执行 darwinlang map 生成脚本
			tmpDarlangWebview = vscode.window.createWebviewPanel("darwin lang", label,vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			tmpDarlangWebview.webview.html = darlangWebContent();
			tmpDarlangWebview.title = label;
			let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out" , path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
			let commandStr: string = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
			exec(commandStr, (err, stdout, stderr)=>{
				tmpDarlangWebview!.reveal();
				if(err){
					console.log("执行 load_grph.py 错误："+err);
				}else{
					let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
					let fileSrc = tmpDarlangWebview!.webview.asWebviewUri(mapFileDisk).toString();
					tmpDarlangWebview!.webview.postMessage({resultUri: fileSrc});
				}
			});
			tmpDarlangWebview.onDidDispose(e=>{
				tmpDarlangWebview = undefined;
			});
		}else if(label.search("txt") !== -1){
			// 显示二进制的darlang文件
			console.log("显示二进制的darwinLang");
			let fileTarget:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out",label));
			vscode.workspace.openTextDocument(fileTarget).then((doc:vscode.TextDocument)=>{
				vscode.window.showTextDocument(doc, 1,false).then(ed=>{
					ed.edit(edit=>{
					});
				});
			}, (err)=>{
				console.log(err);
			});
		}else if(label.search("config.b") !== -1){
			console.log("解析显示1_1config.b 文件内容");
			let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "1_1config.txt");
			fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "1_1config.txt"),
						path.join(path.dirname(PROJ_SAVE_PATH!), path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")+"_config.txt"));
			fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "config.b"),
						path.join(path.dirname(PROJ_SAVE_PATH!), "config.b"));
			targetFilePath = path.join(path.dirname(PROJ_SAVE_PATH!), path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")+"_config.txt");
			console.log("显示config.b文件内容，文件路径："+targetFilePath);
			vscode.workspace.openTextDocument(targetFilePath).then((doc:vscode.TextDocument) => {
				vscode.window.showTextDocument(doc, 1, false);
			});
		}else if(label.search(".pickle") !== -1 && label.search("layer") === -1){
			// 显示pickle 文件的原始内容
			console.log("解析并显示pickle 文件内容");
			// let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label));
			let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "inputs",label);
			var modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
			var commandStr = PYTHON_INTERPRETER+modelVisScriptPath + " "+ targetFilePath;
			exec(commandStr, function(err, stdout, stderr){
				console.log("pickle 文件解析结束");
				let fileTarget:vscode.Uri = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
				vscode.workspace.openTextDocument(fileTarget).then((doc:vscode.TextDocument)=>{
					vscode.window.showTextDocument(doc, 1, false);
				});
				vscode.workspace.onDidCloseTextDocument(evt=>{
					console.log(evt.fileName+" [is closed");
					let targetFile = evt.fileName;
					targetFile = targetFile.replace("\.git","");
					fs.unlink(targetFile,()=>{});
				});
			});
		} else if(label.search("layer") !== -1){
			// 显示layer之间连接pickle文件的原始内容
			console.log("显示layer 连接pickle文件");
			let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"darlang_out", label);
			let modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
			let commandStr = PYTHON_INTERPRETER+modelVisScriptPath+" "+targetFilePath;
			exec(commandStr, function(err, stdout, stderr){
				console.log("layer 连接pickle 文件 "+label+" 解析结束");
				let fileTarget:vscode.Uri = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
				vscode.workspace.openTextDocument(fileTarget).then((doc:vscode.TextDocument)=>{
					vscode.window.showTextDocument(doc, 1, false);
				});
			});
		}else if(label === "数据集"){
			// 数据可视化
			console.log("单击可视化,数据");
			// vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0]);
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0].children![0]);

		}else if(ANN_MODEL_FILE_PATH && label.replace("model_file_","") === path.basename(ANN_MODEL_FILE_PATH)){
			// ANN模型可视化
			console.log("单击可视化，ANN模型");
			// vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![1]);
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0].children![1].children![0]);
		}else if(label === "SNN模型"){
			console.log("SNN模型可视化");
			vscode.commands.executeCommand("snn_model_ac.show_snn_model");
		} else if (label === "ANN模型") {
			console.log("打开ANN模型转换界面.....");
			vscode.commands.executeCommand("item_convertor.start_convert");
		}
	}));


	function sleep(numberMillis:any) {
		var start = new Date().getTime();
		while (true) {
			if (new Date().getTime() - start > numberMillis) {
				break;
			}
		}
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "darwin2" is now active!');
	// track current webview panel
	let currentPanel:vscode.WebviewPanel | undefined = undefined;
	let currentPanelInterval:NodeJS.Timeout|undefined = undefined;
	let isCurrentPanelClosedByRemoveProj: boolean = false;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
		// 启动后台资源server
		let scriptPath = path.join(__dirname,"inner_scripts","img_server.py");
		let commandStr = PYTHON_INTERPRETER+scriptPath;
		console.log("prepare to start img server.");
		exec(commandStr, function(err, stdout, stderr){
			console.log("img server started");
		});
		sleep(5000);
		// The code you place here will be executed every time your command is executed
		const columnToShowIn = vscode.window.activeTextEditor? vscode.window.activeTextEditor.viewColumn:undefined;
		treeviewHome.reveal(treeview.data[0]);
		if(currentPanel){
			currentPanel.reveal(columnToShowIn);
		}else{
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换工具",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			// 主界面由electron 应用启动
			currentPanel.webview.html =getConvertorPageV2();
			bindCurrentPanelReceiveMsg(currentPanel);
		}
		currentPanelInterval = setInterval(()=>{
			if(currPanelDisposed){
				currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换工具",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
				// 主界面由electron 应用启动
				currentPanel.webview.html =getConvertorPageV2();
				currentPanel.title = "模型转换工具";
				bindCurrentPanelReceiveMsg(currentPanel);
				currPanelDisposed = false;
				isCurrentPanelClosedByRemoveProj = false;
			}
		}, 500);
	});

	// currentPanel webView 面板 onDidReceiveMessage 事件绑定
	function bindCurrentPanelReceiveMsg(currentPanel: vscode.WebviewPanel){
		currentPanel.onDidDispose(e=>{
			if(!isCurrentPanelClosedByRemoveProj){
				vscode.window.showWarningMessage("该tab页不可关闭！！！");
			}
			currPanelDisposed = true;
		});
		currentPanel.webview.onDidReceiveMessage(function(msg){
			console.log("Receive message: "+msg);
			let data = JSON.parse(msg);
			if(data.click){
				console.log("Click message, val is: "+data.click);
				if(data.click === "convertor_page"){
					console.log("Jump to convertor page");
					if(currentPanel){
						currentPanel.webview.html = getConvertorPageV2();
						currentPanel.title = "模型转换工具";
					}
				}
			}else if(data.project_info){
				// 接收到webview 项目创建向导的消息，创建新的项目
				console.log("receive project create info");
				console.log("project name: " + data.project_info.project_name+", project type="+data.project_info.project_type);
				fs.open(PROJ_SAVE_PATH!, 'w', 0o777 , (err, fd)=>{
					if(err){
						console.log("创建项目文件错误："+err);
					}
					console.log("创建新项目文件，路径："+PROJ_SAVE_PATH);
				});
				PROJ_DESC_INFO.project_name = data.project_info.project_name;
				PROJ_DESC_INFO.project_type = data.project_info.project_type;
				addSlfProj(data.project_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name,[
					new TreeItemNode("ANN-SNN转换",[
						new TreeItemNode("数据集",[
							new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), new TreeItemNode("测试数据标签",[])
						]), 
						new TreeItemNode("ANN模型",[]), 
						new TreeItemNode("SNN模型",[
							new TreeItemNode("连接文件", [])
						]),
					]),
					new TreeItemNode("编译", [
						new TreeItemNode("Darwin II", [
							new TreeItemNode("模型文件", []),
							new TreeItemNode("编解码配置文件", [])
						]),
						new TreeItemNode("Darwin III", [])
					])
				], true, "root"));
				// inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("模型转换", [
				// 	new TreeItemNode("ANN模型",[]),
				// 	new TreeItemNode("SNN模型", [new TreeItemNode("连接文件", [])]),
				// 	new TreeItemNode("数据", [new TreeItemNode("训练数据", []), new TreeItemNode("测试数据", []), new TreeItemNode("测试数据标签", [])])
				// ]), new TreeItemNode("模拟器", []), new TreeItemNode("编译映射", [new TreeItemNode("Darwin II", [new TreeItemNode("模型文件", []), new TreeItemNode("编解码配置文件", [])])])], true, "root"));
				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
				// inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("数据", 
				// 		[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
				// 		new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])], true));
				// treeview.data = inMemTreeViewStruct;
				// treeview.refresh();
				// treeViewBinConvertDarLang.refresh();
			}else if(data.project_refac_info){
				// 接收到webview 项目属性修改的信息
				console.log("receive project refactor info");
				PROJ_DESC_INFO.project_name = data.project_refac_info.project_name;
				PROJ_DESC_INFO.project_type = data.project_refac_info.project_type;
				let treeItemsSize = inMemTreeViewStruct.length;
				inMemTreeViewStruct[treeItemsSize-1].label = PROJ_DESC_INFO.project_name;
				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
			}else if(data.model_convert_params){
				// 接收到模型转换与仿真的参数配置，启动脚本

				// vscode.postMessage(JSON.stringify({"model_convert_params":{
				// 	"vthresh": v_thresh,
				// 	"neuron_dt": neuron_dt,
				// 	"synapse_dt":synapse_dt,
				// 	"delay":delay,
				// 	"dura":dura
				// }}));
				// 提取参数
				console.log("Fetch params for conversion from received message");
				let webParamVthresh = data.model_convert_params.vthresh;
				let wevParamNeuronDt = data.model_convert_params.neuron_dt;
				let webParamSynapseDt = data.model_convert_params.synapse_dt;
				let webParamDelay = data.model_convert_params.delay;
				let webParamDura = data.model_convert_params.dura;

				SNN_VTH = webParamVthresh;

				console.log("Extension 接收到 webview的消息，启动脚本......");
				sleep(1000);
				// let scriptPath = undefined;
				if(PROJ_DESC_INFO.project_type === '图像分类'){
					CONVERT_SCRIPT_PARAMS = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")) + " 0";
				}else if(PROJ_DESC_INFO.project_type === "语义分割"){
					CONVERT_SCRIPT_PARAMS = path.join(__dirname, "darwin2sim", "seg_cls_scripts","convert_with_stb.py "+ webParamVthresh+" "+ 
					wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")) + " 0";
				}else if(PROJ_DESC_INFO.project_type === "语音识别"){
					CONVERT_SCRIPT_PARAMS = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""))+ " 4";
				}else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
					CONVERT_SCRIPT_PARAMS = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")) + " 0";
				} else if (PROJ_DESC_INFO.project_type === "年龄检测") {
					CONVERT_SCRIPT_PARAMS = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")) + " 3";	
				} else {
					//TODO Other task type
				}
				// 

				// 发送消息到界面，选择使用模型算法/自定义算法
				currentPanel!.webview.postMessage(JSON.stringify({"select_default_or_self_alg": "need_check"}));
			}else if(data.select_save_proj_path_req){
				// 选择项目的保存路径
				console.log("select path for saving project, proj name="+data.select_save_proj_path_req);
				if(data.is_change_proj_name && PROJ_SAVE_PATH){
					console.log("Just changing proj name, no need to open dialog.");
					PROJ_SAVE_PATH = path.join(path.dirname(PROJ_SAVE_PATH), data.select_save_proj_path_req+".dar2");
					if(currentPanel){
						console.log("项目名称修改，发送到webview，路径="+PROJ_SAVE_PATH);
						currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": PROJ_SAVE_PATH}));
					}
				}else{
					const options:vscode.OpenDialogOptions = {
						canSelectFiles:false,
						canSelectFolders:true,
						openLabel:"选择目录",
						title:"选择项目保存位置"
					};
					vscode.window.showOpenDialog(options).then(fileUri => {
						if(fileUri){
							console.log("选择的项目保存路径为："+fileUri[0].fsPath);
							PROJ_SAVE_PATH = path.join(fileUri[0].fsPath, data.select_save_proj_path_req+".dar2");
							if(currentPanel){
								console.log("发送保存路径到webview..., 路径="+PROJ_SAVE_PATH);
								// fs.open(PROJ_SAVE_PATH, 'w', 0o777 , (err, fd)=>{
								// 	if(err){
								// 		console.log("创建项目文件错误："+err);
								// 	}
								// 	console.log("创建新项目文件，路径："+PROJ_SAVE_PATH);
								// });
								currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": PROJ_SAVE_PATH}));
							}
						}
					});
				}
			} else if (data.convert_self_def) {
				if (data.convert_self_def === "preprocess") {
					// 打开编辑页面，实现自定义算法
					vscode.workspace.openTextDocument(path.join(path.dirname(PROJ_SAVE_PATH!), "self_preprocess.py")).then((doc:vscode.TextDocument)=>{
						vscode.window.showTextDocument(doc, 1, false);
					}, (err)=>{
						console.log(err);
					});
				} else if (data.convert_self_def === "opt") {
					vscode.workspace.openTextDocument(path.join(path.dirname(PROJ_SAVE_PATH!), "self_opt.py")).then((doc:vscode.TextDocument)=>{
						vscode.window.showTextDocument(doc, 1, false);
					}, (err)=>{
						console.log(err);
					});
				}
			} else if (data.select_alg_res) {
				console.log("extension 获得选择结果，选择默认算法or自定义算法: "+data.select_alg_res);
				console.log("extension 获得选择结果，opt 默认算法 or 自定义算法: "+data.select_alg_res_opt);
				if (data.select_alg_res === "self") {
					CONVERT_SCRIPT_PARAMS += " 1 "+path.join(path.dirname(PROJ_SAVE_PATH!), "self_preprocess.py");
				}else {
					CONVERT_SCRIPT_PARAMS += " 0 default";
				}
				if (data.select_alg_res_opt === "self") {
					CONVERT_SCRIPT_PARAMS += " 1 " + path.join(path.dirname(PROJ_SAVE_PATH!), "self_opt.py");
				} else {
					CONVERT_SCRIPT_PARAMS += " 0 default";
				}
				let commandStr = PYTHON_INTERPRETER+CONVERT_SCRIPT_PARAMS;
				currentPanel?.webview.postMessage(JSON.stringify({"log_output":"模型转换程序启动中......"}));
				isConversionExeced = true;
				
				let scriptProcess = exec(commandStr,{});
				// let logOutputPanel = vscode.window.createOutputChannel("Darwin Convertor");
				if (LOG_OUTPUT_CHANNEL === undefined) {
					LOG_OUTPUT_CHANNEL = vscode.window.createOutputChannel("Darwin Convertor");
					LOG_OUTPUT_CHANNEL.show();
				} else{
					LOG_OUTPUT_CHANNEL.clear();
				}
				
				scriptProcess.stdout?.on("data", function(data){
					LOG_OUTPUT_CHANNEL!.append(data);
					// console.log(data);
					if(data.indexOf("CONVERT_FINISH") !== -1){
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"progress":"convert_finish"}));
						}
					}else if(data.indexOf("PREPROCESS_FINISH") !== -1){
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"progress":"preprocess_finish"}));
						}
					}else if(data.indexOf("SEARCH_FINISH") !== -1){
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"progress":"search_finish"}));
						}
					}
					if(currentPanel){
						let formattedData = data.split(NEWLINE).join("<br/>");
						currentPanel.webview.postMessage(JSON.stringify({"log_output":formattedData}));
					}
				});
				scriptProcess.stderr?.on("data", function(data){
					console.log("extension 执行脚本错误：");
					console.log(data);
					// 将错误信息发送到前端界面，弹窗显示
					currentPanel.webview.postMessage(JSON.stringify({"exec_error": data}));
				});
				scriptProcess.on("exit",function(){
					// 进程结束，发送结束消息
					if(currentPanel){
						currentPanel.webview.postMessage(JSON.stringify({"exec_finish":"yes"}));
						fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
							if(currentPanel){
								currentPanel.webview.postMessage(JSON.stringify({"snn_info":data}));
							}
						});
						fs.readFile(path.join(__dirname, "inner_scripts", "convert_statistic_info.json"), "utf-8", (evt,data)=>{
							if(currentPanel){
								currentPanel.webview.postMessage(JSON.stringify({"convert_info":data}));
							}
						});
						fs.readFile(path.join(__dirname, "darwin2sim","target",path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"log","gui","test","normalization","99.9.json"),"utf-8", (evt, data)=>{
							if(currentPanel){
								currentPanel.webview.postMessage(JSON.stringify({"scale_factors":data}));
							}
						});
						vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
					}

					// 将生成的brian2_snn_info.json 文件打包，并在项目文件中记录，在加载工程文件后覆盖原有文件
					let snapshotProcess = exec(PYTHON_INTERPRETER+" "+ snapshotScript+ " "+sampleImgsDir+" "+ path.join(snnInfoFileDir, "brian2_snn_info.json")+" "+path.join(path.dirname(PROJ_SAVE_PATH!), SNAP_SHOT_FNAME));
					snapshotProcess.stderr?.on("data", (e)=>{
						console.log("生成snapshot 文件错误："+e);
					});
				});
			} else if (data.import_choose_path) {
				const options:vscode.OpenDialogOptions = {
					canSelectFiles:false,
					canSelectFolders:false,
					openLabel:"选择文件",
					title:"选择文件",
					filters: {"files": ["npz", "h5"]}
				};
				vscode.window.showOpenDialog(options).then(fileUri => {
					if(fileUri){
						console.log("选择文件的路径为："+fileUri[0].fsPath+", ftarget="+data.import_ftarget);
						const ftarget:string = data.import_ftarget;
						currentPanel!.webview.postMessage(JSON.stringify({"path":fileUri[0].fsPath , "ftarget": ftarget}));
						// console.log("选择的项目保存路径为："+fileUri[0].fsPath);
						// PROJ_SAVE_PATH = path.join(fileUri[0].fsPath, data.select_save_proj_path_req+".dar2");
						// if(currentPanel){
						// 	console.log("发送保存路径到webview..., 路径="+PROJ_SAVE_PATH);
						// 	// fs.open(PROJ_SAVE_PATH, 'w', 0o777 , (err, fd)=>{
						// 	// 	if(err){
						// 	// 		console.log("创建项目文件错误："+err);
						// 	// 	}
						// 	// 	console.log("创建新项目文件，路径："+PROJ_SAVE_PATH);
						// 	// });
						// 	currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": PROJ_SAVE_PATH}));
						// }
					}
				});
			} else if (data.choose_import_file_paths) {
				console.log("选择的文件路径为："+JSON.stringify(data.choose_import_file_paths));
				currentPanel!.webview.postMessage(JSON.stringify({"show_error": "文件校验中，请稍等......", "display_loading":"yes"})).then(()=>{
					if (PROJ_DESC_INFO.project_type !== "疲劳检测") {
						let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+data.choose_import_file_paths.xnorm+ " 0";
						try {
							execSync(checkCmd, {encoding: "buffer"});
						} catch (err:any) {
							console.log("发送xnorm 文件校验错误消息......");
							currentPanel!.webview.postMessage(JSON.stringify({"show_error": "<strong>文件 "+path.basename(data.choose_import_file_paths.xnorm)+
														" 校验错误！</strong><br/>错误信息：<br/>"+iconv.decode(err.stderr, 'cp936')}));
							return;
						};
					}
					importXNorm(data.choose_import_file_paths.xnorm);
					if (PROJ_DESC_INFO.project_type !== "疲劳检测") {
						let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+data.choose_import_file_paths.xtest+ " 0";
						try {
							execSync(checkCmd, {encoding: "buffer"});
						} catch (err:any) {
							console.log("发送xtest 文件校验错误消息......");
							currentPanel!.webview.postMessage(JSON.stringify({"show_error": "<strong>文件 "+path.basename(data.choose_import_file_paths.xtest)+" 校验错误！</strong><br/>错误信息：<br/>"+
															iconv.decode(err.stderr, 'cp936')}));
							return;
						};
					}
					importXTest(data.choose_import_file_paths.xtest);
					let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+data.choose_import_file_paths.ytest+ " 1";
					try {
						execSync(checkCmd, {encoding: "buffer"});
					} catch (err:any) {
						console.log("发送ytest 文件校验错误消息......");
						currentPanel!.webview.postMessage(JSON.stringify({"show_error": "<strong>文件 "+path.basename(data.choose_import_file_paths.ytest)+
														" 校验错误！</strong><br/>错误信息：<br/>"+iconv.decode(err.stderr, 'cp936')}));
						return;
					};
					importYTest(data.choose_import_file_paths.ytest);
					checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "ann_model_checker.py")+ " "+data.choose_import_file_paths.ann;
					try {
						execSync(checkCmd, {encoding: "buffer"});
					} catch (err:any) {
						console.log("发送ann 模型文件校验错误消息......");
						currentPanel!.webview.postMessage(JSON.stringify({"show_error": "<strong>文件 "+path.basename(data.choose_import_file_paths.ann)+
															" 校验错误！</strong><br/>错误信息：<br/>"+iconv.decode(err.stderr, 'cp936')}));
						return;
					};
					importANNFile(data.choose_import_file_paths.ann);
					currentPanel!.webview.postMessage(JSON.stringify({"show_error":"ok", "hide": "yes"}));
				});
			} else if (data.config_fname) {
				let genScript = path.join(__dirname, "darwin2sim", "gen_darwin2_bin_files.py");
				let cmdStr = PYTHON_INTERPRETER+" "+genScript+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")+" "+path.join(path.dirname(PROJ_SAVE_PATH!), "packed_bin_files.dat") + " " + data.config_fname;
				// vscode.window.showInformationMessage("二进制文件生成中，请稍等......");
				if (!LOG_OUTPUT_CHANNEL) {
					LOG_OUTPUT_CHANNEL = vscode.window.createOutputChannel("Darwin Convertor");
				}
				console.log("接收到模型编译的配置："+ data.toString());
				LOG_OUTPUT_CHANNEL?.show();
				LOG_OUTPUT_CHANNEL?.append("\n二进制文件编译中...");
				binaryCompilingInterval = setInterval(()=>{
					LOG_OUTPUT_CHANNEL?.append(".");
				}, 500);
				isCompiling = true;
				if (data.target_arch === "达尔文2") {
					console.log("编译生成达尔文2部署文件......");
					compileSubProc = exec(cmdStr, (err, stdout, stderr)=>{
						clearInterval(binaryCompilingInterval!);
						if(err){
							console.log("执行darwin2二进制部署文件错误...");
							vscode.window.showErrorMessage("二进制文件生成错误!!!");
							LOG_OUTPUT_CHANNEL?.append("\n二进制文件编译错误!\n");
						}else{
							if (!fs.existsSync(path.join(path.dirname(PROJ_SAVE_PATH!), "darwin2_bin"))) {
								fs.mkdirSync(path.join(path.dirname(PROJ_SAVE_PATH!), "darwin2_bin"));
							}
							fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "config.b"),
											path.join(path.dirname(PROJ_SAVE_PATH!), "darwin2_bin",data.config_fname));
							fs.renameSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "config.b"),
										path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", data.config_fname));
							fs.renameSync(path.join(path.dirname(PROJ_SAVE_PATH!), "packed_bin_files.dat"), path.join(path.dirname(PROJ_SAVE_PATH!), data.pack_fname) );
							fs.copyFileSync(path.join(path.dirname(PROJ_SAVE_PATH!), data.pack_fname), path.join(path.join(__dirname, "darwin2sim", "model_out", 
											path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", data.pack_fname)));
							fs.renameSync(path.join(path.dirname(PROJ_SAVE_PATH!), data.pack_fname), path.join(path.dirname(PROJ_SAVE_PATH!), "darwin2_bin", data.pack_fname));
							DARWIN_LANG_BIN_PATHS.splice(0);
			
							inMemTreeViewStruct[0].children!.splice(1,1);
							treeview.data = inMemTreeViewStruct;
							treeview.refresh();
							inMemTreeViewStruct[0].children!.push(new TreeItemNode("编译", [
								new TreeItemNode("Darwin II", [
									new TreeItemNode("模型文件", [], false, "模型文件", 2),
									new TreeItemNode("编解码配置文件", [], false, "模型文件", 2)
								], false, "Darwin II", 2),
								new TreeItemNode("Darwin III", [])
							], false, "编译", 2));
			
							inMemTreeViewStruct[0].children![1].children![0].children![0].children!.splice(0);
							inMemTreeViewStruct[0].children![1].children![0].children![1].children!.splice(0);
							fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out"), (err, files)=>{
								files.forEach(file => {
									if(file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1){
										if (file.search("\\.b") === -1 && file.search("\\.dat") === -1) {
											DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", file));
										}
										if(file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
													file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1){
											addDarwinFiles(data.config_fname);
											addDarwinFiles(data.pack_fname);
											DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", data.config_fname));
											DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", data.pack_fname));
											inMemTreeViewStruct[0].children![1].children![0].children![0].children!.splice(0);
											inMemTreeViewStruct[0].children![1].children![0].children![0].children!.push(new TreeItemNode(data.config_fname));
											inMemTreeViewStruct[0].children![1].children![0].children![1].children!.splice(0);
											inMemTreeViewStruct[0].children![1].children![0].children![1].children!.push(new TreeItemNode(data.pack_fname));
										}
									}
									treeview.data = inMemTreeViewStruct;
									treeview.refresh();
								});
								autoSaveWithCheck();
								// vscode.window.showInformationMessage("二进制文件生成结束!");
								LOG_OUTPUT_CHANNEL?.append("\n二进制文件编译成功!\n");
							});
							treeview.refresh();
						}
						isCompiling = false;
					});
				} else {
					console.log("编译生成达尔文3部署文件......");
					let gen3Script = path.join(__dirname, "darwin2sim", "gen_darwin3_bin_files.py");
					console.log("snn vthreshold="+SNN_VTH);
					let cmdStr = PYTHON_INTERPRETER+" " + gen3Script+" "+ path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "") + " "+SNN_VTH;
					compileSubProc = exec(cmdStr, (err, stdout, stderr)=>{
						clearInterval(binaryCompilingInterval!);
						if (err) {
							console.log("执行darwin3二进制部署文件错误...");
							vscode.window.showErrorMessage("二进制文件生成错误!!!");
							LOG_OUTPUT_CHANNEL?.append("\n二进制文件编译错误!\n");
						} else {
							console.log("darwin3 二进制部署文件编译完成！");
							LOG_OUTPUT_CHANNEL?.append("\n达尔文3 二进制部署文件编译完成！\n");
							ITEM_ICON_MAP.set("packed_bin_files.dat", "imgs/data_file_icon_new.png");
							if (!fs.existsSync(path.join(path.dirname(PROJ_SAVE_PATH!), "darwin3_bin"))) {
								fs.mkdirSync(path.join(path.dirname(PROJ_SAVE_PATH!), "darwin3_bin"));
							}
							fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),
											"packed_bin_files.dat"), 
											path.join(path.dirname(PROJ_SAVE_PATH!), "packed_bin_files.dat"));
							fs.renameSync(path.join(path.dirname(PROJ_SAVE_PATH!), "packed_bin_files.dat"),
							path.join(path.dirname(PROJ_SAVE_PATH!), "darwin3_bin","packed_bin_files.dat"));
							// Mount zip file onto project explorer
							inMemTreeViewStruct[0].children![1].children!.splice(1);
							inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode("Darwin III", [], false, "Darwin III", 2));
							inMemTreeViewStruct[0].children![1].children![1].children!.push(new TreeItemNode("packed_bin_files.dat"));
							// inMemTreeViewStruct[0].children![1].children![1].children!.push(new TreeItemNode("darwin3_"+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")+".zip"));
							treeview.data = inMemTreeViewStruct;
							treeview.refresh();
							autoSaveWithCheck();
						}
						isCompiling = false;
					});
					treeview.refresh();
				}

				console.log("编译进程号："+compileSubProc.pid);
			} else if (data.stop_compile) {
				console.log("extension 接收到结束编译信号。。。。");
				if (process.platform === "win32") {
					spawn("taskkill", ["/pid", ""+compileSubProc!.pid, '/f', '/t']);
				} else {
					process.kill(-compileSubProc!.pid);
				}
				clearInterval(binaryCompilingInterval!);
				LOG_OUTPUT_CHANNEL?.append("\n编译进程停止中...");
				binaryCompilingInterval = setInterval(()=>{
					LOG_OUTPUT_CHANNEL?.append(".");
				}, 500);
			}
		});
	}
	
	function importXNorm(file_path:string) {
		X_NORM_DATA_PATH = file_path;
		X_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "colorX.npz");
		X_ORIGIN_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "originColorX.npz");
		// 添加到treeview下
		// ITEM_ICON_MAP.set("x_norm","imgs/file.png");
		// addSlfFile("x_norm");
		let xNormFileOriginName = path.basename(X_NORM_DATA_PATH);
		addSlfFile(xNormFileOriginName);
		if(inMemTreeViewStruct[0].children![0].children![0].children![0].children!.length > 0){
			inMemTreeViewStruct[0].children![0].children![0].children![0].children!.splice(0,1);
		}
		inMemTreeViewStruct[0].children![0].children![0].children![0].children!.push(new TreeItemNode(xNormFileOriginName, undefined, false, 'rmable'));
		// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
		// 	console.log("添加新的文件");
		// 	treeview.data[0].children[0].children[0].children.push(new TreeItemNode(xNormFileOriginName, [], false, 'rmable'));
		// 	treeview.refresh();
		// }
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();
		// 拷贝文件到项目并重命名
		if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
		}
		if(X_NORM_DATA_PATH){
			fs.copyFile(path.join(X_NORM_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "x_norm.npz"),function(err){
				console.log("copy file x_norm.npz error: "+ err);
			});
		}
		if(X_COLOR_DATA_PATH){
			fs.copyFile(path.join(X_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "colorX.npz"), function(err){
				console.log("copy file colorX.npz error: "+err)
			});
		}
		if(X_ORIGIN_COLOR_DATA_PATH){
			fs.copyFile(X_ORIGIN_COLOR_DATA_PATH, path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "originColorX.npz"), function(err){
				console.log("copy file originColorX.npz error: "+err);
			});
		}
		autoSaveWithCheck();
	}

	function importXTest(file_path:string){
		X_TEST_DATA_PATH = file_path;
		
		// 添加到treeview下
		// ITEM_ICON_MAP.set("x_test","imgs/file.png");
		// addSlfFile("x_test");
		let xTestFileOriginName = path.basename(X_TEST_DATA_PATH);
		addSlfFile(xTestFileOriginName);
		if(inMemTreeViewStruct[0].children![0].children![0].children![1].children!.length > 0){
			inMemTreeViewStruct[0].children![0].children![0].children![1].children!.splice(0,1);
		}
		inMemTreeViewStruct[0].children![0].children![0].children![1].children!.push(new TreeItemNode(xTestFileOriginName, undefined, false, 'rmable'));
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();
		// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
		// 	console.log("添加新的文件");
		// 	treeview.data[0].children[0].children[1].children.push(new TreeItemNode(xTestFileOriginName, [], false, 'rmable'));
		// 	treeview.refresh();
		// }
		// 拷贝文件到项目并重命名
		if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
		}
		if(X_TEST_DATA_PATH){
			fs.copyFile(path.join(X_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "x_test.npz"),function(err){
			});
		}
	}

	function importYTest(file_path:string) {
		Y_TEST_DATA_PATH = file_path;
		// 添加到treeview下
		// FIXME
		// ITEM_ICON_MAP.set("y_test","imgs/file.png");
		// addSlfFile("y_test");
		let yTestFileOriginName = path.basename(Y_TEST_DATA_PATH);
		addSlfFile(yTestFileOriginName);
		if(inMemTreeViewStruct[0].children![0].children![0].children![2].children!.length > 0){
			inMemTreeViewStruct[0].children![0].children![0].children![2].children!.splice(0,1);
		}
		inMemTreeViewStruct[0].children![0].children![0].children![2].children!.push(new TreeItemNode(yTestFileOriginName, undefined, false, 'rmable'));
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();
		// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children){
		// 	console.log("添加新的文件");
		// 	treeview.data[0].children[0].children[2].children.push(new TreeItemNode(yTestFileOriginName, [], false, 'rmable'));
		// 	treeview.refresh();
		// }
		// 拷贝文件到项目并重命名
		if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
		}
		if(Y_TEST_DATA_PATH){
			fs.copyFile(path.join(Y_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "y_test.npz"),function(err){
			});
		}
	}

	function importANNFile(file_path: string) {
		ANN_MODEL_FILE_PATH = file_path;
		// 添加到treeview下
		// ITEM_ICON_MAP.set("model_file","imgs/file.png");
		// ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
		addSlfFile(path.basename(ANN_MODEL_FILE_PATH));
		// if(treeview.data[0].children && treeview.data[0].children[1].children){
		// 	treeview.data[0].children[1].children.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH)));
		// 	treeview.refresh();
		// }
		if(inMemTreeViewStruct[0].children![0].children![1].children!.length > 0){
			inMemTreeViewStruct[0].children![0].children![1].children!.splice(0,1);
		}
		inMemTreeViewStruct[0].children![0].children![1].children!.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH), undefined, false, 'rmable'));
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();
		// 拷贝文件到项目并重命名
		if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
		}
		if(ANN_MODEL_FILE_PATH){
			fs.copyFile(path.join(ANN_MODEL_FILE_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "mnist_cnn.h5"),function(err){
			});
		}
	}


	context.subscriptions.push(disposable);
	let disposable2 = vscode.commands.registerCommand("treeView-item.newproj", () => {
		console.log("创建新项目xxx");							
		if(currentPanel){
			currentPanel.webview.postMessage({"command":"CreateNewProject"});
		}
	});
	context.subscriptions.push(disposable2);

	context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_rename",()=>{
		if(!currentPanel || currentPanel.title.trim() === "ANN-SNN转换"){
			vscode.window.showErrorMessage("当前项目属性不可修改!!!");
			return;
		}
		console.log("项目属性修改");
		currentPanel.reveal();
		// 发消息到webview
		if(currentPanel){
			currentPanel.webview.postMessage({"command":"ProjectRefactor", "project_desc":PROJ_DESC_INFO});
		}
	}));

	//项目保存
	context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_save",()=>{
		const options:vscode.SaveDialogOptions = {
			saveLabel:"保存项目",
			filters:{"Darwin2 Project":['dar2']},
			defaultUri:vscode.Uri.file(PROJ_SAVE_PATH!)
		};
		vscode.window.showSaveDialog(options).then(fileUri => {
			if(fileUri && fileUri){
				console.log("selected path: "+fileUri.fsPath);
				// TODO 写入项目信息
				let data= {
					"proj_info":PROJ_DESC_INFO,
					"x_norm_path":X_NORM_DATA_PATH,
					"x_test_path":X_TEST_DATA_PATH,
					"y_test_path":Y_TEST_DATA_PATH,
					"model_path":ANN_MODEL_FILE_PATH,
					"darwinlang_file_paths":DARWIN_LANG_FILE_PATHS,
					"darwinlang_bin_paths":DARWIN_LANG_BIN_PATHS
				};
				fs.writeFileSync(fileUri.fsPath, JSON.stringify(data));
			}
		});
	}));

	// 项目加载
	context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_load", ()=>{
		const options:vscode.OpenDialogOptions = {
			openLabel:"导入工程",
			filters:{"Darwin2Project":['dar2']}
		};
		vscode.window.showOpenDialog(options).then(fileUri =>{
			if(fileUri){
				console.log("opened project path = "+fileUri[0].fsPath);
				PROJ_SAVE_PATH = fileUri[0].fsPath;
				let data = fs.readFileSync(fileUri[0].fsPath);
				console.log("读取的信息：proj_info="+data);
				let projData = JSON.parse(data.toString());
				PROJ_DESC_INFO = projData.proj_info;
				X_NORM_DATA_PATH = projData.x_norm_path;
				X_COLOR_DATA_PATH = path.join(path.dirname(projData.x_norm_path), "colorX.npz"); // TODO: for compatibility with other tasks
				X_ORIGIN_COLOR_DATA_PATH = path.join(path.dirname(projData.x_norm_path), "originColorX.npz"); // TODO: same
				X_TEST_DATA_PATH = projData.x_test_path;
				Y_TEST_DATA_PATH = projData.y_test_path;
				ANN_MODEL_FILE_PATH = projData.model_path;
				DARWIN_LANG_FILE_PATHS = projData.darwinlang_file_paths;
				DARWIN_LANG_BIN_PATHS = projData.darwinlang_bin_paths;
				SNN_VTH = projData.snn_vth;
				console.log("导入工程的x_norm 文件路径为："+X_NORM_DATA_PATH);
				if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2","")))){
					fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2","")));
				}
				let targetProjName = path.basename(PROJ_SAVE_PATH).replace("\.dar2","");
				if(X_NORM_DATA_PATH){
					fs.copyFile(path.join(X_NORM_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"x_norm.npz"),function(err){
					});
					fs.copyFile(path.join(X_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"colorX.npz"),function(err){
					});
					fs.copyFile(path.join(X_ORIGIN_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"originColorX.npz"),function(err){
					});
				}
				if(X_TEST_DATA_PATH){
					fs.copyFile(path.join(X_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"x_test.npz"),function(err){
					});
				}
				if(Y_TEST_DATA_PATH){
					fs.copyFile(path.join(Y_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"y_test.npz"), function(err){
					});
				}
				if(ANN_MODEL_FILE_PATH){
					fs.copyFile(path.join(ANN_MODEL_FILE_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName,"mnist_cnn.h5"),function(err){
					});
				}
				// 显示treeview
				addSlfProj(PROJ_DESC_INFO.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(PROJ_DESC_INFO.project_name,[
					new TreeItemNode("ANN-SNN转换",[
						new TreeItemNode("数据集",[
							new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), new TreeItemNode("测试数据标签",[])
						]), 
						new TreeItemNode("ANN模型",[]), 
						new TreeItemNode("SNN模型",[
							new TreeItemNode("连接文件", [])
						]),
					]),
					new TreeItemNode("编译", [
						new TreeItemNode("Darwin II", [
							new TreeItemNode("模型文件", []),
							new TreeItemNode("编解码配置文件", [])
						]),
						new TreeItemNode("Darwin III", [])
					])
				], true, "root"));
				// inMemTreeViewStruct.push(new TreeItemNode(PROJ_DESC_INFO.project_name, [new TreeItemNode("模型转换", [
				// 	new TreeItemNode("ANN模型",[]),
				// 	new TreeItemNode("SNN模型", [new TreeItemNode("连接文件", [])]),
				// 	new TreeItemNode("数据", [new TreeItemNode("训练数据", []), new TreeItemNode("测试数据", []), new TreeItemNode("测试数据标签", [])])
				// ]), new TreeItemNode("模拟器", []), new TreeItemNode("编译映射", [new TreeItemNode("Darwin II", [new TreeItemNode("模型文件", []), new TreeItemNode("编解码配置文件", [])])])], true, "root"));
				let xNormFileOriginName = path.basename(X_NORM_DATA_PATH!),
					xTestFileOriginName = path.basename(X_TEST_DATA_PATH!),
					yTestFileOriginName = path.basename(Y_TEST_DATA_PATH!);
				// addSlfFile("x_norm");
				// addSlfFile("x_test");
				// addSlfFile("y_test");
				addSlfFile(xNormFileOriginName);
				addSlfFile(xTestFileOriginName);
				addSlfFile(yTestFileOriginName);
				addSlfFile(path.basename(projData.model_path));
				// if(projData.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[0].children){
				// 	if(inMemTreeViewStruct[0].children[0].children[0].children){
				// 		inMemTreeViewStruct[0].children[0].children[0].children.push(new TreeItemNode(xNormFileOriginName, [], false, "rmable"));
				// 	}
				// 	if(inMemTreeViewStruct[0].children[0].children[1].children){
				// 		inMemTreeViewStruct[0].children[0].children[1].children.push(new TreeItemNode(xTestFileOriginName, [], false, "rmable"));
				// 	}
				// 	if(inMemTreeViewStruct[0].children[0].children[2].children){
				// 		inMemTreeViewStruct[0].children[0].children[2].children.push(new TreeItemNode(yTestFileOriginName, [], false, "rmable"));
				// 	}
				// }
				if(projData.x_norm_path){
					inMemTreeViewStruct[0].children![0].children![0].children![0].children!.push(new TreeItemNode(xNormFileOriginName, undefined, false, "rmable"));
				}
				if(projData.x_test_path){
					inMemTreeViewStruct[0].children![0].children![0].children![1].children!.push(new TreeItemNode(xTestFileOriginName, undefined, false, "rmable"));
				}
				if(projData.y_test_path){
					inMemTreeViewStruct[0].children![0].children![0].children![2].children!.push(new TreeItemNode(yTestFileOriginName, undefined, false, "rmable"));
				}
				// if(projData.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[1]){
				// 	inMemTreeViewStruct[0].children[1].children?.push(new TreeItemNode("model_file_"+path.basename(projData.model_path)));
				// }
				inMemTreeViewStruct[0].children![0].children![1].children!.push(new TreeItemNode("model_file_"+path.basename(projData.model_path), undefined, false, "rmable"));
				// add darwinlang and bin files
				// ITEM_ICON_MAP.set("SNN模型","imgs/darwin_icon_model_new.png");
				// addDarwinFold("SNN模型");
				// inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN模型",[]));
				
				// for(let i=0;i<DARWIN_LANG_FILE_PATHS.length;++i){
				// 	// ITEM_ICON_MAP.set(path.basename(darwinlang_file_paths[i].toString()),"imgs/data_file_icon_new.png");
				// 	addDarwinFiles(path.basename(DARWIN_LANG_FILE_PATHS[i].toString()));
				// 	if(inMemTreeViewStruct[0].children){
				// 		var childLen = inMemTreeViewStruct[0].children.length;
				// 		inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode(path.basename(DARWIN_LANG_FILE_PATHS[i].toString())));
				// 	}
				// }
				for(let i=0;i<DARWIN_LANG_FILE_PATHS.length;++i){
					let fname = path.basename(DARWIN_LANG_FILE_PATHS[i].toString());
					addSlfFile(fname);
					if(fname.indexOf("json") !== -1){
						inMemTreeViewStruct[0].children![0].children![2].children!.push(new TreeItemNode(fname));
					}else{
						inMemTreeViewStruct[0].children![0].children![2].children![0].children!.push(new TreeItemNode(fname));
					}
				}
				// let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
				// addSlfFile(path.basename(simuInfoFile));
				// inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode(path.basename(simuInfoFile)));

				// ITEM_ICON_MAP.set("SNN二进制模型", "imgs/darwin_icon_model_new.png");
				addDarwinFold("SNN二进制模型");
				// inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));

				let darwinBinFile = "";
				let darwinPackFile = "";

				for (let i=0; i < DARWIN_LANG_BIN_PATHS.length;++i) {
					if (path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).search("\\.b") > 0) {
						darwinBinFile = path.basename(DARWIN_LANG_BIN_PATHS[i].toString());
					} else if (path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).search("\\.dat") > 0) {
						darwinPackFile = path.basename(DARWIN_LANG_BIN_PATHS[i].toString());
					}
				}

				if (darwinBinFile === "1_1config.b") {
					darwinBinFile = "config.b";
				}

				addDarwinFiles(darwinBinFile);
				addDarwinFiles(darwinPackFile);
				inMemTreeViewStruct[0].children![1].children![0].children![0].children!.push(new TreeItemNode(darwinBinFile));
				inMemTreeViewStruct[0].children![1].children![0].children![1].children!.push(new TreeItemNode(darwinPackFile));

				// Mount zip file onto project explorer
				if (fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),
								"packed_bin_files.dat"))) {
					ITEM_ICON_MAP.set("packed_bin_files.dat", "imgs/data_file_icon_new.png");
					inMemTreeViewStruct[0].children![1].children!.splice(1);
					inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode("Darwin III", [], false, "Darwin III", 2));
					inMemTreeViewStruct[0].children![1].children![1].children!.push(new TreeItemNode("packed_bin_files.dat"));
					// inMemTreeViewStruct[0].children![1].children![1].children!.push(new TreeItemNode("darwin3_"+path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")+".zip"));
				}

				// for(let i=0;i<DARWIN_LANG_BIN_PATHS.length;++i){
				// 	if(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("clear") >=0 || 
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("enable") >=0||
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("re_config") >=0||
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("nodelist")>=0||
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("linkout") >=0||
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("layerWidth") >=0 ||
				// 			path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("1_1config.txt") >=0){
				// 				continue;
				// 	}

				// 	if (path.basename(DARWIN_LANG_BIN_PATHS[i].toString()) === "1_1config.b") {
				// 		addDarwinFiles("config.b");
				// 		inMemTreeViewStruct[0].children![1].children![0].children![0].children!.push(new TreeItemNode("config.b"));
				// 	} else if(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).search("\\.b") > 0){
				// 		console.log("加载二进制文件到节点0："+path.basename(DARWIN_LANG_BIN_PATHS[i].toString()));
				// 		addDarwinFiles(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()));
				// 		inMemTreeViewStruct[0].children![1].children![0].children![0].children!.push(new TreeItemNode(path.basename(DARWIN_LANG_BIN_PATHS[i].toString())));
				// 	}else if(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).search("\\.dat") > 0){
				// 		console.log("加载二进制文件到节点1："+path.basename(DARWIN_LANG_BIN_PATHS[i].toString()));
				// 		addDarwinFiles(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()));
				// 		inMemTreeViewStruct[0].children![1].children![0].children![1].children!.push(new TreeItemNode(path.basename(DARWIN_LANG_BIN_PATHS[i].toString())));
				// 	}
				// 	// if(inMemTreeViewStruct[0].children){
				// 	// 	var childLen = inMemTreeViewStruct[0].children.length;
				// 	// 	// ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
				// 	// 	if(DARWIN_LANG_BIN_PATHS[i].toString().search("config.b") !== -1){
				// 	// 		addDarwinFiles("config.b");
				// 	// 		inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("config.b"));
				// 	// 	}else if(DARWIN_LANG_BIN_PATHS[i].toString().search("connfiles") !== -1){
				// 	// 		addDarwinFiles("packed_bin_files.dat");
				// 	// 		inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("packed_bin_files.dat"));
				// 	// 	}
				// 	// 	// inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
				// 	// }
				// }

				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
			}

			// 应用snapshot 文件
			// 应用之前清空 sample img 所在文件夹
			fs.readdirSync(sampleImgsDir).forEach(file=>{
				fs.unlinkSync(path.join(sampleImgsDir, file));
			});
			let snapShotApplyProcess =exec(PYTHON_INTERPRETER + " " + snapshotApplyScript+ " " + path.join(path.dirname(PROJ_SAVE_PATH!), SNAP_SHOT_FNAME) + " " + sampleImgsDir + " " + snnInfoFileDir);
			snapShotApplyProcess.stderr?.on("data", (e)=>{
				console.log("snapshot 应用错误："+e);
			});
		});
	}));

	// 项目移除
	context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_remove", (item: TreeItemNode)=>{
		console.log("当前需要移除的项目名称为："+item.label);
		for(var i=0;i<inMemTreeViewStruct.length;++i){
			if(inMemTreeViewStruct[i].label === item.label){
				inMemTreeViewStruct.splice(i,1);
				break;
			}
		}
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();

		if(currentPanel){
			isCurrentPanelClosedByRemoveProj=true;
			currentPanel.dispose();
			currentPanel = undefined;
		}
		if(panelDataVis){
			panelDataVis.dispose();
			panelDataVis = undefined;
		}
		if(panelAnnModelVis){
			panelAnnModelVis.dispose();
			panelAnnModelVis = undefined;
		}
		if(panelSNNModelVis){
			panelSNNModelVis.dispose();
			panelSNNModelVis = undefined;
		}
		if(panelSNNVisWeb){
			panelSNNVisWeb.dispose();
			panelSNNVisWeb = undefined;
		}
		if(panelPreprocess) {
			panelPreprocess.dispose();
			panelPreprocess = undefined;
		}
		if(panelPreprocessVis) {
			panelPreprocessVis.dispose();
			panelPreprocessVis = undefined;
		}
		PROJ_SAVE_PATH = undefined;
		X_NORM_DATA_PATH = undefined;
		X_COLOR_DATA_PATH = undefined;
		X_ORIGIN_COLOR_DATA_PATH = undefined;
		X_TEST_DATA_PATH = undefined;
		Y_TEST_DATA_PATH = undefined;
		ANN_MODEL_FILE_PATH = undefined;
		DARWIN_LANG_BIN_PATHS.splice(0);
		DARWIN_LANG_FILE_PATHS.splice(0);
		isConversionExeced = false;
		isCompiling = false;
		// currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换工具",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		// // 主界面由electron 应用启动
		// currentPanel.webview.html =getConvertorPageV2();
		// bindCurrentPanelReceiveMsg(currentPanel);
	}));

	let disposableVisCommand = vscode.commands.registerCommand("treeView-item.datavis", (itemNode: TreeItemNode) => {
		console.log("当前可视化目标:"+itemNode.label);
		if(currentPanel){
			// 切换webview
			if(itemNode.label === "数据集"){
				if (X_NORM_DATA_PATH) {
					if(!panelDataVis){
						panelDataVis = vscode.window.createWebviewPanel("datavis", "数据集",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
						panelDataVis.onDidDispose(function(){
							panelDataVis = undefined;
						}, null, context.subscriptions);
						panelDataVis.webview.onDidReceiveMessage((e)=>{
							if(e.fetch_audio) {
								console.log("接收到webview 请求audio! "+e.fetch_audio);
								axios.default.get(e.fetch_audio, {responseType: "arraybuffer"}).then(res=>{
									decode(res.data).then((audioBuf:any)=>{
										panelDataVis!.webview.postMessage({"audioBuf":audioBuf});
									});
								});
							}
						});
					}
					panelDataVis.reveal();
					// currentPanel.webview.html = getConvertorDataPageV2(
						if(PROJ_DESC_INFO.project_type === '图像分类' || PROJ_DESC_INFO.project_type === "年龄检测"){
							panelDataVis.webview.html = getConvertorDataPageV2(
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample0.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample1.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample2.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample3.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample4.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample5.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample6.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample7.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample8.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample9.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample0.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample1.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample2.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample3.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample4.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample5.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample6.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample7.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample8.png"))),
								panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample9.png")))
							);
						}else if(PROJ_DESC_INFO.project_type === '语义分割'){
							panelDataVis.webview.html = getSegDataVisPage();
						} else if(PROJ_DESC_INFO.project_type === "语音识别") {
							panelDataVis.webview.html = getSpeechClsDataPage();
						} else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
							panelDataVis.webview.html = getFatigueDataVisPage();
						}
				} else {
					// vscode.window.showErrorMessage("请先导入数据!!");
					currentPanel!.webview.postMessage(JSON.stringify({"show_error":"请先导入数据！", "is_error": false}));
				}
			}else if(itemNode.label === path.basename(ANN_MODEL_FILE_PATH!)){
				if (ANN_MODEL_FILE_PATH) {
					if(panelAnnModelVis){
						panelAnnModelVis.dispose();
						panelAnnModelVis = undefined;
					}
					if(!panelAnnModelVis){
						panelAnnModelVis = vscode.window.createWebviewPanel("datavis", "ANN模型",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
						panelAnnModelVis.onDidDispose(()=>{
							panelAnnModelVis = undefined;
						},null, context.subscriptions);
					}
					panelAnnModelVis.reveal();
					panelAnnModelVis.webview.html = getConvertorModelPageV2();
				} else {
					// vscode.window.showErrorMessage("请先导入ANN模型文件！！！");
					currentPanel!.webview.postMessage(JSON.stringify({"show_error":"请先导入ANN模型文件！"}));
				}
			}
		}
		if(itemNode.label === "数据集"){
			if(panelDataVis && X_NORM_DATA_PATH){
				panelDataVis.title = "数据集";
				// 数据可视化展示
				// 执行后台脚本
				let scriptPath = path.join(__dirname,"inner_scripts","data_analyze.py");
				console.log("目标文件路径："+X_NORM_DATA_PATH+", "+X_TEST_DATA_PATH+", "+Y_TEST_DATA_PATH);
				let commandStr = PYTHON_INTERPRETER+scriptPath+" "+X_NORM_DATA_PATH+" "+X_TEST_DATA_PATH + " "+Y_TEST_DATA_PATH;
				if(PROJ_DESC_INFO.project_type === '语义分割'){
					// FIXME extra task type and num classes in semantic segmentation task
					console.log("目标文件路径："+X_NORM_DATA_PATH+", "+X_ORIGIN_COLOR_DATA_PATH+", "+Y_TEST_DATA_PATH);
					commandStr = PYTHON_INTERPRETER+scriptPath+" "+X_NORM_DATA_PATH+" "+X_ORIGIN_COLOR_DATA_PATH + " "+Y_TEST_DATA_PATH;
					commandStr += " 1 2";
				}else if(PROJ_DESC_INFO.project_type === "语音识别") {
					// last param is npz file path contains original audio seq and sampling rates
					console.log("语音识别路径："+X_NORM_DATA_PATH+" "+X_TEST_DATA_PATH+" "+Y_TEST_DATA_PATH+" "+X_ORIGIN_COLOR_DATA_PATH);
					commandStr = PYTHON_INTERPRETER+scriptPath+" "+X_NORM_DATA_PATH+" "+X_TEST_DATA_PATH+" "+Y_TEST_DATA_PATH+" 2 "+X_ORIGIN_COLOR_DATA_PATH;
				} else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
					console.log("疲劳检测模型路径："+X_NORM_DATA_PATH+ " "+X_TEST_DATA_PATH+" "+Y_TEST_DATA_PATH+" "+X_ORIGIN_COLOR_DATA_PATH);
					commandStr = PYTHON_INTERPRETER+scriptPath+" "+X_NORM_DATA_PATH+" "+X_ORIGIN_COLOR_DATA_PATH+" "+Y_TEST_DATA_PATH+" 3 "+X_ORIGIN_COLOR_DATA_PATH;
				}
				exec(commandStr, function(err, stdout, stderr){
					if(err){
						console.log("execute data analyze script error, msg: "+err);
					}else{
						console.log("execute data analyze script finish....");
						fs.readFile(path.join(__dirname, "inner_scripts", "data_info.json"), "utf-8", (err, data)=>{
							console.log("Read data info");
							console.log("data info : "+data);
							// 发送到webview 处理显示
							if(panelDataVis){
								panelDataVis.webview.postMessage(data);
							}
						});
					}
				});
			}else if(!X_NORM_DATA_PATH){
				// vscode.window.showErrorMessage("请先导入数据！！！");
			}
		}else if(itemNode.label.replace("model_file_", "") === path.basename(ANN_MODEL_FILE_PATH!)){
			if(panelAnnModelVis && ANN_MODEL_FILE_PATH){
				panelAnnModelVis.title = "ANN模型";
				var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
				var commandExe = PYTHON_INTERPRETER+modelVisScriptPath+" "+X_NORM_DATA_PATH+" "+X_TEST_DATA_PATH+" "+Y_TEST_DATA_PATH+" "+ANN_MODEL_FILE_PATH;
				if(PROJ_DESC_INFO.project_type === '语义分割'){
					// FIXME task type
					commandExe += " 1";
				}else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
					commandExe += " 3";
				}
				exec(commandExe, function(err, stdout, stderr){
					console.log("model vis script running...");
					console.log("__dirname is: "+__dirname);
					fs.readFile(path.join(__dirname, "inner_scripts", "model_general_info.json"), "utf-8",(evt, data)=>{
						console.log("Read model general info data: "+data);
						// 发送到web view 处理
						if(panelAnnModelVis){
							panelAnnModelVis.webview.postMessage(JSON.stringify({"model_general_info": data}));
						}
					});
					// 加载模型详细信息
					fs.readFile(path.join(__dirname, "inner_scripts","model_layers_info.json"),"utf-8",(evt,data)=>{
						console.log("模型详细信息："+data);
						// 发送到web view 处理
						if(panelAnnModelVis){
							panelAnnModelVis.webview.postMessage(JSON.stringify({"model_detail_info":data}));
						}
					});
					// 加载卷积、池化的等Layer的可视化
					fs.readFile(path.join(__dirname, "inner_scripts", "layer_vis_info.json"), "utf-8", (evt, data)=>{
						console.log("layer output vis: "+data);
						// 发送到webview 处理
						if(panelAnnModelVis){
							panelAnnModelVis.webview.postMessage(JSON.stringify({"model_layer_vis":data}));
						}
					});
				});
			}else if(!ANN_MODEL_FILE_PATH){
				// vscode.window.showErrorMessage("请先导入ANN模型文件！！！");
			}
		}
	});
	context.subscriptions.push(disposableVisCommand);

	let disposableImportCommand = vscode.commands.registerCommand("treeView-item.import", (itemNode: TreeItemNode) => {
		console.log("当前导入目标："+itemNode.label);
		if(itemNode.label === "训练数据"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:false,
				openLabel:"选择训练数据集",
				filters:{"npz":['npz']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					if (PROJ_DESC_INFO.project_type !== "疲劳检测") {
						let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+fileUri[0].fsPath+ " 0";
						try {
							execSync(checkCmd, {encoding: "buffer"});
						} catch (err:any) {
							currentPanel!.webview.postMessage(JSON.stringify({"show_error": iconv.decode(err.stderr, 'cp936')}));
							return;
						};
					}
					X_NORM_DATA_PATH = fileUri[0].fsPath;
					X_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "colorX.npz");
					X_ORIGIN_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "originColorX.npz");
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_norm","imgs/file.png");
					// addSlfFile("x_norm");
					let xNormFileOriginName = path.basename(X_NORM_DATA_PATH);
					addSlfFile(xNormFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![0].children![0].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![0].children![0].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![0].children![0].children!.push(new TreeItemNode(xNormFileOriginName, undefined, false, 'rmable'));
					// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
					// 	console.log("添加新的文件");
					// 	treeview.data[0].children[0].children[0].children.push(new TreeItemNode(xNormFileOriginName, [], false, 'rmable'));
					// 	treeview.refresh();
					// }
					treeview.data = inMemTreeViewStruct;
					treeview.refresh();
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
					}
					if(X_NORM_DATA_PATH){
						fs.copyFile(path.join(X_NORM_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "x_norm.npz"),function(err){
							console.log("copy file x_norm.npz error: "+ err);
						});
					}
					if(X_COLOR_DATA_PATH){
						fs.copyFile(path.join(X_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "colorX.npz"), function(err){
							console.log("copy file colorX.npz error: "+err)
						});
					}
					if(X_ORIGIN_COLOR_DATA_PATH){
						fs.copyFile(X_ORIGIN_COLOR_DATA_PATH, path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "originColorX.npz"), function(err){
							console.log("copy file originColorX.npz error: "+err);
						});
					}
					autoSaveWithCheck();
				}
			});
		}else if(itemNode.label === "测试数据"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:false,
				openLabel:"选择测试数据集",
				filters:{"npz":['npz']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					if (PROJ_DESC_INFO.project_type !== "疲劳检测") {
						let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+fileUri[0].fsPath+ " 0";
						try {
							execSync(checkCmd, {encoding: "buffer"});
						} catch (err:any) {
							currentPanel!.webview.postMessage(JSON.stringify({"show_error": iconv.decode(err.stderr, 'cp936')}));
							return;
						};
					}

					X_TEST_DATA_PATH = fileUri[0].fsPath;
					
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_test","imgs/file.png");
					// addSlfFile("x_test");
					let xTestFileOriginName = path.basename(X_TEST_DATA_PATH);
					addSlfFile(xTestFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![0].children![1].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![0].children![1].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![0].children![1].children!.push(new TreeItemNode(xTestFileOriginName, undefined, false, 'rmable'));
					treeview.data = inMemTreeViewStruct;
					treeview.refresh();
					// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
					// 	console.log("添加新的文件");
					// 	treeview.data[0].children[0].children[1].children.push(new TreeItemNode(xTestFileOriginName, [], false, 'rmable'));
					// 	treeview.refresh();
					// }
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
					}
					if(X_TEST_DATA_PATH){
						fs.copyFile(path.join(X_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "x_test.npz"),function(err){
						});
					}
				}
			});
			autoSaveWithCheck();
		}else if(itemNode.label === "测试数据标签"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:false,
				openLabel:"选择测试数据集标签",
				filters:{"npz":['npz']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "data_srcfile_checker.py")+ " "+fileUri[0].fsPath+ " 1";
					try {
						execSync(checkCmd, {encoding: "buffer"});
					} catch (err:any) {
						currentPanel!.webview.postMessage(JSON.stringify({"show_error": iconv.decode(err.stderr, 'cp936')}));
						return;
					};
					Y_TEST_DATA_PATH = fileUri[0].fsPath;
					// 添加到treeview下
					// FIXME
					// ITEM_ICON_MAP.set("y_test","imgs/file.png");
					// addSlfFile("y_test");
					let yTestFileOriginName = path.basename(Y_TEST_DATA_PATH);
					addSlfFile(yTestFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![0].children![2].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![0].children![2].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![0].children![2].children!.push(new TreeItemNode(yTestFileOriginName, undefined, false, 'rmable'));
					treeview.data = inMemTreeViewStruct;
					treeview.refresh();
					// if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children){
					// 	console.log("添加新的文件");
					// 	treeview.data[0].children[0].children[2].children.push(new TreeItemNode(yTestFileOriginName, [], false, 'rmable'));
					// 	treeview.refresh();
					// }
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
					}
					if(Y_TEST_DATA_PATH){
						fs.copyFile(path.join(Y_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "y_test.npz"),function(err){
						});
					}
				}
			});	
			autoSaveWithCheck();
		}else if(itemNode.label === "ANN模型"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:false,
				openLabel:"选择模型文件",
				filters:{"模型文件":['h5']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					let checkCmd = PYTHON_INTERPRETER+" "+path.join(__dirname, "darwin2sim", "ann_model_checker.py")+ " "+fileUri[0].fsPath;
					try {
						execSync(checkCmd, {encoding: "buffer"});
					} catch (err:any) {
						currentPanel!.webview.postMessage(JSON.stringify({"show_error": iconv.decode(err.stderr, 'cp936')}));
						return;
					};
					ANN_MODEL_FILE_PATH = fileUri[0].fsPath;
					// 添加到treeview下
					// ITEM_ICON_MAP.set("model_file","imgs/file.png");
					// ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
					addSlfFile(path.basename(ANN_MODEL_FILE_PATH));
					// if(treeview.data[0].children && treeview.data[0].children[1].children){
					// 	treeview.data[0].children[1].children.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH)));
					// 	treeview.refresh();
					// }
					if(inMemTreeViewStruct[0].children![0].children![1].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![1].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![1].children!.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH), undefined, false, 'rmable'));
					treeview.data = inMemTreeViewStruct;
					treeview.refresh();
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2","")));
					}
					if(ANN_MODEL_FILE_PATH){
						fs.copyFile(path.join(ANN_MODEL_FILE_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "mnist_cnn.h5"),function(err){
						});
					}
				}
			});	
			autoSaveWithCheck();
		}
	});
	context.subscriptions.push(disposableImportCommand);

	// 启动模型转换, 右键点击
	vscode.commands.registerCommand("item_convertor.start_convert", ()=>{
		if(currentPanel){
			// 发送消息到web view ，开始模型的转换
			console.log("模型转换页面打开");
			if (!ANN_MODEL_FILE_PATH) {
				currentPanel.reveal();
				currentPanel!.webview.postMessage(JSON.stringify({"show_error":"请先导入ANN模型文件！"}));
				return;
			}

			// currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
			console.log("title="+currentPanel.title);
			if(currentPanel && currentPanel.title !== "ANN-SNN转换"){
				console.log("PROJ_DESC_INFO="+PROJ_DESC_INFO);
				if(PROJ_DESC_INFO.project_type === '图像分类' || PROJ_DESC_INFO.project_type === "年龄检测"){
					console.log("currentpanel="+currentPanel);
					currentPanel.webview.html = getANNSNNConvertPage();
				}else if(PROJ_DESC_INFO.project_type === "语义分割"){
					console.log("currentpanel  2="+currentPanel);
					currentPanel.webview.html = getANNSNNConvertSegPage();
				}else if(PROJ_DESC_INFO.project_type === "语音识别"){
					console.log("语音识别模型转换界面");
					// currentPanel.webview.html = getANNSNNConvertSpeechPage();
					currentPanel.webview.html = getANNSNNConvertPage();
				}else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
					console.log("疲劳检测模型转换界面");
					// currentPanel.webview.html = getANNSNNConvertFatiguePage();
					currentPanel.webview.html = getANNSNNConvertPage();
				}
				currentPanel.reveal();
				currentPanel.title = "ANN-SNN转换";
				setTimeout(() => {
					if(PROJ_DESC_INFO.project_type === "语音识别") {
						console.log("语音识别任务向 模型转换界面发送预设参数。。。。");
						currentPanel!.webview.postMessage(JSON.stringify({"preset_param": "yes", "vthresh": 19}));
						currentPanel!.webview.postMessage(JSON.stringify({"progress_stub": "yes", 
							"s1_fin_stub": 81, "s2_fin_stub": 318, "s3_fin_stub": 418, "s4_fin_stub": 440}));
					} else if (PROJ_DESC_INFO.project_type === "疲劳检测") {
						console.log("疲劳检测任务向  模型转换界面发送预设参数。。。。");
						currentPanel!.webview.postMessage(JSON.stringify({"preset_param": "yes", "vthresh": 5}));
						currentPanel!.webview.postMessage(JSON.stringify({"progress_stub": "yes", 
								"s1_fin_stub": 83, "s2_fin_stub": 572, "s3_fin_stub": 674, "s4_fin_stub": 701}));
					} else if (PROJ_DESC_INFO.project_type === "年龄检测") {
						console.log("年龄你个检测任务向  模型转换界面发送预设参数。。。。");
						currentPanel!.webview.postMessage(JSON.stringify({"preset_param": "yes", "vthresh": 7}));
						currentPanel!.webview.postMessage(JSON.stringify({"progress_stub": "yes", 
								"s1_fin_stub": 121, "s2_fin_stub": 333, "s3_fin_stub": 433, "s4_fin_stub": 460}));
					}
				}, 1000);
				console.log("显示currentpane  模型转换   1");
				if (!fs.existsSync(path.join(path.dirname(PROJ_SAVE_PATH!), "self_preprocess.py"))) {
					fs.writeFileSync(path.join(path.dirname(PROJ_SAVE_PATH!), "self_preprocess.py"),`# -*- coding:utf-8 -*-
import keras
import numpy as np


def normalize_parameters(model:keras.models.Model, np_data:np.ndarray):
	"""
	NN weights normalization
	-----------------------

	Spiking neural network is driving with sparsely firing, and the weights from ANN needed to be processed
	to minimize the loss in the conversion process.

	You should implement your own method to normalize synapses' weights, after finishing it, you can run it and
	see the performance.
	
	Parameters:
	---------
	model: keras model, you can get layer weights by calling 'model.layers[i].get_weights()'. Note that some layers, such as pooling, do not have weights
	np_data: N x M or N x M x K np array, it can be directly feed into this model. You can use it for necessary computation.
	"""
	layer_weights = []
	for i in range(len(model.layers)):
		if np.array(model.layers[i].get_weights()).shape[0] == 0:
			continue
		layer_weights.append(np.array(model.layers[i].get_weights()))
	
	# Implement your algorithm here

	idx = 0
	for i in range(len(model.layers)):
		if np.array(model.layers[i].get_weights()).shape[0] == 0:
			continue
		model.layers[i].set_weights(layer_weights[idx])
		idx += 1
							
`);
				}
			// 自定义算法计算权重量化后阈值
			if (!fs.existsSync(path.join(path.dirname(PROJ_SAVE_PATH!), "self_opt.py"))) {
				fs.writeFileSync(path.join(path.dirname(PROJ_SAVE_PATH!), "self_opt.py"), `# -*- coding:utf-8 -*-
from typing import List
import numpy as np


def calc_vthreshold(layer_weights_int:List[np.ndarray], layer_weights_float:List[np.ndarray])->int:
	"""
	Calculating neuron voltage threshold giving each layer's weights
	-----------------------------------------------------------------
	The method for converting an ANN model trained with a modern deep-learning library, such as Tensorflow, 
	into an SNN has been proposed. However, the model achieved by this method has float-point weights with a global voltage threshold equals 1,
	which can not be run on low-energy-cost devices. 

	Here, you should implement your own method to calculating a new global voltage threshold for the quantized weights. The input parameter layer_weights
	is a list contains weights of each layer, and the weights are in [-128, 127].
	Parameters
	----------
	layer_weights_int: Quantized weights of each layer, you can also calculate with supported infomation with your own method
	layer_weights_float: Origin float-point weights of each layer
	
	Returns
	-------
	New global vthreshold
	"""
	return 1			
`);
			}
			}else if(currentPanel){
				currentPanel.reveal();
			}
		}
	});

	// 启动显示SNN模型的命令
	vscode.commands.registerCommand("snn_model_ac.show_snn_model", ()=>{
		if (DARWIN_LANG_FILE_PATHS.length === 0) {
			// vscode.window.showErrorMessage("请先完成转换步骤！！！");
			currentPanel?.reveal();
			currentPanel!.webview.postMessage(JSON.stringify({"show_error": "请先完成转换步骤！"}));
			return;
		}
		if(panelSNNVisWeb){
			panelSNNVisWeb.dispose();
			panelSNNVisWeb = undefined;
		}

		panelSNNVisWeb = vscode.window.createWebviewPanel("SNN Model Vis View", "SNN模型", vscode.ViewColumn.One, {localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		panelSNNVisWeb.onDidDispose(()=>{
			panelSNNVisWeb =undefined;
		}, null, context.subscriptions);

		panelSNNVisWeb.webview.html = getSNNModelPage();
		panelSNNVisWeb.title = "SNN模型";
		panelSNNVisWeb.reveal();
		console.log("执行darwinlang map生成脚本...");
		if(DARWIN_LANG_FILE_PATHS.length === 0){
			// vscode.window.showErrorMessage("请先完成转换步骤！！！");
			return;
		}
		// 执行 darwinlang map 生成脚本
		let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out" , path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
		let commandStr: string = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
		panelSNNVisWeb.webview.onDidReceiveMessage((evt)=>{
			let data = JSON.parse(evt);
			console.log("panelSNNVisWeb 接收到webview 消息："+data);
			// Process and send data to webview after if already ready
			if(data.ready) {
				fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), (err, data)=>{
					console.log("加载完毕snn 模型数据......, err="+err);
					panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_info": data.toString()}));
				});
				
				// exec(commandStr, function (err, stdout, stderr) {
				// 	if(err){
				// 		console.log("执行 load_graph.py 错误：" + err);
				// 	}else{
				// 		// 读取map 文件
				// 		console.log("向SNN模型界面发送 snn_map 数据....");
				// 		let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
				// 		let fileSrc = panelSNNVisWeb!.webview.asWebviewUri(mapFileDisk).toString();
				// 		panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_map": fileSrc})).then((fullfill)=>{
				// 			console.log("snn_map 数据postmsg fullfill: "+fullfill);
				// 			fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), (err, data)=>{
				// 				console.log("加载完毕snn 模型数据......, err="+err);
				// 				panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_info": data.toString()}));
				// 			});
				// 			// let snnModelInfoData = fs.readFileSync(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"));
				// 			// console.log("加载完毕snn 模型数据.....");
				// 			// panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_info": snnModelInfoData.toString()})).then((fullfill)=>{
				// 			// 	console.log("snn_info 数据postmsg fullfill: "+fullfill);
				// 			// }, (reject)=>{
				// 			// 	console.log("snn_info 数据postmsg reject :"+reject);
				// 			// });
				// 		}, (reject)=>{
				// 			console.log("snn_map 数据postmsg reject :"+reject);
				// 		});
				// 	}
				// });
			}
		});
	});

	// 启动仿真
	vscode.commands.registerCommand("item_simulator.start_simulate", ()=>{
		if(panelSNNModelVis){
			panelSNNModelVis.dispose();
			panelSNNModelVis = undefined;
		}
		if (DARWIN_LANG_FILE_PATHS.length === 0) {
			currentPanel?.reveal();
			currentPanel!.webview.postMessage(JSON.stringify({"show_error": "请先完成转换步骤！"}));
			return;
		}
		if(!panelSNNModelVis){
			panelSNNModelVis = vscode.window.createWebviewPanel("snnvis", "SNN模拟",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			panelSNNModelVis.onDidDispose(()=>{
				panelSNNModelVis = undefined;
			},null, context.subscriptions);

			panelSNNModelVis.webview.onDidReceiveMessage((evt)=>{
				if(DARWIN_LANG_FILE_PATHS.length === 0){
					// vscode.window.showErrorMessage("请先完成转换步骤！！！");
					return;
				}
				// let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
				// addSlfFile(path.basename(simuInfoFile));
				// if(inMemTreeViewStruct[0].children![1].children!.length > 0){
				// 	inMemTreeViewStruct[0].children![1].children!.splice(0,1);
				// }
				// inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode(path.basename(simuInfoFile)));
				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
				console.log("extension 接收到 snn 仿真界面ready 消息.");
				let data = JSON.parse(evt);
				if(data.snn_simulate_ready){
					// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
					console.log("SNN模拟界面就绪.....");
					fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
						if(panelSNNModelVis){
							if(PROJ_DESC_INFO.project_type === "图像分类" || PROJ_DESC_INFO.project_type === "语义分割" || PROJ_DESC_INFO.project_type === "疲劳检测"
													|| PROJ_DESC_INFO.project_type === "年龄检测") {
								console.log("SNN模拟界面发送 snn_info 数据....");
								panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
							}else if(PROJ_DESC_INFO.project_type === "语音识别") {
								console.log("语音识别SNN模型仿真界面snn_info 以及样例数据...");
								fs.readFile(path.join(__dirname, "inner_scripts", "data_info.json"), "utf-8", (err, sampleData)=>{
									console.log("Load sample data....");
									panelSNNModelVis!.webview.postMessage(JSON.stringify({"snn_info": data, "sample_audio":sampleData}));
								});
							}
						}
					});
				} else if(data.fetch_audio){
					// 获取音频
					console.log("snn speech simulate page 获取音频..."+data.fetch_audio);
					axios.default.get(data.fetch_audio, {responseType: "arraybuffer"}).then(res=>{
						decode(res.data).then((audioBuf:any)=>{
							panelSNNModelVis!.webview.postMessage(JSON.stringify({"audioBuf": audioBuf}));
						});
					});
				}
			});
			if(PROJ_DESC_INFO.project_type === '图像分类' || PROJ_DESC_INFO.project_type === "年龄检测"){
				panelSNNModelVis.webview.html = getSNNSimuPage();
			}else if(PROJ_DESC_INFO.project_type === '语义分割'){
				panelSNNModelVis.webview.html = getSegSimulatePage();
			}else if(PROJ_DESC_INFO.project_type === "语音识别") {
				panelSNNModelVis.webview.html = getSNNSimuSpeechPage();
			}else if(PROJ_DESC_INFO.project_type === "疲劳检测") {
				panelSNNModelVis.webview.html = getSNNSimuFatiguePage();
			}
			panelSNNModelVis.title = "SNN模拟";
			panelSNNModelVis.reveal();
		}
	});


	// 启动转换为DarwinLang的操作
	vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", ()=>{
		// inMemTreeViewDarLang = [];
		// if(!ITEM_ICON_MAP.has("SNN模型")){
			// ITEM_ICON_MAP.set("SNN模型","imgs/file.png");
			// addDarwinFold("SNN模型");
			DARWIN_LANG_FILE_PATHS.splice(0);
			// Remove 'SNN模型' node, refresh and then add to make it expand
			inMemTreeViewStruct[0].children![0].children!.splice(2,1);
			treeview.data = inMemTreeViewStruct;
			treeview.refresh();
			inMemTreeViewStruct[0].children![0].children!.push(new TreeItemNode("SNN模型",[
				new TreeItemNode("连接文件", [])
			], false, "SNN模型", 2));
			inMemTreeViewStruct[0].children![0].children![2].children!.splice(1);
			inMemTreeViewStruct[0].children![0].children![2].children![0].children!.splice(0);
			fs.readdir(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out"), (err, files) => {
				files.forEach(file=>{
					DARWIN_LANG_FILE_PATHS.push(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out", file));
					addDarwinFiles(file);
					if(file.indexOf("json") !==-1){
						inMemTreeViewStruct[0].children![0].children![2].children!.push(new TreeItemNode(file));
					}else{
						inMemTreeViewStruct[0].children![0].children![2].children![0].children!.push(new TreeItemNode(file));
					}
				});
				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
				autoSaveWithCheck();
			});

			// inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN模型",[]));
			// DARWIN_LANG_FILE_PATHS.splice(0);
			// if(inMemTreeViewStruct[0].children){
			// 	var childLen = inMemTreeViewStruct[0].children.length;
			// 	fs.readdir(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out"), (err, files) => {
			// 		files.forEach(file => {
			// 			DARWIN_LANG_FILE_PATHS.push(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out", file));
			// 			// ITEM_ICON_MAP.set(file, "imgs/file.png");
			// 			addDarwinFiles(file);
			// 			if(inMemTreeViewStruct[0].children){
			// 				inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode(file));
			// 			}
			// 		});
			// 		autoSaveWithCheck();
			// 	});
			// }
			treeview.refresh();
		// }
	});

	// // 启动将darwinlang 文件转换为二进制文件的操作
	vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function(){
		currentPanel?.reveal();
		if(DARWIN_LANG_FILE_PATHS.length === 0){
			// vscode.window.showErrorMessage("请先完成转换步骤！！！");
			currentPanel!.webview.postMessage(JSON.stringify({"show_error": "请先完成转换步骤！"}));
			return;
		}
		if (isCompiling) {
			currentPanel!.webview.postMessage(JSON.stringify({"show_error":"请等待当前编译结束!", "show_stop_compile": "yes"}));
			return;
		}
		if(!ITEM_ICON_MAP.has("SNN二进制模型")){
			addSlfFile("SNN二进制模型");
		}

		// 设置config 与 打包文件名称的提示框
		currentPanel?.webview.postMessage(JSON.stringify({"start_compile_binary": "yes"}));



	// inMemTreeViewStruct.push(new TreeItemNode(PROJ_DESC_INFO.project_name,[
	// 	new TreeItemNode("模型转换",[
	// 		new TreeItemNode("数据集",[
	// 			new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), new TreeItemNode("测试数据标签",[])
	// 		]), 
	// 		new TreeItemNode("ANN模型",[]), 
	// 		new TreeItemNode("SNN模型",[
	// 			new TreeItemNode("连接文件", [])
	// 		]),
	// 	]),
	// 	new TreeItemNode("模型编译", [
	// 		new TreeItemNode("Darwin II", [
	// 			new TreeItemNode("模型文件", []),
	// 			new TreeItemNode("编解码配置文件", [])
	// 		])
	// 	])
	// ], true, "root"));



		// if(!ITEM_ICON_MAP.has("SNN二进制模型")){
		// 	// ITEM_ICON_MAP.set("SNN二进制模型", "imgs/file.png");
		// 	addSlfFile("SNN二进制模型");
		// 	// inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));
		// 	DARWIN_LANG_BIN_PATHS.splice(0);
		// 	inMemTreeViewStruct[0].children![2].children![0].children![0].children!.splice(0);
		// 	inMemTreeViewStruct[0].children![2].children![0].children![1].children!.splice(0);
		// 	fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out"), (err, files)=>{
		// 		files.forEach(file => {
		// 			if(file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1){
		// 				DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", file));
		// 				if(file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
		// 							file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1){
		// 					if(file.search("config.b") !== -1){
		// 						addDarwinFiles("config.b");
		// 						inMemTreeViewStruct[0].children![2].children![0].children![0].children!.push(new TreeItemNode("config.b"));
		// 					}else if(file.search("connfiles") !==-1){
		// 						addDarwinFiles("packed_bin_files.dat");
		// 						inMemTreeViewStruct[0].children![2].children![0].children![1].children!.push(new TreeItemNode("packed_bin_files.dat"));
		// 					}
		// 				}
		// 			}
		// 			treeview.data = inMemTreeViewStruct;
		// 			treeview.refresh();
		// 		});
		// 		autoSaveWithCheck();
		// 	});
			// if(inMemTreeViewStruct[0].children){
			// 	var childLen = inMemTreeViewStruct[0].children.length;
			// 	fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out"), (err, files)=>{
			// 		files.forEach(file =>{
			// 			if(file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1){
			// 				DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", file));
			// 				// ITEM_ICON_MAP.set(file, "imgs/file.png");
			// 				// addSlfFile(file);
			// 				// if(file.search("config.b") !== -1){
			// 				// 	addDarwinFiles("config.b");
			// 				// }else if(file.search("connfiles") !== -1){
			// 				// 	addDarwinFiles("packed_bin_files.dat");
			// 				// }
			// 				if(inMemTreeViewStruct[0].children){
			// 					if(file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
			// 						file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1){
			// 							// inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(file));
			// 							if(file.search("config.b") !== -1){
			// 								addDarwinFiles("config.b");
			// 								inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("config.b"));
			// 							}else if(file.search("connfiles") !== -1){
			// 								addDarwinFiles("packed_bin_files.dat");
			// 								inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("packed_bin_files.dat"));
			// 							}
			// 					}
								
			// 				}
			// 			}
			// 		});
			// 		autoSaveWithCheck();
			// 	});
			// }
		// 	treeview.refresh();
		// }
	});

	vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin2", function(){
		console.log("目标转换为darwin2二进制文件");
		vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
	});

	vscode.commands.executeCommand("darwin2.helloWorld");

	function autoSaveWithCheck(){
		// check if all necessary info get, auto save to proj_save_path
		if(X_NORM_DATA_PATH && X_TEST_DATA_PATH && Y_TEST_DATA_PATH && ANN_MODEL_FILE_PATH && DARWIN_LANG_FILE_PATHS && DARWIN_LANG_BIN_PATHS){
			console.log("all nessary info get, auto save");
			let projInfoData = {
				"proj_info":PROJ_DESC_INFO,
				"x_norm_path":X_NORM_DATA_PATH,
				"x_test_path":X_TEST_DATA_PATH,
				"y_test_path":Y_TEST_DATA_PATH,
				"model_path":ANN_MODEL_FILE_PATH,
				"darwinlang_file_paths":DARWIN_LANG_FILE_PATHS,
				"darwinlang_bin_paths":DARWIN_LANG_BIN_PATHS,
				"snn_vth": SNN_VTH
			};
			fs.writeFileSync(PROJ_SAVE_PATH!, JSON.stringify(projInfoData));
		}
	}

	// 数据预处理
	vscode.commands.registerCommand("item_preprocess.open", ()=>{
		if (!panelPreprocess) {
			panelPreprocess = vscode.window.createWebviewPanel("darwin2web", "预处理", vscode.ViewColumn.One, 
					{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			panelPreprocess.webview.html = getPreprocessPage();
			panelPreprocess.title = "预处理";
		}

		let preprocessToolRoot = path.join(__dirname, "preprocess");

		// path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "darlang_out", "preprocess_config.json")
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")));
		}
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "bin_darwin_out"))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "bin_darwin_out"));
		}
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "bin_darwin3"))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "bin_darwin3"));
		}
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "darlang_out"))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "darlang_out"));
		}
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")));
		}
		if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "preprocess"))) {
			fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "preprocess"));
		}

		panelPreprocess.webview.onDidReceiveMessage((evt)=>{
			let res = JSON.parse(evt);
			console.log("res="+JSON.stringify(res));
			if (res.webview_ready) {
				// Get all preprocess methods
				let getAllMethodProc = spawnSync(PYTHON_INTERPRETER.trim(), [path.join(preprocessToolRoot, "Util", "GetAllMethod.py")], 
							{cwd: preprocessToolRoot, encoding: "utf-8"});
				console.log("预处理方法列表："+getAllMethodProc.stdout);
				console.log("get all method.py stderr: "+getAllMethodProc.stderr);
				panelPreprocess?.webview.postMessage({"all_method": JSON.parse(getAllMethodProc.stdout)});

				let processConfig = "";
				if (PROJ_DESC_INFO.project_type === "图像分类") {
					processConfig = JSON.parse(fs.readFileSync(path.join(preprocessToolRoot, "Examples", "image.json"), {encoding: "utf-8"}));
				} else if (PROJ_DESC_INFO.project_type === "语音识别") {
					processConfig = JSON.parse(fs.readFileSync(path.join(preprocessToolRoot, "Examples", "audio.json"), {encoding: "utf-8"}));
				} else if (PROJ_DESC_INFO.project_type === "年龄检测") {
					processConfig = JSON.parse(fs.readFileSync(path.join(preprocessToolRoot, "Examples", "image.json"), {encoding: "utf-8"}));
				}
				console.log("发送preprocess config="+JSON.stringify(processConfig));
				panelPreprocess?.webview.postMessage({"preprocess_config": processConfig});
			} else if (res.start_preprocess) {
				let input_path = res.start_preprocess.input_path;
                let output_path = res.start_preprocess.output_path;
                let preprocess_config_to_save = res.start_preprocess.preprocess_config_new;

				let config_path = "";
				if (PROJ_DESC_INFO.project_type === "图像分类") {
					config_path = path.join(preprocessToolRoot, "Examples", "image.json");
				} else if(PROJ_DESC_INFO.project_type === "年龄检测") {
					config_path = path.join(preprocessToolRoot, "Examples", "image.json");
				} else if (PROJ_DESC_INFO.project_type === "语音识别") {
					config_path = path.join(preprocessToolRoot, "Examples", "audio.json");
				}
				console.log("写入新的配置文件，路径："+config_path+", config="+preprocess_config_to_save);
				fs.writeFileSync(config_path, JSON.stringify(preprocess_config_to_save), {encoding: "utf-8"});
				fs.copyFileSync(config_path, path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "preprocess","preprocess_config.json"));
				let preprocessProc = spawnSync(PYTHON_INTERPRETER.trim(),
						[path.join(preprocessToolRoot, "main.py"),
							"--input_path",
							input_path,
							"--config_path",
							config_path,
							"--output_path",
							output_path,
							"--visualize"],
							{
								cwd: preprocessToolRoot,
								encoding: "utf-8"
							});
				console.log("预处理main stdout=" + preprocessProc.stdout);
				console.log("预处理main stderr=" + preprocessProc.stderr);
			} else if (res.self_define_name) {
				let self_define_method_path = path.join(preprocessToolRoot, "SelfDefine", res.self_define_name+".py");
				fs.copyFileSync(self_define_method_path, 
					path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "preprocess", res.self_define_name+".py"));
				if (fs.existsSync(self_define_method_path)) {
					openLocalFile(self_define_method_path);
				} else {
					let selfDefineProc = spawnSync(PYTHON_INTERPRETER.trim(),
						[path.join(preprocessToolRoot, "Util", "AddSelfDefine.py"),
								res.self_define_name],
						{
							cwd: preprocessToolRoot,
							encoding: "utf-8"
						});
						openLocalFile(self_define_method_path);
				}
			} else if(res.self_rewrite) {
				let method_name = res.self_rewrite;
				let self_rewrite_method_path = path.join(preprocessToolRoot, "SelfRewrite", method_name+".py");
				fs.copyFileSync(self_rewrite_method_path, 
					path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2", ""), "preprocess", method_name+".py"));
				if (fs.existsSync(self_rewrite_method_path)) {
					openLocalFile(self_rewrite_method_path);
				} else {
					let reWriteProc = spawnSync(PYTHON_INTERPRETER.trim(),
						[path.join(preprocessToolRoot, "Util", "addSelfRewrite.py"), method_name],
						{
							cwd: preprocessToolRoot,
							encoding: "utf-8"
						});
						openLocalFile(self_rewrite_method_path);
				}
			} else if(res.input_path_select) {
				const inputPathOptions: vscode.OpenDialogOptions = {
					canSelectMany: false,
					openLabel: "数据集路径",
					canSelectFiles: false,
					canSelectFolders: true
				};
				vscode.window.showOpenDialog(inputPathOptions).then(fileUri => {
					if (fileUri && fileUri[0]) {
						let dataPath = fileUri[0].fsPath;
						panelPreprocess?.webview.postMessage({"input_path": dataPath});
					}
				});
			} else if(res.output_path_select) {
				const outputPathOptions: vscode.OpenDialogOptions = {
					canSelectMany: false,
					openLabel: "保存位置",
					canSelectFiles:false,
					canSelectFolders: true
				};
				vscode.window.showOpenDialog(outputPathOptions).then(fileUri => {
					if (fileUri && fileUri[0]) {
						let dataPath = fileUri[0].fsPath;
						if (panelPreprocess) {
							panelPreprocess.webview.postMessage({"output_path": dataPath});
						}
					}
				});
			} else if (res.check_visualize) {
				// let temp_config_path = path.join(preprocessToolRoot, "temp_preprocess.json");
				// fs.writeFileSync(temp_config_path, JSON.stringify(res.check_visualize), "utf-8");
				// let input_path = '';
				// if (res.check_visualize.input.type === "audio") {
				// 	input_path = path.join(preprocessToolRoot, "./test/sample.wav");
				// } else if (res.check_visualize.input.type === "image") {
				// 	input_path = path.join(preprocessToolRoot, "./test/sample.png");
				// }
				// let visProc = spawnSync(PYTHON_INTERPRETER.trim(), 
				// 		[path.join(preprocessToolRoot, "main.py"),
				// 			"--input_path",
				// 			input_path,
				// 			"--config_path",
				// 			temp_config_path,
				// 			"--output_path",
				// 			path.join(preprocessToolRoot, "./test/testtest/testoutput.npy"),
				// 			"--visualize"],
				// 		{
				// 			cwd: preprocessToolRoot,
				// 			encoding: "utf-8"
				// 		});
				// console.log("预处理可视化 stdout="+ visProc.stdout);
				// console.log("预处理可视化 stderr="+visProc.stderr);

				preprocess_visulize(context, path.join(preprocessToolRoot, "./test/testtest"));

				// fs.unlinkSync(temp_config_path);
			}
		});

		panelPreprocess.onDidDispose(()=>{
			panelPreprocess = undefined;
		});
	});



function preprocess_visulize(context: vscode.ExtensionContext,
	localResourceRoots: string) {
	if (panelPreprocessVis) {
		panelPreprocessVis.dispose();
		panelPreprocessVis = undefined;
	}
	if (!panelPreprocessVis) {
		panelPreprocessVis = vscode.window.createWebviewPanel("preProcessVis", "预处理预览", vscode.ViewColumn.One, {
			localResourceRoots: [
				vscode.Uri.file(localResourceRoots),
				vscode.Uri.file(path.join(context.extensionPath))
			],
			enableScripts: true,
			retainContextWhenHidden: true
		});
		//globalState.preProcessVisulizePanel.reveal();
		panelPreprocessVis.webview.html = getPreprocessVisPage();
		panelPreprocessVis.onDidDispose(() => {
			panelPreprocessVis = undefined;
		}, null, context.subscriptions);

		panelPreprocessVis.webview.onDidReceiveMessage((evt) => {
			let res = JSON.parse(evt);
			if (res.webview_ready) {
				let files = fs.readdirSync(path.join(localResourceRoots, 'visualize'));
				let visualize_info:any = [];
				files.forEach(function (item, index) {

					let method_name = '';
					if (item === 'input.png') {
						method_name = 'input';
					}
					else {
						method_name = item.replace('.png', '');
					}
					let this_path = path.join(localResourceRoots, 'visualize', item);
					this_path = replace_file_path(this_path);
					let this_info = {
						'method_name': method_name,
						'file_path': this_path
					};
					visualize_info.push(this_info);

				});
				panelPreprocessVis!.webview.postMessage({
					"visualize_info": visualize_info
				}).then((fullfill) => {
					//fs_extra.removeSync(localResourceRoots);
				});


			}
		});
	}
}

}

export function openLocalFile(filePath: string) {
    // 获取TextDocument对象
    vscode.workspace.openTextDocument(filePath)
        .then(doc => {
            // 在VSCode编辑窗口展示读取到的文本
            vscode.window.showTextDocument(doc, { preview: false });
        }, err => {
            console.log(`Open ${filePath} error, ${err}.`);
        }).then(undefined, err => {
            console.log(`Open ${filePath} error, ${err}.`);
        });
}

export function replace_file_path(this_path: string) {

    return 'https://file%2B.vscode-resource.vscode-webview.net/' + path.resolve(this_path);

    //return vscode.Uri.file(path.resolve(this_path)).with({ scheme: 'vscode-resource' }).toString()
}


// this method is called when your extension is deactivated
export function deactivate() {
	// shutdown local server
	axios.default.post("http://localhost:6003/shutdown");
}