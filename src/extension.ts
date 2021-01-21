// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
// 引入 TreeViewProvider 的类
import { ITEM_ICON_MAP, TreeItemNode, TreeViewProvider } from './TreeViewProvider';
import { TreeViewProviderData } from "./TreeViewData";
import { TreeViewProviderModel } from "./TreeViewModel";
import {NewProj} from "./NewProjWebView";
import {ImportDataShow} from "./ImportDataView";
import {MultiLevelTreeProvider} from "./multiLevelTree";
import {getMainPageV2} from "./get_mainpage_v2";
import {getConvertorPageV2} from "./get_convertor_page_v2";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 实现树视图的初始化
	let treeview = TreeViewProvider.initTreeViewItem();
	let inMemTreeViewStruct:TreeItemNode[]=[];
	let x_norm_data_path = undefined;
	let x_test_data_path = undefined;
	let y_test_data_path = undefined;
	let model_file_path = undefined;
	// let xiangmuItem = new TreeItemNode("项目");
	// treeview.data.push(xiangmuItem);
	// // treeview.data.push(new TreeItemNode("数据", [new TreeItemNode("模型")]));
	// treeview.data[0].children?.push(new TreeItemNode("数据"));

	// treeViewPro.data.push(new TreeItemNode("测试添加"));
	// TreeViewProviderData.initTreeViewItem();
	// TreeViewProviderModel.initTreeViewItem();
	// vscode.window.registerTreeDataProvider("multiLevelTree", new MultiLevelTreeProvider());
    
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
		inMemTreeViewStruct.push(new TreeItemNode("项目", [new TreeItemNode("数据", 
														[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
														new TreeItemNode("测试数据标签",[])]), new TreeItemNode("模型",[])]));
							
								
		treeview.data = inMemTreeViewStruct;
		treeview.refresh();
		let options: vscode.InputBoxOptions = {
			prompt: "Label: ",
			placeHolder: "(placeholder)"
		};
		
		vscode.window.showInputBox(options).then(value => {
			if(value){
				console.log("输入的值为："+value);
				treeview.data[0].label = value;
				treeview.refresh();
			}
		});
	});
	context.subscriptions.push(disposable2);
	let disposable_vis_command = vscode.commands.registerCommand("treeView-item.datavis", (itemNode: TreeItemNode) => {
		console.log("当前可视化目标:"+itemNode.label);
		if(itemNode.label === "数据"){
			if(currentPanel){
				currentPanel.title = "数据集";
			}
		}
	});
	context.subscriptions.push(disposable_vis_command);

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
}

// this method is called when your extension is deactivated
export function deactivate() {}