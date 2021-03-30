// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as axios from 'axios';
// 引入 TreeViewProvider 的类
import { ITEM_ICON_MAP, TreeItemNode, TreeViewProvider,addSlfProj,addSlfFile ,addDarwinFold, addDarwinFiles} from './TreeViewProvider';
import {ITEM_ICON_MAP_DARLANG, TreeItemNodeDarLang, TreeViewProviderDarLang} from "./TreeViewProviderDarLang";
import { TreeViewProviderData } from "./TreeViewData";
import { TreeViewProviderModel } from "./TreeViewModel";
import {NewProj} from "./NewProjWebView";
import {ImportDataShow} from "./ImportDataView";
import {MultiLevelTreeProvider} from "./multiLevelTree";
import {getMainPageV2} from "./get_mainpage_v2";
import {getConvertorDataPageV2, getConvertorModelPageV2,getConvertorPageV2,getANNSNNConvertPage,getSNNSimuPage,getSNNModelPage} from "./get_convertor_page_v2";
import {ChildProcess, exec, spawn} from "child_process";
import { time } from 'console';
import { eventNames } from 'process';


let local_server:ChildProcess|undefined = undefined;

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
	let treeViewNewProj = TreeViewProvider.initTreeViewItem("new_project_act_view-item");
	let treeViewLoadProj = TreeViewProvider.initTreeViewItem("load_proj_act_view-item");
	// let treeViewBinConvertDarLang = TreeViewProvider.initTreeViewItem("item_bin_darwinlang_convertor");

	let treeviewHome = vscode.window.createTreeView("treeView-item", {treeDataProvider: treeview});
	let treeViewCvtor = vscode.window.createTreeView("item_convertor", {treeDataProvider: treeviewConvertor});
	let treeViewSim = vscode.window.createTreeView("item_simulator", {treeDataProvider:treeViewSimulator});
	let treeViewCvtDarLang = vscode.window.createTreeView("item_darwinLang_convertor", {treeDataProvider:treeViewConvertDarLang});
	let treeViewSNNMD = vscode.window.createTreeView("item_snn_model_view", {treeDataProvider: treeViewSNNModelView});
	let treeViewNPView = vscode.window.createTreeView("new_project_act_view-item", {treeDataProvider: treeViewNewProj});
	let treeViewProjLoadView = vscode.window.createTreeView("load_proj_act_view-item",{treeDataProvider: treeViewLoadProj});

	function is_all_invisible(){
		return !treeviewHome.visible && !treeViewCvtor.visible && !treeViewSim.visible && !treeViewCvtDarLang.visible
					&& !treeViewSNNMD.visible && !treeViewNPView.visible && !treeViewProjLoadView.visible;
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
		// if(evt.visible){
		// 	console.log("转换器页面可用!");
		// 	if(currentPanel && currentPanel.title !== "模型转换"){
		// 		currentPanel.webview.html = getANNSNNConvertPage();
		// 		currentPanel.reveal();
		// 		currentPanel.title = "模型转换";
		// 		console.log("显示currentpane  模型转换   1");
		// 	}else if(currentPanel){
		// 		currentPanel.reveal();
		// 	}
		// 	treeviewHome.reveal(treeview.data[0]);
		// 	// // 点击转换器快捷方式，启动模型转换
		// 	// vscode.commands.executeCommand("item_convertor.start_convert");
		// }else{
		// 	setTimeout(()=>{
		// 		if(is_all_invisible()){
		// 			if(currentPanel && currentPanel.title !== "模型转换"){
		// 				currentPanel.webview.html = getANNSNNConvertPage();
		// 				currentPanel.reveal();
		// 				currentPanel.title = "模型转换";
		// 				console.log("显示currentpane  模型转换 2");
		// 			}else if(currentPanel){
		// 				currentPanel.reveal();
		// 			}
		// 			treeviewHome.reveal(treeview.data[0]);
		// 			// treeViewCvtor.reveal(treeviewConvertor.data[0]);
		// 		}
		// 	}, 100);
		// }
		if(evt.visible){
			console.log("activity bar 转换图标被点击, treeview convertor 可见...");
			if(currentPanel && currentPanel.title === "模型转换"){
				currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
				treeviewHome.reveal(treeview.data[0]);
			}
		}else{
			setTimeout(()=>{
				if(is_all_invisible()){
					if(currentPanel && currentPanel.title === "模型转换"){
						currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
						treeviewHome.reveal(treeview.data[0]);
					}
				}
				treeviewHome.reveal(treeview.data[0]);
			}, 100);
		}
	});

	treeViewNPView.onDidChangeVisibility((evt)=>{
		if(evt.visible){
			console.log("新项目创建...");
			vscode.commands.executeCommand("treeView-item.newproj");
			treeviewHome.reveal(treeview.data[0]);
		}else{
			setTimeout(()=>{
				if(is_all_invisible()){
					// treeViewNPView.reveal(treeViewNewProj.data[0]);
					treeviewHome.reveal(treeview.data[0]);
					vscode.commands.executeCommand("treeView-item.newproj");
				}else{
					return;
				}
			},100);
			console.log("创建新项目隐藏...");
		}
	});

	treeViewProjLoadView.onDidChangeVisibility((evt)=>{
		if(evt.visible){
			console.log("加载已有项目....");
			console.log("加载已有项目 命令执行..");
			vscode.commands.executeCommand("treeView.proj_load");
			treeviewHome.reveal(treeview.data[0]);
		}else{
			setTimeout(()=>{
				if(is_all_invisible()){
					console.log("加载已有项目  reveal..");
					treeviewHome.reveal(treeview.data[0]);
					// treeViewProjLoadView.reveal(treeViewLoadProj.data[0]);
					console.log("加载已有项目 命令执行..");
					vscode.commands.executeCommand("treeView.proj_load");
				}else{
					console.log("加载已有项目 隐藏...");
					return;
				}
			},100);
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
				if(is_all_invisible()){
					// treeViewSim.reveal(treeViewSimulator.data[0]);
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
				if(is_all_invisible()){
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
			// vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
			vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
		}else{
			setTimeout(()=>{
				if(is_all_invisible()){
					// treeViewCvtDarLang.reveal(treeViewConvertDarLang.data[0]);
					treeviewHome.reveal(treeview.data[0]);
					//启动转换生成darwinlang
					// vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
					vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
				}
			},100);
		}
	});

	let inMemTreeViewStruct:Array<TreeItemNode>=new Array();
	// treeViewBinConvertDarLang.data = inMemTreeViewStruct;
	let x_norm_data_path:string|undefined = undefined;
	let x_test_data_path:string|undefined = undefined;
	let y_test_data_path:string|undefined = undefined;
	let model_file_path:string|undefined = undefined;

	let darwinlang_file_paths:Array<String> = new Array();
	let darwinlang_bin_paths:Array<String> = new Array();

	let panelDataVis:vscode.WebviewPanel|undefined = undefined;
	let panelAnnModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNVisWeb:vscode.WebviewPanel|undefined = undefined;

	let proj_desc_info = {
		"project_name":"",
		"project_type":"",
		"python_type":"",
		"ann_lib_type":""
	};
	let proj_save_path:string|undefined = undefined;
	vscode.window.registerTreeDataProvider("multiLevelTree", new MultiLevelTreeProvider());

	context.subscriptions.push(vscode.commands.registerCommand("treeView.edit_file", (treeItem: TreeItemNode)=>{
		// 编辑darwinlang
		let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"darlang_out",treeItem.label));
		vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
			vscode.window.showTextDocument(doc, 1,false).then(ed=>{
				ed.edit(edit=>{
				});
			});
		}, (err)=>{
			console.log(err);
		});
	}));
    
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
		// vscode.window.showInformationMessage(label);
		console.log("label is :["+label+"]");
		if(label.search("json") !== -1){
			// 显示可视化的darwin snn 模型结构


		// 执行 darwinlang map 生成脚本
		let tmp_darlang_webview = vscode.window.createWebviewPanel("darwin lang", label,vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		tmp_darlang_webview.webview.html = darlangWebContent();
		tmp_darlang_webview.title = "darwin lang";
		let target_darlang_file_path = path.join(__dirname, "darwin2sim", "model_out" , path.basename(proj_save_path!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
		let command_str: string = "python " + path.join(__dirname, "load_graph.py") + " " + target_darlang_file_path + " " + path.join(__dirname);
		exec(command_str, (err, stdout, stderr)=>{
			tmp_darlang_webview.reveal();
			if(err){
				console.log("执行 load_grph.py 错误："+err);
			}else{
				let map_file_disk = vscode.Uri.file(path.join(__dirname, "map.json"));
				let file_src = tmp_darlang_webview.webview.asWebviewUri(map_file_disk).toString();
				tmp_darlang_webview.webview.postMessage({resultUri: file_src});
			}
		});
		// exec(command_str, function (err, stdout, stderr) {
		// 	if(err){
		// 		console.log("执行 load_graph.py 错误：" + err);
		// 	}else{
		// 		// 读取map 文件
		// 		let map_file_disk = vscode.Uri.file(path.join(__dirname, "map.json"));
		// 		let file_src = panelSNNVisWeb!.webview.asWebviewUri(map_file_disk).toString();

		// 		panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_map": file_src}));
		// 	}
		// });


			// // 显示darlang文件
			// console.log("显示转换后的darwinLang");
			// let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"darlang_out",label));
			// vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
			// 	vscode.window.showTextDocument(doc, 1,false).then(ed=>{
			// 		ed.edit(edit=>{
			// 		});
			// 	});
			// }, (err)=>{
			// 	console.log(err);
			// });
		}else if(label.search("txt") !== -1){
			// 显示二进制的darlang文件
			console.log("显示二进制的darwinLang");
			let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"bin_darwin_out",label));
			vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
				vscode.window.showTextDocument(doc, 1,false).then(ed=>{
					ed.edit(edit=>{
					});
				});
			}, (err)=>{
				console.log(err);
			});
		}else if(label.search("config.b") !== -1){
			console.log("解析显示1_1config.b 文件内容");
			let target_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"bin_darwin_out", "1_1config.txt");
			vscode.workspace.openTextDocument(target_file_path).then((doc:vscode.TextDocument) => {
				vscode.window.showTextDocument(doc, 1, false);
			});
		}else if(label.search(".pickle") !== -1 && label.search("layer") === -1){
			// 显示pickle 文件的原始内容
			console.log("解析并显示pickle 文件内容");
			// let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label));
			let target_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"bin_darwin_out", "inputs",label);
			var modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
			var command_str = "python "+modelVisScriptPath + " "+ target_file_path;
			exec(command_str, function(err, stdout, stderr){
				console.log("pickle 文件解析结束");
				let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
				vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
					vscode.window.showTextDocument(doc, 1, false).then(ed=>{
						ed.edit(edit=>{});
					});
				});
				vscode.workspace.onDidCloseTextDocument(evt=>{
					console.log(evt.fileName+" [is closed");
					let target_file = evt.fileName;
					target_file = target_file.replace("\.git","");
					fs.unlink(target_file,()=>{});
				});
			});
		} else if(label.search("layer") !== -1){
			// 显示layer之间连接pickle文件的原始内容
			console.log("显示layer 连接pickle文件");
			let target_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"darlang_out", label);
			let modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
			let command_str = "python "+modelVisScriptPath+" "+target_file_path;
			exec(command_str, function(err, stdout, stderr){
				console.log("layer 连接pickle 文件 "+label+" 解析结束");
				let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
				vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
					vscode.window.showTextDocument(doc, 1, false);
				});
			});
		} else if(label.search(".png") !== -1){
			console.log("显示图片");
			let imgPreviewPanel:vscode.WebviewPanel|undefined = vscode.window.createWebviewPanel("darwin2web", label,vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			imgPreviewPanel.webview.html=`
			<!DOCTYPE html>
			<html style="height: 100%;width: 100%;">

			<head>
			<meta charset="UTF-8">
			</head>

			<body>
				<img id="sample_img" style="margin:auto;position: absolute;top: 0;left: 0;right: 0;bottom: 0;" 
				src="${imgPreviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,
					"dist", "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""),"bin_darwin_out", "inputs", label)))}" onmousewheel="return bigimg(this)">
			</body>
			<script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
			<script>
			function bigimg(obj){
				var zoom = parseInt(obj.style.zoom,10)||100;
				zoom += event.wheelDelta / 12;
				if(zoom > 0 )
					obj.style.zoom=zoom+'%';
				return false;
			}
			</script>
			</html>
			`;
			imgPreviewPanel.onDidDispose(()=>{
				imgPreviewPanel = undefined;
			}, null, context.subscriptions);
			imgPreviewPanel.reveal();
		}else if(label === "数据"){
			// 数据可视化
			console.log("单击可视化,数据");
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0]);

		}else if(label === "ANN模型"){
			// ANN模型可视化
			console.log("单击可视化，ANN模型");
			vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![1]);
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

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
		// 启动后台资源server
		let scriptPath = path.join(__dirname,"inner_scripts","img_server.py");
		let command_str = "python "+scriptPath;
		console.log("prepare to start img server.");
		local_server = exec(command_str, function(err, stdout, stderr){
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
			currentPanel.webview.onDidReceiveMessage(function(msg){
				console.log("Receive message: "+msg);
				let data = JSON.parse(msg);
				if(data.click){
					console.log("Click message, val is: "+data.click);
					if(data.click === "convertor_page"){
						console.log("Jump to convertor page");
						if(currentPanel){
							currentPanel.webview.html = getConvertorPageV2();
							currentPanel.title = "转换器";
						}
					}
				}else if(data.project_info){
					// 接收到webview 项目创建向导的消息，创建新的项目
					console.log("receive project create info");
					console.log("project name: " + data.project_info.project_name+", project type="+data.project_info.project_type
							+", python_type: "+data.project_info.python_type+", ann lib type:"+data.project_info.ann_lib_type);
					proj_desc_info.project_name = data.project_info.project_name;
					proj_desc_info.project_type = data.project_info.project_type;
					proj_desc_info.python_type = data.project_info.python_type;
					proj_desc_info.ann_lib_type = data.project_info.ann_lib_type;
					addSlfProj(data.project_info.project_name);
					inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("数据", 
							[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])], true));
					treeview.data = inMemTreeViewStruct;
					treeviewConvertor.data = inMemTreeViewStruct;
					treeViewSimulator.data = inMemTreeViewStruct;
					treeViewConvertDarLang.data = inMemTreeViewStruct;
					treeViewSNNModelView.data = inMemTreeViewStruct;
					treeViewNewProj.data = inMemTreeViewStruct;
					treeViewLoadProj.data = inMemTreeViewStruct;
					treeview.refresh();
					treeviewConvertor.refresh();
					treeViewSimulator.refresh();
					treeViewConvertDarLang.refresh();
					treeViewSNNModelView.refresh();
					treeViewNewProj.refresh();
					treeViewLoadProj.refresh();
					// treeViewBinConvertDarLang.refresh();
				}else if(data.project_refac_info){
					// 接收到webview 项目属性修改的信息
					console.log("receive project refactor info");
					proj_desc_info.project_name = data.project_refac_info.project_name;
					proj_desc_info.project_type = data.project_refac_info.project_type;
					proj_desc_info.python_type = data.project_refac_info.python_type;
					proj_desc_info.ann_lib_type = data.project_refac_info.ann_lib_type;
					let treeItemsSize = inMemTreeViewStruct.length;
					inMemTreeViewStruct[treeItemsSize-1].label = proj_desc_info.project_name;
					treeview.data = inMemTreeViewStruct;
					treeviewConvertor.data = inMemTreeViewStruct;
					treeViewSimulator.data = inMemTreeViewStruct;
					treeViewConvertDarLang.data = inMemTreeViewStruct;
					treeViewSNNModelView.data = inMemTreeViewStruct;
					treeViewNewProj.data = inMemTreeViewStruct;
					treeViewLoadProj.data = inMemTreeViewStruct;
					treeview.refresh();
					treeviewConvertor.refresh();
					treeViewSimulator.refresh();
					treeViewConvertDarLang.refresh();
					treeViewSNNModelView.refresh();
					treeViewNewProj.refresh();
					treeViewLoadProj.refresh();
					// treeViewBinConvertDarLang.refresh();
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
					let web_param_vthresh = data.model_convert_params.vthresh;
					let web_param_neurondt = data.model_convert_params.neuron_dt;
					let web_param_synapse_dt = data.model_convert_params.synapse_dt;
					let web_param_delay = data.model_convert_params.delay;
					let web_param_dura = data.model_convert_params.dura;

					console.log("Extension 接收到 webview的消息，启动脚本......");
					sleep(1000);
					let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ web_param_vthresh+" "+ 
									web_param_neurondt+" "+ web_param_synapse_dt+" "+web_param_delay+" "+web_param_dura+" "+path.basename(proj_save_path!).replace("\.dar2",""));
					let command_str = "python "+scriptPath;
					currentPanel?.webview.postMessage(JSON.stringify({"log_output":"模型转换程序启动中......"}));
					let log_output_channel = vscode.window.createOutputChannel("Darwin Convertor");
					log_output_channel.show();
					let scriptProcess = exec(command_str,{});
					
					scriptProcess.stdout?.on("data", function(data){
						// console.log(data);
						log_output_channel.append(data);
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
							let formatted_data = data.split("\r\n").join("<br/>");
							currentPanel.webview.postMessage(JSON.stringify({"log_output":formatted_data}));
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
							fs.readFile(path.join(__dirname, "darwin2sim","target",path.basename(proj_save_path!).replace("\.dar2",""),"log","gui","test","normalization","99.9.json"),"utf-8", (evt, data)=>{
								if(currentPanel){
									currentPanel.webview.postMessage(JSON.stringify({"scale_factors":data}));
								}
							});
							vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
							// vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
									// 							// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
									// fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
									// 	if(panelSNNModelVis){
									// 		panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
									// 	}
									// });
						}
					});
				}else if(data.select_save_proj_path_req){
					// 选择项目的保存路径
					console.log("select path for saving project, proj name="+data.select_save_proj_path_req);
					const options:vscode.OpenDialogOptions = {
						canSelectFiles:false,
						canSelectFolders:true,
						openLabel:"选择目录",
						title:"选择项目保存位置"
					};
					vscode.window.showOpenDialog(options).then(fileUri => {
						if(fileUri){
							console.log("选择的项目保存路径为："+fileUri[0].fsPath);
							proj_save_path = path.join(fileUri[0].fsPath, data.select_save_proj_path_req+".dar2");
							if(currentPanel){
								console.log("发送保存路径到webview..., 路径="+proj_save_path);
								fs.open(proj_save_path, 'w', 0o777, (err, fd)=>{
									if(err){
										console.log("创建项目文件错误："+err);
									}
									console.log("创建新项目文件，路径："+proj_save_path);
								});
								currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": proj_save_path}));
							}
						}
					});
					// const options:vscode.SaveDialogOptions = {
					// 	saveLabel: "确认保存路径",
					// 	filters:{"Darwin2 Project":['dar2']},
					// 	defaultUri:vscode.Uri.file(path.join("C:\\", data.select_save_proj_path_req+".dar2"))
					// };
					// vscode.window.showSaveDialog(options).then(fileUri => {
					// 	if(fileUri){
					// 		console.log("Selected path for saving project is: "+fileUri.fsPath);
					// 		proj_save_path = fileUri.fsPath; // 记录项目保存路径
					// 		// 返回给webview 选择的目标路径
					// 		if(currentPanel){
					// 			console.log("发送保存路径到webview..., 路径="+fileUri.fsPath);
					// 			currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": fileUri.fsPath}));
					// 		}
					// 	}
					// });
				}
			});
		}
	});

	function initCurrentPanel(){
		currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
		// 主界面由electron 应用启动
		currentPanel.webview.html =getConvertorPageV2();
		currentPanel.webview.onDidReceiveMessage(function(msg){
			console.log("Receive message: "+msg);
			let data = JSON.parse(msg);
			if(data.click){
				console.log("Click message, val is: "+data.click);
				if(data.click === "convertor_page"){
					console.log("Jump to convertor page");
					if(currentPanel){
						currentPanel.webview.html = getConvertorPageV2();
						currentPanel.title = "转换器";
					}
				}
			}else if(data.project_info){
				// 接收到webview 项目创建向导的消息，创建新的项目
				console.log("receive project create info");
				console.log("project name: " + data.project_info.project_name+", project type="+data.project_info.project_type
						+", python_type: "+data.project_info.python_type+", ann lib type:"+data.project_info.ann_lib_type);
				proj_desc_info.project_name = data.project_info.project_name;
				proj_desc_info.project_type = data.project_info.project_type;
				proj_desc_info.python_type = data.project_info.python_type;
				proj_desc_info.ann_lib_type = data.project_info.ann_lib_type;
				addSlfProj(data.project_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("数据", 
						[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
						new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])], true));
				treeview.data = inMemTreeViewStruct;
				treeviewConvertor.data = inMemTreeViewStruct;
				treeViewSimulator.data = inMemTreeViewStruct;
				treeViewConvertDarLang.data = inMemTreeViewStruct;
				treeViewSNNModelView.data = inMemTreeViewStruct;
				treeViewNewProj.data = inMemTreeViewStruct;
				treeViewLoadProj.data = inMemTreeViewStruct;
				treeview.refresh();
				treeviewConvertor.refresh();
				treeViewSimulator.refresh();
				treeViewConvertDarLang.refresh();
				treeViewSNNModelView.refresh();
				treeViewNewProj.refresh();
				treeViewLoadProj.refresh();
				// treeViewBinConvertDarLang.refresh();
			}else if(data.project_refac_info){
				// 接收到webview 项目属性修改的信息
				console.log("receive project refactor info");
				proj_desc_info.project_name = data.project_refac_info.project_name;
				proj_desc_info.project_type = data.project_refac_info.project_type;
				proj_desc_info.python_type = data.project_refac_info.python_type;
				proj_desc_info.ann_lib_type = data.project_refac_info.ann_lib_type;
				let treeItemsSize = inMemTreeViewStruct.length;
				inMemTreeViewStruct[treeItemsSize-1].label = proj_desc_info.project_name;
				treeview.data = inMemTreeViewStruct;
				treeviewConvertor.data = inMemTreeViewStruct;
				treeViewSimulator.data = inMemTreeViewStruct;
				treeViewConvertDarLang.data = inMemTreeViewStruct;
				treeViewSNNModelView.data = inMemTreeViewStruct;
				treeViewNewProj.data = inMemTreeViewStruct;
				treeViewLoadProj.data = inMemTreeViewStruct;
				treeview.refresh();
				treeviewConvertor.refresh();
				treeViewSimulator.refresh();
				treeViewConvertDarLang.refresh();
				treeViewSNNModelView.refresh();
				treeViewNewProj.refresh();
				treeViewLoadProj.refresh();
				// treeViewBinConvertDarLang.refresh();
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
				let web_param_vthresh = data.model_convert_params.vthresh;
				let web_param_neurondt = data.model_convert_params.neuron_dt;
				let web_param_synapse_dt = data.model_convert_params.synapse_dt;
				let web_param_delay = data.model_convert_params.delay;
				let web_param_dura = data.model_convert_params.dura;

				console.log("Extension 接收到 webview的消息，启动脚本......");
				sleep(1000);
				let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py "+ web_param_vthresh+" "+ 
								web_param_neurondt+" "+ web_param_synapse_dt+" "+web_param_delay+" "+web_param_dura+" "+path.basename(proj_save_path!).replace("\.dar2",""));
				let command_str = "python "+scriptPath;
				currentPanel?.webview.postMessage(JSON.stringify({"log_output":"模型转换程序启动中......"}));
				let scriptProcess = exec(command_str,{});
				let log_output_panel = vscode.window.createOutputChannel("Darwin Convertor");
				log_output_panel.show();
				
				scriptProcess.stdout?.on("data", function(data){
					log_output_panel.append(data);
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
						let formatted_data = data.split("\r\n").join("<br/>");
						currentPanel.webview.postMessage(JSON.stringify({"log_output":formatted_data}));
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
						vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
						// vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
								// 							// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
								// fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
								// 	if(panelSNNModelVis){
								// 		panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
								// 	}
								// });
					}
				});
			}else if(data.select_save_proj_path_req){
				// 选择项目的保存路径
				console.log("select path for saving project, proj name="+data.select_save_proj_path_req);
				const options:vscode.OpenDialogOptions = {
					canSelectFiles:false,
					canSelectFolders:true,
					openLabel:"选择目录",
					title:"选择项目保存位置"
				};
				vscode.window.showOpenDialog(options).then(fileUri => {
					if(fileUri){
						console.log("选择的项目保存路径为："+fileUri[0].fsPath);
						proj_save_path = path.join(fileUri[0].fsPath, data.select_save_proj_path_req+".dar2");
						if(currentPanel){
							console.log("发送保存路径到webview..., 路径="+proj_save_path);
							fs.open(proj_save_path, 'w', 0o777 , (err, fd)=>{
								if(err){
									console.log("创建项目文件错误："+err);
								}
								console.log("创建新项目文件，路径："+proj_save_path);
							});
							currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": proj_save_path}));
						}
					}
				});
				// const options:vscode.SaveDialogOptions = {
				// 	saveLabel: "确认保存路径",
				// 	filters:{"Darwin2 Project":['dar2']},
				// 	defaultUri:vscode.Uri.file(path.join("C:\\", data.select_save_proj_path_req+".dar2"))
				// };
				// vscode.window.showSaveDialog(options).then(fileUri => {
				// 	if(fileUri){
				// 		console.log("Selected path for saving project is: "+fileUri.fsPath);
				// 		proj_save_path = fileUri.fsPath; // 记录项目保存路径
				// 		// 返回给webview 选择的目标路径
				// 		if(currentPanel){
				// 			console.log("发送保存路径到webview..., 路径="+fileUri.fsPath);
				// 			currentPanel.webview.postMessage(JSON.stringify({"proj_select_path": fileUri.fsPath}));
				// 		}
				// 	}
				// });
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
		console.log("项目属性修改");
		// 发消息到webview
		if(currentPanel){
			currentPanel.webview.postMessage({"command":"ProjectRefactor", "project_desc":proj_desc_info});
		}
	}));

	//项目保存
	context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_save",()=>{
		const options:vscode.SaveDialogOptions = {
			saveLabel:"保存项目",
			filters:{"Darwin2 Project":['dar2']},
			defaultUri:vscode.Uri.file(proj_save_path!)
		};
		vscode.window.showSaveDialog(options).then(fileUri => {
			if(fileUri && fileUri){
				console.log("selected path: "+fileUri.fsPath);
				// TODO 写入项目信息
				let data= {
					"proj_info":proj_desc_info,
					"x_norm_path":x_norm_data_path,
					"x_test_path":x_test_data_path,
					"y_test_path":y_test_data_path,
					"model_path":model_file_path,
					"darwinlang_file_paths":darwinlang_file_paths,
					"darwinlang_bin_paths":darwinlang_bin_paths
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
				proj_save_path = fileUri[0].fsPath;
				let data = fs.readFileSync(fileUri[0].fsPath);
				console.log("读取的信息：proj_info="+data);
				let proj_data = JSON.parse(data.toString());
				proj_desc_info = proj_data.proj_info;
				x_norm_data_path = proj_data.x_norm_path;
				x_test_data_path = proj_data.x_test_path;
				y_test_data_path = proj_data.y_test_path;
				model_file_path = proj_data.model_path;
				darwinlang_file_paths = proj_data.darwinlang_file_paths;
				darwinlang_bin_paths = proj_data.darwinlang_bin_paths;
				console.log("导入工程的x_norm 文件路径为："+x_norm_data_path);
				if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2","")))){
					fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2","")));
				}
				let target_proj_name = path.basename(proj_save_path).replace("\.dar2","");
				if(x_norm_data_path){
					fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name,"x_norm.npz"),function(err){
					});
				}
				if(x_test_data_path){
					fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name,"x_test.npz"),function(err){
					});
				}
				if(y_test_data_path){
					fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name,"y_test.npz"), function(err){
					});
				}
				if(model_file_path){
					fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", target_proj_name,"mnist_cnn.h5"),function(err){
					});
				}
				// 显示treeview
				addSlfProj(proj_desc_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(proj_desc_info.project_name, [new TreeItemNode("数据", 
							[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])], true));
				addSlfFile("x_norm");
				addSlfFile("x_test");
				addSlfFile("y_test");
				addSlfFile(path.basename(proj_data.model_path));
				if(proj_data.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[0].children){
					if(inMemTreeViewStruct[0].children[0].children[0].children){
						inMemTreeViewStruct[0].children[0].children[0].children.push(new TreeItemNode("x_norm"));
					}
					if(inMemTreeViewStruct[0].children[0].children[1].children){
						inMemTreeViewStruct[0].children[0].children[1].children.push(new TreeItemNode("x_test"));
					}
					if(inMemTreeViewStruct[0].children[0].children[2].children){
						inMemTreeViewStruct[0].children[0].children[2].children.push(new TreeItemNode("y_test"));
					}
				}
				if(proj_data.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[1]){
					inMemTreeViewStruct[0].children[1].children?.push(new TreeItemNode("model_file_"+path.basename(proj_data.model_path)));
				}
				// add darwinlang and bin files
				// ITEM_ICON_MAP.set("SNN模型","imgs/darwin_icon_model_new.png");
				addDarwinFold("SNN模型");
				inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN模型",[]));
				for(let i=0;i<darwinlang_file_paths.length;++i){
					// ITEM_ICON_MAP.set(path.basename(darwinlang_file_paths[i].toString()),"imgs/data_file_icon_new.png");
					addDarwinFiles(path.basename(darwinlang_file_paths[i].toString()));
					if(inMemTreeViewStruct[0].children){
						var child_len = inMemTreeViewStruct[0].children.length;
						inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_file_paths[i].toString())));
					}
				}

				// ITEM_ICON_MAP.set("SNN二进制模型", "imgs/darwin_icon_model_new.png");
				addDarwinFold("SNN二进制模型");
				inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));
				for(let i=0;i<darwinlang_bin_paths.length;++i){
					if(path.basename(darwinlang_bin_paths[i].toString()).indexOf("clear") >=0 || 
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("enable") >=0||
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("re_config") >=0||
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("nodelist")>=0||
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("linkout") >=0||
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("layerWidth") >=0 ||
							path.basename(darwinlang_bin_paths[i].toString()).indexOf("1_1config.txt") >=0){
								continue;
					}
					if(inMemTreeViewStruct[0].children){
						var child_len = inMemTreeViewStruct[0].children.length;
						// ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
						if(darwinlang_bin_paths[i].toString().search("config.b") !== -1){
							addDarwinFiles("config.b");
							inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode("config.b"));
						}else if(darwinlang_bin_paths[i].toString().search("connfiles") !== -1){
							addDarwinFiles("packed_bin_files.dat");
							inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode("packed_bin_files.dat"));
						}
						// inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
					}
				}
				// // 挂载二进制模型的inputs 数据
				// if(inMemTreeViewStruct[0].children){
				// 	let par_dir_idx = inMemTreeViewStruct[0].children.length-1;
				// 	ITEM_ICON_MAP.set("输入数据", "imgs/file.png");
				// 	inMemTreeViewStruct[0].children[par_dir_idx].children?.push(new TreeItemNode("输入数据",[]));
				// 	let sub_dir_idx = inMemTreeViewStruct[0].children[par_dir_idx].children!.length-1;
				// 	fs.readdir(path.join(path.dirname(darwinlang_bin_paths[0].toString()), "inputs"), (err, files)=>{
				// 		files.forEach(file => {
				// 			ITEM_ICON_MAP.set(file, "imgs/file.png");
				// 			inMemTreeViewStruct[0].children![par_dir_idx].children![sub_dir_idx].children?.push(new TreeItemNode(file));
				// 		});
				// 	});
				// }
				// if(inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[0].children){
				// 	inMemTreeViewStruct[0].children[0].children.push(new TreeItemNode("输入数据", []));
				// 	ITEM_ICON_MAP.set("输入数据", "imgs/file.png");
				// 	fs.readdir(path.join(path.dirname(darwinlang_bin_paths[0].toString()), "inputs"), (err, files)=>{
				// 		files.forEach(file => {
				// 			ITEM_ICON_MAP.set(file, "imgs/file.png");
				// 			if(inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[0].children){
				// 				inMemTreeViewStruct[0].children[0].children[0].children?.push(new TreeItemNode(file));
				// 			}
				// 		});
				// 	});
				// }

				treeview.data = inMemTreeViewStruct;
				treeviewConvertor.data = inMemTreeViewStruct;
				treeViewSimulator.data = inMemTreeViewStruct;
				treeViewConvertDarLang.data = inMemTreeViewStruct;
				treeViewSNNModelView.data = inMemTreeViewStruct;
				treeViewNewProj.data = inMemTreeViewStruct;
				treeViewLoadProj.data = inMemTreeViewStruct;
				treeview.refresh();
				treeviewConvertor.refresh();
				treeViewSimulator.refresh();
				treeViewConvertDarLang.refresh();
				treeViewSNNModelView.refresh();
				treeViewNewProj.refresh();
				treeViewLoadProj.refresh();
				// treeViewBinConvertDarLang.refresh();
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
		treeviewConvertor.data = inMemTreeViewStruct;
		treeViewSimulator.data = inMemTreeViewStruct;
		treeViewConvertDarLang.data = inMemTreeViewStruct;
		treeViewSNNModelView.data = inMemTreeViewStruct;
		treeViewNewProj.data = inMemTreeViewStruct;
		treeViewLoadProj.data = inMemTreeViewStruct;
		treeview.refresh();
		treeviewConvertor.refresh();
		treeViewSimulator.refresh();
		treeViewConvertDarLang.refresh();
		treeViewSNNModelView.refresh();
		treeViewNewProj.refresh();
		treeViewLoadProj.refresh();
		// treeViewBinConvertDarLang.refresh();

		// 关闭所有窗口，重置为初始化界面
		// let panelDataVis:vscode.WebviewPanel|undefined = undefined;
		// let panelAnnModelVis:vscode.WebviewPanel|undefined = undefined;
		// let panelSNNModelVis:vscode.WebviewPanel|undefined = undefined;
		// let panelSNNVisWeb:vscode.WebviewPanel|undefined = undefined;
		if(currentPanel){
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

		initCurrentPanel();
		currentPanel!.reveal();
	}));

	let disposable_vis_command = vscode.commands.registerCommand("treeView-item.datavis", (itemNode: TreeItemNode) => {
		console.log("当前可视化目标:"+itemNode.label);
		if(currentPanel){
			// 切换webview
			if(itemNode.label === "数据"){
				if(!panelDataVis){
					panelDataVis = vscode.window.createWebviewPanel("datavis", "数据集",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
					panelDataVis.onDidDispose(function(){
						panelDataVis = undefined;
					}, null, context.subscriptions);
				}
				panelDataVis.reveal();
				// currentPanel.webview.html = getConvertorDataPageV2(
					panelDataVis.webview.html = getConvertorDataPageV2(
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample0.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample1.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample2.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample3.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample4.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample5.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample6.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample7.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample8.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","sample9.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample0.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample1.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample2.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample3.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample4.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample5.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample6.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample7.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample8.png"))),
					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","script_res","test_sample9.png")))
				);
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
			if(panelDataVis){
				panelDataVis.title = "数据集";
				// 数据可视化展示
				// 执行后台脚本
				let scriptPath = path.join(__dirname,"inner_scripts","data_analyze.py");
				let command_str = "python "+scriptPath+" "+x_norm_data_path+" "+x_test_data_path + " "+y_test_data_path;
				exec(command_str, function(err, stdout, stderr){
					if(err){
						console.log("execute data analyze script error, msg: "+err);
					}else{
						console.log("execute data analyze script....");
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
			}
		}else if(itemNode.label === "ANN模型"){
			if(panelAnnModelVis){
				panelAnnModelVis.title = "ANN模型";
				var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
				var commandExe = "python "+modelVisScriptPath+" "+x_norm_data_path+" "+x_test_data_path+" "+y_test_data_path+" "+model_file_path;
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
			}
		}
	});
	context.subscriptions.push(disposable_vis_command);

	vscode.commands.registerCommand("convertor.opt",()=>{
		console.log("convertor startxxxxxxxxxxxxxxxxxxxxxxxx");
	});

	let disposable_import_command = vscode.commands.registerCommand("treeView-item.import", (itemNode: TreeItemNode) => {
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
					x_norm_data_path = fileUri[0].fsPath;
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_norm","imgs/file.png");
					addSlfFile("x_norm");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[0].children.push(new TreeItemNode("x_norm"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")));
					}
					if(x_norm_data_path){
						fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2",""), "x_norm.npz"),function(err){
						});
					}
					auto_save_with_check();
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
					x_test_data_path = fileUri[0].fsPath;
					
					// 添加到treeview下
					// ITEM_ICON_MAP.set("x_test","imgs/file.png");
					addSlfFile("x_test");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[1].children.push(new TreeItemNode("x_test"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")));
					}
					if(x_test_data_path){
						fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2",""), "x_test.npz"),function(err){
						});
					}
				}
			});
			auto_save_with_check();
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
					y_test_data_path = fileUri[0].fsPath;
					// 添加到treeview下
					// FIXME
					// ITEM_ICON_MAP.set("y_test","imgs/file.png");
					addSlfFile("y_test");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[2].children.push(new TreeItemNode("y_test"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")));
					}
					if(y_test_data_path){
						fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2",""), "y_test.npz"),function(err){
						});
					}
				}
			});	
			auto_save_with_check();
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
					model_file_path = fileUri[0].fsPath;
					// 添加到treeview下
					// ITEM_ICON_MAP.set("model_file","imgs/file.png");
					// ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
					addSlfFile(path.basename(model_file_path));
					if(treeview.data[0].children && treeview.data[0].children[1].children){
						treeview.data[0].children[1].children.push(new TreeItemNode("model_file_"+path.basename(model_file_path)));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")))){
						fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2","")));
					}
					if(model_file_path){
						fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path!).replace("\.dar2",""), "mnist_cnn.h5"),function(err){
						});
					}
				}
			});	
			auto_save_with_check();
		}
	});
	context.subscriptions.push(disposable_import_command);
	vscode.commands.registerCommand("convertor.new_proj", ()=>{
		console.log("create new project");
	});

	// 启动模型转换, 右键点击
	vscode.commands.registerCommand("item_convertor.start_convert", ()=>{
		if(currentPanel){
			// 发送消息到web view ，开始模型的转换
			console.log("模型转换页面打开");
			// currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
			if(currentPanel && currentPanel.title !== "模型转换"){
				currentPanel.webview.html = getANNSNNConvertPage();
				currentPanel.reveal();
				currentPanel.title = "模型转换";
				console.log("显示currentpane  模型转换   1");
			}else if(currentPanel){
				currentPanel.reveal();
			}
			// 执行后台脚本，发送log 到webview 展示运行日志，执行结束之后发送消息通知ann_model
			// let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py");
			// let command_str = "python "+scriptPath;
			// let scriptProcess = exec(command_str,{});
			// scriptProcess.stdout?.on("data", function(data){
			// 	console.log(data);
			// 	if(currentPanel){
			// 		let formatted_data = data.split("\r\n").join("<br/>");
			// 		currentPanel.webview.postMessage(JSON.stringify({"log_output":formatted_data}));
			// 	}
			// });
			// scriptProcess.stderr?.on("data", function(data){
			// 	console.log(data);
			// });
			// scriptProcess.on("exit",function(){
			// 	// 进程结束，发送结束消息
			// 	if(currentPanel){
			// 		currentPanel.webview.postMessage(JSON.stringify({"exec_finish":"yes"}));
			// 	}
			// });
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
		// fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
		// 	console.log("panelSNNVisWeb is: "+panelSNNVisWeb+", send snn info......");
		// 	panelSNNVisWeb!.webview.postMessage(JSON.stringify({ "snn_info": data })).then((onfullfill)=>{
		// 		console.log("向SNN模型界面发送消息，on fullfill.");
		// 	}, (onreject)=>{
		// 		console.log("向SNN模型界面发送消息，on reject.");
		// 	});
		// });
		console.log("执行darwinlang map生成脚本...");
		// 执行 darwinlang map 生成脚本
		let target_darlang_file_path = path.join(__dirname, "darwin2sim", "model_out" , path.basename(proj_save_path!).replace("\.dar2",""), "darlang_out","snn_digit_darlang.json");
		let command_str: string = "python " + path.join(__dirname, "load_graph.py") + " " + target_darlang_file_path + " " + path.join(__dirname);
		exec(command_str, function (err, stdout, stderr) {
			if(err){
				console.log("执行 load_graph.py 错误：" + err);
			}else{
				// 读取map 文件
				console.log("向SNN模型界面发送 snn_map 数据....");
				let map_file_disk = vscode.Uri.file(path.join(__dirname, "map.json"));
				let file_src = panelSNNVisWeb!.webview.asWebviewUri(map_file_disk).toString();
				panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_map": file_src})).then((fullfill)=>{
					console.log("snn_map 数据postmsg fullfill: "+fullfill);
					let snn_model_info_data = fs.readFileSync(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"));
					console.log("加载完毕snn 模型数据.....");
					panelSNNVisWeb!.webview.postMessage(JSON.stringify({"snn_info": snn_model_info_data.toString()})).then((fullfill)=>{
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
				console.log("extension 接收到 snn 仿真界面ready 消息.");
				let data = JSON.parse(evt);
				if(data.snn_simulate_ready){
					// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
					console.log("SNN仿真界面就绪.....");
					fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
						if(panelSNNModelVis){
							console.log("SNN仿真界面发送 snn_info 数据....");
							panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
						}
					});
				}
			});
			panelSNNModelVis.webview.html = getSNNSimuPage();
			panelSNNModelVis.title = "SNN仿真";
			panelSNNModelVis.reveal();
		}
	});

	// 启动转换为DarwinLang的操作
	vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", ()=>{
		// inMemTreeViewDarLang = [];
		if(!ITEM_ICON_MAP.has("SNN模型")){
			// ITEM_ICON_MAP.set("SNN模型","imgs/file.png");
			addDarwinFold("SNN模型");
			inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN模型",[]));
			darwinlang_file_paths.splice(0);
			if(inMemTreeViewStruct[0].children){
				var child_len = inMemTreeViewStruct[0].children.length;
				fs.readdir(path.join(__dirname, "darwin2sim","model_out", path.basename(proj_save_path!).replace("\.dar2",""), "darlang_out"), (err, files) => {
					files.forEach(file => {
						darwinlang_file_paths.push(path.join(__dirname, "darwin2sim","model_out", path.basename(proj_save_path!).replace("\.dar2",""), "darlang_out", file));
						// ITEM_ICON_MAP.set(file, "imgs/file.png");
						addDarwinFiles(file);
						if(inMemTreeViewStruct[0].children){
							inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(file));
						}
					});
					auto_save_with_check();
				});
			}
			treeview.refresh();
			treeviewConvertor.refresh();
			treeViewSimulator.refresh();
			treeViewConvertDarLang.refresh();
			treeViewSNNModelView.refresh();
			treeViewNewProj.refresh();
			treeViewLoadProj.refresh();
		}
		// treeViewBinConvertDarLang.refresh();
	});

	// // 启动将darwinlang 文件转换为二进制文件的操作
	vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function(){
		if(!ITEM_ICON_MAP.has("SNN二进制模型")){
			// ITEM_ICON_MAP.set("SNN二进制模型", "imgs/file.png");
			addSlfFile("SNN二进制模型");
			inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));
			darwinlang_bin_paths.splice(0);
			if(inMemTreeViewStruct[0].children){
				var child_len = inMemTreeViewStruct[0].children.length;
				fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""), "bin_darwin_out"), (err, files)=>{
					files.forEach(file =>{
						if(file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1){
							darwinlang_bin_paths.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path!).replace("\.dar2",""), "bin_darwin_out", file));
							// ITEM_ICON_MAP.set(file, "imgs/file.png");
							// addSlfFile(file);
							// if(file.search("config.b") !== -1){
							// 	addDarwinFiles("config.b");
							// }else if(file.search("connfiles") !== -1){
							// 	addDarwinFiles("packed_bin_files.dat");
							// }
							if(inMemTreeViewStruct[0].children){
								if(file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
									file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1){
										// inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(file));
										if(file.search("config.b") !== -1){
											addDarwinFiles("config.b");
											inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode("config.b"));
										}else if(file.search("connfiles") !== -1){
											addDarwinFiles("packed_bin_files.dat");
											inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode("packed_bin_files.dat"));
										}
								}
								
							}
						}
					});
					auto_save_with_check();
				});
			}
			treeview.refresh();
			treeviewConvertor.refresh();
			treeViewSimulator.refresh();
			treeViewConvertDarLang.refresh();
			treeViewSNNModelView.refresh();
		}
		// treeViewBinConvertDarLang.refresh();
	});

	vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin2", function(){
		console.log("目标转换为darwin2二进制文件");
		vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
	});

	vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin3", function(){
		console.log("目标转换为darwin3二进制文件");
	});


	vscode.commands.executeCommand("darwin2.helloWorld");

	function auto_save_with_check(){
		// check if all necessary info get, auto save to proj_save_path
		if(x_norm_data_path && x_test_data_path && y_test_data_path && model_file_path && darwinlang_file_paths && darwinlang_bin_paths){
			console.log("all nessary info get, auto save");
			let proj_info_data = {
				"proj_info":proj_desc_info,
				"x_norm_path":x_norm_data_path,
				"x_test_path":x_test_data_path,
				"y_test_path":y_test_data_path,
				"model_path":model_file_path,
				"darwinlang_file_paths":darwinlang_file_paths,
				"darwinlang_bin_paths":darwinlang_bin_paths
			};
			fs.writeFileSync(proj_save_path!, JSON.stringify(proj_info_data));
		}
	}

}

// this method is called when your extension is deactivated
export function deactivate() {
	// shutdown local server
	axios.default.post("http://localhost:6003/shutdown");
}