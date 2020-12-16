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
			const onDiskPath = vscode.Uri.file(path.join(context.extensionPath,"src","resources","mainpage.html"));
			let val = onDiskPath.with({scheme: "vscode-resource"});
			let pathStr = val.toString();
			// console.log("pathStr:"+pathStr);
			pathStr="C:\\Users\\32344\\Downloads\\darwin2\\src\\resources\\mainpage.html";
			// fs.readFile(pathStr,'UTF-8',(err,fcontent)=>{
			// 	console.log("file content:\n"+fcontent.toString());
			// 	console.log("error:"+err?.message);
			// });
			let buf = fs.readFileSync(pathStr,"UTF-8");
			// console.log("Sync read: "+buf.toString());
			currentPanel.webview.html = buf.toString();
			currentPanel.webview.onDidReceiveMessage(message =>{
				console.log("extension receive msg: "+message);
			},undefined,context.subscriptions);

			let pyScript = child_process.spawn("python",['C:\\Users\\32344\\Downloads\\darwin2\\test.py']);
			pyScript.stdout.on("data",(data)=>{
				console.log("python execued output:"+data);
				currentPanel?.webview.postMessage({"data":data.toString()});
			});


			currentPanel.onDidDispose(()=> {currentPanel=undefined;}, null,context.subscriptions);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

