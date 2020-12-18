// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from "child_process";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "Darwin IDE",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(context.extensionPath)], enableScripts:true,retainContextWhenHidden:true});
			const onDiskPath = vscode.Uri.file(path.join(context.extensionPath,"src","resources","index.html"));
			let val = onDiskPath.with({scheme: "vscode-resource"});
			let pathStr = val.toString();
			// console.log("pathStr:"+pathStr);
			pathStr="C:\\Users\\32344\\Downloads\\darwin2\\src\\resources\\index.html";
			// fs.readFile(pathStr,'UTF-8',(err,fcontent)=>{
			// 	console.log("file content:\n"+fcontent.toString());
			// 	console.log("error:"+err?.message);
			// });
			let buf = fs.readFileSync(pathStr,"UTF-8");
			// console.log("Sync read: "+buf.toString());
			currentPanel.webview.html = buf.toString();
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
					console.log("Test data are in directory: ["+data.upload_testdata_dirpath+"]");
					uploadedTestDataDirPath = data.upload_testdata_dirpath;
				}else if(data.start_data_preprocess){
					// 开始数据预处理
					console.log("receive convert ann command from webview");
					let pyScript = child_process.spawn("python",['C:\\Users\\32344\\Downloads\\nn_convertor\\stage1.py ', uploadedTestDataDirPath]);
					pyScript.stdout.on("data",(data)=>{
						console.log("python executed output:"+data);
						currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":data.toString()})+"");
					});
					pyScript.stderr.on("data",(err)=>{
						console.log("python executed err output:"+err.toString());
						currentPanel?.webview.postMessage(JSON.stringify({"stage1Data":err.toString()})+"");
					});
				}
			},undefined,context.subscriptions);

			currentPanel.onDidDispose(()=> {currentPanel=undefined;}, null,context.subscriptions);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

