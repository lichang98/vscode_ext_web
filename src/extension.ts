// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from "child_process";
import { exit } from 'process';
// 引入 TreeViewProvider 的类
import { TreeViewProvider } from './TreeViewProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // 实现树视图的初始化
	TreeViewProvider.initTreeViewItem();
    
    // 还记得我们在 TreeViewProvider.ts 文件下 TreeItemNode 下创建的 command 吗？
    // 创建了 command 就需要注册才能使用
    // label 就是 TreeItemNode->command 里 arguments 传递过来的
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
		vscode.window.showInformationMessage(label);
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
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "Darwin IDE",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(context.extensionPath),vscode.Uri.file(path.join(context.extensionPath,"resources"))], enableScripts:true,retainContextWhenHidden:true});
			const onDiskPath = vscode.Uri.file(path.join(context.extensionPath,"src","resources","index.html"));
			let val = onDiskPath.with({scheme: "vscode-resource"});
			let pathStr = val.toString();
			// console.log("pathStr:"+pathStr);
			pathStr="E:\\courses\\ZJLab\\IDE设计相关文档\\darwin2\\src\\resources\\index.html";
			// fs.readFile(pathStr,'UTF-8',(err,fcontent)=>{
			// 	console.log("file content:\n"+fcontent.toString());
			// 	console.log("error:"+err?.message);
			// });
			let buf = fs.readFileSync(pathStr,"UTF-8");
			// console.log("Sync read: "+buf.toString());
			currentPanel.webview.html = buf.toString();
			// const garbagebinImgSrc = currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"resources","garbage_bin.png")));
			// console.log("garbage img uri:"+garbagebinImgSrc.toString());
			// currentPanel.webview.postMessage(JSON.stringify({"garbageSrc":garbagebinImgSrc})+"");
			let count=0;
			let uploadedANNModelPath:string="";
			let uploadedTestDataDirPath:string="";
			let msgReceiver = currentPanel.webview.onDidReceiveMessage(message =>{
				console.log("extension receive msg: "+message);
				count++;
				console.log("This is "+count+" th message");
				let data = JSON.parse(message);
				if(data.upload_ann_model_path){
					console.log("uploaded ann model path is:["+data.upload_ann_model_path+"]");
					// 记录上传的ANN模型，等待接收开始转换的指令
					uploadedANNModelPath = data.upload_ann_model_path;
				}else if(data.upload_testdata_dirpath){
					// 记录上传的测试数据所在的目录路径
					// deprecated
					console.log("Test data are in directory: ["+data.upload_testdata_dirpath+"]");
					uploadedTestDataDirPath = data.upload_testdata_dirpath;
				}else if(data.start_data_preprocess){
					// 开始数据预处理
					console.log("receive data preprocess command from webview");
					let pyScript = child_process.spawn("python",['E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\stage1.py ', uploadedTestDataDirPath]);
					pyScript.stdout.on("data",(data)=>{
						console.log("python executed output:"+data);
						currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":data.toString()})+"");
					});
					pyScript.stderr.on("data",(err)=>{
						console.log("python executed err output:"+err.toString());
						currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":err.toString()})+"");
					});
				}else if(data.start_ann_conversion){
					// 开始ANN模型转换与校验
					uploadedANNModelPath = data.start_ann_conversion;
					let pyScript = child_process.spawn("python",['E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\stage2.py ',data.start_ann_conversion]);
					pyScript.stdout.on("data",(data)=>{
						console.log("python execute output:"+data);
						currentPanel?.webview.postMessage(JSON.stringify({"stage2Data":data.toString()})+"");
					});
					pyScript.stderr.on("data",(err)=>{
						console.log("python execute err output:"+err.toString());
						currentPanel?.webview.postMessage(JSON.stringify({"stage2Data":err.toString()})+"");
					});
				}else if(data.start_simulate_from_ann){
					// 开始使用转换后的ANN 放到模拟器上运行
					console.log("Start building SNN from ANN and running on simulator...");
					console.log("uploaded mode path: "+uploadedANNModelPath.toString());
					let modeName = uploadedANNModelPath.split("\\")[uploadedANNModelPath.split("\\").length-1];
					let modeNameList = modeName.split("_");
					modeNameList.splice(1,0,"normed");
					modeName = modeNameList.join("_");
					let uploadedANNModelPathList = uploadedANNModelPath.split("\\").slice(0,uploadedANNModelPath.split("\\").length-1);
					uploadedANNModelPathList.push(modeName);
					uploadedANNModelPath = uploadedANNModelPathList.join("\\");
					console.log("normed model path:"+uploadedANNModelPath.toString());

					let pyScript = child_process.spawn("python",["E:\\courses\\ZJLab\\IDE设计相关文档\\darwin2\\src\\module\\darsim\\main.py", "E:\\courses\\ZJLab\\IDE设计相关文档\\nn_convertor\\ann_model_descs\\fcn_normed_model.h5"]);
					pyScript.stdout.on("data",(data)=>{
						console.log(data.toString());
						currentPanel?.webview.postMessage(JSON.stringify({"convertedSNNSimu":data.toString()})+"");
					});
					pyScript.stderr.on("data",(err)=>{
						console.log(err.toString());
						currentPanel?.webview.postMessage(JSON.stringify({"convertedSNNSimu":err.toString()})+"");
					});
				}else if(data.saveLogFile){
					console.log("保存日志文件，目标路径："+data.saveLogFile.toString());
					console.log("保存日志文件内容："+data.logData.toString());
					fs.writeFileSync(path.join(data.saveLogFile.toString(),"ide_log.txt"),data.logData.toString());
				}
			},undefined,context.subscriptions);

			currentPanel.onDidDispose(()=> {currentPanel=undefined;}, null,context.subscriptions);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

