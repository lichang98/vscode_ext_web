// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as axios from 'axios';
// 引入 TreeViewProvider 的类
import { ITEM_ICON_MAP, TreeItemNode, TreeViewProvider,addSlfProj,addSlfFile ,addDarwinFold, addDarwinFiles} from './TreeViewProvider';
import {getConvertorDataPageV2, getConvertorModelPageV2,getConvertorPageV2,getANNSNNConvertPage,getSNNSimuPage,getSNNModelPage} from "./get_convertor_page_v2";
import {getSegDataVisPage, getSegSimulatePage, getANNSNNConvertSegPage} from "./get_seg_pages";
import {getSpeechClsDataPage, getANNSNNConvertSpeechPage, getSNNSimuSpeechPage} from "./get_speech_pages";
import {exec} from "child_process";
import { AssertionError } from 'assert';
const decode = require('audio-decode');

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
	let treeViewSNNModelView = TreeViewProvider.initTreeViewItem("item_snn_model_view");

	let treeviewHome = vscode.window.createTreeView("treeView-item", {treeDataProvider: treeview});
	let treeViewCvtor = vscode.window.createTreeView("item_convertor", {treeDataProvider: treeviewConvertor});
	let treeViewSim = vscode.window.createTreeView("item_simulator", {treeDataProvider:treeViewSimulator});
	let treeViewCvtDarLang = vscode.window.createTreeView("item_darwinLang_convertor", {treeDataProvider:treeViewConvertDarLang});
	let treeViewSNNMD = vscode.window.createTreeView("item_snn_model_view", {treeDataProvider: treeViewSNNModelView});

	let currPanelDisposed:boolean = false;

	function isAllOtherTreeViewInvisible(){
		return !treeviewHome.visible && !treeViewCvtor.visible && !treeViewSim.visible && !treeViewCvtDarLang.visible
					&& !treeViewSNNMD.visible;
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
		if(evt.visible){
			console.log("activity bar 转换图标被点击, treeview convertor 可见...");
			if(currentPanel && currentPanel.title === "模型转换"){
				currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
				treeviewHome.reveal(treeview.data[0]);
			}
		}else{
			setTimeout(()=>{
				if(isAllOtherTreeViewInvisible()){
					if(currentPanel && currentPanel.title === "模型转换"){
						currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
						treeviewHome.reveal(treeview.data[0]);
					}
				}
				treeviewHome.reveal(treeview.data[0]);
			}, 100);
		}
	});
	
	treeViewSim.onDidChangeVisibility((evt)=>{
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

	treeViewSNNMD.onDidChangeVisibility((evt)=>{
		if(evt.visible){
			console.log("SNN模型页面可用！");
			treeviewHome.reveal(treeview.data[0]);
			vscode.commands.executeCommand("snn_model_ac.show_snn_model");
		}else{
			setTimeout(()=>{
				if(isAllOtherTreeViewInvisible()){
					// treeViewSNNMD.reveal(treeViewSNNModelView.data[0]);
					treeviewHome.reveal(treeview.data[0]);
					vscode.commands.executeCommand("snn_model_ac.show_snn_model");
				}else{
					return;
				}
			},100);
		}
	});

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

	let inMemTreeViewStruct:Array<TreeItemNode>=new Array();
	// treeViewBinConvertDarLang.data = inMemTreeViewStruct;
	let X_NORM_DATA_PATH:string|undefined = undefined;
	let X_COLOR_DATA_PATH:string|undefined = undefined; // rgb colored image data, for semantic segmentation task
	let X_ORIGIN_COLOR_DATA_PATH:string| undefined = undefined; // rgb origin un-segmented image or original audio seq for speech classification
	let X_TEST_DATA_PATH:string|undefined = undefined;
	let Y_TEST_DATA_PATH:string|undefined = undefined;
	let ANN_MODEL_FILE_PATH:string|undefined = undefined;

	let DARWIN_LANG_FILE_PATHS:Array<String> = new Array();
	let DARWIN_LANG_BIN_PATHS:Array<String> = new Array();

	let panelDataVis:vscode.WebviewPanel|undefined = undefined;
	let panelAnnModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNVisWeb:vscode.WebviewPanel|undefined = undefined;

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
		// 执行 darwinlang map 生成脚本
		let tmpDarlangWebview = vscode.window.createWebviewPanel("darwin lang", label,vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		tmpDarlangWebview.webview.html = darlangWebContent();
		tmpDarlangWebview.title = label;
		let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out" , path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
		let commandStr: string = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
		exec(commandStr, (err, stdout, stderr)=>{
			tmpDarlangWebview.reveal();
			if(err){
				console.log("执行 load_grph.py 错误："+err);
			}else{
				let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
				let fileSrc = tmpDarlangWebview.webview.asWebviewUri(mapFileDisk).toString();
				tmpDarlangWebview.webview.postMessage({resultUri: fileSrc});
			}
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
		}else if(label === "数据"){
			// 数据可视化
			console.log("单击可视化,数据");
			// vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0]);
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0].children![2]);

		}else if(label === "ANN模型"){
			// ANN模型可视化
			console.log("单击可视化，ANN模型");
			// vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![1]);
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0].children![0]);
		}else if(label === "SNN模型"){
			console.log("SNN模型可视化");
			vscode.commands.executeCommand("snn_model_ac.show_snn_model");
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
		sleep(1000);
		// The code you place here will be executed every time your command is executed
		const columnToShowIn = vscode.window.activeTextEditor? vscode.window.activeTextEditor.viewColumn:undefined;
		treeviewHome.reveal(treeview.data[0]);
		if(currentPanel){
			currentPanel.reveal(columnToShowIn);
		}else{
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			// 主界面由electron 应用启动
			currentPanel.webview.html =getConvertorPageV2();
			bindCurrentPanelReceiveMsg(currentPanel);
		}
		currentPanelInterval = setInterval(()=>{
			if(currPanelDisposed){
				currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
				// 主界面由electron 应用启动
				currentPanel.webview.html =getConvertorPageV2();
				currentPanel.title = "模型转换器";
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
						currentPanel.title = "模型转换器";
					}
				}
			}else if(data.project_info){
				// 接收到webview 项目创建向导的消息，创建新的项目
				console.log("receive project create info");
				console.log("project name: " + data.project_info.project_name+", project type="+data.project_info.project_type
						+", python_type: "+data.project_info.python_type+", ann lib type:"+data.project_info.ann_lib_type);
				fs.open(PROJ_SAVE_PATH!, 'w', 0o777 , (err, fd)=>{
					if(err){
						console.log("创建项目文件错误："+err);
					}
					console.log("创建新项目文件，路径："+PROJ_SAVE_PATH);
				});
				PROJ_DESC_INFO.project_name = data.project_info.project_name;
				PROJ_DESC_INFO.project_type = data.project_info.project_type;
				PROJ_DESC_INFO.python_type = data.project_info.python_type;
				PROJ_DESC_INFO.ann_lib_type = data.project_info.ann_lib_type;
				addSlfProj(data.project_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("模型转换", [
					new TreeItemNode("ANN模型",[]),
					new TreeItemNode("SNN模型", [new TreeItemNode("连接文件", [])]),
					new TreeItemNode("数据", [new TreeItemNode("训练数据", []), new TreeItemNode("测试数据", []), new TreeItemNode("测试数据标签", [])])
				]), new TreeItemNode("模拟器", []), new TreeItemNode("编译映射", [new TreeItemNode("Darwin二进制文件", [new TreeItemNode("模型文件", []), new TreeItemNode("编解码配置文件", [])])])], true, "root"));
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
				PROJ_DESC_INFO.python_type = data.project_refac_info.python_type;
				PROJ_DESC_INFO.ann_lib_type = data.project_refac_info.ann_lib_type;
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

				console.log("Extension 接收到 webview的消息，启动脚本......");
				sleep(1000);
				let scriptPath = undefined;
				if(PROJ_DESC_INFO.project_type === '图像分类'){
					scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""));
				}else if(PROJ_DESC_INFO.project_type === "语义分割"){
					scriptPath = path.join(__dirname, "darwin2sim", "seg_cls_scripts","convert_with_stb.py "+ webParamVthresh+" "+ 
					wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""));
				}else if(PROJ_DESC_INFO.project_type === "语音识别"){
					scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ webParamVthresh+" "+ 
									wevParamNeuronDt+" "+ webParamSynapseDt+" "+webParamDelay+" "+webParamDura+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""))+ " 2";
				}else {
					//TODO Other task type
				}
				let commandStr = PYTHON_INTERPRETER+scriptPath;
				currentPanel?.webview.postMessage(JSON.stringify({"log_output":"模型转换程序启动中......"}));
				let scriptProcess = exec(commandStr,{});
				let logOutputPanel = vscode.window.createOutputChannel("Darwin Convertor");
				logOutputPanel.show();
				
				scriptProcess.stdout?.on("data", function(data){
					logOutputPanel.append(data);
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
					console.log(data);
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
				});
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
			}
		});
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
		if(!currentPanel || currentPanel.title.trim() === "模型转换"){
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
				inMemTreeViewStruct.push(new TreeItemNode(PROJ_DESC_INFO.project_name, [new TreeItemNode("模型转换", [
					new TreeItemNode("ANN模型",[]),
					new TreeItemNode("SNN模型", [new TreeItemNode("连接文件", [])]),
					new TreeItemNode("数据", [new TreeItemNode("训练数据", []), new TreeItemNode("测试数据", []), new TreeItemNode("测试数据标签", [])])
				]), new TreeItemNode("模拟器", []), new TreeItemNode("编译映射", [new TreeItemNode("Darwin二进制文件", [new TreeItemNode("模型文件", []), new TreeItemNode("编解码配置文件", [])])])], true, "root"));
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
					inMemTreeViewStruct[0].children![0].children![2].children![0].children!.push(new TreeItemNode(xNormFileOriginName, undefined, false, "rmable"));
				}
				if(projData.x_test_path){
					inMemTreeViewStruct[0].children![0].children![2].children![1].children!.push(new TreeItemNode(xTestFileOriginName, undefined, false, "rmable"));
				}
				if(projData.y_test_path){
					inMemTreeViewStruct[0].children![0].children![2].children![2].children!.push(new TreeItemNode(yTestFileOriginName, undefined, false, "rmable"));
				}
				// if(projData.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[1]){
				// 	inMemTreeViewStruct[0].children[1].children?.push(new TreeItemNode("model_file_"+path.basename(projData.model_path)));
				// }
				inMemTreeViewStruct[0].children![0].children![0].children!.push(new TreeItemNode("model_file_"+path.basename(projData.model_path)));
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
						inMemTreeViewStruct[0].children![0].children![1].children!.push(new TreeItemNode(fname));
					}else{
						inMemTreeViewStruct[0].children![0].children![1].children![0].children!.push(new TreeItemNode(fname));
					}
				}
				let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
				addSlfFile(path.basename(simuInfoFile));
				inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode(path.basename(simuInfoFile)));

				// ITEM_ICON_MAP.set("SNN二进制模型", "imgs/darwin_icon_model_new.png");
				addDarwinFold("SNN二进制模型");
				// inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));
				for(let i=0;i<DARWIN_LANG_BIN_PATHS.length;++i){
					if(path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("clear") >=0 || 
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("enable") >=0||
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("re_config") >=0||
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("nodelist")>=0||
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("linkout") >=0||
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("layerWidth") >=0 ||
							path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("1_1config.txt") >=0){
								continue;
					}
					if(DARWIN_LANG_BIN_PATHS[i].toString().search("config.b") !== -1){
						addDarwinFiles("config.b");
						inMemTreeViewStruct[0].children![2].children![0].children![0].children!.push(new TreeItemNode("config.b"));
					}else if(DARWIN_LANG_BIN_PATHS[i].toString().search("connfiles") !== -1){
						addDarwinFiles("packed_bin_files.dat");
						inMemTreeViewStruct[0].children![2].children![0].children![1].children!.push(new TreeItemNode("packed_bin_files.dat"));
					}
					// if(inMemTreeViewStruct[0].children){
					// 	var childLen = inMemTreeViewStruct[0].children.length;
					// 	// ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
					// 	if(DARWIN_LANG_BIN_PATHS[i].toString().search("config.b") !== -1){
					// 		addDarwinFiles("config.b");
					// 		inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("config.b"));
					// 	}else if(DARWIN_LANG_BIN_PATHS[i].toString().search("connfiles") !== -1){
					// 		addDarwinFiles("packed_bin_files.dat");
					// 		inMemTreeViewStruct[0].children[childLen-1].children?.push(new TreeItemNode("packed_bin_files.dat"));
					// 	}
					// 	// inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
					// }
				}

				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
			}
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
		PROJ_SAVE_PATH = undefined;
		X_NORM_DATA_PATH = undefined;
		X_COLOR_DATA_PATH = undefined;
		X_ORIGIN_COLOR_DATA_PATH = undefined;
		X_TEST_DATA_PATH = undefined;
		Y_TEST_DATA_PATH = undefined;
		ANN_MODEL_FILE_PATH = undefined;
		DARWIN_LANG_BIN_PATHS.splice(0);
		DARWIN_LANG_FILE_PATHS.splice(0);
		// currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		// // 主界面由electron 应用启动
		// currentPanel.webview.html =getConvertorPageV2();
		// bindCurrentPanelReceiveMsg(currentPanel);
	}));

	let disposableVisCommand = vscode.commands.registerCommand("treeView-item.datavis", (itemNode: TreeItemNode) => {
		console.log("当前可视化目标:"+itemNode.label);
		if(currentPanel){
			// 切换webview
			if(itemNode.label === "数据"){
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
					if(PROJ_DESC_INFO.project_type === '图像分类'){
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
					}
			}else if(itemNode.label === "ANN模型"){
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
			}
		}
		if(itemNode.label === "数据"){
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
				vscode.window.showErrorMessage("请先导入数据！！！");
			}
		}else if(itemNode.label === "ANN模型"){
			if(panelAnnModelVis && ANN_MODEL_FILE_PATH){
				panelAnnModelVis.title = "ANN模型";
				var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
				var commandExe = PYTHON_INTERPRETER+modelVisScriptPath+" "+X_NORM_DATA_PATH+" "+X_TEST_DATA_PATH+" "+Y_TEST_DATA_PATH+" "+ANN_MODEL_FILE_PATH;
				if(PROJ_DESC_INFO.project_type === '语义分割'){
					// FIXME task type
					commandExe += " 1";
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
				vscode.window.showErrorMessage("请先导入ANN模型文件！！！");
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
					X_NORM_DATA_PATH = fileUri[0].fsPath;
					X_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "colorX.npz");
					X_ORIGIN_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "originColorX.npz");
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_norm","imgs/file.png");
					// addSlfFile("x_norm");
					let xNormFileOriginName = path.basename(X_NORM_DATA_PATH);
					addSlfFile(xNormFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![2].children![0].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![2].children![0].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![2].children![0].children!.push(new TreeItemNode(xNormFileOriginName, undefined, false, 'rmable'));
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
					X_TEST_DATA_PATH = fileUri[0].fsPath;
					
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_test","imgs/file.png");
					// addSlfFile("x_test");
					let xTestFileOriginName = path.basename(X_TEST_DATA_PATH);
					addSlfFile(xTestFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![2].children![1].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![2].children![1].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![2].children![1].children!.push(new TreeItemNode(xTestFileOriginName, undefined, false, 'rmable'));
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
					Y_TEST_DATA_PATH = fileUri[0].fsPath;
					// 添加到treeview下
					// FIXME
					// ITEM_ICON_MAP.set("y_test","imgs/file.png");
					// addSlfFile("y_test");
					let yTestFileOriginName = path.basename(Y_TEST_DATA_PATH);
					addSlfFile(yTestFileOriginName);
					if(inMemTreeViewStruct[0].children![0].children![2].children![2].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![2].children![2].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![2].children![2].children!.push(new TreeItemNode(yTestFileOriginName, undefined, false, 'rmable'));
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
					ANN_MODEL_FILE_PATH = fileUri[0].fsPath;
					// 添加到treeview下
					// ITEM_ICON_MAP.set("model_file","imgs/file.png");
					// ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
					addSlfFile(path.basename(ANN_MODEL_FILE_PATH));
					// if(treeview.data[0].children && treeview.data[0].children[1].children){
					// 	treeview.data[0].children[1].children.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH)));
					// 	treeview.refresh();
					// }
					if(inMemTreeViewStruct[0].children![0].children![0].children!.length > 0){
						inMemTreeViewStruct[0].children![0].children![0].children!.splice(0,1);
					}
					inMemTreeViewStruct[0].children![0].children![0].children!.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH), undefined, false, 'rmable'));
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
			// currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
			console.log("title="+currentPanel.title);
			if(currentPanel && currentPanel.title !== "模型转换"){
				console.log("PROJ_DESC_INFO="+PROJ_DESC_INFO);
				if(PROJ_DESC_INFO.project_type === '图像分类'){
					console.log("currentpanel="+currentPanel);
					currentPanel.webview.html = getANNSNNConvertPage();
				}else if(PROJ_DESC_INFO.project_type === "语义分割"){
					console.log("currentpanel  2="+currentPanel);
					currentPanel.webview.html = getANNSNNConvertSegPage();
				}else if(PROJ_DESC_INFO.project_type === "语音识别"){
					console.log("语音识别模型转换界面");
					currentPanel.webview.html = getANNSNNConvertSpeechPage();
				}
				currentPanel.reveal();
				currentPanel.title = "模型转换";
				console.log("显示currentpane  模型转换   1");
			}else if(currentPanel){
				currentPanel.reveal();
			}
		}
	});

	// 启动显示SNN模型的命令
	vscode.commands.registerCommand("snn_model_ac.show_snn_model", ()=>{
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
			vscode.window.showErrorMessage("请先完成转换步骤！！！");
			return;
		}
		// 执行 darwinlang map 生成脚本
		let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out" , path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
		let commandStr: string = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
		exec(commandStr, function (err, stdout, stderr) {
			if(err){
				console.log("执行 load_graph.py 错误：" + err);
			}else{
				// 读取map 文件
				console.log("向SNN模型界面发送 snn_map 数据....");
				let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
				let fileSrc = panelSNNVisWeb!.webview.asWebviewUri(mapFileDisk).toString();
				panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_map": fileSrc})).then((fullfill)=>{
					console.log("snn_map 数据postmsg fullfill: "+fullfill);
					let snnModelInfoData = fs.readFileSync(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"));
					console.log("加载完毕snn 模型数据.....");
					panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_info": snnModelInfoData.toString()})).then((fullfill)=>{
						console.log("snn_info 数据postmsg fullfill: "+fullfill);
					}, (reject)=>{
						console.log("snn_info 数据postmsg reject :"+reject);
					});
				}, (reject)=>{
					console.log("snn_map 数据postmsg reject :"+reject);
				});
			}
		});
	});

	// 启动仿真
	vscode.commands.registerCommand("item_simulator.start_simulate", ()=>{
		if(panelSNNModelVis){
			panelSNNModelVis.dispose();
			panelSNNModelVis = undefined;
		}
		if(!panelSNNModelVis){
			panelSNNModelVis = vscode.window.createWebviewPanel("snnvis", "SNN仿真",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			panelSNNModelVis.onDidDispose(()=>{
				panelSNNModelVis = undefined;
			},null, context.subscriptions);

			panelSNNModelVis.webview.onDidReceiveMessage((evt)=>{
				if(DARWIN_LANG_FILE_PATHS.length === 0){
					vscode.window.showErrorMessage("请先完成转换步骤！！！");
					return;
				}
				let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
				addSlfFile(path.basename(simuInfoFile));
				if(inMemTreeViewStruct[0].children![1].children!.length > 0){
					inMemTreeViewStruct[0].children![1].children!.splice(0,1);
				}
				inMemTreeViewStruct[0].children![1].children!.push(new TreeItemNode(path.basename(simuInfoFile)));
				treeview.data = inMemTreeViewStruct;
				treeview.refresh();
				console.log("extension 接收到 snn 仿真界面ready 消息.");
				let data = JSON.parse(evt);
				if(data.snn_simulate_ready){
					// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
					console.log("SNN仿真界面就绪.....");
					fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
						if(panelSNNModelVis){
							if(PROJ_DESC_INFO.project_type === "图像分类" || PROJ_DESC_INFO.project_type === "语义分割") {
								console.log("SNN仿真界面发送 snn_info 数据....");
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
			if(PROJ_DESC_INFO.project_type === '图像分类'){
				panelSNNModelVis.webview.html = getSNNSimuPage();
			}else if(PROJ_DESC_INFO.project_type === '语义分割'){
				panelSNNModelVis.webview.html = getSegSimulatePage();
			}else if(PROJ_DESC_INFO.project_type === "语音识别") {
				panelSNNModelVis.webview.html = getSNNSimuSpeechPage();
			}
			panelSNNModelVis.title = "SNN仿真";
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
			inMemTreeViewStruct[0].children![0].children![1].children!.splice(1);
			inMemTreeViewStruct[0].children![0].children![1].children![0].children!.splice(0);
			fs.readdir(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out"), (err, files) => {
				files.forEach(file=>{
					DARWIN_LANG_FILE_PATHS.push(path.join(__dirname, "darwin2sim","model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "darlang_out", file));
					addDarwinFiles(file);
					if(file.indexOf("json") !==-1){
						inMemTreeViewStruct[0].children![0].children![1].children!.push(new TreeItemNode(file));
					}else{
						inMemTreeViewStruct[0].children![0].children![1].children![0].children!.push(new TreeItemNode(file));
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
		if(DARWIN_LANG_FILE_PATHS.length === 0){
			vscode.window.showErrorMessage("请先完成转换步骤！！！");
			return;
		}
		if(!ITEM_ICON_MAP.has("SNN二进制模型")){
			addSlfFile("SNN二进制模型");
		}

		let genScript = path.join(__dirname, "darwin2sim", "gen_darwin2_bin_files.py");
		let cmdStr = PYTHON_INTERPRETER+" "+genScript+" "+path.basename(PROJ_SAVE_PATH!).replace("\.dar2", "")+" "+path.join(path.dirname(PROJ_SAVE_PATH!), "packed_bin_files.dat");
		vscode.window.showInformationMessage("二进制文件生成中，请稍等......");
		exec(cmdStr, (err, stdout, stderr)=>{
			if(err){
				console.log("执行darwin2二进制部署文件错误...");
				vscode.window.showErrorMessage("二进制文件生成错误!!!");
			}else{
				fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""),"bin_darwin_out", "config.b"),
								path.join(path.dirname(PROJ_SAVE_PATH!), "config.b"));
				DARWIN_LANG_BIN_PATHS.splice(0);
				inMemTreeViewStruct[0].children![2].children![0].children![0].children!.splice(0);
				inMemTreeViewStruct[0].children![2].children![0].children![1].children!.splice(0);
				fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out"), (err, files)=>{
					files.forEach(file => {
						if(file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1){
							DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH!).replace("\.dar2",""), "bin_darwin_out", file));
							if(file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
										file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1){
								if(file.search("config.b") !== -1){
									addDarwinFiles("config.b");
									inMemTreeViewStruct[0].children![2].children![0].children![0].children!.push(new TreeItemNode("config.b"));
								}else if(file.search("connfiles") !==-1){
									addDarwinFiles("packed_bin_files.dat");
									inMemTreeViewStruct[0].children![2].children![0].children![1].children!.push(new TreeItemNode("packed_bin_files.dat"));
								}
							}
						}
						treeview.data = inMemTreeViewStruct;
						treeview.refresh();
					});
					autoSaveWithCheck();
					vscode.window.showInformationMessage("二进制文件生成结束!");
				});
			}
		});
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

	vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin3", function(){
		console.log("目标转换为darwin3二进制文件");
		vscode.window.showWarningMessage("目前尚不支持darwin3!");
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
				"darwinlang_bin_paths":DARWIN_LANG_BIN_PATHS
			};
			fs.writeFileSync(PROJ_SAVE_PATH!, JSON.stringify(projInfoData));
		}
	}

}

// this method is called when your extension is deactivated
export function deactivate() {
	// shutdown local server
	axios.default.post("http://localhost:6003/shutdown");
}