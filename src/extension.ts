// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as axios from 'axios';
// 引入 TreeViewProvider 的类
import { ITEM_ICON_MAP, TreeItemNode, TreeViewProvider,addSlfProj,addSlfFile } from './TreeViewProvider';
import {ITEM_ICON_MAP_DARLANG, TreeItemNodeDarLang, TreeViewProviderDarLang} from "./TreeViewProviderDarLang";
import { TreeViewProviderData } from "./TreeViewData";
import { TreeViewProviderModel } from "./TreeViewModel";
import {NewProj} from "./NewProjWebView";
import {ImportDataShow} from "./ImportDataView";
import {MultiLevelTreeProvider} from "./multiLevelTree";
import {getMainPageV2} from "./get_mainpage_v2";
import {getConvertorDataPageV2, getConvertorModelPageV2,getConvertorPageV2,getANNSNNConvertPage,getSNNSimuPage} from "./get_convertor_page_v2";
import {ChildProcess, exec, spawn} from "child_process";
import { time } from 'console';


let local_server:ChildProcess|undefined = undefined;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 实现树视图的初始化
	let treeview = TreeViewProvider.initTreeViewItem("treeView-item");
	let treeviewConvertor = TreeViewProvider.initTreeViewItem("item_convertor");
	let treeViewSimulator = TreeViewProvider.initTreeViewItem("item_simulator");
	let treeViewConvertDarLang = TreeViewProvider.initTreeViewItem("item_darwinLang_convertor");
	let treeViewBinConvertDarLang = TreeViewProvider.initTreeViewItem("item_bin_darwinlang_convertor");

	let inMemTreeViewStruct:Array<TreeItemNode>=new Array();
	treeViewBinConvertDarLang.data = inMemTreeViewStruct;
	let x_norm_data_path:string|undefined = undefined;
	let x_test_data_path:string|undefined = undefined;
	let y_test_data_path:string|undefined = undefined;
	let model_file_path:string|undefined = undefined;

	let darwinlang_file_paths:Array<String> = new Array();
	let darwinlang_bin_paths:Array<String> = new Array();

	let panelDataVis:vscode.WebviewPanel|undefined = undefined;
	let panelAnnModelVis:vscode.WebviewPanel|undefined = undefined;
	let panelSNNModelVis:vscode.WebviewPanel|undefined = undefined;

	let proj_desc_info = {
		"project_name":"",
		"project_type":"",
		"python_type":"",
		"ann_lib_type":""
	};
	vscode.window.registerTreeDataProvider("multiLevelTree", new MultiLevelTreeProvider());
    
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
		vscode.window.showInformationMessage(label);
		console.log("label is :["+label+"]");
		if(label.search("json") !== -1){
			// 显示darlang文件
			console.log("显示转换后的darwinLang");
			let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "darlang_out",label));
			vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
				vscode.window.showTextDocument(doc, 1,false).then(ed=>{
					ed.edit(edit=>{
					});
				});
			}, (err)=>{
				console.log(err);
			});
		}else if(label.search("txt") !== -1){
			// 显示二进制的darlang文件
			console.log("显示二进制的darwinLang");
			let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out",label));
			vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
				vscode.window.showTextDocument(doc, 1,false).then(ed=>{
					ed.edit(edit=>{
					});
				});
			}, (err)=>{
				console.log(err);
			});
		}else if(label.search(".pickle") !== -1 && label.search("layer") === -1){
			// 显示pickle 文件的原始内容
			console.log("解析并显示pickle 文件内容");
			// let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label));
			let target_file_path = path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label);
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
			let target_file_path = path.join(__dirname, "darwin2sim", "model_out", "darlang_out", label);
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
					"dist", "darwin2sim", "model_out", "bin_darwin_out", "inputs", label)))}" onmousewheel="return bigimg(this)">
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
		}
	}));


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "darwin2" is now active!');
	// track current webview panel
	let currentPanel:vscode.WebviewPanel | undefined = undefined;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		const columnToShowIn = vscode.window.activeTextEditor? vscode.window.activeTextEditor.viewColumn:undefined;
		if(currentPanel){
			currentPanel.reveal(columnToShowIn);
		}else{
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			// 主界面由electron 应用启动
			currentPanel.webview.html =getConvertorPageV2();

			// 启动后台资源server
			let scriptPath = path.join(__dirname,"inner_scripts","img_server.py");
			let command_str = "python "+scriptPath;
			console.log("prepare to start img server.");
			local_server = exec(command_str, function(err, stdout, stderr){
				console.log("img server started");
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
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])]));
					treeview.data = inMemTreeViewStruct;
					treeviewConvertor.data = inMemTreeViewStruct;
					treeViewSimulator.data = inMemTreeViewStruct;
					treeViewConvertDarLang.data = inMemTreeViewStruct;
					treeview.refresh();
					treeviewConvertor.refresh();
					treeViewSimulator.refresh();
					treeViewConvertDarLang.refresh();
					treeViewBinConvertDarLang.refresh();
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
					treeview.refresh();
					treeviewConvertor.refresh();
					treeViewSimulator.refresh();
					treeViewConvertDarLang.refresh();
					treeViewBinConvertDarLang.refresh();
				}else if(data.model_convert_params){
					// 接收到模型转换与仿真的参数配置，启动脚本
					console.log("Extension 接收到 webview的消息，启动脚本......");
					let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py");
					let command_str = "python "+scriptPath;
					let scriptProcess = exec(command_str,{});
					
					scriptProcess.stdout?.on("data", function(data){
						console.log(data);
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
									// 							// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
									// fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
									// 	if(panelSNNModelVis){
									// 		panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
									// 	}
									// });
						}
					});
				}
			});
		}
	});

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
			filters:{"Darwin2 Project":['dar2']}
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
				if(x_norm_data_path){
					fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", "x_norm.npz"),function(err){
					});
				}
				if(x_test_data_path){
					fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", "x_test.npz"),function(err){
					});
				}
				if(y_test_data_path){
					fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", "y_test.npz"), function(err){
					});
				}
				if(model_file_path){
					fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", "mnist_cnn.h5"),function(err){
					});
				}
				// 显示treeview
				addSlfProj(proj_desc_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(proj_desc_info.project_name, [new TreeItemNode("数据", 
							[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])]));
				addSlfFile("x_norm");
				addSlfFile("x_test");
				addSlfFile("y_test");
				addSlfFile("model_file");
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
					inMemTreeViewStruct[0].children[1].children?.push(new TreeItemNode("model_file"));
				}
				// add darwinlang and bin files
				ITEM_ICON_MAP.set("Darwin模型","imgs/file.png");
				inMemTreeViewStruct[0].children?.push(new TreeItemNode("Darwin模型",[]));
				for(let i=0;i<darwinlang_file_paths.length;++i){
					ITEM_ICON_MAP.set(path.basename(darwinlang_file_paths[i].toString()),"imgs/file.png");
					if(inMemTreeViewStruct[0].children){
						var child_len = inMemTreeViewStruct[0].children.length;
						inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_file_paths[i].toString())));
					}
				}

				// ITEM_ICON_MAP.set("Darwin二进制模型", "imgs/file.png");
				// inMemTreeViewStruct[0].children?.push(new TreeItemNode("Darwin二进制模型",[]));
				// for(let i=0;i<darwinlang_bin_paths.length;++i){
				// 	if(inMemTreeViewStruct[0].children){
				// 		var child_len = inMemTreeViewStruct[0].children.length;
				// 		ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
				// 		inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
				// 	}
				// }
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
				treeview.refresh();
				treeviewConvertor.refresh();
				treeViewSimulator.refresh();
				treeViewConvertDarLang.refresh();
				treeViewBinConvertDarLang.refresh();
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
		treeview.refresh();
		treeviewConvertor.refresh();
		treeViewSimulator.refresh();
		treeViewConvertDarLang.refresh();
		treeViewBinConvertDarLang.refresh();
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
					ITEM_ICON_MAP.set("x_norm","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[0].children.push(new TreeItemNode("x_norm"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(x_norm_data_path){
						fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", "x_norm.npz"),function(err){
						});
					}
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
					ITEM_ICON_MAP.set("x_test","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[1].children.push(new TreeItemNode("x_test"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(x_test_data_path){
						fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", "x_test.npz"),function(err){
						});
					}
				}
			});
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
					ITEM_ICON_MAP.set("y_test","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[2].children.push(new TreeItemNode("y_test"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(y_test_data_path){
						fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", "y_test.npz"),function(err){
						});
					}
				}
			});	
		}else if(itemNode.label === "ANN模型"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:false,
				openLabel:"选择模型文件",
				filters:{"模型文件":['*']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					model_file_path = fileUri[0].fsPath;
					// 添加到treeview下
					ITEM_ICON_MAP.set("model_file","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[1].children){
						console.log("添加新的文件");
						treeview.data[0].children[1].children.push(new TreeItemNode("model_file"));
						treeview.refresh();
					}
					// 拷贝文件到项目并重命名
					if(model_file_path){
						fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", "mnist_cnn.h5"),function(err){
						});
					}
				}
			});	
		}
	});
	context.subscriptions.push(disposable_import_command);
	vscode.commands.registerCommand("convertor.new_proj", ()=>{
		console.log("create new project");
	});

	// 启动模型转换
	vscode.commands.registerCommand("item_convertor.start_convert", ()=>{
		if(currentPanel){
			currentPanel.webview.html = getANNSNNConvertPage();
			currentPanel.reveal();
			currentPanel.title = "模型转换";
			// 发送消息到web view ，开始模型的转换
			currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
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

	// 启动仿真
	vscode.commands.registerCommand("item_simulator.start_simulate", ()=>{
		if(!panelSNNModelVis){
			panelSNNModelVis = vscode.window.createWebviewPanel("snnvis", "SNN模型",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			panelSNNModelVis.onDidDispose(()=>{
				panelSNNModelVis = undefined;
			},null, context.subscriptions);
		}
		panelSNNModelVis.reveal();
		panelSNNModelVis.webview.html = getSNNSimuPage();
		panelSNNModelVis.title = "SNN模型";
		// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
		fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
			if(panelSNNModelVis){
				panelSNNModelVis.webview.postMessage(JSON.stringify({"snn_info":data}));
			}
		});
	});

	// 启动转换为DarwinLang的操作
	vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", ()=>{
		// inMemTreeViewDarLang = [];
		ITEM_ICON_MAP.set("Darwin模型","imgs/file.png");
		inMemTreeViewStruct[0].children?.push(new TreeItemNode("Darwin模型",[]));
		darwinlang_file_paths.splice(0);
		if(inMemTreeViewStruct[0].children){
			var child_len = inMemTreeViewStruct[0].children.length;
			fs.readdir(path.join(__dirname, "darwin2sim","model_out", "darlang_out"), (err, files) => {
				files.forEach(file => {
					darwinlang_file_paths.push(path.join(__dirname, "darwin2sim","model_out", "darlang_out", file));
					ITEM_ICON_MAP.set(file, "imgs/file.png");
					if(inMemTreeViewStruct[0].children){
						inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(file));
					}
				});
			});
		}
		treeview.refresh();
		treeviewConvertor.refresh();
		treeViewSimulator.refresh();
		treeViewConvertDarLang.refresh();
		treeViewBinConvertDarLang.refresh();
	});

	// // 启动将darwinlang 文件转换为二进制文件的操作
	// vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function(){
	// 	ITEM_ICON_MAP.set("Darwin二进制模型", "imgs/file.png");
	// 	inMemTreeViewStruct[0].children?.push(new TreeItemNode("Darwin二进制模型",[]));
	// 	darwinlang_bin_paths.splice(0);
	// 	if(inMemTreeViewStruct[0].children){
	// 		var child_len = inMemTreeViewStruct[0].children.length;
	// 		fs.readdir(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out"), (err, files)=>{
	// 			files.forEach(file =>{
	// 				darwinlang_bin_paths.push(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", file));
	// 				ITEM_ICON_MAP.set(file, "imgs/file.png");
	// 				if(inMemTreeViewStruct[0].children){
	// 					inMemTreeViewStruct[0].children[child_len-1].children?.push(new TreeItemNode(file));
	// 				}
	// 			});
	// 		});
	// 	}
	// 	treeview.refresh();
	// 	treeviewConvertor.refresh();
	// 	treeViewSimulator.refresh();
	// 	treeViewConvertDarLang.refresh();
	// 	treeViewBinConvertDarLang.refresh();
	// });
	vscode.commands.executeCommand("darwin2.helloWorld");
}

// this method is called when your extension is deactivated
export function deactivate() {
	// shutdown local server
	axios.default.post("http://localhost:6003/shutdown");
}