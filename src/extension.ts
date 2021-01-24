// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
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
import {exec} from "child_process";
import { time } from 'console';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 实现树视图的初始化
	let treeview = TreeViewProvider.initTreeViewItem();
	let inMemTreeViewStruct:Array<TreeItemNode>=new Array();
	let x_norm_data_path:string|undefined = undefined;
	let x_test_data_path:string|undefined = undefined;
	let y_test_data_path:string|undefined = undefined;
	let model_file_path:string|undefined = undefined;

	let proj_desc_info = {
		"project_name":"",
		"project_type":"",
		"python_type":"",
		"ann_lib_type":""
	};
	// darwinlang 文件转换树视图
	let treeViewDarlang = TreeViewProviderDarLang.initTreeViewItem();
	let inMemTreeViewDarLang:Array<TreeItemNodeDarLang> = new Array();

	// let xiangmuItem = new TreeItemNode("项目");
	// treeview.data.push(xiangmuItem);
	// // treeview.data.push(new TreeItemNode("数据", [new TreeItemNode("模型")]));
	// treeview.data[0].children?.push(new TreeItemNode("数据"));

	// treeViewPro.data.push(new TreeItemNode("测试添加"));
	// TreeViewProviderData.initTreeViewItem();
	// TreeViewProviderModel.initTreeViewItem();
	vscode.window.registerTreeDataProvider("multiLevelTree", new MultiLevelTreeProvider());
    
    // 还记得我们在 TreeViewProvider.ts 文件下 TreeItemNode 下创建的 command 吗？
    // 创建了 command 就需要注册才能使用
    // label 就是 TreeItemNode->command 里 arguments 传递过来的
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
		vscode.window.showInformationMessage(label);
		console.log("label is :["+label+"]");
		if(label === "项目"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:true,
				openLabel:"选择文件夹",
				filters:{"All files":['*']}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					fs.writeFileSync(path.join(fileUri[0].fsPath, "new.dar2proj"), "");
				}
			});
			if(currentPanel){
				currentPanel.webview.html = NewProj.getNewProjView();
			}
		}else if(label === "导入数据"){
			const options:vscode.OpenDialogOptions = {
				canSelectMany:false,
				canSelectFolders:true,
				openLabel:"选择数据",
				filters:{"All files":['*',"*.npz"]}
			};
			vscode.window.showOpenDialog(options).then(fileUri => {
				if(fileUri && fileUri[0]){
					console.log("selected path: "+fileUri[0].fsPath);
					if(currentPanel){
						currentPanel.webview.html = ImportDataShow.getView(
							currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","img_1.jpg"))),
							currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","img_2.jpg"))),
							currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","img_3.jpg"))),
							currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","img_4.jpg")))
						);
					}
				}
			});
		}else if(label === "导入模型"){

		}else if(label.search("json") !== -1){
			// 显示darlang文件
			console.log("显示转换后的darwinLang");
			let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out","snn_digit_darlang.json"));
			vscode.workspace.openTextDocument(file_target).then((doc:vscode.TextDocument)=>{
				vscode.window.showTextDocument(doc, 1,false).then(ed=>{
					ed.edit(edit=>{
					});
				});
			}, (err)=>{
				console.log(err);
			});

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
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "达尔文集成开发环境",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});

			currentPanel.webview.html = getMainPageV2(
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","arrow_down.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","arrow_leftdown.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","arrow_right.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","train_snn.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","model_pool.svg"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","mapper.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","darwin_os.png")))
			);
			// 启动后台资源server
			let scriptPath = path.join(__dirname,"inner_scripts","img_server.py");
			let command_str = "python "+scriptPath;
			console.log("prepare to start img server.");
			exec(command_str, function(err, stdout, stderr){
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
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("模型",[])]));
					treeview.data = inMemTreeViewStruct;
					treeview.refresh();
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
					treeview.refresh();
				}
			});


			// currentPanel.webview.html = getIndexPage(
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","train_snn.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","model_pool.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","mapper.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","darwin_os.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_up_arrow.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_btm_arrow.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_up_arrow.png"))),
			// 	currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_btm_arrow.png")))
			// );

			// currentPanel.webview.onDidReceiveMessage(function(msg){
			// 	console.log("extension receive msg:"+JSON.parse(msg));
			// 	var data = JSON.parse(msg);
			// 	if(data.click){
			// 		console.log("click msg, val is "+data.click);
			// 		if(data.click === "convertor"){
			// 			console.log("prepare jump to convertor page...");
			// 			if(currentPanel){
			// 				currentPanel.webview.html = getConvertorPage();
			// 			}
			// 		}else if(data.click === "index"){
			// 			console.log("prepare jump to index page...");;
			// 			if(currentPanel){
			// 				currentPanel.webview.html = getIndexPage(
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","train_snn.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","model_pool.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","mapper.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","darwin_os.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_up_arrow.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_btm_arrow.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_up_arrow.png"))),
			// 					currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_btm_arrow.png")))
			// 				);
			// 			}
			// 		}
			// 	}
			// });
			// currentPanel.webview.postMessage({"image_logo_convertor":JSON.stringify(currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))))});

			// console.log("Sync read: "+buf.toString());
			// currentPanel.webview.html = buf.toString();
			// const pathImg = vscode.Uri.file(path.join(context.extensionPath,"src","resources","main_page.png"));
			// currentPanel.webview.html = get_main_page(currentPanel.webview.asWebviewUri(pathImg));
			// const img = currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","main_page.png")));
			// const garbagebinImgSrc = currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"resources","garbage_bin.png")));
			// console.log("garbage img uri:"+garbagebinImgSrc.toString());
			// currentPanel.webview.postMessage(JSON.stringify({"garbageSrc":garbagebinImgSrc})+"");
			// let count=0;
			// let uploadedANNModelPath:string="";
			// let uploadedTestDataDirPath:string="";
			// let msgReceiver = currentPanel.webview.onDidReceiveMessage(message =>{
			// 	console.log("extension receive msg: "+message);
			// 	count++;
			// 	console.log("This is "+count+" th message");
			// 	let data = JSON.parse(message);
			// 	if(data.upload_ann_model_path){
			// 		console.log("uploaded ann model path is:["+data.upload_ann_model_path+"]");
			// 		// 记录上传的ANN模型，等待接收开始转换的指令
			// 		uploadedANNModelPath = data.upload_ann_model_path;
			// 	}else if(data.upload_testdata_dirpath){
			// 		// 记录上传的测试数据所在的目录路径
			// 		// deprecated
			// 		console.log("Test data are in directory: ["+data.upload_testdata_dirpath+"]");
			// 		uploadedTestDataDirPath = data.upload_testdata_dirpath;
			// 	}else if(data.start_data_preprocess){
			// 		// 开始数据预处理
			// 		console.log("receive data preprocess command from webview");
			// 		let pyScript = child_process.spawn("python",['E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\stage1.py ', uploadedTestDataDirPath]);
			// 		pyScript.stdout.on("data",(data)=>{
			// 			console.log("python executed output:"+data);
			// 			currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":data.toString()})+"");
			// 		});
			// 		pyScript.stderr.on("data",(err)=>{
			// 			console.log("python executed err output:"+err.toString());
			// 			currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":err.toString()})+"");
			// 		});
			// 	}else if(data.start_ann_conversion){
			// 		// 开始ANN模型转换与校验
			// 		uploadedANNModelPath = data.start_ann_conversion;
			// 		let pyScript = child_process.spawn("python",['E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\stage2.py ',data.start_ann_conversion]);
			// 		pyScript.stdout.on("data",(data)=>{
			// 			console.log("python execute output:"+data);
			// 			currentPanel?.webview.postMessage(JSON.stringify({"stage2Data":data.toString()})+"");
			// 		});
			// 		pyScript.stderr.on("data",(err)=>{
			// 			console.log("python execute err output:"+err.toString());
			// 			currentPanel?.webview.postMessage(JSON.stringify({"stage2Data":err.toString()})+"");
			// 		});
			// 	}else if(data.start_simulate_from_ann){
			// 		// 开始使用转换后的ANN 放到模拟器上运行
			// 		console.log("Start building SNN from ANN and running on simulator...");
			// 		console.log("uploaded mode path: "+uploadedANNModelPath.toString());
			// 		let modeName = uploadedANNModelPath.split("\\")[uploadedANNModelPath.split("\\").length-1];
			// 		let modeNameList = modeName.split("_");
			// 		modeNameList.splice(1,0,"normed");
			// 		modeName = modeNameList.join("_");
			// 		let uploadedANNModelPathList = uploadedANNModelPath.split("\\").slice(0,uploadedANNModelPath.split("\\").length-1);
			// 		uploadedANNModelPathList.push(modeName);
			// 		uploadedANNModelPath = uploadedANNModelPathList.join("\\");
			// 		console.log("normed model path:"+uploadedANNModelPath.toString());

			// 		let pyScript = child_process.spawn("python",["E:\\courses\\ZJLab\\IDE设计相关文档\\darwin2\\src\\module\\darsim\\main.py", "E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\ann_model_descs\\fcn_normed_model.h5"]);
			// 		pyScript.stdout.on("data",(data)=>{
			// 			console.log(data.toString());
			// 			currentPanel?.webview.postMessage(JSON.stringify({"convertedSNNSimu":data.toString()})+"");
			// 		});
			// 		pyScript.stderr.on("data",(err)=>{
			// 			console.log(err.toString());
			// 			currentPanel?.webview.postMessage(JSON.stringify({"convertedSNNSimu":err.toString()})+"");
			// 		});
			// 	}else if(data.saveLogFile){
			// 		console.log("保存日志文件，目标路径："+data.saveLogFile.toString());
			// 		console.log("保存日志文件内容："+data.logData.toString());
			// 		fs.writeFileSync(path.join(data.saveLogFile.toString(),"ide_log.txt"),data.logData.toString());
			// 	}
			// },undefined,context.subscriptions);

			// currentPanel.onDidDispose(()=> {currentPanel=undefined;}, null,context.subscriptions);
		}
	});

	context.subscriptions.push(disposable);
	let disposable2 = vscode.commands.registerCommand("treeView-item.newproj", () => {
		console.log("创建新项目xxx");							
		// TODO
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
			filters:{"All files":['*']}
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
					"model_path":model_file_path
				};
				fs.writeFileSync(fileUri.fsPath+".dar2", JSON.stringify(data));
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
				// 显示treeview
				addSlfProj(proj_desc_info.project_name);
				inMemTreeViewStruct.push(new TreeItemNode(proj_desc_info.project_name, [new TreeItemNode("数据", 
							[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
							new TreeItemNode("测试数据标签",[])]), new TreeItemNode("模型",[])]));
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
	}));

	let disposable_vis_command = vscode.commands.registerCommand("treeView-item.datavis", (itemNode: TreeItemNode) => {
		console.log("当前可视化目标:"+itemNode.label);
		if(currentPanel){
			// 切换webview
			if(itemNode.label === "数据"){
				currentPanel.webview.html = getConvertorDataPageV2(
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
			}else if(itemNode.label === "模型"){
				// TODO
				currentPanel.webview.html = getConvertorModelPageV2();
			}
		}
		if(itemNode.label === "数据"){
			if(currentPanel){
				currentPanel.title = "数据集";
				// 数据可视化展示
				// TODO
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
							if(currentPanel){
								currentPanel.webview.postMessage(data);
							}
						});
					}
				});
			}
		}else if(itemNode.label === "模型"){
			if(currentPanel){
				currentPanel.title = "ANN模型";
				var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
				var commandExe = "python "+modelVisScriptPath+" "+x_norm_data_path+" "+x_test_data_path+" "+y_test_data_path+" "+model_file_path;
				exec(commandExe, function(err, stdout, stderr){
					console.log("model vis script running...");
					console.log("__dirname is: "+__dirname);
					fs.readFile(path.join(__dirname, "inner_scripts", "model_general_info.json"), "utf-8",(evt, data)=>{
						console.log("Read model general info data: "+data);
						// 发送到web view 处理
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"model_general_info": data}));
						}
					});
					// 加载模型详细信息
					fs.readFile(path.join(__dirname, "inner_scripts","model_layers_info.json"),"utf-8",(evt,data)=>{
						console.log("模型详细信息："+data);
						// 发送到web view 处理
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"model_detail_info":data}));
						}
					});
					// 加载卷积、池化的等Layer的可视化
					fs.readFile(path.join(__dirname, "inner_scripts", "layer_vis_info.json"), "utf-8", (evt, data)=>{
						console.log("layer output vis: "+data);
						// 发送到webview 处理
						if(currentPanel){
							currentPanel.webview.postMessage(JSON.stringify({"model_layer_vis":data}));
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
					// FIXME
					ITEM_ICON_MAP.set("x_norm","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[0].children.push(new TreeItemNode("x_norm"));
						treeview.refresh();
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
					// FIXME
					ITEM_ICON_MAP.set("x_test","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
						console.log("添加新的文件");
						treeview.data[0].children[0].children[1].children.push(new TreeItemNode("x_test"));
						treeview.refresh();
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
				}
			});	
		}else if(itemNode.label === "模型"){
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
					// FIXME
					ITEM_ICON_MAP.set("model_file","imgs/file.png");
					if(treeview.data[0].children && treeview.data[0].children[1].children){
						console.log("添加新的文件");
						treeview.data[0].children[1].children.push(new TreeItemNode("model_file"));
						treeview.refresh();
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
			currentPanel.title = "ANN SNN模型转换";
			// 发送消息到web view ，开始模型的转换
			currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
			// TODO
			// 执行后台脚本，发送log 到webview 展示运行日志，执行结束之后发送消息通知ann_model
			let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py");
			let command_str = "python "+scriptPath;
			let scriptProcess = exec(command_str,{});
			scriptProcess.stdout?.on("data", function(data){
				console.log(data);
				let formatted_data = data.replace(/\r\n/g, "<br/>");
				if(currentPanel){
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
				}
			});
		}
	});

	// 启动仿真
	vscode.commands.registerCommand("item_simulator.start_simulate", ()=>{
		if(currentPanel){
			currentPanel.webview.html = getSNNSimuPage();
			currentPanel.title = "SNN";
			// 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
			fs.readFile(path.join(__dirname, "inner_scripts","brian2_snn_info.json"),"utf-8",(evt,data)=>{
				if(currentPanel){
					currentPanel.webview.postMessage(JSON.stringify({"snn_info":data}));
				}
			});
		}
	});

	// 启动转换为DarwinLang的操作
	vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", ()=>{
		inMemTreeViewDarLang = [];
		fs.readdir(path.join(__dirname, "darwin2sim","model_out"), (err, files) => {
			files.forEach(file => {
			  ITEM_ICON_MAP_DARLANG.set(file, "imgs/file.png");
			  inMemTreeViewDarLang.push(new TreeItemNodeDarLang(file));
			});
		});
		treeViewDarlang.data = inMemTreeViewDarLang;
		treeViewDarlang.refresh();
	});

	vscode.commands.executeCommand("darwin2.helloWorld");
}

// this method is called when your extension is deactivated
export function deactivate() {}