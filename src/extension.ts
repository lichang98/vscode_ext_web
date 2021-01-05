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
			currentPanel = vscode.window.createWebviewPanel("darwin2web", "Darwin IDE",vscode.ViewColumn.One,{localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath))], enableScripts:true,retainContextWhenHidden:true});
			const onDiskPath = vscode.Uri.file(path.join(context.extensionPath,"resources","index.html"));
			let val = onDiskPath.with({scheme: "vscode-resource"});
			let pathStr = val.toString();
			// console.log("pathStr:"+pathStr);
			pathStr="E:\\courses\\ZJLab\\IDE-related-docs\\darwin2\\src\\resources\\index_page.html";

			fs.readFile(pathStr,'UTF-8',(err,fcontent)=>{
				console.log("file content:\n"+fcontent.toString());
				console.log("error:"+err?.message);
			});
			let buf = fs.readFileSync(pathStr,"UTF-8");
			currentPanel.webview.html = getIndexPage(
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","train_snn.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","model_pool.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","mapper.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","darwin_os.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_up_arrow.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_btm_arrow.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_up_arrow.png"))),
				currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_btm_arrow.png")))
			);

			currentPanel.webview.onDidReceiveMessage(function(msg){
				console.log("extension receive msg:"+JSON.parse(msg));
				var data = JSON.parse(msg);
				if(data.click){
					console.log("click msg, val is "+data.click);
					if(data.click === "convertor"){
						console.log("prepare jump to convertor page...");
						if(currentPanel){
							currentPanel.webview.html = getConvertorPage();
						}
					}else if(data.click === "index"){
						console.log("prepare jump to index page...");;
						if(currentPanel){
							currentPanel.webview.html = getIndexPage(
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","convertor_log.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","train_snn.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","model_pool.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","mapper.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","darwin_os.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_up_arrow.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","left_btm_arrow.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_up_arrow.png"))),
								currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath,"src","resources","imgs","right_btm_arrow.png")))
							);
						}
					}
				}
			});
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
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getConvertorPage():string{
	return `<!DOCTYPE html>
	<html>
	<!-- Latest 当前转换器页面 -->
	<head>
	  <meta charset="UTF-8">
	  <title>Darwin IDE</title>
	</head>
	
	<body>
	
	
		<div class="row card" style="margin-left: 10%;margin-right: 20%">
			<li><a id="back_to_index_page" class="btn-floating blue darken-1"><i class="material-icons">arrow_back</i></a></li>
			<span class="card-title" style="display: block;margin: 0 auto;text-align: center;">转换流程</span>
	  
			<div class="card-action">
	  
			  <div style="position: absolute; margin-top: -30px;margin-left: 2%;">
				<div class="fixed-action-btn click-to-toggle direction-bottom" style="position: absolute;display: inline-block;left: 10px;top: 30px;">
				  <a class="btn-floating btn-middle teal pulse">
					<i class="large material-icons">open_in_browser</i>
				  </a>
				  <ul>
					<li><a class="btn-floating teal btn-middle"><i class="material-icons">attach_file</i></a></li>
					<li><a class="btn-floating blue darken-1"><i class="material-icons">developer_board</i></a></li>
				  </ul>
				</div>
			  </div>
	  
			  <div style="height: 100px;width: 120px;position: relative;" class="col s1 m1">
				<p style="position: absolute;bottom: 20px;">导入数据与模型</p>
			  </div>
	  
			  <div style="height: 100px;width: 120px;" class="col s1 m1">
				<a class="btn-floating pulse" style="display: block;margin-left: 15%;">
				  <i class="material-icons">poll</i>
				</a>
				<p>数据预处理</p>
			  </div>
		
			  <div style="height: 100px;width: 120px;" class="col s1 m1">
				<a class="btn-floating pulse" style="display: block;margin-left: 15%;">
				  <i class="material-icons">build</i>
				</a>
				<p>参数调整校验</p>
			  </div>
		
			  <div style="height: 100px;width: 120px;" class="col s1 m1">
				<a class="btn-floating pulse" style="display: block;margin-left: 15%;">
				  <i class="material-icons">autorenew</i>
				</a>
				<p>模型转换与仿真</p>
			  </div>
			</div>
		  </div>
	
	
	</body>
	<style>
	  @font-face {
		font-family: 'Material Icons';
		font-style: normal;
		font-weight: 400;
		src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.com/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
	  }
	
	  .material-icons {
		font-family: 'Material Icons';
		font-weight: normal;
		font-style: normal;
		font-size: 24px;
		line-height: 1;
		text-transform: none;
		display: inline-block;
		-webkit-font-feature-settings: 'liga';
		-webkit-font-smoothing: antialiased;
	  }
	
	  body {
	  background-color: #E6E6FA;
	}
	</style>
	<!-- Compiled and minified CSS -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.2.0/joint.min.css" integrity="sha512-jbRbA7sm8P3kN9fDTJi2iTKr9mBQra6KOxbi8wr2jXwp730G1l+jGmNRdV6PUDTTrcAHXIq0w3jGpkRRbQQmlw==" crossorigin="anonymous" />
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
	
	
	<!-- Compiled and minified JavaScript -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
	<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js" integrity="sha512-90vH1Z83AJY9DmlWa8WkjkV79yfS2n2Oxhsi2dZbIv0nC4E6m5AbH8Nh156kkM7JePmqD6tcZsfad1ueoaovww==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js" integrity="sha512-9EgQDzuYx8wJBppM4hcxK8iXc5a1rFLp/Chug4kIcSWRDEgjMiClF8Y3Ja9/0t8RDDg19IfY5rs6zaPS9eaEBw==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.2.0/joint.min.js" integrity="sha512-HZoV7Eg7cGc3ChWH2M5rEUNaVbL1jRRRv2TUnMR0x5GLCcAqsFuVoETVMs1nhVhS8cIL6QEhyXpShgT7MwLmLA==" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
	
	<script>
		const vscode = acquireVsCodeApi();
	  document.addEventListener('DOMContentLoaded', function() {
		  var elems = document.querySelectorAll('.fixed-action-btn');
		  var instances = M.FloatingActionButton.init(elems, {"hoverEnabled":false});
		});
	
	$("#back_to_index_page").on("click",function(){
	  console.log("jump back to main page");
	  vscode.postMessage(JSON.stringify({"click":"index"}));
	});
	
	
	</script>
	</html>`;
}

