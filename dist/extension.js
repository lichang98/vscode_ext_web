module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const fs = __webpack_require__(3);
const axios = __webpack_require__(4);
// 引入 TreeViewProvider 的类
const TreeViewProvider_1 = __webpack_require__(51);
const multiLevelTree_1 = __webpack_require__(52);
const get_convertor_page_v2_1 = __webpack_require__(53);
const child_process_1 = __webpack_require__(54);
let local_server = undefined;
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
function activate(context) {
    // 实现树视图的初始化
    let treeview = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("treeView-item");
    let treeviewConvertor = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_convertor");
    let treeViewSimulator = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_simulator");
    let treeViewConvertDarLang = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_darwinLang_convertor");
    let treeViewSNNModelView = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_snn_model_view");
    let treeViewNewProj = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("new_project_act_view-item");
    let treeViewLoadProj = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("load_proj_act_view-item");
    // let treeViewBinConvertDarLang = TreeViewProvider.initTreeViewItem("item_bin_darwinlang_convertor");
    let treeviewHome = vscode.window.createTreeView("treeView-item", { treeDataProvider: treeview });
    let treeViewCvtor = vscode.window.createTreeView("item_convertor", { treeDataProvider: treeviewConvertor });
    let treeViewSim = vscode.window.createTreeView("item_simulator", { treeDataProvider: treeViewSimulator });
    let treeViewCvtDarLang = vscode.window.createTreeView("item_darwinLang_convertor", { treeDataProvider: treeViewConvertDarLang });
    let treeViewSNNMD = vscode.window.createTreeView("item_snn_model_view", { treeDataProvider: treeViewSNNModelView });
    let treeViewNPView = vscode.window.createTreeView("new_project_act_view-item", { treeDataProvider: treeViewNewProj });
    let treeViewProjLoadView = vscode.window.createTreeView("load_proj_act_view-item", { treeDataProvider: treeViewLoadProj });
    function is_all_invisible() {
        return !treeviewHome.visible && !treeViewCvtor.visible && !treeViewSim.visible && !treeViewCvtDarLang.visible
            && !treeViewSNNMD.visible && !treeViewNPView.visible && !treeViewProjLoadView.visible;
    }
    treeViewCvtor.onDidChangeVisibility((evt) => {
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
        if (evt.visible) {
            console.log("activity bar 转换图标被点击, treeview convertor 可见...");
            if (currentPanel && currentPanel.title === "模型转换") {
                currentPanel.webview.postMessage(JSON.stringify({ "ann_model_start_convert": "yes" }));
                treeviewHome.reveal(treeview.data[0]);
            }
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    if (currentPanel && currentPanel.title === "模型转换") {
                        currentPanel.webview.postMessage(JSON.stringify({ "ann_model_start_convert": "yes" }));
                        treeviewHome.reveal(treeview.data[0]);
                    }
                }
                treeviewHome.reveal(treeview.data[0]);
            }, 100);
        }
    });
    treeViewNPView.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("新项目创建...");
            vscode.commands.executeCommand("treeView-item.newproj");
            treeviewHome.reveal(treeview.data[0]);
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    // treeViewNPView.reveal(treeViewNewProj.data[0]);
                    treeviewHome.reveal(treeview.data[0]);
                    vscode.commands.executeCommand("treeView-item.newproj");
                }
                else {
                    return;
                }
            }, 100);
            console.log("创建新项目隐藏...");
        }
    });
    treeViewProjLoadView.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("加载已有项目....");
            console.log("加载已有项目 命令执行..");
            vscode.commands.executeCommand("treeView.proj_load");
            treeviewHome.reveal(treeview.data[0]);
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    console.log("加载已有项目  reveal..");
                    treeviewHome.reveal(treeview.data[0]);
                    // treeViewProjLoadView.reveal(treeViewLoadProj.data[0]);
                    console.log("加载已有项目 命令执行..");
                    vscode.commands.executeCommand("treeView.proj_load");
                }
                else {
                    console.log("加载已有项目 隐藏...");
                    return;
                }
            }, 100);
        }
    });
    treeViewSim.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("模拟页面可用！");
            // 点击仿真器快捷方式，启动仿真
            treeviewHome.reveal(treeview.data[0]);
            vscode.commands.executeCommand("item_simulator.start_simulate");
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    // treeViewSim.reveal(treeViewSimulator.data[0]);
                    treeviewHome.reveal(treeview.data[0]);
                    // 点击仿真器快捷方式，启动仿真
                    vscode.commands.executeCommand("item_simulator.start_simulate");
                    console.log("模拟页面隐藏...");
                }
                else {
                    return;
                }
            }, 100);
        }
    });
    treeViewSNNMD.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("SNN模型页面可用！");
            treeviewHome.reveal(treeview.data[0]);
            vscode.commands.executeCommand("snn_model_ac.show_snn_model");
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    // treeViewSNNMD.reveal(treeViewSNNModelView.data[0]);
                    treeviewHome.reveal(treeview.data[0]);
                    vscode.commands.executeCommand("snn_model_ac.show_snn_model");
                }
                else {
                    return;
                }
            }, 100);
        }
    });
    treeViewCvtDarLang.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("转换darwinlang页面可用!");
            //启动转换生成darwinlang
            treeviewHome.reveal(treeview.data[0]);
            // vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
            vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
        }
        else {
            setTimeout(() => {
                if (is_all_invisible()) {
                    // treeViewCvtDarLang.reveal(treeViewConvertDarLang.data[0]);
                    treeviewHome.reveal(treeview.data[0]);
                    //启动转换生成darwinlang
                    // vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
                    vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
                }
            }, 100);
        }
    });
    let inMemTreeViewStruct = new Array();
    // treeViewBinConvertDarLang.data = inMemTreeViewStruct;
    let x_norm_data_path = undefined;
    let x_test_data_path = undefined;
    let y_test_data_path = undefined;
    let model_file_path = undefined;
    let darwinlang_file_paths = new Array();
    let darwinlang_bin_paths = new Array();
    let panelDataVis = undefined;
    let panelAnnModelVis = undefined;
    let panelSNNModelVis = undefined;
    let panelSNNVisWeb = undefined;
    let proj_desc_info = {
        "project_name": "",
        "project_type": "",
        "python_type": "",
        "ann_lib_type": ""
    };
    let proj_save_path = undefined;
    vscode.window.registerTreeDataProvider("multiLevelTree", new multiLevelTree_1.MultiLevelTreeProvider());
    context.subscriptions.push(vscode.commands.registerCommand("treeView.edit_file", (treeItem) => {
        // 编辑darwinlang
        let file_target = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out", treeItem.label));
        vscode.workspace.openTextDocument(file_target).then((doc) => {
            vscode.window.showTextDocument(doc, 1, false).then(ed => {
                ed.edit(edit => {
                });
            });
        }, (err) => {
            console.log(err);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
        // vscode.window.showInformationMessage(label);
        console.log("label is :[" + label + "]");
        if (label.search("json") !== -1) {
            // 显示可视化的darwin snn 模型结构
            // 执行 darwinlang map 生成脚本
            let tmp_darlang_webview = vscode.window.createWebviewPanel("darwin lang", label, vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            tmp_darlang_webview.webview.html = darlangWebContent();
            tmp_darlang_webview.title = "darwin lang";
            let target_darlang_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out", "snn_digit_darlang.json");
            let command_str = "python " + path.join(__dirname, "load_graph.py") + " " + target_darlang_file_path + " " + path.join(__dirname);
            child_process_1.exec(command_str, (err, stdout, stderr) => {
                tmp_darlang_webview.reveal();
                if (err) {
                    console.log("执行 load_grph.py 错误：" + err);
                }
                else {
                    let map_file_disk = vscode.Uri.file(path.join(__dirname, "map.json"));
                    let file_src = tmp_darlang_webview.webview.asWebviewUri(map_file_disk).toString();
                    tmp_darlang_webview.webview.postMessage({ resultUri: file_src });
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
        }
        else if (label.search("txt") !== -1) {
            // 显示二进制的darlang文件
            console.log("显示二进制的darwinLang");
            let file_target = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "bin_darwin_out", label));
            vscode.workspace.openTextDocument(file_target).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false).then(ed => {
                    ed.edit(edit => {
                    });
                });
            }, (err) => {
                console.log(err);
            });
        }
        else if (label.search(".pickle") !== -1 && label.search("layer") === -1) {
            // 显示pickle 文件的原始内容
            console.log("解析并显示pickle 文件内容");
            // let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label));
            let target_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "bin_darwin_out", "inputs", label);
            var modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
            var command_str = "python " + modelVisScriptPath + " " + target_file_path;
            child_process_1.exec(command_str, function (err, stdout, stderr) {
                console.log("pickle 文件解析结束");
                let file_target = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
                vscode.workspace.openTextDocument(file_target).then((doc) => {
                    vscode.window.showTextDocument(doc, 1, false).then(ed => {
                        ed.edit(edit => { });
                    });
                });
                vscode.workspace.onDidCloseTextDocument(evt => {
                    console.log(evt.fileName + " [is closed");
                    let target_file = evt.fileName;
                    target_file = target_file.replace("\.git", "");
                    fs.unlink(target_file, () => { });
                });
            });
        }
        else if (label.search("layer") !== -1) {
            // 显示layer之间连接pickle文件的原始内容
            console.log("显示layer 连接pickle文件");
            let target_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out", label);
            let modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
            let command_str = "python " + modelVisScriptPath + " " + target_file_path;
            child_process_1.exec(command_str, function (err, stdout, stderr) {
                console.log("layer 连接pickle 文件 " + label + " 解析结束");
                let file_target = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
                vscode.workspace.openTextDocument(file_target).then((doc) => {
                    vscode.window.showTextDocument(doc, 1, false);
                });
            });
        }
        else if (label.search(".png") !== -1) {
            console.log("显示图片");
            let imgPreviewPanel = vscode.window.createWebviewPanel("darwin2web", label, vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            imgPreviewPanel.webview.html = `
			<!DOCTYPE html>
			<html style="height: 100%;width: 100%;">

			<head>
			<meta charset="UTF-8">
			</head>

			<body>
				<img id="sample_img" style="margin:auto;position: absolute;top: 0;left: 0;right: 0;bottom: 0;" 
				src="${imgPreviewPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "dist", "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "bin_darwin_out", "inputs", label)))}" onmousewheel="return bigimg(this)">
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
            imgPreviewPanel.onDidDispose(() => {
                imgPreviewPanel = undefined;
            }, null, context.subscriptions);
            imgPreviewPanel.reveal();
        }
        else if (label === "数据") {
            // 数据可视化
            console.log("单击可视化,数据");
            vscode.commands.executeCommand("treeView-item.datavis", inMemTreeViewStruct[0].children[0]);
        }
        else if (label === "ANN模型") {
            // ANN模型可视化
            console.log("单击可视化，ANN模型");
            vscode.commands.executeCommand("treeView-item.datavis", inMemTreeViewStruct[0].children[1]);
        }
        else if (label === "SNN模型") {
            console.log("SNN模型可视化");
            vscode.commands.executeCommand("snn_model_ac.show_snn_model");
        }
    }));
    function sleep(numberMillis) {
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
    let currentPanel = undefined;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
        // 启动后台资源server
        let scriptPath = path.join(__dirname, "inner_scripts", "img_server.py");
        let command_str = "python " + scriptPath;
        console.log("prepare to start img server.");
        local_server = child_process_1.exec(command_str, function (err, stdout, stderr) {
            console.log("img server started");
        });
        sleep(1000);
        // The code you place here will be executed every time your command is executed
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        treeviewHome.reveal(treeview.data[0]);
        if (currentPanel) {
            currentPanel.reveal(columnToShowIn);
        }
        else {
            currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            // 主界面由electron 应用启动
            currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
            currentPanel.webview.onDidReceiveMessage(function (msg) {
                var _a, _b;
                console.log("Receive message: " + msg);
                let data = JSON.parse(msg);
                if (data.click) {
                    console.log("Click message, val is: " + data.click);
                    if (data.click === "convertor_page") {
                        console.log("Jump to convertor page");
                        if (currentPanel) {
                            currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
                            currentPanel.title = "转换器";
                        }
                    }
                }
                else if (data.project_info) {
                    // 接收到webview 项目创建向导的消息，创建新的项目
                    console.log("receive project create info");
                    console.log("project name: " + data.project_info.project_name + ", project type=" + data.project_info.project_type
                        + ", python_type: " + data.project_info.python_type + ", ann lib type:" + data.project_info.ann_lib_type);
                    proj_desc_info.project_name = data.project_info.project_name;
                    proj_desc_info.project_type = data.project_info.project_type;
                    proj_desc_info.python_type = data.project_info.python_type;
                    proj_desc_info.ann_lib_type = data.project_info.ann_lib_type;
                    TreeViewProvider_1.addSlfProj(data.project_info.project_name);
                    inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(data.project_info.project_name, [new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []),
                            new TreeViewProvider_1.TreeItemNode("测试数据标签", [])]), new TreeViewProvider_1.TreeItemNode("ANN模型", [])], true));
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
                else if (data.project_refac_info) {
                    // 接收到webview 项目属性修改的信息
                    console.log("receive project refactor info");
                    proj_desc_info.project_name = data.project_refac_info.project_name;
                    proj_desc_info.project_type = data.project_refac_info.project_type;
                    proj_desc_info.python_type = data.project_refac_info.python_type;
                    proj_desc_info.ann_lib_type = data.project_refac_info.ann_lib_type;
                    let treeItemsSize = inMemTreeViewStruct.length;
                    inMemTreeViewStruct[treeItemsSize - 1].label = proj_desc_info.project_name;
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
                else if (data.model_convert_params) {
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
                    let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py " + web_param_vthresh + " " +
                        web_param_neurondt + " " + web_param_synapse_dt + " " + web_param_delay + " " + web_param_dura + " " + path.basename(proj_save_path).replace("\.dar2", ""));
                    let command_str = "python " + scriptPath;
                    currentPanel === null || currentPanel === void 0 ? void 0 : currentPanel.webview.postMessage(JSON.stringify({ "log_output": "模型转换程序启动中......" }));
                    let scriptProcess = child_process_1.exec(command_str, {});
                    (_a = scriptProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                        console.log(data);
                        if (data.indexOf("CONVERT_FINISH") !== -1) {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "progress": "convert_finish" }));
                            }
                        }
                        else if (data.indexOf("PREPROCESS_FINISH") !== -1) {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "progress": "preprocess_finish" }));
                            }
                        }
                        else if (data.indexOf("SEARCH_FINISH") !== -1) {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "progress": "search_finish" }));
                            }
                        }
                        if (currentPanel) {
                            let formatted_data = data.split("\r\n").join("<br/>");
                            currentPanel.webview.postMessage(JSON.stringify({ "log_output": formatted_data }));
                        }
                    });
                    (_b = scriptProcess.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
                        console.log(data);
                    });
                    scriptProcess.on("exit", function () {
                        // 进程结束，发送结束消息
                        if (currentPanel) {
                            currentPanel.webview.postMessage(JSON.stringify({ "exec_finish": "yes" }));
                            fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
                                if (currentPanel) {
                                    currentPanel.webview.postMessage(JSON.stringify({ "snn_info": data }));
                                }
                            });
                            fs.readFile(path.join(__dirname, "inner_scripts", "convert_statistic_info.json"), "utf-8", (evt, data) => {
                                if (currentPanel) {
                                    currentPanel.webview.postMessage(JSON.stringify({ "convert_info": data }));
                                }
                            });
                            fs.readFile(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", ""), "log", "gui", "test", "normalization", "99.9.json"), "utf-8", (evt, data) => {
                                if (currentPanel) {
                                    currentPanel.webview.postMessage(JSON.stringify({ "scale_factors": data }));
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
                }
                else if (data.select_save_proj_path_req) {
                    // 选择项目的保存路径
                    console.log("select path for saving project, proj name=" + data.select_save_proj_path_req);
                    const options = {
                        canSelectFiles: false,
                        canSelectFolders: true,
                        openLabel: "选择目录",
                        title: "选择项目保存位置"
                    };
                    vscode.window.showOpenDialog(options).then(fileUri => {
                        if (fileUri) {
                            console.log("选择的项目保存路径为：" + fileUri[0].fsPath);
                            proj_save_path = path.join(fileUri[0].fsPath, data.select_save_proj_path_req + ".dar2");
                            if (currentPanel) {
                                console.log("发送保存路径到webview..., 路径=" + proj_save_path);
                                currentPanel.webview.postMessage(JSON.stringify({ "proj_select_path": proj_save_path }));
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
    function initCurrentPanel() {
        currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
        // 主界面由electron 应用启动
        currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
        currentPanel.webview.onDidReceiveMessage(function (msg) {
            var _a, _b;
            console.log("Receive message: " + msg);
            let data = JSON.parse(msg);
            if (data.click) {
                console.log("Click message, val is: " + data.click);
                if (data.click === "convertor_page") {
                    console.log("Jump to convertor page");
                    if (currentPanel) {
                        currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
                        currentPanel.title = "转换器";
                    }
                }
            }
            else if (data.project_info) {
                // 接收到webview 项目创建向导的消息，创建新的项目
                console.log("receive project create info");
                console.log("project name: " + data.project_info.project_name + ", project type=" + data.project_info.project_type
                    + ", python_type: " + data.project_info.python_type + ", ann lib type:" + data.project_info.ann_lib_type);
                proj_desc_info.project_name = data.project_info.project_name;
                proj_desc_info.project_type = data.project_info.project_type;
                proj_desc_info.python_type = data.project_info.python_type;
                proj_desc_info.ann_lib_type = data.project_info.ann_lib_type;
                TreeViewProvider_1.addSlfProj(data.project_info.project_name);
                inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(data.project_info.project_name, [new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []),
                        new TreeViewProvider_1.TreeItemNode("测试数据标签", [])]), new TreeViewProvider_1.TreeItemNode("ANN模型", [])], true));
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
            else if (data.project_refac_info) {
                // 接收到webview 项目属性修改的信息
                console.log("receive project refactor info");
                proj_desc_info.project_name = data.project_refac_info.project_name;
                proj_desc_info.project_type = data.project_refac_info.project_type;
                proj_desc_info.python_type = data.project_refac_info.python_type;
                proj_desc_info.ann_lib_type = data.project_refac_info.ann_lib_type;
                let treeItemsSize = inMemTreeViewStruct.length;
                inMemTreeViewStruct[treeItemsSize - 1].label = proj_desc_info.project_name;
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
            else if (data.model_convert_params) {
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
                let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py " + web_param_vthresh + " " +
                    web_param_neurondt + " " + web_param_synapse_dt + " " + web_param_delay + " " + web_param_dura + " " + path.basename(proj_save_path).replace("\.dar2", ""));
                let command_str = "python " + scriptPath;
                currentPanel === null || currentPanel === void 0 ? void 0 : currentPanel.webview.postMessage(JSON.stringify({ "log_output": "模型转换程序启动中......" }));
                let scriptProcess = child_process_1.exec(command_str, {});
                (_a = scriptProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                    console.log(data);
                    if (data.indexOf("CONVERT_FINISH") !== -1) {
                        if (currentPanel) {
                            currentPanel.webview.postMessage(JSON.stringify({ "progress": "convert_finish" }));
                        }
                    }
                    else if (data.indexOf("PREPROCESS_FINISH") !== -1) {
                        if (currentPanel) {
                            currentPanel.webview.postMessage(JSON.stringify({ "progress": "preprocess_finish" }));
                        }
                    }
                    else if (data.indexOf("SEARCH_FINISH") !== -1) {
                        if (currentPanel) {
                            currentPanel.webview.postMessage(JSON.stringify({ "progress": "search_finish" }));
                        }
                    }
                    if (currentPanel) {
                        let formatted_data = data.split("\r\n").join("<br/>");
                        currentPanel.webview.postMessage(JSON.stringify({ "log_output": formatted_data }));
                    }
                });
                (_b = scriptProcess.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (data) {
                    console.log(data);
                });
                scriptProcess.on("exit", function () {
                    // 进程结束，发送结束消息
                    if (currentPanel) {
                        currentPanel.webview.postMessage(JSON.stringify({ "exec_finish": "yes" }));
                        fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "snn_info": data }));
                            }
                        });
                        fs.readFile(path.join(__dirname, "inner_scripts", "convert_statistic_info.json"), "utf-8", (evt, data) => {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "convert_info": data }));
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
            }
            else if (data.select_save_proj_path_req) {
                // 选择项目的保存路径
                console.log("select path for saving project, proj name=" + data.select_save_proj_path_req);
                const options = {
                    canSelectFiles: false,
                    canSelectFolders: true,
                    openLabel: "选择目录",
                    title: "选择项目保存位置"
                };
                vscode.window.showOpenDialog(options).then(fileUri => {
                    if (fileUri) {
                        console.log("选择的项目保存路径为：" + fileUri[0].fsPath);
                        proj_save_path = path.join(fileUri[0].fsPath, data.select_save_proj_path_req + ".dar2");
                        if (currentPanel) {
                            console.log("发送保存路径到webview..., 路径=" + proj_save_path);
                            currentPanel.webview.postMessage(JSON.stringify({ "proj_select_path": proj_save_path }));
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
        if (currentPanel) {
            currentPanel.webview.postMessage({ "command": "CreateNewProject" });
        }
    });
    context.subscriptions.push(disposable2);
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_rename", () => {
        console.log("项目属性修改");
        // 发消息到webview
        if (currentPanel) {
            currentPanel.webview.postMessage({ "command": "ProjectRefactor", "project_desc": proj_desc_info });
        }
    }));
    //项目保存
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_save", () => {
        const options = {
            saveLabel: "保存项目",
            filters: { "Darwin2 Project": ['dar2'] },
            defaultUri: vscode.Uri.file(proj_save_path)
        };
        vscode.window.showSaveDialog(options).then(fileUri => {
            if (fileUri && fileUri) {
                console.log("selected path: " + fileUri.fsPath);
                // TODO 写入项目信息
                let data = {
                    "proj_info": proj_desc_info,
                    "x_norm_path": x_norm_data_path,
                    "x_test_path": x_test_data_path,
                    "y_test_path": y_test_data_path,
                    "model_path": model_file_path,
                    "darwinlang_file_paths": darwinlang_file_paths,
                    "darwinlang_bin_paths": darwinlang_bin_paths
                };
                fs.writeFileSync(fileUri.fsPath, JSON.stringify(data));
            }
        });
    }));
    // 项目加载
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_load", () => {
        const options = {
            openLabel: "导入工程",
            filters: { "Darwin2Project": ['dar2'] }
        };
        vscode.window.showOpenDialog(options).then(fileUri => {
            var _a, _b, _c, _d, _e;
            if (fileUri) {
                console.log("opened project path = " + fileUri[0].fsPath);
                proj_save_path = fileUri[0].fsPath;
                let data = fs.readFileSync(fileUri[0].fsPath);
                console.log("读取的信息：proj_info=" + data);
                let proj_data = JSON.parse(data.toString());
                proj_desc_info = proj_data.proj_info;
                x_norm_data_path = proj_data.x_norm_path;
                x_test_data_path = proj_data.x_test_path;
                y_test_data_path = proj_data.y_test_path;
                model_file_path = proj_data.model_path;
                darwinlang_file_paths = proj_data.darwinlang_file_paths;
                darwinlang_bin_paths = proj_data.darwinlang_bin_paths;
                console.log("导入工程的x_norm 文件路径为：" + x_norm_data_path);
                if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")))) {
                    fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")));
                }
                let target_proj_name = path.basename(proj_save_path).replace("\.dar2", "");
                if (x_norm_data_path) {
                    fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name, "x_norm.npz"), function (err) {
                    });
                }
                if (x_test_data_path) {
                    fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name, "x_test.npz"), function (err) {
                    });
                }
                if (y_test_data_path) {
                    fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", target_proj_name, "y_test.npz"), function (err) {
                    });
                }
                if (model_file_path) {
                    fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", target_proj_name, "mnist_cnn.h5"), function (err) {
                    });
                }
                // 显示treeview
                TreeViewProvider_1.addSlfProj(proj_desc_info.project_name);
                inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(proj_desc_info.project_name, [new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []),
                        new TreeViewProvider_1.TreeItemNode("测试数据标签", [])]), new TreeViewProvider_1.TreeItemNode("ANN模型", [])], true));
                TreeViewProvider_1.addSlfFile("x_norm");
                TreeViewProvider_1.addSlfFile("x_test");
                TreeViewProvider_1.addSlfFile("y_test");
                TreeViewProvider_1.addSlfFile(path.basename(proj_data.model_path));
                if (proj_data.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[0].children) {
                    if (inMemTreeViewStruct[0].children[0].children[0].children) {
                        inMemTreeViewStruct[0].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("x_norm"));
                    }
                    if (inMemTreeViewStruct[0].children[0].children[1].children) {
                        inMemTreeViewStruct[0].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("x_test"));
                    }
                    if (inMemTreeViewStruct[0].children[0].children[2].children) {
                        inMemTreeViewStruct[0].children[0].children[2].children.push(new TreeViewProvider_1.TreeItemNode("y_test"));
                    }
                }
                if (proj_data.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[1]) {
                    (_a = inMemTreeViewStruct[0].children[1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("model_file_" + path.basename(proj_data.model_path)));
                }
                // add darwinlang and bin files
                // ITEM_ICON_MAP.set("SNN模型","imgs/darwin_icon_model_new.png");
                TreeViewProvider_1.addDarwinFold("SNN模型");
                (_b = inMemTreeViewStruct[0].children) === null || _b === void 0 ? void 0 : _b.push(new TreeViewProvider_1.TreeItemNode("SNN模型", []));
                for (let i = 0; i < darwinlang_file_paths.length; ++i) {
                    // ITEM_ICON_MAP.set(path.basename(darwinlang_file_paths[i].toString()),"imgs/data_file_icon_new.png");
                    TreeViewProvider_1.addDarwinFiles(path.basename(darwinlang_file_paths[i].toString()));
                    if (inMemTreeViewStruct[0].children) {
                        var child_len = inMemTreeViewStruct[0].children.length;
                        (_c = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _c === void 0 ? void 0 : _c.push(new TreeViewProvider_1.TreeItemNode(path.basename(darwinlang_file_paths[i].toString())));
                    }
                }
                // ITEM_ICON_MAP.set("SNN二进制模型", "imgs/darwin_icon_model_new.png");
                TreeViewProvider_1.addDarwinFold("SNN二进制模型");
                (_d = inMemTreeViewStruct[0].children) === null || _d === void 0 ? void 0 : _d.push(new TreeViewProvider_1.TreeItemNode("SNN二进制模型", []));
                for (let i = 0; i < darwinlang_bin_paths.length; ++i) {
                    if (path.basename(darwinlang_bin_paths[i].toString()).indexOf("clear") >= 0 ||
                        path.basename(darwinlang_bin_paths[i].toString()).indexOf("enable") >= 0 ||
                        path.basename(darwinlang_bin_paths[i].toString()).indexOf("re_config") >= 0 ||
                        path.basename(darwinlang_bin_paths[i].toString()).indexOf("nodelist") >= 0 ||
                        path.basename(darwinlang_bin_paths[i].toString()).indexOf("linkout") >= 0 ||
                        path.basename(darwinlang_bin_paths[i].toString()).indexOf("layerWidth") >= 0) {
                        continue;
                    }
                    if (inMemTreeViewStruct[0].children) {
                        var child_len = inMemTreeViewStruct[0].children.length;
                        // ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
                        TreeViewProvider_1.addDarwinFiles(path.basename(darwinlang_bin_paths[i].toString()));
                        (_e = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _e === void 0 ? void 0 : _e.push(new TreeViewProvider_1.TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
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
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_remove", (item) => {
        console.log("当前需要移除的项目名称为：" + item.label);
        for (var i = 0; i < inMemTreeViewStruct.length; ++i) {
            if (inMemTreeViewStruct[i].label === item.label) {
                inMemTreeViewStruct.splice(i, 1);
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
        if (currentPanel) {
            currentPanel.dispose();
            currentPanel = undefined;
        }
        if (panelDataVis) {
            panelDataVis.dispose();
            panelDataVis = undefined;
        }
        if (panelAnnModelVis) {
            panelAnnModelVis.dispose();
            panelAnnModelVis = undefined;
        }
        if (panelSNNModelVis) {
            panelSNNModelVis.dispose();
            panelSNNModelVis = undefined;
        }
        if (panelSNNVisWeb) {
            panelSNNVisWeb.dispose();
            panelSNNVisWeb = undefined;
        }
        initCurrentPanel();
        currentPanel.reveal();
    }));
    let disposable_vis_command = vscode.commands.registerCommand("treeView-item.datavis", (itemNode) => {
        console.log("当前可视化目标:" + itemNode.label);
        if (currentPanel) {
            // 切换webview
            if (itemNode.label === "数据") {
                if (!panelDataVis) {
                    panelDataVis = vscode.window.createWebviewPanel("datavis", "数据集", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
                    panelDataVis.onDidDispose(function () {
                        panelDataVis = undefined;
                    }, null, context.subscriptions);
                }
                panelDataVis.reveal();
                // currentPanel.webview.html = getConvertorDataPageV2(
                panelDataVis.webview.html = get_convertor_page_v2_1.getConvertorDataPageV2(currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample0.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample1.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample2.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample3.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample4.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample5.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample6.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample7.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample8.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample9.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample0.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample1.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample2.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample3.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample4.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample5.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample6.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample7.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample8.png"))), currentPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample9.png"))));
            }
            else if (itemNode.label === "ANN模型") {
                if (panelAnnModelVis) {
                    panelAnnModelVis.dispose();
                    panelAnnModelVis = undefined;
                }
                if (!panelAnnModelVis) {
                    panelAnnModelVis = vscode.window.createWebviewPanel("datavis", "ANN模型", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
                    panelAnnModelVis.onDidDispose(() => {
                        panelAnnModelVis = undefined;
                    }, null, context.subscriptions);
                }
                panelAnnModelVis.reveal();
                panelAnnModelVis.webview.html = get_convertor_page_v2_1.getConvertorModelPageV2();
            }
        }
        if (itemNode.label === "数据") {
            if (panelDataVis) {
                panelDataVis.title = "数据集";
                // 数据可视化展示
                // 执行后台脚本
                let scriptPath = path.join(__dirname, "inner_scripts", "data_analyze.py");
                let command_str = "python " + scriptPath + " " + x_norm_data_path + " " + x_test_data_path + " " + y_test_data_path;
                child_process_1.exec(command_str, function (err, stdout, stderr) {
                    if (err) {
                        console.log("execute data analyze script error, msg: " + err);
                    }
                    else {
                        console.log("execute data analyze script....");
                        fs.readFile(path.join(__dirname, "inner_scripts", "data_info.json"), "utf-8", (err, data) => {
                            console.log("Read data info");
                            console.log("data info : " + data);
                            // 发送到webview 处理显示
                            if (panelDataVis) {
                                panelDataVis.webview.postMessage(data);
                            }
                        });
                    }
                });
            }
        }
        else if (itemNode.label === "ANN模型") {
            if (panelAnnModelVis) {
                panelAnnModelVis.title = "ANN模型";
                var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
                var commandExe = "python " + modelVisScriptPath + " " + x_norm_data_path + " " + x_test_data_path + " " + y_test_data_path + " " + model_file_path;
                child_process_1.exec(commandExe, function (err, stdout, stderr) {
                    console.log("model vis script running...");
                    console.log("__dirname is: " + __dirname);
                    fs.readFile(path.join(__dirname, "inner_scripts", "model_general_info.json"), "utf-8", (evt, data) => {
                        console.log("Read model general info data: " + data);
                        // 发送到web view 处理
                        if (panelAnnModelVis) {
                            panelAnnModelVis.webview.postMessage(JSON.stringify({ "model_general_info": data }));
                        }
                    });
                    // 加载模型详细信息
                    fs.readFile(path.join(__dirname, "inner_scripts", "model_layers_info.json"), "utf-8", (evt, data) => {
                        console.log("模型详细信息：" + data);
                        // 发送到web view 处理
                        if (panelAnnModelVis) {
                            panelAnnModelVis.webview.postMessage(JSON.stringify({ "model_detail_info": data }));
                        }
                    });
                    // 加载卷积、池化的等Layer的可视化
                    fs.readFile(path.join(__dirname, "inner_scripts", "layer_vis_info.json"), "utf-8", (evt, data) => {
                        console.log("layer output vis: " + data);
                        // 发送到webview 处理
                        if (panelAnnModelVis) {
                            panelAnnModelVis.webview.postMessage(JSON.stringify({ "model_layer_vis": data }));
                        }
                    });
                });
            }
        }
    });
    context.subscriptions.push(disposable_vis_command);
    vscode.commands.registerCommand("convertor.opt", () => {
        console.log("convertor startxxxxxxxxxxxxxxxxxxxxxxxx");
    });
    let disposable_import_command = vscode.commands.registerCommand("treeView-item.import", (itemNode) => {
        console.log("当前导入目标：" + itemNode.label);
        if (itemNode.label === "训练数据") {
            const options = {
                canSelectMany: false,
                canSelectFolders: false,
                openLabel: "选择训练数据集",
                filters: { "npz": ['npz'] }
            };
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    console.log("selected path: " + fileUri[0].fsPath);
                    x_norm_data_path = fileUri[0].fsPath;
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("x_norm","imgs/file.png");
                    TreeViewProvider_1.addSlfFile("x_norm");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("x_norm"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")));
                    }
                    if (x_norm_data_path) {
                        fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", ""), "x_norm.npz"), function (err) {
                        });
                    }
                    auto_save_with_check();
                }
            });
        }
        else if (itemNode.label === "测试数据") {
            const options = {
                canSelectMany: false,
                canSelectFolders: false,
                openLabel: "选择测试数据集",
                filters: { "npz": ['npz'] }
            };
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    console.log("selected path: " + fileUri[0].fsPath);
                    x_test_data_path = fileUri[0].fsPath;
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("x_test","imgs/file.png");
                    TreeViewProvider_1.addSlfFile("x_test");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("x_test"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")));
                    }
                    if (x_test_data_path) {
                        fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", ""), "x_test.npz"), function (err) {
                        });
                    }
                }
            });
            auto_save_with_check();
        }
        else if (itemNode.label === "测试数据标签") {
            const options = {
                canSelectMany: false,
                canSelectFolders: false,
                openLabel: "选择测试数据集标签",
                filters: { "npz": ['npz'] }
            };
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    console.log("selected path: " + fileUri[0].fsPath);
                    y_test_data_path = fileUri[0].fsPath;
                    // 添加到treeview下
                    // FIXME
                    // ITEM_ICON_MAP.set("y_test","imgs/file.png");
                    TreeViewProvider_1.addSlfFile("y_test");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[2].children.push(new TreeViewProvider_1.TreeItemNode("y_test"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")));
                    }
                    if (y_test_data_path) {
                        fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", ""), "y_test.npz"), function (err) {
                        });
                    }
                }
            });
            auto_save_with_check();
        }
        else if (itemNode.label === "ANN模型") {
            const options = {
                canSelectMany: false,
                canSelectFolders: false,
                openLabel: "选择模型文件",
                filters: { "模型文件": ['h5'] }
            };
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    console.log("selected path: " + fileUri[0].fsPath);
                    model_file_path = fileUri[0].fsPath;
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("model_file","imgs/file.png");
                    // ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
                    TreeViewProvider_1.addSlfFile(path.basename(model_file_path));
                    if (treeview.data[0].children && treeview.data[0].children[1].children) {
                        treeview.data[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("model_file_" + path.basename(model_file_path)));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", "")));
                    }
                    if (model_file_path) {
                        fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", path.basename(proj_save_path).replace("\.dar2", ""), "mnist_cnn.h5"), function (err) {
                        });
                    }
                }
            });
            auto_save_with_check();
        }
    });
    context.subscriptions.push(disposable_import_command);
    vscode.commands.registerCommand("convertor.new_proj", () => {
        console.log("create new project");
    });
    // 启动模型转换, 右键点击
    vscode.commands.registerCommand("item_convertor.start_convert", () => {
        if (currentPanel) {
            // 发送消息到web view ，开始模型的转换
            console.log("模型转换页面打开");
            // currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
            if (currentPanel && currentPanel.title !== "模型转换") {
                currentPanel.webview.html = get_convertor_page_v2_1.getANNSNNConvertPage();
                currentPanel.reveal();
                currentPanel.title = "模型转换";
                console.log("显示currentpane  模型转换   1");
            }
            else if (currentPanel) {
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
    vscode.commands.registerCommand("snn_model_ac.show_snn_model", () => {
        if (panelSNNVisWeb) {
            panelSNNVisWeb.dispose();
            panelSNNVisWeb = undefined;
        }
        panelSNNVisWeb = vscode.window.createWebviewPanel("SNN Model Vis View", "SNN模型", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
        panelSNNVisWeb.onDidDispose(() => {
            panelSNNVisWeb = undefined;
        }, null, context.subscriptions);
        panelSNNVisWeb.reveal();
        panelSNNVisWeb.webview.html = get_convertor_page_v2_1.getSNNModelPage();
        panelSNNVisWeb.title = "SNN模型";
        fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
            panelSNNVisWeb.webview.postMessage(JSON.stringify({ "snn_info": data }));
        });
        // 执行 darwinlang map 生成脚本
        let target_darlang_file_path = path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out", "snn_digit_darlang.json");
        let command_str = "python " + path.join(__dirname, "load_graph.py") + " " + target_darlang_file_path + " " + path.join(__dirname);
        child_process_1.exec(command_str, function (err, stdout, stderr) {
            if (err) {
                console.log("执行 load_graph.py 错误：" + err);
            }
            else {
                // 读取map 文件
                let map_file_disk = vscode.Uri.file(path.join(__dirname, "map.json"));
                let file_src = panelSNNVisWeb.webview.asWebviewUri(map_file_disk).toString();
                panelSNNVisWeb.webview.postMessage(JSON.stringify({ "snn_map": file_src }));
            }
        });
    });
    // 启动仿真
    vscode.commands.registerCommand("item_simulator.start_simulate", () => {
        if (panelSNNModelVis) {
            panelSNNModelVis.dispose();
            panelSNNModelVis = undefined;
        }
        if (!panelSNNModelVis) {
            panelSNNModelVis = vscode.window.createWebviewPanel("snnvis", "SNN仿真", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            panelSNNModelVis.onDidDispose(() => {
                panelSNNModelVis = undefined;
            }, null, context.subscriptions);
        }
        panelSNNModelVis.reveal();
        panelSNNModelVis.webview.html = get_convertor_page_v2_1.getSNNSimuPage();
        panelSNNModelVis.title = "SNN仿真";
        // 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
        fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
            if (panelSNNModelVis) {
                panelSNNModelVis.webview.postMessage(JSON.stringify({ "snn_info": data }));
            }
        });
    });
    // 启动转换为DarwinLang的操作
    vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", () => {
        var _a;
        // inMemTreeViewDarLang = [];
        if (!TreeViewProvider_1.ITEM_ICON_MAP.has("SNN模型")) {
            // ITEM_ICON_MAP.set("SNN模型","imgs/file.png");
            TreeViewProvider_1.addDarwinFold("SNN模型");
            (_a = inMemTreeViewStruct[0].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("SNN模型", []));
            darwinlang_file_paths.splice(0);
            if (inMemTreeViewStruct[0].children) {
                var child_len = inMemTreeViewStruct[0].children.length;
                fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out"), (err, files) => {
                    files.forEach(file => {
                        var _a;
                        darwinlang_file_paths.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "darlang_out", file));
                        // ITEM_ICON_MAP.set(file, "imgs/file.png");
                        TreeViewProvider_1.addDarwinFiles(file);
                        if (inMemTreeViewStruct[0].children) {
                            (_a = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode(file));
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
    vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function () {
        var _a;
        if (!TreeViewProvider_1.ITEM_ICON_MAP.has("SNN二进制模型")) {
            TreeViewProvider_1.ITEM_ICON_MAP.set("SNN二进制模型", "imgs/file.png");
            (_a = inMemTreeViewStruct[0].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("SNN二进制模型", []));
            darwinlang_bin_paths.splice(0);
            if (inMemTreeViewStruct[0].children) {
                var child_len = inMemTreeViewStruct[0].children.length;
                fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "bin_darwin_out"), (err, files) => {
                    files.forEach(file => {
                        var _a;
                        if (file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1) {
                            darwinlang_bin_paths.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(proj_save_path).replace("\.dar2", ""), "bin_darwin_out", file));
                            TreeViewProvider_1.ITEM_ICON_MAP.set(file, "imgs/file.png");
                            if (inMemTreeViewStruct[0].children) {
                                if (file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
                                    file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1) {
                                    (_a = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode(file));
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
    vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin2", function () {
        console.log("目标转换为darwin2二进制文件");
        vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
    });
    vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin3", function () {
        console.log("目标转换为darwin3二进制文件");
    });
    vscode.commands.executeCommand("darwin2.helloWorld");
    function auto_save_with_check() {
        // check if all necessary info get, auto save to proj_save_path
        if (x_norm_data_path && x_test_data_path && y_test_data_path && model_file_path && darwinlang_file_paths && darwinlang_bin_paths) {
            console.log("all nessary info get, auto save");
            let proj_info_data = {
                "proj_info": proj_desc_info,
                "x_norm_path": x_norm_data_path,
                "x_test_path": x_test_data_path,
                "y_test_path": y_test_data_path,
                "model_path": model_file_path,
                "darwinlang_file_paths": darwinlang_file_paths,
                "darwinlang_bin_paths": darwinlang_bin_paths
            };
            fs.writeFileSync(proj_save_path, JSON.stringify(proj_info_data));
        }
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    // shutdown local server
    axios.default.post("http://localhost:6003/shutdown");
}
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(5);

/***/ }),
/* 5 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var bind = __webpack_require__(7);
var Axios = __webpack_require__(8);
var mergeConfig = __webpack_require__(46);
var defaults = __webpack_require__(14);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(47);
axios.CancelToken = __webpack_require__(48);
axios.isCancel = __webpack_require__(13);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(49);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(50);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(7);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var buildURL = __webpack_require__(9);
var InterceptorManager = __webpack_require__(10);
var dispatchRequest = __webpack_require__(11);
var mergeConfig = __webpack_require__(46);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),
/* 11 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var transformData = __webpack_require__(12);
var isCancel = __webpack_require__(13);
var defaults = __webpack_require__(14);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),
/* 12 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),
/* 14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var normalizeHeaderName = __webpack_require__(15);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(16);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(26);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),
/* 15 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),
/* 16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var settle = __webpack_require__(17);
var cookies = __webpack_require__(20);
var buildURL = __webpack_require__(9);
var buildFullPath = __webpack_require__(21);
var parseHeaders = __webpack_require__(24);
var isURLSameOrigin = __webpack_require__(25);
var createError = __webpack_require__(18);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),
/* 17 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(18);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),
/* 18 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(19);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),
/* 19 */
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),
/* 20 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(22);
var combineURLs = __webpack_require__(23);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),
/* 22 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),
/* 23 */
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),
/* 24 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),
/* 25 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),
/* 26 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);
var settle = __webpack_require__(17);
var buildFullPath = __webpack_require__(21);
var buildURL = __webpack_require__(9);
var http = __webpack_require__(27);
var https = __webpack_require__(28);
var httpFollow = __webpack_require__(29).http;
var httpsFollow = __webpack_require__(29).https;
var url = __webpack_require__(30);
var zlib = __webpack_require__(44);
var pkg = __webpack_require__(45);
var createError = __webpack_require__(18);
var enhanceError = __webpack_require__(19);

var isHttps = /https:?/;

/**
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} proxy
 * @param {string} location
 */
function setProxy(options, proxy, location) {
  options.hostname = proxy.host;
  options.host = proxy.host;
  options.port = proxy.port;
  options.path = location;

  // Basic proxy authorization
  if (proxy.auth) {
    var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
  }

  // If a proxy is used, any redirects must also pass through the proxy
  options.beforeRedirect = function beforeRedirect(redirection) {
    redirection.headers.host = redirection.host;
    setProxy(redirection, proxy, redirection.href);
  };
}

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }

        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port,
            protocol: parsedProxyUrl.protocol
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),
/* 27 */
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),
/* 28 */
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),
/* 29 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var url = __webpack_require__(30);
var URL = url.URL;
var http = __webpack_require__(27);
var https = __webpack_require__(28);
var Writable = __webpack_require__(31).Writable;
var assert = __webpack_require__(32);
var debug = __webpack_require__(33);

// Create handlers that pass events from native requests
var eventHandlers = Object.create(null);
["abort", "aborted", "connect", "error", "socket", "timeout"].forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  ""
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  if (callback) {
    this.once("timeout", callback);
  }

  if (this.socket) {
    startTimer(this, msecs);
  }
  else {
    var self = this;
    this._currentRequest.once("socket", function () {
      startTimer(self, msecs);
    });
  }

  this.once("response", clearTimer);
  this.once("error", clearTimer);

  return this;
};

function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(function () {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
}

// Proxy all other public ClientRequest methods
[
  "abort", "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url.format(this._options);

  // Set up event handlers
  request._redirectable = this;
  for (var event in eventHandlers) {
    /* istanbul ignore else */
    if (event) {
      request.on(event, eventHandlers[event]);
    }
  }

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.
  var location = response.headers.location;
  if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
    // Abort the current request
    this._currentRequest.removeAllListeners();
    this._currentRequest.on("error", noop);
    this._currentRequest.abort();
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
      url.parse(this._currentUrl).hostname;

    // Create the redirected request
    var redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop the Authorization header if redirecting to another host
    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      var error = new RedirectionError("Redirected request failed: " + cause.message);
      error.cause = cause;
      this.emit("error", error);
    }
  }
  else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),
/* 30 */
/***/ ((module) => {

"use strict";
module.exports = require("url");;

/***/ }),
/* 31 */
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";
module.exports = require("assert");;

/***/ }),
/* 33 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var debug;

module.exports = function () {
  if (!debug) {
    try {
      /* eslint global-require: off */
      debug = __webpack_require__(34)("follow-redirects");
    }
    catch (error) {
      debug = function () { /* */ };
    }
  }
  debug.apply(null, arguments);
};


/***/ }),
/* 34 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(35);
} else {
	module.exports = __webpack_require__(38);
}


/***/ }),
/* 35 */
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(36)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),
/* 36 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(37);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),
/* 37 */
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),
/* 38 */
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(39);
const util = __webpack_require__(40);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(41);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(36)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),
/* 39 */
/***/ ((module) => {

"use strict";
module.exports = require("tty");;

/***/ }),
/* 40 */
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ }),
/* 41 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(42);
const hasFlag = __webpack_require__(43);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),
/* 42 */
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),
/* 43 */
/***/ ((module) => {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),
/* 44 */
/***/ ((module) => {

"use strict";
module.exports = require("zlib");;

/***/ }),
/* 45 */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"_from\":\"axios\",\"_id\":\"axios@0.21.1\",\"_inBundle\":false,\"_integrity\":\"sha512-dKQiRHxGD9PPRIUNIWvZhPTPpl1rf/OxTYKsqKUDjBwYylTvV7SjSHJb9ratfyzM6wCdLCOYLzs73qpg5c4iGA==\",\"_location\":\"/axios\",\"_phantomChildren\":{},\"_requested\":{\"type\":\"tag\",\"registry\":true,\"raw\":\"axios\",\"name\":\"axios\",\"escapedName\":\"axios\",\"rawSpec\":\"\",\"saveSpec\":null,\"fetchSpec\":\"latest\"},\"_requiredBy\":[\"#USER\",\"/\"],\"_resolved\":\"https://registry.npmjs.org/axios/-/axios-0.21.1.tgz\",\"_shasum\":\"22563481962f4d6bde9a76d516ef0e5d3c09b2b8\",\"_spec\":\"axios\",\"_where\":\"E:\\\\courses\\\\ZJLab\\\\IDE-related-docs\\\\darwin2\",\"author\":{\"name\":\"Matt Zabriskie\"},\"browser\":{\"./lib/adapters/http.js\":\"./lib/adapters/xhr.js\"},\"bugs\":{\"url\":\"https://github.com/axios/axios/issues\"},\"bundleDependencies\":false,\"bundlesize\":[{\"path\":\"./dist/axios.min.js\",\"threshold\":\"5kB\"}],\"dependencies\":{\"follow-redirects\":\"^1.10.0\"},\"deprecated\":false,\"description\":\"Promise based HTTP client for the browser and node.js\",\"devDependencies\":{\"bundlesize\":\"^0.17.0\",\"coveralls\":\"^3.0.0\",\"es6-promise\":\"^4.2.4\",\"grunt\":\"^1.0.2\",\"grunt-banner\":\"^0.6.0\",\"grunt-cli\":\"^1.2.0\",\"grunt-contrib-clean\":\"^1.1.0\",\"grunt-contrib-watch\":\"^1.0.0\",\"grunt-eslint\":\"^20.1.0\",\"grunt-karma\":\"^2.0.0\",\"grunt-mocha-test\":\"^0.13.3\",\"grunt-ts\":\"^6.0.0-beta.19\",\"grunt-webpack\":\"^1.0.18\",\"istanbul-instrumenter-loader\":\"^1.0.0\",\"jasmine-core\":\"^2.4.1\",\"karma\":\"^1.3.0\",\"karma-chrome-launcher\":\"^2.2.0\",\"karma-coverage\":\"^1.1.1\",\"karma-firefox-launcher\":\"^1.1.0\",\"karma-jasmine\":\"^1.1.1\",\"karma-jasmine-ajax\":\"^0.1.13\",\"karma-opera-launcher\":\"^1.0.0\",\"karma-safari-launcher\":\"^1.0.0\",\"karma-sauce-launcher\":\"^1.2.0\",\"karma-sinon\":\"^1.0.5\",\"karma-sourcemap-loader\":\"^0.3.7\",\"karma-webpack\":\"^1.7.0\",\"load-grunt-tasks\":\"^3.5.2\",\"minimist\":\"^1.2.0\",\"mocha\":\"^5.2.0\",\"sinon\":\"^4.5.0\",\"typescript\":\"^2.8.1\",\"url-search-params\":\"^0.10.0\",\"webpack\":\"^1.13.1\",\"webpack-dev-server\":\"^1.14.1\"},\"homepage\":\"https://github.com/axios/axios\",\"jsdelivr\":\"dist/axios.min.js\",\"keywords\":[\"xhr\",\"http\",\"ajax\",\"promise\",\"node\"],\"license\":\"MIT\",\"main\":\"index.js\",\"name\":\"axios\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/axios/axios.git\"},\"scripts\":{\"build\":\"NODE_ENV=production grunt build\",\"coveralls\":\"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js\",\"examples\":\"node ./examples/server.js\",\"fix\":\"eslint --fix lib/**/*.js\",\"postversion\":\"git push && git push --tags\",\"preversion\":\"npm test\",\"start\":\"node ./sandbox/server.js\",\"test\":\"grunt test && bundlesize\",\"version\":\"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json\"},\"typings\":\"./index.d.ts\",\"unpkg\":\"dist/axios.min.js\",\"version\":\"0.21.1\"}");

/***/ }),
/* 46 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(6);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),
/* 47 */
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),
/* 48 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(47);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),
/* 49 */
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),
/* 50 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TreeViewProvider = exports.TreeItemNode = exports.addDarwinFiles = exports.addDarwinFold = exports.addSlfFile = exports.addSlfProj = exports.ITEM_ICON_MAP = void 0;
const vscode_1 = __webpack_require__(1);
const path_1 = __webpack_require__(2);
const vscode = __webpack_require__(1);
// 创建每一项 label 对应的图片名称
// 其实就是一个Map集合，用 ts 的写法
exports.ITEM_ICON_MAP = new Map([
    ['项目', 'imgs/proj_icon_new.png'],
    ['数据', 'imgs/data_icon_new.png'],
    ['ANN模型', 'imgs/ann_model.png'],
    ['训练数据', "imgs/train_data_new.png"],
    ['测试数据', "imgs/train_data_new.png"],
    ['测试数据标签', "imgs/data_label_icon_new.png"]
    // ['转换与仿真',"imgs/simulate_run.png"],
    // ['测试添加',"imgs/simulate_run.png"]
]);
function addSlfProj(label) {
    exports.ITEM_ICON_MAP.set(label, 'imgs/proj_icon_new.png');
}
exports.addSlfProj = addSlfProj;
function addSlfFile(label) {
    exports.ITEM_ICON_MAP.set(label, "imgs/data_file_icon_new.png");
}
exports.addSlfFile = addSlfFile;
function addDarwinFold(label) {
    exports.ITEM_ICON_MAP.set(label, "imgs/darwin_model_icon_new.png");
}
exports.addDarwinFold = addDarwinFold;
function addDarwinFiles(label) {
    exports.ITEM_ICON_MAP.set(label, "imgs/data_file_icon_new.png");
}
exports.addDarwinFiles = addDarwinFiles;
// 第一步：创建单项的节点(item)的类
class TreeItemNode extends vscode_1.TreeItem {
    constructor(
    // readonly 只可读
    label, children, isRoot) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.label = label;
        this.children = children;
        this.isRoot = isRoot;
        // command: 为每项添加点击事件的命令
        this.command = {
            title: this.label,
            command: 'itemClick',
            tooltip: this.label,
            arguments: [
                this.label,
            ]
        };
        // iconPath： 为该项的图标因为我们是通过上面的 Map 获取的，所以我额外写了一个方法，放在下面
        this.iconPath = TreeItemNode.getIconUriForLabel(this.label);
        this.children = children ? children : [];
        // this.contextValue = isRoot ? "TreeViewProviderContext":undefined;
        this.contextValue = label;
        if (isRoot) {
            this.contextValue = "root";
        }
        else if (label.search("darlang.json") !== -1) {
            this.contextValue = "darwinlang_json_file";
        }
        if (label.indexOf("model_file_") >= 0) {
            this.label = label.replace("model_file_", "");
            this.contextValue = "model_file";
        }
        else {
            this.label = label;
        }
        this.iconPath = TreeItemNode.getIconUriForLabel(this.label);
    }
    // __filename：当前文件的路径
    // 重点讲解 Uri.file(join(__filename,'..', '..') 算是一种固定写法
    // Uri.file(join(__filename,'..','assert', ITEM_ICON_MAP.get(label)+''));   写成这样图标出不来
    // 所以小伙伴们就以下面这种写法编写
    static getIconUriForLabel(label) {
        console.log("测试 getIconUriForLanel, label=" + label);
        console.log("path:" + vscode_1.Uri.file(path_1.join(__filename, '..', "resources", exports.ITEM_ICON_MAP.get(label) + '')).toString());
        return vscode_1.Uri.file(path_1.join(__filename, '..', "..", "src", "resources", exports.ITEM_ICON_MAP.get(label) + ''));
    }
}
exports.TreeItemNode = TreeItemNode;
class TreeViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.data = [];
        // this.data = [new TreeItemNode("项目", [new TreeItemNode("数据", 
        // [new TreeItemNode("训练数据"), new TreeItemNode("测试数据"), new TreeItemNode("测试数据标签")]), new TreeItemNode("模型")])];
    }
    // 自动弹出
    // 获取树视图中的每一项 item,所以要返回 element
    getTreeItem(element) {
        return element;
    }
    // 自动弹出，但是我们要对内容做修改
    // 给每一项都创建一个 TreeItemNode
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        else {
            return element.children;
        }
        // return ['新建项目','导入数据','导入模型','转换与仿真'].map(
        //     item => new TreeItemNode(
        //         item as string,
        //         TreeItemCollapsibleState.None as TreeItemCollapsibleState,
        //     )
        // );
    }
    getParent(element) {
        if (this.data.length === 0 || element === this.data[0]) {
            return undefined;
        }
        else {
            let parentNode = this.data[0];
            let stack = new Array();
            stack.push(parentNode);
            while (stack.length > 0) {
                let tmp_head = stack[0];
                stack.splice(0, 1);
                if (tmp_head.children) {
                    for (let i = 0; i < tmp_head.children.length; ++i) {
                        stack.push(tmp_head.children[i]);
                        if (tmp_head.children[i] === element) {
                            return parentNode;
                        }
                    }
                }
                parentNode = tmp_head;
            }
            return undefined;
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    // 这个静态方法时自己写的，你要写到 extension.ts 也可以
    static initTreeViewItem(target_view) {
        // 实例化 TreeViewProvider
        const treeViewProvider = new TreeViewProvider();
        // registerTreeDataProvider：注册树视图
        // 你可以类比 registerCommand(上面注册 Hello World)
        vscode_1.window.registerTreeDataProvider(target_view, treeViewProvider);
        return treeViewProvider;
    }
}
exports.TreeViewProvider = TreeViewProvider;


/***/ }),
/* 52 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MultiLevelTreeProvider = void 0;
const vscode = __webpack_require__(1);
class MultiLevelTreeProvider {
    constructor() {
        this.data = [new TreeItem('cars', [
                new TreeItem('Ford', [new TreeItem('Fiesta'), new TreeItem('Focus'), new TreeItem('Mustang')]),
                new TreeItem('BMW', [new TreeItem('320'), new TreeItem('X3'), new TreeItem('X5')])
            ])];
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
exports.MultiLevelTreeProvider = MultiLevelTreeProvider;
class TreeItem extends vscode.TreeItem {
    constructor(label, children) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSNNModelPage = exports.getSNNSimuPage = exports.getANNSNNConvertPage = exports.getConvertorPageV2 = exports.getConvertorModelPageV2 = exports.getConvertorDataPageV2 = void 0;
function getConvertorDataPageV2(sample0, sample1, sample2, sample3, sample4, sample5, sample6, sample7, sample8, sample9, test_sample0, test_sample1, test_sample2, test_sample3, test_sample4, test_sample5, test_sample6, test_sample7, test_sample8, test_sample9) {
    return `
  <!DOCTYPE html>
  <html style="height: 100%;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: auto;">
      <!-- 左侧导航栏 主面板与配置面板 -->
      <div class="row" style="height: 100%;width: 100%;">
        <!-- 加载提示 -->
        <div id="loader_tip" class="preloader-wrapper big active" style="position: absolute;margin-left: 600px;margin-top: 100px;display: none;">
          <div class="spinner-layer spinner-green-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div><div class="gap-patch">
              <div class="circle"></div>
            </div><div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
        <div class="loading-div">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;"></i>
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
        </div>
  
        <!--展示的主面板-->
        <div class="row" style="height: 45%;width: 100%;">
            <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 310px;margin-left: 50px;">
              <!-- 数据基本信息表格 -->
              <div style="text-align: center;font-size: large;font-weight: bold;color: #333;"><font style="color: #333;">导入数据统计</font></div>
              <table id="data_general_table" style="width:440px; margin-left:15px;color: #333;margin-top: 30px;">
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="font-size: medium;font-weight: bold;padding-left: 15px;background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;">总数据大小</td>
                  <td id="total_data_amount" style="font-weight:bolder;padding-left: 10px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="font-size: medium;font-weight: bold;padding-left: 15px;background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;">测试数据量</td>
                  <td id="test_data_amount" style="font-weight: bolder;padding-left: 10px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="font-size: medium;font-weight: bold;padding-left: 15px;background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;">验证数据量</td>
                  <td id="val_data_amount" style="font-weight: bolder;padding-left: 10px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="font-size: medium;font-weight: bold;padding-left: 15px;background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;">数据类别个数</td>
                  <td id="class_counts" style="font-weight: bolder;padding-left: 10px;"></td>
                </tr>
              </table>
            </div>
            <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 310px;margin-left: 15px;">
              <div style="text-align: center;font-weight: bold;font-size: large;margin-bottom:20px;color: #333;">
                数据类别分布
              </div>
              <div id="bar_chart_testdata_container" style="width: 440px;height: 300px;margin-left:20px;margin-top: -30px;"></div>
            </div>
        </div>
        <div class="row" style="height: 45%;width: 100%;margin-top:35px;">
          <div id="sample_data_div" class="col-md-5" style="height:351px;background: rgba(238,238,238,0.4);margin-left: 50px;">
            <div style="text-align: center;font-weight: bold;font-size: large;margin-left:15px;color: black;">
              训练集样例数据
            </div>
            <div id="bar_chart_histgram" style="width: 440px;height: 320px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
            <ul id="sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 440px;overflow-x: auto;display: block;background: rgb(238,238,238);white-space: nowrap;">
              <li id="sample_img0_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img0" onclick="sample_img_click(this);" src="${sample0}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img1_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img1" onclick="sample_img_click(this);" src="${sample1}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img2_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img2" onclick="sample_img_click(this);" src="${sample2}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img3_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img3" onclick="sample_img_click(this);" src="${sample3}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img4_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img4" onclick="sample_img_click(this);" src="${sample4}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img5_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img5" onclick="sample_img_click(this);" src="${sample5}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img6_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img6" onclick="sample_img_click(this);" src="${sample6}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img7_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img7" onclick="sample_img_click(this);" src="${sample7}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img8_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img8" onclick="sample_img_click(this);" src="${sample8}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img9_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="sample_img9" onclick="sample_img_click(this);" src="${sample9}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
            </ul>
            
          </div>
          <div id="sample_testdataset_data_div" class="col-md-5" style="height: 351px;background: rgba(238,238,238,0.4);margin-left: 15px;">
            <div style="text-align: center;font-weight: bold;font-size: large;margin-left:15px;color: black;">
              测试集样例数据
            </div>
  
            <div id="test_bar_chart_histgram" style="width: 440px;height: 320px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
            <ul id="test_sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 440px;overflow: auto;display: block;white-space: nowrap;">
              <li id="test_sample_img0_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img0" onclick="sample_img_click(this);" src="${test_sample0}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img1_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img1" onclick="sample_img_click(this);" src="${test_sample1}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img2_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img2" onclick="sample_img_click(this);" src="${test_sample2}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img3_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img3" onclick="sample_img_click(this);" src="${test_sample3}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img4_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img4" onclick="sample_img_click(this);" src="${test_sample4}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img5_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img5" onclick="sample_img_click(this);" src="${test_sample5}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img6_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img6" onclick="sample_img_click(this);" src="${test_sample6}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img7_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img7" onclick="sample_img_click(this);" src="${test_sample7}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img8_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img8" onclick="sample_img_click(this);" src="${test_sample8}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img9_li" style="list-style: none;display: inline-block;height: 60px;width: 70px;">
                <img id="test_sample_img9" onclick="sample_img_click(this);" src="${test_sample9}" style="opacity: 0.5;width: 50px;height: 50px;margin-left: 20px;">
              </li>
            </ul>
          </div>
        </div>
      </div>
  </body>
  <style>
  
  .editor-sidenav{
    background-color: #333;
  }
  
  body {
    padding: 25px;
    background-color: rgb(251, 255, 255);
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(249, 251, 252);
    color: white;
  }
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
  
    .resizable {
      resize: both;
      overflow: scroll;
      border: 1px solid rgb(0, 0, 0);
    }
    .dropdown-content{
     width: max-content !important;
     height:auto !important;
  }
  
  .loading-div {
        width: 1800px;
        height: 720px;
        display: table-cell;
        vertical-align: middle;
        color: #555;
        overflow: hidden;
        text-align: center;
      }
  .loading-div::before {
    display: inline-block;
    vertical-align: middle;
  } 
  </style>
  <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
  
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script> -->
  
  <link rel="stylesheet" href="http://localhost:6003/css/materialize.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/bootstrap.min.css" >
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="http://localhost:6003/js/jquery.min.js"></script>
  <script src="http://localhost:6003/js/materialize.min.js"></script>
  <script src="http://localhost:6003/js/bootstrap.min.js"></script>
  <script src="http://localhost:6003/js/echarts.min.js"></script>
  
  <script>
  var prev_click_img_li_id = undefined;
  var prev_click_img_li_test_id = undefined;
  var data_info=undefined;
  $(document).ready(function(){
    // display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
    //       [0.098,0.1135,0.1032,0.101,0.0982,0.0892,0.0958,0.1028,0.0974,0.1009],"训练数据集各类别分布", "数据占比","pie_chart_container");
    // display_data_bar_chart(["0-28","28-56","56-85","85-113","113-141","141-170","170-198","198-226","226-255"],
    //         [639,8,7,1,19,18,8,9,79,0],"像素分布","该范围内像素点个数","bar_chart_histgram");
    // display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
    //   [0.098,0.101,0.1028,0.0974,0.1009,0.1135,0.0982,0.0892,0.0958,0.1032],"测试数据集各类别分布","数据占比","bar_chart_testdata_container")
      window.addEventListener("message", (event)=>{
        const data = JSON.parse(event.data);
        data_info = data
        console.log("data vis webview receive data: "+data);
        $("#total_data_amount").text(data.total_data_count);
        $("#test_data_amount").text(data.norm_data_count);
        $("#val_data_amount").text(data.test_data_count);
        $("#class_counts").text(data.num_classes);
        var sample_count = data.sample_imgs.length;
        if(sample_count < 10){
          for(var i=0;i<10-sample_count;++i){
            $("#sample_img"+(10-i-1)).remove();
          }
        }
        for(var i=0;i<sample_count;++i){
          $("#sample_img"+i).hide();
          $("#sample_img"+i).show();
        }
        var class_labels = new Array();
        var class_ratios = new Array();
        var class_total_count = 0;
        console.log("cls_counts="+data.cls_counts);
        console.log("num_class="+data.num_classes);
        for(var i=0;i<data.cls_counts.length;++i){
          class_total_count += data.cls_counts[i];
        }
        for(var i=0;i<data.cls_counts.length;++i){
          class_ratios.push(data.cls_counts[i]/class_total_count);
        }
        for(var i=0;i<data.num_classes;++i){
          class_labels.push(""+i);
        }
        // 对数处理histgram
        for(var i=0;i<data_info.test_sample_imgs.length;++i){
          for(var j=0;j<data_info.test_sample_imgs[i].hist_gram_bins.length;++j){
            if(data_info.test_sample_imgs[i].hist_gram_bins[j] > 0){
              data_info.test_sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.test_sample_imgs[i].hist_gram_bins[j]);
            }
          }
        }
  
        for(var i=0;i<data_info.sample_imgs.length;++i){
          for(var j=0;j<data_info.sample_imgs[i].hist_gram_bins.length;++j){
            if(data_info.sample_imgs[i].hist_gram_bins[j] > 0){
              data_info.sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.sample_imgs[i].hist_gram_bins[j]);
            }
          }
        }
  
        $(".loading-div").hide(); // 隐藏加载提示
        console.log("display test data distribution...");
        display_data_bar_chart(class_labels, class_ratios, "测试数据集各类别分布",  "数据占比","类别", "占比", "bar_chart_testdata_container");
        console.log("test data distribution bar chart displayed.");
    });
  });
  
  function sample_img_click(e){
    var sampleId = $(e).attr("id");
    if(sampleId.substring(0,4) === "test"){
      if(prev_click_img_li_test_id !== undefined){
        document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
        document.getElementById(prev_click_img_li_test_id).style.opacity = "";
      }
      prev_click_img_li_test_id = sampleId+"_li";
      document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "#00868B";
      document.getElementById(prev_click_img_li_test_id).style.opacity = "0.5";
    }else{
      if(prev_click_img_li_id !== undefined){
        document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
        document.getElementById(prev_click_img_li_id).style.opacity = "";
      }
      prev_click_img_li_id = sampleId+"_li";
      document.getElementById(prev_click_img_li_id).style.backgroundColor = "#00868B";
      document.getElementById(prev_click_img_li_id).style.opacity = "0.5";
    }
    console.log("current click img id="+sampleId);
    var sampleIdx = parseInt(sampleId.substring(sampleId.length-1));
    if(sampleId.substring(0,4) === "test"){
      display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量(log_10)", "test_bar_chart_histgram");
    }else{
      display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量(log_10)", "bar_chart_histgram");
    }
  }
  
  
  
      function display_data_bar_chart(label_names, label_counts, title,series_name,x_axis_name, y_axis_name,target_id){
        console.log("label names:"+label_names);
        console.log("label counts:"+label_counts);
        var option = {
              tooltip:{
                  trigger:"axis"
                },
              xAxis: {
                type: 'category',
                    data: label_names,
                    scale:true,
                    name:x_axis_name,
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      }
                    }
              },
              yAxis: [
                  {
                    type: 'value',
                    scale:true,
                    name:y_axis_name,
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      }
                    }
                  },
                  {
                    type: 'value',
                    scale:true,
                    name:"",
                    show:false,
                    nameTextStyle:{
                      color:"white"
                    },
                    axisLabel:{
                      show:false,
                      textStyle:{
                        color:"white"
                      }
                    }
                  }
              ],
              series: [
                  {
                      name: series_name,
                      type: 'bar',
                      data: label_counts,
                      itemStyle: {
                        normal: {
                          color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                              [
                                  {offset: 0, color: '#BBFFFF'},   
                                  {offset: 1, color: '#2FDECA'}
                              ]
                              )
                          },
                          emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                  0, 0, 0, 1,
                                [
                                  {offset: 0, color: '#2FDECA'},
                                  {offset: 1, color: '#2FDE80'}
                                ]
                            )
                          }
                      }
                  },
                  {
                      name: series_name,
                      type: 'line',
                      yAxisIndex: 1,
                      data: label_counts,
                      itemStyle:{
                          normal:{
                              lineStyle:{
                                  color:"#FF994B"
                              }
                          }
                      }
                  }
              ]
          };
          var bar_chart_data = echarts.init(document.getElementById(target_id));
          bar_chart_data.setOption(option);
      }
  </script>
  `;
}
exports.getConvertorDataPageV2 = getConvertorDataPageV2;
function getConvertorModelPageV2() {
    return `
  <!DOCTYPE html>
  <html style="height: 100%;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: hidden;">
      <!-- 左侧导航栏 主面板与配置面板 -->
      <div class="row" style="height: 100%;width: 100%;">
        <!-- 加载提示 -->
        <div id="loader_tip" class="preloader-wrapper big active" style="position: absolute;margin-left: 600px;margin-top: 100px;display: none;">
          <div class="spinner-layer spinner-green-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle"></div>
            </div>
            <div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
        <div class="loading-div">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;"></i>
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">模型信息加载中...</font></span>
        </div>
  
          <div id="main_panel" style="width: 100%;height: 100%;overflow: auto;white-space: nowrap;">
            <div style="width: 100%;">
              <!-- 模型总体信息表格 -->
              <div style="background: rgba(238,238,238,0.4);height: 378px;display: inline-block;">
                <table id="model_general_table" style="margin-left:40px;color: #333;width: 440px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;font-size: large;font-weight: bold;"><font style="color: #333;">ANN模型基本信息</font></caption>
                  <tr style="font-size: medium;font-weight: bold;border: solid 3px;border-color: #D6D6D6;">
                    <td style="font-size: medium;padding-left: 15px;border: solid 2px;background: rgb(238,238,238);border-color: #D6D6D6;">总层数</td>
                    <td id="model_total_layers" style="font-size: medium;padding-left: 10px;"></td>
                  </tr>
                  <tr style="font-size: medium;font-weight: bold;border: solid 3px;border-color: #D6D6D6;">
                    <td style="font-size: medium;padding-left: 15px; border: solid 2px;background: rgb(238,238,238);border-color: #D6D6D6;">总参数量</td>
                    <td id="model_total_param" style="font-size: medium;padding-left: 10px;"></td>
                  </tr>
                  <tr style="font-size: medium;font-weight: bold;border: solid 3px;border-color: #D6D6D6;">
                    <td style="font-size: medium;padding-left: 15px; border: solid 2px;background: rgb(238,238,238);border-color: #D6D6D6;">unit数量</td>
                    <td id="model_total_units" style="font-size: medium;padding-left: 10px;"></td>
                  </tr>
                </table>
      
                <!-- python 绘制的模型结构简图 -->
                <div id="ann_model_vis_img_parent_div" style="margin-left: 40px;width: 440px;margin-right: 40px;">
                  <img id="ann_model_vis_img" style="width: 440px;height: 260px;">
                </div>
              </div>
    
              <!--模型详细信息表格-->
              <div style="background: rgba(238,238,238,0.4);height: 378px;margin-left: 10px;width: 800px;display: inline-block;vertical-align: top;padding-left: 40px;margin-right: 40px;">
                <div style="text-align: center;font-size: large;font-weight: bold;color: #333;">各层详细信息</div>
                <div class="row" style="width: 100%;">
                  <div class="col-md-6">
                    <table id="model_detail_table" style="color: #333;">
                      <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                      <thead>
                        <tr style="font-size: medium;font-weight: bold;border: solid 3px;height: 35px;border-color: #D6D6D6;">
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;">名称</td>
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 180px;">输出形状</td>
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 200px;">参数量</td>
                        </tr>
                      </thead>
                      <!--通过加载模型的信息动态创建-->
                    </table>
                  </div>
                  <div class="col-md-6">
                    <table id="model_detail_table_secondary" style="color: #333;">
                      <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                      <thead>
                        <tr style="font-size: medium;font-weight: bold;border: solid 3px;height: 35px;border-color: #D6D6D6;">
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;">名称</td>
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 180px;">输出形状</td>
                          <td style="font-size: medium;padding-left: 15px;background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 200px;">参数量</td>
                        </tr>
                      </thead>
                      <!--通过加载模型的信息动态创建-->
                    </table>
                  </div>
                </div>
              </div>
  
            </div>
  
            <!--模型各层的可视化-->
            <div style="width: 100%;margin-top: 12px;">
              <div id="model_layers_vis" style="background: rgba(238,238,238,0.4);display: inline-block;">
                <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;color: #333;">卷积与激活层输出可视化</div>
                <!--动态创建-->
                <div id="layers_vis_div" class="row" style="width: 440px;margin-left: 40px;margin-top: 40px;margin-bottom: 0px; margin-right: 40px;padding: 0px;background: rgb(238,238,238);color: #333;border: 2px solid #333;height: 40px;border-color: #D6D6D6;">
                  <div class="col-md-3" style="font-size: medium;font-weight: bold;padding-left: 15px;border-right: 2px solid #333;height: 38px;border-color: #D6D6D6;">layer 名称</div>
                  <div class="col-md-3" style="font-size: medium;font-weight: bold;padding-left: 15px;border-right: 2px solid #333;height: 38px;border-color: #D6D6D6;">layer 编号</div>
                  <div class="col-md-6" style="font-size: medium;font-weight: bold;padding-left: 15px;height: 38px;">输出可视化</div>
                </div>
                <div id="tmp_peer"></div>
              </div>
              <!-- 显示各层的参数量占比 -->
              <div style="background: rgba(238,238,238,0.4);margin-left: 10px;width: 800px;vertical-align: top;display: inline-block;">
                <div style="font-size: large;font-weight: bold;text-align: center;color: #333;margin-left: 100px;">各层参数量分布</div>
                <div id="layer_param_percent_div" style="width: 480px;height: 300px;margin-left: 140px;"></div>
              </div>
            </div>
  
          </div>
      </div>
  </body>
  <style>
  
  .editor-sidenav{
    background-color: #333;
  }
  
  body {
    padding: 25px;
    background-color: rgb(251, 255, 255);
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(249, 251, 252);
    color: white;
  }
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
  
    .resizable {
      resize: both;
      overflow: scroll;
      border: 1px solid rgb(0, 0, 0);
    }
    .dropdown-content{
     width: max-content !important;
     height:auto !important;
  }
  
  .loading-div {
        width: 1800px;
        height: 720px;
        display: table-cell;
        vertical-align: middle;
        color: #555;
        overflow: hidden;
        text-align: center;
      }
  .loading-div::before {
    display: inline-block;
    vertical-align: middle;
  } 
  </style>
  <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
  
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script> -->
  
  <link rel="stylesheet" href="http://localhost:6003/css/materialize.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="http://localhost:6003/js/jquery.min.js"></script>
  <script src="http://localhost:6003/js/materialize.min.js"></script>
  <script src="http://localhost:6003/js/bootstrap.min.js"></script>
  <script src="http://localhost:6003/js/echarts.min.js"></script>
  
  
  <script>
  
      $(document).ready(function(){
        // 接收从extension 的消息
        window.addEventListener('message', event=>{
            const data = JSON.parse(event.data); // JSON data from extension
            console.log("model vis webview receive data: "+data);
            if(data.model_general_info){
              console.log("units count:"+JSON.parse(data.model_general_info).total_params);
              // 模型总体信息
              var model_general_info = JSON.parse(data.model_general_info);
              $("#model_total_layers").text(model_general_info.total_num_layers);
              $("#model_total_param").text(model_general_info.total_params);;
              $("#model_total_units").text(model_general_info.total_units);
            }else if(data.model_detail_info){
              var detail_info = JSON.parse(data.model_detail_info);
              var table = document.getElementById("model_detail_table");
              var layer_uniq_names = new Array(); // layer 名称列表 layername+index
              var layer_params_info = new Array(); // <name, value> 各layer的参数量
              var layer_params_list = new Array();
              var total_params=0;
  
              for(var i=0;i<detail_info.length/2;++i){
                  var line = document.createElement("tr");
                  line.style.border = "solid 3px";
                  line.style.height = "45px";
                  line.style.borderColor ="#D6D6D6";
                  var col_name = document.createElement("td");
                  col_name.style = "font-size: medium;padding-left: 15px;border: solid 2px;border-color: #D6D6D6;";
                  col_name.innerText = detail_info[i].name;
                  var col_shape = document.createElement("td");
                  col_shape.style = "font-size: medium;border: solid 2px;border-color: #D6D6D6;";
                  col_shape.innerText = detail_info[i].shape;
                  var col_params = document.createElement("td");
                  col_params.style = "font-size: medium;border: solid 2px;border-color: #D6D6D6;";
                  col_params.innerText = detail_info[i].params;
                  
                  if( parseInt(detail_info[i].params, 10) > 0){
                    layer_uniq_names.push(detail_info[i].name+"_"+(i+1));
                    layer_params_info.push({"name": detail_info[i].name+"_"+(i+1), "value": parseInt(detail_info[i].params, 10)});
                    layer_params_list.push(parseInt(detail_info[i].params, 10));
                    total_params += parseInt(detail_info[i].params, 10);
                  }
  
                  line.appendChild(col_name);
                  line.appendChild(col_shape);
                  line.appendChild(col_params);
                  table.appendChild(line);
              }
              // 另外一半数据使用副表
              table = document.getElementById("model_detail_table_secondary");
  
              for(var i=detail_info.length/2;i<detail_info.length;++i){
                  var line = document.createElement("tr");
                  line.style.border = "solid 3px";
                  line.style.height = "45px";
                  line.style.borderColor = "#D6D6D6";
                  var col_name = document.createElement("td");
                  col_name.style = "font-size: medium;padding-left: 15px;";
                  col_name.innerText = detail_info[i].name;
                  var col_shape = document.createElement("td");
                  col_shape.style = "font-size: medium;border: solid 2px;border-color: #D6D6D6;";
                  col_shape.innerText = detail_info[i].shape;
                  var col_params = document.createElement("td");
                  col_params.style = "font-size: medium;border: solid 2px;border-color: #D6D6D6;";
                  col_params.innerText = detail_info[i].params;
                  
                  if( parseInt(detail_info[i].params, 10) > 0){
                    layer_uniq_names.push(detail_info[i].name+"_"+(i+1));
                    layer_params_info.push({"name": detail_info[i].name+"_"+(i+1), "value": parseInt(detail_info[i].params, 10)});
                    layer_params_list.push(parseInt(detail_info[i].params, 10));
                    total_params += parseInt(detail_info[i].params, 10);
                  }
  
                  line.appendChild(col_name);
                  line.appendChild(col_shape);
                  line.appendChild(col_params);
                  table.appendChild(line);
              }
              // 绘制各layer 参数分布柱状图
              console.log("layer params list: "+layer_params_list);
              for(var i=0;i<layer_params_list.length;++i){
                layer_params_list[i] = Math.log10(layer_params_list[i]);
              }
              display_layer_params_bar_chart(layer_uniq_names, layer_params_list);
            }else if(data.model_layer_vis){
              var layer_output_info = JSON.parse(data.model_layer_vis);
              for(var i=0;i<layer_output_info.length;++i){
                  layer_name = layer_output_info[i].layer_name;
                  layer_idx = layer_output_info[i].layer_index;
                  layer_vis_img_paths = layer_output_info[i].layer_vis_img_paths;
                  
                  var img_div = document.createElement("div");
                  img_div.setAttribute("class","row");
                  img_div.style = "margin-left: 40px;margin-right: 40px;color: #333;border: 3px solid #333;margin-top: 0px; height:40px;margin-bottom: 0px; padding: 0px;border-color: #D6D6D6;";
  
                  var layer_name_div = document.createElement("div");
                  layer_name_div.setAttribute("class", "col-md-3");
                  layer_name_div.style = "font-size: medium;border-right: 2px solid #333;height: 38px;border-color: #D6D6D6;";
                  layer_name_div.innerText = layer_name;
                  img_div.appendChild(layer_name_div);
  
                  var layer_index_div = document.createElement("div");
                  layer_index_div.style = "font-size: medium;border-right: 2px solid #333;height: 38px;border-color: #D6D6D6;";
                  layer_index_div.setAttribute("class", "col-md-3");
  
                  layer_index_div.innerText = layer_idx;
                  img_div.append(layer_index_div);
  
                  var layer_vis_div = document.createElement("div");
                  layer_vis_div.setAttribute("class", "col-md-6");
  
                  for(var j=0;j<layer_vis_img_paths.length;++j){
                    var layer_img_tag = document.createElement("img");
                    layer_img_tag.src = layer_vis_img_paths[j];
                    console.log("target layer vis path: "+layer_vis_img_paths[j]);
                    layer_img_tag.style.width = "32px";
                    layer_img_tag.style.height = "32px";
                    if(j === 0){
                      layer_img_tag.style.marginLeft = "15px";
                    }
                    layer_vis_div.appendChild(layer_img_tag);
                    img_div.append(layer_img_tag);
                  }
                  // document.getElementById("model_layers_vis").appendChild(img_div);
                  document.getElementById("model_layers_vis").insertBefore(img_div, document.getElementById("tmp_peer"));
                }
  
                $(".loading-div").hide(); // 隐藏加载提示
            }
            console.log("ann model img displayed");
            $("#ann_model_vis_img").attr("src", "http://127.0.0.1:6003/img/ann_model_vis.png");
        });
      });
  
      function display_layer_params_bar_chart(layer_names, layer_param_counts){
        var option = {
              tooltip:{
                  trigger:"axis"
                },
                xAxis: {
                    type: 'category',
                    data: layer_names,
                    scale:true,
                    name:"神经层",
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      },
                      rotate:30
                    }
                },
              yAxis:[
                {
                  type: 'value',
                    scale:true,
                    name:"参数量(log_10)",
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      }
                    }
                },
                {
                  type: 'value',
                    scale:true,
                    name:"",
                    show:false,
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      }
                    }
                }
              ],
              series: [
                  {
                      name: '参数量(log_10)',
                      type: 'bar',
                      data: layer_param_counts,
                      itemStyle: {
                        normal: {
                          color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                              [
                                  {offset: 0, color: '#BBFFFF'},   
                                  {offset: 1, color: '#2FDECA'}
                              ]
                              )
                          },
                          emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                  0, 0, 0, 1,
                                [
                                  {offset: 0, color: '#2FDECA'},
                                  {offset: 1, color: '#2FDE80'}
                                ]
                            )
                          }
                      }
                  },
                  {
                      name: '',
                      type: 'line',
                      yAxisIndex: 1,
                      data: layer_param_counts,
                      itemStyle:{
                          normal:{
                              lineStyle:{
                                  color:"#FF994B"
                              }
                          }
                      }
                  }
              ]
          };
          var bar_chart_layer_params = echarts.init(document.getElementById("layer_param_percent_div"));
          bar_chart_layer_params.setOption(option);
      }
  </script>
  `;
}
exports.getConvertorModelPageV2 = getConvertorModelPageV2;
function getConvertorPageV2() {
    return `
    <!DOCTYPE html>
    <html style="height: 100%;width: 100%;">
    
    <head>
      <meta charset="UTF-8">
      <title>模型转换器</title>
      <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
      <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
      <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    </head>
    <body class="dark-mode" style="height: 100%;width: 100%;overflow: hidden;">
    
        <!-- 按钮触发模态框 -->
    <button id="modal_dialog" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal" style="display: none;">
      创建新的项目
    </button>
    <button id="modal_dialog_projrefac" class="btn" data-toggle="modal" data-target="#myModalProjRefact" style="display: none;">
      修改项目属性
    </button>
    
    </button>
    <!-- 模态框（Modal） -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;">
        <div class="modal-content" style="background-color: white;">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);">
              &times;
            </button>
            <h4 class="modal-title" id="myModalLabel" style="font-weight: 700;font-size: 25px;">
              项目创建向导
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form">
                        <div class="form-group">
                            <label for="project_name" style="font-weight: 500;font-size: 18px;">项目名称</label>
                            <input type="text" class="form-control" id="project_name">
                        </div>
                        <div class="form-group">
                            <label for="select_type" style="font-weight: 500;font-size: 18px;">选择项目类别</label>
                            <select class="form-control" id="select_type">
                                <option>图像分类</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="python_type" style="font-weight: 500;font-size: 18px;">选择python版本</label>
                            <select class="form-control" id="python_type">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group">
                          <label for="ann_lib_type" style="font-weight: 500;font-size: 18px;">模型使用的神经网络库</label>
                          <select class="form-control" id="ann_lib_type">
                            <option>Keras(Tensorflow backended)</option>
                          </select>
                        </div>
                        <div class="input-group">
                          <span id="span_save_path" class="input-group-addon" style="cursor:pointer">点击选择保存路径</span>
                          <input id="proj_save_path_input" type="text" class="form-control">
                        </div>
                    </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss">关闭
            </button>
            <button type="button" class="btn btn-primary" id="create">创建
            </button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal -->
    </div>
    
    <!--项目属性修改-->
    <div class="modal fade" id="myModalProjRefact" tabindex="-1" role="dialog" aria-labelledby="myModalLabelProjRefact" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;">
        <div class="modal-content" style="background-color: white;">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);">
              &times;
            </button>
            <h4 class="modal-title" id="myModalLabelProjRefact" style="font-weight: 700;font-size: 25px;">
              项目属性修改
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form_projrefac">
                        <div class="form-group">
                            <label for="project_name_projrefac" style="font-weight: 500;font-size: 18px;">项目名称</label>
                            <input type="text" class="form-control" id="project_name_projrefac">
                        </div>
                        <div class="form-group">
                            <label for="select_type_refac" style="font-weight: 500;font-size: 18px;">选择项目类别</label>
                            <select class="form-control" id="select_type_refac">
                                <option>图像分类</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="python_type_projrefac" style="font-weight: 500;font-size: 18px;">选择python版本</label>
                            <select class="form-control" id="python_type_projrefac">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group">
                          <label for="ann_lib_type_projrefac" style="font-weight: 500;font-size: 18px;">模型使用的神经网络库</label>
                          <select class="form-control" id="ann_lib_type_projrefac">
                            <option>Keras(Tensorflow backended)</option>
                          </select>
                        </div>
                    </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss_projrefac">取消
            </button>
            <button type="button" class="btn btn-primary" id="create_projrefac">确认
            </button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal -->
    </div>
    
    </body>
    <style>
    
    .editor-sidenav{
      background-color: #333;
    }
    
    body {
      padding: 25px;
      background-color: rgb(250, 253, 253);
      color: white;
      font-size: 25px;
    }
    
    .dark-mode {
      background-color: rgb(250, 253, 253);
      color: white;
    }
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
    
      .resizable {
        resize: both;
        overflow: scroll;
        border: 1px solid black;
      }
      .dropdown-content{
       width: max-content !important;
       height:auto !important;
    }
    </style>
    
    <!-- <link rel="stylesheet" href="http://localhost:6003/css/bootstrap.min.css">
    <script src="http://localhost:6003/js/jquery.min.js"></script>
    <script src="http://localhost:6003/js/bootstrap.min.js"></script> -->
    
    <script>
    
        const vscode = acquireVsCodeApi();
        $(document).ready(function(){
           // 选择项目文件保存路径
           $("#span_save_path").on("click", function(){
             // 发送消息到extension，打开选择路径的dialog
             console.log("发送消息到extension，打开选择路径的dialog");
             vscode.postMessage(JSON.stringify({"select_save_proj_path_req":$("#project_name").val()}));
           });
            $("#create").on("click",function(){
                console.log("创建xxx");
                var project_name = $("#project_name").val();
                var project_type = $("#select_type").val();
                var python_type = $("#python_type").val();
                var ann_lib_type = $("#ann_lib_type").val();
                // 发送到extension
                vscode.postMessage(JSON.stringify({"project_info":{
                  "project_name":project_name, "project_type":project_type,
                                "python_type":python_type, "ann_lib_type":ann_lib_type
                }}));
                $("#dismiss").click();
            });
            $("#dismiss").on("click", function(){
                console.log("取消创建");
            });
    
            $("#create_projrefac").on("click", function(){
              console.log("修改项目属性");
              var proj_name = $("#project_name_projrefac").val();
              var proj_type = $("#select_type_refac").val();
              var python_type = $("#python_type_projrefac").val();
              var ann_lib_type = $("#ann_lib_type_projrefac").val();
    
              // 发送到extension
              vscode.postMessage(JSON.stringify({"project_refac_info":{
                "project_name":proj_name, "project_type":proj_type, "python_type":python_type,"ann_lib_type":ann_lib_type
              }}));
              $("#dismiss_projrefac").click();
            });
    
            $("#dismiss_projrefac").on("click", function(){
              console.log("取消修改项目属性");
            });
    
            // 接收从extension 的消息
            window.addEventListener('message', (event)=>{
                const message = event.data; // JSON data from extension
                if(message.command){
                      console.log("从extension 接收到消息：xxxxxx:"+message.command);
                    if(message.command === "CreateNewProject"){
                      $("#modal_dialog").click();
                      console.log("web view, 创建新的项目");
                    }else if(message.command === "ProjectRefactor"){
                      console.log("web view, 项目属性修改");
                      $("#modal_dialog_projrefac").click();
                      var project_info = message.project_desc;
                      $("#project_name_projrefac").val(project_info.project_name);
                      $("#select_type_refac").val(project_info.project_type);
                      $("#python_type_projrefac").val(project_info.python_type);
                      $("#ann_lib_type_projrefac").val(project_info.ann_lib_type);
                    }
                }else{
                  let message = JSON.parse(event.data);
                  if(message.proj_select_path){
                    console.log("接收到新项目保存路径："+message.proj_select_path);
                    $("#proj_save_path_input").val(message.proj_select_path);
                  }
                }
            });
        });
        // const vscode = acquireVsCodeApi();
        // $("#convertor_entrance").on("click",function(){
        //   console.log("jump back to convertor page");
        //   vscode.postMessage(JSON.stringify({"click":"convertor_page"}));
        // });
    </script>
    `;
}
exports.getConvertorPageV2 = getConvertorPageV2;
function getANNSNNConvertPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: auto;white-space: nowrap;">
  
      <div style="margin-top: 30px;height: 140px;background: rgba(238,238,238,0.4);width: 1400px;">
          <div class="col-md-12">
              <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -160px;"><font style="color: #333;font-weight: bold;">转换参数配置</font></div>
              <form role="form" class="row" style="margin-left: 40px;margin-top: 15px;" id="project_info_form">
                  <div class="col-md-2" style="text-align: center;">
                      <label for="select_vthresh"><font style="color: #333;font-weight: bold;">膜电压阈值</font></label>
                      <select class="form-control" id="select_vthresh">
                          <option>21</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                          <option>9</option>
                          <option>10</option>
                          <option>11</option>
                          <option>12</option>
                          <option>13</option>
                          <option>14</option>
                          <option>15</option>
                          <option>16</option>
                          <option>17</option>
                          <option>18</option>
                          <option>19</option>
                          <option>20</option>
                          <option>22</option>
                          <option>23</option>
                          <option>24</option>
                          <option>25</option>
                          <option>26</option>
                          <option>27</option>
                          <option>28</option>
                          <option>29</option>
                          <option>30</option>
                      </select>
                  </div>
                  <div class="col-md-2" style="margin-left: 18px;text-align: center;">
                      <label for="select_dt"><font style="color: #333;font-weight: bold;">神经元dt</font></label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 18px;text-align: center;">
                      <label for="select_synapse_dt"><font style="color: #333;font-weight: bold;">突触dt</font></label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>0.1ms</option>
                          <option>1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 18px;text-align: center;">
                      <label for="select_delay"><font style="color: #333;font-weight: bold;">delay</font></label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 18px;text-align: center;">
                      <label for="select_dura"><font style="color: #333;font-weight: bold;">总时间</font></label>
                      <select class="form-control" id="select_dura">
                          <option>100ms</option>
                          <option>200ms</option>
                          <option>500ms</option>
                      </select>
                  </div>
              </form>
          </div>
      </div>
  
  
      <div style="margin-top: 10px;height: 160px;background: rgba(238,238,238,0.4);width: 1400px;">
          <div>
              <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -160px;"><font style="color: #333;font-weight: bold;">转换进度</font></div>
              <div class="row" style="margin-left: 30px;color: #333;">
                  <div class="col-md-2" style="text-align: center;">
                      <div>ANN转SNN</div>
                      <div class="progress progress-striped active">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleY(0.4);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">arrow_forward</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div>预处理</div>
                      <div class="progress  progress-striped active">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleY(0.4);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">arrow_forward</i>
                  </div>
  
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div>参数调优</div>
                      <div class="progress progress-striped active">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleY(0.4);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">arrow_forward</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div>DarwinLang文件生成</div>
                      <div class="progress progress-striped active">
                          <div id="darlang_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
              </div>
          
              <div class="row">
                  <!-- <span>启动</span> -->
                  <!-- <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i> -->
                  <div class="progress progress-striped active" style="width: 85%;display: inline-block;margin-bottom: 0;margin-left: 60px;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%;">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      <div style="height: 560px; margin-top: 10px;">
          <div class="col-md-12">
              <div style="width: 350px;height: 560px;display: inline-block;vertical-align: top;white-space:normal;background: rgba(238,238,238,0.4);">
                  <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -20px;"><font style="color: #333;font-weight: bold;">日志输出</font></div>
                  <div id="log_output_div" style="margin-left: 20px;height: 340px; width: 300px; overflow: auto;margin-top: 60px;color: #333;">
                  </div>
              </div>
              <div style="width: 460px;height: 560px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);margin-left: 10px;">
                  <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -80px;"><font style="color: #333;font-weight: bold;">转换性能分析</font></div>
                  <div id="use_time_bar_chart" style="width: 340px;height: 400px;margin-top: 15px;margin-left: 40px;"></div>
              </div>
              <div style="height:560px;margin-left: 10px;width: 560px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
                  <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;margin-left: 10px;"><font style="color: #333;font-weight: bold;">转换过程信息</font></div>
                  <table id="info_simu_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;border-spacing: 0px 5px;color: #333;margin-left: 20px;">
                      <tr style="margin-top: 15px;border: solid 2px #D6D6D6;">
                          <td style="width: 80px;font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">转换总耗时</td>
                          <td id="total_use_time" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">平均激发脉冲次数</td>
                          <td id="avg_spike" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">激发脉冲次数方差</td>
                          <td id="std_spike" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">连接权重均值</td>
                          <td id="avg_conn_wt" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">连接权重方差</td>
                          <td id="std_conn_wt" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">ANN转SNN耗时</td>
                          <td id="stage1_time_use" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">预处理耗时</td>
                          <td id="stage2_time_use" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">参数调优耗时</td>
                          <td id="stage3_time_use" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                      <tr style="margin-top: 15px;">
                          <td style="font-size: small;font-weight: bold;border: solid 2px #D6D6D6;background: #EEEEEE;padding: 15px;">DarwinLang文件生成耗时</td>
                          <td id="stage4_time_use" style="border: solid 2px #D6D6D6;padding: 15px;">xxx</td>
                      </tr>
                  </table>
                  <table id="scale_factors_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;border-spacing: 0px 5px;">
                      <!-- <tr style="height: 35px;margin-top: 0px;">
                          <td style="width: 100px;font-size: small;font-weight: bold;">层<br/>00Conv2D_26x26x8 参数缩放系数</td>
                          <td>系数1</td>
                      </tr>
                      <tr style="height: 35px;">
                          <td style="width: 100px;font-size: small;font-weight: bold;">缩放系数</td>
                          <td>系数2</td>
                      </tr> -->
                  </table>
      
                  <!-- <div style="margin-top: 30px;">
                      <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络输出层脉冲</div>
                      <div id="model_layers_vis_tab_caption" style="font-size: small;font-weight: bold;text-align: center;">统计计数</div>
                      <table id="spike_out_count_table" style="margin-left: 125px;">
                          <tr id="out_labels">
                          </tr>
                          <tr id="out_counts_tr">
                          </tr>
                      </table>
                      <ul id="sample_imgs_ul" style="height: 300px;width: 100px;overflow-x: hidden;display: inline-block;">
                           <li style="list-style: none;margin-bottom: 10px;">
                              <img style="height: 50px;width: 50px;">
                              <span style="text-align: center;">测试标签</span>
                          </li>
                          <li style="list-style: none;margin-bottom: 10px;background-color: chocolate;">
                              <img style="height: 50px;width: 50px;">
                              <span style="text-align: center;">测试标签</span>
                          </li> -->
                      </ul>
                      <!-- <div id="spike_charts" style="width: 420px;height: 340px;margin-left: 25px;display: inline-block;"></div>
                  </div> -->
              </div>
          </div>
      </div>
  
  </body>
  <style>
  
  .titlebar {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  
  .titlebar-button {
    -webkit-app-region: no-drag;
  }
  
  body {
    padding: 25px;
    background-color: rgb(251, 255, 255);
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(249, 251, 252);
    color: white;
  }
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
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  
  <script>
  
  const vscode = acquireVsCodeApi();
  let stage1_convert_finish=false;
  let stage2_preprocess_finish=false;
  let stage3_search_finish=false;
  let stage4_all_finish=false;
  
  let log_output_lists = new Array();
  
      let prev_clicked_img_li_id=undefined;
  
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
                console.log("ANN 转SNN 模型接收到extension 消息："+evt.data);
                const data = JSON.parse(evt.data);
                if(data.log_output){
                  log_output_lists = log_output_lists.concat(data.log_output.split("<br/>"));
                  console.log("data.logoutput=["+data.log_output+"]");
                  console.log("data split list len="+log_output_lists.length);
                  $("#log_output_div").html(log_output_lists.join("<br/>"));
                  document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight;
                  if(log_output_lists.length <= 180){
                      console.log("increase sub progress bar 1, style width="+""+parseInt(log_output_lists.length/180*100)+"%");
                          document.getElementById("model_convert_progress_div").style.width = ""+parseInt(log_output_lists.length/180*100)+"%";
                  }
                  if(stage1_convert_finish){
                      if(log_output_lists.length < 360 && stage2_preprocess_finish !== true){
                          console.log("increase sub progress bar 2");
                              document.getElementById("preprocess_progress_div").style.width = ""+parseInt((log_output_lists.length-176)/(360-176)*100)+"%";
                      }
                  }
                  if(stage2_preprocess_finish){
                      if(log_output_lists.length < 460 && stage3_search_finish !== true){
                          console.log("increase sub progress bar 3");
                              document.getElementById("search_progress_div").style.width = ""+parseInt((log_output_lists.length-347)/(450-347)*100)+"%";
                      }
                  }
                  if(stage3_search_finish){
                      if(log_output_lists.length < 520 && stage4_all_finish !== true){
                          console.log("increase sub progress bar 4");
                              document.getElementById("darlang_progress_div").style.width = ""+parseInt((log_output_lists.length-450)/(520-450)*100)+"%";
                      }
                  }
                  if(stage4_all_finish !== true){
                      console.log("increase sub progress bar total");
                      document.getElementById("total_progress_div").style.width = ""+parseInt(log_output_lists.length/520*100)+"%";
                  }
                }else if(data.exec_finish){
                    // 结束
                  //   document.getElementById("start_convert_btn").style.backgroundColor = "";
                    console.log("total finished, log_output_list length="+log_output_lists.length);
                    document.getElementById("model_convert_progress_div").style.width = "100%";
                    document.getElementById("preprocess_progress_div").style.width = "100%";
                    document.getElementById("search_progress_div").style.width = "100%";
                    document.getElementById("darlang_progress_div").style.width = "100%";
                    document.getElementById("total_progress_div").style.width = "100%";
                    console.log("LINE COUNT all_finish="+log_output_lists.length);
                    stage4_all_finish = true;
                }else if(data.progress){
                    // 处理进度信息
                    if(data.progress === "convert_finish"){
                        document.getElementById("model_convert_progress_div").style.width = "100%";
                        console.log("LINE COUNT convert_finish="+log_output_lists.length);
                        stage1_convert_finish = true;
                    }else if(data.progress === "preprocess_finish"){
                        document.getElementById("preprocess_progress_div").style.width = "100%";
                        console.log("LINE COUNT preprocess_progress_div="+log_output_lists.length);
                        stage2_preprocess_finish = true;
                    }else if(data.progress === "search_finish"){
                        document.getElementById("search_progress_div").style.width = "100%";
                        console.log("LINE COUNT search_progress_div="+log_output_lists.length);
                        stage3_search_finish = true;
                    }
                }else if(data.snn_info){
                    // snn 相关数据
                  //   const infos = JSON.parse(data.snn_info);
                  //   var test_img_uls = document.getElementById("sample_imgs_ul");
                  //   var test_img_uris = infos.spikes.snn_test_imgs;
                  //   var test_img_spikes = infos.spikes.snn_test_spikes;
                  //   console.log("spiking img uris[0]"+test_img_uris[0]);
                  //   console.log("spiking spike infos[0]="+test_img_spikes[0].cls_names);
                  //   console.log("spike tuples[0]="+test_img_spikes[0].spike_tuples);
  
                  //   for(let i=0;i<test_img_uris.length;++i){
                  //     var img_li = document.createElement("li");
                  //     img_li.id = "img_li_"+i;
                  //     img_li.style.listStyle = "none";
                  //     img_li.style.marginBottom = "10px";
                  //     var img_tag = document.createElement("img");
                  //     img_tag.id = "sample_img_"+i;
                  //     img_tag.src = test_img_uris[i];
                  //     img_tag.style.width = "50px";
                  //     img_tag.style.height = "50px";
  
                  //     img_li.appendChild(img_tag);
                  //     test_img_uls.appendChild(img_li);
  
                  //     var label_span = document.createElement("span");
                  //     label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                  //     img_li.appendChild(label_span);
  
                  //     img_tag.onclick = function(){
                  //       console.log("draw NO."+i+" img and spikes");
                  //       console.log("reset background color of prev:"+prev_clicked_img_li_id);
                  //       if(prev_clicked_img_li_id !== undefined){
                  //           document.getElementById(prev_clicked_img_li_id).style.backgroundColor = "";
                  //       }
                  //       console.log("set background color of li: "+ "img_li_"+i);
                  //       document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                  //       prev_clicked_img_li_id = "img_li_"+i;
                  //       display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                  //       // display counts in table
                  //       let cls_idx = test_img_spikes[i].spike_tuples[0][0];
                  //       let curr_count=1;
                  //       let spike_counts = new Array();
                  //       for(let j=0;j<test_img_spikes[i].cls_names.length;++j){
                  //           spike_counts.push(0);
                  //       }
                  //       for(let j=1;j<test_img_spikes[i].spike_tuples.length;++j){
                  //           if(cls_idx === test_img_spikes[i].spike_tuples[j][0]){
                  //               curr_count = curr_count+1;
                  //           }else{
                  //               spike_counts[cls_idx] = curr_count;
                  //               curr_count=1;
                  //               cls_idx = test_img_spikes[i].spike_tuples[j][0];
                  //           }
                  //       }
                  //       spike_counts[spike_counts.length-1] = curr_count;
                  //       document.getElementById("out_labels").innerHTML = "";
                  //       let td_child = document.createElement("td");
                  //       td_child.innerText = "计数值:";
                  //       td_child.style.width = "60px";
                  //       document.getElementById("out_labels").appendChild(td_child);
  
                  //       document.getElementById("out_counts_tr").innerHTML = '';
                  //       td_child = document.createElement("td");
                  //       td_child.innerText = "标签名称:";
                  //       td_child.style.width = "60px";
                  //       document.getElementById("out_counts_tr").appendChild(td_child);
  
                  //       for(let j=0;j<spike_counts.length;++j){
                  //         let td_child = document.createElement("td");
                  //         td_child.innerText = spike_counts[j];
                  //         td_child.style.width = "33px";
                  //         document.getElementById("out_counts_tr").appendChild(td_child);
  
                  //         td_child = document.createElement("td");
                  //         td_child.innerText = test_img_spikes[i].cls_names[j];
                  //         td_child.style.width = "33px";
                  //         document.getElementById("out_labels").appendChild(td_child);
                  //       }
                  //     }
                  //   }
                }else if(data.convert_info){
                    const convert_infos = JSON.parse(data.convert_info);
                    $("#total_use_time").text(convert_infos.total_use_time);
                    $("#avg_spike").text(convert_infos.spk_mean+" 次");
                    $("#std_spike").text(convert_infos.spk_std);
                    $("#avg_conn_wt").text(convert_infos.wt_mean);
                    $("#std_conn_wt").text(convert_infos.wt_std);
                    $("#stage1_time_use").text(convert_infos.stage1_time_use+" 秒");
                    $("#stage2_time_use").text(convert_infos.stage2_time_use+" 秒");
                    $("#stage3_time_use").text(convert_infos.stage3_time_use+" 秒");
                    $("#stage4_time_use").text(convert_infos.stage4_time_use+" 秒");
  
                    let bar_chart_label_names = ["ANN转SNN", "预处理", "参数调优", "DarwinLang文件生成"];
                    let bar_chart_label_counts = [parseFloat(convert_infos.stage1_time_use), parseFloat(convert_infos.stage2_time_use),
                                  parseFloat(convert_infos.stage3_time_use), parseFloat(convert_infos.stage4_time_use)];
                    display_bar_chart(bar_chart_label_names, bar_chart_label_counts, "","秒","use_time_bar_chart");
                }else if(data.ann_model_start_convert){
                    // 接收到启动转换的命令，初始化
                  let v_thresh = $("#select_vthresh").val().replace("ms","");
                  let neuron_dt = $("#select_dt").val().replace("ms","");
                  let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
                  let delay = $("#select_delay").val().replace("ms", "");
                  let dura = $("#select_dura").val().replace("ms","");
                  console.log("v_thresh="+v_thresh+", neuron_dt="+neuron_dt+", synapse_dt="+synapse_dt+", delay="+delay);
                  vscode.postMessage(JSON.stringify({"model_convert_params":{
                      "vthresh": v_thresh,
                      "neuron_dt": neuron_dt,
                      "synapse_dt":synapse_dt,
                      "delay":delay,
                      "dura":dura
                  }}));
                  log_output_lists.splice(0);
                  stage1_convert_finish = false;
                  stage2_preprocess_finish = false;
                  stage3_search_finish = false;
                  stage4_all_finish = false;
                  document.getElementById("model_convert_progress_div").style.width = "0%";
                  document.getElementById("preprocess_progress_div").style.width = "0%";
                  document.getElementById("search_progress_div").style.width = "0%";
                  document.getElementById("darlang_progress_div").style.width = "0%";
                  document.getElementById("total_progress_div").style.width = "0%";
                }else if(data.scale_factors){
                  // scale_factors_table
                  // <tr style="margin-top: 15px;height: 35px;">
                  //     <td style="width: 200px;font-size: medium;font-weight: bold;">缩放系数</td>
                  //     <td>系数2</td>
                  // </tr> -->
                  scale_fac = JSON.parse(data.scale_factors);
                  for(obj in scale_fac){
                      let table_line = document.createElement("tr");
                      table_line.style.height = "35px";
                      table_line.style.border = "solid 2px #D6D6D6";
                      table_line.style.color = "#333";
                      let line_td1 = document.createElement("td");
                      line_td1.style.width = "80px";
                      line_td1.style.fontSize = "small";
                      line_td1.style.fontWeight = "bold";
                      line_td1.style.border = "solid 2px #D6D6D6";
                      line_td1.style.padding = "10px";
                      line_td1.innerHTML = ""+obj+"层<br/>参数缩放系数";
                      table_line.appendChild(line_td1);
                      let line_td2 = document.createElement("td");
                      line_td2.style.border = "solid 2px #D6D6D6";
                      line_td2.style.padding = "10px";
                      line_td2.innerText = parseFloat(scale_fac[obj]).toFixed(3);
                      table_line.appendChild(line_td2);
                      document.getElementById("scale_factors_table").appendChild(table_line);
                  }
                }
            });
  
  
            // 参数更改监听
            $("#select_vthresh").change(()=>{
              console.log("参数变动...");
              reset_and_postmsg();
            });
            $("#select_dt").change(()=>{
                console.log("参数变动...");
                reset_and_postmsg();
            });
            $("#select_synapse_dt").change(()=>{
                console.log("参数变动...");
                reset_and_postmsg();
            });
            $("#select_delay").change(()=>{
                console.log("参数变动...");
                reset_and_postmsg();
            });
            $("#select_dura").change(()=>{
                console.log("参数变动...");
                reset_and_postmsg();
            });
          //   $("#start_convert_btn").on("click", ()=>{
          //       let v_thresh = $("#select_vthresh").val().replace("ms","");
          //       let neuron_dt = $("#select_dt").val().replace("ms","");
          //       let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
          //       let delay = $("#select_delay").val().replace("ms", "");
          //       let dura = $("#select_dura").val().replace("ms","");
          //       document.getElementById("start_convert_btn").style.backgroundColor = "chocolate";
          //       console.log("v_thresh="+v_thresh+", neuron_dt="+neuron_dt+", synapse_dt="+synapse_dt+", delay="+delay);
          //       vscode.postMessage(JSON.stringify({"model_convert_params":{
          //           "vthresh": v_thresh,
          //           "neuron_dt": neuron_dt,
          //           "synapse_dt":synapse_dt,
          //           "delay":delay,
          //           "dura":dura
          //       }}));
          //       document.getElementById("model_convert_progress_div").style.width = "0%";
          //       document.getElementById("preprocess_progress_div").style.width = "0%";
          //       document.getElementById("search_progress_div").style.width = "0%";
          //       document.getElementById("darlang_progress_div").style.width = "0%";
          //       document.getElementById("total_progress_div").style.width = "0%";
  
          //   });
  
        });
  
        function reset_and_postmsg(){
              let v_thresh = $("#select_vthresh").val().replace("ms","");
              let neuron_dt = $("#select_dt").val().replace("ms","");
              let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
              let delay = $("#select_delay").val().replace("ms", "");
              let dura = $("#select_dura").val().replace("ms","");
              console.log("v_thresh="+v_thresh+", neuron_dt="+neuron_dt+", synapse_dt="+synapse_dt+", delay="+delay+", dura="+dura);
              log_output_lists.splice(0);
              stage1_convert_finish = false;
              stage2_preprocess_finish = false;
              stage3_search_finish = false;
              stage4_all_finish = false;
              // // 传递到插件
              // vscode.postMessage(JSON.stringify({"convertor_params_change":{
              //     "v_thresh":v_thresh,
              //     "neuron_dt":neuron_dt,
              //     "synapse_dt":synapse_dt,
              //     "delay":delay,
              //     "dura":dura
              // }}));
                document.getElementById("model_convert_progress_div").style.width = "0%";
                document.getElementById("preprocess_progress_div").style.width = "0%";
                document.getElementById("search_progress_div").style.width = "0%";
                document.getElementById("darlang_progress_div").style.width = "0%";
                document.getElementById("total_progress_div").style.width = "0%";
        }
  
  
      //   function display_spike_scatter_chart(labels, datas){
      //       var opt={
      //             xAxis: {
      //                 type:'category',
      //                 data: labels
      //             },
      //             yAxis: {
      //                 splitLine:{show:false},
      //                 axisLine: {show: false}, 
      //                 axisTick: {show: false},
      //                 axisLabel:{show:false}
      //             },
      //             series: [{
      //                 symbolSize: 5,
      //                 data: datas,
      //                 type: 'scatter'
      //             }]
      //         };
      //         var spike_chart = echarts.init(document.getElementById("spike_charts"));
      //         spike_chart.setOption(opt);
      //   }
  
  
        function display_bar_chart(label_names, label_counts, title,series_name,target_id){
          console.log("label names:"+label_names);
          console.log("label counts:"+label_counts);
          var option = {
              tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                      type: 'cross',
                      crossStyle: {
                          color: '#999'
                      }
                  }
              },
              xAxis: [
                  {
                      type: 'category',
                      data:label_names,
                      axisPointer: {
                          type: 'shadow'
                      },
                      axisLabel:{
                          rotate:30,
                          color:"black"
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '时长(秒)',
                      nameTextStyle:{
                          color:"black"
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"black"
                          }
                      }
                  }
              ],
              series: [
                  {
                      name: series_name,
                      type: 'bar',
                      data: label_counts,
                      barWidth:"30px",
                      itemStyle: {
                          normal: {
                              label: {
                                  show: true, //开启显示
                                  position: 'top', //在上方显示
                                  textStyle: { //数值样式
                                      color: 'black',
                                      fontSize: 16
                                  }
                              },
                              color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                              [
                                  {offset: 0, color: '#77A4FF'},   
                                  {offset: 1, color: '#A5CBFF'}
                              ]
                              )
                          },
                          emphasis: {
                            color: new echarts.graphic.LinearGradient(
                                  0, 0, 0, 1,
                                [
                                  {offset: 0, color: '#2FDECA'},
                                  {offset: 1, color: '#2FDE80'}
                                ]
                            )
                          }
                      }
                  }
              ]
          };
          var bar_chart_data = echarts.init(document.getElementById(target_id));
          bar_chart_data.setOption(option);
      }
  </script>
  
  </html>
  `;
}
exports.getANNSNNConvertPage = getANNSNNConvertPage;
function getSNNSimuPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
      <div style="margin-top: 20px;display: block;">
  
          <div style="background: rgba(238,238,238,0.4);width: 350px;height: 300px;display: inline-block;">
            <div>
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">仿真配置结果评估</font></div>
              <table id="layer_conf_val" style="width: 260px;margin-left:40px;margin-top: 70px;border: solid 3px #D6D6D6;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">膜电压阈值</td>
                    <td id="simulate_vthresh"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;"">
                    <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">神经元时间步长</td>
                    <td id="simulate_neuron_dt"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;"">
                    <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">突触时间步长</td>
                    <td id="simulate_synapse_dt"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;"">
                    <td  style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">延迟</td>
                    <td id="simulate_delay"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;"">
                    <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">仿真时长</td>
                    <td id="simulate_dura"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;"">
                    <td style="font-size: medium;font-weight: bold;color: #00BE57;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">准确率</td>
                    <td id="simulate_acc" style="color: #00BE57;"></td>
                  </tr>    
              </table>
            </div>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 350px;height: 300px;display: inline-block;">
            <div style="font-size: large;font-weight: bold;text-align: center;margin-left: 40px;"><font style="color: #333;font-weight: bold;">放电次数均值方差统计</font></div>
            <table id="snn_layers_spike_table" style="width: 280px;margin-left:40px;margin-top: 70px;border: solid 3px #D6D6D6;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">层编号</td>
                <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">放电次数均值</td>
                <td style="font-size: medium;font-weight: bold;padding-left: 15px;border: solid 2px #D6D6D6;background: #EEEEEE">放电次数方差</td>
              </tr>
            </table>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 500px;height: 300px;display: inline-block;">
            <div>
              <div id="neurons_v_out_div" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">神经元放电</font></div>
              <div style="width: 360px;margin-left: 40px;">
                <form class="form-horizontal" role="form">
                  <div class="form-group">
                    <label class="control-label col-md-8" for="select_which_layer"><font style="color: #333;font-weight: bold;">选择神经元层</font></label>
                    <div class="col-md-4">
                      <select class="form-control" id="select_which_layer">
                        <option>输入层</option>
                        <option>输出层</option>
                    </select>
                    </div>
                  </div>
                </form>
              </div>
              <div id="neurons_v_chart" style="width: 460px;height: 240px;margin-left: 40px;margin-top: 40px;"></div>
            </div>
          </div>
      </div>
      <div style="margin-top: 5px;display: block;">
          <div style="display: inline-block;width: 610px;height: 550px;background: rgba(238,238,238,0.4);">
            <div id="model_input_spike_cap" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">脉冲神经网络输入层脉冲</font></div>
            <div id="input_spike_charts" style="width: 460px;height: 320px;margin-left: 70px;display: inline-block;margin-top: 40px;"></div>
            <ul id="input_spike_sample_imgs_ul" style="height: 60px;width: 460px;overflow: auto; white-space: nowrap;display: block;margin-left: 55px;">
            </ul>
          </div>
          <div style="width: 590px;height: 550px;display: inline-block;margin: left 20px;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">脉冲神经网络输出层脉冲</font></div>
              <span style="font-size: smaller;margin-left: 200px;color: #23D951;">红色标记图像为输出层预测错误</span>
              <div id="model_layers_vis_tab_caption" style="font-size: small;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">统计计数</font></div>
              <table id="spike_out_count_table" style="margin-left: 100px;border: solid 3px #D6D6D6;color: #333;">
                  <tr id="out_labels" style="border: solid 2px #D6D6D6;">
                  </tr>
                  <tr id="out_counts_tr" style="border: solid 2px #D6D6D6;">
                  </tr>
              </table>
              <div id="spike_charts" style="width: 460px;height: 320px;margin-left: 70px;display: inline-block;"></div>
              <ul id="sample_imgs_ul" style="height: 100px;width: 460px;overflow: auto; white-space: nowrap;display: block;margin-left: 80px;">
              </ul>
          </div>
      </div>
  </body>
  <style>
  
  .titlebar {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  
  .titlebar-button {
    -webkit-app-region: no-drag;
  }
  
  body {
    padding: 25px;
    background-color: rgb(251, 255, 255);
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(249, 251, 252);
    color: white;
  }
  
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
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  
  <script>
    let prev_clicked_li = undefined;
    let prev_clicked_input_li = undefined;
    let need_red_img_li = new Array();
  
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
              console.log("SNN 仿真接收到extension 消息");
              need_red_img_li.splice(0);
                const data = JSON.parse(evt.data);
                if(data.snn_info){
                    var infos =JSON.parse(data.snn_info);
  
                    var test_img_uls = document.getElementById("sample_imgs_ul");
                    var test_img_uris = infos.spikes.snn_test_imgs;
                    var test_img_spikes = infos.spikes.snn_test_spikes;
                    console.log("spiking img uris[0]"+test_img_uris[0]);
                    console.log("spiking spike infos[0]="+test_img_spikes[0].cls_names);
                    console.log("spike tuples[0]="+test_img_spikes[0].spike_tuples);
  
                    calc_need_red(test_img_spikes, test_img_uris);
                    console.log("call calc_need_red function finish, start for img uris...");
                    for(let i=0;i<test_img_uris.length;++i){
                      var img_li = document.createElement("li");
                      img_li.style.listStyle = "none";
                      img_li.style.display = "inline-block";
                      img_li.id = "img_li_"+i;
                      img_li.style.width = "53px";
                      img_li.style.height = "80px";
                      img_li.style.marginRight = "20px";
                      var img_tag = document.createElement("img");
                      img_tag.id = "sample_img_"+i;
                      img_tag.style.opacity = "0.5";
                      img_tag.style.display = "block";
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        console.log("current click cls_names="+test_img_spikes[i].cls_names);
                        console.log("current click spike tuples="+test_img_spikes[i].spike_tuples);
                        if(prev_clicked_li !== undefined){
                          document.getElementById(prev_clicked_li).style.backgroundColor = "";
                        }
                        document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_li = "img_li_"+i;
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        console.log("start display counts in table....");
                        let cls_idx = test_img_spikes[i].spike_tuples[0][0];
                        console.log("cls_idx="+cls_idx);
                        let curr_count=1;
                        let spike_counts = new Array();
                        for(let j=0;j<test_img_spikes[i].cls_names.length;++j){
                            spike_counts.push(0);
                        }
                        console.log("test_img_spikes[i].spike_tuples.length="+test_img_spikes[i].spike_tuples.length);
                        for(let j=1;j<test_img_spikes[i].spike_tuples.length;++j){
                            if(cls_idx === test_img_spikes[i].spike_tuples[j][0]){
                                curr_count = curr_count+1;
                            }else{
                                spike_counts[cls_idx] = curr_count;
                                curr_count=1;
                                cls_idx = test_img_spikes[i].spike_tuples[j][0];
                            }
                        }
                        console.log("--- calc finished.");
                        console.log("spike counts="+spike_counts);
                        spike_counts[cls_idx] = curr_count;
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "80px";
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.innerText = "计数值:";
                        td_child.style.width = "80px";
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          td_child.innerText = test_img_spikes[i].cls_names[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          document.getElementById("out_labels").appendChild(td_child);
                        }
  
                        console.log("check spike_counts of "+i+", ="+spike_counts);
                        // mark reds
                        for(let k=0;k<need_red_img_li.length;++k){
                          if(prev_clicked_li === need_red_img_li[k]){
                            document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                          }else{
                            document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                          }
                        }
                      }
                      img_tag.src = test_img_uris[i];
                      img_tag.style.width = "50px";
                      img_tag.style.height = "50px";
  
                      img_li.appendChild(img_tag);
                      test_img_uls.appendChild(img_li);
  
                      var label_span = document.createElement("span");
                      label_span.style.color = "#333";
                      console.log("图片 i="+i+", uri="+test_img_uris[i]);
                      // a.split("/")[5].split("_")[4].split(".")[0]
                      // label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      label_span.innerText = "标签: "+test_img_uris[i].split("/")[5].split("_")[4].split(".")[0];
                      img_li.appendChild(label_span);
                    }
  
                    // 创建输入层脉冲激发图
                    for(let i=0;i<infos.spikes.snn_input_spikes.length;++i){
                      var input_img_li = document.createElement("li");
                      input_img_li.style.listStyle = "none";
                      input_img_li.id = "input_img_li_"+i;
                      input_img_li.style.width = "53px";
                      input_img_li.style.height = "100%";
                      input_img_li.style.display = "inline-block";
                      input_img_li.style.marginRight = "10px";
                      var input_img_tag = document.createElement("img");
                      input_img_tag.src = test_img_uris[i];
                      input_img_tag.id = "input_sample_img_"+i;
                      input_img_tag.style.width = "50px";
                      input_img_tag.style.height = "50px";
                      input_img_tag.style.opacity = "0.5";
                      input_img_tag.onclick = ()=>{
                        console.log("input spike display img idx "+i);
                        if(prev_clicked_input_li !== undefined){
                          document.getElementById(prev_clicked_input_li).style.backgroundColor ="";
                        }
                        document.getElementById("input_img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_input_li = "input_img_li_"+i;
                        console.log("Current cls_names="+infos.spikes.snn_input_spikes[i].cls_names);
                        console.log("Current spike data="+infos.spikes.snn_input_spikes[i].spike_tuples);
                        display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                      };
                      input_img_li.appendChild(input_img_tag);
                      document.getElementById("input_spike_sample_imgs_ul").appendChild(input_img_li);
                      // var layer_li = document.createElement("li");
                      // layer_li.style.listStyle="circle";
                      // layer_li.id = "input_layer_li_"+i;
                      // document.getElementById("layer_indexs").appendChild(layer_li);
                      // layer_li.onclick = ()=>{
                      //   console.log("Input layer "+i+" is clicked");
                      //   // display input spike
                      //   display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                      // };
                    }
  
                    // mark reds
                    for(let i=0;i<need_red_img_li.length;++i){
                      if(prev_clicked_li === need_red_img_li[i]){
                        document.getElementById(need_red_img_li[i]).style.backgroundColor = "yellow";  
                      }else{
                        document.getElementById(need_red_img_li[i]).style.backgroundColor = "red";
                      }
                    }
  
                    
                    // 神经元放电图
                    let tms = infos.record_layer_v.tms;
                    let v_vals = infos.record_layer_v.vals;
                    let data_series_input = new Array();
                    let data_series_output = new Array();
  
                    data_series_input.push({
                      "data": v_vals[0],
                      "type":"line",
                      "smooth":true,
                      "name":"脉冲激发次数最少的神经元膜电压"
                    });
                    data_series_input.push({
                      "data":v_vals[1],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电压"
                    });
  
                    data_series_output.push({
                      "data": v_vals[2],
                      "type": "line",
                      "smooth":true,
                      "name": "脉冲激发次数最少的神经元膜电压"
                    });
  
                    data_series_output.push({
                      "data": v_vals[3],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电压"
                    });
  
                    display_neuron_v_linechart(tms[0], data_series_input);
  
                    $("#select_which_layer").change(()=>{
                      let select_layer_val = $("#select_which_layer").val();
                      if(select_layer_val === "输入层"){
                        display_neuron_v_linechart(tms[0], data_series_input);
                        console.log("显示输入层：tms[0]="+tms[0]);
                        console.log("显示输入层：data_series="+data_series_input);
                      }else{
                        display_neuron_v_linechart(tms[0], data_series_output);
                        console.log("显示输出层：tms[0]="+tms[0]);
                        console.log("显示输出层：data_series="+JSON.stringify(data_series_output));
                      }
                    });
  
                    // fill tables
                    $("#simulate_vthresh").text(infos.extra_simu_info.simulate_vthresh);
                    $("#simulate_neuron_dt").text(infos.extra_simu_info.simulate_neuron_dt);
                    $("#simulate_synapse_dt").text(infos.extra_simu_info.simulate_synapse_dt);
                    $("#simulate_delay").text(infos.extra_simu_info.simulate_delay);
                    $("#simulate_dura").text(infos.extra_simu_info.simulate_dura);
                    $("#simulate_acc").text(infos.extra_simu_info.simulate_acc);
  
  
                    // fill layers spike info table
                    // $("#snn_layers_spike_table")
                    for(let j=0;j<infos.record_spike_out_info.spike_count_avgs.length;++j){
                      let table_line = document.createElement("tr");
                      table_line.style.height = "25px";
                      table_line.style.border = "solid 2px #D6D6D6";
                      table_line.style.color = "#333";
  
                      let td_id = document.createElement("td");
                      td_id.style.fontSize = "medium";
                      td_id.style.paddingLeft= "15px";
                      td_id.style.border = "solid 2px #D6D6D6";
                      td_id.innerText = "layer_"+j;
                      table_line.appendChild(td_id);
  
                      let td_spike_avg = document.createElement("td");
                      td_spike_avg.style.fontSize = "medium";
                      td_spike_avg.style.paddingLeft = "15px";
                      td_spike_avg.style.order = "solid 2px #D6D6D6";
                      td_spike_avg.innerText = infos.record_spike_out_info.spike_count_avgs[j];
                      table_line.appendChild(td_spike_avg);
  
                      let td_spike_std = document.createElement("td");
                      td_spike_std.style.fontSize = "medium";
                      td_spike_std.style.paddingLeft = "15px";
                      td_spike_std.style.border = "solid 2px #D6D6D6";
                      td_spike_std.innerText = infos.record_spike_out_info.spike_count_stds[j];
                      table_line.appendChild(td_spike_std);
  
                      document.getElementById("snn_layers_spike_table").appendChild(table_line);
                    }
                }
            });
        });
  
        function multiple_argmax(lst){
          tmp_lst = new Array();
          for(let i=0;i<lst.length;++i){
            tmp_lst.push(parseInt(lst[i]));
          }
          tmp_lst.sort((a,b)=>{return a-b;}).reverse()
          console.log("check with multiple_argmax, lst="+tmp_lst);
          console.log("---after sort [0]="+tmp_lst[0]+" [1]="+tmp_lst[1]);
          if(tmp_lst[0] === tmp_lst[1]){
            return true;
          }else{
            return false;
          }
        }
  
  
        function my_argmax(lst){
          let max_val=0, max_idx=0;
          for(let i=0;i<lst.length;++i){
            if(lst[i] > max_val){
              max_val = lst[i];
              max_idx = i;
            }
          }
          return max_idx;
        }
  
        function calc_need_red(test_img_spikes, test_img_uris){
          // label_span.innerText = "标签: "+test_img_uris[i].split("/")[5].split("_")[4].split(".")[0];
          for(let i=0;i<test_img_spikes.length;++i){
            console.log("test_img_spikes i="+i+"  spike tuples="+test_img_spikes[i].spike_tuples);
            let cls_idx = 0;
            if(test_img_spikes[i].spike_tuples.length > 0){
              cls_idx = test_img_spikes[i].spike_tuples[0][0];
            }
            let curr_count=1;
            let spike_counts = new Array();
            for(let j=0;j<test_img_spikes[i].cls_names.length;++j){
                spike_counts.push(0);
            }
            for(let j=1;j<test_img_spikes[i].spike_tuples.length;++j){
                if(cls_idx === test_img_spikes[i].spike_tuples[j][0]){
                    curr_count = curr_count+1;
                }else{
                    spike_counts[cls_idx] = curr_count;
                    curr_count=1;
                    cls_idx = test_img_spikes[i].spike_tuples[j][0];
                }
            }
            if(spike_counts.length > 0){
              spike_counts[cls_idx] = curr_count;
            }
            console.log("current check img:"+i+", spike_counts="+spike_counts);
            if(parseInt(test_img_uris[i].split("/")[5].split("_")[4].split(".")[0]) !== my_argmax(spike_counts)){
              need_red_img_li.push("img_li_"+i);
            }else if(multiple_argmax(spike_counts)){
              console.log("--after check multiple armax, true");
              need_red_img_li.push("img_li_"+i);
              console.log("img: "+i+" need mark.");
            }else{
              console.log("img " +  i+ " ok");
            }
          }
        }
  
        function display_spike_scatter_chart(labels, datas){
            var opt={
                  tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                          type: 'cross',
                          crossStyle: {
                              color: '#999'
                          }
                      }
                  },
                  xAxis: {
                      type:'category',
                      data: labels,
                      name: "类别",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel:{
                        textStyle:{
                            color:"black"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"black"
                          }
                      }
                  },
                  series: [{
                      symbolSize: 5,
                      data: datas,
                      type: 'scatter'
                  }]
              };
              var spike_chart = echarts.init(document.getElementById("spike_charts"));
              spike_chart.setOption(opt);
        }
  
  
  
        function display_input_spikes_scatter_chart(labels, datas){
            var opt={
                  tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                          type: 'cross',
                          crossStyle: {
                              color: '#999'
                          }
                      }
                  },
                  xAxis: {
                      type:'category',
                      data: labels,
                      name: "ID",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel:{
                        textStyle:{
                            color:"black"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"black"
                          }
                      }
                  },
                  series: [{
                      symbolSize: 5,
                      data: datas,
                      type: 'scatter'
                  }]
              };
              var spike_chart = echarts.init(document.getElementById("input_spike_charts"));
              spike_chart.setOption(opt);
        }
  
        function display_neuron_v_linechart(labels, series_vals){
            let option = {
                tooltip:{
                  trigger:"axis"
                },
                legend:{
                  data:["脉冲激发次数最少的神经元膜电压", "脉冲激发次数最多的神经元膜电压"],
                  textStyle:{
                    color:"black"
                  }
                },
                grid:{
                  right:100
                },
                xAxis: {
                    type: 'category',
                    data: labels,
                    scale:true,
                    name:"时间",
                    nameGap:40,
                    nameTextStyle:{
                      color:"black"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"black"
                      }
                    }
                },
                yAxis: [
                  {
                      type: 'value',
                      scale:true,
                      name:"膜电压(左)",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"black"
                        }
                      }
                  },
                  {
                    type: 'value',
                      scale:true,
                      name:"膜电压(右)",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"black"
                        }
                      } 
                  }
                ],
                series: series_vals
            };
  
            var v_val_chart = echarts.init(document.getElementById("neurons_v_chart"));
            v_val_chart.setOption(option);
        }
  </script>
  
  </html>
  `;
}
exports.getSNNSimuPage = getSNNSimuPage;
function getSNNModelPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>SNN模型</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
      <div style="height: 400px;">
          <!-- SNN神经元信息 -->
          <div style="display: inline-block;background: rgba(238,238,238,0.4); height: 350px;width: 450px;">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">脉冲神经网络神经元组信息</font></div>
              <table id="snn_neurons_table" style="margin-left:10px;margin-left: 20px;border: solid 3px #D6D6D6;width: 400px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE">layer编号</td>
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE">神经元个数</td>
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE">求解方法</td>
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE">电压阈值</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
  
          <div style="display: inline-block;background: rgba(238,238,238,0.4);height: 350px;width: 450px;">
            <div style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">层连接权重统计</font></div>
            <table id="snn_layer_wt_table" style="border: solid 3px #D6D6D6;width: 400px;margin-left: 20px;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <thead>
                <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                  <td style="font-size: medium;font-weight: bold;width: 80px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE">layer编号</td>
                  <td style="font-size: medium;font-weight: bold;width: 80px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE"">权重均值</td>
                  <td style="font-size: medium;font-weight: bold;width: 80px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE"">权重方差</td>
                </tr>
              </thead>
            </table>
          </div>
  
          <div style="height: 350px;margin-top: 20px;display: inline-block;background: rgba(238,238,238,0.4);width: 450px;">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">脉冲神经网络突触连接信息</font></div>
              <table id="layer_conns_table" style="margin-left:20px;border: solid 3px #D6D6D6;width: 400px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE"">layer编号</td>
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE"">连接稠密度</td>
                      <td style="font-size: medium;font-weight: bold;width: 100px;padding-left: 10px;border: solid 2px #D6D6D6;background: #EEEEEE"">平均连接个数</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
      </div>
      <div style="height: 450px;margin-top: -25px;">
          <!--权重分布图-->
          <div style="height: 440px;width: 670px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">脉冲神经网络权重分布</font></div>
              <div id="weight_dist_chart" style="width: 580px;height: 320px;margin-left: 40px;margin-top: 10px;"></div>
          </div>
          <div style="height: 440px;width: 670px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div style="font-size: large;font-weight: bold;text-align: center;"><font style="color: #333;font-weight: bold;">模型连接图</font></div>
              <div id="sangky_chart" style="width: 560px;height: 400px;display: inline-block;margin-left: 20px;"></div>
          </div>
      </div>
  </body>
  <style>
  
  .titlebar {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  
  .titlebar-button {
    -webkit-app-region: no-drag;
  }
  
  body {
    padding: 25px;
    background-color: rgb(251, 255, 255);
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(249, 251, 252);
    color: white;
  }
  
  
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
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts-en.min.js"></script>
  
  <script>
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
              console.log("SNN 模型可视化接收到extension 消息");
                const data = JSON.parse(evt.data);
                if(data.snn_info){
                    var infos =JSON.parse(data.snn_info);
                    // 构建neurons info 表格
                    var neurons_info = infos.neurons_info;
                    var neurons_table = document.getElementById("snn_neurons_table");
                    for(var i=0;i<neurons_info.length;++i){
                        var line = document.createElement("tr");
                        line.style = "margin-top: 15px;border: solid 3px #D6D6D6;color: #333;"
                        var col_1 = document.createElement("td");
                        col_1.style = "font-size: medium; padding-left:20px;";
                        col_1.innerText = neurons_info[i].idx;
  
                        var col_2 = document.createElement("td");
                        col_2.style = "font-size: medium;border: solid 3px #D6D6D6;padding-left:10px;";
                        col_2.innerText = neurons_info[i].neuron_count;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "font-size: medium;border: solid 3px #D6D6D6;padding-left:10px;";
                        col_3.innerText = neurons_info[i].method;
  
                        var col_4 = document.createElement("td");
                        col_4.style = "font-size: medium; border: solid 3px #D6D6D6;padding-left:10px;";
                        col_4.innerText = neurons_info[i].vthresh;
  
                        line.appendChild(col_1);
                        line.appendChild(col_2);
                        line.appendChild(col_3);
                        line.appendChild(col_4);
  
                        neurons_table.appendChild(line);
                    }
                    // 构建突触表格
                    var synaps_info = infos.layer_conns;
                    var synaps_table = document.getElementById("layer_conns_table");
                    for(var i=0;i<synaps_info.length;++i){
                        var line = document.createElement("tr");
                        line.style = "margin-top: 15px; border: solid 3px #D6D6D6; color:#333;";
                        var col_1 = document.createElement("td");
                        col_1.style = "font-size: medium; padding-left:20px;border: solid 3px #D6D6D6;";
                        col_1.innerText = synaps_info[i].idx;
  
                        var col_2 = document.createElement("td");
                        col_2.style = "font-size: medium; border: solid 3px #D6D6D6;padding-left:10px;";
                        col_2.innerText = synaps_info[i].ratio;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "font-size: medium; border: solid 3px #D6D6D6;padding-left:10px;";
                        col_3.innerText = synaps_info[i].avg_conn;
  
                        line.appendChild(col_1);
                        line.appendChild(col_2);
                        line.appendChild(col_3);
                        synaps_table.appendChild(line);
                    }
  
                    // 绘制权重分布图
                    for(var i=0;i<infos.layers_weights.wt_count.length;++i){
                        infos.layers_weights.wt_count[i] = Math.log10(infos.layers_weights.wt_count[i]);
                    }
                    console.log("权重数据："+infos.layers_weights.wt_label);
                    console.log("数值:"+infos.layers_weights.wt_count)
                    display_weight_chart(infos.layers_weights.wt_label, infos.layers_weights.wt_count);
  
                    // 仿真配置与结果表格
                    $("#simulate_vthresh").text(infos.extra_simu_info.simulate_vthresh);
                    $("#simulate_neuron_dt").text(infos.extra_simu_info.simulate_neuron_dt);
                    $("#simulate_synapse_dt").text(infos.extra_simu_info.simulate_synapse_dt);
                    $("#simulate_delay").text(infos.extra_simu_info.simulate_delay);
                    $("#simulate_dura").text(infos.extra_simu_info.simulate_dura);
                    $("#simulate_acc").text(infos.extra_simu_info.simulate_acc);
  
  
                    // 添加SNN各层权重信息
                    for(let i=0;i<infos.record_layers_wt_info.record_wts_avg.length;++i){
                      let table_line = document.createElement("tr");
                      table_line.style.marginTop = "15px";
                      table_line.style.border = "solid 3px #D6D6D6";
                      table_line.style.color = "#333";
  
                      let td_id = document.createElement("td");
                      td_id.style.fontSize = "medium";
                      td_id.style.width = "120px";
                      td_id.style.paddingLeft = "10px";
                      td_id.style.border = "solid 3px #D6D6D6";
                      td_id.innerText = "layer_"+i;
                      table_line.appendChild(td_id);
  
                      let td_avg = document.createElement("td");
                      td_avg.style.fontSize = "medium";
                      td_avg.style.width = "120px";
                      td_avg.style.paddingLeft = "10px";
                      td_avg.style.border = "solid 3px #D6D6D6";
                      td_avg.innerText = infos.record_layers_wt_info.record_wts_avg[i];
                      table_line.appendChild(td_avg);
  
                      let td_std = document.createElement("td");
                      td_std.style.fontSize = "medium";
                      td_std.style.width = "120px";
                      td_std.style.paddingLeft = "10px";
                      td_std.style.border = "solid 3px #D6D6D6";
                      td_std.innerText = infos.record_layers_wt_info.record_wts_std[i];
                      table_line.appendChild(td_std);
  
                      document.getElementById("snn_layer_wt_table").appendChild(table_line);
  
                    }
  
              //       <table id="snn_layer_wt_table" style="width: 320px;">
              // <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              // <thead>
              //   <tr style="margin-top: 15px;border: solid 3px;">
              //     <td style="font-size: medium;font-weight: bold;width: 120px;padding-left: 10px;">layer编号</td>
              //     <td style="font-size: medium;font-weight: bold;width: 120px;">权重均值</td>
              //     <td style="font-size: medium;font-weight: bold;width: 120px;">权重方差</td>
              //   </tr>
              // </thead>
  
      //         "record_layers_wt_info":{
      //     "record_wts_avg":record_layers_wt_avg,
      //     "record_wts_std":record_layers_wt_std
      // }
  
                    // SNN模型简图
                    let sanky_data=new Array();
                    let sanky_links=new Array();
                    for(let i=0;i<infos.layer_conns.length+1;++i){
                        sanky_data.push({"name": "layer_"+i});
                    }
                    for(let i=0;i<infos.layer_conns.length;++i){
                        sanky_links.push({"source":"layer_"+i, "target":"layer_"+(i+1), "value": infos.layer_conns[i].ratio, "lineStyle":{"color": "#c23531"}});
                    }
                  //   console.log("Display sanky graph, sanky_data="+sanky_data[0]['name']);
                    // console.log("Display sanky links, ="+sanky_links['0']['value']);
                    // display_snn_model_sanky(sanky_data, sanky_links);
                }else if(data.snn_map){
                  console.log("显示SNN 结构图.....");
                  net_structure_show("sangky_chart", data.snn_map);
                }
            });
        });
  
        function display_weight_chart(label_names, label_counts){
            var opt = {
                  tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                          type: 'cross',
                          crossStyle: {
                              color: '#999'
                          }
                      }
                  },
                  xAxis: {
                      type: 'category',
                      data: label_names,
                      name:"权重",
                      nameTextStyle:{
                        color:"black"
                      },
                      axisLabel:{
                        textStyle:{
                            color:"black"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      name:"连接个数(log_10)",
                      nameTextStyle:{
                        color:"black"
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"black"
                          }
                      }
                  },
                  series: [{
                      data: label_counts,
                      type: 'bar'
                  }]
              };
              var weights_chart = echarts.init(document.getElementById("weight_dist_chart"));
              weights_chart.setOption(opt);
        }
  
        function display_snn_model_sanky(chart_data, chart_links){
            let option={
              series: {
                      type: 'sankey',
                      layout: 'none',
                      emphasis: {
                          focus: 'adjacency'
                      },
                      data: chart_data,
                      links: chart_links
                  }
            };
  
            var sanky_chart_ = echarts.init(document.getElementById("sangky_chart"));
            sanky_chart_.setOption(option);
        }
  
        function net_structure_show(elementId, map_file_url) {
                  // 基于准备好的dom，初始化echarts实例
                  var myChart = echarts.init(document.getElementById(elementId)); //初始化
                  console.log("SNN 结构 div 显示 loading...");
                  myChart.showLoading();
                  $.get(map_file_url, function (map_file) {
                      var node_data = map_file.data;
                      var node_link = map_file.links;
                      var node_class = map_file.layers;
                      var ratios = map_file.ratio;
                      var num = map_file.nums;
                      console.log("加载完毕map json 数据....");
                      console.log("ratios = "+ratios);
                      var categories = [];
                      for (var i = 0; i < node_class.length; i++) {
                          categories[i] = {
                              name: node_class[i],
                          };
                      }
                      console.log("categories finished...");
                      // 指定图表的配置项和数据
                      let option = {
                          title: {
                              show: true,
                              // text: 'Network Structure Diagram',
                              text: 'ratio     1 : ' + ratios,
                              textStyle:{
                                  fontSize:10,
                                  color:"black"
                              },
                              bottom: '3%',
                              left: 'center'
                          },
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
                                  },
                                  color:"black"
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
  
                      console.log("option init finished....");
                      // 使用刚指定的配置项和数据显示图表。
                      myChart.hideLoading();
                      myChart.setOption(option); //使用json
                  });
              }
  </script>
  
  </html>
  
  `;
}
exports.getSNNModelPage = getSNNModelPage;


/***/ }),
/* 54 */
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })()
;
//# sourceMappingURL=extension.js.map