function getIndexPage(convertor_img:vscode.Uri, snn_train_img:vscode.Uri, model_store_img:vscode.Uri,
	mapper_img:vscode.Uri, os_img:vscode.Uri,
	left_up:vscode.Uri,
	left_btm:vscode.Uri,
	right_up:vscode.Uri,
	right_btm:vscode.Uri):string{
	return `<!DOCTYPE html>
	<html>
	<!-- Latest 当前主界面 -->
	<head>
	  <meta charset="UTF-8">
	  <title>Darwin IDE</title>
	</head>
	
	<body>
	
	  <div class="row" style="width: 50%; height: 50%;">
		<div class="col m5 s5 z-depth-4">
		  <div class="card">
			<div class="card-image">
			  <img src="${convertor_img}">
			  <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: 16px;">模型转换器</span>
			  <a id="convertor_btn" class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
			</div>
			<div class="card-content">
			  <p>提供从ANN转换到SNN的功能</p>
			</div>
		  </div>
		</div>
	
		<div class="col m5 s5 offset-s2 offset-m1 z-depth-4">
		  <div class="card">
			<div class="card-image">
			  <img src="${snn_train_img}">
			  <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: 16px;">SNN训练器</span>
			  <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
			</div>
			<div class="card-content">
			  <p>提供构建以及训练SNN的功能</p>
			</div>
		  </div>
		</div>
	  </div>
	
	  <img src="${left_up}" style="margin-left: 400px;display: inline-block;">
	  <img src="${right_up}" style="margin-left: 220px;display: inline-block;">
	
	  <div class="row" style="width: 30%;height: 30%;">
		<div class="col offset-m3 m5 z-depth-4">
		  <div class="card">
			<div class="card-image">
			  <img src="${model_store_img}"/>
			  <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: 16px;">数据池</span>
			  <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
			</div>
			<div class="card-content">
			  <p>存储并管理对ANN与SNN模型的访问</p>
			</div>
		  </div>
		</div>
	  </div>
	
	  <img src="${left_btm}" style="margin-left: 420px;display: inline-block;">
	  <img src="${right_btm}" style="margin-left: 220px;display: inline-block;">
	
	  <div class="row" style="width: 50%; height: 50%;">
		<div class="col m5 s5 z-depth-4">
		  <div class="card">
			<div class="card-image">
			  <img src="${mapper_img}">
			  <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: 16px;">SNN映射器</span>
			  <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
			</div>
			<div class="card-content">
			  <p>提供SNN模型转换为可运行在达尔文类脑芯片上文件的功能</p>
			</div>
		  </div>
		</div>
	
		<div class="col m5 s5 offset-s1 offset-m1 z-depth-4">
		  <div class="card">
			<div class="card-image">
			  <img src="${os_img}">
			  <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: 16px;">类脑操作系统</span>
			  <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
			</div>
			<div class="card-content">
			  <p>提供达尔文类脑芯片硬件与应用运行管理功能</p>
			</div>
		  </div>
		</div>
	  </div>
	
	
	  </div>
	</body>
	<style>
	  @font-face {
		font-family: 'Material Icons';
		font-style: normal;
		font-weight: 400;
		src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.com/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
	  }
	
	  .material-icons {
		font-family: 'Material Icons';
		font-weight: normal;
		font-style: normal;
		font-size: 24px;
		line-height: 1;
		text-transform: none;
		display: inline-block;
		-webkit-font-feature-settings: 'liga';
		-webkit-font-smoothing: antialiased;
	  }

	  body {
		background-color: #E6E6FA;
	  }

	</style>
	<!-- Compiled and minified CSS -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.2.0/joint.min.css" integrity="sha512-jbRbA7sm8P3kN9fDTJi2iTKr9mBQra6KOxbi8wr2jXwp730G1l+jGmNRdV6PUDTTrcAHXIq0w3jGpkRRbQQmlw==" crossorigin="anonymous" />
	
	
	<!-- Compiled and minified JavaScript -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
	<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js" integrity="sha512-90vH1Z83AJY9DmlWa8WkjkV79yfS2n2Oxhsi2dZbIv0nC4E6m5AbH8Nh156kkM7JePmqD6tcZsfad1ueoaovww==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.0/backbone-min.js" integrity="sha512-9EgQDzuYx8wJBppM4hcxK8iXc5a1rFLp/Chug4kIcSWRDEgjMiClF8Y3Ja9/0t8RDDg19IfY5rs6zaPS9eaEBw==" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.2.0/joint.min.js" integrity="sha512-HZoV7Eg7cGc3ChWH2M5rEUNaVbL1jRRRv2TUnMR0x5GLCcAqsFuVoETVMs1nhVhS8cIL6QEhyXpShgT7MwLmLA==" crossorigin="anonymous"></script>
	<script>
	const vscode = acquireVsCodeApi();
  
	$("#convertor_btn").on("click",function(){
	  console.log("jump into convertor page");
	  vscode.postMessage(JSON.stringify({"click":"convertor"}));
	});
  

	</script>

	</html>`;
}

function get_main_page(img:vscode.Uri):string{
	return `<!DOCTYPE html>
	<html lang="en">
	
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		
		<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
		<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
		<script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
		<style type="text/css">
			.circle{
				width: 30px;
				height: 30px;
				background: rgb(14, 18, 219);
				-webkit-border-radius:35px;
				border-radius: 35px;
				vertical-align:middle;
			}
			.arrow-right:after {
					content: "";
					display: inline-block !important;
					width: 0;
					height: 0;
					border-left: 8px solid #C8A962;
					border-top: 8px solid transparent;
					border-bottom: 8px solid transparent;
					vertical-align: middle;
	
				}
				.arrow-right:before {
					width: 20px;
					height: 2px;
					background: #C8A962;
					content: "";
					display: inline-block;
					vertical-align: middle;
				}
		</style>
		<title>Darwin IDE</title>
	</head>
	<body>
	
		<img src="${img}" style="width: 50%;"/>
	
	</body>
	<script>
	
	</script>
	</html>`;
}
