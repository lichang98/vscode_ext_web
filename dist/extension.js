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
const get_convertor_page_v2_1 = __webpack_require__(52);
const get_seg_pages_1 = __webpack_require__(53);
const get_speech_pages_1 = __webpack_require__(54);
const child_process_1 = __webpack_require__(55);
const decode = __webpack_require__(56);
let PYTHON_INTERPRETER = 'python ';
let NEWLINE = '\r\n';
if (process.platform === 'linux') {
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
function activate(context) {
    // 实现树视图的初始化
    let treeview = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("treeView-item");
    let treeviewConvertor = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_convertor");
    let treeViewSimulator = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_simulator");
    let treeViewConvertDarLang = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_darwinLang_convertor");
    let treeViewSNNModelView = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_snn_model_view");
    let treeviewHome = vscode.window.createTreeView("treeView-item", { treeDataProvider: treeview });
    let treeViewCvtor = vscode.window.createTreeView("item_convertor", { treeDataProvider: treeviewConvertor });
    let treeViewSim = vscode.window.createTreeView("item_simulator", { treeDataProvider: treeViewSimulator });
    let treeViewCvtDarLang = vscode.window.createTreeView("item_darwinLang_convertor", { treeDataProvider: treeViewConvertDarLang });
    let treeViewSNNMD = vscode.window.createTreeView("item_snn_model_view", { treeDataProvider: treeViewSNNModelView });
    let currPanelDisposed = false;
    function isAllOtherTreeViewInvisible() {
        return !treeviewHome.visible && !treeViewCvtor.visible && !treeViewSim.visible && !treeViewCvtDarLang.visible
            && !treeViewSNNMD.visible;
    }
    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target"))) {
        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target"));
    }
    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out"))) {
        fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out"));
        if (!fs.existsSync(path.join(__dirname, "darwin2sim", "model_out", "br2_models"))) {
            fs.mkdirSync(path.join(__dirname, "darwin2sim", "model_out", "br2_models"));
        }
    }
    treeViewCvtor.onDidChangeVisibility((evt) => {
        if (evt.visible) {
            console.log("activity bar 转换图标被点击, treeview convertor 可见...");
            if (currentPanel && currentPanel.title === "模型转换") {
                currentPanel.webview.postMessage(JSON.stringify({ "ann_model_start_convert": "yes" }));
                treeviewHome.reveal(treeview.data[0]);
            }
        }
        else {
            setTimeout(() => {
                if (isAllOtherTreeViewInvisible()) {
                    if (currentPanel && currentPanel.title === "模型转换") {
                        currentPanel.webview.postMessage(JSON.stringify({ "ann_model_start_convert": "yes" }));
                        treeviewHome.reveal(treeview.data[0]);
                    }
                }
                treeviewHome.reveal(treeview.data[0]);
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
                if (isAllOtherTreeViewInvisible()) {
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
                if (isAllOtherTreeViewInvisible()) {
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
            vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
        }
        else {
            setTimeout(() => {
                if (isAllOtherTreeViewInvisible()) {
                    treeviewHome.reveal(treeview.data[0]);
                    //启动转换生成darwinlang
                    vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
                }
            }, 100);
        }
    });
    let inMemTreeViewStruct = new Array();
    // treeViewBinConvertDarLang.data = inMemTreeViewStruct;
    let X_NORM_DATA_PATH = undefined;
    let X_COLOR_DATA_PATH = undefined; // rgb colored image data, for semantic segmentation task
    let X_ORIGIN_COLOR_DATA_PATH = undefined; // rgb origin un-segmented image or original audio seq for speech classification
    let X_TEST_DATA_PATH = undefined;
    let Y_TEST_DATA_PATH = undefined;
    let ANN_MODEL_FILE_PATH = undefined;
    let DARWIN_LANG_FILE_PATHS = new Array();
    let DARWIN_LANG_BIN_PATHS = new Array();
    let panelDataVis = undefined;
    let panelAnnModelVis = undefined;
    let panelSNNModelVis = undefined;
    let panelSNNVisWeb = undefined;
    let PROJ_DESC_INFO = {
        "project_name": "",
        "project_type": "",
        "python_type": "",
        "ann_lib_type": ""
    };
    let PROJ_SAVE_PATH = undefined;
    // 删除treeview item
    function rmTreeViewFileItemByLabelName(root, targetLabelName) {
        if (root === undefined || root.children === undefined || root.children.length === 0) {
            return;
        }
        for (let i = 0; i < root.children.length; ++i) {
            if (root.children[i].label === targetLabelName) {
                root.children.splice(i, 1);
                return;
            }
            else {
                rmTreeViewFileItemByLabelName(root.children[i], targetLabelName);
            }
        }
    }
    context.subscriptions.push(vscode.commands.registerCommand("treeView-item.rm-item", (item) => {
        console.log("当前删除的treeview item 标签名称：" + item.label);
        rmTreeViewFileItemByLabelName(inMemTreeViewStruct[0], item.label);
        treeview.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("treeView.edit_file", (treeItem) => {
        // 编辑darwinlang
        let fileTarget = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out", treeItem.label));
        vscode.workspace.openTextDocument(fileTarget).then((doc) => {
            vscode.window.showTextDocument(doc, 1, false);
        }, (err) => {
            console.log(err);
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
        // vscode.window.showInformationMessage(label);
        console.log("label is :[" + label + "]");
        if (label.search("snn_digit_darlang") !== -1) {
            // 执行 darwinlang map 生成脚本
            let tmpDarlangWebview = vscode.window.createWebviewPanel("darwin lang", label, vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            tmpDarlangWebview.webview.html = darlangWebContent();
            tmpDarlangWebview.title = label;
            let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out", "snn_digit_darlang.json");
            let commandStr = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
            child_process_1.exec(commandStr, (err, stdout, stderr) => {
                tmpDarlangWebview.reveal();
                if (err) {
                    console.log("执行 load_grph.py 错误：" + err);
                }
                else {
                    let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
                    let fileSrc = tmpDarlangWebview.webview.asWebviewUri(mapFileDisk).toString();
                    tmpDarlangWebview.webview.postMessage({ resultUri: fileSrc });
                }
            });
        }
        else if (label.search("txt") !== -1) {
            // 显示二进制的darlang文件
            console.log("显示二进制的darwinLang");
            let fileTarget = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out", label));
            vscode.workspace.openTextDocument(fileTarget).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false).then(ed => {
                    ed.edit(edit => {
                    });
                });
            }, (err) => {
                console.log(err);
            });
        }
        else if (label.search("config.b") !== -1) {
            console.log("解析显示1_1config.b 文件内容");
            let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out", "1_1config.txt");
            fs.copyFileSync(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out", "1_1config.txt"), path.join(path.dirname(PROJ_SAVE_PATH), path.basename(PROJ_SAVE_PATH).replace("\.dar2", "") + "_config.b"));
            targetFilePath = path.join(path.dirname(PROJ_SAVE_PATH), path.basename(PROJ_SAVE_PATH).replace("\.dar2", "") + "_config.b");
            console.log("显示config.b文件内容，文件路径：" + targetFilePath);
            vscode.workspace.openTextDocument(targetFilePath).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false);
            });
        }
        else if (label.search(".pickle") !== -1 && label.search("layer") === -1) {
            // 显示pickle 文件的原始内容
            console.log("解析并显示pickle 文件内容");
            // let file_target:vscode.Uri = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", "inputs",label));
            let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out", "inputs", label);
            var modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
            var commandStr = PYTHON_INTERPRETER + modelVisScriptPath + " " + targetFilePath;
            child_process_1.exec(commandStr, function (err, stdout, stderr) {
                console.log("pickle 文件解析结束");
                let fileTarget = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
                vscode.workspace.openTextDocument(fileTarget).then((doc) => {
                    vscode.window.showTextDocument(doc, 1, false);
                });
                vscode.workspace.onDidCloseTextDocument(evt => {
                    console.log(evt.fileName + " [is closed");
                    let targetFile = evt.fileName;
                    targetFile = targetFile.replace("\.git", "");
                    fs.unlink(targetFile, () => { });
                });
            });
        }
        else if (label.search("layer") !== -1) {
            // 显示layer之间连接pickle文件的原始内容
            console.log("显示layer 连接pickle文件");
            let targetFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out", label);
            let modelVisScriptPath = path.join(__dirname, "inner_scripts", "parse_pickle.py");
            let commandStr = PYTHON_INTERPRETER + modelVisScriptPath + " " + targetFilePath;
            child_process_1.exec(commandStr, function (err, stdout, stderr) {
                console.log("layer 连接pickle 文件 " + label + " 解析结束");
                let fileTarget = vscode.Uri.file(path.join(__dirname, "inner_scripts", label));
                vscode.workspace.openTextDocument(fileTarget).then((doc) => {
                    vscode.window.showTextDocument(doc, 1, false);
                });
            });
        }
        else if (label === "数据") {
            // 数据可视化
            console.log("单击可视化,数据");
            // vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![0]);
            vscode.commands.executeCommand("treeView-item.datavis", inMemTreeViewStruct[0].children[0].children[2]);
        }
        else if (label === "ANN模型") {
            // ANN模型可视化
            console.log("单击可视化，ANN模型");
            // vscode.commands.executeCommand<TreeItemNode>("treeView-item.datavis", inMemTreeViewStruct[0].children![1]);
            vscode.commands.executeCommand("treeView-item.datavis", inMemTreeViewStruct[0].children[0].children[0]);
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
    let currentPanelInterval = undefined;
    let isCurrentPanelClosedByRemoveProj = false;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
        // 启动后台资源server
        let scriptPath = path.join(__dirname, "inner_scripts", "img_server.py");
        let commandStr = PYTHON_INTERPRETER + scriptPath;
        console.log("prepare to start img server.");
        child_process_1.exec(commandStr, function (err, stdout, stderr) {
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
            bindCurrentPanelReceiveMsg(currentPanel);
        }
        currentPanelInterval = setInterval(() => {
            if (currPanelDisposed) {
                currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
                // 主界面由electron 应用启动
                currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
                currentPanel.title = "模型转换器";
                bindCurrentPanelReceiveMsg(currentPanel);
                currPanelDisposed = false;
                isCurrentPanelClosedByRemoveProj = false;
            }
        }, 500);
    });
    // currentPanel webView 面板 onDidReceiveMessage 事件绑定
    function bindCurrentPanelReceiveMsg(currentPanel) {
        currentPanel.onDidDispose(e => {
            if (!isCurrentPanelClosedByRemoveProj) {
                vscode.window.showWarningMessage("该tab页不可关闭！！！");
            }
            currPanelDisposed = true;
        });
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
                        currentPanel.title = "模型转换器";
                    }
                }
            }
            else if (data.project_info) {
                // 接收到webview 项目创建向导的消息，创建新的项目
                console.log("receive project create info");
                console.log("project name: " + data.project_info.project_name + ", project type=" + data.project_info.project_type
                    + ", python_type: " + data.project_info.python_type + ", ann lib type:" + data.project_info.ann_lib_type);
                fs.open(PROJ_SAVE_PATH, 'w', 0o777, (err, fd) => {
                    if (err) {
                        console.log("创建项目文件错误：" + err);
                    }
                    console.log("创建新项目文件，路径：" + PROJ_SAVE_PATH);
                });
                PROJ_DESC_INFO.project_name = data.project_info.project_name;
                PROJ_DESC_INFO.project_type = data.project_info.project_type;
                PROJ_DESC_INFO.python_type = data.project_info.python_type;
                PROJ_DESC_INFO.ann_lib_type = data.project_info.ann_lib_type;
                TreeViewProvider_1.addSlfProj(data.project_info.project_name);
                inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(data.project_info.project_name, [new TreeViewProvider_1.TreeItemNode("模型转换", [
                        new TreeViewProvider_1.TreeItemNode("ANN模型", []),
                        new TreeViewProvider_1.TreeItemNode("SNN模型", [new TreeViewProvider_1.TreeItemNode("连接文件", [])]),
                        new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []), new TreeViewProvider_1.TreeItemNode("测试数据标签", [])])
                    ]), new TreeViewProvider_1.TreeItemNode("模拟器", []), new TreeViewProvider_1.TreeItemNode("编译映射", [new TreeViewProvider_1.TreeItemNode("Darwin二进制文件", [new TreeViewProvider_1.TreeItemNode("模型文件", []), new TreeViewProvider_1.TreeItemNode("编解码配置文件", [])])])], true, "root"));
                treeview.data = inMemTreeViewStruct;
                treeview.refresh();
                // inMemTreeViewStruct.push(new TreeItemNode(data.project_info.project_name, [new TreeItemNode("数据", 
                // 		[new TreeItemNode("训练数据",[]), new TreeItemNode("测试数据",[]), 
                // 		new TreeItemNode("测试数据标签",[])]), new TreeItemNode("ANN模型",[])], true));
                // treeview.data = inMemTreeViewStruct;
                // treeview.refresh();
                // treeViewBinConvertDarLang.refresh();
            }
            else if (data.project_refac_info) {
                // 接收到webview 项目属性修改的信息
                console.log("receive project refactor info");
                PROJ_DESC_INFO.project_name = data.project_refac_info.project_name;
                PROJ_DESC_INFO.project_type = data.project_refac_info.project_type;
                PROJ_DESC_INFO.python_type = data.project_refac_info.python_type;
                PROJ_DESC_INFO.ann_lib_type = data.project_refac_info.ann_lib_type;
                let treeItemsSize = inMemTreeViewStruct.length;
                inMemTreeViewStruct[treeItemsSize - 1].label = PROJ_DESC_INFO.project_name;
                treeview.data = inMemTreeViewStruct;
                treeview.refresh();
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
                let webParamVthresh = data.model_convert_params.vthresh;
                let wevParamNeuronDt = data.model_convert_params.neuron_dt;
                let webParamSynapseDt = data.model_convert_params.synapse_dt;
                let webParamDelay = data.model_convert_params.delay;
                let webParamDura = data.model_convert_params.dura;
                console.log("Extension 接收到 webview的消息，启动脚本......");
                sleep(1000);
                let scriptPath = undefined;
                if (PROJ_DESC_INFO.project_type === '图像分类') {
                    scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py " + webParamVthresh + " " +
                        wevParamNeuronDt + " " + webParamSynapseDt + " " + webParamDelay + " " + webParamDura + " " + path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""));
                }
                else if (PROJ_DESC_INFO.project_type === "语义分割") {
                    scriptPath = path.join(__dirname, "darwin2sim", "seg_cls_scripts", "convert_with_stb.py " + webParamVthresh + " " +
                        wevParamNeuronDt + " " + webParamSynapseDt + " " + webParamDelay + " " + webParamDura + " " + path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""));
                }
                else if (PROJ_DESC_INFO.project_type === "语音识别") {
                    scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py " + webParamVthresh + " " +
                        wevParamNeuronDt + " " + webParamSynapseDt + " " + webParamDelay + " " + webParamDura + " " + path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")) + " 2";
                }
                else {
                    //TODO Other task type
                }
                let commandStr = PYTHON_INTERPRETER + scriptPath;
                currentPanel === null || currentPanel === void 0 ? void 0 : currentPanel.webview.postMessage(JSON.stringify({ "log_output": "模型转换程序启动中......" }));
                let scriptProcess = child_process_1.exec(commandStr, {});
                let logOutputPanel = vscode.window.createOutputChannel("Darwin Convertor");
                logOutputPanel.show();
                (_a = scriptProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                    logOutputPanel.append(data);
                    // console.log(data);
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
                        let formattedData = data.split(NEWLINE).join("<br/>");
                        currentPanel.webview.postMessage(JSON.stringify({ "log_output": formattedData }));
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
                        fs.readFile(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "log", "gui", "test", "normalization", "99.9.json"), "utf-8", (evt, data) => {
                            if (currentPanel) {
                                currentPanel.webview.postMessage(JSON.stringify({ "scale_factors": data }));
                            }
                        });
                        vscode.commands.executeCommand("item_darwinLang_convertor.start_convert");
                    }
                });
            }
            else if (data.select_save_proj_path_req) {
                // 选择项目的保存路径
                console.log("select path for saving project, proj name=" + data.select_save_proj_path_req);
                if (data.is_change_proj_name && PROJ_SAVE_PATH) {
                    console.log("Just changing proj name, no need to open dialog.");
                    PROJ_SAVE_PATH = path.join(path.dirname(PROJ_SAVE_PATH), data.select_save_proj_path_req + ".dar2");
                    if (currentPanel) {
                        console.log("项目名称修改，发送到webview，路径=" + PROJ_SAVE_PATH);
                        currentPanel.webview.postMessage(JSON.stringify({ "proj_select_path": PROJ_SAVE_PATH }));
                    }
                }
                else {
                    const options = {
                        canSelectFiles: false,
                        canSelectFolders: true,
                        openLabel: "选择目录",
                        title: "选择项目保存位置"
                    };
                    vscode.window.showOpenDialog(options).then(fileUri => {
                        if (fileUri) {
                            console.log("选择的项目保存路径为：" + fileUri[0].fsPath);
                            PROJ_SAVE_PATH = path.join(fileUri[0].fsPath, data.select_save_proj_path_req + ".dar2");
                            if (currentPanel) {
                                console.log("发送保存路径到webview..., 路径=" + PROJ_SAVE_PATH);
                                // fs.open(PROJ_SAVE_PATH, 'w', 0o777 , (err, fd)=>{
                                // 	if(err){
                                // 		console.log("创建项目文件错误："+err);
                                // 	}
                                // 	console.log("创建新项目文件，路径："+PROJ_SAVE_PATH);
                                // });
                                currentPanel.webview.postMessage(JSON.stringify({ "proj_select_path": PROJ_SAVE_PATH }));
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
        if (currentPanel) {
            currentPanel.webview.postMessage({ "command": "CreateNewProject" });
        }
    });
    context.subscriptions.push(disposable2);
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_rename", () => {
        if (!currentPanel || currentPanel.title.trim() === "模型转换") {
            vscode.window.showErrorMessage("当前项目属性不可修改!!!");
            return;
        }
        console.log("项目属性修改");
        currentPanel.reveal();
        // 发消息到webview
        if (currentPanel) {
            currentPanel.webview.postMessage({ "command": "ProjectRefactor", "project_desc": PROJ_DESC_INFO });
        }
    }));
    //项目保存
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_save", () => {
        const options = {
            saveLabel: "保存项目",
            filters: { "Darwin2 Project": ['dar2'] },
            defaultUri: vscode.Uri.file(PROJ_SAVE_PATH)
        };
        vscode.window.showSaveDialog(options).then(fileUri => {
            if (fileUri && fileUri) {
                console.log("selected path: " + fileUri.fsPath);
                // TODO 写入项目信息
                let data = {
                    "proj_info": PROJ_DESC_INFO,
                    "x_norm_path": X_NORM_DATA_PATH,
                    "x_test_path": X_TEST_DATA_PATH,
                    "y_test_path": Y_TEST_DATA_PATH,
                    "model_path": ANN_MODEL_FILE_PATH,
                    "darwinlang_file_paths": DARWIN_LANG_FILE_PATHS,
                    "darwinlang_bin_paths": DARWIN_LANG_BIN_PATHS
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
            if (fileUri) {
                console.log("opened project path = " + fileUri[0].fsPath);
                PROJ_SAVE_PATH = fileUri[0].fsPath;
                let data = fs.readFileSync(fileUri[0].fsPath);
                console.log("读取的信息：proj_info=" + data);
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
                console.log("导入工程的x_norm 文件路径为：" + X_NORM_DATA_PATH);
                if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")))) {
                    fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")));
                }
                let targetProjName = path.basename(PROJ_SAVE_PATH).replace("\.dar2", "");
                if (X_NORM_DATA_PATH) {
                    fs.copyFile(path.join(X_NORM_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "x_norm.npz"), function (err) {
                    });
                    fs.copyFile(path.join(X_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "colorX.npz"), function (err) {
                    });
                    fs.copyFile(path.join(X_ORIGIN_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "originColorX.npz"), function (err) {
                    });
                }
                if (X_TEST_DATA_PATH) {
                    fs.copyFile(path.join(X_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "x_test.npz"), function (err) {
                    });
                }
                if (Y_TEST_DATA_PATH) {
                    fs.copyFile(path.join(Y_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "y_test.npz"), function (err) {
                    });
                }
                if (ANN_MODEL_FILE_PATH) {
                    fs.copyFile(path.join(ANN_MODEL_FILE_PATH), path.join(__dirname, "darwin2sim", "target", targetProjName, "mnist_cnn.h5"), function (err) {
                    });
                }
                // 显示treeview
                TreeViewProvider_1.addSlfProj(PROJ_DESC_INFO.project_name);
                inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(PROJ_DESC_INFO.project_name, [new TreeViewProvider_1.TreeItemNode("模型转换", [
                        new TreeViewProvider_1.TreeItemNode("ANN模型", []),
                        new TreeViewProvider_1.TreeItemNode("SNN模型", [new TreeViewProvider_1.TreeItemNode("连接文件", [])]),
                        new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []), new TreeViewProvider_1.TreeItemNode("测试数据标签", [])])
                    ]), new TreeViewProvider_1.TreeItemNode("模拟器", []), new TreeViewProvider_1.TreeItemNode("编译映射", [new TreeViewProvider_1.TreeItemNode("Darwin二进制文件", [new TreeViewProvider_1.TreeItemNode("模型文件", []), new TreeViewProvider_1.TreeItemNode("编解码配置文件", [])])])], true, "root"));
                let xNormFileOriginName = path.basename(X_NORM_DATA_PATH), xTestFileOriginName = path.basename(X_TEST_DATA_PATH), yTestFileOriginName = path.basename(Y_TEST_DATA_PATH);
                // addSlfFile("x_norm");
                // addSlfFile("x_test");
                // addSlfFile("y_test");
                TreeViewProvider_1.addSlfFile(xNormFileOriginName);
                TreeViewProvider_1.addSlfFile(xTestFileOriginName);
                TreeViewProvider_1.addSlfFile(yTestFileOriginName);
                TreeViewProvider_1.addSlfFile(path.basename(projData.model_path));
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
                if (projData.x_norm_path) {
                    inMemTreeViewStruct[0].children[0].children[2].children[0].children.push(new TreeViewProvider_1.TreeItemNode(xNormFileOriginName, undefined, false, "rmable"));
                }
                if (projData.x_test_path) {
                    inMemTreeViewStruct[0].children[0].children[2].children[1].children.push(new TreeViewProvider_1.TreeItemNode(xTestFileOriginName, undefined, false, "rmable"));
                }
                if (projData.y_test_path) {
                    inMemTreeViewStruct[0].children[0].children[2].children[2].children.push(new TreeViewProvider_1.TreeItemNode(yTestFileOriginName, undefined, false, "rmable"));
                }
                // if(projData.x_norm_path && inMemTreeViewStruct[0].children && inMemTreeViewStruct[0].children[1]){
                // 	inMemTreeViewStruct[0].children[1].children?.push(new TreeItemNode("model_file_"+path.basename(projData.model_path)));
                // }
                inMemTreeViewStruct[0].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("model_file_" + path.basename(projData.model_path)));
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
                for (let i = 0; i < DARWIN_LANG_FILE_PATHS.length; ++i) {
                    let fname = path.basename(DARWIN_LANG_FILE_PATHS[i].toString());
                    TreeViewProvider_1.addSlfFile(fname);
                    if (fname.indexOf("json") !== -1) {
                        inMemTreeViewStruct[0].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode(fname));
                    }
                    else {
                        inMemTreeViewStruct[0].children[0].children[1].children[0].children.push(new TreeViewProvider_1.TreeItemNode(fname));
                    }
                }
                let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
                TreeViewProvider_1.addSlfFile(path.basename(simuInfoFile));
                inMemTreeViewStruct[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode(path.basename(simuInfoFile)));
                // ITEM_ICON_MAP.set("SNN二进制模型", "imgs/darwin_icon_model_new.png");
                TreeViewProvider_1.addDarwinFold("SNN二进制模型");
                // inMemTreeViewStruct[0].children?.push(new TreeItemNode("SNN二进制模型",[]));
                for (let i = 0; i < DARWIN_LANG_BIN_PATHS.length; ++i) {
                    if (path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("clear") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("enable") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("re_config") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("nodelist") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("linkout") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("layerWidth") >= 0 ||
                        path.basename(DARWIN_LANG_BIN_PATHS[i].toString()).indexOf("1_1config.txt") >= 0) {
                        continue;
                    }
                    if (DARWIN_LANG_BIN_PATHS[i].toString().search("config.b") !== -1) {
                        TreeViewProvider_1.addDarwinFiles("config.b");
                        inMemTreeViewStruct[0].children[2].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("config.b"));
                    }
                    else if (DARWIN_LANG_BIN_PATHS[i].toString().search("connfiles") !== -1) {
                        TreeViewProvider_1.addDarwinFiles("packed_bin_files.dat");
                        inMemTreeViewStruct[0].children[2].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("packed_bin_files.dat"));
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
    context.subscriptions.push(vscode.commands.registerCommand("treeView.proj_remove", (item) => {
        console.log("当前需要移除的项目名称为：" + item.label);
        for (var i = 0; i < inMemTreeViewStruct.length; ++i) {
            if (inMemTreeViewStruct[i].label === item.label) {
                inMemTreeViewStruct.splice(i, 1);
                break;
            }
        }
        treeview.data = inMemTreeViewStruct;
        treeview.refresh();
        if (currentPanel) {
            isCurrentPanelClosedByRemoveProj = true;
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
    let disposableVisCommand = vscode.commands.registerCommand("treeView-item.datavis", (itemNode) => {
        console.log("当前可视化目标:" + itemNode.label);
        if (currentPanel) {
            // 切换webview
            if (itemNode.label === "数据") {
                if (!panelDataVis) {
                    panelDataVis = vscode.window.createWebviewPanel("datavis", "数据集", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
                    panelDataVis.onDidDispose(function () {
                        panelDataVis = undefined;
                    }, null, context.subscriptions);
                    panelDataVis.webview.onDidReceiveMessage((e) => {
                        if (e.fetch_audio) {
                            console.log("接收到webview 请求audio! " + e.fetch_audio);
                            axios.default.get(e.fetch_audio, { responseType: "arraybuffer" }).then(res => {
                                decode(res.data).then((audioBuf) => {
                                    panelDataVis.webview.postMessage({ "audioBuf": audioBuf });
                                });
                            });
                        }
                    });
                }
                panelDataVis.reveal();
                // currentPanel.webview.html = getConvertorDataPageV2(
                if (PROJ_DESC_INFO.project_type === '图像分类') {
                    panelDataVis.webview.html = get_convertor_page_v2_1.getConvertorDataPageV2(panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample0.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample1.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample2.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample3.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample4.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample5.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample6.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample7.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample8.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "sample9.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample0.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample1.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample2.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample3.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample4.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample5.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample6.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample7.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample8.png"))), panelDataVis.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src", "resources", "script_res", "test_sample9.png"))));
                }
                else if (PROJ_DESC_INFO.project_type === '语义分割') {
                    panelDataVis.webview.html = get_seg_pages_1.getSegDataVisPage();
                }
                else if (PROJ_DESC_INFO.project_type === "语音识别") {
                    panelDataVis.webview.html = get_speech_pages_1.getSpeechClsDataPage();
                }
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
            if (panelDataVis && X_NORM_DATA_PATH) {
                panelDataVis.title = "数据集";
                // 数据可视化展示
                // 执行后台脚本
                let scriptPath = path.join(__dirname, "inner_scripts", "data_analyze.py");
                console.log("目标文件路径：" + X_NORM_DATA_PATH + ", " + X_TEST_DATA_PATH + ", " + Y_TEST_DATA_PATH);
                let commandStr = PYTHON_INTERPRETER + scriptPath + " " + X_NORM_DATA_PATH + " " + X_TEST_DATA_PATH + " " + Y_TEST_DATA_PATH;
                if (PROJ_DESC_INFO.project_type === '语义分割') {
                    // FIXME extra task type and num classes in semantic segmentation task
                    console.log("目标文件路径：" + X_NORM_DATA_PATH + ", " + X_ORIGIN_COLOR_DATA_PATH + ", " + Y_TEST_DATA_PATH);
                    commandStr = PYTHON_INTERPRETER + scriptPath + " " + X_NORM_DATA_PATH + " " + X_ORIGIN_COLOR_DATA_PATH + " " + Y_TEST_DATA_PATH;
                    commandStr += " 1 2";
                }
                else if (PROJ_DESC_INFO.project_type === "语音识别") {
                    // last param is npz file path contains original audio seq and sampling rates
                    console.log("语音识别路径：" + X_NORM_DATA_PATH + " " + X_TEST_DATA_PATH + " " + Y_TEST_DATA_PATH + " " + X_ORIGIN_COLOR_DATA_PATH);
                    commandStr = PYTHON_INTERPRETER + scriptPath + " " + X_NORM_DATA_PATH + " " + X_TEST_DATA_PATH + " " + Y_TEST_DATA_PATH + " 2 " + X_ORIGIN_COLOR_DATA_PATH;
                }
                child_process_1.exec(commandStr, function (err, stdout, stderr) {
                    if (err) {
                        console.log("execute data analyze script error, msg: " + err);
                    }
                    else {
                        console.log("execute data analyze script finish....");
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
            else if (!X_NORM_DATA_PATH) {
                vscode.window.showErrorMessage("请先导入数据！！！");
            }
        }
        else if (itemNode.label === "ANN模型") {
            if (panelAnnModelVis && ANN_MODEL_FILE_PATH) {
                panelAnnModelVis.title = "ANN模型";
                var modelVisScriptPath = path.join(__dirname, "inner_scripts", "model_desc.py");
                var commandExe = PYTHON_INTERPRETER + modelVisScriptPath + " " + X_NORM_DATA_PATH + " " + X_TEST_DATA_PATH + " " + Y_TEST_DATA_PATH + " " + ANN_MODEL_FILE_PATH;
                if (PROJ_DESC_INFO.project_type === '语义分割') {
                    // FIXME task type
                    commandExe += " 1";
                }
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
            else if (!ANN_MODEL_FILE_PATH) {
                vscode.window.showErrorMessage("请先导入ANN模型文件！！！");
            }
        }
    });
    context.subscriptions.push(disposableVisCommand);
    let disposableImportCommand = vscode.commands.registerCommand("treeView-item.import", (itemNode) => {
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
                    X_NORM_DATA_PATH = fileUri[0].fsPath;
                    X_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "colorX.npz");
                    X_ORIGIN_COLOR_DATA_PATH = path.join(path.dirname(X_NORM_DATA_PATH), "originColorX.npz");
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("x_norm","imgs/file.png");
                    // addSlfFile("x_norm");
                    let xNormFileOriginName = path.basename(X_NORM_DATA_PATH);
                    TreeViewProvider_1.addSlfFile(xNormFileOriginName);
                    if (inMemTreeViewStruct[0].children[0].children[2].children[0].children.length > 0) {
                        inMemTreeViewStruct[0].children[0].children[2].children[0].children.splice(0, 1);
                    }
                    inMemTreeViewStruct[0].children[0].children[2].children[0].children.push(new TreeViewProvider_1.TreeItemNode(xNormFileOriginName, undefined, false, 'rmable'));
                    // if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children){
                    // 	console.log("添加新的文件");
                    // 	treeview.data[0].children[0].children[0].children.push(new TreeItemNode(xNormFileOriginName, [], false, 'rmable'));
                    // 	treeview.refresh();
                    // }
                    treeview.data = inMemTreeViewStruct;
                    treeview.refresh();
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")));
                    }
                    if (X_NORM_DATA_PATH) {
                        fs.copyFile(path.join(X_NORM_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "x_norm.npz"), function (err) {
                            console.log("copy file x_norm.npz error: " + err);
                        });
                    }
                    if (X_COLOR_DATA_PATH) {
                        fs.copyFile(path.join(X_COLOR_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "colorX.npz"), function (err) {
                            console.log("copy file colorX.npz error: " + err);
                        });
                    }
                    if (X_ORIGIN_COLOR_DATA_PATH) {
                        fs.copyFile(X_ORIGIN_COLOR_DATA_PATH, path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "originColorX.npz"), function (err) {
                            console.log("copy file originColorX.npz error: " + err);
                        });
                    }
                    autoSaveWithCheck();
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
                    X_TEST_DATA_PATH = fileUri[0].fsPath;
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("x_test","imgs/file.png");
                    // addSlfFile("x_test");
                    let xTestFileOriginName = path.basename(X_TEST_DATA_PATH);
                    TreeViewProvider_1.addSlfFile(xTestFileOriginName);
                    if (inMemTreeViewStruct[0].children[0].children[2].children[1].children.length > 0) {
                        inMemTreeViewStruct[0].children[0].children[2].children[1].children.splice(0, 1);
                    }
                    inMemTreeViewStruct[0].children[0].children[2].children[1].children.push(new TreeViewProvider_1.TreeItemNode(xTestFileOriginName, undefined, false, 'rmable'));
                    treeview.data = inMemTreeViewStruct;
                    treeview.refresh();
                    // if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children){
                    // 	console.log("添加新的文件");
                    // 	treeview.data[0].children[0].children[1].children.push(new TreeItemNode(xTestFileOriginName, [], false, 'rmable'));
                    // 	treeview.refresh();
                    // }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")));
                    }
                    if (X_TEST_DATA_PATH) {
                        fs.copyFile(path.join(X_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "x_test.npz"), function (err) {
                        });
                    }
                }
            });
            autoSaveWithCheck();
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
                    Y_TEST_DATA_PATH = fileUri[0].fsPath;
                    // 添加到treeview下
                    // FIXME
                    // ITEM_ICON_MAP.set("y_test","imgs/file.png");
                    // addSlfFile("y_test");
                    let yTestFileOriginName = path.basename(Y_TEST_DATA_PATH);
                    TreeViewProvider_1.addSlfFile(yTestFileOriginName);
                    if (inMemTreeViewStruct[0].children[0].children[2].children[2].children.length > 0) {
                        inMemTreeViewStruct[0].children[0].children[2].children[2].children.splice(0, 1);
                    }
                    inMemTreeViewStruct[0].children[0].children[2].children[2].children.push(new TreeViewProvider_1.TreeItemNode(yTestFileOriginName, undefined, false, 'rmable'));
                    treeview.data = inMemTreeViewStruct;
                    treeview.refresh();
                    // if(treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children){
                    // 	console.log("添加新的文件");
                    // 	treeview.data[0].children[0].children[2].children.push(new TreeItemNode(yTestFileOriginName, [], false, 'rmable'));
                    // 	treeview.refresh();
                    // }
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")));
                    }
                    if (Y_TEST_DATA_PATH) {
                        fs.copyFile(path.join(Y_TEST_DATA_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "y_test.npz"), function (err) {
                        });
                    }
                }
            });
            autoSaveWithCheck();
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
                    ANN_MODEL_FILE_PATH = fileUri[0].fsPath;
                    // 添加到treeview下
                    // ITEM_ICON_MAP.set("model_file","imgs/file.png");
                    // ITEM_ICON_MAP.set(path.basename(model_file_path), "imgs/file.png");
                    TreeViewProvider_1.addSlfFile(path.basename(ANN_MODEL_FILE_PATH));
                    // if(treeview.data[0].children && treeview.data[0].children[1].children){
                    // 	treeview.data[0].children[1].children.push(new TreeItemNode("model_file_"+path.basename(ANN_MODEL_FILE_PATH)));
                    // 	treeview.refresh();
                    // }
                    if (inMemTreeViewStruct[0].children[0].children[0].children.length > 0) {
                        inMemTreeViewStruct[0].children[0].children[0].children.splice(0, 1);
                    }
                    inMemTreeViewStruct[0].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("model_file_" + path.basename(ANN_MODEL_FILE_PATH), undefined, false, 'rmable'));
                    treeview.data = inMemTreeViewStruct;
                    treeview.refresh();
                    // 拷贝文件到项目并重命名
                    if (!fs.existsSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")))) {
                        fs.mkdirSync(path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", "")));
                    }
                    if (ANN_MODEL_FILE_PATH) {
                        fs.copyFile(path.join(ANN_MODEL_FILE_PATH), path.join(__dirname, "darwin2sim", "target", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "mnist_cnn.h5"), function (err) {
                        });
                    }
                }
            });
            autoSaveWithCheck();
        }
    });
    context.subscriptions.push(disposableImportCommand);
    // 启动模型转换, 右键点击
    vscode.commands.registerCommand("item_convertor.start_convert", () => {
        if (currentPanel) {
            // 发送消息到web view ，开始模型的转换
            console.log("模型转换页面打开");
            // currentPanel.webview.postMessage(JSON.stringify({"ann_model_start_convert":"yes"}));
            console.log("title=" + currentPanel.title);
            if (currentPanel && currentPanel.title !== "模型转换") {
                console.log("PROJ_DESC_INFO=" + PROJ_DESC_INFO);
                if (PROJ_DESC_INFO.project_type === '图像分类') {
                    console.log("currentpanel=" + currentPanel);
                    currentPanel.webview.html = get_convertor_page_v2_1.getANNSNNConvertPage();
                }
                else if (PROJ_DESC_INFO.project_type === "语义分割") {
                    console.log("currentpanel  2=" + currentPanel);
                    currentPanel.webview.html = get_seg_pages_1.getANNSNNConvertSegPage();
                }
                else if (PROJ_DESC_INFO.project_type === "语音识别") {
                    console.log("语音识别模型转换界面");
                    currentPanel.webview.html = get_speech_pages_1.getANNSNNConvertSpeechPage();
                }
                currentPanel.reveal();
                currentPanel.title = "模型转换";
                console.log("显示currentpane  模型转换   1");
            }
            else if (currentPanel) {
                currentPanel.reveal();
            }
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
        panelSNNVisWeb.webview.html = get_convertor_page_v2_1.getSNNModelPage();
        panelSNNVisWeb.title = "SNN模型";
        panelSNNVisWeb.reveal();
        console.log("执行darwinlang map生成脚本...");
        if (DARWIN_LANG_FILE_PATHS.length === 0) {
            vscode.window.showErrorMessage("请先完成转换步骤！！！");
            return;
        }
        // 执行 darwinlang map 生成脚本
        let targetDarlangFilePath = path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out", "snn_digit_darlang.json");
        let commandStr = PYTHON_INTERPRETER + path.join(__dirname, "load_graph.py") + " " + targetDarlangFilePath + " " + path.join(__dirname);
        child_process_1.exec(commandStr, function (err, stdout, stderr) {
            if (err) {
                console.log("执行 load_graph.py 错误：" + err);
            }
            else {
                // 读取map 文件
                console.log("向SNN模型界面发送 snn_map 数据....");
                let mapFileDisk = vscode.Uri.file(path.join(__dirname, "map.json"));
                let fileSrc = panelSNNVisWeb.webview.asWebviewUri(mapFileDisk).toString();
                panelSNNVisWeb.webview.postMessage(JSON.stringify({ "snn_map": fileSrc })).then((fullfill) => {
                    console.log("snn_map 数据postmsg fullfill: " + fullfill);
                    let snnModelInfoData = fs.readFileSync(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"));
                    console.log("加载完毕snn 模型数据.....");
                    panelSNNVisWeb.webview.postMessage(JSON.stringify({ "snn_info": snnModelInfoData.toString() })).then((fullfill) => {
                        console.log("snn_info 数据postmsg fullfill: " + fullfill);
                    }, (reject) => {
                        console.log("snn_info 数据postmsg reject :" + reject);
                    });
                }, (reject) => {
                    console.log("snn_map 数据postmsg reject :" + reject);
                });
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
            panelSNNModelVis.webview.onDidReceiveMessage((evt) => {
                if (DARWIN_LANG_FILE_PATHS.length === 0) {
                    vscode.window.showErrorMessage("请先完成转换步骤！！！");
                    return;
                }
                let simuInfoFile = path.join(__dirname, "inner_scripts", "brian2_snn_info.json");
                TreeViewProvider_1.addSlfFile(path.basename(simuInfoFile));
                if (inMemTreeViewStruct[0].children[1].children.length > 0) {
                    inMemTreeViewStruct[0].children[1].children.splice(0, 1);
                }
                inMemTreeViewStruct[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode(path.basename(simuInfoFile)));
                treeview.data = inMemTreeViewStruct;
                treeview.refresh();
                console.log("extension 接收到 snn 仿真界面ready 消息.");
                let data = JSON.parse(evt);
                if (data.snn_simulate_ready) {
                    // 在完成转换（包含仿真）之后，加载显示SNN以及过程信息
                    console.log("SNN仿真界面就绪.....");
                    fs.readFile(path.join(__dirname, "inner_scripts", "brian2_snn_info.json"), "utf-8", (evt, data) => {
                        if (panelSNNModelVis) {
                            if (PROJ_DESC_INFO.project_type === "图像分类" || PROJ_DESC_INFO.project_type === "语义分割") {
                                console.log("SNN仿真界面发送 snn_info 数据....");
                                panelSNNModelVis.webview.postMessage(JSON.stringify({ "snn_info": data }));
                            }
                            else if (PROJ_DESC_INFO.project_type === "语音识别") {
                                console.log("语音识别SNN模型仿真界面snn_info 以及样例数据...");
                                fs.readFile(path.join(__dirname, "inner_scripts", "data_info.json"), "utf-8", (err, sampleData) => {
                                    console.log("Load sample data....");
                                    panelSNNModelVis.webview.postMessage(JSON.stringify({ "snn_info": data, "sample_audio": sampleData }));
                                });
                            }
                        }
                    });
                }
                else if (data.fetch_audio) {
                    // 获取音频
                    console.log("snn speech simulate page 获取音频..." + data.fetch_audio);
                    axios.default.get(data.fetch_audio, { responseType: "arraybuffer" }).then(res => {
                        decode(res.data).then((audioBuf) => {
                            panelSNNModelVis.webview.postMessage(JSON.stringify({ "audioBuf": audioBuf }));
                        });
                    });
                }
            });
            if (PROJ_DESC_INFO.project_type === '图像分类') {
                panelSNNModelVis.webview.html = get_convertor_page_v2_1.getSNNSimuPage();
            }
            else if (PROJ_DESC_INFO.project_type === '语义分割') {
                panelSNNModelVis.webview.html = get_seg_pages_1.getSegSimulatePage();
            }
            else if (PROJ_DESC_INFO.project_type === "语音识别") {
                panelSNNModelVis.webview.html = get_speech_pages_1.getSNNSimuSpeechPage();
            }
            panelSNNModelVis.title = "SNN仿真";
            panelSNNModelVis.reveal();
        }
    });
    // 启动转换为DarwinLang的操作
    vscode.commands.registerCommand("item_darwinLang_convertor.start_convert", () => {
        // inMemTreeViewDarLang = [];
        // if(!ITEM_ICON_MAP.has("SNN模型")){
        // ITEM_ICON_MAP.set("SNN模型","imgs/file.png");
        // addDarwinFold("SNN模型");
        DARWIN_LANG_FILE_PATHS.splice(0);
        inMemTreeViewStruct[0].children[0].children[1].children.splice(1);
        inMemTreeViewStruct[0].children[0].children[1].children[0].children.splice(0);
        fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out"), (err, files) => {
            files.forEach(file => {
                DARWIN_LANG_FILE_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "darlang_out", file));
                TreeViewProvider_1.addDarwinFiles(file);
                if (file.indexOf("json") !== -1) {
                    inMemTreeViewStruct[0].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode(file));
                }
                else {
                    inMemTreeViewStruct[0].children[0].children[1].children[0].children.push(new TreeViewProvider_1.TreeItemNode(file));
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
    vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function () {
        if (DARWIN_LANG_FILE_PATHS.length === 0) {
            vscode.window.showErrorMessage("请先完成转换步骤！！！");
            return;
        }
        if (!TreeViewProvider_1.ITEM_ICON_MAP.has("SNN二进制模型")) {
            TreeViewProvider_1.addSlfFile("SNN二进制模型");
        }
        let genScript = path.join(__dirname, "darwin2sim", "gen_darwin2_bin_files.py");
        let cmdStr = PYTHON_INTERPRETER + " " + genScript + " " + path.basename(PROJ_SAVE_PATH).replace("\.dar2", "") + " " + path.join(path.dirname(PROJ_SAVE_PATH), "packed_bin_files.dat");
        vscode.window.showInformationMessage("二进制文件生成中，请稍等......");
        child_process_1.exec(cmdStr, (err, stdout, stderr) => {
            if (err) {
                console.log("执行darwin2二进制部署文件错误...");
            }
            else {
                DARWIN_LANG_BIN_PATHS.splice(0);
                inMemTreeViewStruct[0].children[2].children[0].children[0].children.splice(0);
                inMemTreeViewStruct[0].children[2].children[0].children[1].children.splice(0);
                fs.readdir(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out"), (err, files) => {
                    files.forEach(file => {
                        if (file !== "inputs" && file.indexOf("clear") === -1 && file.indexOf("enable") === -1) {
                            DARWIN_LANG_BIN_PATHS.push(path.join(__dirname, "darwin2sim", "model_out", path.basename(PROJ_SAVE_PATH).replace("\.dar2", ""), "bin_darwin_out", file));
                            if (file.indexOf("clear") === -1 && file.indexOf("enable") === -1 && file.indexOf("re_config") === -1 &&
                                file.indexOf("nodelist") === -1 && file.indexOf("linkout") === -1 && file.indexOf("layerWidth") === -1 && file.indexOf("1_1config.txt") === -1) {
                                if (file.search("config.b") !== -1) {
                                    TreeViewProvider_1.addDarwinFiles("config.b");
                                    inMemTreeViewStruct[0].children[2].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("config.b"));
                                }
                                else if (file.search("connfiles") !== -1) {
                                    TreeViewProvider_1.addDarwinFiles("packed_bin_files.dat");
                                    inMemTreeViewStruct[0].children[2].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("packed_bin_files.dat"));
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
    vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin2", function () {
        console.log("目标转换为darwin2二进制文件");
        vscode.commands.executeCommand("bin_darlang_convertor.start_convert");
    });
    vscode.commands.registerCommand("item_darwinLang_convertor.convert_to_darwin3", function () {
        console.log("目标转换为darwin3二进制文件");
    });
    vscode.commands.executeCommand("darwin2.helloWorld");
    function autoSaveWithCheck() {
        // check if all necessary info get, auto save to proj_save_path
        if (X_NORM_DATA_PATH && X_TEST_DATA_PATH && Y_TEST_DATA_PATH && ANN_MODEL_FILE_PATH && DARWIN_LANG_FILE_PATHS && DARWIN_LANG_BIN_PATHS) {
            console.log("all nessary info get, auto save");
            let projInfoData = {
                "proj_info": PROJ_DESC_INFO,
                "x_norm_path": X_NORM_DATA_PATH,
                "x_test_path": X_TEST_DATA_PATH,
                "y_test_path": Y_TEST_DATA_PATH,
                "model_path": ANN_MODEL_FILE_PATH,
                "darwinlang_file_paths": DARWIN_LANG_FILE_PATHS,
                "darwinlang_bin_paths": DARWIN_LANG_BIN_PATHS
            };
            fs.writeFileSync(PROJ_SAVE_PATH, JSON.stringify(projInfoData));
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
    ['测试数据标签', "imgs/data_label_icon_new.png"],
    ['SNN模型', "imgs/ann_model.png"],
    ['连接文件', "imgs/conn_files_icon.png"],
    ['模拟器', "imgs/simulate_icon.png"],
    ['编译映射', "imgs/compile_icon.png"],
    ['Darwin二进制文件', "imgs/darwin_model_icon_new.png"],
    ["模型转换", "imgs/convert_icon.png",],
    ["模型文件", "imgs/ann_model.png"],
    ["编解码配置文件", "imgs/data_icon_new.png"]
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
    label, children, isRoot, contextVal) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.label = label;
        this.children = children;
        this.isRoot = isRoot;
        this.contextVal = contextVal;
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
        if (contextVal !== undefined) {
            this.contextValue = contextVal;
        }
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
        this.tooltip = TreeItemNode.getToolTip(this.label);
    }
    // command: 为每项添加点击事件的命令
    static getToolTip(currLabel) {
        console.log("添加提示文字 for " + currLabel);
        if (currLabel.indexOf("darlang") !== -1) {
            return "DarwinDML";
        }
        else if (currLabel.indexOf("brian2") !== -1) {
            return "仿真数据";
        }
        else if (currLabel.indexOf("config.b") !== -1) {
            return "二进制可部署模型文件";
        }
        else if (currLabel.indexOf("packed_bin") !== -1) {
            return "用于模型部署运行时数据编码";
        }
        return currLabel;
    }
    // __filename：当前文件的路径
    // 重点讲解 Uri.file(join(__filename,'..', '..') 算是一种固定写法
    // Uri.file(join(__filename,'..','assert', ITEM_ICON_MAP.get(label)+''));   写成这样图标出不来
    // 所以小伙伴们就以下面这种写法编写
    static getIconUriForLabel(label) {
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
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
        </div>
  
        <!--展示的主面板-->
        <div class="row" style="height: 45%;width: 100%;">
            <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 50px;width: 700px;">
              <!-- 数据基本信息表格 -->
              <div style="text-align: center;color: #333;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">导入数据统计</font></div>
              <table id="data_general_table" style="width:500px; margin-left:75px;color: #333;margin-top: 30px;">
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 18px;
                      color: #333333;">指标</font></td>
                    <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 18px;
                      color: #333333;">指标值</font></td>               
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: right;">总数据量</font></td>
                  <td id="total_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: right;">测试数据量</font></td>
                  <td id="test_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: right;">验证数据量</font></td>
                  <td id="val_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: right;">数据类别</font></td>
                  <td id="class_counts" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                </tr>
              </table>
            </div>
            <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 15px;width: 760px;">
              <div style="text-align: center;margin-bottom:20px;color: #333;font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">
                数据类别分布
              </div>
              <div id="bar_chart_testdata_container" style="width: 700px;height: 400px;margin-left:20px;margin-top: -30px;"></div>
            </div>
        </div>
        <div class="row" style="height: 45%;width: 100%;margin-top:30px;">
          <div id="sample_data_div" class="col-md-5" style="height:410;width: 700px;background: rgba(238,238,238,0.4);margin-left: 50px;">
            <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
            font-size: 20px;
            color: #333333;
            letter-spacing: 1.14px;">
              训练集样例数据
            </div>
            <div id="bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
            <ul id="sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 640px;overflow-x: auto;display: block;background: rgb(238,238,238);white-space: nowrap;">
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
          <div id="sample_testdataset_data_div" class="col-md-5" style="height: 410px;width: 760px;background: rgba(238,238,238,0.4);margin-left: 15px;">
            <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
            font-size: 20px;
            color: #333333;
            letter-spacing: 1.14px;">
              测试集样例数据
            </div>
  
            <div id="test_bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
            <ul id="test_sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 700px;overflow: auto;display: block;white-space: nowrap;">
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
        width: calc(100vw);
        height: calc(100vh);
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
  // var prev_click_img_li_id = undefined;
  // var prev_click_img_li_test_id = undefined;
  let prev_click_img_id = undefined;
  let prev_click_img_test_id = undefined;
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
        console.log("Auto click first image....");
        document.getElementById("sample_img0").click();
        document.getElementById("test_sample_img0").click();
    });
  });
  
  function sample_img_click(e){
    var sampleId = $(e).attr("id");
    if(sampleId.substring(0,4) === "test"){
      if(prev_click_img_test_id !== undefined){
        document.getElementById(prev_click_img_test_id).style.border = "";
      }
      console.log("点击目标："+sampleId+", 设置边框颜色...");
      prev_click_img_test_id = sampleId;
      let img_clicked = document.getElementById(prev_click_img_test_id);
      document.getElementById(sampleId+"_li").removeChild(img_clicked);
      img_clicked.style.border = "10px outset red";
      document.getElementById(sampleId+"_li").appendChild(img_clicked);
      // document.getElementById(prev_click_img_test_id).style.border = "10px outset red;";
      // if(prev_click_img_li_test_id !== undefined){
      //   document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
      //   document.getElementById(prev_click_img_li_test_id).style.opacity = "";
      // }
      // prev_click_img_li_test_id = sampleId+"_li";
      // document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "#00868B";
      // document.getElementById(prev_click_img_li_test_id).style.opacity = "0.5";
    }else{
      if(prev_click_img_id !== undefined){
        document.getElementById(prev_click_img_id).style.border = "";
      }
      console.log("点击目标："+sampleId+", 设置边框颜色...");
      prev_click_img_id = sampleId;
      let img_clicked = document.getElementById(prev_click_img_id);
      document.getElementById(sampleId+"_li").removeChild(img_clicked);
      img_clicked.style.border = "10px outset red";
      document.getElementById(sampleId+"_li").appendChild(img_clicked);
      // document.getElementById(prev_click_img_id).style.border = "10px outset red;";
      // if(prev_click_img_li_id !== undefined){
      //   document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
      //   document.getElementById(prev_click_img_li_id).style.opacity = "";
      // }
      // prev_click_img_li_id = sampleId+"_li";
      // document.getElementById(prev_click_img_li_id).style.backgroundColor = "#00868B";
      // document.getElementById(prev_click_img_li_id).style.opacity = "0.5";
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
                      color:"#999999"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      },
                      fontFamily: 'Helvetica',
                      fontSize: '12px',
                    }
              },
              yAxis: [
                  {
                    type: 'value',
                    scale:true,
                    name:y_axis_name,
                    nameTextStyle:{
                      color:"#999999"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      },
                      fontFamily: 'Helvetica',
                      fontSize: '12px',
                    }
                  },
                  {
                    type: 'value',
                    scale:true,
                    name:"",
                    show:false,
                    nameTextStyle:{
                      color:"#999999"
                    },
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    axisLabel:{
                      show:false,
                      textStyle:{
                        ccolor:"#999999"
                      },
                      fontFamily: 'Helvetica',
                      fontSize: '12px',
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
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">模型信息加载中...</font></span>
        </div>
  
          <div id="main_panel" style="width: 100%;height: 100%;overflow: auto;white-space: nowrap;">
            <div style="width: 100%;">
              <!-- 模型总体信息表格 -->
              <div style="background: rgba(238,238,238,0.4);height: 440px;display: inline-block;width: 700px;">
                <table id="model_general_table" style="margin-left:40px;color: #333;width: 600px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 20px;
                    color: #333333;
                    letter-spacing: 1.14px;">人工神经网络模型基本信息</font></caption>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="border: solid 2px;background: rgb(238,238,238);border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;text-align: center;">统计字段</td>
                    <td style="border: solid 2px;background: rgb(238,238,238);border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;text-align: center;">统计值</td>
                  </tr>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 14px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">总层数</td>
                    <td id="model_total_layers" style="padding-left: 10px;font-family: SourceHanSansCN-Heavy;
                    font-size: 14px;
                    color: #4D4D4D;text-align: right;padding-right: 15px;padding-top: 8px; padding-bottom: 8px;"></td>
                  </tr>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px; border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 14px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">总参数量</td>
                    <td id="model_total_param" style="padding-left: 10px;font-family: SourceHanSansCN-Heavy;
                    font-size: 14px;
                    color: #4D4D4D;text-align: right;padding-right: 15px;padding-top: 8px; padding-bottom: 8px;"></td>
                  </tr>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px; border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 14px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">unit数量</td>
                    <td id="model_total_units" style="padding-left: 10px;font-family: SourceHanSansCN-Heavy;
                    font-size: 14px;
                    color: #4D4D4D;text-align: right;padding-right: 15px;padding-top: 8px; padding-bottom: 8px;"></td>
                  </tr>
                </table>
      
                <!-- python 绘制的模型结构简图 -->
                <div id="ann_model_vis_img_parent_div" style="margin-left: 40px;width: 600px;margin-right: 40px;">
                  <img id="ann_model_vis_img" style="width: 600px;height: 220px;">
                </div>
              </div>
    
              <!--模型详细信息表格-->
              <div style="background: rgba(238,238,238,0.4);height: 440px;margin-left: 10px;width: 740px;display: inline-block;vertical-align: top;padding-left: 40px;margin-right: 40px;">
                <div style="text-align: center;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">各层详细信息</div>
                <div class="row" style="width: 100%;">
                  <div class="col-md-6">
                    <table id="model_detail_table" style="color: #333;">
                      <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                      <thead>
                        <tr style="border: solid 3px;height: 35px;border-color: #D6D6D6;">
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">名称</td>
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 180px;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">输出形状</td>
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 200px;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">参数量</td>
                        </tr>
                      </thead>
                      <!--通过加载模型的信息动态创建-->
                    </table>
                  </div>
                  <div class="col-md-6">
                    <table id="model_detail_table_secondary" style="color: #333;">
                      <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                      <thead>
                        <tr style="border: solid 3px;height: 35px;border-color: #D6D6D6;">
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">名称</td>
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 180px;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">输出形状</td>
                          <td style="background: rgb(238,238,238);border: solid 2px;border-color: #D6D6D6;width: 200px;font-family: SourceHanSansCN-Regular;
                          font-size: 16px;
                          color: #666666;padding-top: 15px; padding-bottom: 15px;text-align: center;">参数量</td>
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
              <div id="model_layers_vis" style="background: rgba(238,238,238,0.4);display: inline-block;width: 700px;height: 400px;">
                <div id="model_layers_vis_tab_caption" style="text-align: center;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">卷积与激活层输出可视化</div>
                <!--动态创建-->
                <div id="layers_vis_div" class="row" style="width: 620px;margin-left: 40px;margin-top: 40px;margin-bottom: 0px; margin-right: 40px;padding: 0px;background: rgb(238,238,238);color: #333;border: 2px solid #333;height: 58px;border-color: #D6D6D6;">
                  <div class="col-md-3" style="border-right: 2px solid #333;height: 56px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">layer 名称</div>
                  <div class="col-md-3" style="border-right: 2px solid #333;height: 56px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">layer 编号</div>
                  <div class="col-md-6" style="height: 56px;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">输出可视化</div>
                </div>
                <div id="tmp_peer"></div>
              </div>
              <!-- 显示各层的参数量占比 -->
              <div style="background: rgba(238,238,238,0.4);margin-left: 10px;width: 740px;height: 400px;vertical-align: top;display: inline-block;">
                <div style="text-align: center;margin-left: 100px;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">各层参数量分布</div>
                <div id="layer_param_percent_div" style="width: 600px;height: 370px;margin-left: 60px;"></div>
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
        width: calc(100vw);
        height: calc(100vh);
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
                  col_name.style = "padding-left: 15px;border: solid 2px;border-color: #D6D6D6;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_name.innerText = detail_info[i].name;
                  var col_shape = document.createElement("td");
                  col_shape.style = "border: solid 2px;border-color: #D6D6D6;text-align: right; padding-right:15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_shape.innerText = '('+detail_info[i].shape+')';
                  var col_params = document.createElement("td");
                  col_params.style = "border: solid 2px;border-color: #D6D6D6;text-align: right; padding-right:15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
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
                  col_name.style = "padding-left: 15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_name.innerText = detail_info[i].name;
                  var col_shape = document.createElement("td");
                  col_shape.style = "border: solid 2px;border-color: #D6D6D6;text-align:right; padding-right: 15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_shape.innerText = '('+detail_info[i].shape+')';
                  var col_params = document.createElement("td");
                  col_params.style = "border: solid 2px;border-color: #D6D6D6;text-align: right; padding-right:15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
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
                  img_div.style = "margin-left: 40px;margin-right: 40px;color: #333;border: 3px solid #333;margin-top: 0px; height:58px;margin-bottom: 0px; padding: 0px;border-color: #D6D6D6;";
  
                  var layer_name_div = document.createElement("div");
                  layer_name_div.setAttribute("class", "col-md-3");
                  layer_name_div.style = "border-right: 2px solid #333;height: 58px;border-color: #D6D6D6;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 20px;";
                  layer_name_div.innerText = layer_name;
                  img_div.appendChild(layer_name_div);
  
                  var layer_index_div = document.createElement("div");
                  layer_index_div.style = "border-right: 2px solid #333;height: 58px;border-color: #D6D6D6;text-align: right; padding-right: 15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 20px;";
                  layer_index_div.setAttribute("class", "col-md-3");
  
                  layer_index_div.innerText = layer_idx;
                  img_div.append(layer_index_div);
  
                  var layer_vis_div = document.createElement("div");
                  layer_vis_div.setAttribute("class", "col-md-6");
                  layer_vis_div.style.paddingTop = "10px";
  
                  for(var j=0;j<layer_vis_img_paths.length;++j){
                    var layer_img_tag = document.createElement("img");
                    layer_img_tag.src = layer_vis_img_paths[j];
                    console.log("target layer vis path: "+layer_vis_img_paths[j]);
                    layer_img_tag.style.width = "50px";
                    layer_img_tag.style.height = "50px";
                    if(j === 0){
                      layer_img_tag.style.marginLeft = "20px";
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
                      color:"#999999",
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      },
                      rotate:30,
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
                    }
                },
              yAxis:[
                {
                  type: 'value',
                    scale:true,
                    name:"参数量(log_10)",
                    nameTextStyle:{
                      color:"#999999",
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      },
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
                    }
                },
                {
                  type: 'value',
                    scale:true,
                    name:"",
                    show:false,
                    nameTextStyle:{
                      color:"#999999",
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      },
                      fontFamily: 'PingFangSC-Regular',
                      fontSize: '12px',
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
      <div class="modal-dialog" style="background-color: white;width: 800px;">
        <div class="modal-content" style="background-color: white;">
          <div>
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);margin-right: 30px;">
              &times;
            </button>
            <h4 id="myModalLabel" style="font-family: SourceHanSansCN-Normal;
            font-size: 24px;
            color: #333333;
            letter-spacing: 1.07px;margin-left: 20px;">
              项目创建向导
            </h4>
          </div>
          <div>
            <div id="alert_sheet" class="alert alert-danger" style="display: none;">
              <a href="#" class="close" data-dismiss="alert">
                  &times;
              </a>
              <div id="error_band_text">
                <strong>警告！</strong>您的网络连接有问题。
              </div>
            </div>
                    <form role="form" id="project_info_form">
                        <div id="proj_name_div" style="margin-top: 50px;">
                            <label for="project_name" id="lb_project_name" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 285px;">项目名称: </label>
                            <input type="text" id="project_name" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                        </div>
                        <div style="margin-top: 20px;">
                            <label for="select_type" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 285px;">选择项目类别: </label>
                            <select id="select_type" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                                <option>图像分类</option>
                                <option>语义分割</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-top: 20px;">
                            <label for="python_type" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;text-align: right;padding-right: 5px;width: 285px;">选择python版本: </label>
                            <select id="python_type" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-top: 20px;">
                          <label for="ann_lib_type" style="font-family: SourceHanSansCN-Normal;
                          font-size: 22px;
                          color: #333333;
                          letter-spacing: 1.26px;text-align: right;padding-right: 5px;width: 285px;">模型使用的神经网络库: </label>
                          <select id="ann_lib_type" style="background: #EEEEEE;
                          border: 1px solid #D9D9D9;
                          border-radius: 6px;
                          border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                            <option>Keras(Tensorflow backended)</option>
                          </select>
                        </div>
                        <div class="input-group" style="background: #EEEEEE;
                        border-radius: 6px;
                        border-radius: 6px;">
                          <span id="span_save_path" class="input-group-addon" style="cursor:pointer;background: #DFDFDF;font-family: SourceHanSansCN-Normal;
                          font-size: 22px;
                          color: #333333;
                          letter-spacing: 1.26px;width: 295px;text-align: right;padding-right: 5px;">点击选择保存路径</span>
                          <input id="proj_save_path_input" type="text" class="form-control" style="width: 478px;background: #EEEEEE;
                          border-radius: 6px;
                          border-radius: 6px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                        </div>
                    </form>
          </div>
          <div style="margin-top: 40px;margin-bottom: 40px;">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss" style="background: #F3F3F3;
            border: 1px solid #D7D7D7;
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 200px;">关闭
            </button>
            <button type="button" class="btn btn-primary" id="create" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 60px;">创建
            </button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal -->
    </div>
    
    <!--项目属性修改-->
    <div class="modal fade" id="myModalProjRefact" tabindex="-1" role="dialog" aria-labelledby="myModalLabelProjRefact" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;width: 800px;">
        <div class="modal-content" style="background-color: white;">
          <div>
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);margin-right: 30px;">
              &times;
            </button>
            <h4 id="myModalLabelProjRefact" style="font-family: SourceHanSansCN-Normal;
            font-size: 24px;
            color: #333333;
            letter-spacing: 1.07px;margin-left: 20px;">
              项目属性修改
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form_projrefac">
                        <div style="margin-top: 50px;">
                            <label for="project_name_projrefac" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 260px;">项目名称: </label>
                            <input type="text" id="project_name_projrefac" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;" readonly='readonly'>
                        </div>
                        <div style="margin-top: 20px;">
                            <label for="select_type_refac" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 260px;">选择项目类别</label>
                            <select id="select_type_refac" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                                <option>图像分类</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-top: 20px;">
                            <label for="python_type_projrefac" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;text-align: right;padding-right: 5px;width: 260px;">选择python版本</label>
                            <select id="python_type_projrefac" style="background: #EEEEEE;
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-top: 20px;">
                          <label for="ann_lib_type_projrefac" style="font-family: SourceHanSansCN-Normal;
                          font-size: 22px;
                          color: #333333;
                          letter-spacing: 1.26px;text-align: right;padding-right: 5px;width: 260px;">模型使用的神经网络库</label>
                          <select id="ann_lib_type_projrefac" style="background: #EEEEEE;
                          border: 1px solid #D9D9D9;
                          border-radius: 6px;
                          border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                            <option>Keras(Tensorflow backended)</option>
                          </select>
                        </div>
                    </form>
          </div>
          <div style="margin-top: 40px;margin-bottom: 40px;">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss_projrefac" style="background: #F3F3F3;
            border: 1px solid #D7D7D7;
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 200px;">取消
            </button>
            <button type="button" class="btn btn-primary" id="create_projrefac" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 60px;">确认
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
    
           $("#project_name").on('change',(evt)=>{
            document.getElementById("alert_sheet").style.display = "none";
            document.getElementById("project_name").style.borderColor = '#D9D9D9';
            document.getElementById("lb_project_name").style.color = '#333333';
            if($("#proj_save_path_input").val().toString().trim().length !== 0){
              vscode.postMessage(JSON.stringify({"select_save_proj_path_req":$("#project_name").val(), "is_change_proj_name":true}));
            }
           });
    
            $("#create").on("click",function(){
                console.log("创建xxx");
                // 字段检查
                if($("#project_name").val() === undefined || $("#project_name").val().toString().trim().length === 0){
                  document.getElementById("alert_sheet").style.display = "block";
                  document.getElementById("project_name").style.borderColor='#f82d2d';
                  document.getElementById("lb_project_name").style.color = '#f82d2d';
                  document.getElementById("error_band_text").innerHTML = '<strong>项目名称不可为空!</strong>';
                  return;
                }else if($("#project_name").val().toString().trim().length > 20){
                  document.getElementById("alert_sheet").style.display = "block";
                  document.getElementById("project_name").style.borderColor='#f82d2d';
                  document.getElementById("lb_project_name").style.color = '#f82d2d';
                  document.getElementById("error_band_text").innerHTML = '<strong>项目名称不可超过20个字符!</strong>';
                  return;
                }else if($("#project_name").val().toString().trim().search("[\~\!\！\@\#\$\￥\%\<\>\》\《\.\?\？]") >=0){
                  document.getElementById("alert_sheet").style.display = "block";
                  document.getElementById("project_name").style.borderColor='#f82d2d';
                  document.getElementById("lb_project_name").style.color = '#f82d2d';
                  document.getElementById("error_band_text").innerHTML = '<strong>项目名称不可包含特殊字符!</strong>';
                  return;
                }
    
                if($("#proj_save_path_input").val().toString().trim().length === 0){
                  document.getElementById("alert_sheet").style.display = "block";
                  document.getElementById("span_save_path").style.color = '#f82d2d';
                  document.getElementById("proj_save_path_input").style.borderColor = '#f82d2d';
                  document.getElementById("error_band_text").innerHTML = '<strong>项目路径不可为空!</strong>';
                  return;
                }
    
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
    
                    document.getElementById("alert_sheet").style.display = "none";
                    document.getElementById("span_save_path").style.color = '#333333';
                    document.getElementById("proj_save_path_input").style.borderColor = '';
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
  
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: auto;white-space: nowrap;position: relative;">
  
      <div class="loading-div" id="loader_barchart" style="position: absolute;top: 400px;left: 50px;background: rgba(238,238,238);width: 600px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 240px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div class="loading-div" id="loader_tb" style="position: absolute;top: 400px;left: 740px;background: rgba(238,238,238);width: 720px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 300px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div style="height: 140px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div class="col-md-12">
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换参数配置</font></div>
              <form role="form" class="row" style="margin-left: 80px;margin-top: 15px;" id="project_info_form">
                  <div class="col-md-2" style="text-align: center;">
                      <label for="select_vthresh"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">脉冲发放阈值</font></label>
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
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">神经元dt</font></label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_synapse_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">突触dt</font></label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>0.1ms</option>
                          <option>1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_delay"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">delay</font></label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dura"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">总时间</font></label>
                      <select class="form-control" id="select_dura">
                          <option>100ms</option>
                          <option>200ms</option>
                          <option>500ms</option>
                      </select>
                  </div>
              </form>
          </div>
      </div>
  
  
      <div style="margin-top: 10px;height: 160px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div>
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换进度</font></div>
              <div class="row" style="margin-left: 30px;color: #333;">
                  <div class="col-md-2" style="text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">1</div>ANN转SNN</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">2</div>预处理</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
  
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">3</div>参数调优</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">4</div>DarwinLang文件生成</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="darlang_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              </div>
          
              <div class="row">
                  <!-- <span>启动</span> -->
                  <!-- <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i> -->
                  <div class="progress" style="width: 85%;display: inline-block;margin-bottom: 0;margin-left: 60px;background: #E6E6E6;
                  border-radius: 15px;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%; opacity: 0.76;
                           background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                           border-radius: 15px;">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      <div style="height: 560px; margin-top: 10px;width: 1500px;margin-left: -20px;">
          <div class="col-md-12">
              <!-- <div style="width: 350px;height: 560px;display: inline-block;vertical-align: top;white-space:normal;background: rgba(238,238,238,0.4);">
                  <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -20px;"><font style="color: #333;font-weight: bold;">日志输出</font></div>
                  <div id="log_output_div" style="margin-left: 20px;height: 340px; width: 300px; overflow: auto;margin-top: 60px;color: #333;">
                  </div>
              </div> -->
              <div style="width: 660px;height: 560px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);margin-left: 10px;">
                  <div style="text-align: center;margin-left: -40px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换性能分析</font></div>
                  <div id="use_time_bar_chart" style="width: 560px;height: 440px;margin-top: 15px;margin-left: 40px;"></div>
              </div>
              <div style="height:560px;margin-left: 10px;width: 820px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
                  <div id="model_layers_vis_tab_caption" style="text-align: center;margin-left: -20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换过程信息</font></div>
                  <table id="info_simu_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;color: #333;margin-left: 40px;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">转换指标统计</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">统计值</td>
                      </tr>
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">转换总耗时(秒)</td>
                          <td id="total_use_time" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">平均激发脉冲次数</td>
                          <td id="avg_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">激发脉冲次数方差</td>
                          <td id="std_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重均值</td>
                          <td id="avg_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重方差</td>
                          <td id="std_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">ANN转SNN耗时(秒)</td>
                          <td id="stage1_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">预处理耗时(秒)</td>
                          <td id="stage2_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">参数调优耗时(秒)</td>
                          <td id="stage3_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">DarwinLang文件生成耗时(秒)</td>
                          <td id="stage4_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                  </table>
                  <table id="scale_factors_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;border-spacing: 0px 5px;margin-left: 20px;color: #333;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">神经层</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">参数缩放系数</td>
                      </tr>
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
  
  /* progress {
    border-radius: 7px; 
    width: 80%;
    height: 22px;
    margin-left: -11.5%;
    box-shadow: 1px 1px 4px rgba( 0, 0, 0, 0.2 );
  }
  progress::-webkit-progress-bar {
      background: #E6E6E6;
      border-radius: 15px;
      border-radius: 15px;
  }
  progress::-webkit-progress-value {
      background-color: blue;
      opacity: 0.7;
      background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
      border-radius: 15px;
  } */
  
  
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
      src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.cnpmjs.org/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
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
  
  .loading-div {
      display: table-cell;
      vertical-align: middle;
      overflow: hidden;
      text-align: center;
  }
  .loading-div::before {
    display: inline-block;
    vertical-align: middle;
  } 
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
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
                  // $("#log_output_div").html(log_output_lists.join("<br/>"));
                  // document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight;
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
                    $(".loading-div").hide();
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
                    $("#total_use_time").text(convert_infos.total_use_time.replace("秒",""));
                    $("#avg_spike").text(convert_infos.spk_mean);
                    $("#std_spike").text(convert_infos.spk_std);
                    $("#avg_conn_wt").text(convert_infos.wt_mean);
                    $("#std_conn_wt").text(convert_infos.wt_std);
                    $("#stage1_time_use").text(convert_infos.stage1_time_use);
                    $("#stage2_time_use").text(convert_infos.stage2_time_use);
                    $("#stage3_time_use").text(convert_infos.stage3_time_use);
                    $("#stage4_time_use").text(convert_infos.stage4_time_use);
  
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
                      line_td1.style.border = "solid 2px #D6D6D6";
                      line_td1.style.paddingTop = '15px';
                      line_td1.style.paddingBottom = '15px';
                      line_td1.style.paddingLeft = '10px';
                      line_td1.style.paddingRight = '80px';
                      line_td1.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td1.style.fontSize = '14px';
                      line_td1.style.color = '#666666';
                      line_td1.innerHTML = ""+obj;
                      table_line.appendChild(line_td1);
                      let line_td2 = document.createElement("td");
                      line_td2.style.border = "solid 2px #D6D6D6";
                      line_td2.style.paddingTop = '15px';
                      line_td2.style.paddingBottom = '15px';
                      line_td2.style.paddingRight = '10px';
                      line_td2.style.paddingLeft = '80px';
                      line_td2.style.textAlign = 'right';
                      line_td2.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td2.style.fontSize = '14px';
                      line_td2.style.color = '#666666';
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
                          color:"#999999"
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '时长(秒)',
                      nameTextStyle:{
                          color:"#999999"
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"#999999"
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
                                      color:"#999999",
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
  
    <div class="loading-div">
      <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">仿真数据加载中...</font></span>
    </div>
  
      <div style="margin-top: 5px;display: block;">
  
          <div style="background: rgba(238,238,238,0.4);width: 400px;height: 380px;display: inline-block;">
            <div>
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">仿真配置结果评估</font></div>
              <table id="layer_conf_val" style="width: 320px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">统计指标</td>
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">指标值</td>
                  </tr>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">膜电位阈值</td>
                    <td id="simulate_vthresh" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">神经元时间步长</td>
                    <td id="simulate_neuron_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">突触时间步长</td>
                    <td id="simulate_synapse_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td  style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">延迟</td>
                    <td id="simulate_delay" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">仿真时长</td>
                    <td id="simulate_dura" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">准确率</td>
                    <td id="simulate_acc" style="color: #e71f1fe0;text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>    
              </table>
            </div>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 500px;height: 380px;display: inline-block;">
            <div style="text-align: center;margin-left: 40px;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">放电次数均值方差统计</font></div>
            <table id="snn_layers_spike_table" style="width: 420px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">层编号</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数均值</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数方差</td>
              </tr>
            </table>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 600px;height: 380px;display: inline-block;">
            <div>
              <div id="neurons_v_out_div" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">神经元放电</font></div>
              <div style="width: 360px;margin-left: 40px;margin-top: 20px;">
                <form class="form-horizontal" role="form">
                  <div class="form-group">
                    <label class="control-label col-md-8" for="select_which_layer"><font style="font-family: PingFangSC-Regular;font-weight: normal;
                      font-size: 16px;
                      color: #000000;
                      text-align: left;">选择神经元层</font></label>
                    <div class="col-md-4">
                      <select class="form-control" id="select_which_layer">
                        <option>输入层</option>
                        <option>输出层</option>
                    </select>
                    </div>
                  </div>
                </form>
              </div>
              <div id="neurons_v_chart" style="width: 540px;height: 320px;margin-left: 40px;margin-top: 20px;"></div>
            </div>
          </div>
      </div>
      <div style="margin-top: 5px;display: block;">
          <div style="display: inline-block;width: 760px;height: 460px;background: rgba(238,238,238,0.4);">
            <div id="model_input_spike_cap" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">脉冲神经网络输入层脉冲</font></div>
            <div id="input_spike_charts" style="width:660px;height: 400px;margin-left: 70px;display: inline-block;margin-top: 20px;"></div>
            <ul id="input_spike_sample_imgs_ul" style="height: 80px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 55px;margin-top: -40px;z-index: 2;">
            </ul>
          </div>
          <div style="width: 760px;height: 460px;display: inline-block;margin: left 20px;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络输出层脉冲</font></div>
              <span style="margin-left: 280px;font-family: SourceHanSansCN-Normal;
              font-size: 14px;
              color: #e71f1fe0;
              letter-spacing: 0.8px;">红色标记图像为输出层预测错误</span>
              <div id="model_layers_vis_tab_caption" style="text-align: center;background: rgba(238,238,238,1.00);border: solid 1px #D6D6D6;width: 460px;margin-left: 180px;"><font style="font-family: SourceHanSansCN-Medium;
                font-size: 14px;
                color: #666666;">统计计数</font></div>
              <table id="spike_out_count_table" style="margin-left: 180px;border: solid 3px #D6D6D6;color: #333;width: 460px;">
                  <tr id="out_labels" style="border: solid 2px #D6D6D6;">
                  </tr>
                  <tr id="out_counts_tr" style="border: solid 2px #D6D6D6;">
                  </tr>
              </table>
              <div id="spike_charts" style="width: 660px;height: 320px;margin-left: 70px;display: inline-block;"></div>
              <ul id="sample_imgs_ul" style="height: 90px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 80px;margin-top: -40px;z-index: 2;">
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
  
  .loading-div {
      width: calc(100vw);
      height: calc(100vh);
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
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  
  <script>
    const vscode = acquireVsCodeApi();
    let prev_clicked_li = undefined;
    let prev_clicked_input_li = undefined;
    let prev_clicked_img = undefined;
    let prev_clicked_input_img = undefined;
    let need_red_img_li = new Array();
  
        $(document).ready(function(){
          vscode.postMessage(JSON.stringify({"snn_simulate_ready":true}));
          console.log("SNN仿真Webview 界面ready.");
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
                      // img_tag.id = "sample_img_"+i;
                      img_tag.style.opacity = "0.5";
                      img_tag.style.display = "block";
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        console.log("current click cls_names="+test_img_spikes[i].cls_names);
                        console.log("current click spike tuples="+test_img_spikes[i].spike_tuples);
                        // if(prev_clicked_li !== undefined){
                        //   document.getElementById(prev_clicked_li).style.backgroundColor = "";
                        // }
                        // document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_li = "img_li_"+i;
                        if(prev_clicked_img !== undefined){
                          document.getElementById(prev_clicked_img).style.border = '';
                        }
                        prev_clicked_img = "img_"+i;
                        document.getElementById(prev_clicked_img).style.border = "10px outset orange";
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        console.log("start display counts in table....");
                        let num_classes = test_img_spikes[i].cls_names.length;
                        let curr_count=1;
                        let spike_counts = new Array();
                        if(test_img_spikes[i].spike_tuples.length === 0){
                          for(let k=0;k<num_classes;++k){
                            spike_counts.push(0);
                          }
                        }else{
                          let cls_idx = test_img_spikes[i].spike_tuples[0][0];
                          console.log("cls_idx="+cls_idx);
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
                        }
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "80px";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.innerText = "计数值:";
                        td_child.style.width = "80px";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          td_child.innerText = test_img_spikes[i].cls_names[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_labels").appendChild(td_child);
                        }
  
                        console.log("check spike_counts of "+i+", ="+spike_counts);
                        // mark reds
                        for(let k=0;k<need_red_img_li.length;++k){
                          if(prev_clicked_li === need_red_img_li[k]){
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '10px outset orange';
                          }else{
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                            // document.getElementById(need_red_img_li[k]).style.border = '2px dashed red';
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '5px dashed red';
                          }
                        }
                      }
                      img_tag.src = test_img_uris[i];
                      img_tag.id = "img_"+i;
                      img_tag.style.width = "50px";
                      img_tag.style.height = "50px";
  
                      img_li.appendChild(img_tag);
                      test_img_uls.appendChild(img_li);
  
                      // // mark reds
                      // for(let k=0;k<need_red_img_li.length;++k){
                      //   if(prev_clicked_li === need_red_img_li[k]){
                      //     // document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                      //     document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '10px outset orange';
                      //   }else{
                      //     // document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                      //     // document.getElementById(need_red_img_li[k]).style.border = '2px dashed red';
                      //     document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '5px dashed red';
                      //   }
                      // }
  
                      var label_span = document.createElement("span");
                      label_span.style.color = "#333";
                      label_span.style.height='14px';
                      console.log("图片 i="+i+", uri="+test_img_uris[i]);
                      // a.split("/")[5].split("_")[4].split(".")[0]
                      // label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      label_span.innerText = "标签: "+test_img_uris[i].split("/")[5].split("_")[4].split(".")[0];
                      img_li.appendChild(label_span);
                    }
  
                    console.log("创建输入层脉冲激发图......");
                    // 创建输入层脉冲激发图
                    for(let i=0;i<infos.spikes.snn_input_spikes.length;++i){
                      var input_img_li = document.createElement("li");
                      input_img_li.style.listStyle = "none";
                      input_img_li.id = "inputimg_li_"+i;
                      input_img_li.style.width = "53px";
                      input_img_li.style.height = "50";
                      input_img_li.style.display = "inline-block";
                      input_img_li.style.marginRight = "10px";
                      var input_img_tag = document.createElement("img");
                      input_img_tag.src = test_img_uris[i];
                      input_img_tag.id = "inputimg_"+i;
                      input_img_tag.style.width = "50px";
                      input_img_tag.style.height = "50px";
                      input_img_tag.style.opacity = "0.5";
                      input_img_tag.onclick = ()=>{
                        console.log("input spike display img idx "+i);
                        // if(prev_clicked_input_li !== undefined){
                        //   document.getElementById(prev_clicked_input_li).style.backgroundColor ="";
                        // }
                        // document.getElementById("input_img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_input_li = "inputimg_li_"+i;
                        if(prev_clicked_input_img !== undefined){
                          document.getElementById(prev_clicked_input_img).style.border = '';
                        }
                        prev_clicked_input_img = 'inputimg_'+i;
                        document.getElementById(prev_clicked_input_img).style.border = '10px outset orange';
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
  
                    console.log("标记错误样例数据.....");
                    // mark reds
                    for(let i=0;i<need_red_img_li.length;++i){
                      console.log("当前检测：prev_clicked_li="+prev_clicked_li+", target="+need_red_img_li[i].split("_")[0]+'_'+need_red_img_li[i].split('_')[2]);
                      if(prev_clicked_li === need_red_img_li[i]){
                        // document.getElementById(need_red_img_li[i]).style.backgroundColor = "yellow";  
                        document.getElementById(need_red_img_li[i].split("_")[0]+'_'+need_red_img_li[i].split('_')[2]).style.border = '10px outset orange';
                      }else{
                        // document.getElementById(need_red_img_li[i]).style.backgroundColor = "red";
                        document.getElementById(need_red_img_li[i].split('_')[0]+'_'+need_red_img_li[i].split('_')[2]).style.border = '5px dashed red';
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
                      "name":"脉冲激发次数最少的神经元膜电位"
                    });
                    data_series_input.push({
                      "data":v_vals[1],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[2],
                      "type": "line",
                      "smooth":true,
                      "name": "脉冲激发次数最少的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[3],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
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
                    console.log("填充表格数据.....");
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
                      td_id.style.fontFamily = 'ArialMT';
                      td_id.style.fontSize = '14px';
                      td_id.style.color = '#333333';
                      td_id.style.textAlign = 'right';
                      td_id.style.paddingRight = '15px';
                      td_id.style.textAlign = 'center';
                      td_id.style.border = "solid 2px #D6D6D6";
                      td_id.style.paddingTop = '12px';
                      td_id.style.paddingBottom = '12px';
                      td_id.innerText = ""+j;
                      table_line.appendChild(td_id);
  
                      let td_spike_avg = document.createElement("td");
                      td_spike_avg.style.fontFamily = 'ArialMT';
                      td_spike_avg.style.fontSize = '14px';
                      td_spike_avg.style.color = '#333333';
                      td_spike_avg.style.textAlign = 'right';
                      td_spike_avg.style.paddingRight = '15px';
                      td_spike_avg.style.order = "solid 2px #D6D6D6";
                      td_spike_avg.style.paddingTop = '12px';
                      td_spike_avg.style.paddingBottom = '12px';
                      td_spike_avg.innerText = infos.record_spike_out_info.spike_count_avgs[j];
                      table_line.appendChild(td_spike_avg);
  
                      let td_spike_std = document.createElement("td");
                      td_spike_std.style.fontFamily = 'ArialMT';
                      td_spike_std.style.fontSize = '14px';
                      td_spike_std.style.color = '#333333';
                      td_spike_std.style.textAlign = 'right';
                      td_spike_std.style.paddingRight = '15px';
                      td_spike_std.style.border = "solid 2px #D6D6D6";
                      td_spike_std.style.paddingTop = '12px';
                      td_spike_std.style.paddingBottom = '12px';
                      td_spike_std.innerText = infos.record_spike_out_info.spike_count_stds[j];
                      table_line.appendChild(td_spike_std);
  
                      document.getElementById("snn_layers_spike_table").appendChild(table_line);
                    }
                    console.log("Auto click first image.......");
                    document.getElementById("img_0").click();
                    document.getElementById("inputimg_0").click();
                    
                    $(".loading-div").hide(); // 隐藏加载提示
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                  data:["脉冲激发次数最少的神经元膜电位", "脉冲激发次数最多的神经元膜电位"],
                  textStyle:{
                    color:"#999999"
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
                      color:"#999999"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      }
                    }
                },
                yAxis: [
                  {
                      type: 'value',
                      scale:true,
                      name:"膜电位(左)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                      }
                  },
                  {
                    type: 'value',
                      scale:true,
                      name:"膜电位(右)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
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
  
    <div class="loading-div">
      <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
    </div>
  
      <div style="height: 400px;">
          <!-- SNN神经元信息 -->
          <div style="display: inline-block;background: rgba(238,238,238,0.4); height: 400px;width: 500px;">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络神经元组信息</font></div>
              <table id="snn_neurons_table" style="margin-left:10px;margin-left: 20px;border: solid 3px #D6D6D6;width: 440px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">layer编号</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">神经元个数</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">求解方法</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">电压阈值</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
  
          <div style="display: inline-block;background: rgba(238,238,238,0.4);height: 400px;width: 500px;">
            <div style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">层连接权重统计</font></div>
            <table id="snn_layer_wt_table" style="border: solid 3px #D6D6D6;width: 380px;margin-left: 60px;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <thead>
                <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">突触连接编号</td>
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">权重均值</td>
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">权重方差</td>
                </tr>
              </thead>
            </table>
          </div>
  
          <div style="height: 400px;margin-top: 20px;display: inline-block;background: rgba(238,238,238,0.4);width: 500px;">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络突触连接信息</font></div>
              <table id="layer_conns_table" style="margin-left:60px;border: solid 3px #D6D6D6;width: 400px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">突触连接编号</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">连接稠密度</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">平均连接个数</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
      </div>
      <div style="height: 460px;margin-top: 30px;">
          <!--权重分布图-->
          <div style="height: 460px;width: 770px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络权重分布</font></div>
              <div id="weight_dist_chart" style="width: 700px;height: 400px;margin-left: 40px;margin-top: 10px;"></div>
          </div>
          <div style="height: 460px;width: 740px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">模型连接图</font></div>
              <div id="sangky_chart" style="width: 700px;height: 400px;display: inline-block;margin-left: 20px;"></div>
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
  
    .loading-div {
        width: calc(100vw);
        height: calc(100vh);
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
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts-en.min.js"></script>
  
  <script>
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
              console.log("SNN 模型可视化接收到extension 消息: ");
                const data = JSON.parse(evt.data);
                if(data.snn_info){
                    var infos =JSON.parse(data.snn_info);
                    console.log("显示snn 基本信息......");
                    // 构建neurons info 表格
                    var neurons_info = infos.neurons_info;
                    var neurons_table = document.getElementById("snn_neurons_table");
                    for(var i=0;i<neurons_info.length;++i){
                        var line = document.createElement("tr");
                        line.style = "margin-top: 15px;border: solid 3px #D6D6D6;color: #333;"
                        var col_1 = document.createElement("td");
                        col_1.style = "text-align:center; padding-right:15px; font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_1.innerText = neurons_info[i].idx;
  
                        var col_2 = document.createElement("td");
                        col_2.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_2.innerText = neurons_info[i].neuron_count;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "border: solid 3px #D6D6D6;padding-left:10px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_3.innerText = neurons_info[i].method;
  
                        var col_4 = document.createElement("td");
                        col_4.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
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
                        col_1.style = "text-align:center; padding-right:15px;border: solid 3px #D6D6D6;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_1.innerText = synaps_info[i].idx + "-"+(synaps_info[i].idx+1);
  
                        var col_2 = document.createElement("td");
                        col_2.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_2.innerText = synaps_info[i].ratio;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
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
                      // font-family: ArialMT;font-size: 14px;color: #333333;
                      td_id.style.fontSize = "14px";
                      td_id.style.fontFamily = "ArialMT";
                      td_id.style.color = "#333333";
                      td_id.style.width = "120px";
                      td_id.style.border = "solid 3px #D6D6D6";
                      td_id.style.textAlign = "center";
                      td_id.style.paddingRight = "15px";
                      td_id.style.paddingTop = "12px";
                      td_id.style.paddingBottom = "12px";
                      td_id.innerText = ""+i+"-"+(i+1);
                      table_line.appendChild(td_id);
  
                      let td_avg = document.createElement("td");
                      td_avg.style.fontSize = "14px";
                      td_avg.style.fontFamily = "ArialMT";
                      td_avg.style.color = "#333333";
                      td_avg.style.width = "120px";
                      td_avg.style.border = "solid 3px #D6D6D6";
                      td_avg.style.textAlign = "right";
                      td_avg.style.paddingRight = "15px";
                      td_avg.style.paddingTop = "12px";
                      td_avg.style.paddingBottom = "12px";
                      td_avg.innerText = infos.record_layers_wt_info.record_wts_avg[i];
                      table_line.appendChild(td_avg);
  
                      let td_std = document.createElement("td");
                      td_std.style.fontSize = "14px";
                      td_std.style.fontFamily = "ArialMT";
                      td_std.style.color = "#333333";
                      td_std.style.width = "120px";
                      td_std.style.textAlign = "right";
                      td_std.style.paddingRight = "15px";
                      td_std.style.border = "solid 3px #D6D6D6";
                      td_std.style.paddingTop = "12px";
                      td_std.style.paddingBottom = "12px";
                      td_std.innerText = infos.record_layers_wt_info.record_wts_std[i];
                      table_line.appendChild(td_std);
  
                      document.getElementById("snn_layer_wt_table").appendChild(table_line);
  
                    }
  
                    $(".loading-div").hide(); // 隐藏加载提示
  
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
  
                    // // SNN模型简图
                    // let sanky_data=new Array();
                    // let sanky_links=new Array();
                    // for(let i=0;i<infos.layer_conns.length+1;++i){
                    //     sanky_data.push({"name": "layer_"+i});
                    // }
                    // for(let i=0;i<infos.layer_conns.length;++i){
                    //     sanky_links.push({"source":"layer_"+i, "target":"layer_"+(i+1), "value": infos.layer_conns[i].ratio, "lineStyle":{"color": "#c23531"}});
                    // }
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
                        color:"#999999",
                        fontFamily: 'SourceHanSansCN-Normal',
                        fontSize: '14px',
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        },
                        fontFamily: 'SourceHanSansCN-Normal',
                        fontSize: '14px',
                     }
                  },
                  yAxis: {
                      type: 'value',
                      name:"连接个数(log_10)",
                      nameTextStyle:{
                        color:"#999999",
                        fontFamily: 'SourceHanSansCN-Normal',
                        fontSize: '14px',
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
                          },
                          fontFamily: 'SourceHanSansCN-Normal',
                          fontSize: '14px',
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
                                  color:"#333333",
                                  fontFamily: 'SourceHanSansCN-Normal',
                                  fontSize: '14px',
                              },
                              bottom: '3%',
                              left: 'center'
                          },
                          tooltip: {}, //提示信息
                          legend: {   //图例组件
                              // top: "0%",   //距离顶部5%
                              // bottom: "88%",
                              // left: "5%",
                              orient:'vertical',
                              x:'left',
                              y:'center',
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
                                          padding: [0, 0, 5, 0],
                                          color:"#333333",
                                          fontFamily: 'SourceHanSansCN-Normal',
                                          letterSpacing: '0.8px'
                                      },
                                      b: {
                                          fontSize: 8,
                                          align: 'center',
                                          padding: [0, 10, 0, 0],
                                          lineHeight: 25,
                                          color:"#333333",
                                          fontFamily: 'SourceHanSansCN-Normal',
                                          letterSpacing: '0.8px'
                                      }
                                  },
                                  color:"#333333",
                                  fontFamily: 'SourceHanSansCN-Normal',
                                  fontSize: '14px',
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
/* 53 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getANNSNNConvertSegPage = exports.getSegSimulatePage = exports.getSegDataVisPage = void 0;
function getSegDataVisPage() {
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
              <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 50px;width: 700px;">
                <!-- 数据基本信息表格 -->
                <div style="text-align: center;color: #333;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">导入数据统计</font></div>
                <table id="data_general_table" style="width:500px; margin-left:75px;color: #333;margin-top: 30px;">
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                      <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                        font-size: 18px;
                        color: #333333;">指标</font></td>
                      <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                        font-size: 18px;
                        color: #333333;">指标值</font></td>               
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">总数据量</font></td>
                    <td id="total_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">测试数据量</font></td>
                    <td id="test_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">验证数据量</font></td>
                    <td id="val_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">数据类别</font></td>
                    <td id="class_counts" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                </table>
              </div>
              <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 15px;width: 760px;">
                <div style="text-align: center;margin-bottom:20px;color: #333;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">
                  数据类别分布
                </div>
                <div id="bar_chart_testdata_container" style="width: 700px;height: 400px;margin-left:20px;margin-top: -30px;"></div>
              </div>
          </div>
          <div class="row" style="height: 45%;width: 100%;margin-top:30px;">
            <div id="sample_data_div" class="col-md-5" style="height:410;width: 700px;background: rgba(238,238,238,0.4);margin-left: 50px;">
              <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">
                训练集样例数据
              </div>
              <div id="bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
              <ul id="sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 640px;overflow-x: auto;display: block;background: rgb(238,238,238);white-space: nowrap;">
              </ul>
              
            </div>
            <div id="sample_testdataset_data_div" class="col-md-5" style="height: 410px;width: 760px;background: rgba(238,238,238,0.4);margin-left: 15px;">
              <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">
                测试集样例数据
              </div>
    
              <div id="test_bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
              <ul id="test_sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 700px;overflow: auto;display: block;white-space: nowrap;">
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
          width: calc(100vw);
          height: calc(100vh);
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
    // var prev_click_img_li_id = undefined;
    // var prev_click_img_li_test_id = undefined;
    let prev_click_img_id = undefined;
    let prev_click_img_test_id = undefined;
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
          // 添加图片
          for(let i=0;i<data.sample_imgs.length;++i){
              let img_li = document.createElement('li');
              img_li.style = 'list-style: none;display: inline-block;height: 60px;width: 70px;';
              img_li.id = 'sample_img'+i+"_li";
              let img = document.createElement('img');
              img.src = data.sample_imgs[i].test_sample_img_path;
              img.id = 'sample_img'+i;
              img_li.appendChild(img);
              document.getElementById("sample_imgs_ul").appendChild(img_li);
              img.onclick = function(){
                var sampleId = 'sample_img'+i;
                if(sampleId.substring(0,4) === "test"){
                    if(prev_click_img_test_id !== undefined){
                    document.getElementById(prev_click_img_test_id).style.border = "";
                    }
                    console.log("点击目标："+sampleId+", 设置边框颜色...");
                    prev_click_img_test_id = sampleId;
                    let img_clicked = document.getElementById(prev_click_img_test_id);
                    document.getElementById(sampleId+"_li").removeChild(img_clicked);
                    img_clicked.style.border = "10px outset red";
                    document.getElementById(sampleId+"_li").appendChild(img_clicked);
                    // document.getElementById(prev_click_img_test_id).style.border = "10px outset red;";
                    // if(prev_click_img_li_test_id !== undefined){
                    //   document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
                    //   document.getElementById(prev_click_img_li_test_id).style.opacity = "";
                    // }
                    // prev_click_img_li_test_id = sampleId+"_li";
                    // document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "#00868B";
                    // document.getElementById(prev_click_img_li_test_id).style.opacity = "0.5";
                }else{
                    if(prev_click_img_id !== undefined){
                    document.getElementById(prev_click_img_id).style.border = "";
                    }
                    console.log("点击目标："+sampleId+", 设置边框颜色...");
                    prev_click_img_id = sampleId;
                    let img_clicked = document.getElementById(prev_click_img_id);
                    document.getElementById(sampleId+"_li").removeChild(img_clicked);
                    img_clicked.style.border = "10px outset red";
                    document.getElementById(sampleId+"_li").appendChild(img_clicked);
                    // document.getElementById(prev_click_img_id).style.border = "10px outset red;";
                    // if(prev_click_img_li_id !== undefined){
                    //   document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
                    //   document.getElementById(prev_click_img_li_id).style.opacity = "";
                    // }
                    // prev_click_img_li_id = sampleId+"_li";
                    // document.getElementById(prev_click_img_li_id).style.backgroundColor = "#00868B";
                    // document.getElementById(prev_click_img_li_id).style.opacity = "0.5";
                }
                console.log("current click img id="+sampleId);
                var sampleIdx = parseInt(sampleId.substring(sampleId.length-1));
                if(sampleId.substring(0,4) === "test"){
                    display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量", "test_bar_chart_histgram");
                }else{
                    display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量", "bar_chart_histgram");
                }
              }
          }
    
          for(let i=0;i<data.test_sample_imgs.length;++i){
                let img_li = document.createElement('li');
                img_li.style = 'list-style: none;display: inline-block;height: 60px;width: 70px;';
                img_li.id = 'test_sample_img'+i+"_li";
                let img = document.createElement('img');
                img.src = data.sample_imgs[i].test_sample_img_path;
                img.id = 'test_sample_img'+i;
                img_li.appendChild(img);
                document.getElementById("test_sample_imgs_ul").appendChild(img_li);
                img.onclick = function(){
                var sampleId = 'test_sample_img'+i;
                if(sampleId.substring(0,4) === "test"){
                    if(prev_click_img_test_id !== undefined){
                    document.getElementById(prev_click_img_test_id).style.border = "";
                    }
                    console.log("点击目标："+sampleId+", 设置边框颜色...");
                    prev_click_img_test_id = sampleId;
                    let img_clicked = document.getElementById(prev_click_img_test_id);
                    document.getElementById(sampleId+"_li").removeChild(img_clicked);
                    img_clicked.style.border = "10px outset red";
                    document.getElementById(sampleId+"_li").appendChild(img_clicked);
                    // document.getElementById(prev_click_img_test_id).style.border = "10px outset red;";
                    // if(prev_click_img_li_test_id !== undefined){
                    //   document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
                    //   document.getElementById(prev_click_img_li_test_id).style.opacity = "";
                    // }
                    // prev_click_img_li_test_id = sampleId+"_li";
                    // document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "#00868B";
                    // document.getElementById(prev_click_img_li_test_id).style.opacity = "0.5";
                }else{
                    if(prev_click_img_id !== undefined){
                    document.getElementById(prev_click_img_id).style.border = "";
                    }
                    console.log("点击目标："+sampleId+", 设置边框颜色...");
                    prev_click_img_id = sampleId;
                    let img_clicked = document.getElementById(prev_click_img_id);
                    document.getElementById(sampleId+"_li").removeChild(img_clicked);
                    img_clicked.style.border = "10px outset red";
                    document.getElementById(sampleId+"_li").appendChild(img_clicked);
                    // document.getElementById(prev_click_img_id).style.border = "10px outset red;";
                    // if(prev_click_img_li_id !== undefined){
                    //   document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
                    //   document.getElementById(prev_click_img_li_id).style.opacity = "";
                    // }
                    // prev_click_img_li_id = sampleId+"_li";
                    // document.getElementById(prev_click_img_li_id).style.backgroundColor = "#00868B";
                    // document.getElementById(prev_click_img_li_id).style.opacity = "0.5";
                }
                console.log("current click img id="+sampleId);
                var sampleIdx = parseInt(sampleId.substring(sampleId.length-1));
                if(sampleId.substring(0,4) === "test"){
                    display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量", "test_bar_chart_histgram");
                }else{
                    display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量", "bar_chart_histgram");
                }
              }
          }
    
        //   var sample_count = data.sample_imgs.length;
        //   if(sample_count < 10){
        //     for(var i=0;i<10-sample_count;++i){
        //       $("#sample_img"+(10-i-1)).remove();
        //     }
        //   }
        //   for(var i=0;i<sample_count;++i){
        //     $("#sample_img"+i).hide();
        //     $("#sample_img"+i).show();
        //   }
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
        //   // 对数处理histgram
        //   for(var i=0;i<data_info.test_sample_imgs.length;++i){
        //     for(var j=0;j<data_info.test_sample_imgs[i].hist_gram_bins.length;++j){
        //       if(data_info.test_sample_imgs[i].hist_gram_bins[j] > 0){
        //         data_info.test_sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.test_sample_imgs[i].hist_gram_bins[j]);
        //       }
        //     }
        //   }
    
        //   for(var i=0;i<data_info.sample_imgs.length;++i){
        //     for(var j=0;j<data_info.sample_imgs[i].hist_gram_bins.length;++j){
        //       if(data_info.sample_imgs[i].hist_gram_bins[j] > 0){
        //         data_info.sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.sample_imgs[i].hist_gram_bins[j]);
        //       }
        //     }
        //   }
    
          $(".loading-div").hide(); // 隐藏加载提示
          console.log("display test data distribution...");
          display_data_bar_chart(class_labels, class_ratios, "测试数据集各类别分布",  "数据占比","类别", "占比", "bar_chart_testdata_container");
          console.log("test data distribution bar chart displayed.");
          console.log("Auto click first image....");
          document.getElementById("sample_img0").click();
          document.getElementById("test_sample_img0").click();
      });
    });
    
    
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
                    color:"#999999"
                    },
                    axisLabel:{
                    textStyle:{
                        color:"#999999"
                    },
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    }
            },
            yAxis: [
                {
                    type: 'value',
                    scale:true,
                    name:y_axis_name,
                    nameTextStyle:{
                    color:"#999999"
                    },
                    axisLabel:{
                    textStyle:{
                        color:"#999999"
                    },
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    }
                },
                {
                    type: 'value',
                    scale:true,
                    name:"",
                    show:false,
                    nameTextStyle:{
                    color:"#999999"
                    },
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    axisLabel:{
                    show:false,
                    textStyle:{
                        ccolor:"#999999"
                    },
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
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
exports.getSegDataVisPage = getSegDataVisPage;
function getSegSimulatePage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
    <div class="loading-div">
      <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;"></i>
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">仿真数据加载中...</font></span>
    </div>
  
      <div style="margin-top: 5px;display: block;">
  
          <div style="background: rgba(238,238,238,0.4);width: 400px;height: 380px;display: inline-block;">
            <div>
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">仿真配置结果评估</font></div>
              <table id="layer_conf_val" style="width: 320px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">统计指标</td>
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">指标值</td>
                  </tr>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">膜电位阈值</td>
                    <td id="simulate_vthresh" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">神经元时间步长</td>
                    <td id="simulate_neuron_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">突触时间步长</td>
                    <td id="simulate_synapse_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td  style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">延迟</td>
                    <td id="simulate_delay" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">仿真时长</td>
                    <td id="simulate_dura" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">准确率</td>
                    <td id="simulate_acc" style="color: #e71f1fe0;text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>    
              </table>
            </div>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 500px;height: 380px;display: inline-block;">
            <div style="text-align: center;margin-left: 40px;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">放电次数均值方差统计</font></div>
            <table id="snn_layers_spike_table" style="width: 420px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">层编号</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数均值</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数方差</td>
              </tr>
            </table>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 600px;height: 380px;display: inline-block;">
            <div>
              <div id="neurons_v_out_div" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">神经元放电</font></div>
              <div style="width: 360px;margin-left: 40px;margin-top: 20px;">
                <form class="form-horizontal" role="form">
                  <div class="form-group">
                    <label class="control-label col-md-8" for="select_which_layer"><font style="font-family: PingFangSC-Regular;font-weight: normal;
                      font-size: 16px;
                      color: #000000;
                      text-align: left;">选择神经元层</font></label>
                    <div class="col-md-4">
                      <select class="form-control" id="select_which_layer">
                        <option>输入层</option>
                        <option>输出层</option>
                    </select>
                    </div>
                  </div>
                </form>
              </div>
              <div id="neurons_v_chart" style="width: 540px;height: 320px;margin-left: 40px;margin-top: 20px;"></div>
            </div>
          </div>
      </div>
      <div style="margin-top: 5px;display: block;">
          <div style="display: inline-block;width: 760px;height: 460px;background: rgba(238,238,238,0.4);">
            <div id="model_input_spike_cap" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">脉冲神经网络输入层脉冲</font></div>
            <div id="input_spike_charts" style="width:660px;height: 400px;margin-left: 70px;display: inline-block;margin-top: 20px;"></div>
            <ul id="input_spike_sample_imgs_ul" style="height: 80px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 55px;margin-top: -40px;z-index: 2;">
            </ul>
          </div>
          <div style="width: 760px;height: 460px;display: inline-block;margin: left 20px;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络输出层脉冲</font></div>
              <span style="margin-left: 280px;font-family: SourceHanSansCN-Normal;
              font-size: 14px;
              color: #e71f1fe0;
              letter-spacing: 0.8px;">红色标记图像为输出层预测错误</span>
              <div id="model_layers_vis_tab_caption" style="text-align: center;background: rgba(238,238,238,1.00);border: solid 1px #D6D6D6;width: 460px;margin-left: 180px;"><font style="font-family: SourceHanSansCN-Medium;
                font-size: 14px;
                color: #666666;">统计计数</font></div>
              <table id="spike_out_count_table" style="margin-left: 180px;border: solid 3px #D6D6D6;color: #333;width: 460px;">
                  <tr id="out_labels" style="border: solid 2px #D6D6D6;">
                  </tr>
                  <tr id="out_counts_tr" style="border: solid 2px #D6D6D6;">
                  </tr>
              </table>
              <div id="spike_charts" style="width: 660px;height: 320px;margin-left: 70px;display: inline-block;"></div>
              <ul id="sample_imgs_ul" style="height: 90px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 80px;margin-top: -40px;z-index: 2;">
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
  
  .loading-div {
      width: calc(100vw);
      height: calc(100vh);
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
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  
  <script>
    const vscode = acquireVsCodeApi();
    let prev_clicked_li = undefined;
    let prev_clicked_input_li = undefined;
    let prev_clicked_img = undefined;
    let prev_clicked_input_img = undefined;
    let need_red_img_li = new Array();
  
        $(document).ready(function(){
          vscode.postMessage(JSON.stringify({"snn_simulate_ready":true}));
          console.log("SNN仿真Webview 界面ready.");
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
                      img_li.style.height = "50px";
                      img_li.style.marginRight = "20px";
                      var img_tag = document.createElement("img");
                      // img_tag.id = "sample_img_"+i;
                      img_tag.style.opacity = "0.5";
                      img_tag.style.display = "block";
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        console.log("current click cls_names="+test_img_spikes[i].cls_names);
                        console.log("current click spike tuples="+test_img_spikes[i].spike_tuples);
                        // if(prev_clicked_li !== undefined){
                        //   document.getElementById(prev_clicked_li).style.backgroundColor = "";
                        // }
                        // document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_li = "img_li_"+i;
                        if(prev_clicked_img !== undefined){
                          document.getElementById(prev_clicked_img).style.border = '';
                        }
                        prev_clicked_img = "img_"+i;
                        document.getElementById(prev_clicked_img).style.border = "10px outset orange";
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        console.log("start display counts in table....");
                        let num_classes = test_img_spikes[i].cls_names.length;
                        let curr_count=1;
                        let spike_counts = new Array();
                        if(test_img_spikes[i].spike_tuples.length === 0){
                          for(let k=0;k<num_classes;++k){
                            spike_counts.push(0);
                          }
                        }else{
                          let cls_idx = test_img_spikes[i].spike_tuples[0][0];
                          console.log("cls_idx="+cls_idx);
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
                        }
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "80px";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.innerText = "计数值:";
                        td_child.style.width = "80px";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          if(test_img_spikes[i].cls_names[j] === '1'){
                            td_child.innerText = '车辆';
                          }else{
                            td_child.innerText = "其他";
                          }
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_labels").appendChild(td_child);
                        }
                        console.log("check spike_counts of "+i+", ="+spike_counts);
                        // mark reds
                        for(let k=0;k<need_red_img_li.length;++k){
                          if(prev_clicked_li === need_red_img_li[k]){
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '10px outset orange';
                          }else{
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                            // document.getElementById(need_red_img_li[k]).style.border = '2px dashed red';
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '5px dashed red';
                          }
                        }
                      }
                      img_tag.src = test_img_uris[i];
                      img_tag.id = "img_"+i;
                      img_tag.style.width = "50px";
                      img_tag.style.height = "50px";
  
                      // let img_tag_mask = document.createElement("img");
                      // img_tag_mask.style = "opacity:0.5; display:block;width:50px; height:50px";
                      // img_tag_mask.id = "img_mask_"+i;
                      // img_tag_mask.src = test_img_uris[i].split(".").splice(0, test_img_uris[i].split(".").length-1).join(".")+"_mask.png";
                      // console.log("test image mask src="+test_img_uris[i].split(".").splice(0, test_img_uris[i].split(".").length-1).join(".")+"_mask.png");
  
                      var label_span = document.createElement("span");
                      label_span.style = "color: #333; font-family: SourceHanSansCN-Medium; font-size:10px;"
                      console.log("图片 i="+i+", uri="+test_img_uris[i]);
                      // a.split("/")[5].split("_")[4].split(".")[0]
                      // label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      if(test_img_uris[i].split("/")[5].split("_")[4].split(".")[0] === '1'){
                        label_span.innerText = "标签: 车辆";
                      }else{
                        label_span.innerText = "标签：其他";
                      }
  
                      img_li.appendChild(img_tag);
                      img_li.appendChild(label_span);
                      // img_li.appendChild(img_tag_mask);
                      test_img_uls.appendChild(img_li);
                    }
  
                    console.log("创建输入层脉冲激发图......");
                    // 创建输入层脉冲激发图
                    for(let i=0;i<infos.spikes.snn_input_spikes.length;++i){
                      var input_img_li = document.createElement("li");
                      input_img_li.style.listStyle = "none";
                      input_img_li.id = "inputimg_li_"+i;
                      input_img_li.style.width = "53px";
                      input_img_li.style.height = "50px";
                      input_img_li.style.display = "inline-block";
                      input_img_li.style.marginRight = "10px";
                      var input_img_tag = document.createElement("img");
                      input_img_tag.src = test_img_uris[i];
                      input_img_tag.id = "inputimg_"+i;
                      input_img_tag.style.width = "50px";
                      input_img_tag.style.height = "50px";
                      input_img_tag.style.opacity = "0.5";
                      input_img_tag.onclick = ()=>{
                        console.log("input spike display img idx "+i);
                        // if(prev_clicked_input_li !== undefined){
                        //   document.getElementById(prev_clicked_input_li).style.backgroundColor ="";
                        // }
                        // document.getElementById("input_img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_input_li = "inputimg_li_"+i;
                        if(prev_clicked_input_img !== undefined){
                          document.getElementById(prev_clicked_input_img).style.border = '';
                        }
                        prev_clicked_input_img = 'inputimg_'+i;
                        document.getElementById(prev_clicked_input_img).style.border = '10px outset orange';
                        console.log("Current cls_names="+infos.spikes.snn_input_spikes[i].cls_names);
                        console.log("Current spike data="+infos.spikes.snn_input_spikes[i].spike_tuples);
                        display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                      };
                      input_img_li.appendChild(input_img_tag);
                      document.getElementById("input_spike_sample_imgs_ul").appendChild(input_img_li);
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
                      "name":"脉冲激发次数最少的神经元膜电位"
                    });
                    data_series_input.push({
                      "data":v_vals[1],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[2],
                      "type": "line",
                      "smooth":true,
                      "name": "脉冲激发次数最少的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[3],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
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
                    console.log("填充表格数据.....");
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
                      td_id.style.fontFamily = 'ArialMT';
                      td_id.style.fontSize = '14px';
                      td_id.style.color = '#333333';
                      td_id.style.textAlign = 'right';
                      td_id.style.paddingRight = '15px';
                      td_id.style.textAlign = 'center';
                      td_id.style.border = "solid 2px #D6D6D6";
                      td_id.style.paddingTop = '12px';
                      td_id.style.paddingBottom = '12px';
                      td_id.innerText = ""+j;
                      table_line.appendChild(td_id);
  
                      let td_spike_avg = document.createElement("td");
                      td_spike_avg.style.fontFamily = 'ArialMT';
                      td_spike_avg.style.fontSize = '14px';
                      td_spike_avg.style.color = '#333333';
                      td_spike_avg.style.textAlign = 'right';
                      td_spike_avg.style.paddingRight = '15px';
                      td_spike_avg.style.order = "solid 2px #D6D6D6";
                      td_spike_avg.style.paddingTop = '12px';
                      td_spike_avg.style.paddingBottom = '12px';
                      td_spike_avg.innerText = infos.record_spike_out_info.spike_count_avgs[j];
                      table_line.appendChild(td_spike_avg);
  
                      let td_spike_std = document.createElement("td");
                      td_spike_std.style.fontFamily = 'ArialMT';
                      td_spike_std.style.fontSize = '14px';
                      td_spike_std.style.color = '#333333';
                      td_spike_std.style.textAlign = 'right';
                      td_spike_std.style.paddingRight = '15px';
                      td_spike_std.style.border = "solid 2px #D6D6D6";
                      td_spike_std.style.paddingTop = '12px';
                      td_spike_std.style.paddingBottom = '12px';
                      td_spike_std.innerText = infos.record_spike_out_info.spike_count_stds[j];
                      table_line.appendChild(td_spike_std);
  
                      document.getElementById("snn_layers_spike_table").appendChild(table_line);
                    }
                    console.log("Auto click first image.......");
                    document.getElementById("img_0").click();
                    document.getElementById("inputimg_0").click();
                    
                    $(".loading-div").hide(); // 隐藏加载提示
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                  data:["脉冲激发次数最少的神经元膜电位", "脉冲激发次数最多的神经元膜电位"],
                  textStyle:{
                    color:"#999999"
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
                      color:"#999999"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      }
                    }
                },
                yAxis: [
                  {
                      type: 'value',
                      scale:true,
                      name:"膜电位(左)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                      }
                  },
                  {
                    type: 'value',
                      scale:true,
                      name:"膜电位(右)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
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
exports.getSegSimulatePage = getSegSimulatePage;
function getANNSNNConvertSegPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: auto;white-space: nowrap;position: relative;">
  
      <div class="loading-div" id="loader_barchart" style="position: absolute;top: 400px;left: 50px;background: rgba(238,238,238);width: 600px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 240px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div class="loading-div" id="loader_tb" style="position: absolute;top: 400px;left: 740px;background: rgba(238,238,238);width: 720px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 300px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div style="height: 140px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div class="col-md-12">
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换参数配置</font></div>
              <form role="form" class="row" style="margin-left: 80px;margin-top: 15px;" id="project_info_form">
                  <div class="col-md-2" style="text-align: center;">
                      <label for="select_vthresh"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">脉冲发放阈值</font></label>
                      <select class="form-control" id="select_vthresh">
                          <option>44</option>
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
                          <option>21</option>
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
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">神经元dt</font></label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_synapse_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">突触dt</font></label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>0.1ms</option>
                          <option>1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_delay"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">delay</font></label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dura"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">总时间</font></label>
                      <select class="form-control" id="select_dura">
                          <option>100ms</option>
                          <option>200ms</option>
                          <option>500ms</option>
                      </select>
                  </div>
              </form>
          </div>
      </div>
  
  
      <div style="margin-top: 10px;height: 160px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div>
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换进度</font></div>
              <div class="row" style="margin-left: 30px;color: #333;">
                  <div class="col-md-2" style="text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">1</div>ANN转SNN</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">2</div>预处理</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
  
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">3</div>参数调优</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">4</div>DarwinLang文件生成</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="darlang_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              </div>
          
              <div class="row">
                  <!-- <span>启动</span> -->
                  <!-- <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i> -->
                  <div class="progress" style="width: 85%;display: inline-block;margin-bottom: 0;margin-left: 60px;background: #E6E6E6;
                  border-radius: 15px;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%; opacity: 0.76;
                           background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                           border-radius: 15px;">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      <div style="height: 560px; margin-top: 10px;width: 1500px;margin-left: -20px;">
          <div class="col-md-12">
              <!-- <div style="width: 350px;height: 560px;display: inline-block;vertical-align: top;white-space:normal;background: rgba(238,238,238,0.4);">
                  <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -20px;"><font style="color: #333;font-weight: bold;">日志输出</font></div>
                  <div id="log_output_div" style="margin-left: 20px;height: 340px; width: 300px; overflow: auto;margin-top: 60px;color: #333;">
                  </div>
              </div> -->
              <div style="width: 660px;height: 560px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);margin-left: 10px;">
                  <div style="text-align: center;margin-left: -40px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换性能分析</font></div>
                  <div id="use_time_bar_chart" style="width: 560px;height: 440px;margin-top: 15px;margin-left: 40px;"></div>
              </div>
              <div style="height:560px;margin-left: 10px;width: 820px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
                  <div id="model_layers_vis_tab_caption" style="text-align: center;margin-left: -20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换过程信息</font></div>
                  <table id="info_simu_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;color: #333;margin-left: 40px;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">转换指标统计</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">统计值</td>
                      </tr>
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">转换总耗时(秒)</td>
                          <td id="total_use_time" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">平均激发脉冲次数</td>
                          <td id="avg_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">激发脉冲次数方差</td>
                          <td id="std_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重均值</td>
                          <td id="avg_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重方差</td>
                          <td id="std_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">ANN转SNN耗时(秒)</td>
                          <td id="stage1_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">预处理耗时(秒)</td>
                          <td id="stage2_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">参数调优耗时(秒)</td>
                          <td id="stage3_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">DarwinLang文件生成耗时(秒)</td>
                          <td id="stage4_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                  </table>
                  <table id="scale_factors_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;border-spacing: 0px 5px;margin-left: 20px;color: #333;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">神经层</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">参数缩放系数</td>
                      </tr>
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
      src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.cnpmjs.org/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
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
  
  .loading-div {
      display: table-cell;
      vertical-align: middle;
      overflow: hidden;
      text-align: center;
  }
  .loading-div::before {
    display: inline-block;
    vertical-align: middle;
  } 
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
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
                  // $("#log_output_div").html(log_output_lists.join("<br/>"));
                  // document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight;
                  if(log_output_lists.length <= 158){
                      console.log("increase sub progress bar 1, style width="+""+parseInt(log_output_lists.length/158*100)+"%");
                          document.getElementById("model_convert_progress_div").style.width = ""+parseInt(log_output_lists.length/158*100)+"%";
                  }
                  if(stage1_convert_finish){
                      if(log_output_lists.length < 1145 && stage2_preprocess_finish !== true){
                          console.log("increase sub progress bar 2");
                              document.getElementById("preprocess_progress_div").style.width = ""+parseInt((log_output_lists.length-158)/(1145-158)*100)+"%";
                      }
                  }
                  if(stage2_preprocess_finish){
                      if(log_output_lists.length < 1247 && stage3_search_finish !== true){
                          console.log("increase sub progress bar 3");
                              document.getElementById("search_progress_div").style.width = ""+parseInt((log_output_lists.length-1145)/(1247-1145)*100)+"%";
                      }
                  }
                  if(stage3_search_finish){
                      if(log_output_lists.length < 1314 && stage4_all_finish !== true){
                          console.log("increase sub progress bar 4");
                              document.getElementById("darlang_progress_div").style.width = ""+parseInt((log_output_lists.length-1247)/(1314-1247)*100)+"%";
                      }
                  }
                  if(stage4_all_finish !== true){
                      console.log("increase sub progress bar total");
                      document.getElementById("total_progress_div").style.width = ""+parseInt(log_output_lists.length/1314*100)+"%";
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
                    $(".loading-div").hide();
                    stage4_all_finish = true;
                }else if(data.progress){
                    // 处理进度信息
                    if(data.progress === "convert_finish"){
                        console.log("TMP, convert finish, log length="+log_output_lists.length);
                        document.getElementById("model_convert_progress_div").style.width = "100%";
                        console.log("LINE COUNT convert_finish="+log_output_lists.length);
                        stage1_convert_finish = true;
                    }else if(data.progress === "preprocess_finish"){
                      console.log("TMP, preprocess finish, log length="+log_output_lists.length);
                        document.getElementById("preprocess_progress_div").style.width = "100%";
                        console.log("LINE COUNT preprocess_progress_div="+log_output_lists.length);
                        stage2_preprocess_finish = true;
                    }else if(data.progress === "search_finish"){
                      console.log("TMP, search finish, log length="+log_output_lists.length);
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
                    $("#total_use_time").text(convert_infos.total_use_time.replace("秒",""));
                    $("#avg_spike").text(convert_infos.spk_mean);
                    $("#std_spike").text(convert_infos.spk_std);
                    $("#avg_conn_wt").text(convert_infos.wt_mean);
                    $("#std_conn_wt").text(convert_infos.wt_std);
                    $("#stage1_time_use").text(convert_infos.stage1_time_use);
                    $("#stage2_time_use").text(convert_infos.stage2_time_use);
                    $("#stage3_time_use").text(convert_infos.stage3_time_use);
                    $("#stage4_time_use").text(convert_infos.stage4_time_use);
  
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
                      line_td1.style.border = "solid 2px #D6D6D6";
                      line_td1.style.paddingTop = '15px';
                      line_td1.style.paddingBottom = '15px';
                      line_td1.style.paddingLeft = '10px';
                      line_td1.style.paddingRight = '80px';
                      line_td1.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td1.style.fontSize = '14px';
                      line_td1.style.color = '#666666';
                      line_td1.innerHTML = ""+obj;
                      table_line.appendChild(line_td1);
                      let line_td2 = document.createElement("td");
                      line_td2.style.border = "solid 2px #D6D6D6";
                      line_td2.style.paddingTop = '15px';
                      line_td2.style.paddingBottom = '15px';
                      line_td2.style.paddingRight = '10px';
                      line_td2.style.paddingLeft = '80px';
                      line_td2.style.textAlign = 'right';
                      line_td2.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td2.style.fontSize = '14px';
                      line_td2.style.color = '#666666';
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
                          color:"#999999"
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '时长(秒)',
                      nameTextStyle:{
                          color:"#999999"
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"#999999"
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
                                      color:"#999999",
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
exports.getANNSNNConvertSegPage = getANNSNNConvertSegPage;


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSNNSimuSpeechPage = exports.getANNSNNConvertSpeechPage = exports.getSpeechClsDataPage = void 0;
function getSpeechClsDataPage() {
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
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
            <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
          </div>
    
          <!--展示的主面板-->
          <div class="row" style="height: 45%;width: 100%;">
              <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 50px;width: 700px;">
                <!-- 数据基本信息表格 -->
                <div style="text-align: center;color: #333;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">导入数据统计</font></div>
                <table id="data_general_table" style="width:500px; margin-left:75px;color: #333;margin-top: 30px;">
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                      <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                        font-size: 18px;
                        color: #333333;">指标</font></td>
                      <td style="background: #EEEEEE;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                        font-size: 18px;
                        color: #333333;">指标值</font></td>               
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">总数据量</font></td>
                    <td id="total_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">测试数据量</font></td>
                    <td id="test_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">验证数据量</font></td>
                    <td id="val_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                  <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      text-align: right;">数据类别</font></td>
                    <td id="class_counts" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                  </tr>
                </table>
              </div>
              <div class="col-md-5" style="background: rgba(238,238,238,0.4);height: 400px;margin-left: 15px;width: 760px;">
                <div style="text-align: center;margin-bottom:20px;color: #333;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">
                  数据类别分布
                </div>
                <div id="bar_chart_testdata_container" style="width: 700px;height: 400px;margin-left:20px;margin-top: -30px;"></div>
              </div>
          </div>
          <div class="row" style="height: 45%;width: 100%;margin-top:30px;">
            <div id="sample_data_div" class="col-md-5" style="height:410;width: 700px;background: rgba(238,238,238,0.4);margin-left: 50px;">
              <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">
                波形图
              </div>
              <div id="bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
              <ul id="sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 640px;overflow-x: auto;display: block;background: rgb(238,238,238);white-space: nowrap;">
              </ul>
            </div>
            <div id="sample_testdataset_data_div" class="col-md-5" style="height: 410px;width: 760px;background: rgba(238,238,238,0.4);margin-left: 15px;">
              <div style="text-align: center;margin-left:15px;color: black;font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">
                频谱图
              </div>
    
              <div id="test_bar_chart_histgram" style="width: 700px;height: 370px;margin-top: -20px;display: block;margin-bottom: 40px;"></div>
              <ul id="test_sample_imgs_ul" style="margin-top: -40px;height: 80px;width: 700px;overflow: auto;display: block;white-space: nowrap;">
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
          width: calc(100vw);
          height: calc(100vh);
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
    const vscode = acquireVsCodeApi();
    // var prev_click_img_li_id = undefined;
    // var prev_click_img_li_test_id = undefined;
    let prev_click_img_id = undefined;
    let prev_click_img_test_id = undefined;
    var data_info=undefined;
    $(document).ready(function(){
    
      // display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
      //       [0.098,0.1135,0.1032,0.101,0.0982,0.0892,0.0958,0.1028,0.0974,0.1009],"训练数据集各类别分布", "数据占比","pie_chart_container");
      // display_data_bar_chart(["0-28","28-56","56-85","85-113","113-141","141-170","170-198","198-226","226-255"],
      //         [639,8,7,1,19,18,8,9,79,0],"像素分布","该范围内像素点个数","bar_chart_histgram");
      // display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
      //   [0.098,0.101,0.1028,0.0974,0.1009,0.1135,0.0982,0.0892,0.0958,0.1032],"测试数据集各类别分布","数据占比","bar_chart_testdata_container")
        window.addEventListener("message", async(event)=>{
          if(event.data.audioBuf){
            let data = event.data;
            const audio_context = new AudioContext({sampleRate: data.audioBuf.sampleRate});
            console.log("音频采样率="+data.audioBuf.sampleRate);
            const audio_buffer = audio_context.createBuffer(data.audioBuf.numberOfChannels, data.audioBuf.length, data.audioBuf.sampleRate);
            for(var ch=0; ch < audio_buffer.numberOfChannels;++ch){
              const f32a = new Float32Array(audio_buffer.length);
              for(var i=0;i<audio_buffer.length;++i){
                f32a[i] = data.audioBuf._channelData[ch][i];
              }
              audio_buffer.copyToChannel(f32a, ch);
            }
            // play
            var source = audio_context.createBufferSource();
            source.buffer = audio_buffer;
            source.connect(audio_context.destination);
            source.start(audio_context.currentTime, 0);
            return;
          }
          const data = JSON.parse(event.data);
          data_info = data
          console.log("data vis webview receive data: "+data);
          $("#total_data_amount").text(data.total_data_count);
          $("#test_data_amount").text(data.norm_data_count);
          $("#val_data_amount").text(data.test_data_count);
          $("#class_counts").text(data.num_classes);
    
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
    
          $(".loading-div").hide(); // 隐藏加载提示
          console.log("display test data distribution...");
          display_data_bar_chart(class_labels, class_ratios, "测试数据集各类别分布",  "数据占比","类别", "占比", "bar_chart_testdata_container");
          console.log("test data distribution bar chart displayed.");
    
          let amp_uls = document.getElementById("sample_imgs_ul");
          // 显示波形图与频谱图
          for (let i=0;i< data.sample_imgs.length;++i) {
            let amp_img_li = document.createElement("li");
            amp_img_li.style = "list-style: none;display: inline-block;height: 60px;width: 70px;";
            amp_img_li.id = "sample_img"+i+"_li";
            amp_img_li.innerHTML = "<img id='sample_img"+i+"' onclick='sample_img_click(this);' src='http://localhost:6003/speech_cls/data_vis/test_sample_amp_"+i+".png' style='opacity:1.0; width: 50px; height:50px; margin-left:20px;'>\
                                    <div id='sample_label"+i+"' style='color: black;margin-left:15px;'>标签："+data.sample_imgs[i].label+"</div>";
            amp_uls.appendChild(amp_img_li);
          }
    
          let freq_uls = document.getElementById("test_sample_imgs_ul");
          for (let i=0;i<data.test_sample_imgs.length;++i){
            let freq_img_li = document.createElement("li");
            freq_img_li.style = "list-style: none;display: inline-block;height: 60px;width: 70px;";
            freq_img_li.id = "test_sample_img"+i+"_li";
            freq_img_li.innerHTML = "<img id='test_sample_img"+i+"' onclick='sample_img_click(this);' src='http://localhost:6003/speech_cls/data_vis/test_sample_freq_"+i+".png' style='opacity:1.0; width: 50px; height:50px; margin-left:20px;'>\
                                    <div id='test_sample_label'"+i+"' style='color:black;margin-left:15px;'>标签："+data.test_sample_imgs[i].label+"</div>";
            freq_uls.appendChild(freq_img_li);
          }
    
          // click first at beginning
          $("#sample_img0").click();
          $("#test_sample_img0").click();
      });
    });
    
    function sample_img_click(e){
      var sampleId = $(e).attr("id");
      if(sampleId.substring(0,4) === "test"){
        if(prev_click_img_test_id !== undefined){
          document.getElementById(prev_click_img_test_id).style.border = "";
        }
        console.log("点击目标："+sampleId+", 设置边框颜色...");
        prev_click_img_test_id = sampleId;
        let img_clicked = document.getElementById(prev_click_img_test_id);
        // document.getElementById(sampleId+"_li").removeChild(img_clicked);
        img_clicked.style.border = "10px outset red";
        // document.getElementById(sampleId+"_li").appendChild(img_clicked);
        // document.getElementById(sampleId+"_li").insertBefore(img_clicked, document.getElementById("test_sample_label"+sampleId.substr(15)))
        // document.getElementById(prev_click_img_test_id).style.border = "10px outset red;";
        // if(prev_click_img_li_test_id !== undefined){
        //   document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
        //   document.getElementById(prev_click_img_li_test_id).style.opacity = "";
        // }
        // prev_click_img_li_test_id = sampleId+"_li";
        // document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "#00868B";
        // document.getElementById(prev_click_img_li_test_id).style.opacity = "0.5";
      }else{
        if(prev_click_img_id !== undefined){
          document.getElementById(prev_click_img_id).style.border = "";
        }
        console.log("点击目标："+sampleId+", 设置边框颜色...");
        prev_click_img_id = sampleId;
        let img_clicked = document.getElementById(prev_click_img_id);
        // document.getElementById(sampleId+"_li").removeChild(img_clicked);
        img_clicked.style.border = "10px outset red";
        // document.getElementById(sampleId+"_li").appendChild(img_clicked);
        // document.getElementById(sampleId+"_li").insertBefore(img_clicked, document.getElementById("sample_label"+sampleId.substr(10)));
        // document.getElementById(prev_click_img_id).style.border = "10px outset red;";
        // if(prev_click_img_li_id !== undefined){
        //   document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
        //   document.getElementById(prev_click_img_li_id).style.opacity = "";
        // }
        // prev_click_img_li_id = sampleId+"_li";
        // document.getElementById(prev_click_img_li_id).style.backgroundColor = "#00868B";
        // document.getElementById(prev_click_img_li_id).style.opacity = "0.5";
      }
      console.log("current click img id="+sampleId);
      var sampleIdx = parseInt(sampleId.substring(sampleId.length-1));
      if(sampleId.substring(0,4) === "test"){
        let test_img_tag = document.createElement("img");
        test_img_tag.style = "width:640px; height:500px; margin-left:40px;"
        test_img_tag.src = "http://localhost:6003/speech_cls/data_vis/test_sample_freq_"+sampleId.substr(15)+".png";
        document.getElementById("test_bar_chart_histgram").innerHTML = "";
        document.getElementById("test_bar_chart_histgram").appendChild(test_img_tag);
        // var sound = webaudio.createSound();
        // sound.load("http://localhost:6003/speech_cls/audio/test_sample_audio_0.wav", function(sound){
        //   sound.loop(true).play();
        // });
        vscode.postMessage({"fetch_audio": "http://localhost:6003/speech_cls/audio/test_sample_audio_"+sampleId.substr(15)+".wav"});
        // display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量(log_10)", "test_bar_chart_histgram");
      }else{
        let test_img_tag = document.createElement("img");
        test_img_tag.style = "width:640px; height:500px; margin-left: 40px;"
        test_img_tag.src = "http://localhost:6003/speech_cls/data_vis/test_sample_amp_"+sampleId.substr(10)+".png";
        document.getElementById("bar_chart_histgram").innerHTML = "";
        document.getElementById("bar_chart_histgram").appendChild(test_img_tag);
        vscode.postMessage({"fetch_audio":  "http://localhost:6003/speech_cls/audio/test_sample_audio_"+sampleId.substr(10)+".wav"})
        // display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","区间","数量(log_10)", "bar_chart_histgram");
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        },
                        fontFamily: 'Helvetica',
                        fontSize: '12px',
                      }
                },
                yAxis: [
                    {
                      type: 'value',
                      scale:true,
                      name:y_axis_name,
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        },
                        fontFamily: 'Helvetica',
                        fontSize: '12px',
                      }
                    },
                    {
                      type: 'value',
                      scale:true,
                      name:"",
                      show:false,
                      nameTextStyle:{
                        color:"#999999"
                      },
                      fontFamily: 'Helvetica',
                      fontSize: '12px',
                      axisLabel:{
                        show:false,
                        textStyle:{
                          ccolor:"#999999"
                        },
                        fontFamily: 'Helvetica',
                        fontSize: '12px',
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
exports.getSpeechClsDataPage = getSpeechClsDataPage;
function getANNSNNConvertSpeechPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;overflow: auto;white-space: nowrap;position: relative;">
  
      <div class="loading-div" id="loader_barchart" style="position: absolute;top: 400px;left: 50px;background: rgba(238,238,238);width: 600px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 240px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div class="loading-div" id="loader_tb" style="position: absolute;top: 400px;left: 740px;background: rgba(238,238,238);width: 720px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 300px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换结束...</font></span>
      </div>
  
      <div style="height: 140px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div class="col-md-12">
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换参数配置</font></div>
              <form role="form" class="row" style="margin-left: 80px;margin-top: 15px;" id="project_info_form">
                  <div class="col-md-2" style="text-align: center;">
                      <label for="select_vthresh"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">脉冲发放阈值</font></label>
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
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">神经元dt</font></label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_synapse_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">突触dt</font></label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_delay"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">delay</font></label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 28px;text-align: center;">
                      <label for="select_dura"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">总时间</font></label>
                      <select class="form-control" id="select_dura">
                          <option>100ms</option>
                          <option>200ms</option>
                          <option>500ms</option>
                      </select>
                  </div>
              </form>
          </div>
      </div>
  
  
      <div style="margin-top: 10px;height: 160px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div>
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换进度</font></div>
              <div class="row" style="margin-left: 30px;color: #333;">
                  <div class="col-md-2" style="text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">1</div>ANN转SNN</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">2</div>预处理</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
  
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">3</div>参数调优</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: -10px;">
                      <i class="material-icons" style="font-size: 80px;transform: scaleX(2.0);-webkit-background-clip: text;-webkit-text-fill-color: transparent;background-image: linear-gradient(180deg, #FFA73C 50%, #FFDDA6 100%);">remove</i>
                  </div>
              
                  <div class="col-md-2" style="margin-left: -6px;text-align: center;">
                      <div style="font-family: SourceHanSansCN-Normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;"><div style="font-size: 2rem;
    width: 2rem;
    opacity: 0.5;
    background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;">4</div>DarwinLang文件生成</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 15px;">
                          <div id="darlang_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 15px;
                               border-radius: 15px;">
                          </div>
                      </div>
                  </div>
              </div>
          
              <div class="row">
                  <!-- <span>启动</span> -->
                  <!-- <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i> -->
                  <div class="progress" style="width: 85%;display: inline-block;margin-bottom: 0;margin-left: 60px;background: #E6E6E6;
                  border-radius: 15px;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%; opacity: 0.76;
                           background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                           border-radius: 15px;">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      <div style="height: 560px; margin-top: 10px;width: 1500px;margin-left: -20px;">
          <div class="col-md-12">
              <!-- <div style="width: 350px;height: 560px;display: inline-block;vertical-align: top;white-space:normal;background: rgba(238,238,238,0.4);">
                  <div style="font-size: large;font-weight: bold;text-align: center;margin-left: -20px;"><font style="color: #333;font-weight: bold;">日志输出</font></div>
                  <div id="log_output_div" style="margin-left: 20px;height: 340px; width: 300px; overflow: auto;margin-top: 60px;color: #333;">
                  </div>
              </div> -->
              <div style="width: 660px;height: 560px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);margin-left: 10px;">
                  <div style="text-align: center;margin-left: -40px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换性能分析</font></div>
                  <div id="use_time_bar_chart" style="width: 560px;height: 440px;margin-top: 15px;margin-left: 40px;"></div>
              </div>
              <div style="height:560px;margin-left: 10px;width: 820px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
                  <div id="model_layers_vis_tab_caption" style="text-align: center;margin-left: -20px;"><font style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">转换过程信息</font></div>
                  <table id="info_simu_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;color: #333;margin-left: 40px;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">转换指标统计</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">统计值</td>
                      </tr>
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">转换总耗时(秒)</td>
                          <td id="total_use_time" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">平均激发脉冲次数</td>
                          <td id="avg_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">激发脉冲次数方差</td>
                          <td id="std_spike" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重均值</td>
                          <td id="avg_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">连接权重方差</td>
                          <td id="std_conn_wt" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">ANN转SNN耗时(秒)</td>
                          <td id="stage1_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">预处理耗时(秒)</td>
                          <td id="stage2_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">参数调优耗时(秒)</td>
                          <td id="stage3_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">DarwinLang文件生成耗时(秒)</td>
                          <td id="stage4_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                  </table>
                  <table id="scale_factors_table" style="margin-right: auto;margin-top: 60px;display: inline-block;vertical-align: top;border-spacing: 0px 5px;margin-left: 20px;color: #333;">
                      <tr style="border: solid 2px #D6D6D6;">
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">神经层</td>
                          <td style="border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 16px;
                          color: #666666;">参数缩放系数</td>
                      </tr>
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
  
  /* progress {
    border-radius: 7px; 
    width: 80%;
    height: 22px;
    margin-left: -11.5%;
    box-shadow: 1px 1px 4px rgba( 0, 0, 0, 0.2 );
  }
  progress::-webkit-progress-bar {
      background: #E6E6E6;
      border-radius: 15px;
      border-radius: 15px;
  }
  progress::-webkit-progress-value {
      background-color: blue;
      opacity: 0.7;
      background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
      border-radius: 15px;
  } */
  
  
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
      src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.cnpmjs.org/s/materialicons/v7/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format('woff2');
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
  
  .loading-div {
      display: table-cell;
      vertical-align: middle;
      overflow: hidden;
      text-align: center;
  }
  .loading-div::before {
    display: inline-block;
    vertical-align: middle;
  } 
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
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
                  // $("#log_output_div").html(log_output_lists.join("<br/>"));
                  // document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight;
                  if(log_output_lists.length <= 159){
                      console.log("increase sub progress bar 1, style width="+""+parseInt(log_output_lists.length/159*100)+"%");
                          document.getElementById("model_convert_progress_div").style.width = ""+parseInt(log_output_lists.length/159*100)+"%";
                  }
                  if(stage1_convert_finish){
                      if(log_output_lists.length < 695 && stage2_preprocess_finish !== true){
                          console.log("increase sub progress bar 2");
                              document.getElementById("preprocess_progress_div").style.width = ""+parseInt((log_output_lists.length-159)/(695-159)*100)+"%";
                      }
                  }
                  if(stage2_preprocess_finish){
                      if(log_output_lists.length < 797 && stage3_search_finish !== true){
                          console.log("increase sub progress bar 3");
                              document.getElementById("search_progress_div").style.width = ""+parseInt((log_output_lists.length-695)/(797-695)*100)+"%";
                      }
                  }
                  if(stage3_search_finish){
                      if(log_output_lists.length < 865 && stage4_all_finish !== true){
                          console.log("increase sub progress bar 4");
                              document.getElementById("darlang_progress_div").style.width = ""+parseInt((log_output_lists.length-797)/(865-797)*100)+"%";
                      }
                  }
                  if(stage4_all_finish !== true){
                      console.log("increase sub progress bar total");
                      document.getElementById("total_progress_div").style.width = ""+parseInt(log_output_lists.length/865*100)+"%";
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
                    $(".loading-div").hide();
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
                    $("#total_use_time").text(convert_infos.total_use_time.replace("秒",""));
                    $("#avg_spike").text(convert_infos.spk_mean);
                    $("#std_spike").text(convert_infos.spk_std);
                    $("#avg_conn_wt").text(convert_infos.wt_mean);
                    $("#std_conn_wt").text(convert_infos.wt_std);
                    $("#stage1_time_use").text(convert_infos.stage1_time_use);
                    $("#stage2_time_use").text(convert_infos.stage2_time_use);
                    $("#stage3_time_use").text(convert_infos.stage3_time_use);
                    $("#stage4_time_use").text(convert_infos.stage4_time_use);
  
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
                      line_td1.style.border = "solid 2px #D6D6D6";
                      line_td1.style.paddingTop = '15px';
                      line_td1.style.paddingBottom = '15px';
                      line_td1.style.paddingLeft = '10px';
                      line_td1.style.paddingRight = '80px';
                      line_td1.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td1.style.fontSize = '14px';
                      line_td1.style.color = '#666666';
                      line_td1.innerHTML = ""+obj;
                      table_line.appendChild(line_td1);
                      let line_td2 = document.createElement("td");
                      line_td2.style.border = "solid 2px #D6D6D6";
                      line_td2.style.paddingTop = '15px';
                      line_td2.style.paddingBottom = '15px';
                      line_td2.style.paddingRight = '10px';
                      line_td2.style.paddingLeft = '80px';
                      line_td2.style.textAlign = 'right';
                      line_td2.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td2.style.fontSize = '14px';
                      line_td2.style.color = '#666666';
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
                          color:"#999999"
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '时长(秒)',
                      nameTextStyle:{
                          color:"#999999"
                      },
                      scale:true,
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                              color:"#999999"
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
                                      color:"#999999",
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
exports.getANNSNNConvertSpeechPage = getANNSNNConvertSpeechPage;
function getSNNSimuSpeechPage() {
    return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
    <div class="loading-div">
      <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i>
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);display: block;"><font style="color: #333;font-weight: bolder;">仿真数据加载中...</font></span>
    </div>
  
      <div style="margin-top: 5px;display: block;">
  
          <div style="background: rgba(238,238,238,0.4);width: 400px;height: 380px;display: inline-block;">
            <div>
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">仿真配置结果评估</font></div>
              <table id="layer_conf_val" style="width: 320px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">统计指标</td>
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">指标值</td>
                  </tr>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">膜电位阈值</td>
                    <td id="simulate_vthresh" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">神经元时间步长</td>
                    <td id="simulate_neuron_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">突触时间步长</td>
                    <td id="simulate_synapse_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td  style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">延迟</td>
                    <td id="simulate_delay" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">仿真时长</td>
                    <td id="simulate_dura" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">准确率</td>
                    <td id="simulate_acc" style="color: #e71f1fe0;text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>    
              </table>
            </div>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 500px;height: 380px;display: inline-block;">
            <div style="text-align: center;margin-left: 40px;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">放电次数均值方差统计</font></div>
            <table id="snn_layers_spike_table" style="width: 420px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">层编号</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数均值</td>
                <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                font-size: 16px;
                color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数方差</td>
              </tr>
            </table>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 600px;height: 380px;display: inline-block;">
            <div>
              <div id="neurons_v_out_div" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">神经元放电</font></div>
              <div style="width: 360px;margin-left: 40px;margin-top: 20px;">
                <form class="form-horizontal" role="form">
                  <div class="form-group">
                    <label class="control-label col-md-8" for="select_which_layer"><font style="font-family: PingFangSC-Regular;font-weight: normal;
                      font-size: 16px;
                      color: #000000;
                      text-align: left;">选择神经元层</font></label>
                    <div class="col-md-4">
                      <select class="form-control" id="select_which_layer">
                        <option>输入层</option>
                        <option>输出层</option>
                    </select>
                    </div>
                  </div>
                </form>
              </div>
              <div id="neurons_v_chart" style="width: 540px;height: 320px;margin-left: 40px;margin-top: 20px;"></div>
            </div>
          </div>
      </div>
      <div style="margin-top: 5px;display: block;">
          <div style="display: inline-block;width: 760px;height: 460px;background: rgba(238,238,238,0.4);">
            <div id="model_input_spike_cap" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">脉冲神经网络输入层脉冲</font></div>
            <div id="input_spike_charts" style="width:660px;height: 400px;margin-left: 70px;display: inline-block;margin-top: 20px;"></div>
            <ul id="input_spike_sample_imgs_ul" style="height: 90px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 55px;margin-top: -40px;z-index: 2;">
            </ul>
          </div>
          <div style="width: 760px;height: 460px;display: inline-block;margin: left 20px;vertical-align: top;background: rgba(238,238,238,0.4);">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">脉冲神经网络输出层脉冲</font></div>
              <span style="margin-left: 280px;font-family: SourceHanSansCN-Normal;
              font-size: 14px;
              color: #e71f1fe0;
              letter-spacing: 0.8px;">红色标记图像为输出层预测错误</span>
              <div id="model_layers_vis_tab_caption" style="text-align: center;background: rgba(238,238,238,1.00);border: solid 1px #D6D6D6;width: 460px;margin-left: 180px;"><font style="font-family: SourceHanSansCN-Medium;
                font-size: 14px;
                color: #666666;">统计计数</font></div>
              <table id="spike_out_count_table" style="margin-left: 180px;border: solid 3px #D6D6D6;color: #333;width: 460px;">
                  <tr id="out_labels" style="border: solid 2px #D6D6D6;">
                  </tr>
                  <tr id="out_counts_tr" style="border: solid 2px #D6D6D6;">
                  </tr>
              </table>
              <div id="spike_charts" style="width: 660px;height: 320px;margin-left: 70px;display: inline-block;"></div>
              <ul id="sample_imgs_ul" style="height: 90px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 80px;margin-top: -40px;z-index: 2;">
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
  
  .loading-div {
      width: calc(100vw);
      height: calc(100vh);
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
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.staticfile.org/echarts/5.0.1/echarts.min.js"></script>
  
  <script>
    const vscode = acquireVsCodeApi();
    let prev_clicked_li = undefined;
    let prev_clicked_input_li = undefined;
    let prev_clicked_img = undefined;
    let prev_clicked_input_img = undefined;
    let need_red_img_li = new Array();
  
        $(document).ready(function(){
          vscode.postMessage(JSON.stringify({"snn_simulate_ready":true}));
          console.log("SNN仿真Webview 界面ready.");
            window.addEventListener("message", function(evt){
              console.log("SNN 仿真接收到extension 消息");
              need_red_img_li.splice(0);
                const data = JSON.parse(evt.data);
                if(data.snn_info){
                    var infos =JSON.parse(data.snn_info);
                    var sample_audio_info = JSON.parse(data.sample_audio);
                    console.log("SNN Speech simulate page, sample_audio_info="+sample_audio_info+", sample img0="+sample_audio_info.sample_imgs[0].label);
                    var test_img_uls = document.getElementById("sample_imgs_ul");
                    var test_img_uris = infos.spikes.snn_test_imgs;
                    var test_img_spikes = infos.spikes.snn_test_spikes;
                    console.log("spiking img uris[0]"+test_img_uris[0]);
                    console.log("spiking spike infos[0]="+test_img_spikes[0].cls_names);
                    console.log("spike tuples[0]="+test_img_spikes[0].spike_tuples);
  
                    calc_need_red(test_img_spikes, test_img_uris,sample_audio_info);
                    console.log("call calc_need_red function finish, start for img uris...");
                    for(let i=0;i<Math.min(test_img_uris.length, 20);++i){
                      var img_li = document.createElement("li");
                      img_li.style.listStyle = "none";
                      img_li.style.display = "inline-block";
                      img_li.id = "img_li_"+i;
                      img_li.style.width = "53px";
                      img_li.style.height = "80px";
                      img_li.style.marginRight = "20px";
                      var img_tag = document.createElement("img");
                      // img_tag.id = "sample_img_"+i;
                      img_tag.style.opacity = "0.5";
                      img_tag.style.display = "block";
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        console.log("current click cls_names="+test_img_spikes[i].cls_names);
                        console.log("current click spike tuples="+test_img_spikes[i].spike_tuples);
                        // request audio
                        vscode.postMessage(JSON.stringify({"fetch_audio": "http://localhost:6003/speech_cls/audio/test_sample_audio_"+i+".wav"}));
  
                        // if(prev_clicked_li !== undefined){
                        //   document.getElementById(prev_clicked_li).style.backgroundColor = "";
                        // }
                        // document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_li = "img_li_"+i;
                        if(prev_clicked_img !== undefined){
                          document.getElementById(prev_clicked_img).style.border = '';
                        }
                        prev_clicked_img = "img_"+i;
                        document.getElementById(prev_clicked_img).style.border = "10px outset orange";
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        console.log("start display counts in table....");
                        let num_classes = test_img_spikes[i].cls_names.length;
                        let curr_count=1;
                        let spike_counts = new Array();
                        if(test_img_spikes[i].spike_tuples.length === 0){
                          for(let k=0;k<num_classes;++k){
                            spike_counts.push(0);
                          }
                        }else{
                          let cls_idx = test_img_spikes[i].spike_tuples[0][0];
                          console.log("cls_idx="+cls_idx);
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
                        }
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "80px";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.style.backgroundColor = "#EEEEEE";
                        td_child.style.border = "solid 2px #D6D6D6";
                        td_child.style.fontFamily = 'PingFangSC-Regular';
                        td_child.style.fontSize = '14px';
                        td_child.style.color = '#333333';
                        td_child.innerText = "计数值:";
                        td_child.style.width = "80px";
                        td_child.style.paddingLeft = '5px';
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          td_child.innerText = test_img_spikes[i].cls_names[j];
                          td_child.style.width = "33px";
                          td_child.style.border = "solid 2px #D6D6D6";
                          td_child.style.fontFamily = 'PingFangSC-Regular';
                          td_child.style.fontSize = '14px';
                          td_child.style.color = '#333333';
                          td_child.style.textAlign = 'right';
                          td_child.style.paddingRight = '5px';
                          document.getElementById("out_labels").appendChild(td_child);
                        }
  
                        console.log("check spike_counts of "+i+", ="+spike_counts);
                        // mark reds
                        for(let k=0;k<need_red_img_li.length;++k){
                          if(prev_clicked_li === need_red_img_li[k]){
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '10px outset orange';
                          }else{
                            // document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                            // document.getElementById(need_red_img_li[k]).style.border = '2px dashed red';
                            document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '5px dashed red';
                          }
                        }
                      }
                      // img_tag.src = test_img_uris[i];
                      img_tag.src = "http://localhost:6003/speech_cls/data_vis/test_sample_amp_"+i+".png";
                      img_tag.id = "img_"+i;
                      img_tag.style.width = "50px";
                      img_tag.style.height = "50px";
  
                      img_li.appendChild(img_tag);
                      test_img_uls.appendChild(img_li);
  
                      // // mark reds
                      // for(let k=0;k<need_red_img_li.length;++k){
                      //   if(prev_clicked_li === need_red_img_li[k]){
                      //     // document.getElementById(need_red_img_li[k]).style.backgroundColor = "yellow";  
                      //     document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '10px outset orange';
                      //   }else{
                      //     // document.getElementById(need_red_img_li[k]).style.backgroundColor = "red";
                      //     // document.getElementById(need_red_img_li[k]).style.border = '2px dashed red';
                      //     document.getElementById(need_red_img_li[k].split('_')[0]+'_'+need_red_img_li[k].split('_')[2]).style.border = '5px dashed red';
                      //   }
                      // }
  
                      var label_span = document.createElement("span");
                      label_span.style.color = "#333";
                      label_span.style.height='14px';
                      console.log("图片 i="+i+", uri="+test_img_uris[i]);
                      // a.split("/")[5].split("_")[4].split(".")[0]
                      // label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      // label_span.innerText = "标签: "+test_img_uris[i].split("/")[5].split("_")[4].split(".")[0];
                      label_span.innerText = "标签："+sample_audio_info.sample_imgs[i].label;
                      img_li.appendChild(label_span);
                    }
  
                    console.log("创建输入层脉冲激发图......");
                    // 创建输入层脉冲激发图
                    for(let i=0;i<Math.min(infos.spikes.snn_input_spikes.length, 20);++i){
                      var input_img_li = document.createElement("li");
                      input_img_li.style.listStyle = "none";
                      input_img_li.id = "inputimg_li_"+i;
                      input_img_li.style.width = "53px";
                      input_img_li.style.height = "50";
                      input_img_li.style.display = "inline-block";
                      input_img_li.style.marginRight = "10px";
                      var input_img_tag = document.createElement("img");
                      // input_img_tag.src = test_img_uris[i];
                      input_img_tag.src = "http://localhost:6003/speech_cls/data_vis/test_sample_amp_"+i+".png";
                      input_img_tag.id = "inputimg_"+i;
                      input_img_tag.style.width = "50px";
                      input_img_tag.style.height = "50px";
                      input_img_tag.style.opacity = "0.5";
                      input_img_tag.onclick = ()=>{
                        console.log("input spike display img idx "+i);
                        // request for audio
                        vscode.postMessage(JSON.stringify({"fetch_audio": "http://localhost:6003/speech_cls/audio/test_sample_audio_"+i+".wav"}));
  
                        // if(prev_clicked_input_li !== undefined){
                        //   document.getElementById(prev_clicked_input_li).style.backgroundColor ="";
                        // }
                        // document.getElementById("input_img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_input_li = "inputimg_li_"+i;
                        if(prev_clicked_input_img !== undefined){
                          document.getElementById(prev_clicked_input_img).style.border = '';
                        }
                        prev_clicked_input_img = 'inputimg_'+i;
                        document.getElementById(prev_clicked_input_img).style.border = '10px outset orange';
                        console.log("Current cls_names="+infos.spikes.snn_input_spikes[i].cls_names);
                        console.log("Current spike data="+infos.spikes.snn_input_spikes[i].spike_tuples);
                        display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                      };
                      input_img_li.appendChild(input_img_tag);
                      document.getElementById("input_spike_sample_imgs_ul").appendChild(input_img_li);
  
                      var label_span = document.createElement("span");
                      label_span.style.color = "#333";
                      label_span.style.height='14px';
                      label_span.style.display = "block";
                      label_span.innerText = "标签："+sample_audio_info.sample_imgs[i].label;
                      input_img_li.appendChild(label_span);
  
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
  
                    console.log("标记错误样例数据.....");
                    // mark reds
                    for(let i=0;i<need_red_img_li.length;++i){
                      console.log("当前检测：prev_clicked_li="+prev_clicked_li+", target="+need_red_img_li[i].split("_")[0]+'_'+need_red_img_li[i].split('_')[2]);
                      if(prev_clicked_li === need_red_img_li[i]){
                        // document.getElementById(need_red_img_li[i]).style.backgroundColor = "yellow";  
                        document.getElementById(need_red_img_li[i].split("_")[0]+'_'+need_red_img_li[i].split('_')[2]).style.border = '10px outset orange';
                      }else{
                        // document.getElementById(need_red_img_li[i]).style.backgroundColor = "red";
                        document.getElementById(need_red_img_li[i].split('_')[0]+'_'+need_red_img_li[i].split('_')[2]).style.border = '5px dashed red';
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
                      "name":"脉冲激发次数最少的神经元膜电位"
                    });
                    data_series_input.push({
                      "data":v_vals[1],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[2],
                      "type": "line",
                      "smooth":true,
                      "name": "脉冲激发次数最少的神经元膜电位"
                    });
  
                    data_series_output.push({
                      "data": v_vals[3],
                      "type":"line",
                      "smooth":true,
                      "yAxisIndex":1,
                      "name":"脉冲激发次数最多的神经元膜电位"
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
                    console.log("填充表格数据.....");
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
                      td_id.style.fontFamily = 'ArialMT';
                      td_id.style.fontSize = '14px';
                      td_id.style.color = '#333333';
                      td_id.style.textAlign = 'right';
                      td_id.style.paddingRight = '15px';
                      td_id.style.textAlign = 'center';
                      td_id.style.border = "solid 2px #D6D6D6";
                      td_id.style.paddingTop = '12px';
                      td_id.style.paddingBottom = '12px';
                      td_id.innerText = ""+j;
                      table_line.appendChild(td_id);
  
                      let td_spike_avg = document.createElement("td");
                      td_spike_avg.style.fontFamily = 'ArialMT';
                      td_spike_avg.style.fontSize = '14px';
                      td_spike_avg.style.color = '#333333';
                      td_spike_avg.style.textAlign = 'right';
                      td_spike_avg.style.paddingRight = '15px';
                      td_spike_avg.style.order = "solid 2px #D6D6D6";
                      td_spike_avg.style.paddingTop = '12px';
                      td_spike_avg.style.paddingBottom = '12px';
                      td_spike_avg.innerText = infos.record_spike_out_info.spike_count_avgs[j];
                      table_line.appendChild(td_spike_avg);
  
                      let td_spike_std = document.createElement("td");
                      td_spike_std.style.fontFamily = 'ArialMT';
                      td_spike_std.style.fontSize = '14px';
                      td_spike_std.style.color = '#333333';
                      td_spike_std.style.textAlign = 'right';
                      td_spike_std.style.paddingRight = '15px';
                      td_spike_std.style.border = "solid 2px #D6D6D6";
                      td_spike_std.style.paddingTop = '12px';
                      td_spike_std.style.paddingBottom = '12px';
                      td_spike_std.innerText = infos.record_spike_out_info.spike_count_stds[j];
                      table_line.appendChild(td_spike_std);
  
                      document.getElementById("snn_layers_spike_table").appendChild(table_line);
                    }
                    console.log("Auto click first image.......");
                    document.getElementById("img_0").click();
                    document.getElementById("inputimg_0").click();
                    
                    $(".loading-div").hide(); // 隐藏加载提示
                }else if(data.audioBuf){
                  const audio_context = new AudioContext({sampleRate:data.audioBuf.sampleRate});
                  console.log("音频采样率="+data.audioBuf.sampleRate);
                  const audio_buffer = audio_context.createBuffer(data.audioBuf.numberOfChannels, data.audioBuf.length, data.audioBuf.sampleRate);
                  for(let ch=0; ch < audio_buffer.numberOfChannels;++ch) {
                    const f32a = new Float32Array(audio_buffer.length);
                    for (let i=0;i < audio_buffer.length;++i){
                      f32a[i] = data.audioBuf._channelData[ch][i];
                    }
                    audio_buffer.copyToChannel(f32a, ch);
                  }
                  let source = audio_context.createBufferSource();
                  source.buffer = audio_buffer;
                  source.connect(audio_context.destination);
                  source.start(audio_context.currentTime, 0);
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
  
        function calc_need_red(test_img_spikes, test_img_uris, sample_audio_info){
          // label_span.innerText = "标签: "+test_img_uris[i].split("/")[5].split("_")[4].split(".")[0];
          for(let i=0;i<Math.min(test_img_spikes.length, 20);++i){
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
            var img_label = sample_audio_info.sample_imgs[i].label;
            if(parseInt(img_label) !== my_argmax(spike_counts)){
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                     }
                  },
                  yAxis: {
                      type: 'value',
                      scale:true,
                      name:"时间(brian2 ms)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
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
                  data:["脉冲激发次数最少的神经元膜电位", "脉冲激发次数最多的神经元膜电位"],
                  textStyle:{
                    color:"#999999"
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
                      color:"#999999"
                    },
                    axisLabel:{
                      textStyle:{
                        color:"#999999"
                      }
                    }
                },
                yAxis: [
                  {
                      type: 'value',
                      scale:true,
                      name:"膜电位(左)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
                        }
                      }
                  },
                  {
                    type: 'value',
                      scale:true,
                      name:"膜电位(右)",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel:{
                        textStyle:{
                          color:"#999999"
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
exports.getSNNSimuSpeechPage = getSNNSimuSpeechPage;


/***/ }),
/* 55 */
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),
/* 56 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Web-Audio-API decoder
 *
 * @module  audio-decode
 */


const getType = __webpack_require__(57);
const WavDecoder = __webpack_require__(63);
const createBuffer = __webpack_require__(64);
const toArrayBuffer = __webpack_require__(79)
const toBuffer = __webpack_require__(82)
const isBuffer = __webpack_require__(70);
const AV = __webpack_require__(84);
__webpack_require__(114);

module.exports = (buffer, opts, cb) => {
	if (opts instanceof Function) {
		cb = opts;
		opts = {};
	}

	if (!opts) opts = {};
	if (!cb) cb = (() => {});

	if (!isBuffer(buffer)) {
		if (ArrayBuffer.isView(buffer)) buffer = toBuffer(buffer)
		else {
			buffer = Buffer.from(toArrayBuffer(buffer));
		}
	}

	let type = getType(buffer);

	if (!type) {
		let err = Error('Cannot detect audio format of buffer');
		cb(err);
		return Promise.reject(err);
	}

	// direct wav decoder
	if (type === 'wav') {
		return WavDecoder.decode(buffer).then(audioData => {
			let audioBuffer = createBuffer(audioData.channelData, {
				channels: audioData.numberOfChannels,
				sampleRate: audioData.sampleRate
			});
			cb(null, audioBuffer);
			return Promise.resolve(audioBuffer);
		}, err => {
			cb(err);
			return Promise.reject(err);
		});
	}

	// ogg decoder
	/*
	if (type === 'ogg' || type === 'oga' || type === 'ogv') {
		let decoder = new ogg.Decoder();

		decoder.on('stream', function (stream) {
			stream.on('packet', function (packet) {
				console.log('got "packet":', packet.length);
			});

			// emitted after the last packet of the stream
			stream.on('end', function () {
				console.log('got "end":', decoder[191]);
			});
		});

		decoder.write(buffer)
	}
	*/

	//handle other codecs by AV
	return new Promise((resolve, reject) => {
		let asset = AV.Asset.fromBuffer(buffer);

		asset.on('error', err => {
			cb(err)
			reject(err)
		})

		asset.decodeToBuffer((buffer) => {
			let data = createBuffer(buffer, {
				channels: asset.format.channelsPerFrame,
				sampleRate: asset.format.sampleRate
			})
			cb(null, data);
			resolve(data)
		});
	});
};


/***/ }),
/* 57 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = function (buf) {
	if (!buf) {
		return false;
	}

	if (__webpack_require__(58)(buf)) {
		return 'mp3';
	}

	if (__webpack_require__(59)(buf)) {
		return 'wav';
	}

	if (__webpack_require__(60)(buf)) {
		return 'oga';
	}

	if (__webpack_require__(61)(buf)) {
		return 'flac';
	}

	if (__webpack_require__(62)(buf)) {
		return 'm4a';
	}

	return false;
};


/***/ }),
/* 58 */
/***/ ((module) => {

"use strict";

module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return (buf[0] === 73 &&
		buf[1] === 68 &&
		buf[2] === 51) || ( 
      buf[0] === 255 &&
      (buf[1] === 251 || buf[1] === 250)
    );
  
};


/***/ }),
/* 59 */
/***/ ((module) => {

"use strict";

module.exports = function (buf) {
	if (!buf || buf.length < 12) {
		return false;
	}

	return buf[0] === 82 &&
		buf[1] === 73 &&
		buf[2] === 70 &&
		buf[3] === 70 &&
		buf[8] === 87 &&
		buf[9] === 65 &&
		buf[10] === 86 &&
		buf[11] === 69;
};


/***/ }),
/* 60 */
/***/ ((module) => {

"use strict";

module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return  buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
                buf[3] === 83;
};


/***/ }),
/* 61 */
/***/ ((module) => {

"use strict";

module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return buf[0] === 102 &&
  buf[1] === 76 &&
  buf[2] === 97 &&
  buf[3] === 67; 
};


/***/ }),
/* 62 */
/***/ ((module) => {

"use strict";

module.exports = function (buf) {
	if (!buf || buf.length < 8) {
		return false;
	}

	return (buf[4] === 102 &&
		buf[5] === 116 &&
		buf[6] === 121 &&
		buf[7] === 112) || (
      buf[0] === 77 &&
      buf[1] === 52 &&
      buf[2] === 65 &&
      buf[3] === 32
    );
};


/***/ }),
/* 63 */
/***/ ((module) => {

"use strict";


var formats = {
  0x0001: "lpcm",
  0x0003: "lpcm"
};

function decodeSync(buffer, opts) {
  opts = opts || {};

  if (global.Buffer && buffer instanceof global.Buffer) {
    buffer = Uint8Array.from(buffer).buffer;
  }

  var dataView = new DataView(buffer);
  var reader = createReader(dataView);

  if (reader.string(4) !== "RIFF") {
    throw new TypeError("Invalid WAV file");
  }

  reader.uint32(); // skip file length

  if (reader.string(4) !== "WAVE") {
    throw new TypeError("Invalid WAV file");
  }

  var format = null;
  var audioData = null;

  do {
    var chunkType = reader.string(4);
    var chunkSize = reader.uint32();

    switch (chunkType) {
    case "fmt ":
      format = decodeFormat(reader, chunkSize);
      if (format instanceof Error) {
        throw format;
      }
      break;
    case "data":
      audioData = decodeData(reader, chunkSize, format, opts);
      if (audioData instanceof Error) {
        throw audioData;
      }
      break;
    default:
      reader.skip(chunkSize);
      break;
    }
  } while (audioData === null);

  return audioData;
}

function decode(buffer, opts) {
  return new Promise(function(resolve) {
    resolve(decodeSync(buffer, opts));
  });
}

function decodeFormat(reader, chunkSize) {
  var formatId = reader.uint16();

  if (!formats.hasOwnProperty(formatId)) {
    return new TypeError("Unsupported format in WAV file: 0x" + formatId.toString(16));
  }

  var format = {
    formatId: formatId,
    floatingPoint: formatId === 0x0003,
    numberOfChannels: reader.uint16(),
    sampleRate: reader.uint32(),
    byteRate: reader.uint32(),
    blockSize: reader.uint16(),
    bitDepth: reader.uint16()
  };
  reader.skip(chunkSize - 16);

  return format;
}

function decodeData(reader, chunkSize, format, opts) {
  chunkSize = Math.min(chunkSize, reader.remain());

  var length = Math.floor(chunkSize / format.blockSize);
  var numberOfChannels = format.numberOfChannels;
  var sampleRate = format.sampleRate;
  var channelData = new Array(numberOfChannels);

  for (var ch = 0; ch < numberOfChannels; ch++) {
    channelData[ch] = new Float32Array(length);
  }

  var retVal = readPCM(reader, channelData, length, format, opts);

  if (retVal instanceof Error) {
    return retVal;
  }

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

function readPCM(reader, channelData, length, format, opts) {
  var bitDepth = format.bitDepth;
  var decoderOption = format.floatingPoint ? "f" : opts.symmetric ? "s" : "";
  var methodName = "pcm" + bitDepth + decoderOption;

  if (!reader[methodName]) {
    return new TypeError("Not supported bit depth: " + format.bitDepth);
  }

  var read = reader[methodName].bind(reader);
  var numberOfChannels = format.numberOfChannels;

  for (var i = 0; i < length; i++) {
    for (var ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch][i] = read();
    }
  }

  return null;
}

function createReader(dataView) {
  var pos = 0;

  return {
    remain: function() {
      return dataView.byteLength - pos;
    },
    skip: function(n) {
      pos += n;
    },
    uint8: function() {
      var data = dataView.getUint8(pos, true);

      pos += 1;

      return data;
    },
    int16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data;
    },
    uint16: function() {
      var data = dataView.getUint16(pos, true);

      pos += 2;

      return data;
    },
    uint32: function() {
      var data = dataView.getUint32(pos, true);

      pos += 4;

      return data;
    },
    string: function(n) {
      var data = "";

      for (var i = 0; i < n; i++) {
        data += String.fromCharCode(this.uint8());
      }

      return data;
    },
    pcm8: function() {
      var data = dataView.getUint8(pos) - 128;

      pos += 1;

      return data < 0 ? data / 128 : data / 127;
    },
    pcm8s: function() {
      var data = dataView.getUint8(pos) - 127.5;

      pos += 1;

      return data / 127.5;
    },
    pcm16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data < 0 ? data / 32768 : data / 32767;
    },
    pcm16s: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data / 32768;
    },
    pcm24: function() {
      var x0 = dataView.getUint8(pos + 0);
      var x1 = dataView.getUint8(pos + 1);
      var x2 = dataView.getUint8(pos + 2);
      var xx = (x0 + (x1 << 8) + (x2 << 16));
      var data = xx > 0x800000 ? xx - 0x1000000 : xx;

      pos += 3;

      return data < 0 ? data / 8388608 : data / 8388607;
    },
    pcm24s: function() {
      var x0 = dataView.getUint8(pos + 0);
      var x1 = dataView.getUint8(pos + 1);
      var x2 = dataView.getUint8(pos + 2);
      var xx = (x0 + (x1 << 8) + (x2 << 16));
      var data = xx > 0x800000 ? xx - 0x1000000 : xx;

      pos += 3;

      return data / 8388608;
    },
    pcm32: function() {
      var data = dataView.getInt32(pos, true);

      pos += 4;

      return data < 0 ? data / 2147483648 : data / 2147483647;
    },
    pcm32s: function() {
      var data = dataView.getInt32(pos, true);

      pos += 4;

      return data / 2147483648;
    },
    pcm32f: function() {
      var data = dataView.getFloat32(pos, true);

      pos += 4;

      return data;
    },
    pcm64f: function() {
      var data = dataView.getFloat64(pos, true);

      pos += 8;

      return data;
    }
  };
}

module.exports.decode = decode;
module.exports.decode.sync = decodeSync;


/***/ }),
/* 64 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * @module  audio-dtype
 */



var AudioBuffer = __webpack_require__(65)
var isAudioBuffer = __webpack_require__(67)
var isObj = __webpack_require__(68)
var getContext = __webpack_require__(66)
var convert = __webpack_require__(69)
var format = __webpack_require__(71)
var str2ab = __webpack_require__(76)
var pick = __webpack_require__(74)

module.exports = function createBuffer (source, options) {
	var length, data, channels, sampleRate, format, c, l

	//src, channels
	if (typeof options === 'number') {
		options = {channels: options}
	}
	else if (typeof options === 'string') {
		options = {format: options}
	}
	//{}
	else if (options === undefined) {
		if (isObj(source)) {
			options = source
			source = undefined
		}
		else {
			options = {}
		}
	}

	options = pick(options, {
		format: 'format type dtype dataType',
		channels: 'channel channels numberOfChannels channelCount',
		sampleRate: 'sampleRate rate',
		length: 'length size',
		duration: 'duration time'
	})

	//detect options
	channels = options.channels
	sampleRate = options.sampleRate
	if (options.format) format = getFormat(options.format)

	if (format) {
		if (channels && !format.channels) format.channels = channels
		else if (format.channels && !channels) channels = format.channels
		if (!sampleRate && format.sampleRate) sampleRate = format.sampleRate
	}

	//empty buffer
	if (source == null) {
		if (options.duration != null) {
			if (!sampleRate) sampleRate = 44100
			length = sampleRate * options.duration
		}
		else length = options.length
	}

	//if audio buffer passed - create fast clone of it
	else if (isAudioBuffer(source)) {
		length = source.length
		if (channels == null) channels = source.numberOfChannels
		if (sampleRate == null) sampleRate = source.sampleRate

		if (source._channelData) {
			data = source._channelData.slice(0, channels)
		}
		else {
			data = []

			for (c = 0, l = channels; c < l; c++) {
				data[c] = source.getChannelData(c)
			}
		}
	}

	//if create(number, channels? rate?) = create new array
	//this is the default WAA-compatible case
	else if (typeof source === 'number') {
		length = source
	}

	//if array with channels - parse channeled data
	else if (Array.isArray(source) && (Array.isArray(source[0]) || ArrayBuffer.isView(source[0]))) {
		length = source[0].length;
		data = []
		if (!channels) channels = source.length
		for (c = 0; c < channels; c++) {
			data[c] = source[c] instanceof Float32Array ? source[c] : new Float32Array(source[c])
		}
	}

	//if ndarray, ndsamples, or anything with data
	else if (source.shape && source.data) {
		if (source.shape) channels = source.shape[1]
		if (!sampleRate && source.format) sampleRate = source.format.sampleRate

		return createBuffer(source.data, {
			channels: channels,
			sampleRate: sampleRate
		})
	}

	//TypedArray, Buffer, DataView etc, ArrayBuffer, Array etc.
	//NOTE: node 4.x+ detects Buffer as ArrayBuffer view
	else {
		if (typeof source === 'string') {
			source = str2ab(source)
		}

		if (!format) format = getFormat(source)
		if (!channels) channels = format.channels || 1
		source = convert(source, format, 'float32 planar')

		length = Math.floor(source.length / channels);
		data = []
		for (c = 0; c < channels; c++) {
			data[c] = source.subarray(c * length, (c + 1) * length);
		}
	}

	//create buffer of proper length
	var audioBuffer = new AudioBuffer((options.context === null || length === 0) ? null : options.context || getContext(), {
		length: length == null ? 1 : length,
		numberOfChannels: channels || 1,
		sampleRate: sampleRate || 44100
	})

	//fill channels
	if (data) {
		for (c = 0, l = data.length; c < l; c++) {
			audioBuffer.getChannelData(c).set(data[c]);
		}
	}


	return audioBuffer
}


function getFormat (arg) {
	return typeof arg === 'string' ? format.parse(arg) : format.detect(arg)
}


/***/ }),
/* 65 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * AudioBuffer class
 *
 * @module audio-buffer/buffer
 */


var getContext = __webpack_require__(66)

module.exports = AudioBuffer


/**
 * @constructor
 */
function AudioBuffer (context, options) {
	if (!(this instanceof AudioBuffer)) return new AudioBuffer(context, options);

	//if no options passed
	if (!options) {
		options = context
		context = options && options.context
	}

	if (!options) options = {}

	if (context === undefined) context = getContext()

	//detect params
	if (options.numberOfChannels == null) {
		options.numberOfChannels = 1
	}
	if (options.sampleRate == null) {
		options.sampleRate = context && context.sampleRate || this.sampleRate
	}
	if (options.length == null) {
		if (options.duration != null) {
			options.length = options.duration * options.sampleRate
		}
		else {
			options.length = 1
		}
	}

	//if existing context
	if (context && context.createBuffer) {
		//create WAA buffer
		return context.createBuffer(options.numberOfChannels, Math.ceil(options.length), options.sampleRate)
	}

	//exposed properties
	this.length = Math.ceil(options.length)
	this.numberOfChannels = options.numberOfChannels
	this.sampleRate = options.sampleRate
	this.duration = this.length / this.sampleRate

	//data is stored as a planar sequence
	this._data = new Float32Array(this.length * this.numberOfChannels)

	//channels data is cached as subarrays
	this._channelData = []
	for (var c = 0; c < this.numberOfChannels; c++) {
		this._channelData.push(this._data.subarray(c * this.length, (c+1) * this.length ))
	}
}


/**
 * Default params
 */
AudioBuffer.prototype.numberOfChannels = 1;
AudioBuffer.prototype.sampleRate = 44100;


/**
 * Return data associated with the channel.
 *
 * @return {Array} Array containing the data
 */
AudioBuffer.prototype.getChannelData = function (channel) {
	if (channel >= this.numberOfChannels || channel < 0 || channel == null) throw Error('Cannot getChannelData: channel number (' + channel + ') exceeds number of channels (' + this.numberOfChannels + ')');

	return this._channelData[channel]
};


/**
 * Place data to the destination buffer, starting from the position
 */
AudioBuffer.prototype.copyFromChannel = function (destination, channelNumber, startInChannel) {
	if (startInChannel == null) startInChannel = 0;
	var data = this._channelData[channelNumber]
	for (var i = startInChannel, j = 0; i < this.length && j < destination.length; i++, j++) {
		destination[j] = data[i];
	}
}


/**
 * Place data from the source to the channel, starting (in self) from the position
 */
AudioBuffer.prototype.copyToChannel = function (source, channelNumber, startInChannel) {
	var data = this._channelData[channelNumber]

	if (!startInChannel) startInChannel = 0;

	for (var i = startInChannel, j = 0; i < this.length && j < source.length; i++, j++) {
		data[i] = source[j];
	}
};



/***/ }),
/* 66 */
/***/ ((module) => {

"use strict";


var cache = {}

module.exports = function getContext (options) {
	if (typeof window === 'undefined') return null
	
	var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext
	var Context = window.AudioContext || window.webkitAudioContext
	
	if (!Context) return null

	if (typeof options === 'number') {
		options = {sampleRate: options}
	}

	var sampleRate = options && options.sampleRate


	if (options && options.offline) {
		if (!OfflineContext) return null

		return new OfflineContext(options.channels || 2, options.length, sampleRate || 44100)
	}


	//cache by sampleRate, rather strong guess
	var ctx = cache[sampleRate]

	if (ctx) return ctx

	//several versions of firefox have issues with the
	//constructor argument
	//see: https://bugzilla.mozilla.org/show_bug.cgi?id=1361475
	try {
		ctx = new Context(options)
	}
	catch (err) {
		ctx = new Context()
	}
	cache[ctx.sampleRate] = cache[sampleRate] = ctx

	return ctx
}


/***/ }),
/* 67 */
/***/ ((module) => {

"use strict";
/**
 * @module  is-audio-buffer
 */


module.exports = function isAudioBuffer (buffer) {
	//the guess is duck-typing
	return buffer != null
	&& typeof buffer.length === 'number'
	&& typeof buffer.sampleRate === 'number' //swims like AudioBuffer
	&& typeof buffer.getChannelData === 'function' //quacks like AudioBuffer
	// && buffer.copyToChannel
	// && buffer.copyFromChannel
	&& typeof buffer.duration === 'number'
};


/***/ }),
/* 68 */
/***/ ((module) => {

"use strict";

var toString = Object.prototype.toString;

module.exports = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};


/***/ }),
/* 69 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * @module pcm-convert
 */


var assert = __webpack_require__(32)
var isBuffer = __webpack_require__(70)
var format = __webpack_require__(71)
var extend = __webpack_require__(75)
var isAudioBuffer = __webpack_require__(67)

module.exports = convert

function convert (buffer, from, to, target) {
	assert(buffer, 'First argument should be data')
	assert(from, 'Second argument should be format string or object')

	//quick ignore
	if (from === to) {
		return buffer
	}

	//2-containers case
	if (isContainer(from)) {
		target = from
		to = format.detect(target)
		from = format.detect(buffer)
	}
	//if no source format defined, just target format
	else if (to === undefined && target === undefined) {
		to = getFormat(from)
		from = format.detect(buffer)
	}
	//if no source format but container is passed with from as target format
	else if (isContainer(to)) {
		target = to
		to = getFormat(from)
		from = format.detect(buffer)
	}
	//all arguments
	else {
		var inFormat = getFormat(from)
		var srcFormat = format.detect(buffer)
		srcFormat.dtype = inFormat.type === 'arraybuffer' ? srcFormat.type : inFormat.type
		from = extend(inFormat, srcFormat)

		var outFormat = getFormat(to)
		var dstFormat = format.detect(target)
		if (outFormat.type) {
			dstFormat.dtype = outFormat.type === 'arraybuffer' ? (dstFormat.type || from.dtype) : outFormat.type
		}
		to = extend(outFormat, dstFormat)
	}

	if (to.channels == null && from.channels != null) {
		to.channels = from.channels
	}

	if (to.type == null) {
		to.type = from.type
		to.dtype = from.dtype
	}

	if (to.interleaved != null && from.channels == null) {
		from.channels = 2
	}

	//ignore same format
	if (from.type === to.type &&
		from.interleaved === to.interleaved &&
		from.endianness === to.endianness) return buffer

	normalize(from)
	normalize(to)

	//audio-buffer-list/audio types
	if (buffer.buffers || (buffer.buffer && buffer.buffer.buffers)) {
		//handle audio
		if (buffer.buffer) buffer = buffer.buffer

		//handle audiobufferlist
		if (buffer.buffers) buffer = buffer.join()
	}

	var src
	//convert buffer/alike to arrayBuffer
	if (isAudioBuffer(buffer)) {
		if (buffer._data) src = buffer._data
		else {
			src = new Float32Array(buffer.length * buffer.numberOfChannels)
			for (var c = 0, l = buffer.numberOfChannels; c < l; c++) {
				src.set(buffer.getChannelData(c), buffer.length * c)
			}
		}
	}
	else if (buffer instanceof ArrayBuffer) {
		src = new (dtypeClass[from.dtype])(buffer)
	}
	else if (isBuffer(buffer)) {
		if (buffer.byteOffset != null) src = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
		else src = buffer.buffer;

		src = new (dtypeClass[from.dtype])(src)
	}
	//typed arrays are unchanged as is
	else {
		src = buffer
	}

	//dst is automatically filled with mapped values
	//but in some cases mapped badly, e. g. float → int(round + rotate)
	var dst = to.type === 'array' ? Array.from(src) : new (dtypeClass[to.dtype])(src)

	//if range differ, we should apply more thoughtful mapping
	if (from.max !== to.max) {
		var fromRange = from.max - from.min, toRange = to.max - to.min
		for (var i = 0, l = src.length; i < l; i++) {
			var value = src[i]

			//ignore not changed range
			//bring to 0..1
			var normalValue = (value - from.min) / fromRange

			//bring to new format ranges
			value = normalValue * toRange + to.min

			//clamp (buffers do not like values outside of bounds)
			dst[i] = Math.max(to.min, Math.min(to.max, value))
		}
	}

	//reinterleave, if required
	if (from.interleaved != to.interleaved) {
		var channels = from.channels
		var len = Math.floor(src.length / channels)

		//deinterleave
		if (from.interleaved && !to.interleaved) {
			dst = dst.map(function (value, idx, data) {
				var offset = idx % len
				var channel = ~~(idx / len)

				return data[offset * channels + channel]
			})
		}
		//interleave
		else if (!from.interleaved && to.interleaved) {
			dst = dst.map(function (value, idx, data) {
				var offset = ~~(idx / channels)
				var channel = idx % channels

				return data[channel * len + offset]
			})
		}
	}

	//ensure endianness
	if (to.dtype != 'array' && to.dtype != 'int8' && to.dtype != 'uint8' && from.endianness && to.endianness && from.endianness !== to.endianness) {
		var le = to.endianness === 'le'
		var view = new DataView(dst.buffer)
		var step = dst.BYTES_PER_ELEMENT
		var methodName = 'set' + to.dtype[0].toUpperCase() + to.dtype.slice(1)
		for (var i = 0, l = dst.length; i < l; i++) {
			view[methodName](i*step, dst[i], le)
		}
	}

	if (to.type === 'audiobuffer') {
		//TODO
	}


	if (target) {
		if (Array.isArray(target)) {
			for (var i = 0; i < dst.length; i++) {
				target[i] = dst[i]
			}
		}
		else if (target instanceof ArrayBuffer) {
			var
			targetContainer = new dtypeClass[to.dtype](target)
			targetContainer.set(dst)
			target = targetContainer
		}
		else {
			target.set(dst)
		}
		dst = target
	}

	if (to.type === 'arraybuffer' || to.type === 'buffer') dst = dst.buffer

	return dst
}

function getFormat (arg) {
	return typeof arg === 'string' ? format.parse(arg) : format.detect(arg)
}

function isContainer (arg) {
	return typeof arg != 'string' && (Array.isArray(arg) || ArrayBuffer.isView(arg) || arg instanceof ArrayBuffer)
}


var dtypeClass = {
	'uint8': Uint8Array,
	'uint8_clamped': Uint8ClampedArray,
	'uint16': Uint16Array,
	'uint32': Uint32Array,
	'int8': Int8Array,
	'int16': Int16Array,
	'int32': Int32Array,
	'float32': Float32Array,
	'float64': Float64Array,
	'array': Array,
	'arraybuffer': Uint8Array,
	'buffer': Uint8Array,
}

var defaultDtype = {
	'float32': 'float32',
	'audiobuffer': 'float32',
	'ndsamples': 'float32',
	'ndarray': 'float32',
	'float64': 'float64',
	'buffer': 'uint8',
	'arraybuffer': 'uint8',
	'uint8': 'uint8',
	'uint8_clamped': 'uint8',
	'uint16': 'uint16',
	'uint32': 'uint32',
	'int8': 'int8',
	'int16': 'int16',
	'int32': 'int32',
	'array': 'array'
}

//make sure all format properties are present
function normalize (obj) {
	if (!obj.dtype) {
		obj.dtype = defaultDtype[obj.type] || 'array'
	}

	//provide limits
	switch (obj.dtype) {
		case 'float32':
		case 'float64':
		case 'audiobuffer':
		case 'ndsamples':
		case 'ndarray':
			obj.min = -1
			obj.max = 1
			break;
		case 'uint8':
			obj.min = 0
			obj.max = 255
			break;
		case 'uint16':
			obj.min = 0
			obj.max = 65535
			break;
		case 'uint32':
			obj.min = 0
			obj.max = 4294967295
			break;
		case 'int8':
			obj.min = -128
			obj.max = 127
			break;
		case 'int16':
			obj.min = -32768
			obj.max = 32767
			break;
		case 'int32':
			obj.min = -2147483648
			obj.max = 2147483647
			break;
		default:
			obj.min = -1
			obj.max = 1
			break;
	}

	return obj
}


/***/ }),
/* 70 */
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 71 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * @module audio-format
 */


var rates = __webpack_require__(72)
var os = __webpack_require__(42)
var isAudioBuffer = __webpack_require__(67)
var isBuffer = __webpack_require__(70)
var isPlainObj = __webpack_require__(73)
var pick = __webpack_require__(74)

module.exports = {
	parse: parse,
	stringify: stringify,
	detect: detect,
	type: getType
}

var endianness = os.endianness instanceof Function ? os.endianness().toLowerCase() : 'le'

var types = {
	'uint': 'uint32',
	'uint8': 'uint8',
	'uint8_clamped': 'uint8',
	'uint16': 'uint16',
	'uint32': 'uint32',
	'int': 'int32',
	'int8': 'int8',
	'int16': 'int16',
	'int32': 'int32',
	'float': 'float32',
	'float32': 'float32',
	'float64': 'float64',
	'array': 'array',
	'arraybuffer': 'arraybuffer',
	'buffer': 'buffer',
	'audiobuffer': 'audiobuffer',
	'ndarray': 'ndarray',
	'ndsamples': 'ndsamples'
}
var channelNumber = {
	'mono': 1,
	'stereo': 2,
	'quad': 4,
	'5.1': 6,
	'2.1': 3,
	'3-channel': 3,
	'5-channel': 5
}
var maxChannels = 32
for (var i = 6; i < maxChannels; i++) {
	channelNumber[i + '-channel'] = i
}

var channelName = {}
for (var name in channelNumber) {
	channelName[channelNumber[name]] = name
}
//parse format string
function parse (str) {
	var format = {}

	var parts = str.split(/\s*[,;_]\s*|\s+/)

	for (var i = 0; i < parts.length; i++) {
		var part = parts[i].toLowerCase()

		if (part === 'planar' && format.interleaved == null) {
			format.interleaved = false
			if (format.channels == null) format.channels = 2
		}
		else if ((part === 'interleave' || part === 'interleaved') && format.interleaved == null) {
			format.interleaved = true
			if (format.channels == null) format.channels = 2
		}
		else if (channelNumber[part]) format.channels = channelNumber[part]
		else if (part === 'le' || part === 'LE' || part === 'littleendian' || part === 'bigEndian') format.endianness = 'le'
		else if (part === 'be' || part === 'BE' || part === 'bigendian' || part === 'bigEndian') format.endianness = 'be'
		else if (types[part]) {
			format.type = types[part]
			if (part === 'audiobuffer') {
				format.endianness = endianness
				format.interleaved = false
			}
		}
		else if (rates[part]) format.sampleRate = rates[part]
		else if (/^\d+$/.test(part)) format.sampleRate = parseInt(part)
		else throw Error('Cannot identify part `' + part + '`')
	}

	return format
}


//parse available format properties from an object
function detect (obj) {
	if (!obj) return {}

	var format = pick(obj, {
		channels: 'channel channels numberOfChannels channelCount',
		sampleRate: 'sampleRate rate',
		interleaved: 'interleave interleaved',
		type: 'type dtype',
		endianness: 'endianness'
	})

	// ndsamples case
	if (obj.format) {
		format.type = 'ndsamples'
	}
	if (format.sampleRate == null && obj.format && obj.format.sampleRate) {
		format.sampleRate = obj.format.sampleRate
	}
	if (obj.planar) format.interleaved = false
	if (format.interleaved != null) {
		if (format.channels == null) format.channels = 2
	}
	if (format.type == null) {
		var type = getType(obj)
		if (type) format.type = type
	}

	if (format.type === 'audiobuffer') {
		format.endianness = endianness
		format.interleaved = false
	}

	return format
}


//convert format string to format object
function stringify (format, omit) {
	if (omit === undefined) {
		omit = {endianness: 'le'}
	} else if (omit == null) {
		omit = {}
	} else if (typeof omit === 'string') {
		omit = parse(omit)
	} else {
		omit = detect(omit)
	}

	if (!isPlainObj(format)) format = detect(format)

	var parts = []

	if (format.type != null && format.type !== omit.type) parts.push(format.type || 'float32')
	if (format.channels != null && format.channels !== omit.channels) parts.push(channelName[format.channels])
	if (format.endianness != null && format.endianness !== omit.endianness) parts.push(format.endianness || 'le')
	if (format.interleaved != null && format.interleaved !== omit.interleaved) {
		if (format.type !== 'audiobuffer') parts.push(format.interleaved ? 'interleaved' : 'planar')
	}
	if (format.sampleRate != null && format.sampleRate !== omit.sampleRate) parts.push(format.sampleRate)

	return parts.join(' ')
}


//return type string for an object
function getType (arg) {
	if (isAudioBuffer(arg)) return 'audiobuffer'
	if (isBuffer(arg)) return 'buffer'
	if (Array.isArray(arg)) return 'array'
	if (arg instanceof ArrayBuffer) return 'arraybuffer'
	if (arg.shape && arg.dtype) return arg.format ? 'ndsamples' : 'ndarray'
	if (arg instanceof Float32Array) return 'float32'
	if (arg instanceof Float64Array) return 'float64'
	if (arg instanceof Uint8Array) return 'uint8'
	if (arg instanceof Uint8ClampedArray) return 'uint8_clamped'
	if (arg instanceof Int8Array) return 'int8'
	if (arg instanceof Int16Array) return 'int16'
	if (arg instanceof Uint16Array) return 'uint16'
	if (arg instanceof Int32Array) return 'int32'
	if (arg instanceof Uint32Array) return 'uint32'
}


/***/ }),
/* 72 */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"8000\":8000,\"11025\":11025,\"16000\":16000,\"22050\":22050,\"44100\":44100,\"48000\":48000,\"88200\":88200,\"96000\":96000,\"176400\":176400,\"192000\":192000,\"352800\":352800,\"384000\":384000}");

/***/ }),
/* 73 */
/***/ ((module) => {

"use strict";

var toString = Object.prototype.toString;

module.exports = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};


/***/ }),
/* 74 */
/***/ ((module) => {

"use strict";



module.exports = function pick (src, props, keepRest) {
	var result = {}, prop, i

	if (typeof props === 'string') props = toList(props)
	if (Array.isArray(props)) {
		var res = {}
		for (i = 0; i < props.length; i++) {
			res[props[i]] = true
		}
		props = res
	}

	// convert strings to lists
	for (prop in props) {
		props[prop] = toList(props[prop])
	}

	// keep-rest strategy requires unmatched props to be preserved
	var occupied = {}

	for (prop in props) {
		var aliases = props[prop]

		if (Array.isArray(aliases)) {
			for (i = 0; i < aliases.length; i++) {
				var alias = aliases[i]

				if (keepRest) {
					occupied[alias] = true
				}

				if (alias in src) {
					result[prop] = src[alias]

					if (keepRest) {
						for (var j = i; j < aliases.length; j++) {
							occupied[aliases[j]] = true
						}
					}

					break
				}
			}
		}
		else if (prop in src) {
			if (props[prop]) {
				result[prop] = src[prop]
			}

			if (keepRest) {
				occupied[prop] = true
			}
		}
	}

	if (keepRest) {
		for (prop in src) {
			if (occupied[prop]) continue
			result[prop] = src[prop]
		}
	}

	return result
}

var CACHE = {}

function toList(arg) {
	if (CACHE[arg]) return CACHE[arg]
	if (typeof arg === 'string') {
		arg = CACHE[arg] = arg.split(/\s*,\s*|\s+/)
	}
	return arg
}


/***/ }),
/* 75 */
/***/ ((module) => {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 76 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * @module  string-to-arraybuffer
 */



var atob = __webpack_require__(77)
var isBase64 = __webpack_require__(78)

module.exports = function stringToArrayBuffer (arg) {
	if (typeof arg !== 'string') throw Error('Argument should be a string')

	//valid data uri
	if (/^data\:/i.test(arg)) return decode(arg)

	//base64
	if (isBase64(arg)) arg = atob(arg)

	return str2ab(arg)
}

function str2ab (str) {
	var array = new Uint8Array(str.length);
	for(var i = 0; i < str.length; i++) {
		array[i] = str.charCodeAt(i);
	}
	return array.buffer
}

function decode(uri) {
	// strip newlines
	uri = uri.replace(/\r?\n/g, '');

	// split the URI up into the "metadata" and the "data" portions
	var firstComma = uri.indexOf(',');
	if (-1 === firstComma || firstComma <= 4) throw new TypeError('malformed data-URI');

	// remove the "data:" scheme and parse the metadata
	var meta = uri.substring(5, firstComma).split(';');

	var base64 = false;
	var charset = 'US-ASCII';
	for (var i = 0; i < meta.length; i++) {
		if ('base64' == meta[i]) {
			base64 = true;
		} else if (0 == meta[i].indexOf('charset=')) {
			charset = meta[i].substring(8);
		}
	}

	// get the encoded data portion and decode URI-encoded chars
	var data = unescape(uri.substring(firstComma + 1));

	if (base64) data = atob(data)

	var abuf = str2ab(data)

	abuf.type = meta[0] || 'text/plain'
	abuf.charset = charset

	return abuf
}


/***/ }),
/* 77 */
/***/ ((module) => {

module.exports = function atob(str) {
  return Buffer.from(str, 'base64').toString('binary')
}


/***/ }),
/* 78 */
/***/ (function(module, exports) {

(function(root) {
  'use strict';

  function isBase64(v, opts) {
    if (v instanceof Boolean || typeof v === 'boolean') {
      return false
    }
    if (!(opts instanceof Object)) {
      opts = {}
    }
    if (opts.hasOwnProperty('allowBlank') && !opts.allowBlank && v === '') {
      return false
    }

    var regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?';

    if (opts.mime) {
      regex = '(data:\\w+\\/[a-zA-Z\\+\\-\\.]+;base64,)?' + regex
    }

    if (opts.paddingRequired === false) {
      regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}(==)?|[A-Za-z0-9+\\/]{3}=?)?'
    }

    return (new RegExp('^' + regex + '$', 'gi')).test(v);
  }

  if (true) {
    if ( true && module.exports) {
      exports = module.exports = isBase64;
    }
    exports.isBase64 = isBase64;
  } else {}
})(this);


/***/ }),
/* 79 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * @module  to-array-buffer
 */



var str2ab = __webpack_require__(76)
var flat = __webpack_require__(80)
// var isBlob = require('is-blob')


module.exports = function toArrayBuffer (arg) {
	//zero-length or undefined-like
	if (!arg) return new ArrayBuffer()

	//array buffer
	if (arg instanceof ArrayBuffer) return arg

	//try to decode data-uri
	if (typeof arg === 'string') {
		return str2ab(arg)
	}

	// File & Blob
	// if (isBlob(src) || (src instanceof global.File)) {
		// FIXME: we cannot use it here bc FileReader is async
	// }

	//array buffer view: TypedArray, DataView, Buffer etc
	if (ArrayBuffer.isView(arg)) {
		if (arg.byteOffset != null) return arg.buffer.slice(arg.byteOffset, arg.byteOffset + arg.byteLength)
		return arg.buffer
	}

	//buffer/data nested: NDArray, ImageData etc.
	//FIXME: NDArrays with custom data type may be invalid for this procedure
	if (arg.buffer || arg.data || arg._data) {
		var result = toArrayBuffer(arg.buffer || arg.data || arg._data)
		return result
	}

	// detect if flat
	if (arg.length != null) {
		for (var i = 0; i < arg.length; i++) {
			if (arg[i].length != null) {
				arg = flat(arg)
				break
			}
		}
	}

	//array-like or unknown
	//hope Uint8Array knows better how to treat the input
	return (new Uint8Array(arg.length != null ? arg : [arg])).buffer
}


/***/ }),
/* 80 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*eslint new-cap:0*/
var dtype = __webpack_require__(81)

module.exports = flattenVertexData

function flattenVertexData (data, output, offset) {
  if (!data) throw new TypeError('must specify data as first parameter')
  offset = +(offset || 0) | 0

  if (Array.isArray(data) && (data[0] && typeof data[0][0] === 'number')) {
    var dim = data[0].length
    var length = data.length * dim
    var i, j, k, l

    // no output specified, create a new typed array
    if (!output || typeof output === 'string') {
      output = new (dtype(output || 'float32'))(length + offset)
    }

    var dstLength = output.length - offset
    if (length !== dstLength) {
      throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
        ' does not match destination length ' + dstLength)
    }

    for (i = 0, k = offset; i < data.length; i++) {
      for (j = 0; j < dim; j++) {
        output[k++] = data[i][j] === null ? NaN : data[i][j]
      }
    }
  } else {
    if (!output || typeof output === 'string') {
      // no output, create a new one
      var Ctor = dtype(output || 'float32')

      // handle arrays separately due to possible nulls
      if (Array.isArray(data) || output === 'array') {
        output = new Ctor(data.length + offset)
        for (i = 0, k = offset, l = output.length; k < l; k++, i++) {
          output[k] = data[i] === null ? NaN : data[i]
        }
      } else {
        if (offset === 0) {
          output = new Ctor(data)
        } else {
          output = new Ctor(data.length + offset)

          output.set(data, offset)
        }
      }
    } else {
      // store output in existing array
      output.set(data, offset)
    }
  }

  return output
}


/***/ }),
/* 81 */
/***/ ((module) => {

module.exports = function(dtype) {
  switch (dtype) {
    case 'int8':
      return Int8Array
    case 'int16':
      return Int16Array
    case 'int32':
      return Int32Array
    case 'uint8':
      return Uint8Array
    case 'uint16':
      return Uint16Array
    case 'uint32':
      return Uint32Array
    case 'float32':
      return Float32Array
    case 'float64':
      return Float64Array
    case 'array':
      return Array
    case 'uint8_clamped':
      return Uint8ClampedArray
  }
}


/***/ }),
/* 82 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Convert a typed array to a Buffer without a copy
 *
 * Author:   Feross Aboukhadijeh <https://feross.org>
 * License:  MIT
 *
 * `npm install typedarray-to-buffer`
 */

var isTypedArray = __webpack_require__(83).strict

module.exports = function typedarrayToBuffer (arr) {
  if (isTypedArray(arr)) {
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
    var buf = Buffer.from(arr.buffer)
    if (arr.byteLength !== arr.buffer.byteLength) {
      // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
    }
    return buf
  } else {
    // Pass through all other types to `Buffer.from`
    return Buffer.from(arr)
  }
}


/***/ }),
/* 83 */
/***/ ((module) => {

module.exports      = isTypedArray
isTypedArray.strict = isStrictTypedArray
isTypedArray.loose  = isLooseTypedArray

var toString = Object.prototype.toString
var names = {
    '[object Int8Array]': true
  , '[object Int16Array]': true
  , '[object Int32Array]': true
  , '[object Uint8Array]': true
  , '[object Uint8ClampedArray]': true
  , '[object Uint16Array]': true
  , '[object Uint32Array]': true
  , '[object Float32Array]': true
  , '[object Float64Array]': true
}

function isTypedArray(arr) {
  return (
       isStrictTypedArray(arr)
    || isLooseTypedArray(arr)
  )
}

function isStrictTypedArray(arr) {
  return (
       arr instanceof Int8Array
    || arr instanceof Int16Array
    || arr instanceof Int32Array
    || arr instanceof Uint8Array
    || arr instanceof Uint8ClampedArray
    || arr instanceof Uint16Array
    || arr instanceof Uint32Array
    || arr instanceof Float32Array
    || arr instanceof Float64Array
  )
}

function isLooseTypedArray(arr) {
  return names[toString.call(arr)]
}


/***/ }),
/* 84 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var key, ref, val;

  ref = __webpack_require__(85);
  for (key in ref) {
    val = ref[key];
    exports[key] = val;
  }

  __webpack_require__(113);

}).call(this);


/***/ }),
/* 85 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var key, ref, val;

  ref = __webpack_require__(86);
  for (key in ref) {
    val = ref[key];
    exports[key] = val;
  }

  __webpack_require__(106);

  __webpack_require__(107);

  __webpack_require__(108);

  __webpack_require__(109);

  __webpack_require__(110);

  __webpack_require__(111);

  __webpack_require__(112);

}).call(this);


/***/ }),
/* 86 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  exports.Base = __webpack_require__(87);

  exports.Buffer = __webpack_require__(88);

  exports.BufferList = __webpack_require__(89);

  exports.Stream = __webpack_require__(90);

  exports.Bitstream = __webpack_require__(92);

  exports.EventEmitter = __webpack_require__(93);

  exports.UnderflowError = __webpack_require__(91);

  exports.HTTPSource = __webpack_require__(94);

  exports.FileSource = __webpack_require__(95);

  exports.BufferSource = __webpack_require__(96);

  exports.Demuxer = __webpack_require__(97);

  exports.Decoder = __webpack_require__(98);

  exports.AudioDevice = __webpack_require__(99);

  exports.Asset = __webpack_require__(100);

  exports.Player = __webpack_require__(101);

  exports.Filter = __webpack_require__(103);

  exports.VolumeFilter = __webpack_require__(102);

  exports.BalanceFilter = __webpack_require__(104);

}).call(this);


/***/ }),
/* 87 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Base,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Base = (function() {
    var fnTest;

    function Base() {}

    fnTest = /\b_super\b/;

    Base.extend = function(prop) {
      var Class, _super, fn, key, keys, ref;
      Class = (function(superClass) {
        extend(Class, superClass);

        function Class() {
          return Class.__super__.constructor.apply(this, arguments);
        }

        return Class;

      })(this);
      if (typeof prop === 'function') {
        keys = Object.keys(Class.prototype);
        prop.call(Class, Class);
        prop = {};
        ref = Class.prototype;
        for (key in ref) {
          fn = ref[key];
          if (indexOf.call(keys, key) < 0) {
            prop[key] = fn;
          }
        }
      }
      _super = Class.__super__;
      for (key in prop) {
        fn = prop[key];
        if (typeof fn === 'function' && fnTest.test(fn)) {
          (function(key, fn) {
            return Class.prototype[key] = function() {
              var ret, tmp;
              tmp = this._super;
              this._super = _super[key];
              ret = fn.apply(this, arguments);
              this._super = tmp;
              return ret;
            };
          })(key, fn);
        } else {
          Class.prototype[key] = fn;
        }
      }
      return Class;
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);


/***/ }),
/* 88 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AVBuffer;

  AVBuffer = (function() {
    var BlobBuilder, URL;

    function AVBuffer(input) {
      var ref;
      if (input instanceof Uint8Array) {
        this.data = input;
      } else if (input instanceof ArrayBuffer || Array.isArray(input) || typeof input === 'number' || ((ref = global.Buffer) != null ? ref.isBuffer(input) : void 0)) {
        this.data = new Uint8Array(input);
      } else if (input.buffer instanceof ArrayBuffer) {
        this.data = new Uint8Array(input.buffer, input.byteOffset, input.length * input.BYTES_PER_ELEMENT);
      } else if (input instanceof AVBuffer) {
        this.data = input.data;
      } else {
        throw new Error("Constructing buffer with unknown type.");
      }
      this.length = this.data.length;
      this.next = null;
      this.prev = null;
    }

    AVBuffer.allocate = function(size) {
      return new AVBuffer(size);
    };

    AVBuffer.prototype.copy = function() {
      return new AVBuffer(new Uint8Array(this.data));
    };

    AVBuffer.prototype.slice = function(position, length) {
      if (length == null) {
        length = this.length;
      }
      if (position === 0 && length >= this.length) {
        return new AVBuffer(this.data);
      } else {
        return new AVBuffer(this.data.subarray(position, position + length));
      }
    };

    BlobBuilder = global.BlobBuilder || global.MozBlobBuilder || global.WebKitBlobBuilder;

    URL = global.URL || global.webkitURL || global.mozURL;

    AVBuffer.makeBlob = function(data, type) {
      var bb;
      if (type == null) {
        type = 'application/octet-stream';
      }
      try {
        return new Blob([data], {
          type: type
        });
      } catch (undefined) {}
      if (BlobBuilder != null) {
        bb = new BlobBuilder;
        bb.append(data);
        return bb.getBlob(type);
      }
      return null;
    };

    AVBuffer.makeBlobURL = function(data, type) {
      return URL != null ? URL.createObjectURL(this.makeBlob(data, type)) : void 0;
    };

    AVBuffer.revokeBlobURL = function(url) {
      return URL != null ? URL.revokeObjectURL(url) : void 0;
    };

    AVBuffer.prototype.toBlob = function() {
      return AVBuffer.makeBlob(this.data.buffer);
    };

    AVBuffer.prototype.toBlobURL = function() {
      return AVBuffer.makeBlobURL(this.data.buffer);
    };

    return AVBuffer;

  })();

  module.exports = AVBuffer;

}).call(this);


/***/ }),
/* 89 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var BufferList;

  BufferList = (function() {
    function BufferList() {
      this.first = null;
      this.last = null;
      this.numBuffers = 0;
      this.availableBytes = 0;
      this.availableBuffers = 0;
    }

    BufferList.prototype.copy = function() {
      var result;
      result = new BufferList;
      result.first = this.first;
      result.last = this.last;
      result.numBuffers = this.numBuffers;
      result.availableBytes = this.availableBytes;
      result.availableBuffers = this.availableBuffers;
      return result;
    };

    BufferList.prototype.append = function(buffer) {
      var ref;
      buffer.prev = this.last;
      if ((ref = this.last) != null) {
        ref.next = buffer;
      }
      this.last = buffer;
      if (this.first == null) {
        this.first = buffer;
      }
      this.availableBytes += buffer.length;
      this.availableBuffers++;
      return this.numBuffers++;
    };

    BufferList.prototype.advance = function() {
      if (this.first) {
        this.availableBytes -= this.first.length;
        this.availableBuffers--;
        this.first = this.first.next;
        return this.first != null;
      }
      return false;
    };

    BufferList.prototype.rewind = function() {
      var ref;
      if (this.first && !this.first.prev) {
        return false;
      }
      this.first = ((ref = this.first) != null ? ref.prev : void 0) || this.last;
      if (this.first) {
        this.availableBytes += this.first.length;
        this.availableBuffers++;
      }
      return this.first != null;
    };

    BufferList.prototype.reset = function() {
      var results;
      results = [];
      while (this.rewind()) {
        continue;
      }
      return results;
    };

    return BufferList;

  })();

  module.exports = BufferList;

}).call(this);


/***/ }),
/* 90 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AVBuffer, BufferList, Stream, UnderflowError;

  BufferList = __webpack_require__(89);

  AVBuffer = __webpack_require__(88);

  UnderflowError = __webpack_require__(91);

  Stream = (function() {
    var buf, decodeString, float32, float64, float64Fallback, float80, int16, int32, int8, nativeEndian, uint16, uint32, uint8;

    buf = new ArrayBuffer(16);

    uint8 = new Uint8Array(buf);

    int8 = new Int8Array(buf);

    uint16 = new Uint16Array(buf);

    int16 = new Int16Array(buf);

    uint32 = new Uint32Array(buf);

    int32 = new Int32Array(buf);

    float32 = new Float32Array(buf);

    if (typeof Float64Array !== "undefined" && Float64Array !== null) {
      float64 = new Float64Array(buf);
    }

    nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;

    function Stream(list1) {
      this.list = list1;
      this.localOffset = 0;
      this.offset = 0;
    }

    Stream.fromBuffer = function(buffer) {
      var list;
      list = new BufferList;
      list.append(buffer);
      return new Stream(list);
    };

    Stream.prototype.copy = function() {
      var result;
      result = new Stream(this.list.copy());
      result.localOffset = this.localOffset;
      result.offset = this.offset;
      return result;
    };

    Stream.prototype.available = function(bytes) {
      return bytes <= this.list.availableBytes - this.localOffset;
    };

    Stream.prototype.remainingBytes = function() {
      return this.list.availableBytes - this.localOffset;
    };

    Stream.prototype.advance = function(bytes) {
      if (!this.available(bytes)) {
        throw new UnderflowError();
      }
      this.localOffset += bytes;
      this.offset += bytes;
      while (this.list.first && this.localOffset >= this.list.first.length) {
        this.localOffset -= this.list.first.length;
        this.list.advance();
      }
      return this;
    };

    Stream.prototype.rewind = function(bytes) {
      if (bytes > this.offset) {
        throw new UnderflowError();
      }
      if (!this.list.first) {
        this.list.rewind();
        this.localOffset = this.list.first.length;
      }
      this.localOffset -= bytes;
      this.offset -= bytes;
      while (this.list.first.prev && this.localOffset < 0) {
        this.list.rewind();
        this.localOffset += this.list.first.length;
      }
      return this;
    };

    Stream.prototype.seek = function(position) {
      if (position > this.offset) {
        return this.advance(position - this.offset);
      } else if (position < this.offset) {
        return this.rewind(this.offset - position);
      }
    };

    Stream.prototype.readUInt8 = function() {
      var a;
      if (!this.available(1)) {
        throw new UnderflowError();
      }
      a = this.list.first.data[this.localOffset];
      this.localOffset += 1;
      this.offset += 1;
      if (this.localOffset === this.list.first.length) {
        this.localOffset = 0;
        this.list.advance();
      }
      return a;
    };

    Stream.prototype.peekUInt8 = function(offset) {
      var buffer;
      if (offset == null) {
        offset = 0;
      }
      if (!this.available(offset + 1)) {
        throw new UnderflowError();
      }
      offset = this.localOffset + offset;
      buffer = this.list.first;
      while (buffer) {
        if (buffer.length > offset) {
          return buffer.data[offset];
        }
        offset -= buffer.length;
        buffer = buffer.next;
      }
      return 0;
    };

    Stream.prototype.read = function(bytes, littleEndian) {
      var i, j, k, ref, ref1;
      if (littleEndian == null) {
        littleEndian = false;
      }
      if (littleEndian === nativeEndian) {
        for (i = j = 0, ref = bytes; j < ref; i = j += 1) {
          uint8[i] = this.readUInt8();
        }
      } else {
        for (i = k = ref1 = bytes - 1; k >= 0; i = k += -1) {
          uint8[i] = this.readUInt8();
        }
      }
    };

    Stream.prototype.peek = function(bytes, offset, littleEndian) {
      var i, j, k, ref, ref1;
      if (littleEndian == null) {
        littleEndian = false;
      }
      if (littleEndian === nativeEndian) {
        for (i = j = 0, ref = bytes; j < ref; i = j += 1) {
          uint8[i] = this.peekUInt8(offset + i);
        }
      } else {
        for (i = k = 0, ref1 = bytes; k < ref1; i = k += 1) {
          uint8[bytes - i - 1] = this.peekUInt8(offset + i);
        }
      }
    };

    Stream.prototype.readInt8 = function() {
      this.read(1);
      return int8[0];
    };

    Stream.prototype.peekInt8 = function(offset) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(1, offset);
      return int8[0];
    };

    Stream.prototype.readUInt16 = function(littleEndian) {
      this.read(2, littleEndian);
      return uint16[0];
    };

    Stream.prototype.peekUInt16 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(2, offset, littleEndian);
      return uint16[0];
    };

    Stream.prototype.readInt16 = function(littleEndian) {
      this.read(2, littleEndian);
      return int16[0];
    };

    Stream.prototype.peekInt16 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(2, offset, littleEndian);
      return int16[0];
    };

    Stream.prototype.readUInt24 = function(littleEndian) {
      if (littleEndian) {
        return this.readUInt16(true) + (this.readUInt8() << 16);
      } else {
        return (this.readUInt16() << 8) + this.readUInt8();
      }
    };

    Stream.prototype.peekUInt24 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      if (littleEndian) {
        return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16);
      } else {
        return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2);
      }
    };

    Stream.prototype.readInt24 = function(littleEndian) {
      if (littleEndian) {
        return this.readUInt16(true) + (this.readInt8() << 16);
      } else {
        return (this.readInt16() << 8) + this.readUInt8();
      }
    };

    Stream.prototype.peekInt24 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      if (littleEndian) {
        return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16);
      } else {
        return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2);
      }
    };

    Stream.prototype.readUInt32 = function(littleEndian) {
      this.read(4, littleEndian);
      return uint32[0];
    };

    Stream.prototype.peekUInt32 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(4, offset, littleEndian);
      return uint32[0];
    };

    Stream.prototype.readInt32 = function(littleEndian) {
      this.read(4, littleEndian);
      return int32[0];
    };

    Stream.prototype.peekInt32 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(4, offset, littleEndian);
      return int32[0];
    };

    Stream.prototype.readFloat32 = function(littleEndian) {
      this.read(4, littleEndian);
      return float32[0];
    };

    Stream.prototype.peekFloat32 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(4, offset, littleEndian);
      return float32[0];
    };

    Stream.prototype.readFloat64 = function(littleEndian) {
      this.read(8, littleEndian);
      if (float64) {
        return float64[0];
      } else {
        return float64Fallback();
      }
    };

    float64Fallback = function() {
      var exp, frac, high, low, out, sign;
      low = uint32[0], high = uint32[1];
      if (!high || high === 0x80000000) {
        return 0.0;
      }
      sign = 1 - (high >>> 31) * 2;
      exp = (high >>> 20) & 0x7ff;
      frac = high & 0xfffff;
      if (exp === 0x7ff) {
        if (frac) {
          return NaN;
        }
        return sign * Infinity;
      }
      exp -= 1023;
      out = (frac | 0x100000) * Math.pow(2, exp - 20);
      out += low * Math.pow(2, exp - 52);
      return sign * out;
    };

    Stream.prototype.peekFloat64 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(8, offset, littleEndian);
      if (float64) {
        return float64[0];
      } else {
        return float64Fallback();
      }
    };

    Stream.prototype.readFloat80 = function(littleEndian) {
      this.read(10, littleEndian);
      return float80();
    };

    float80 = function() {
      var a0, a1, exp, high, low, out, sign;
      high = uint32[0], low = uint32[1];
      a0 = uint8[9];
      a1 = uint8[8];
      sign = 1 - (a0 >>> 7) * 2;
      exp = ((a0 & 0x7F) << 8) | a1;
      if (exp === 0 && low === 0 && high === 0) {
        return 0;
      }
      if (exp === 0x7fff) {
        if (low === 0 && high === 0) {
          return sign * Infinity;
        }
        return NaN;
      }
      exp -= 16383;
      out = low * Math.pow(2, exp - 31);
      out += high * Math.pow(2, exp - 63);
      return sign * out;
    };

    Stream.prototype.peekFloat80 = function(offset, littleEndian) {
      if (offset == null) {
        offset = 0;
      }
      this.peek(10, offset, littleEndian);
      return float80();
    };

    Stream.prototype.readBuffer = function(length) {
      var i, j, ref, result, to;
      result = AVBuffer.allocate(length);
      to = result.data;
      for (i = j = 0, ref = length; j < ref; i = j += 1) {
        to[i] = this.readUInt8();
      }
      return result;
    };

    Stream.prototype.peekBuffer = function(offset, length) {
      var i, j, ref, result, to;
      if (offset == null) {
        offset = 0;
      }
      result = AVBuffer.allocate(length);
      to = result.data;
      for (i = j = 0, ref = length; j < ref; i = j += 1) {
        to[i] = this.peekUInt8(offset + i);
      }
      return result;
    };

    Stream.prototype.readSingleBuffer = function(length) {
      var result;
      result = this.list.first.slice(this.localOffset, length);
      this.advance(result.length);
      return result;
    };

    Stream.prototype.peekSingleBuffer = function(offset, length) {
      var result;
      result = this.list.first.slice(this.localOffset + offset, length);
      return result;
    };

    Stream.prototype.readString = function(length, encoding) {
      if (encoding == null) {
        encoding = 'ascii';
      }
      return decodeString.call(this, 0, length, encoding, true);
    };

    Stream.prototype.peekString = function(offset, length, encoding) {
      if (offset == null) {
        offset = 0;
      }
      if (encoding == null) {
        encoding = 'ascii';
      }
      return decodeString.call(this, offset, length, encoding, false);
    };

    decodeString = function(offset, length, encoding, advance) {
      var b1, b2, b3, b4, bom, c, end, littleEndian, nullEnd, pt, result, w1, w2;
      encoding = encoding.toLowerCase();
      nullEnd = length === null ? 0 : -1;
      if (length == null) {
        length = Infinity;
      }
      end = offset + length;
      result = '';
      switch (encoding) {
        case 'ascii':
        case 'latin1':
          while (offset < end && (c = this.peekUInt8(offset++)) !== nullEnd) {
            result += String.fromCharCode(c);
          }
          break;
        case 'utf8':
        case 'utf-8':
          while (offset < end && (b1 = this.peekUInt8(offset++)) !== nullEnd) {
            if ((b1 & 0x80) === 0) {
              result += String.fromCharCode(b1);
            } else if ((b1 & 0xe0) === 0xc0) {
              b2 = this.peekUInt8(offset++) & 0x3f;
              result += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
            } else if ((b1 & 0xf0) === 0xe0) {
              b2 = this.peekUInt8(offset++) & 0x3f;
              b3 = this.peekUInt8(offset++) & 0x3f;
              result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
            } else if ((b1 & 0xf8) === 0xf0) {
              b2 = this.peekUInt8(offset++) & 0x3f;
              b3 = this.peekUInt8(offset++) & 0x3f;
              b4 = this.peekUInt8(offset++) & 0x3f;
              pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
              result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff));
            }
          }
          break;
        case 'utf16-be':
        case 'utf16be':
        case 'utf16le':
        case 'utf16-le':
        case 'utf16bom':
        case 'utf16-bom':
          switch (encoding) {
            case 'utf16be':
            case 'utf16-be':
              littleEndian = false;
              break;
            case 'utf16le':
            case 'utf16-le':
              littleEndian = true;
              break;
            case 'utf16bom':
            case 'utf16-bom':
              if (length < 2 || (bom = this.peekUInt16(offset)) === nullEnd) {
                if (advance) {
                  this.advance(offset += 2);
                }
                return result;
              }
              littleEndian = bom === 0xfffe;
              offset += 2;
          }
          while (offset < end && (w1 = this.peekUInt16(offset, littleEndian)) !== nullEnd) {
            offset += 2;
            if (w1 < 0xd800 || w1 > 0xdfff) {
              result += String.fromCharCode(w1);
            } else {
              if (w1 > 0xdbff) {
                throw new Error("Invalid utf16 sequence.");
              }
              w2 = this.peekUInt16(offset, littleEndian);
              if (w2 < 0xdc00 || w2 > 0xdfff) {
                throw new Error("Invalid utf16 sequence.");
              }
              result += String.fromCharCode(w1, w2);
              offset += 2;
            }
          }
          if (w1 === nullEnd) {
            offset += 2;
          }
          break;
        default:
          throw new Error("Unknown encoding: " + encoding);
      }
      if (advance) {
        this.advance(offset);
      }
      return result;
    };

    return Stream;

  })();

  module.exports = Stream;

}).call(this);


/***/ }),
/* 91 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var UnderflowError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  UnderflowError = (function(superClass) {
    extend(UnderflowError, superClass);

    function UnderflowError() {
      UnderflowError.__super__.constructor.apply(this, arguments);
      this.name = 'UnderflowError';
      this.stack = new Error().stack;
    }

    return UnderflowError;

  })(Error);

  module.exports = UnderflowError;

}).call(this);


/***/ }),
/* 92 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Bitstream;

  Bitstream = (function() {
    function Bitstream(stream) {
      this.stream = stream;
      this.bitPosition = 0;
    }

    Bitstream.prototype.copy = function() {
      var result;
      result = new Bitstream(this.stream.copy());
      result.bitPosition = this.bitPosition;
      return result;
    };

    Bitstream.prototype.offset = function() {
      return 8 * this.stream.offset + this.bitPosition;
    };

    Bitstream.prototype.available = function(bits) {
      return this.stream.available((bits + 8 - this.bitPosition) / 8);
    };

    Bitstream.prototype.advance = function(bits) {
      var pos;
      pos = this.bitPosition + bits;
      this.stream.advance(pos >> 3);
      return this.bitPosition = pos & 7;
    };

    Bitstream.prototype.rewind = function(bits) {
      var pos;
      pos = this.bitPosition - bits;
      this.stream.rewind(Math.abs(pos >> 3));
      return this.bitPosition = pos & 7;
    };

    Bitstream.prototype.seek = function(offset) {
      var curOffset;
      curOffset = this.offset();
      if (offset > curOffset) {
        return this.advance(offset - curOffset);
      } else if (offset < curOffset) {
        return this.rewind(curOffset - offset);
      }
    };

    Bitstream.prototype.align = function() {
      if (this.bitPosition !== 0) {
        this.bitPosition = 0;
        return this.stream.advance(1);
      }
    };

    Bitstream.prototype.read = function(bits, signed) {
      var a, a0, a1, a2, a3, a4, mBits;
      if (bits === 0) {
        return 0;
      }
      mBits = bits + this.bitPosition;
      if (mBits <= 8) {
        a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
      } else if (mBits <= 16) {
        a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
      } else if (mBits <= 24) {
        a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
      } else if (mBits <= 32) {
        a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
      } else if (mBits <= 40) {
        a0 = this.stream.peekUInt8(0) * 0x0100000000;
        a1 = this.stream.peekUInt8(1) << 24 >>> 0;
        a2 = this.stream.peekUInt8(2) << 16;
        a3 = this.stream.peekUInt8(3) << 8;
        a4 = this.stream.peekUInt8(4);
        a = a0 + a1 + a2 + a3 + a4;
        a %= Math.pow(2, 40 - this.bitPosition);
        a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
      } else {
        throw new Error("Too many bits!");
      }
      if (signed) {
        if (mBits < 32) {
          if (a >>> (bits - 1)) {
            a = ((1 << bits >>> 0) - a) * -1;
          }
        } else {
          if (a / Math.pow(2, bits - 1) | 0) {
            a = (Math.pow(2, bits) - a) * -1;
          }
        }
      }
      this.advance(bits);
      return a;
    };

    Bitstream.prototype.peek = function(bits, signed) {
      var a, a0, a1, a2, a3, a4, mBits;
      if (bits === 0) {
        return 0;
      }
      mBits = bits + this.bitPosition;
      if (mBits <= 8) {
        a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
      } else if (mBits <= 16) {
        a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
      } else if (mBits <= 24) {
        a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
      } else if (mBits <= 32) {
        a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
      } else if (mBits <= 40) {
        a0 = this.stream.peekUInt8(0) * 0x0100000000;
        a1 = this.stream.peekUInt8(1) << 24 >>> 0;
        a2 = this.stream.peekUInt8(2) << 16;
        a3 = this.stream.peekUInt8(3) << 8;
        a4 = this.stream.peekUInt8(4);
        a = a0 + a1 + a2 + a3 + a4;
        a %= Math.pow(2, 40 - this.bitPosition);
        a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
      } else {
        throw new Error("Too many bits!");
      }
      if (signed) {
        if (mBits < 32) {
          if (a >>> (bits - 1)) {
            a = ((1 << bits >>> 0) - a) * -1;
          }
        } else {
          if (a / Math.pow(2, bits - 1) | 0) {
            a = (Math.pow(2, bits) - a) * -1;
          }
        }
      }
      return a;
    };

    Bitstream.prototype.readLSB = function(bits, signed) {
      var a, mBits;
      if (bits === 0) {
        return 0;
      }
      if (bits > 40) {
        throw new Error("Too many bits!");
      }
      mBits = bits + this.bitPosition;
      a = (this.stream.peekUInt8(0)) >>> this.bitPosition;
      if (mBits > 8) {
        a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
      }
      if (mBits > 16) {
        a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
      }
      if (mBits > 24) {
        a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
      }
      if (mBits > 32) {
        a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
      }
      if (mBits >= 32) {
        a %= Math.pow(2, bits);
      } else {
        a &= (1 << bits) - 1;
      }
      if (signed) {
        if (mBits < 32) {
          if (a >>> (bits - 1)) {
            a = ((1 << bits >>> 0) - a) * -1;
          }
        } else {
          if (a / Math.pow(2, bits - 1) | 0) {
            a = (Math.pow(2, bits) - a) * -1;
          }
        }
      }
      this.advance(bits);
      return a;
    };

    Bitstream.prototype.peekLSB = function(bits, signed) {
      var a, mBits;
      if (bits === 0) {
        return 0;
      }
      if (bits > 40) {
        throw new Error("Too many bits!");
      }
      mBits = bits + this.bitPosition;
      a = (this.stream.peekUInt8(0)) >>> this.bitPosition;
      if (mBits > 8) {
        a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
      }
      if (mBits > 16) {
        a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
      }
      if (mBits > 24) {
        a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
      }
      if (mBits > 32) {
        a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
      }
      if (mBits >= 32) {
        a %= Math.pow(2, bits);
      } else {
        a &= (1 << bits) - 1;
      }
      if (signed) {
        if (mBits < 32) {
          if (a >>> (bits - 1)) {
            a = ((1 << bits >>> 0) - a) * -1;
          }
        } else {
          if (a / Math.pow(2, bits - 1) | 0) {
            a = (Math.pow(2, bits) - a) * -1;
          }
        }
      }
      return a;
    };

    return Bitstream;

  })();

  module.exports = Bitstream;

}).call(this);


/***/ }),
/* 93 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Base, EventEmitter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Base = __webpack_require__(87);

  EventEmitter = (function(superClass) {
    extend(EventEmitter, superClass);

    function EventEmitter() {
      return EventEmitter.__super__.constructor.apply(this, arguments);
    }

    EventEmitter.prototype.on = function(event, fn) {
      var base;
      if (this.events == null) {
        this.events = {};
      }
      if ((base = this.events)[event] == null) {
        base[event] = [];
      }
      return this.events[event].push(fn);
    };

    EventEmitter.prototype.off = function(event, fn) {
      var events, index, ref;
      if (this.events == null) {
        return;
      }
      if ((ref = this.events) != null ? ref[event] : void 0) {
        if (fn != null) {
          index = this.events[event].indexOf(fn);
          if (~index) {
            return this.events[event].splice(index, 1);
          }
        } else {
          return this.events[event];
        }
      } else if (event == null) {
        return events = {};
      }
    };

    EventEmitter.prototype.once = function(event, fn) {
      var cb;
      return this.on(event, cb = function() {
        this.off(event, cb);
        return fn.apply(this, arguments);
      });
    };

    EventEmitter.prototype.emit = function() {
      var args, event, fn, i, len, ref, ref1;
      event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (!((ref = this.events) != null ? ref[event] : void 0)) {
        return;
      }
      ref1 = this.events[event].slice();
      for (i = 0, len = ref1.length; i < len; i++) {
        fn = ref1[i];
        fn.apply(this, args);
      }
    };

    return EventEmitter;

  })(Base);

  module.exports = EventEmitter;

}).call(this);


/***/ }),
/* 94 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AVBuffer, EventEmitter, HTTPSource, http,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  AVBuffer = __webpack_require__(88);

  http = __webpack_require__(27);

  HTTPSource = (function(superClass) {
    extend(HTTPSource, superClass);

    function HTTPSource(url) {
      this.url = url;
      this.errorHandler = bind(this.errorHandler, this);
      this.request = null;
      this.response = null;
      this.loaded = 0;
      this.size = 0;
    }

    HTTPSource.prototype.start = function() {
      if (this.response != null) {
        return this.response.resume();
      }
      this.request = http.get(this.url);
      this.request.on('response', (function(_this) {
        return function(response) {
          _this.response = response;
          if (_this.response.statusCode !== 200) {
            return _this.errorHandler('Error loading file. HTTP status code ' + _this.response.statusCode);
          }
          _this.size = parseInt(_this.response.headers['content-length']);
          _this.loaded = 0;
          _this.response.on('data', function(chunk) {
            _this.loaded += chunk.length;
            _this.emit('progress', _this.loaded / _this.size * 100);
            return _this.emit('data', new AVBuffer(new Uint8Array(chunk)));
          });
          _this.response.on('end', function() {
            return _this.emit('end');
          });
          return _this.response.on('error', _this.errorHandler);
        };
      })(this));
      return this.request.on('error', this.errorHandler);
    };

    HTTPSource.prototype.pause = function() {
      var ref;
      return (ref = this.response) != null ? ref.pause() : void 0;
    };

    HTTPSource.prototype.reset = function() {
      this.pause();
      this.request.abort();
      this.request = null;
      return this.response = null;
    };

    HTTPSource.prototype.errorHandler = function(err) {
      this.reset();
      return this.emit('error', err);
    };

    return HTTPSource;

  })(EventEmitter);

  module.exports = HTTPSource;

}).call(this);


/***/ }),
/* 95 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AVBuffer, EventEmitter, FileSource, fs,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  AVBuffer = __webpack_require__(88);

  fs = __webpack_require__(3);

  FileSource = (function(superClass) {
    extend(FileSource, superClass);

    function FileSource(filename) {
      this.filename = filename;
      this.stream = null;
      this.loaded = 0;
      this.size = null;
    }

    FileSource.prototype.getSize = function() {
      return fs.stat(this.filename, (function(_this) {
        return function(err, stat) {
          if (err) {
            return _this.emit('error', err);
          }
          _this.size = stat.size;
          return _this.start();
        };
      })(this));
    };

    FileSource.prototype.start = function() {
      var b, blen;
      if (this.size == null) {
        return this.getSize();
      }
      if (this.stream) {
        return this.stream.resume();
      }
      this.stream = fs.createReadStream(this.filename);
      b = new Buffer(1 << 20);
      blen = 0;
      this.stream.on('data', (function(_this) {
        return function(buf) {
          _this.loaded += buf.length;
          buf.copy(b, blen);
          blen = blen + buf.length;
          _this.emit('progress', _this.loaded / _this.size * 100);
          if (blen >= b.length || _this.loaded >= _this.size) {
            if (blen < b.length) {
              b = b.slice(0, blen);
            }
            _this.emit('data', new AVBuffer(new Uint8Array(b)));
            blen -= b.length;
            return buf.copy(b, 0, blen);
          }
        };
      })(this));
      this.stream.on('end', (function(_this) {
        return function() {
          return _this.emit('end');
        };
      })(this));
      return this.stream.on('error', (function(_this) {
        return function(err) {
          _this.pause();
          return _this.emit('error', err);
        };
      })(this));
    };

    FileSource.prototype.pause = function() {
      return this.stream.pause();
    };

    return FileSource;

  })(EventEmitter);

  module.exports = FileSource;

}).call(this);


/***/ }),
/* 96 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AVBuffer, BufferList, BufferSource, EventEmitter,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  BufferList = __webpack_require__(89);

  AVBuffer = __webpack_require__(88);

  BufferSource = (function(superClass) {
    var clearImmediate, setImmediate;

    extend(BufferSource, superClass);

    function BufferSource(input) {
      this.loop = bind(this.loop, this);
      if (input instanceof BufferList) {
        this.list = input;
      } else {
        this.list = new BufferList;
        this.list.append(new AVBuffer(input));
      }
      this.paused = true;
    }

    setImmediate = global.setImmediate || function(fn) {
      return global.setTimeout(fn, 0);
    };

    clearImmediate = global.clearImmediate || function(timer) {
      return global.clearTimeout(timer);
    };

    BufferSource.prototype.start = function() {
      this.paused = false;
      return this._timer = setImmediate(this.loop);
    };

    BufferSource.prototype.loop = function() {
      this.emit('progress', (this.list.numBuffers - this.list.availableBuffers + 1) / this.list.numBuffers * 100 | 0);
      this.emit('data', this.list.first);
      if (this.list.advance()) {
        return setImmediate(this.loop);
      } else {
        return this.emit('end');
      }
    };

    BufferSource.prototype.pause = function() {
      clearImmediate(this._timer);
      return this.paused = true;
    };

    BufferSource.prototype.reset = function() {
      this.pause();
      return this.list.rewind();
    };

    return BufferSource;

  })(EventEmitter);

  module.exports = BufferSource;

}).call(this);


/***/ }),
/* 97 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var BufferList, Demuxer, EventEmitter, Stream,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  BufferList = __webpack_require__(89);

  Stream = __webpack_require__(90);

  Demuxer = (function(superClass) {
    var formats;

    extend(Demuxer, superClass);

    Demuxer.probe = function(buffer) {
      return false;
    };

    function Demuxer(source, chunk) {
      var list, received;
      list = new BufferList;
      list.append(chunk);
      this.stream = new Stream(list);
      received = false;
      source.on('data', (function(_this) {
        return function(chunk) {
          var e, error;
          received = true;
          list.append(chunk);
          try {
            return _this.readChunk(chunk);
          } catch (error) {
            e = error;
            return _this.emit('error', e);
          }
        };
      })(this));
      source.on('error', (function(_this) {
        return function(err) {
          return _this.emit('error', err);
        };
      })(this));
      source.on('end', (function(_this) {
        return function() {
          if (!received) {
            _this.readChunk(chunk);
          }
          return _this.emit('end');
        };
      })(this));
      this.seekPoints = [];
      this.init();
    }

    Demuxer.prototype.init = function() {};

    Demuxer.prototype.readChunk = function(chunk) {};

    Demuxer.prototype.addSeekPoint = function(offset, timestamp) {
      var index;
      index = this.searchTimestamp(timestamp);
      return this.seekPoints.splice(index, 0, {
        offset: offset,
        timestamp: timestamp
      });
    };

    Demuxer.prototype.searchTimestamp = function(timestamp, backward) {
      var high, low, mid, time;
      low = 0;
      high = this.seekPoints.length;
      if (high > 0 && this.seekPoints[high - 1].timestamp < timestamp) {
        return high;
      }
      while (low < high) {
        mid = (low + high) >> 1;
        time = this.seekPoints[mid].timestamp;
        if (time < timestamp) {
          low = mid + 1;
        } else if (time >= timestamp) {
          high = mid;
        }
      }
      if (high > this.seekPoints.length) {
        high = this.seekPoints.length;
      }
      return high;
    };

    Demuxer.prototype.seek = function(timestamp) {
      var index, seekPoint;
      if (this.format && this.format.framesPerPacket > 0 && this.format.bytesPerPacket > 0) {
        seekPoint = {
          timestamp: timestamp,
          offset: this.format.bytesPerPacket * timestamp / this.format.framesPerPacket
        };
        return seekPoint;
      } else {
        index = this.searchTimestamp(timestamp);
        return this.seekPoints[index];
      }
    };

    formats = [];

    Demuxer.register = function(demuxer) {
      return formats.push(demuxer);
    };

    Demuxer.find = function(buffer) {
      var e, error, format, i, len, offset, stream;
      stream = Stream.fromBuffer(buffer);
      for (i = 0, len = formats.length; i < len; i++) {
        format = formats[i];
        offset = stream.offset;
        try {
          if (format.probe(stream)) {
            return format;
          }
        } catch (error) {
          e = error;
        }
        stream.seek(offset);
      }
      return null;
    };

    return Demuxer;

  })(EventEmitter);

  module.exports = Demuxer;

}).call(this);


/***/ }),
/* 98 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Bitstream, BufferList, Decoder, EventEmitter, Stream, UnderflowError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  BufferList = __webpack_require__(89);

  Stream = __webpack_require__(90);

  Bitstream = __webpack_require__(92);

  UnderflowError = __webpack_require__(91);

  Decoder = (function(superClass) {
    var codecs;

    extend(Decoder, superClass);

    function Decoder(demuxer, format) {
      var list;
      this.demuxer = demuxer;
      this.format = format;
      list = new BufferList;
      this.stream = new Stream(list);
      this.bitstream = new Bitstream(this.stream);
      this.receivedFinalBuffer = false;
      this.waiting = false;
      this.demuxer.on('cookie', (function(_this) {
        return function(cookie) {
          var error, error1;
          try {
            return _this.setCookie(cookie);
          } catch (error1) {
            error = error1;
            return _this.emit('error', error);
          }
        };
      })(this));
      this.demuxer.on('data', (function(_this) {
        return function(chunk) {
          list.append(chunk);
          if (_this.waiting) {
            return _this.decode();
          }
        };
      })(this));
      this.demuxer.on('end', (function(_this) {
        return function() {
          _this.receivedFinalBuffer = true;
          if (_this.waiting) {
            return _this.decode();
          }
        };
      })(this));
      this.init();
    }

    Decoder.prototype.init = function() {};

    Decoder.prototype.setCookie = function(cookie) {};

    Decoder.prototype.readChunk = function() {};

    Decoder.prototype.decode = function() {
      var error, error1, offset, packet;
      this.waiting = !this.receivedFinalBuffer;
      offset = this.bitstream.offset();
      try {
        packet = this.readChunk();
      } catch (error1) {
        error = error1;
        if (!(error instanceof UnderflowError)) {
          this.emit('error', error);
          return false;
        }
      }
      if (packet) {
        this.emit('data', packet);
        if (this.receivedFinalBuffer) {
          this.emit('end');
        }
        return true;
      } else if (!this.receivedFinalBuffer) {
        this.bitstream.seek(offset);
        this.waiting = true;
      } else {
        this.emit('end');
      }
      return false;
    };

    Decoder.prototype.seek = function(timestamp) {
      var seekPoint;
      seekPoint = this.demuxer.seek(timestamp);
      this.stream.seek(seekPoint.offset);
      return seekPoint.timestamp;
    };

    codecs = {};

    Decoder.register = function(id, decoder) {
      return codecs[id] = decoder;
    };

    Decoder.find = function(id) {
      return codecs[id] || null;
    };

    return Decoder;

  })(EventEmitter);

  module.exports = Decoder;

}).call(this);


/***/ }),
/* 99 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AudioDevice, EventEmitter,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  AudioDevice = (function(superClass) {
    var devices;

    extend(AudioDevice, superClass);

    function AudioDevice(sampleRate1, channels1) {
      this.sampleRate = sampleRate1;
      this.channels = channels1;
      this.updateTime = bind(this.updateTime, this);
      this.playing = false;
      this.currentTime = 0;
      this._lastTime = 0;
    }

    AudioDevice.prototype.start = function() {
      if (this.playing) {
        return;
      }
      this.playing = true;
      if (this.device == null) {
        this.device = AudioDevice.create(this.sampleRate, this.channels);
      }
      if (!this.device) {
        throw new Error("No supported audio device found.");
      }
      this._lastTime = this.device.getDeviceTime();
      this._timer = setInterval(this.updateTime, 200);
      return this.device.on('refill', this.refill = (function(_this) {
        return function(buffer) {
          return _this.emit('refill', buffer);
        };
      })(this));
    };

    AudioDevice.prototype.stop = function() {
      if (!this.playing) {
        return;
      }
      this.playing = false;
      this.device.off('refill', this.refill);
      return clearInterval(this._timer);
    };

    AudioDevice.prototype.destroy = function() {
      var ref;
      this.stop();
      return (ref = this.device) != null ? ref.destroy() : void 0;
    };

    AudioDevice.prototype.seek = function(currentTime) {
      this.currentTime = currentTime;
      if (this.playing) {
        this._lastTime = this.device.getDeviceTime();
      }
      return this.emit('timeUpdate', this.currentTime);
    };

    AudioDevice.prototype.updateTime = function() {
      var time;
      time = this.device.getDeviceTime();
      this.currentTime += (time - this._lastTime) / this.device.sampleRate * 1000 | 0;
      this._lastTime = time;
      return this.emit('timeUpdate', this.currentTime);
    };

    devices = [];

    AudioDevice.register = function(device) {
      return devices.push(device);
    };

    AudioDevice.create = function(sampleRate, channels) {
      var device, i, len;
      for (i = 0, len = devices.length; i < len; i++) {
        device = devices[i];
        if (device.supported) {
          return new device(sampleRate, channels);
        }
      }
      return null;
    };

    return AudioDevice;

  })(EventEmitter);

  module.exports = AudioDevice;

}).call(this);


/***/ }),
/* 100 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Asset, BufferSource, Decoder, Demuxer, EventEmitter, FileSource, HTTPSource,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  HTTPSource = __webpack_require__(94);

  FileSource = __webpack_require__(95);

  BufferSource = __webpack_require__(96);

  Demuxer = __webpack_require__(97);

  Decoder = __webpack_require__(98);

  Asset = (function(superClass) {
    extend(Asset, superClass);

    function Asset(source) {
      this.source = source;
      this._decode = bind(this._decode, this);
      this.findDecoder = bind(this.findDecoder, this);
      this.probe = bind(this.probe, this);
      this.buffered = 0;
      this.duration = null;
      this.format = null;
      this.metadata = null;
      this.active = false;
      this.demuxer = null;
      this.decoder = null;
      this.source.once('data', this.probe);
      this.source.on('error', (function(_this) {
        return function(err) {
          _this.emit('error', err);
          return _this.stop();
        };
      })(this));
      this.source.on('progress', (function(_this) {
        return function(buffered) {
          _this.buffered = buffered;
          return _this.emit('buffer', _this.buffered);
        };
      })(this));
    }

    Asset.fromURL = function(url, opts) {
      return new Asset(new HTTPSource(url, opts));
    };

    Asset.fromFile = function(file) {
      return new Asset(new FileSource(file));
    };

    Asset.fromBuffer = function(buffer) {
      return new Asset(new BufferSource(buffer));
    };

    Asset.prototype.start = function(decode) {
      if (this.active) {
        return;
      }
      if (decode != null) {
        this.shouldDecode = decode;
      }
      if (this.shouldDecode == null) {
        this.shouldDecode = true;
      }
      this.active = true;
      this.source.start();
      if (this.decoder && this.shouldDecode) {
        return this._decode();
      }
    };

    Asset.prototype.stop = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      return this.source.pause();
    };

    Asset.prototype.get = function(event, callback) {
      if (event !== 'format' && event !== 'duration' && event !== 'metadata') {
        return;
      }
      if (this[event] != null) {
        return callback(this[event]);
      } else {
        this.once(event, (function(_this) {
          return function(value) {
            _this.stop();
            return callback(value);
          };
        })(this));
        return this.start();
      }
    };

    Asset.prototype.decodePacket = function() {
      return this.decoder.decode();
    };

    Asset.prototype.decodeToBuffer = function(callback) {
      var chunks, dataHandler, length;
      length = 0;
      chunks = [];
      this.on('data', dataHandler = function(chunk) {
        length += chunk.length;
        return chunks.push(chunk);
      });
      this.once('end', function() {
        var buf, chunk, j, len, offset;
        buf = new Float32Array(length);
        offset = 0;
        for (j = 0, len = chunks.length; j < len; j++) {
          chunk = chunks[j];
          buf.set(chunk, offset);
          offset += chunk.length;
        }
        this.off('data', dataHandler);
        return callback(buf);
      });
      return this.start();
    };

    Asset.prototype.probe = function(chunk) {
      var demuxer;
      if (!this.active) {
        return;
      }
      demuxer = Demuxer.find(chunk);
      if (!demuxer) {
        return this.emit('error', 'A demuxer for this container was not found.');
      }
      this.demuxer = new demuxer(this.source, chunk);
      this.demuxer.on('format', this.findDecoder);
      this.demuxer.on('duration', (function(_this) {
        return function(duration) {
          _this.duration = duration;
          return _this.emit('duration', _this.duration);
        };
      })(this));
      this.demuxer.on('metadata', (function(_this) {
        return function(metadata) {
          _this.metadata = metadata;
          return _this.emit('metadata', _this.metadata);
        };
      })(this));
      return this.demuxer.on('error', (function(_this) {
        return function(err) {
          _this.emit('error', err);
          return _this.stop();
        };
      })(this));
    };

    Asset.prototype.findDecoder = function(format) {
      var decoder, div;
      this.format = format;
      if (!this.active) {
        return;
      }
      this.emit('format', this.format);
      decoder = Decoder.find(this.format.formatID);
      if (!decoder) {
        return this.emit('error', "A decoder for " + this.format.formatID + " was not found.");
      }
      this.decoder = new decoder(this.demuxer, this.format);
      if (this.format.floatingPoint) {
        this.decoder.on('data', (function(_this) {
          return function(buffer) {
            return _this.emit('data', buffer);
          };
        })(this));
      } else {
        div = Math.pow(2, this.format.bitsPerChannel - 1);
        this.decoder.on('data', (function(_this) {
          return function(buffer) {
            var buf, i, j, len, sample;
            buf = new Float32Array(buffer.length);
            for (i = j = 0, len = buffer.length; j < len; i = ++j) {
              sample = buffer[i];
              buf[i] = sample / div;
            }
            return _this.emit('data', buf);
          };
        })(this));
      }
      this.decoder.on('error', (function(_this) {
        return function(err) {
          _this.emit('error', err);
          return _this.stop();
        };
      })(this));
      this.decoder.on('end', (function(_this) {
        return function() {
          return _this.emit('end');
        };
      })(this));
      this.emit('decodeStart');
      if (this.shouldDecode) {
        return this._decode();
      }
    };

    Asset.prototype._decode = function() {
      while (this.decoder.decode() && this.active) {
        continue;
      }
      if (this.active) {
        return this.decoder.once('data', this._decode);
      }
    };

    Asset.prototype.destroy = function() {
      var ref, ref1, ref2;
      this.stop();
      if ((ref = this.demuxer) != null) {
        ref.off();
      }
      if ((ref1 = this.decoder) != null) {
        ref1.off();
      }
      if ((ref2 = this.source) != null) {
        ref2.off();
      }
      return this.off();
    };

    return Asset;

  })(EventEmitter);

  module.exports = Asset;

}).call(this);


/***/ }),
/* 101 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Asset, AudioDevice, BalanceFilter, EventEmitter, Player, Queue, VolumeFilter,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  Asset = __webpack_require__(100);

  VolumeFilter = __webpack_require__(102);

  BalanceFilter = __webpack_require__(104);

  Queue = __webpack_require__(105);

  AudioDevice = __webpack_require__(99);

  Player = (function(superClass) {
    extend(Player, superClass);

    function Player(asset) {
      this.asset = asset;
      this.startPlaying = bind(this.startPlaying, this);
      this.playing = false;
      this.buffered = 0;
      this.currentTime = 0;
      this.duration = 0;
      this.volume = 100;
      this.pan = 0;
      this.metadata = {};
      this.filters = [new VolumeFilter(this, 'volume'), new BalanceFilter(this, 'pan')];
      this.asset.on('buffer', (function(_this) {
        return function(buffered) {
          _this.buffered = buffered;
          return _this.emit('buffer', _this.buffered);
        };
      })(this));
      this.asset.on('decodeStart', (function(_this) {
        return function() {
          _this.queue = new Queue(_this.asset);
          return _this.queue.once('ready', _this.startPlaying);
        };
      })(this));
      this.asset.on('format', (function(_this) {
        return function(format) {
          _this.format = format;
          return _this.emit('format', _this.format);
        };
      })(this));
      this.asset.on('metadata', (function(_this) {
        return function(metadata) {
          _this.metadata = metadata;
          return _this.emit('metadata', _this.metadata);
        };
      })(this));
      this.asset.on('duration', (function(_this) {
        return function(duration) {
          _this.duration = duration;
          return _this.emit('duration', _this.duration);
        };
      })(this));
      this.asset.on('error', (function(_this) {
        return function(error) {
          return _this.emit('error', error);
        };
      })(this));
    }

    Player.fromURL = function(url, opts) {
      return new Player(Asset.fromURL(url, opts));
    };

    Player.fromFile = function(file) {
      return new Player(Asset.fromFile(file));
    };

    Player.fromBuffer = function(buffer) {
      return new Player(Asset.fromBuffer(buffer));
    };

    Player.prototype.preload = function() {
      if (!this.asset) {
        return;
      }
      this.startedPreloading = true;
      return this.asset.start(false);
    };

    Player.prototype.play = function() {
      var ref;
      if (this.playing) {
        return;
      }
      if (!this.startedPreloading) {
        this.preload();
      }
      this.playing = true;
      return (ref = this.device) != null ? ref.start() : void 0;
    };

    Player.prototype.pause = function() {
      var ref;
      if (!this.playing) {
        return;
      }
      this.playing = false;
      return (ref = this.device) != null ? ref.stop() : void 0;
    };

    Player.prototype.togglePlayback = function() {
      if (this.playing) {
        return this.pause();
      } else {
        return this.play();
      }
    };

    Player.prototype.stop = function() {
      var ref;
      this.pause();
      this.asset.stop();
      return (ref = this.device) != null ? ref.destroy() : void 0;
    };

    Player.prototype.seek = function(timestamp) {
      var ref;
      if ((ref = this.device) != null) {
        ref.stop();
      }
      this.queue.once('ready', (function(_this) {
        return function() {
          var ref1, ref2;
          if ((ref1 = _this.device) != null) {
            ref1.seek(_this.currentTime);
          }
          if (_this.playing) {
            return (ref2 = _this.device) != null ? ref2.start() : void 0;
          }
        };
      })(this));
      timestamp = (timestamp / 1000) * this.format.sampleRate;
      timestamp = this.asset.decoder.seek(timestamp);
      this.currentTime = timestamp / this.format.sampleRate * 1000 | 0;
      this.queue.reset();
      return this.currentTime;
    };

    Player.prototype.startPlaying = function() {
      var frame, frameOffset;
      frame = this.queue.read();
      frameOffset = 0;
      this.device = new AudioDevice(this.format.sampleRate, this.format.channelsPerFrame);
      this.device.on('timeUpdate', (function(_this) {
        return function(currentTime) {
          _this.currentTime = currentTime;
          return _this.emit('progress', _this.currentTime);
        };
      })(this));
      this.refill = (function(_this) {
        return function(buffer) {
          var bufferOffset, filter, i, j, k, len, max, ref, ref1;
          if (!_this.playing) {
            return;
          }
          if (!frame) {
            frame = _this.queue.read();
            frameOffset = 0;
          }
          bufferOffset = 0;
          while (frame && bufferOffset < buffer.length) {
            max = Math.min(frame.length - frameOffset, buffer.length - bufferOffset);
            for (i = j = 0, ref = max; j < ref; i = j += 1) {
              buffer[bufferOffset++] = frame[frameOffset++];
            }
            if (frameOffset === frame.length) {
              frame = _this.queue.read();
              frameOffset = 0;
            }
          }
          ref1 = _this.filters;
          for (k = 0, len = ref1.length; k < len; k++) {
            filter = ref1[k];
            filter.process(buffer);
          }
          if (!frame) {
            if (_this.queue.ended) {
              _this.currentTime = _this.duration;
              _this.emit('progress', _this.currentTime);
              _this.emit('end');
              _this.stop();
            } else {
              _this.device.stop();
            }
          }
        };
      })(this);
      this.device.on('refill', this.refill);
      if (this.playing) {
        this.device.start();
      }
      return this.emit('ready');
    };

    Player.prototype.destroy = function() {
      var ref, ref1;
      this.stop();
      if ((ref = this.device) != null) {
        ref.off();
      }
      if ((ref1 = this.asset) != null) {
        ref1.destroy();
      }
      return this.off();
    };

    return Player;

  })(EventEmitter);

  module.exports = Player;

}).call(this);


/***/ }),
/* 102 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Filter, VolumeFilter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Filter = __webpack_require__(103);

  VolumeFilter = (function(superClass) {
    extend(VolumeFilter, superClass);

    function VolumeFilter() {
      return VolumeFilter.__super__.constructor.apply(this, arguments);
    }

    VolumeFilter.prototype.process = function(buffer) {
      var i, j, ref, vol;
      if (this.value >= 100) {
        return;
      }
      vol = Math.max(0, Math.min(100, this.value)) / 100;
      for (i = j = 0, ref = buffer.length; j < ref; i = j += 1) {
        buffer[i] *= vol;
      }
    };

    return VolumeFilter;

  })(Filter);

  module.exports = VolumeFilter;

}).call(this);


/***/ }),
/* 103 */
/***/ (function(module) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Filter;

  Filter = (function() {
    function Filter(context, key) {
      if (context && key) {
        Object.defineProperty(this, 'value', {
          get: function() {
            return context[key];
          }
        });
      }
    }

    Filter.prototype.process = function(buffer) {};

    return Filter;

  })();

  module.exports = Filter;

}).call(this);


/***/ }),
/* 104 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var BalanceFilter, Filter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Filter = __webpack_require__(103);

  BalanceFilter = (function(superClass) {
    extend(BalanceFilter, superClass);

    function BalanceFilter() {
      return BalanceFilter.__super__.constructor.apply(this, arguments);
    }

    BalanceFilter.prototype.process = function(buffer) {
      var i, j, pan, ref;
      if (this.value === 0) {
        return;
      }
      pan = Math.max(-50, Math.min(50, this.value));
      for (i = j = 0, ref = buffer.length; j < ref; i = j += 2) {
        buffer[i] *= Math.min(1, (50 - pan) / 50);
        buffer[i + 1] *= Math.min(1, (50 + pan) / 50);
      }
    };

    return BalanceFilter;

  })(Filter);

  module.exports = BalanceFilter;

}).call(this);


/***/ }),
/* 105 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var EventEmitter, Queue,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  Queue = (function(superClass) {
    extend(Queue, superClass);

    function Queue(asset) {
      this.asset = asset;
      this.write = bind(this.write, this);
      this.readyMark = 64;
      this.finished = false;
      this.buffering = true;
      this.ended = false;
      this.buffers = [];
      this.asset.on('data', this.write);
      this.asset.on('end', (function(_this) {
        return function() {
          return _this.ended = true;
        };
      })(this));
      this.asset.decodePacket();
    }

    Queue.prototype.write = function(buffer) {
      if (buffer) {
        this.buffers.push(buffer);
      }
      if (this.buffering) {
        if (this.buffers.length >= this.readyMark || this.ended) {
          this.buffering = false;
          return this.emit('ready');
        } else {
          return this.asset.decodePacket();
        }
      }
    };

    Queue.prototype.read = function() {
      if (this.buffers.length === 0) {
        return null;
      }
      this.asset.decodePacket();
      return this.buffers.shift();
    };

    Queue.prototype.reset = function() {
      this.buffers.length = 0;
      this.buffering = true;
      return this.asset.decodePacket();
    };

    return Queue;

  })(EventEmitter);

  module.exports = Queue;

}).call(this);


/***/ }),
/* 106 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var CAFDemuxer, Demuxer, M4ADemuxer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Demuxer = __webpack_require__(97);

  M4ADemuxer = __webpack_require__(107);

  CAFDemuxer = (function(superClass) {
    extend(CAFDemuxer, superClass);

    function CAFDemuxer() {
      return CAFDemuxer.__super__.constructor.apply(this, arguments);
    }

    Demuxer.register(CAFDemuxer);

    CAFDemuxer.probe = function(buffer) {
      return buffer.peekString(0, 4) === 'caff';
    };

    CAFDemuxer.prototype.readChunk = function() {
      var buffer, byteOffset, cookie, entries, flags, i, j, k, key, metadata, offset, ref, ref1, sampleOffset, value;
      if (!this.format && this.stream.available(64)) {
        if (this.stream.readString(4) !== 'caff') {
          return this.emit('error', "Invalid CAF, does not begin with 'caff'");
        }
        this.stream.advance(4);
        if (this.stream.readString(4) !== 'desc') {
          return this.emit('error', "Invalid CAF, 'caff' is not followed by 'desc'");
        }
        if (!(this.stream.readUInt32() === 0 && this.stream.readUInt32() === 32)) {
          return this.emit('error', "Invalid 'desc' size, should be 32");
        }
        this.format = {};
        this.format.sampleRate = this.stream.readFloat64();
        this.format.formatID = this.stream.readString(4);
        flags = this.stream.readUInt32();
        if (this.format.formatID === 'lpcm') {
          this.format.floatingPoint = Boolean(flags & 1);
          this.format.littleEndian = Boolean(flags & 2);
        }
        this.format.bytesPerPacket = this.stream.readUInt32();
        this.format.framesPerPacket = this.stream.readUInt32();
        this.format.channelsPerFrame = this.stream.readUInt32();
        this.format.bitsPerChannel = this.stream.readUInt32();
        this.emit('format', this.format);
      }
      while (this.stream.available(1)) {
        if (!this.headerCache) {
          this.headerCache = {
            type: this.stream.readString(4),
            oversize: this.stream.readUInt32() !== 0,
            size: this.stream.readUInt32()
          };
          if (this.headerCache.oversize) {
            return this.emit('error', "Holy Shit, an oversized file, not supported in JS");
          }
        }
        switch (this.headerCache.type) {
          case 'kuki':
            if (this.stream.available(this.headerCache.size)) {
              if (this.format.formatID === 'aac ') {
                offset = this.stream.offset + this.headerCache.size;
                if (cookie = M4ADemuxer.readEsds(this.stream)) {
                  this.emit('cookie', cookie);
                }
                this.stream.seek(offset);
              } else {
                buffer = this.stream.readBuffer(this.headerCache.size);
                this.emit('cookie', buffer);
              }
              this.headerCache = null;
            }
            break;
          case 'pakt':
            if (this.stream.available(this.headerCache.size)) {
              if (this.stream.readUInt32() !== 0) {
                return this.emit('error', 'Sizes greater than 32 bits are not supported.');
              }
              this.numPackets = this.stream.readUInt32();
              if (this.stream.readUInt32() !== 0) {
                return this.emit('error', 'Sizes greater than 32 bits are not supported.');
              }
              this.numFrames = this.stream.readUInt32();
              this.primingFrames = this.stream.readUInt32();
              this.remainderFrames = this.stream.readUInt32();
              this.emit('duration', this.numFrames / this.format.sampleRate * 1000 | 0);
              this.sentDuration = true;
              byteOffset = 0;
              sampleOffset = 0;
              for (i = j = 0, ref = this.numPackets; j < ref; i = j += 1) {
                this.addSeekPoint(byteOffset, sampleOffset);
                byteOffset += this.format.bytesPerPacket || M4ADemuxer.readDescrLen(this.stream);
                sampleOffset += this.format.framesPerPacket || M4ADemuxer.readDescrLen(this.stream);
              }
              this.headerCache = null;
            }
            break;
          case 'info':
            entries = this.stream.readUInt32();
            metadata = {};
            for (i = k = 0, ref1 = entries; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
              key = this.stream.readString(null);
              value = this.stream.readString(null);
              metadata[key] = value;
            }
            this.emit('metadata', metadata);
            this.headerCache = null;
            break;
          case 'data':
            if (!this.sentFirstDataChunk) {
              this.stream.advance(4);
              this.headerCache.size -= 4;
              if (this.format.bytesPerPacket !== 0 && !this.sentDuration) {
                this.numFrames = this.headerCache.size / this.format.bytesPerPacket;
                this.emit('duration', this.numFrames / this.format.sampleRate * 1000 | 0);
              }
              this.sentFirstDataChunk = true;
            }
            buffer = this.stream.readSingleBuffer(this.headerCache.size);
            this.headerCache.size -= buffer.length;
            this.emit('data', buffer);
            if (this.headerCache.size <= 0) {
              this.headerCache = null;
            }
            break;
          default:
            if (this.stream.available(this.headerCache.size)) {
              this.stream.advance(this.headerCache.size);
              this.headerCache = null;
            }
        }
      }
    };

    return CAFDemuxer;

  })(Demuxer);

}).call(this);


/***/ }),
/* 107 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Demuxer, M4ADemuxer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Demuxer = __webpack_require__(97);

  M4ADemuxer = (function(superClass) {
    var BITS_PER_CHANNEL, TYPES, after, atom, atoms, bool, containers, diskTrack, genres, meta, string;

    extend(M4ADemuxer, superClass);

    function M4ADemuxer() {
      return M4ADemuxer.__super__.constructor.apply(this, arguments);
    }

    Demuxer.register(M4ADemuxer);

    TYPES = ['M4A ', 'M4P ', 'M4B ', 'M4V ', 'isom', 'mp42', 'qt  '];

    M4ADemuxer.probe = function(buffer) {
      var ref;
      return buffer.peekString(4, 4) === 'ftyp' && (ref = buffer.peekString(8, 4), indexOf.call(TYPES, ref) >= 0);
    };

    M4ADemuxer.prototype.init = function() {
      this.atoms = [];
      this.offsets = [];
      this.track = null;
      return this.tracks = [];
    };

    atoms = {};

    containers = {};

    atom = function(name, fn) {
      var c, container, k, len1, ref;
      c = [];
      ref = name.split('.').slice(0, -1);
      for (k = 0, len1 = ref.length; k < len1; k++) {
        container = ref[k];
        c.push(container);
        containers[c.join('.')] = true;
      }
      if (atoms[name] == null) {
        atoms[name] = {};
      }
      return atoms[name].fn = fn;
    };

    after = function(name, fn) {
      if (atoms[name] == null) {
        atoms[name] = {};
      }
      return atoms[name].after = fn;
    };

    M4ADemuxer.prototype.readChunk = function() {
      var handler, path, type;
      this["break"] = false;
      while (this.stream.available(1) && !this["break"]) {
        if (!this.readHeaders) {
          if (!this.stream.available(8)) {
            return;
          }
          this.len = this.stream.readUInt32() - 8;
          this.type = this.stream.readString(4);
          if (this.len === 0) {
            continue;
          }
          this.atoms.push(this.type);
          this.offsets.push(this.stream.offset + this.len);
          this.readHeaders = true;
        }
        path = this.atoms.join('.');
        handler = atoms[path];
        if (handler != null ? handler.fn : void 0) {
          if (!(this.stream.available(this.len) || path === 'mdat')) {
            return;
          }
          handler.fn.call(this);
          if (path in containers) {
            this.readHeaders = false;
          }
        } else if (path in containers) {
          this.readHeaders = false;
        } else {
          if (!this.stream.available(this.len)) {
            return;
          }
          this.stream.advance(this.len);
        }
        while (this.stream.offset >= this.offsets[this.offsets.length - 1]) {
          handler = atoms[this.atoms.join('.')];
          if (handler != null ? handler.after : void 0) {
            handler.after.call(this);
          }
          type = this.atoms.pop();
          this.offsets.pop();
          this.readHeaders = false;
        }
      }
    };

    atom('ftyp', function() {
      var ref;
      if (ref = this.stream.readString(4), indexOf.call(TYPES, ref) < 0) {
        return this.emit('error', 'Not a valid M4A file.');
      }
      return this.stream.advance(this.len - 4);
    });

    atom('moov.trak', function() {
      this.track = {};
      return this.tracks.push(this.track);
    });

    atom('moov.trak.tkhd', function() {
      this.stream.advance(4);
      this.stream.advance(8);
      this.track.id = this.stream.readUInt32();
      return this.stream.advance(this.len - 16);
    });

    atom('moov.trak.mdia.hdlr', function() {
      this.stream.advance(4);
      this.stream.advance(4);
      this.track.type = this.stream.readString(4);
      this.stream.advance(12);
      return this.stream.advance(this.len - 24);
    });

    atom('moov.trak.mdia.mdhd', function() {
      this.stream.advance(4);
      this.stream.advance(8);
      this.track.timeScale = this.stream.readUInt32();
      this.track.duration = this.stream.readUInt32();
      return this.stream.advance(4);
    });

    BITS_PER_CHANNEL = {
      ulaw: 8,
      alaw: 8,
      in24: 24,
      in32: 32,
      fl32: 32,
      fl64: 64
    };

    atom('moov.trak.mdia.minf.stbl.stsd', function() {
      var format, numEntries, ref, ref1, version;
      this.stream.advance(4);
      numEntries = this.stream.readUInt32();
      if (this.track.type !== 'soun') {
        return this.stream.advance(this.len - 8);
      }
      if (numEntries !== 1) {
        return this.emit('error', "Only expecting one entry in sample description atom!");
      }
      this.stream.advance(4);
      format = this.track.format = {};
      format.formatID = this.stream.readString(4);
      this.stream.advance(6);
      this.stream.advance(2);
      version = this.stream.readUInt16();
      this.stream.advance(6);
      format.channelsPerFrame = this.stream.readUInt16();
      format.bitsPerChannel = this.stream.readUInt16();
      this.stream.advance(4);
      format.sampleRate = this.stream.readUInt16();
      this.stream.advance(2);
      if (version === 1) {
        format.framesPerPacket = this.stream.readUInt32();
        this.stream.advance(4);
        format.bytesPerFrame = this.stream.readUInt32();
        this.stream.advance(4);
      } else if (version !== 0) {
        this.emit('error', 'Unknown version in stsd atom');
      }
      if (BITS_PER_CHANNEL[format.formatID] != null) {
        format.bitsPerChannel = BITS_PER_CHANNEL[format.formatID];
      }
      format.floatingPoint = (ref = format.formatID) === 'fl32' || ref === 'fl64';
      format.littleEndian = format.formatID === 'sowt' && format.bitsPerChannel > 8;
      if ((ref1 = format.formatID) === 'twos' || ref1 === 'sowt' || ref1 === 'in24' || ref1 === 'in32' || ref1 === 'fl32' || ref1 === 'fl64' || ref1 === 'raw ' || ref1 === 'NONE') {
        return format.formatID = 'lpcm';
      }
    });

    atom('moov.trak.mdia.minf.stbl.stsd.alac', function() {
      this.stream.advance(4);
      return this.track.cookie = this.stream.readBuffer(this.len - 4);
    });

    atom('moov.trak.mdia.minf.stbl.stsd.esds', function() {
      var offset;
      offset = this.stream.offset + this.len;
      this.track.cookie = M4ADemuxer.readEsds(this.stream);
      return this.stream.seek(offset);
    });

    atom('moov.trak.mdia.minf.stbl.stsd.wave.enda', function() {
      return this.track.format.littleEndian = !!this.stream.readUInt16();
    });

    M4ADemuxer.readDescrLen = function(stream) {
      var c, count, len;
      len = 0;
      count = 4;
      while (count--) {
        c = stream.readUInt8();
        len = (len << 7) | (c & 0x7f);
        if (!(c & 0x80)) {
          break;
        }
      }
      return len;
    };

    M4ADemuxer.readEsds = function(stream) {
      var codec_id, flags, len, tag;
      stream.advance(4);
      tag = stream.readUInt8();
      len = M4ADemuxer.readDescrLen(stream);
      if (tag === 0x03) {
        stream.advance(2);
        flags = stream.readUInt8();
        if (flags & 0x80) {
          stream.advance(2);
        }
        if (flags & 0x40) {
          stream.advance(stream.readUInt8());
        }
        if (flags & 0x20) {
          stream.advance(2);
        }
      } else {
        stream.advance(2);
      }
      tag = stream.readUInt8();
      len = M4ADemuxer.readDescrLen(stream);
      if (tag === 0x04) {
        codec_id = stream.readUInt8();
        stream.advance(1);
        stream.advance(3);
        stream.advance(4);
        stream.advance(4);
        tag = stream.readUInt8();
        len = M4ADemuxer.readDescrLen(stream);
        if (tag === 0x05) {
          return stream.readBuffer(len);
        }
      }
      return null;
    };

    atom('moov.trak.mdia.minf.stbl.stts', function() {
      var entries, i, k, ref;
      this.stream.advance(4);
      entries = this.stream.readUInt32();
      this.track.stts = [];
      for (i = k = 0, ref = entries; k < ref; i = k += 1) {
        this.track.stts[i] = {
          count: this.stream.readUInt32(),
          duration: this.stream.readUInt32()
        };
      }
      return this.setupSeekPoints();
    });

    atom('moov.trak.mdia.minf.stbl.stsc', function() {
      var entries, i, k, ref;
      this.stream.advance(4);
      entries = this.stream.readUInt32();
      this.track.stsc = [];
      for (i = k = 0, ref = entries; k < ref; i = k += 1) {
        this.track.stsc[i] = {
          first: this.stream.readUInt32(),
          count: this.stream.readUInt32(),
          id: this.stream.readUInt32()
        };
      }
      return this.setupSeekPoints();
    });

    atom('moov.trak.mdia.minf.stbl.stsz', function() {
      var entries, i, k, ref;
      this.stream.advance(4);
      this.track.sampleSize = this.stream.readUInt32();
      entries = this.stream.readUInt32();
      if (this.track.sampleSize === 0 && entries > 0) {
        this.track.sampleSizes = [];
        for (i = k = 0, ref = entries; k < ref; i = k += 1) {
          this.track.sampleSizes[i] = this.stream.readUInt32();
        }
      }
      return this.setupSeekPoints();
    });

    atom('moov.trak.mdia.minf.stbl.stco', function() {
      var entries, i, k, ref;
      this.stream.advance(4);
      entries = this.stream.readUInt32();
      this.track.chunkOffsets = [];
      for (i = k = 0, ref = entries; k < ref; i = k += 1) {
        this.track.chunkOffsets[i] = this.stream.readUInt32();
      }
      return this.setupSeekPoints();
    });

    atom('moov.trak.tref.chap', function() {
      var entries, i, k, ref;
      entries = this.len >> 2;
      this.track.chapterTracks = [];
      for (i = k = 0, ref = entries; k < ref; i = k += 1) {
        this.track.chapterTracks[i] = this.stream.readUInt32();
      }
    });

    M4ADemuxer.prototype.setupSeekPoints = function() {
      var i, j, k, l, len1, offset, position, ref, ref1, results, sampleIndex, size, stscIndex, sttsIndex, sttsSample, timestamp;
      if (!((this.track.chunkOffsets != null) && (this.track.stsc != null) && (this.track.sampleSize != null) && (this.track.stts != null))) {
        return;
      }
      stscIndex = 0;
      sttsIndex = 0;
      sttsIndex = 0;
      sttsSample = 0;
      sampleIndex = 0;
      offset = 0;
      timestamp = 0;
      this.track.seekPoints = [];
      ref = this.track.chunkOffsets;
      results = [];
      for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
        position = ref[i];
        for (j = l = 0, ref1 = this.track.stsc[stscIndex].count; l < ref1; j = l += 1) {
          this.track.seekPoints.push({
            offset: offset,
            position: position,
            timestamp: timestamp
          });
          size = this.track.sampleSize || this.track.sampleSizes[sampleIndex++];
          offset += size;
          position += size;
          timestamp += this.track.stts[sttsIndex].duration;
          if (sttsIndex + 1 < this.track.stts.length && ++sttsSample === this.track.stts[sttsIndex].count) {
            sttsSample = 0;
            sttsIndex++;
          }
        }
        if (stscIndex + 1 < this.track.stsc.length && i + 1 === this.track.stsc[stscIndex + 1].first) {
          results.push(stscIndex++);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    after('moov', function() {
      var k, len1, ref, track;
      if (this.mdatOffset != null) {
        this.stream.seek(this.mdatOffset - 8);
      }
      ref = this.tracks;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        track = ref[k];
        if (!(track.type === 'soun')) {
          continue;
        }
        this.track = track;
        break;
      }
      if (this.track.type !== 'soun') {
        this.track = null;
        return this.emit('error', 'No audio tracks in m4a file.');
      }
      this.emit('format', this.track.format);
      this.emit('duration', this.track.duration / this.track.timeScale * 1000 | 0);
      if (this.track.cookie) {
        this.emit('cookie', this.track.cookie);
      }
      return this.seekPoints = this.track.seekPoints;
    });

    atom('mdat', function() {
      var bytes, chunkSize, k, length, numSamples, offset, ref, sample, size;
      if (!this.startedData) {
        if (this.mdatOffset == null) {
          this.mdatOffset = this.stream.offset;
        }
        if (this.tracks.length === 0) {
          bytes = Math.min(this.stream.remainingBytes(), this.len);
          this.stream.advance(bytes);
          this.len -= bytes;
          return;
        }
        this.chunkIndex = 0;
        this.stscIndex = 0;
        this.sampleIndex = 0;
        this.tailOffset = 0;
        this.tailSamples = 0;
        this.startedData = true;
      }
      if (!this.readChapters) {
        this.readChapters = this.parseChapters();
        if (this["break"] = !this.readChapters) {
          return;
        }
        this.stream.seek(this.mdatOffset);
      }
      offset = this.track.chunkOffsets[this.chunkIndex] + this.tailOffset;
      length = 0;
      if (!this.stream.available(offset - this.stream.offset)) {
        this["break"] = true;
        return;
      }
      this.stream.seek(offset);
      while (this.chunkIndex < this.track.chunkOffsets.length) {
        numSamples = this.track.stsc[this.stscIndex].count - this.tailSamples;
        chunkSize = 0;
        for (sample = k = 0, ref = numSamples; k < ref; sample = k += 1) {
          size = this.track.sampleSize || this.track.sampleSizes[this.sampleIndex];
          if (!this.stream.available(length + size)) {
            break;
          }
          length += size;
          chunkSize += size;
          this.sampleIndex++;
        }
        if (sample < numSamples) {
          this.tailOffset += chunkSize;
          this.tailSamples += sample;
          break;
        } else {
          this.chunkIndex++;
          this.tailOffset = 0;
          this.tailSamples = 0;
          if (this.stscIndex + 1 < this.track.stsc.length && this.chunkIndex + 1 === this.track.stsc[this.stscIndex + 1].first) {
            this.stscIndex++;
          }
          if (offset + length !== this.track.chunkOffsets[this.chunkIndex]) {
            break;
          }
        }
      }
      if (length > 0) {
        this.emit('data', this.stream.readBuffer(length));
        return this["break"] = this.chunkIndex === this.track.chunkOffsets.length;
      } else {
        return this["break"] = true;
      }
    });

    M4ADemuxer.prototype.parseChapters = function() {
      var bom, id, k, len, len1, nextTimestamp, point, ref, ref1, ref2, ref3, title, track;
      if (!(((ref = this.track.chapterTracks) != null ? ref.length : void 0) > 0)) {
        return true;
      }
      id = this.track.chapterTracks[0];
      ref1 = this.tracks;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        track = ref1[k];
        if (track.id === id) {
          break;
        }
      }
      if (track.id !== id) {
        this.emit('error', 'Chapter track does not exist.');
      }
      if (this.chapters == null) {
        this.chapters = [];
      }
      while (this.chapters.length < track.seekPoints.length) {
        point = track.seekPoints[this.chapters.length];
        if (!this.stream.available(point.position - this.stream.offset + 32)) {
          return false;
        }
        this.stream.seek(point.position);
        len = this.stream.readUInt16();
        title = null;
        if (!this.stream.available(len)) {
          return false;
        }
        if (len > 2) {
          bom = this.stream.peekUInt16();
          if (bom === 0xfeff || bom === 0xfffe) {
            title = this.stream.readString(len, 'utf16-bom');
          }
        }
        if (title == null) {
          title = this.stream.readString(len, 'utf8');
        }
        nextTimestamp = (ref2 = (ref3 = track.seekPoints[this.chapters.length + 1]) != null ? ref3.timestamp : void 0) != null ? ref2 : track.duration;
        this.chapters.push({
          title: title,
          timestamp: point.timestamp / track.timeScale * 1000 | 0,
          duration: (nextTimestamp - point.timestamp) / track.timeScale * 1000 | 0
        });
      }
      this.emit('chapters', this.chapters);
      return true;
    };

    atom('moov.udta.meta', function() {
      this.metadata = {};
      return this.stream.advance(4);
    });

    after('moov.udta.meta', function() {
      return this.emit('metadata', this.metadata);
    });

    meta = function(field, name, fn) {
      return atom("moov.udta.meta.ilst." + field + ".data", function() {
        this.stream.advance(8);
        this.len -= 8;
        return fn.call(this, name);
      });
    };

    string = function(field) {
      return this.metadata[field] = this.stream.readString(this.len, 'utf8');
    };

    meta('©alb', 'album', string);

    meta('©arg', 'arranger', string);

    meta('©art', 'artist', string);

    meta('©ART', 'artist', string);

    meta('aART', 'albumArtist', string);

    meta('catg', 'category', string);

    meta('©com', 'composer', string);

    meta('©cpy', 'copyright', string);

    meta('cprt', 'copyright', string);

    meta('©cmt', 'comments', string);

    meta('©day', 'releaseDate', string);

    meta('desc', 'description', string);

    meta('©gen', 'genre', string);

    meta('©grp', 'grouping', string);

    meta('©isr', 'ISRC', string);

    meta('keyw', 'keywords', string);

    meta('©lab', 'recordLabel', string);

    meta('ldes', 'longDescription', string);

    meta('©lyr', 'lyrics', string);

    meta('©nam', 'title', string);

    meta('©phg', 'recordingCopyright', string);

    meta('©prd', 'producer', string);

    meta('©prf', 'performers', string);

    meta('purd', 'purchaseDate', string);

    meta('purl', 'podcastURL', string);

    meta('©swf', 'songwriter', string);

    meta('©too', 'encoder', string);

    meta('©wrt', 'composer', string);

    meta('covr', 'coverArt', function(field) {
      return this.metadata[field] = this.stream.readBuffer(this.len);
    });

    genres = ["Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska", "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance", "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock", "Bass", "Soul", "Punk", "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic", "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy", "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American", "Cabaret", "New Wave", "Psychadelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro", "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk/Rock", "National Folk", "Swing", "Fast Fusion", "Bebob", "Latin", "Revival", "Celtic", "Bluegrass", "Avantgarde", "Gothic Rock", "Progressive Rock", "Psychedelic Rock", "Symphonic Rock", "Slow Rock", "Big Band", "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech", "Chanson", "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus", "Porn Groove", "Satire", "Slow Jam", "Club", "Tango", "Samba", "Folklore", "Ballad", "Power Ballad", "Rhythmic Soul", "Freestyle", "Duet", "Punk Rock", "Drum Solo", "A Capella", "Euro-House", "Dance Hall"];

    meta('gnre', 'genre', function(field) {
      return this.metadata[field] = genres[this.stream.readUInt16() - 1];
    });

    meta('tmpo', 'tempo', function(field) {
      return this.metadata[field] = this.stream.readUInt16();
    });

    meta('rtng', 'rating', function(field) {
      var rating;
      rating = this.stream.readUInt8();
      return this.metadata[field] = rating === 2 ? 'Clean' : rating !== 0 ? 'Explicit' : 'None';
    });

    diskTrack = function(field) {
      this.stream.advance(2);
      this.metadata[field] = this.stream.readUInt16() + ' of ' + this.stream.readUInt16();
      return this.stream.advance(this.len - 6);
    };

    meta('disk', 'diskNumber', diskTrack);

    meta('trkn', 'trackNumber', diskTrack);

    bool = function(field) {
      return this.metadata[field] = this.stream.readUInt8() === 1;
    };

    meta('cpil', 'compilation', bool);

    meta('pcst', 'podcast', bool);

    meta('pgap', 'gapless', bool);

    return M4ADemuxer;

  })(Demuxer);

  module.exports = M4ADemuxer;

}).call(this);


/***/ }),
/* 108 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AIFFDemuxer, Demuxer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Demuxer = __webpack_require__(97);

  AIFFDemuxer = (function(superClass) {
    extend(AIFFDemuxer, superClass);

    function AIFFDemuxer() {
      return AIFFDemuxer.__super__.constructor.apply(this, arguments);
    }

    Demuxer.register(AIFFDemuxer);

    AIFFDemuxer.probe = function(buffer) {
      var ref;
      return buffer.peekString(0, 4) === 'FORM' && ((ref = buffer.peekString(8, 4)) === 'AIFF' || ref === 'AIFC');
    };

    AIFFDemuxer.prototype.readChunk = function() {
      var buffer, format, offset, ref;
      if (!this.readStart && this.stream.available(12)) {
        if (this.stream.readString(4) !== 'FORM') {
          return this.emit('error', 'Invalid AIFF.');
        }
        this.fileSize = this.stream.readUInt32();
        this.fileType = this.stream.readString(4);
        this.readStart = true;
        if ((ref = this.fileType) !== 'AIFF' && ref !== 'AIFC') {
          return this.emit('error', 'Invalid AIFF.');
        }
      }
      while (this.stream.available(1)) {
        if (!this.readHeaders && this.stream.available(8)) {
          this.type = this.stream.readString(4);
          this.len = this.stream.readUInt32();
        }
        switch (this.type) {
          case 'COMM':
            if (!this.stream.available(this.len)) {
              return;
            }
            this.format = {
              formatID: 'lpcm',
              channelsPerFrame: this.stream.readUInt16(),
              sampleCount: this.stream.readUInt32(),
              bitsPerChannel: this.stream.readUInt16(),
              sampleRate: this.stream.readFloat80(),
              framesPerPacket: 1,
              littleEndian: false,
              floatingPoint: false
            };
            this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
            if (this.fileType === 'AIFC') {
              format = this.stream.readString(4);
              this.format.littleEndian = format === 'sowt' && this.format.bitsPerChannel > 8;
              this.format.floatingPoint = format === 'fl32' || format === 'fl64';
              if (format === 'twos' || format === 'sowt' || format === 'fl32' || format === 'fl64' || format === 'NONE') {
                format = 'lpcm';
              }
              this.format.formatID = format;
              this.len -= 4;
            }
            this.stream.advance(this.len - 18);
            this.emit('format', this.format);
            this.emit('duration', this.format.sampleCount / this.format.sampleRate * 1000 | 0);
            break;
          case 'SSND':
            if (!(this.readSSNDHeader && this.stream.available(4))) {
              offset = this.stream.readUInt32();
              this.stream.advance(4);
              this.stream.advance(offset);
              this.readSSNDHeader = true;
            }
            buffer = this.stream.readSingleBuffer(this.len);
            this.len -= buffer.length;
            this.readHeaders = this.len > 0;
            this.emit('data', buffer);
            break;
          default:
            if (!this.stream.available(this.len)) {
              return;
            }
            this.stream.advance(this.len);
        }
        if (this.type !== 'SSND') {
          this.readHeaders = false;
        }
      }
    };

    return AIFFDemuxer;

  })(Demuxer);

}).call(this);


/***/ }),
/* 109 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Demuxer, WAVEDemuxer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Demuxer = __webpack_require__(97);

  WAVEDemuxer = (function(superClass) {
    var formats;

    extend(WAVEDemuxer, superClass);

    function WAVEDemuxer() {
      return WAVEDemuxer.__super__.constructor.apply(this, arguments);
    }

    Demuxer.register(WAVEDemuxer);

    WAVEDemuxer.probe = function(buffer) {
      return buffer.peekString(0, 4) === 'RIFF' && buffer.peekString(8, 4) === 'WAVE';
    };

    formats = {
      0x0001: 'lpcm',
      0x0003: 'lpcm',
      0x0006: 'alaw',
      0x0007: 'ulaw'
    };

    WAVEDemuxer.prototype.readChunk = function() {
      var buffer, bytes, encoding;
      if (!this.readStart && this.stream.available(12)) {
        if (this.stream.readString(4) !== 'RIFF') {
          return this.emit('error', 'Invalid WAV file.');
        }
        this.fileSize = this.stream.readUInt32(true);
        this.readStart = true;
        if (this.stream.readString(4) !== 'WAVE') {
          return this.emit('error', 'Invalid WAV file.');
        }
      }
      while (this.stream.available(1)) {
        if (!this.readHeaders && this.stream.available(8)) {
          this.type = this.stream.readString(4);
          this.len = this.stream.readUInt32(true);
        }
        switch (this.type) {
          case 'fmt ':
            encoding = this.stream.readUInt16(true);
            if (!(encoding in formats)) {
              return this.emit('error', 'Unsupported format in WAV file.');
            }
            this.format = {
              formatID: formats[encoding],
              floatingPoint: encoding === 0x0003,
              littleEndian: formats[encoding] === 'lpcm',
              channelsPerFrame: this.stream.readUInt16(true),
              sampleRate: this.stream.readUInt32(true),
              framesPerPacket: 1
            };
            this.stream.advance(4);
            this.stream.advance(2);
            this.format.bitsPerChannel = this.stream.readUInt16(true);
            this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
            this.emit('format', this.format);
            this.stream.advance(this.len - 16);
            break;
          case 'data':
            if (!this.sentDuration) {
              bytes = this.format.bitsPerChannel / 8;
              this.emit('duration', this.len / bytes / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0);
              this.sentDuration = true;
            }
            buffer = this.stream.readSingleBuffer(this.len);
            this.len -= buffer.length;
            this.readHeaders = this.len > 0;
            this.emit('data', buffer);
            break;
          default:
            if (!this.stream.available(this.len)) {
              return;
            }
            this.stream.advance(this.len);
        }
        if (this.type !== 'data') {
          this.readHeaders = false;
        }
      }
    };

    return WAVEDemuxer;

  })(Demuxer);

}).call(this);


/***/ }),
/* 110 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AUDemuxer, Demuxer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Demuxer = __webpack_require__(97);

  AUDemuxer = (function(superClass) {
    var bps, formats;

    extend(AUDemuxer, superClass);

    function AUDemuxer() {
      return AUDemuxer.__super__.constructor.apply(this, arguments);
    }

    Demuxer.register(AUDemuxer);

    AUDemuxer.probe = function(buffer) {
      return buffer.peekString(0, 4) === '.snd';
    };

    bps = [8, 8, 16, 24, 32, 32, 64];

    bps[26] = 8;

    formats = {
      1: 'ulaw',
      27: 'alaw'
    };

    AUDemuxer.prototype.readChunk = function() {
      var bytes, dataSize, encoding, size;
      if (!this.readHeader && this.stream.available(24)) {
        if (this.stream.readString(4) !== '.snd') {
          return this.emit('error', 'Invalid AU file.');
        }
        size = this.stream.readUInt32();
        dataSize = this.stream.readUInt32();
        encoding = this.stream.readUInt32();
        this.format = {
          formatID: formats[encoding] || 'lpcm',
          littleEndian: false,
          floatingPoint: encoding === 6 || encoding === 7,
          bitsPerChannel: bps[encoding - 1],
          sampleRate: this.stream.readUInt32(),
          channelsPerFrame: this.stream.readUInt32(),
          framesPerPacket: 1
        };
        if (this.format.bitsPerChannel == null) {
          return this.emit('error', 'Unsupported encoding in AU file.');
        }
        this.format.bytesPerPacket = (this.format.bitsPerChannel / 8) * this.format.channelsPerFrame;
        if (dataSize !== 0xffffffff) {
          bytes = this.format.bitsPerChannel / 8;
          this.emit('duration', dataSize / bytes / this.format.channelsPerFrame / this.format.sampleRate * 1000 | 0);
        }
        this.emit('format', this.format);
        this.readHeader = true;
      }
      if (this.readHeader) {
        while (this.stream.available(1)) {
          this.emit('data', this.stream.readSingleBuffer(this.stream.remainingBytes()));
        }
      }
    };

    return AUDemuxer;

  })(Demuxer);

}).call(this);


/***/ }),
/* 111 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Decoder, LPCMDecoder,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Decoder = __webpack_require__(98);

  LPCMDecoder = (function(superClass) {
    extend(LPCMDecoder, superClass);

    function LPCMDecoder() {
      this.readChunk = bind(this.readChunk, this);
      return LPCMDecoder.__super__.constructor.apply(this, arguments);
    }

    Decoder.register('lpcm', LPCMDecoder);

    LPCMDecoder.prototype.readChunk = function() {
      var chunkSize, i, j, k, l, littleEndian, m, n, o, output, ref, ref1, ref2, ref3, ref4, ref5, samples, stream;
      stream = this.stream;
      littleEndian = this.format.littleEndian;
      chunkSize = Math.min(4096, stream.remainingBytes());
      samples = chunkSize / (this.format.bitsPerChannel / 8) | 0;
      if (chunkSize < this.format.bitsPerChannel / 8) {
        return null;
      }
      if (this.format.floatingPoint) {
        switch (this.format.bitsPerChannel) {
          case 32:
            output = new Float32Array(samples);
            for (i = j = 0, ref = samples; j < ref; i = j += 1) {
              output[i] = stream.readFloat32(littleEndian);
            }
            break;
          case 64:
            output = new Float64Array(samples);
            for (i = k = 0, ref1 = samples; k < ref1; i = k += 1) {
              output[i] = stream.readFloat64(littleEndian);
            }
            break;
          default:
            throw new Error('Unsupported bit depth.');
        }
      } else {
        switch (this.format.bitsPerChannel) {
          case 8:
            output = new Int8Array(samples);
            for (i = l = 0, ref2 = samples; l < ref2; i = l += 1) {
              output[i] = stream.readInt8();
            }
            break;
          case 16:
            output = new Int16Array(samples);
            for (i = m = 0, ref3 = samples; m < ref3; i = m += 1) {
              output[i] = stream.readInt16(littleEndian);
            }
            break;
          case 24:
            output = new Int32Array(samples);
            for (i = n = 0, ref4 = samples; n < ref4; i = n += 1) {
              output[i] = stream.readInt24(littleEndian);
            }
            break;
          case 32:
            output = new Int32Array(samples);
            for (i = o = 0, ref5 = samples; o < ref5; i = o += 1) {
              output[i] = stream.readInt32(littleEndian);
            }
            break;
          default:
            throw new Error('Unsupported bit depth.');
        }
      }
      return output;
    };

    return LPCMDecoder;

  })(Decoder);

}).call(this);


/***/ }),
/* 112 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var Decoder, XLAWDecoder,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Decoder = __webpack_require__(98);

  XLAWDecoder = (function(superClass) {
    var BIAS, QUANT_MASK, SEG_MASK, SEG_SHIFT, SIGN_BIT;

    extend(XLAWDecoder, superClass);

    function XLAWDecoder() {
      this.readChunk = bind(this.readChunk, this);
      return XLAWDecoder.__super__.constructor.apply(this, arguments);
    }

    Decoder.register('ulaw', XLAWDecoder);

    Decoder.register('alaw', XLAWDecoder);

    SIGN_BIT = 0x80;

    QUANT_MASK = 0xf;

    SEG_SHIFT = 4;

    SEG_MASK = 0x70;

    BIAS = 0x84;

    XLAWDecoder.prototype.init = function() {
      var i, j, k, seg, t, table, val;
      this.format.bitsPerChannel = 16;
      this.table = table = new Int16Array(256);
      if (this.format.formatID === 'ulaw') {
        for (i = j = 0; j < 256; i = ++j) {
          val = ~i;
          t = ((val & QUANT_MASK) << 3) + BIAS;
          t <<= (val & SEG_MASK) >>> SEG_SHIFT;
          table[i] = val & SIGN_BIT ? BIAS - t : t - BIAS;
        }
      } else {
        for (i = k = 0; k < 256; i = ++k) {
          val = i ^ 0x55;
          t = val & QUANT_MASK;
          seg = (val & SEG_MASK) >>> SEG_SHIFT;
          if (seg) {
            t = (t + t + 1 + 32) << (seg + 2);
          } else {
            t = (t + t + 1) << 3;
          }
          table[i] = val & SIGN_BIT ? t : -t;
        }
      }
    };

    XLAWDecoder.prototype.readChunk = function() {
      var i, j, output, ref, samples, stream, table;
      stream = this.stream, table = this.table;
      samples = Math.min(4096, this.stream.remainingBytes());
      if (samples === 0) {
        return;
      }
      output = new Int16Array(samples);
      for (i = j = 0, ref = samples; j < ref; i = j += 1) {
        output[i] = table[stream.readUInt8()];
      }
      return output;
    };

    return XLAWDecoder;

  })(Decoder);

}).call(this);


/***/ }),
/* 113 */
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.10.0
(function() {
  var AudioDevice, EventEmitter, NodeSpeakerDevice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  EventEmitter = __webpack_require__(93);

  AudioDevice = __webpack_require__(99);

  NodeSpeakerDevice = (function(superClass) {
    var Readable, Speaker;

    extend(NodeSpeakerDevice, superClass);

    AudioDevice.register(NodeSpeakerDevice);

    try {
      Speaker = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'speaker'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
      Readable = __webpack_require__(31).Readable;
    } catch (undefined) {}

    NodeSpeakerDevice.supported = Speaker != null;

    function NodeSpeakerDevice(sampleRate, channels) {
      this.sampleRate = sampleRate;
      this.channels = channels;
      this.refill = bind(this.refill, this);
      this.speaker = new Speaker({
        channels: this.channels,
        sampleRate: this.sampleRate,
        bitDepth: 32,
        float: true,
        signed: true
      });
      this.buffer = null;
      this.currentFrame = 0;
      this.ended = false;
      this.input = new Readable;
      this.input._read = this.refill;
      this.input.pipe(this.speaker);
    }

    NodeSpeakerDevice.prototype.refill = function(n) {
      var arr, buffer, frame, i, len, len1, offset;
      buffer = this.buffer;
      len = n / 4;
      arr = new Float32Array(len);
      this.emit('refill', arr);
      if (this.ended) {
        return;
      }
      if ((buffer != null ? buffer.length : void 0) !== n) {
        this.buffer = buffer = new Buffer(n);
      }
      offset = 0;
      for (i = 0, len1 = arr.length; i < len1; i++) {
        frame = arr[i];
        buffer.writeFloatLE(frame, offset);
        offset += 4;
      }
      this.input.push(buffer);
      return this.currentFrame += len / this.channels;
    };

    NodeSpeakerDevice.prototype.destroy = function() {
      this.ended = true;
      return this.input.push(null);
    };

    NodeSpeakerDevice.prototype.getDeviceTime = function() {
      return this.currentFrame;
    };

    return NodeSpeakerDevice;

  })(EventEmitter);

}).call(this);


/***/ }),
/* 114 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.MP3Demuxer = __webpack_require__(115);
exports.MP3Decoder = __webpack_require__(119);


/***/ }),
/* 115 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var AV = __webpack_require__(84);
var ID3v23Stream = __webpack_require__(116).ID3v23Stream;
var ID3v22Stream = __webpack_require__(116).ID3v22Stream;
var MP3FrameHeader = __webpack_require__(117);
var MP3Stream = __webpack_require__(118);

var MP3Demuxer = AV.Demuxer.extend(function() {
    AV.Demuxer.register(this);
    
    this.probe = function(stream) {
        var off = stream.offset;
        
        // skip id3 metadata if it exists
        var id3header = MP3Demuxer.getID3v2Header(stream);
        if (id3header)
            stream.advance(10 + id3header.length);
        
        // attempt to read the header of the first audio frame
        var s = new MP3Stream(new AV.Bitstream(stream));
        var header = null;
        
        try {
            header = MP3FrameHeader.decode(s);
        } catch (e) {};
        
        // go back to the beginning, for other probes
        stream.seek(off);
        
        return !!header;
    };
    
    this.getID3v2Header = function(stream) {
        if (stream.peekString(0, 3) == 'ID3') {
            stream = AV.Stream.fromBuffer(stream.peekBuffer(0, 10));
            stream.advance(3); // 'ID3'

            var major = stream.readUInt8();
            var minor = stream.readUInt8();
            var flags = stream.readUInt8();
            var bytes = stream.readBuffer(4).data;
            var length = (bytes[0] << 21) | (bytes[1] << 14) | (bytes[2] << 7) | bytes[3];

            return { 
                version: '2.' + major + '.' + minor, 
                major: major, 
                minor: minor, 
                flags: flags, 
                length: length 
            };
        }
        
        return null;
    };
    
    const XING_OFFSETS = [[32, 17], [17, 9]];
    this.prototype.parseDuration = function(header) {
        var stream = this.stream;
        var frames;
                
        var offset = stream.offset;
        if (!header || header.layer !== 3)
            return false;
        
        // Check for Xing/Info tag
        stream.advance(XING_OFFSETS[header.flags & MP3FrameHeader.FLAGS.LSF_EXT ? 1 : 0][header.nchannels() === 1 ? 1 : 0]);
        var tag = stream.readString(4);
        if (tag === 'Xing' || tag === 'Info') {
            var flags = stream.readUInt32();
            if (flags & 1) 
                frames = stream.readUInt32();
                
            if (flags & 2)
                var size = stream.readUInt32();
                
            if (flags & 4 && frames && size) {
                for (var i = 0; i < 100; i++) {
                    var b = stream.readUInt8();
                    var pos = b / 256 * size | 0;
                    var time = i / 100 * (frames * header.nbsamples() * 32) | 0;
                    this.addSeekPoint(pos, time);
                }
            }
                
            if (flags & 8)
                stream.advance(4);
                
        } else {
            // Check for VBRI tag (always 32 bytes after end of mpegaudio header)
            stream.seek(offset + 4 + 32);
            tag = stream.readString(4);
            if (tag == 'VBRI' && stream.readUInt16() === 1) { // Check tag version
                stream.advance(4); // skip delay and quality
                stream.advance(4); // skip size
                frames = stream.readUInt32();
                
                var entries = stream.readUInt16();
                var scale = stream.readUInt16();
                var bytesPerEntry = stream.readUInt16();
                var framesPerEntry = stream.readUInt16();
                var fn = 'readUInt' + (bytesPerEntry * 8);
                
                var pos = 0;
                for (var i = 0; i < entries; i++) {
                    this.addSeekPoint(pos, framesPerEntry * i);
                    pos += stream[fn]();
                }
            }
        }
        
        if (!frames)
            return false;
            
        this.emit('duration', (frames * header.nbsamples() * 32) / header.samplerate * 1000 | 0);
        return true;
    };
    
    this.prototype.readChunk = function() {
        var stream = this.stream;
        
        if (!this.sentInfo) {
            // read id3 metadata if it exists
            var id3header = MP3Demuxer.getID3v2Header(stream);
            if (id3header) {
                stream.advance(10);
                
                if (id3header.major > 2) {
                    var id3 = new ID3v23Stream(id3header, stream);
                } else {
                    var id3 = new ID3v22Stream(id3header, stream);
                }
                
                this.emit('metadata', id3.read());
            }
            
            // read the header of the first audio frame
            var off = stream.offset;
            var s = new MP3Stream(new AV.Bitstream(stream));
            
            var header = MP3FrameHeader.decode(s);
            if (!header)
                return this.emit('error', 'Could not find first frame.');
            
            this.emit('format', {
                formatID: 'mp3',
                sampleRate: header.samplerate,
                channelsPerFrame: header.nchannels(),
                bitrate: header.bitrate,
                floatingPoint: true
            });
            
            var sentDuration = this.parseDuration(header);
            stream.advance(off - stream.offset);
            
            // if there were no Xing/VBRI tags, guesstimate the duration based on data size and bitrate
            this.dataSize = 0;
            if (!sentDuration) {
                this.on('end', function() {
                    this.emit('duration', this.dataSize * 8 / header.bitrate * 1000 | 0);
                });
            }
            
            this.sentInfo = true;
        }
        
        while (stream.available(1)) {
            var buffer = stream.readSingleBuffer(stream.remainingBytes());
            this.dataSize += buffer.length;
            this.emit('data', buffer);
        }
    };
});

module.exports = MP3Demuxer;


/***/ }),
/* 116 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var AV = __webpack_require__(84);

const ENCODINGS = ['latin1', 'utf16-bom', 'utf16-be', 'utf8'];

var ID3Stream = AV.Base.extend({
    constructor: function(header, stream) {
        this.header = header;
        this.stream = stream;
        this.offset = 0;
    },
    
    read: function() {
        if (!this.data) {
            this.data = {};
            
            // read all frames
            var frame;
            while (frame = this.readFrame()) {
                // if we already have an instance of this key, add it to an array
                if (frame.key in this.data) {
                    if (!Array.isArray(this.data[frame.key]))
                        this.data[frame.key] = [this.data[frame.key]];
                        
                    this.data[frame.key].push(frame.value);
                } else {
                    this.data[frame.key] = frame.value;
                }
            }
        }

        return this.data;
    },
    
    readFrame: function() {
        if (this.offset >= this.header.length)
            return null;
        
        // get the header    
        var header = this.readHeader();
        var decoder = header.identifier;
        
        if (header.identifier.charCodeAt(0) === 0) {
            this.offset += this.header.length + 1;
            return null;
        }
        
        // map common frame names to a single type
        if (!this.frameTypes[decoder]) {
            for (var key in this.map) {
                if (this.map[key].indexOf(decoder) !== -1) {
                    decoder = key;
                    break;
                }
            }
        }

        if (this.frameTypes[decoder]) {
            // decode the frame
            var frame = this.decodeFrame(header, this.frameTypes[decoder]),
                keys = Object.keys(frame);
            
            // if it only returned one key, use that as the value    
            if (keys.length === 1)
                frame = frame[keys[0]];
            
            var result = {
                value: frame
            };
            
        } else {
            // No frame type found, treat it as binary
            var result = {
                value: this.stream.readBuffer(Math.min(header.length, this.header.length - this.offset))
            };
        }

        result.key = this.names[header.identifier] ? this.names[header.identifier] : header.identifier;
        
        // special sauce for cover art, which should just be a buffer
        if (result.key === 'coverArt')
            result.value = result.value.data;

        this.offset += 10 + header.length;
        return result;
    },

    decodeFrame: function(header, fields) {
        var stream = this.stream,
            start = stream.offset;
            
        var encoding = 0, ret = {};
        var len = Object.keys(fields).length, i = 0;
        
        for (var key in fields) {
            var type = fields[key];
            var rest = header.length - (stream.offset - start);
            i++;
            
            // check for special field names
            switch (key) {
                case 'encoding':
                    encoding = stream.readUInt8();
                    continue;
                
                case 'language':
                    ret.language = stream.readString(3);
                    continue;
            }
            
            // check types
            switch (type) {                    
                case 'latin1':
                    ret[key] = stream.readString(i === len ? rest : null, 'latin1');
                    break;
                    
                case 'string':
                    ret[key] = stream.readString(i === len ? rest : null, ENCODINGS[encoding]);
                    break;
                    
                case 'binary':
                    ret[key] = stream.readBuffer(rest)
                    break;
                    
                case 'int16':
                    ret[key] = stream.readInt16();
                    break;
                    
                case 'int8':
                    ret[key] = stream.readInt8();
                    break;
                    
                case 'int24':
                    ret[key] = stream.readInt24();
                    break;
                    
                case 'int32':
                    ret[key] = stream.readInt32();
                    break;
                    
                case 'int32+':
                    ret[key] = stream.readInt32();
                    if (rest > 4)
                        throw new Error('Seriously dude? Stop playing this song and get a life!');
                        
                    break;
                    
                case 'date':
                    var val = stream.readString(8);
                    ret[key] = new Date(val.slice(0, 4), val.slice(4, 6) - 1, val.slice(6, 8));
                    break;
                    
                case 'frame_id':
                    ret[key] = stream.readString(4);
                    break;
                    
                default:
                    throw new Error('Unknown key type ' + type);
            }
        }
        
        // Just in case something went wrong...
        var rest = header.length - (stream.offset - start);
        if (rest > 0)
            stream.advance(rest);
        
        return ret;
    }
});

// ID3 v2.3 and v2.4 support
exports.ID3v23Stream = ID3Stream.extend({
    readHeader: function() {
        var identifier = this.stream.readString(4);        
        var length = 0;
        
        if (this.header.major === 4) {
            for (var i = 0; i < 4; i++)
                length = (length << 7) + (this.stream.readUInt8() & 0x7f);
        } else {
            length = this.stream.readUInt32();
        }
        
        return {
            identifier: identifier,
            length: length,
            flags: this.stream.readUInt16()
        };
    },
    
    map: {
        text: [
            // Identification Frames
            'TIT1', 'TIT2', 'TIT3', 'TALB', 'TOAL', 'TRCK', 'TPOS', 'TSST', 'TSRC',

            // Involved Persons Frames
            'TPE1', 'TPE2', 'TPE3', 'TPE4', 'TOPE', 'TEXT', 'TOLY', 'TCOM', 'TMCL', 'TIPL', 'TENC',

            // Derived and Subjective Properties Frames
            'TBPM', 'TLEN', 'TKEY', 'TLAN', 'TCON', 'TFLT', 'TMED', 'TMOO',

            // Rights and Licence Frames
            'TCOP', 'TPRO', 'TPUB', 'TOWN', 'TRSN', 'TRSO',

            // Other Text Frames
            'TOFN', 'TDLY', 'TDEN', 'TDOR', 'TDRC', 'TDRL', 'TDTG', 'TSSE', 'TSOA', 'TSOP', 'TSOT',
            
            // Deprecated Text Frames
            'TDAT', 'TIME', 'TORY', 'TRDA', 'TSIZ', 'TYER',
            
            // Non-standard iTunes Frames
            'TCMP', 'TSO2', 'TSOC'
        ],
        
        url: [
            'WCOM', 'WCOP', 'WOAF', 'WOAR', 'WOAS', 'WORS', 'WPAY', 'WPUB'
        ]
    },
    
    frameTypes: {        
        text: {
            encoding: 1,
            value: 'string'
        },
        
        url: {
            value: 'latin1'
        },
        
        TXXX: {
            encoding: 1,
            description: 'string',
            value: 'string'
        },
        
        WXXX: {
            encoding: 1,
            description: 'string',
            value: 'latin1',
        },
        
        USLT: {
            encoding: 1,
            language: 1,
            description: 'string',
            value: 'string'
        },
        
        COMM: {
            encoding: 1,
            language: 1,
            description: 'string',
            value: 'string'
        },
        
        APIC: {
            encoding: 1,
            mime: 'latin1',
            type: 'int8',
            description: 'string',
            data: 'binary'
        },
        
        UFID: {
            owner: 'latin1',
            identifier: 'binary'
        },

        MCDI: {
            value: 'binary'
        },
        
        PRIV: {
            owner: 'latin1',
            value: 'binary'
        },
        
        GEOB: {
            encoding: 1,
            mime: 'latin1',
            filename: 'string',
            description: 'string',
            data: 'binary'
        },
        
        PCNT: {
            value: 'int32+'
        },
        
        POPM: {
            email: 'latin1',
            rating: 'int8',
            counter: 'int32+'
        },
        
        AENC: {
            owner: 'latin1',
            previewStart: 'int16',
            previewLength: 'int16',
            encryptionInfo: 'binary'
        },
        
        ETCO: {
            format: 'int8',
            data: 'binary'  // TODO
        },
        
        MLLT: {
            framesBetweenReference: 'int16',
            bytesBetweenReference: 'int24',
            millisecondsBetweenReference: 'int24',
            bitsForBytesDeviation: 'int8',
            bitsForMillisecondsDev: 'int8',
            data: 'binary' // TODO
        },
        
        SYTC: {
            format: 'int8',
            tempoData: 'binary' // TODO
        },
        
        SYLT: {
            encoding: 1,
            language: 1,
            format: 'int8',
            contentType: 'int8',
            description: 'string',
            data: 'binary' // TODO
        },
        
        RVA2: {
            identification: 'latin1',
            data: 'binary' // TODO
        },
        
        EQU2: {
            interpolationMethod: 'int8',
            identification: 'latin1',
            data: 'binary' // TODO
        },
        
        RVRB: {
            left: 'int16',
            right: 'int16',
            bouncesLeft: 'int8',
            bouncesRight: 'int8',
            feedbackLL: 'int8',
            feedbackLR: 'int8',
            feedbackRR: 'int8',
            feedbackRL: 'int8',
            premixLR: 'int8',
            premixRL: 'int8'
        },
        
        RBUF: {
            size: 'int24',
            flag: 'int8',
            offset: 'int32'
        },
        
        LINK: {
            identifier: 'frame_id',
            url: 'latin1',
            data: 'binary' // TODO stringlist?
        },
        
        POSS: {
            format: 'int8',
            position: 'binary' // TODO
        },
        
        USER: {
            encoding: 1,
            language: 1,
            value: 'string'
        },
        
        OWNE: {
            encoding: 1,
            price: 'latin1',
            purchaseDate: 'date',
            seller: 'string'
        },
        
        COMR: {
            encoding: 1,
            price: 'latin1',
            validUntil: 'date',
            contactURL: 'latin1',
            receivedAs: 'int8',
            seller: 'string',
            description: 'string',
            logoMime: 'latin1',
            logo: 'binary'
        },
        
        ENCR: {
            owner: 'latin1',
            methodSymbol: 'int8',
            data: 'binary'
        },
        
        GRID: {
            owner: 'latin1',
            groupSymbol: 'int8',
            data: 'binary'
        },
        
        SIGN: {
            groupSymbol: 'int8',
            signature: 'binary'
        },
        
        SEEK: {
            value: 'int32'
        },
        
        ASPI: {
            dataStart: 'int32',
            dataLength: 'int32',
            numPoints: 'int16',
            bitsPerPoint: 'int8',
            data: 'binary' // TODO
        },
        
        // Deprecated ID3 v2.3 frames
        IPLS: {
            encoding: 1,
            value: 'string' // list?
        },
        
        RVAD: {
            adjustment: 'int8',
            bits: 'int8',
            data: 'binary' // TODO
        },
        
        EQUA: {
            adjustmentBits: 'int8',
            data: 'binary' // TODO
        }
    },
    
    names: {
        // Identification Frames
        'TIT1': 'grouping',
        'TIT2': 'title',
        'TIT3': 'subtitle',
        'TALB': 'album',
        'TOAL': 'originalAlbumTitle',
        'TRCK': 'trackNumber',
        'TPOS': 'diskNumber',
        'TSST': 'setSubtitle',
        'TSRC': 'ISRC',

        // Involved Persons Frames
        'TPE1': 'artist',
        'TPE2': 'albumArtist',
        'TPE3': 'conductor',
        'TPE4': 'modifiedBy',
        'TOPE': 'originalArtist',
        'TEXT': 'lyricist',
        'TOLY': 'originalLyricist',
        'TCOM': 'composer',
        'TMCL': 'musicianCreditsList',
        'TIPL': 'involvedPeopleList',
        'TENC': 'encodedBy',

        // Derived and Subjective Properties Frames
        'TBPM': 'tempo',
        'TLEN': 'length',
        'TKEY': 'initialKey',
        'TLAN': 'language',
        'TCON': 'genre',
        'TFLT': 'fileType',
        'TMED': 'mediaType',
        'TMOO': 'mood',

        // Rights and Licence Frames
        'TCOP': 'copyright',
        'TPRO': 'producedNotice',
        'TPUB': 'publisher',
        'TOWN': 'fileOwner',
        'TRSN': 'internetRadioStationName',
        'TRSO': 'internetRadioStationOwner',

        // Other Text Frames
        'TOFN': 'originalFilename',
        'TDLY': 'playlistDelay',
        'TDEN': 'encodingTime',
        'TDOR': 'originalReleaseTime',
        'TDRC': 'recordingTime',
        'TDRL': 'releaseTime',
        'TDTG': 'taggingTime',
        'TSSE': 'encodedWith',
        'TSOA': 'albumSortOrder',
        'TSOP': 'performerSortOrder',
        'TSOT': 'titleSortOrder',
        
        // User defined text information
        'TXXX': 'userText',
        
        // Unsynchronised lyrics/text transcription
        'USLT': 'lyrics',

        // Attached Picture Frame
        'APIC': 'coverArt',

        // Unique Identifier Frame
        'UFID': 'uniqueIdentifier',

        // Music CD Identifier Frame
        'MCDI': 'CDIdentifier',

        // Comment Frame
        'COMM': 'comments',
        
        // URL link frames
        'WCOM': 'commercialInformation',
        'WCOP': 'copyrightInformation',
        'WOAF': 'officialAudioFileWebpage',
        'WOAR': 'officialArtistWebpage',
        'WOAS': 'officialAudioSourceWebpage',
        'WORS': 'officialInternetRadioStationHomepage',
        'WPAY': 'payment',
        'WPUB': 'officialPublisherWebpage',

        // User Defined URL Link Frame
        'WXXX': 'url',

        'PRIV': 'private',
        'GEOB': 'generalEncapsulatedObject',
        'PCNT': 'playCount',
        'POPM': 'rating',
        'AENC': 'audioEncryption',
        'ETCO': 'eventTimingCodes',
        'MLLT': 'MPEGLocationLookupTable',
        'SYTC': 'synchronisedTempoCodes',
        'SYLT': 'synchronisedLyrics',
        'RVA2': 'volumeAdjustment',
        'EQU2': 'equalization',
        'RVRB': 'reverb',
        'RBUF': 'recommendedBufferSize',
        'LINK': 'link',
        'POSS': 'positionSynchronisation',
        'USER': 'termsOfUse',
        'OWNE': 'ownership',
        'COMR': 'commercial',
        'ENCR': 'encryption',
        'GRID': 'groupIdentifier',
        'SIGN': 'signature',
        'SEEK': 'seek',
        'ASPI': 'audioSeekPointIndex',

        // Deprecated ID3 v2.3 frames
        'TDAT': 'date',
        'TIME': 'time',
        'TORY': 'originalReleaseYear',
        'TRDA': 'recordingDates',
        'TSIZ': 'size',
        'TYER': 'year',
        'IPLS': 'involvedPeopleList',
        'RVAD': 'volumeAdjustment',
        'EQUA': 'equalization',
        
        // Non-standard iTunes frames
        'TCMP': 'compilation',
        'TSO2': 'albumArtistSortOrder',
        'TSOC': 'composerSortOrder'
    }
});

// ID3 v2.2 support
exports.ID3v22Stream = exports.ID3v23Stream.extend({    
    readHeader: function() {
        var id = this.stream.readString(3);
        
        if (this.frameReplacements[id] && !this.frameTypes[id])
            this.frameTypes[id] = this.frameReplacements[id];
        
        return {
            identifier: this.replacements[id] || id,
            length: this.stream.readUInt24()
        };
    },
    
    // map 3 char ID3 v2.2 names to 4 char ID3 v2.3/4 names
    replacements: {
        'UFI': 'UFID',
        'TT1': 'TIT1',
        'TT2': 'TIT2',
        'TT3': 'TIT3',
        'TP1': 'TPE1',
        'TP2': 'TPE2',
        'TP3': 'TPE3',
        'TP4': 'TPE4',
        'TCM': 'TCOM',
        'TXT': 'TEXT',
        'TLA': 'TLAN',
        'TCO': 'TCON',
        'TAL': 'TALB',
        'TPA': 'TPOS',
        'TRK': 'TRCK',
        'TRC': 'TSRC',
        'TYE': 'TYER',
        'TDA': 'TDAT',
        'TIM': 'TIME',
        'TRD': 'TRDA',
        'TMT': 'TMED',
        'TFT': 'TFLT',
        'TBP': 'TBPM',
        'TCR': 'TCOP',
        'TPB': 'TPUB',
        'TEN': 'TENC',
        'TSS': 'TSSE',
        'TOF': 'TOFN',
        'TLE': 'TLEN',
        'TSI': 'TSIZ',
        'TDY': 'TDLY',
        'TKE': 'TKEY',
        'TOT': 'TOAL',
        'TOA': 'TOPE',
        'TOL': 'TOLY',
        'TOR': 'TORY',
        'TXX': 'TXXX',
        
        'WAF': 'WOAF',
        'WAR': 'WOAR',
        'WAS': 'WOAS',
        'WCM': 'WCOM',
        'WCP': 'WCOP',
        'WPB': 'WPUB',
        'WXX': 'WXXX',
        
        'IPL': 'IPLS',
        'MCI': 'MCDI',
        'ETC': 'ETCO',
        'MLL': 'MLLT',
        'STC': 'SYTC',
        'ULT': 'USLT',
        'SLT': 'SYLT',
        'COM': 'COMM',
        'RVA': 'RVAD',
        'EQU': 'EQUA',
        'REV': 'RVRB',
        
        'GEO': 'GEOB',
        'CNT': 'PCNT',
        'POP': 'POPM',
        'BUF': 'RBUF',
        'CRA': 'AENC',
        'LNK': 'LINK',
        
        // iTunes stuff
        'TST': 'TSOT',
        'TSP': 'TSOP',
        'TSA': 'TSOA',
        'TCP': 'TCMP',
        'TS2': 'TSO2',
        'TSC': 'TSOC'
    },
    
    // replacements for ID3 v2.3/4 frames
    frameReplacements: {
        PIC: {
            encoding: 1,
            format: 'int24',
            type: 'int8',
            description: 'string',
            data: 'binary'
        },
        
        CRM: {
            owner: 'latin1',
            description: 'latin1',
            data: 'binary'
        }
    }
});

/***/ }),
/* 117 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var AV = __webpack_require__(84);

function MP3FrameHeader() {
    this.layer          = 0; // audio layer (1, 2, or 3)
    this.mode           = 0; // channel mode (see above)
    this.mode_extension = 0; // additional mode info
    this.emphasis       = 0; // de-emphasis to use (see above)

    this.bitrate        = 0; // stream bitrate (bps)
    this.samplerate     = 0; // sampling frequency (Hz)

    this.crc_check      = 0; // frame CRC accumulator
    this.crc_target     = 0; // final target CRC checksum

    this.flags          = 0; // flags (see above)
    this.private_bits   = 0; // private bits
}

const BITRATES = [
    // MPEG-1
    [ 0,  32000,  64000,  96000, 128000, 160000, 192000, 224000,  // Layer I
         256000, 288000, 320000, 352000, 384000, 416000, 448000 ],
    [ 0,  32000,  48000,  56000,  64000,  80000,  96000, 112000,  // Layer II
         128000, 160000, 192000, 224000, 256000, 320000, 384000 ],
    [ 0,  32000,  40000,  48000,  56000,  64000,  80000,  96000,  // Layer III
         112000, 128000, 160000, 192000, 224000, 256000, 320000 ],

    // MPEG-2 LSF
    [ 0,  32000,  48000,  56000,  64000,  80000,  96000, 112000,  // Layer I
         128000, 144000, 160000, 176000, 192000, 224000, 256000 ],
    [ 0,   8000,  16000,  24000,  32000,  40000,  48000,  56000,  // Layers
          64000,  80000,  96000, 112000, 128000, 144000, 160000 ] // II & III
];

const SAMPLERATES = [ 
    44100, 48000, 32000 
];

MP3FrameHeader.FLAGS = {
    NPRIVATE_III: 0x0007,   // number of Layer III private bits
    INCOMPLETE  : 0x0008,   // header but not data is decoded

    PROTECTION  : 0x0010,   // frame has CRC protection
    COPYRIGHT   : 0x0020,   // frame is copyright
    ORIGINAL    : 0x0040,   // frame is original (else copy)
    PADDING     : 0x0080,   // frame has additional slot

    I_STEREO    : 0x0100,   // uses intensity joint stereo
    MS_STEREO   : 0x0200,   // uses middle/side joint stereo
    FREEFORMAT  : 0x0400,   // uses free format bitrate

    LSF_EXT     : 0x1000,   // lower sampling freq. extension
    MC_EXT      : 0x2000,   // multichannel audio extension
    MPEG_2_5_EXT: 0x4000    // MPEG 2.5 (unofficial) extension
};

const PRIVATE = {
    HEADER  : 0x0100, // header private bit
    III     : 0x001f  // Layer III private bits (up to 5)
};

MP3FrameHeader.MODE = {
    SINGLE_CHANNEL: 0, // single channel
    DUAL_CHANNEL  : 1, // dual channel
    JOINT_STEREO  : 2, // joint (MS/intensity) stereo
    STEREO        : 3  // normal LR stereo
};

const EMPHASIS = {
    NONE      : 0, // no emphasis
    _50_15_US : 1, // 50/15 microseconds emphasis
    CCITT_J_17: 3, // CCITT J.17 emphasis
    RESERVED  : 2  // unknown emphasis
};

MP3FrameHeader.BUFFER_GUARD = 8;
MP3FrameHeader.BUFFER_MDLEN = (511 + 2048 + MP3FrameHeader.BUFFER_GUARD);

MP3FrameHeader.prototype.copy = function() {
    var clone = new MP3FrameHeader();
    var keys = Object.keys(this);
    
    for (var key in keys) {
        clone[key] = this[key];
    }
    
    return clone;
}

MP3FrameHeader.prototype.nchannels = function () {
    return this.mode === 0 ? 1 : 2;
};

MP3FrameHeader.prototype.nbsamples = function() {
    return (this.layer === 1 ? 12 : ((this.layer === 3 && (this.flags & MP3FrameHeader.FLAGS.LSF_EXT)) ? 18 : 36));
};

MP3FrameHeader.prototype.framesize = function() {
    if (this.bitrate === 0)
        return null;
    
    var padding = (this.flags & MP3FrameHeader.FLAGS.PADDING ? 1 : 0);
    switch (this.layer) {
        case 1:
            var size = (this.bitrate * 12) / this.samplerate | 0;
            return (size + padding) * 4;
            
        case 2:
            var size = (this.bitrate * 144) / this.samplerate | 0;
            return size + padding;
            
        case 3:
        default:
            var lsf = this.flags & MP3FrameHeader.FLAGS.LSF_EXT ? 1 : 0;
            var size = (this.bitrate * 144) / (this.samplerate << lsf) | 0;
            return size + padding;
    }
};

MP3FrameHeader.prototype.decode = function(stream) {
    this.flags        = 0;
    this.private_bits = 0;
    
    // syncword 
    stream.advance(11);

    // MPEG 2.5 indicator (really part of syncword) 
    if (stream.read(1) === 0)
        this.flags |= MP3FrameHeader.FLAGS.MPEG_2_5_EXT;

    // ID 
    if (stream.read(1) === 0) {
        this.flags |= MP3FrameHeader.FLAGS.LSF_EXT;
    } else if (this.flags & MP3FrameHeader.FLAGS.MPEG_2_5_EXT) {
        throw new AV.UnderflowError(); // LOSTSYNC
    }

    // layer 
    this.layer = 4 - stream.read(2);

    if (this.layer === 4)
        throw new Error('Invalid layer');

    // protection_bit 
    if (stream.read(1) === 0)
        this.flags |= MP3FrameHeader.FLAGS.PROTECTION;

    // bitrate_index 
    var index = stream.read(4);
    if (index === 15)
        throw new Error('Invalid bitrate');

    if (this.flags & MP3FrameHeader.FLAGS.LSF_EXT) {
        this.bitrate = BITRATES[3 + (this.layer >> 1)][index];
    } else {
        this.bitrate = BITRATES[this.layer - 1][index];
    }

    // sampling_frequency 
    index = stream.read(2);
    if (index === 3)
        throw new Error('Invalid sampling frequency');

    this.samplerate = SAMPLERATES[index];

    if (this.flags & MP3FrameHeader.FLAGS.LSF_EXT) {
        this.samplerate /= 2;

        if (this.flags & MP3FrameHeader.FLAGS.MPEG_2_5_EXT)
            this.samplerate /= 2;
    }

    // padding_bit 
    if (stream.read(1))
        this.flags |= MP3FrameHeader.FLAGS.PADDING;

    // private_bit 
    if (stream.read(1))
        this.private_bits |= PRIVATE.HEADER;

    // mode 
    this.mode = 3 - stream.read(2);

    // mode_extension 
    this.mode_extension = stream.read(2);

    // copyright 
    if (stream.read(1))
        this.flags |= MP3FrameHeader.FLAGS.COPYRIGHT;

    // original/copy 
    if (stream.read(1))
        this.flags |= MP3FrameHeader.FLAGS.ORIGINAL;

    // emphasis 
    this.emphasis = stream.read(2);

    // crc_check 
    if (this.flags & MP3FrameHeader.FLAGS.PROTECTION)
        this.crc_target = stream.read(16);
};

MP3FrameHeader.decode = function(stream) {
    // synchronize
    var ptr = stream.next_frame;
    var syncing = true;
    var header = null;
    
    while (syncing) {
        syncing = false;
        
        if (stream.sync) {
            if (!stream.available(MP3FrameHeader.BUFFER_GUARD)) {
                stream.next_frame = ptr;
                throw new AV.UnderflowError();
            } else if (!(stream.getU8(ptr) === 0xff && (stream.getU8(ptr + 1) & 0xe0) === 0xe0)) {
                // mark point where frame sync word was expected
                stream.this_frame = ptr;
                stream.next_frame = ptr + 1;
                throw new AV.UnderflowError(); // LOSTSYNC
            }
        } else {
            stream.seek(ptr * 8);
            if (!stream.doSync())
                throw new AV.UnderflowError();
                
            ptr = stream.nextByte();
        }
        
        // begin processing
        stream.this_frame = ptr;
        stream.next_frame = ptr + 1; // possibly bogus sync word
        
        stream.seek(stream.this_frame * 8);
        
        header = new MP3FrameHeader();
        header.decode(stream);
        
        if (header.bitrate === 0) {
            if (stream.freerate === 0 || !stream.sync || (header.layer === 3 && stream.freerate > 640000))
                MP3FrameHeader.free_bitrate(stream, header);
            
            header.bitrate = stream.freerate;
            header.flags |= MP3FrameHeader.FLAGS.FREEFORMAT;
        }
        
        // calculate beginning of next frame
        var pad_slot = (header.flags & MP3FrameHeader.FLAGS.PADDING) ? 1 : 0;
        
        if (header.layer === 1) {
            var N = (((12 * header.bitrate / header.samplerate) << 0) + pad_slot) * 4;
        } else {
            var slots_per_frame = (header.layer === 3 && (header.flags & MP3FrameHeader.FLAGS.LSF_EXT)) ? 72 : 144;
            var N = ((slots_per_frame * header.bitrate / header.samplerate) << 0) + pad_slot;
        }
        
        // verify there is enough data left in buffer to decode this frame
        if (!stream.available(N + MP3FrameHeader.BUFFER_GUARD)) {
            stream.next_frame = stream.this_frame;
            throw new AV.UnderflowError();
        }
        
        stream.next_frame = stream.this_frame + N;
        
        if (!stream.sync) {
            // check that a valid frame header follows this frame
            ptr = stream.next_frame;
            
            if (!(stream.getU8(ptr) === 0xff && (stream.getU8(ptr + 1) & 0xe0) === 0xe0)) {
                ptr = stream.next_frame = stream.this_frame + 1;

                // emulating 'goto sync'
                syncing = true;
                continue;
            }
            
            stream.sync = true;
        }
    }
    
    header.flags |= MP3FrameHeader.FLAGS.INCOMPLETE;
    return header;
};

MP3FrameHeader.free_bitrate = function(stream, header) {
    var pad_slot = header.flags & MP3FrameHeader.FLAGS.PADDING ? 1 : 0,
        slots_per_frame = header.layer === 3 && header.flags & MP3FrameHeader.FLAGS.LSF_EXT ? 72 : 144;
    
    var start = stream.offset();
    var rate = 0;
        
    while (stream.doSync()) {
        var peek_header = header.copy();
        var peek_stream = stream.copy();
        
        if (peek_header.decode(peek_stream) && peek_header.layer === header.layer && peek_header.samplerate === header.samplerate) {
            var N = stream.nextByte() - stream.this_frame;
            
            if (header.layer === 1) {
                rate = header.samplerate * (N - 4 * pad_slot + 4) / 48 / 1000 | 0;
            } else {
                rate = header.samplerate * (N - pad_slot + 1) / slots_per_frame / 1000 | 0;
            }
            
            if (rate >= 8)
                break;
        }
        
        stream.advance(8);
    }
    
    stream.seek(start);
    
    if (rate < 8 || (header.layer === 3 && rate > 640))
        throw new AV.UnderflowError(); // LOSTSYNC
    
    stream.freerate = rate * 1000;
};

module.exports = MP3FrameHeader;


/***/ }),
/* 118 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var AV = __webpack_require__(84);
var MP3FrameHeader = __webpack_require__(117);

function MP3Stream(stream) {
    this.stream = stream;                     // actual bitstream
    this.sync = false;                        // stream sync found
    this.freerate = 0;                        // free bitrate (fixed)
    this.this_frame = stream.stream.offset;   // start of current frame
    this.next_frame = stream.stream.offset;   // start of next frame
    
    this.main_data = new Uint8Array(MP3FrameHeader.BUFFER_MDLEN); // actual audio data
    this.md_len = 0;                               // length of main data
    
    // copy methods from actual stream
    for (var key in stream) {
        if (typeof stream[key] === 'function')
            this[key] = stream[key].bind(stream);
    }
}

MP3Stream.prototype.getU8 = function(offset) {
    var stream = this.stream.stream;
    return stream.peekUInt8(offset - stream.offset);
};

MP3Stream.prototype.nextByte = function() {
    var stream = this.stream;
    return stream.bitPosition === 0 ? stream.stream.offset : stream.stream.offset + 1;
};

MP3Stream.prototype.doSync = function() {
    var stream = this.stream.stream;
    this.align();
    
    while (this.available(16) && !(stream.peekUInt8(0) === 0xff && (stream.peekUInt8(1) & 0xe0) === 0xe0)) {
        this.advance(8);
    }

    if (!this.available(MP3FrameHeader.BUFFER_GUARD))
        return false;
        
    return true;
};

MP3Stream.prototype.reset = function(byteOffset) {
    this.seek(byteOffset * 8);
    this.next_frame = byteOffset;
    this.sync = true;
};

module.exports = MP3Stream;


/***/ }),
/* 119 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var AV = __webpack_require__(84);
var MP3FrameHeader = __webpack_require__(117);
var MP3Stream = __webpack_require__(118);
var MP3Frame = __webpack_require__(120);
var MP3Synth = __webpack_require__(122);
var Layer1 = __webpack_require__(123);
var Layer2 = __webpack_require__(125);
var Layer3 = __webpack_require__(126);

var MP3Decoder = AV.Decoder.extend(function() {
    AV.Decoder.register('mp3', this);
    
    this.prototype.init = function() {
        this.mp3_stream = new MP3Stream(this.bitstream);
        this.frame = new MP3Frame();
        this.synth = new MP3Synth();
        this.seeking = false;
    };
    
    this.prototype.readChunk = function() {
        var stream = this.mp3_stream;
        var frame = this.frame;
        var synth = this.synth;

        // if we just seeked, we may start getting errors involving the frame reservoir,
        // so keep going until we successfully decode a frame
        if (this.seeking) {
            while (true) {
                try {
                    frame.decode(stream);
                    break;
                } catch (err) {
                    if (err instanceof AV.UnderflowError)
                        throw err;
                }
            }
            
            this.seeking = false;
        } else {
            frame.decode(stream);
        }
        
        synth.frame(frame);
        
        // interleave samples
        var data = synth.pcm.samples,
            channels = synth.pcm.channels,
            len = synth.pcm.length,
            output = new Float32Array(len * channels),
            j = 0;
        
        for (var k = 0; k < len; k++) {
            for (var i = 0; i < channels; i++) {
                output[j++] = data[i][k];
            }
        }
        
        return output;
    };
    
    this.prototype.seek = function(timestamp) {
        var offset;
        
        // if there was a Xing or VBRI tag with a seek table, use that
        // otherwise guesstimate based on CBR bitrate
        if (this.demuxer.seekPoints.length > 0) {
            timestamp = this._super(timestamp);
            offset = this.stream.offset;
        } else {
            offset = timestamp * this.format.bitrate / 8 / this.format.sampleRate;
        }
        
        this.mp3_stream.reset(offset);
        
        // try to find 3 consecutive valid frame headers in a row
        for (var i = 0; i < 4096; i++) {
            var pos = offset + i;
            for (var j = 0; j < 3; j++) {
                this.mp3_stream.reset(pos);
                
                try {
                    var header = MP3FrameHeader.decode(this.mp3_stream);
                } catch (e) {
                    break;
                }
                
                // skip the rest of the frame
                var size = header.framesize();
                if (size == null)
                    break;
                        
                pos += size;
            }
            
            // check if we're done
            if (j === 3)
                break;
        }
        
        // if we didn't find 3 frames, just try the first one and hope for the best
        if (j !== 3)
            i = 0;
            
        this.mp3_stream.reset(offset + i);
        
        // if we guesstimated, update the timestamp to another estimate of where we actually seeked to
        if (this.demuxer.seekPoints.length === 0)
            timestamp = this.stream.offset / (this.format.bitrate / 8) * this.format.sampleRate;
        
        this.seeking = true;
        return timestamp;
    };
});

module.exports = MP3Decoder;


/***/ }),
/* 120 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var MP3FrameHeader = __webpack_require__(117);
var utils = __webpack_require__(121);

function MP3Frame() {
    this.header = null;                     // MPEG audio header
    this.options = 0;                       // decoding options (from stream)
    this.sbsample = utils.makeArray([2, 36, 32]); // synthesis subband filter samples
    this.overlap = utils.makeArray([2, 32, 18]);  // Layer III block overlap data
    this.decoders = [];
}

// included layer decoders are registered here
MP3Frame.layers = [];

MP3Frame.prototype.decode = function(stream) {
    if (!this.header || !(this.header.flags & MP3FrameHeader.FLAGS.INCOMPLETE))
        this.header = MP3FrameHeader.decode(stream);

    this.header.flags &= ~MP3FrameHeader.FLAGS.INCOMPLETE;
    
    // make an instance of the decoder for this layer if needed
    var decoder = this.decoders[this.header.layer - 1];
    if (!decoder) {
        var Layer = MP3Frame.layers[this.header.layer];
        if (!Layer)
            throw new Error("Layer " + this.header.layer + " is not supported.");
            
        decoder = this.decoders[this.header.layer - 1] = new Layer();
    }
    
    decoder.decode(stream, this);
};

module.exports = MP3Frame;


/***/ }),
/* 121 */
/***/ ((__unused_webpack_module, exports) => {

/**
 * Makes a multidimensional array
 */
exports.makeArray = function(lengths, Type) {
    if (!Type) Type = Float64Array;
    
    if (lengths.length === 1) {
        return new Type(lengths[0]);
    }
    
    var ret = [],
        len = lengths[0];
        
    for (var j = 0; j < len; j++) {
        ret[j] = exports.makeArray(lengths.slice(1), Type);
    }
    
    return ret;
};


/***/ }),
/* 122 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var utils = __webpack_require__(121);

function MP3Synth() {
    this.filter = utils.makeArray([2, 2, 2, 16, 8]); // polyphase filterbank outputs
    this.phase = 0;
    
    this.pcm = {
        samplerate: 0,
        channels: 0,
        length: 0,
        samples: [new Float64Array(1152), new Float64Array(1152)]
    };
}

/* costab[i] = cos(PI / (2 * 32) * i) */
const costab1  = 0.998795456;
const costab2  = 0.995184727;
const costab3  = 0.989176510;
const costab4  = 0.980785280;
const costab5  = 0.970031253;
const costab6  = 0.956940336;
const costab7  = 0.941544065;
const costab8  = 0.923879533;
const costab9  = 0.903989293;
const costab10 = 0.881921264;
const costab11 = 0.857728610;
const costab12 = 0.831469612;
const costab13 = 0.803207531;
const costab14 = 0.773010453;
const costab15 = 0.740951125;
const costab16 = 0.707106781;
const costab17 = 0.671558955;
const costab18 = 0.634393284;
const costab19 = 0.595699304;
const costab20 = 0.555570233;
const costab21 = 0.514102744;
const costab22 = 0.471396737;
const costab23 = 0.427555093;
const costab24 = 0.382683432;
const costab25 = 0.336889853;
const costab26 = 0.290284677;
const costab27 = 0.242980180;
const costab28 = 0.195090322;
const costab29 = 0.146730474;
const costab30 = 0.098017140;
const costab31 = 0.049067674;

/*
 * NAME:    dct32()
 * DESCRIPTION: perform fast in[32].out[32] DCT
 */
MP3Synth.dct32 = function (_in, slot, lo, hi) {
    var t0,   t1,   t2,   t3,   t4,   t5,   t6,   t7;
    var t8,   t9,   t10,  t11,  t12,  t13,  t14,  t15;
    var t16,  t17,  t18,  t19,  t20,  t21,  t22,  t23;
    var t24,  t25,  t26,  t27,  t28,  t29,  t30,  t31;
    var t32,  t33,  t34,  t35,  t36,  t37,  t38,  t39;
    var t40,  t41,  t42,  t43,  t44,  t45,  t46,  t47;
    var t48,  t49,  t50,  t51,  t52,  t53,  t54,  t55;
    var t56,  t57,  t58,  t59,  t60,  t61,  t62,  t63;
    var t64,  t65,  t66,  t67,  t68,  t69,  t70,  t71;
    var t72,  t73,  t74,  t75,  t76,  t77,  t78,  t79;
    var t80,  t81,  t82,  t83,  t84,  t85,  t86,  t87;
    var t88,  t89,  t90,  t91,  t92,  t93,  t94,  t95;
    var t96,  t97,  t98,  t99,  t100, t101, t102, t103;
    var t104, t105, t106, t107, t108, t109, t110, t111;
    var t112, t113, t114, t115, t116, t117, t118, t119;
    var t120, t121, t122, t123, t124, t125, t126, t127;
    var t128, t129, t130, t131, t132, t133, t134, t135;
    var t136, t137, t138, t139, t140, t141, t142, t143;
    var t144, t145, t146, t147, t148, t149, t150, t151;
    var t152, t153, t154, t155, t156, t157, t158, t159;
    var t160, t161, t162, t163, t164, t165, t166, t167;
    var t168, t169, t170, t171, t172, t173, t174, t175;
    var t176;

    t0   = _in[0]  + _in[31];  t16  = ((_in[0]  - _in[31]) * (costab1));
    t1   = _in[15] + _in[16];  t17  = ((_in[15] - _in[16]) * (costab31));

    t41  = t16 + t17;
    t59  = ((t16 - t17) * (costab2));
    t33  = t0  + t1;
    t50  = ((t0  - t1) * ( costab2));

    t2   = _in[7]  + _in[24];  t18  = ((_in[7]  - _in[24]) * (costab15));
    t3   = _in[8]  + _in[23];  t19  = ((_in[8]  - _in[23]) * (costab17));

    t42  = t18 + t19;
    t60  = ((t18 - t19) * (costab30));
    t34  = t2  + t3;
    t51  = ((t2  - t3) * ( costab30));

    t4   = _in[3]  + _in[28];  t20  = ((_in[3]  - _in[28]) * (costab7));
    t5   = _in[12] + _in[19];  t21  = ((_in[12] - _in[19]) * (costab25));

    t43  = t20 + t21;
    t61  = ((t20 - t21) * (costab14));
    t35  = t4  + t5;
    t52  = ((t4  - t5) * ( costab14));

    t6   = _in[4]  + _in[27];  t22  = ((_in[4]  - _in[27]) * (costab9));
    t7   = _in[11] + _in[20];  t23  = ((_in[11] - _in[20]) * (costab23));

    t44  = t22 + t23;
    t62  = ((t22 - t23) * (costab18));
    t36  = t6  + t7;
    t53  = ((t6  - t7) * ( costab18));

    t8   = _in[1]  + _in[30];  t24  = ((_in[1]  - _in[30]) * (costab3));
    t9   = _in[14] + _in[17];  t25  = ((_in[14] - _in[17]) * (costab29));

    t45  = t24 + t25;
    t63  = ((t24 - t25) * (costab6));
    t37  = t8  + t9;
    t54  = ((t8  - t9) * ( costab6));

    t10  = _in[6]  + _in[25];  t26  = ((_in[6]  - _in[25]) * (costab13));
    t11  = _in[9]  + _in[22];  t27  = ((_in[9]  - _in[22]) * (costab19));

    t46  = t26 + t27;
    t64  = ((t26 - t27) * (costab26));
    t38  = t10 + t11;
    t55  = ((t10 - t11) * (costab26));

    t12  = _in[2]  + _in[29];  t28  = ((_in[2]  - _in[29]) * (costab5));
    t13  = _in[13] + _in[18];  t29  = ((_in[13] - _in[18]) * (costab27));

    t47  = t28 + t29;
    t65  = ((t28 - t29) * (costab10));
    t39  = t12 + t13;
    t56  = ((t12 - t13) * (costab10));

    t14  = _in[5]  + _in[26];  t30  = ((_in[5]  - _in[26]) * (costab11));
    t15  = _in[10] + _in[21];  t31  = ((_in[10] - _in[21]) * (costab21));

    t48  = t30 + t31;
    t66  = ((t30 - t31) * (costab22));
    t40  = t14 + t15;
    t57  = ((t14 - t15) * (costab22));

    t69  = t33 + t34;  t89  = ((t33 - t34) * (costab4));
    t70  = t35 + t36;  t90  = ((t35 - t36) * (costab28));
    t71  = t37 + t38;  t91  = ((t37 - t38) * (costab12));
    t72  = t39 + t40;  t92  = ((t39 - t40) * (costab20));
    t73  = t41 + t42;  t94  = ((t41 - t42) * (costab4));
    t74  = t43 + t44;  t95  = ((t43 - t44) * (costab28));
    t75  = t45 + t46;  t96  = ((t45 - t46) * (costab12));
    t76  = t47 + t48;  t97  = ((t47 - t48) * (costab20));

    t78  = t50 + t51;  t100 = ((t50 - t51) * (costab4));
    t79  = t52 + t53;  t101 = ((t52 - t53) * (costab28));
    t80  = t54 + t55;  t102 = ((t54 - t55) * (costab12));
    t81  = t56 + t57;  t103 = ((t56 - t57) * (costab20));

    t83  = t59 + t60;  t106 = ((t59 - t60) * (costab4));
    t84  = t61 + t62;  t107 = ((t61 - t62) * (costab28));
    t85  = t63 + t64;  t108 = ((t63 - t64) * (costab12));
    t86  = t65 + t66;  t109 = ((t65 - t66) * (costab20));

    t113 = t69  + t70;
    t114 = t71  + t72;

    /*  0 */ hi[15][slot] = t113 + t114;
    /* 16 */ lo[ 0][slot] = ((t113 - t114) * (costab16));

    t115 = t73  + t74;
    t116 = t75  + t76;

    t32  = t115 + t116;

    /*  1 */ hi[14][slot] = t32;

    t118 = t78  + t79;
    t119 = t80  + t81;

    t58  = t118 + t119;

    /*  2 */ hi[13][slot] = t58;

    t121 = t83  + t84;
    t122 = t85  + t86;

    t67  = t121 + t122;

    t49  = (t67 * 2) - t32;

    /*  3 */ hi[12][slot] = t49;

    t125 = t89  + t90;
    t126 = t91  + t92;

    t93  = t125 + t126;

    /*  4 */ hi[11][slot] = t93;

    t128 = t94  + t95;
    t129 = t96  + t97;

    t98  = t128 + t129;

    t68  = (t98 * 2) - t49;

    /*  5 */ hi[10][slot] = t68;

    t132 = t100 + t101;
    t133 = t102 + t103;

    t104 = t132 + t133;

    t82  = (t104 * 2) - t58;

    /*  6 */ hi[ 9][slot] = t82;

    t136 = t106 + t107;
    t137 = t108 + t109;

    t110 = t136 + t137;

    t87  = (t110 * 2) - t67;

    t77  = (t87 * 2) - t68;

    /*  7 */ hi[ 8][slot] = t77;

    t141 = ((t69 - t70) * (costab8));
    t142 = ((t71 - t72) * (costab24));
    t143 = t141 + t142;

    /*  8 */ hi[ 7][slot] = t143;
    /* 24 */ lo[ 8][slot] =
        (((t141 - t142) * (costab16) * 2)) - t143;

    t144 = ((t73 - t74) * (costab8));
    t145 = ((t75 - t76) * (costab24));
    t146 = t144 + t145;

    t88  = (t146 * 2) - t77;

    /*  9 */ hi[ 6][slot] = t88;

    t148 = ((t78 - t79) * (costab8));
    t149 = ((t80 - t81) * (costab24));
    t150 = t148 + t149;

    t105 = (t150 * 2) - t82;

    /* 10 */ hi[ 5][slot] = t105;

    t152 = ((t83 - t84) * (costab8));
    t153 = ((t85 - t86) * (costab24));
    t154 = t152 + t153;

    t111 = (t154 * 2) - t87;

    t99  = (t111 * 2) - t88;

    /* 11 */ hi[ 4][slot] = t99;

    t157 = ((t89 - t90) * (costab8));
    t158 = ((t91 - t92) * (costab24));
    t159 = t157 + t158;

    t127 = (t159 * 2) - t93;

    /* 12 */ hi[ 3][slot] = t127;

    t160 = (((t125 - t126) * (costab16) * 2)) - t127;

    /* 20 */ lo[ 4][slot] = t160;
    /* 28 */ lo[12][slot] =
        (((((t157 - t158) * (costab16) * 2) - t159) * 2)) - t160;

    t161 = ((t94 - t95) * (costab8));
    t162 = ((t96 - t97) * (costab24));
    t163 = t161 + t162;

    t130 = (t163 * 2) - t98;

    t112 = (t130 * 2) - t99;

    /* 13 */ hi[ 2][slot] = t112;

    t164 = (((t128 - t129) * (costab16) * 2)) - t130;

    t166 = ((t100 - t101) * (costab8));
    t167 = ((t102 - t103) * (costab24));
    t168 = t166 + t167;

    t134 = (t168 * 2) - t104;

    t120 = (t134 * 2) - t105;

    /* 14 */ hi[ 1][slot] = t120;

    t135 = (((t118 - t119) * (costab16) * 2)) - t120;

    /* 18 */ lo[ 2][slot] = t135;

    t169 = (((t132 - t133) * (costab16) * 2)) - t134;

    t151 = (t169 * 2) - t135;

    /* 22 */ lo[ 6][slot] = t151;

    t170 = (((((t148 - t149) * (costab16) * 2) - t150) * 2)) - t151;

    /* 26 */ lo[10][slot] = t170;
    /* 30 */ lo[14][slot] =
        (((((((t166 - t167) * (costab16)) * 2 -
             t168) * 2) - t169) * 2) - t170);

    t171 = ((t106 - t107) * (costab8));
    t172 = ((t108 - t109) * (costab24));
    t173 = t171 + t172;

    t138 = (t173 * 2) - t110;
    t123 = (t138 * 2) - t111;
    t139 = (((t121 - t122) * (costab16) * 2)) - t123;
    t117 = (t123 * 2) - t112;

    /* 15 */ hi[ 0][slot] = t117;

    t124 = (((t115 - t116) * (costab16) * 2)) - t117;

    /* 17 */ lo[ 1][slot] = t124;

    t131 = (t139 * 2) - t124;

    /* 19 */ lo[ 3][slot] = t131;

    t140 = (t164 * 2) - t131;

    /* 21 */ lo[ 5][slot] = t140;

    t174 = (((t136 - t137) * (costab16) * 2)) - t138;
    t155 = (t174 * 2) - t139;
    t147 = (t155 * 2) - t140;

    /* 23 */ lo[ 7][slot] = t147;

    t156 = (((((t144 - t145) * (costab16) * 2) - t146) * 2)) - t147;

    /* 25 */ lo[ 9][slot] = t156;

    t175 = (((((t152 - t153) * (costab16) * 2) - t154) * 2)) - t155;
    t165 = (t175 * 2) - t156;

    /* 27 */ lo[11][slot] = t165;

    t176 = (((((((t161 - t162) * (costab16) * 2)) -
               t163) * 2) - t164) * 2) - t165;

    /* 29 */ lo[13][slot] = t176;
    /* 31 */ lo[15][slot] =
        (((((((((t171 - t172) * (costab16)) * 2 -
               t173) * 2) - t174) * 2) - t175) * 2) - t176);

    /*
     * Totals:
     *  80 multiplies
     *  80 additions
     * 119 subtractions
     *  49 shifts (not counting SSO)
     */
};

/*
 * These are the coefficients for the subband synthesis window. This is a
 * reordered version of Table B.3 from ISO/IEC 11172-3.
 */
const D = [
    [  0.000000000,   /*  0 */
       -0.000442505,
       0.003250122,
       -0.007003784,
       0.031082153,
       -0.078628540,
       0.100311279,
       -0.572036743,
       1.144989014,
       0.572036743,
       0.100311279,
       0.078628540,
       0.031082153,
       0.007003784,
       0.003250122,
       0.000442505,

       0.000000000,
       -0.000442505,
       0.003250122,
       -0.007003784,
       0.031082153,
       -0.078628540,
       0.100311279,
       -0.572036743,
       1.144989014,
       0.572036743,
       0.100311279,
       0.078628540,
       0.031082153,
       0.007003784,
       0.003250122,
       0.000442505 ],

    [ -0.000015259,   /*  1 */
      -0.000473022,
      0.003326416,
      -0.007919312,
      0.030517578,
      -0.084182739,
      0.090927124,
      -0.600219727,
      1.144287109,
      0.543823242,
      0.108856201,
      0.073059082,
      0.031478882,
      0.006118774,
      0.003173828,
      0.000396729,

      -0.000015259,
      -0.000473022,
      0.003326416,
      -0.007919312,
      0.030517578,
      -0.084182739,
      0.090927124,
      -0.600219727,
      1.144287109,
      0.543823242,
      0.108856201,
      0.073059082,
      0.031478882,
      0.006118774,
      0.003173828,
      0.000396729 ],

    [ -0.000015259,   /*  2 */
      -0.000534058,
      0.003387451,
      -0.008865356,
      0.029785156,
      -0.089706421,
      0.080688477,
      -0.628295898,
      1.142211914,
      0.515609741,
      0.116577148,
      0.067520142,
      0.031738281,
      0.005294800,
      0.003082275,
      0.000366211,

      -0.000015259,
      -0.000534058,
      0.003387451,
      -0.008865356,
      0.029785156,
      -0.089706421,
      0.080688477,
      -0.628295898,
      1.142211914,
      0.515609741,
      0.116577148,
      0.067520142,
      0.031738281,
      0.005294800,
      0.003082275,
      0.000366211 ],

    [ -0.000015259,   /*  3 */
      -0.000579834,
      0.003433228,
      -0.009841919,
      0.028884888,
      -0.095169067,
      0.069595337,
      -0.656219482,
      1.138763428,
      0.487472534,
      0.123474121,
      0.061996460,
      0.031845093,
      0.004486084,
      0.002990723,
      0.000320435,

      -0.000015259,
      -0.000579834,
      0.003433228,
      -0.009841919,
      0.028884888,
      -0.095169067,
      0.069595337,
      -0.656219482,
      1.138763428,
      0.487472534,
      0.123474121,
      0.061996460,
      0.031845093,
      0.004486084,
      0.002990723,
      0.000320435 ],

    [ -0.000015259,   /*  4 */
      -0.000625610,
      0.003463745,
      -0.010848999,
      0.027801514,
      -0.100540161,
      0.057617187,
      -0.683914185,
      1.133926392,
      0.459472656,
      0.129577637,
      0.056533813,
      0.031814575,
      0.003723145,
      0.002899170,
      0.000289917,

      -0.000015259,
      -0.000625610,
      0.003463745,
      -0.010848999,
      0.027801514,
      -0.100540161,
      0.057617187,
      -0.683914185,
      1.133926392,
      0.459472656,
      0.129577637,
      0.056533813,
      0.031814575,
      0.003723145,
      0.002899170,
      0.000289917 ],

    [ -0.000015259,   /*  5 */
      -0.000686646,
      0.003479004,
      -0.011886597,
      0.026535034,
      -0.105819702,
      0.044784546,
      -0.711318970,
      1.127746582,
      0.431655884,
      0.134887695,
      0.051132202,
      0.031661987,
      0.003005981,
      0.002792358,
      0.000259399,

      -0.000015259,
      -0.000686646,
      0.003479004,
      -0.011886597,
      0.026535034,
      -0.105819702,
      0.044784546,
      -0.711318970,
      1.127746582,
      0.431655884,
      0.134887695,
      0.051132202,
      0.031661987,
      0.003005981,
      0.002792358,
      0.000259399 ],

    [ -0.000015259,   /*  6 */
      -0.000747681,
      0.003479004,
      -0.012939453,
      0.025085449,
      -0.110946655,
      0.031082153,
      -0.738372803,
      1.120223999,
      0.404083252,
      0.139450073,
      0.045837402,
      0.031387329,
      0.002334595,
      0.002685547,
      0.000244141,

      -0.000015259,
      -0.000747681,
      0.003479004,
      -0.012939453,
      0.025085449,
      -0.110946655,
      0.031082153,
      -0.738372803,
      1.120223999,
      0.404083252,
      0.139450073,
      0.045837402,
      0.031387329,
      0.002334595,
      0.002685547,
      0.000244141 ],

    [ -0.000030518,   /*  7 */
      -0.000808716,
      0.003463745,
      -0.014022827,
      0.023422241,
      -0.115921021,
      0.016510010,
      -0.765029907,
      1.111373901,
      0.376800537,
      0.143264771,
      0.040634155,
      0.031005859,
      0.001693726,
      0.002578735,
      0.000213623,

      -0.000030518,
      -0.000808716,
      0.003463745,
      -0.014022827,
      0.023422241,
      -0.115921021,
      0.016510010,
      -0.765029907,
      1.111373901,
      0.376800537,
      0.143264771,
      0.040634155,
      0.031005859,
      0.001693726,
      0.002578735,
      0.000213623 ],

    [ -0.000030518,   /*  8 */
      -0.000885010,
      0.003417969,
      -0.015121460,
      0.021575928,
      -0.120697021,
      0.001068115,
      -0.791213989,
      1.101211548,
      0.349868774,
      0.146362305,
      0.035552979,
      0.030532837,
      0.001098633,
      0.002456665,
      0.000198364,

      -0.000030518,
      -0.000885010,
      0.003417969,
      -0.015121460,
      0.021575928,
      -0.120697021,
      0.001068115,
      -0.791213989,
      1.101211548,
      0.349868774,
      0.146362305,
      0.035552979,
      0.030532837,
      0.001098633,
      0.002456665,
      0.000198364 ],

    [ -0.000030518,   /*  9 */
      -0.000961304,
      0.003372192,
      -0.016235352,
      0.019531250,
      -0.125259399,
      -0.015228271,
      -0.816864014,
      1.089782715,
      0.323318481,
      0.148773193,
      0.030609131,
      0.029937744,
      0.000549316,
      0.002349854,
      0.000167847,

      -0.000030518,
      -0.000961304,
      0.003372192,
      -0.016235352,
      0.019531250,
      -0.125259399,
      -0.015228271,
      -0.816864014,
      1.089782715,
      0.323318481,
      0.148773193,
      0.030609131,
      0.029937744,
      0.000549316,
      0.002349854,
      0.000167847 ],

    [ -0.000030518,   /* 10 */
      -0.001037598,
      0.003280640,
      -0.017349243,
      0.017257690,
      -0.129562378,
      -0.032379150,
      -0.841949463,
      1.077117920,
      0.297210693,
      0.150497437,
      0.025817871,
      0.029281616,
      0.000030518,
      0.002243042,
      0.000152588,

      -0.000030518,
      -0.001037598,
      0.003280640,
      -0.017349243,
      0.017257690,
      -0.129562378,
      -0.032379150,
      -0.841949463,
      1.077117920,
      0.297210693,
      0.150497437,
      0.025817871,
      0.029281616,
      0.000030518,
      0.002243042,
      0.000152588 ],

    [ -0.000045776,   /* 11 */
      -0.001113892,
      0.003173828,
      -0.018463135,
      0.014801025,
      -0.133590698,
      -0.050354004,
      -0.866363525,
      1.063217163,
      0.271591187,
      0.151596069,
      0.021179199,
      0.028533936,
      -0.000442505,
      0.002120972,
      0.000137329,

      -0.000045776,
      -0.001113892,
      0.003173828,
      -0.018463135,
      0.014801025,
      -0.133590698,
      -0.050354004,
      -0.866363525,
      1.063217163,
      0.271591187,
      0.151596069,
      0.021179199,
      0.028533936,
      -0.000442505,
      0.002120972,
      0.000137329 ],

    [ -0.000045776,   /* 12 */
      -0.001205444,
      0.003051758,
      -0.019577026,
      0.012115479,
      -0.137298584,
      -0.069168091,
      -0.890090942,
      1.048156738,
      0.246505737,
      0.152069092,
      0.016708374,
      0.027725220,
      -0.000869751,
      0.002014160,
      0.000122070,

      -0.000045776,
      -0.001205444,
      0.003051758,
      -0.019577026,
      0.012115479,
      -0.137298584,
      -0.069168091,
      -0.890090942,
      1.048156738,
      0.246505737,
      0.152069092,
      0.016708374,
      0.027725220,
      -0.000869751,
      0.002014160,
      0.000122070 ],

    [ -0.000061035,   /* 13 */
      -0.001296997,
      0.002883911,
      -0.020690918,
      0.009231567,
      -0.140670776,
      -0.088775635,
      -0.913055420,
      1.031936646,
      0.221984863,
      0.151962280,
      0.012420654,
      0.026840210,
      -0.001266479,
      0.001907349,
      0.000106812,

      -0.000061035,
      -0.001296997,
      0.002883911,
      -0.020690918,
      0.009231567,
      -0.140670776,
      -0.088775635,
      -0.913055420,
      1.031936646,
      0.221984863,
      0.151962280,
      0.012420654,
      0.026840210,
      -0.001266479,
      0.001907349,
      0.000106812 ],

    [ -0.000061035,   /* 14 */
      -0.001388550,
      0.002700806,
      -0.021789551,
      0.006134033,
      -0.143676758,
      -0.109161377,
      -0.935195923,
      1.014617920,
      0.198059082,
      0.151306152,
      0.008316040,
      0.025909424,
      -0.001617432,
      0.001785278,
      0.000106812,

      -0.000061035,
      -0.001388550,
      0.002700806,
      -0.021789551,
      0.006134033,
      -0.143676758,
      -0.109161377,
      -0.935195923,
      1.014617920,
      0.198059082,
      0.151306152,
      0.008316040,
      0.025909424,
      -0.001617432,
      0.001785278,
      0.000106812 ],

    [ -0.000076294,   /* 15 */
      -0.001480103,
      0.002487183,
      -0.022857666,
      0.002822876,
      -0.146255493,
      -0.130310059,
      -0.956481934,
      0.996246338,
      0.174789429,
      0.150115967,
      0.004394531,
      0.024932861,
      -0.001937866,
      0.001693726,
      0.000091553,

      -0.000076294,
      -0.001480103,
      0.002487183,
      -0.022857666,
      0.002822876,
      -0.146255493,
      -0.130310059,
      -0.956481934,
      0.996246338,
      0.174789429,
      0.150115967,
      0.004394531,
      0.024932861,
      -0.001937866,
      0.001693726,
      0.000091553 ],

    [ -0.000076294,   /* 16 */
      -0.001586914,
      0.002227783,
      -0.023910522,
      -0.000686646,
      -0.148422241,
      -0.152206421,
      -0.976852417,
      0.976852417,
      0.152206421,
      0.148422241,
      0.000686646,
      0.023910522,
      -0.002227783,
      0.001586914,
      0.000076294,

      -0.000076294,
      -0.001586914,
      0.002227783,
      -0.023910522,
      -0.000686646,
      -0.148422241,
      -0.152206421,
      -0.976852417,
      0.976852417,
      0.152206421,
      0.148422241,
      0.000686646,
      0.023910522,
      -0.002227783,
      0.001586914,
      0.000076294 ]
];

/*
 * perform full frequency PCM synthesis
 */
MP3Synth.prototype.full = function(frame, nch, ns) {
    var Dptr, hi, lo, ptr;
    
    for (var ch = 0; ch < nch; ++ch) {
        var sbsample = frame.sbsample[ch];
        var filter  = this.filter[ch];
        var phase   = this.phase;
        var pcm     = this.pcm.samples[ch];
        var pcm1Ptr = 0;
        var pcm2Ptr = 0;

        for (var s = 0; s < ns; ++s) {
            MP3Synth.dct32(sbsample[s], phase >> 1, filter[0][phase & 1], filter[1][phase & 1]);

            var pe = phase & ~1;
            var po = ((phase - 1) & 0xf) | 1;

            /* calculate 32 samples */
            var fe = filter[0][ phase & 1];
            var fx = filter[0][~phase & 1];
            var fo = filter[1][~phase & 1];

            var fePtr = 0;
            var fxPtr = 0;
            var foPtr = 0;
            
            Dptr = 0;

            ptr = D[Dptr];
            _fx = fx[fxPtr];
            _fe = fe[fePtr];

            lo =  _fx[0] * ptr[po +  0];
            lo += _fx[1] * ptr[po + 14];
            lo += _fx[2] * ptr[po + 12];
            lo += _fx[3] * ptr[po + 10];
            lo += _fx[4] * ptr[po +  8];
            lo += _fx[5] * ptr[po +  6];
            lo += _fx[6] * ptr[po +  4];
            lo += _fx[7] * ptr[po +  2];
            lo = -lo;                      
            
            lo += _fe[0] * ptr[pe +  0];
            lo += _fe[1] * ptr[pe + 14];
            lo += _fe[2] * ptr[pe + 12];
            lo += _fe[3] * ptr[pe + 10];
            lo += _fe[4] * ptr[pe +  8];
            lo += _fe[5] * ptr[pe +  6];
            lo += _fe[6] * ptr[pe +  4];
            lo += _fe[7] * ptr[pe +  2];

            pcm[pcm1Ptr++] = lo;
            pcm2Ptr = pcm1Ptr + 30;

            for (var sb = 1; sb < 16; ++sb) {
                ++fePtr;
                ++Dptr;

                /* D[32 - sb][i] === -D[sb][31 - i] */

                ptr = D[Dptr];
                _fo = fo[foPtr];
                _fe = fe[fePtr];

                lo  = _fo[0] * ptr[po +  0];
                lo += _fo[1] * ptr[po + 14];
                lo += _fo[2] * ptr[po + 12];
                lo += _fo[3] * ptr[po + 10];
                lo += _fo[4] * ptr[po +  8];
                lo += _fo[5] * ptr[po +  6];
                lo += _fo[6] * ptr[po +  4];
                lo += _fo[7] * ptr[po +  2];
                lo = -lo;

                lo += _fe[7] * ptr[pe + 2];
                lo += _fe[6] * ptr[pe + 4];
                lo += _fe[5] * ptr[pe + 6];
                lo += _fe[4] * ptr[pe + 8];
                lo += _fe[3] * ptr[pe + 10];
                lo += _fe[2] * ptr[pe + 12];
                lo += _fe[1] * ptr[pe + 14];
                lo += _fe[0] * ptr[pe + 0];

                pcm[pcm1Ptr++] = lo;

                lo =  _fe[0] * ptr[-pe + 31 - 16];
                lo += _fe[1] * ptr[-pe + 31 - 14];
                lo += _fe[2] * ptr[-pe + 31 - 12];
                lo += _fe[3] * ptr[-pe + 31 - 10];
                lo += _fe[4] * ptr[-pe + 31 -  8];
                lo += _fe[5] * ptr[-pe + 31 -  6];
                lo += _fe[6] * ptr[-pe + 31 -  4];
                lo += _fe[7] * ptr[-pe + 31 -  2];

                lo += _fo[7] * ptr[-po + 31 -  2];
                lo += _fo[6] * ptr[-po + 31 -  4];
                lo += _fo[5] * ptr[-po + 31 -  6];
                lo += _fo[4] * ptr[-po + 31 -  8];
                lo += _fo[3] * ptr[-po + 31 - 10];
                lo += _fo[2] * ptr[-po + 31 - 12];
                lo += _fo[1] * ptr[-po + 31 - 14];
                lo += _fo[0] * ptr[-po + 31 - 16];

                pcm[pcm2Ptr--] = lo;
                ++foPtr;
            }

            ++Dptr;

            ptr = D[Dptr];
            _fo = fo[foPtr];

            lo  = _fo[0] * ptr[po +  0];
            lo += _fo[1] * ptr[po + 14];
            lo += _fo[2] * ptr[po + 12];
            lo += _fo[3] * ptr[po + 10];
            lo += _fo[4] * ptr[po +  8];
            lo += _fo[5] * ptr[po +  6];
            lo += _fo[6] * ptr[po +  4];
            lo += _fo[7] * ptr[po +  2];

            pcm[pcm1Ptr] = -lo;
            pcm1Ptr += 16;
            phase = (phase + 1) % 16;
        }
    }
};

// TODO: synth.half()

/*
 * NAME:    synth.frame()
 * DESCRIPTION: perform PCM synthesis of frame subband samples
 */
MP3Synth.prototype.frame = function (frame) {
    var nch = frame.header.nchannels();
    var ns  = frame.header.nbsamples();

    this.pcm.samplerate = frame.header.samplerate;
    this.pcm.channels   = nch;
    this.pcm.length     = 32 * ns;

    /*
     if (frame.options & Mad.Option.HALFSAMPLERATE) {
     this.pcm.samplerate /= 2;
     this.pcm.length     /= 2;

     throw new Error("HALFSAMPLERATE is not supported. What do you think? As if I have the time for this");
     }
     */

    this.full(frame, nch, ns);
    this.phase = (this.phase + ns) % 16;
};

module.exports = MP3Synth;


/***/ }),
/* 123 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var tables = __webpack_require__(124);
var MP3FrameHeader = __webpack_require__(117);
var MP3Frame = __webpack_require__(120);
var utils = __webpack_require__(121);

function Layer1() {    
    this.allocation = utils.makeArray([2, 32], Uint8Array);
    this.scalefactor = utils.makeArray([2, 32], Uint8Array);
}

MP3Frame.layers[1] = Layer1;

// linear scaling table
const LINEAR_TABLE = new Float32Array([
    1.33333333333333, 1.14285714285714, 1.06666666666667,
    1.03225806451613, 1.01587301587302, 1.00787401574803,
    1.00392156862745, 1.00195694716243, 1.00097751710655,
    1.00048851978505, 1.00024420024420, 1.00012208521548,
    1.00006103888177, 1.00003051850948
]);

Layer1.prototype.decode = function(stream, frame) {
    var header = frame.header;
    var nch = header.nchannels();
    
    var bound = 32;
    if (header.mode === MP3FrameHeader.MODE.JOINT_STEREO) {
        header.flags |= MP3FrameHeader.FLAGS.I_STEREO;
        bound = 4 + header.mode_extension * 4;
    }
    
    if (header.flags & MP3FrameHeader.FLAGS.PROTECTION) {
        // TODO: crc check
    }
    
    // decode bit allocations
    var allocation = this.allocation;
    for (var sb = 0; sb < bound; sb++) {
        for (var ch = 0; ch < nch; ch++) {
            var nb = stream.read(4);
            if (nb === 15)
                throw new Error("forbidden bit allocation value");
                
            allocation[ch][sb] = nb ? nb + 1 : 0;
        }
    }
    
    for (var sb = bound; sb < 32; sb++) {
        var nb = stream.read(4);
        if (nb === 15)
            throw new Error("forbidden bit allocation value");
            
        allocation[0][sb] =
        allocation[1][sb] = nb ? nb + 1 : 0;
    }
    
    // decode scalefactors
    var scalefactor = this.scalefactor;
    for (var sb = 0; sb < 32; sb++) {
        for (var ch = 0; ch < nch; ch++) {
            if (allocation[ch][sb]) {
                scalefactor[ch][sb] = stream.read(6);
                
            	/*
            	 * Scalefactor index 63 does not appear in Table B.1 of
            	 * ISO/IEC 11172-3. Nonetheless, other implementations accept it,
                 * so we do as well 
                 */
            }
        }
    }
    
    // decode samples
    for (var s = 0; s < 12; s++) {
        for (var sb = 0; sb < bound; sb++) {
            for (var ch = 0; ch < nch; ch++) {
                var nb = allocation[ch][sb];
                frame.sbsample[ch][s][sb] = nb ? this.sample(stream, nb) * tables.SF_TABLE[scalefactor[ch][sb]] : 0;
            }
        }
        
        for (var sb = bound; sb < 32; sb++) {
            var nb = allocation[0][sb];
            if (nb) {
                var sample = this.sample(stream, nb);
                
                for (var ch = 0; ch < nch; ch++) {
                    frame.sbsample[ch][s][sb] = sample * tables.SF_TABLE[scalefactor[ch][sb]];
                }
            } else {
                for (var ch = 0; ch < nch; ch++) {
                    frame.sbsample[ch][s][sb] = 0;
                }
            }
        }
    }
};

Layer1.prototype.sample = function(stream, nb) {
    var sample = stream.read(nb);
    
    // invert most significant bit, and form a 2's complement sample
    sample ^= 1 << (nb - 1);
    sample |= -(sample & (1 << (nb - 1)));
    sample /= (1 << (nb - 1));
        
    // requantize the sample
    // s'' = (2^nb / (2^nb - 1)) * (s''' + 2^(-nb + 1))
    sample += 1 >> (nb - 1);
    return sample * LINEAR_TABLE[nb - 2];
};

module.exports = Layer1;


/***/ }),
/* 124 */
/***/ ((__unused_webpack_module, exports) => {

/*
 * These are the scalefactor values for Layer I and Layer II.
 * The values are from Table B.1 of ISO/IEC 11172-3.
 *
 * Strictly speaking, Table B.1 has only 63 entries (0-62), thus a strict
 * interpretation of ISO/IEC 11172-3 would suggest that a scalefactor index of
 * 63 is invalid. However, for better compatibility with current practices, we
 * add a 64th entry.
 */
exports.SF_TABLE = new Float32Array([
    2.000000000000, 1.587401051968, 1.259921049895, 1.000000000000, 
    0.793700525984, 0.629960524947, 0.500000000000, 0.396850262992,
    0.314980262474, 0.250000000000, 0.198425131496, 0.157490131237,
    0.125000000000, 0.099212565748, 0.078745065618, 0.062500000000,
    0.049606282874, 0.039372532809, 0.031250000000, 0.024803141437,
    0.019686266405, 0.015625000000, 0.012401570719, 0.009843133202,
    0.007812500000, 0.006200785359, 0.004921566601, 0.003906250000,
    0.003100392680, 0.002460783301, 0.001953125000, 0.001550196340,
    0.001230391650, 0.000976562500, 0.000775098170, 0.000615195825,
    0.000488281250, 0.000387549085, 0.000307597913, 0.000244140625,
    0.000193774542, 0.000153798956, 0.000122070313, 0.000096887271,
    0.000076899478, 0.000061035156, 0.000048443636, 0.000038449739,
    0.000030517578, 0.000024221818, 0.000019224870, 0.000015258789,
    0.000012110909, 0.000009612435, 0.000007629395, 0.000006055454,
    0.000004806217, 0.000003814697, 0.000003027727, 0.000002403109,
    0.000001907349, 0.000001513864, 0.000001201554, 0.000000000000
]);

/*
 * MPEG-1 scalefactor band widths
 * derived from Table B.8 of ISO/IEC 11172-3
 */
const SFB_48000_LONG = new Uint8Array([
    4,  4,  4,  4,  4,  4,  6,  6,  6,   8,  10,
    12, 16, 18, 22, 28, 34, 40, 46, 54,  54, 192
]);

const SFB_44100_LONG = new Uint8Array([
    4,  4,  4,  4,  4,  4,  6,  6,  8,   8,  10,
    12, 16, 20, 24, 28, 34, 42, 50, 54,  76, 158
]);

const SFB_32000_LONG = new Uint8Array([
    4,  4,  4,  4,  4,  4,  6,  6,  8,  10,  12,
    16, 20, 24, 30, 38, 46, 56, 68, 84, 102,  26
]);

const SFB_48000_SHORT = new Uint8Array([
    4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  6,
    6,  6,  6,  6,  6, 10, 10, 10, 12, 12, 12, 14, 14,
    14, 16, 16, 16, 20, 20, 20, 26, 26, 26, 66, 66, 66
]);

const SFB_44100_SHORT = new Uint8Array([
    4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  6,
    6,  6,  8,  8,  8, 10, 10, 10, 12, 12, 12, 14, 14,
    14, 18, 18, 18, 22, 22, 22, 30, 30, 30, 56, 56, 56
]);

const SFB_32000_SHORT = new Uint8Array([
    4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  6,
    6,  6,  8,  8,  8, 12, 12, 12, 16, 16, 16, 20, 20,
    20, 26, 26, 26, 34, 34, 34, 42, 42, 42, 12, 12, 12
]);

const SFB_48000_MIXED = new Uint8Array([
    /* long */   4,  4,  4,  4,  4,  4,  6,  6,
    /* short */  4,  4,  4,  6,  6,  6,  6,  6,  6, 10,
    10, 10, 12, 12, 12, 14, 14, 14, 16, 16,
    16, 20, 20, 20, 26, 26, 26, 66, 66, 66
]);

const SFB_44100_MIXED = new Uint8Array([
    /* long */   4,  4,  4,  4,  4,  4,  6,  6,
    /* short */  4,  4,  4,  6,  6,  6,  8,  8,  8, 10,
    10, 10, 12, 12, 12, 14, 14, 14, 18, 18,
    18, 22, 22, 22, 30, 30, 30, 56, 56, 56
]);

const SFB_32000_MIXED = new Uint8Array([
    /* long */   4,  4,  4,  4,  4,  4,  6,  6,
    /* short */  4,  4,  4,  6,  6,  6,  8,  8,  8, 12,
    12, 12, 16, 16, 16, 20, 20, 20, 26, 26,
    26, 34, 34, 34, 42, 42, 42, 12, 12, 12
]);

/*
 * MPEG-2 scalefactor band widths
 * derived from Table B.2 of ISO/IEC 13818-3
 */
const SFB_24000_LONG = new Uint8Array([
    6,  6,  6,  6,  6,  6,  8, 10, 12,  14,  16,
   18, 22, 26, 32, 38, 46, 54, 62, 70,  76,  36
]);

const SFB_22050_LONG = new Uint8Array([
    6,  6,  6,  6,  6,  6,  8, 10, 12,  14,  16,
   20, 24, 28, 32, 38, 46, 52, 60, 68,  58,  54
]);

const SFB_16000_LONG = SFB_22050_LONG;

const SFB_24000_SHORT = new Uint8Array([
   4,  4,  4,  4,  4,  4,  4,  4,  4,  6,  6,  6,  8,
   8,  8, 10, 10, 10, 12, 12, 12, 14, 14, 14, 18, 18,
  18, 24, 24, 24, 32, 32, 32, 44, 44, 44, 12, 12, 12
]);

const SFB_22050_SHORT = new Uint8Array([
   4,  4,  4,  4,  4,  4,  4,  4,  4,  6,  6,  6,  6,
   6,  6,  8,  8,  8, 10, 10, 10, 14, 14, 14, 18, 18,
  18, 26, 26, 26, 32, 32, 32, 42, 42, 42, 18, 18, 18
]);

const SFB_16000_SHORT = new Uint8Array([
   4,  4,  4,  4,  4,  4,  4,  4,  4,  6,  6,  6,  8,
   8,  8, 10, 10, 10, 12, 12, 12, 14, 14, 14, 18, 18,
  18, 24, 24, 24, 30, 30, 30, 40, 40, 40, 18, 18, 18
]);

const SFB_24000_MIXED = new Uint8Array([
  /* long */   6,  6,  6,  6,  6,  6,
  /* short */  6,  6,  6,  8,  8,  8, 10, 10, 10, 12,
              12, 12, 14, 14, 14, 18, 18, 18, 24, 24,
              24, 32, 32, 32, 44, 44, 44, 12, 12, 12
]);

const SFB_22050_MIXED = new Uint8Array([
  /* long */   6,  6,  6,  6,  6,  6,
  /* short */  6,  6,  6,  6,  6,  6,  8,  8,  8, 10,
              10, 10, 14, 14, 14, 18, 18, 18, 26, 26,
              26, 32, 32, 32, 42, 42, 42, 18, 18, 18
]);

const SFB_16000_MIXED = new Uint8Array([
  /* long */   6,  6,  6,  6,  6,  6,
  /* short */  6,  6,  6,  8,  8,  8, 10, 10, 10, 12,
              12, 12, 14, 14, 14, 18, 18, 18, 24, 24,
              24, 30, 30, 30, 40, 40, 40, 18, 18, 18
]);

/*
 * MPEG 2.5 scalefactor band widths
 * derived from public sources
 */
const SFB_12000_LONG = SFB_16000_LONG;
const SFB_11025_LONG = SFB_12000_LONG;

const SFB_8000_LONG = new Uint8Array([
  12, 12, 12, 12, 12, 12, 16, 20, 24,  28,  32,
  40, 48, 56, 64, 76, 90,  2,  2,  2,   2,   2
]);

const SFB_12000_SHORT = SFB_16000_SHORT;
const SFB_11025_SHORT = SFB_12000_SHORT;

const SFB_8000_SHORT = new Uint8Array([
   8,  8,  8,  8,  8,  8,  8,  8,  8, 12, 12, 12, 16,
  16, 16, 20, 20, 20, 24, 24, 24, 28, 28, 28, 36, 36,
  36,  2,  2,  2,  2,  2,  2,  2,  2,  2, 26, 26, 26
]);

const SFB_12000_MIXED = SFB_16000_MIXED;
const SFB_11025_MIXED = SFB_12000_MIXED;

/* the 8000 Hz short block scalefactor bands do not break after
   the first 36 frequency lines, so this is probably wrong */
const SFB_8000_MIXED = new Uint8Array([
  /* long */  12, 12, 12,
  /* short */  4,  4,  4,  8,  8,  8, 12, 12, 12, 16, 16, 16,
              20, 20, 20, 24, 24, 24, 28, 28, 28, 36, 36, 36,
               2,  2,  2,  2,  2,  2,  2,  2,  2, 26, 26, 26
]);

exports.SFBWIDTH_TABLE = [
    { l: SFB_48000_LONG, s: SFB_48000_SHORT, m: SFB_48000_MIXED },
    { l: SFB_44100_LONG, s: SFB_44100_SHORT, m: SFB_44100_MIXED },
    { l: SFB_32000_LONG, s: SFB_32000_SHORT, m: SFB_32000_MIXED },
    { l: SFB_24000_LONG, s: SFB_24000_SHORT, m: SFB_24000_MIXED },
    { l: SFB_22050_LONG, s: SFB_22050_SHORT, m: SFB_22050_MIXED },
    { l: SFB_16000_LONG, s: SFB_16000_SHORT, m: SFB_16000_MIXED },
    { l: SFB_12000_LONG, s: SFB_12000_SHORT, m: SFB_12000_MIXED },
    { l: SFB_11025_LONG, s: SFB_11025_SHORT, m: SFB_11025_MIXED },
    { l:  SFB_8000_LONG, s:  SFB_8000_SHORT, m:  SFB_8000_MIXED }
];

exports.PRETAB = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0
]);

/*
 * fractional powers of two
 * used for requantization and joint stereo decoding
 *
 * ROOT_TABLE[3 + x] = 2^(x/4)
 */
exports.ROOT_TABLE = new Float32Array([
    /* 2^(-3/4) */ 0.59460355750136,
    /* 2^(-2/4) */ 0.70710678118655,
    /* 2^(-1/4) */ 0.84089641525371,
    /* 2^( 0/4) */ 1.00000000000000,
    /* 2^(+1/4) */ 1.18920711500272,
    /* 2^(+2/4) */ 1.41421356237310,
    /* 2^(+3/4) */ 1.68179283050743
]);

exports.CS = new Float32Array([
    +0.857492926 , +0.881741997,
    +0.949628649 , +0.983314592,
    +0.995517816 , +0.999160558,
    +0.999899195 , +0.999993155
]);

exports.CA = new Float32Array([
    -0.514495755, -0.471731969,
    -0.313377454, -0.181913200,
    -0.094574193, -0.040965583,
    -0.014198569, -0.003699975
]);

exports.COUNT1TABLE_SELECT = 0x01;
exports.SCALEFAC_SCALE     = 0x02;
exports.PREFLAG            = 0x04;
exports.MIXED_BLOCK_FLAG   = 0x08;

exports.I_STEREO  = 0x1;
exports.MS_STEREO = 0x2;

/*
 * windowing coefficients for long blocks
 * derived from section 2.4.3.4.10.3 of ISO/IEC 11172-3
 *
 * WINDOW_L[i] = sin((PI / 36) * (i + 1/2))
 */
exports.WINDOW_L = new Float32Array([
    0.043619387, 0.130526192,
    0.216439614, 0.300705800,
    0.382683432, 0.461748613,
    0.537299608, 0.608761429,
    0.675590208, 0.737277337,
    0.793353340, 0.843391446,

    0.887010833, 0.923879533,
    0.953716951, 0.976296007,
    0.991444861, 0.999048222,
    0.999048222, 0.991444861,
    0.976296007, 0.953716951,
    0.923879533, 0.887010833,

    0.843391446, 0.793353340,
    0.737277337, 0.675590208,
    0.608761429, 0.537299608,
    0.461748613, 0.382683432,
    0.300705800, 0.216439614,
    0.130526192, 0.043619387
]);

/*
 * windowing coefficients for short blocks
 * derived from section 2.4.3.4.10.3 of ISO/IEC 11172-3
 *
 * WINDOW_S[i] = sin((PI / 12) * (i + 1/2))
 */
exports.WINDOW_S = new Float32Array([
    0.130526192, 0.382683432,
    0.608761429, 0.793353340,
    0.923879533, 0.991444861,
    0.991444861, 0.923879533,
    0.793353340, 0.608761429,
    0.382683432, 0.130526192
]);

/*
 * coefficients for intensity stereo processing
 * derived from section 2.4.3.4.9.3 of ISO/IEC 11172-3
 *
 * is_ratio[i] = tan(i * (PI / 12))
 * IS_TABLE[i] = is_ratio[i] / (1 + is_ratio[i])
 */
exports.IS_TABLE = new Float32Array([
    0.000000000,
    0.211324865,
    0.366025404,
    0.500000000,
    0.633974596,
    0.788675135,
    1.000000000
]);

/*
 * coefficients for LSF intensity stereo processing
 * derived from section 2.4.3.2 of ISO/IEC 13818-3
 *
 * IS_LSF_TABLE[0][i] = (1 / sqrt(sqrt(2)))^(i + 1)
 * IS_LSF_TABLE[1][i] = (1 /      sqrt(2)) ^(i + 1)
 */
exports.IS_LSF_TABLE = [
    new Float32Array([
        0.840896415,
        0.707106781,
        0.594603558,
        0.500000000,
        0.420448208,
        0.353553391,
        0.297301779,
        0.250000000,
        0.210224104,
        0.176776695,
        0.148650889,
        0.125000000,
        0.105112052,
        0.088388348,
        0.074325445
    ]), 
    new Float32Array([
        0.707106781,
        0.500000000,
        0.353553391,
        0.250000000,
        0.176776695,
        0.125000000,
        0.088388348,
        0.062500000,
        0.044194174,
        0.031250000,
        0.022097087,
        0.015625000,
        0.011048543,
        0.007812500,
        0.005524272
    ])
];

/*
 * scalefactor bit lengths
 * derived from section 2.4.2.7 of ISO/IEC 11172-3
 */
exports.SFLEN_TABLE = [
    { slen1: 0, slen2: 0 }, { slen1: 0, slen2: 1 }, { slen1: 0, slen2: 2 }, { slen1: 0, slen2: 3 },
    { slen1: 3, slen2: 0 }, { slen1: 1, slen2: 1 }, { slen1: 1, slen2: 2 }, { slen1: 1, slen2: 3 },
    { slen1: 2, slen2: 1 }, { slen1: 2, slen2: 2 }, { slen1: 2, slen2: 3 }, { slen1: 3, slen2: 1 },
    { slen1: 3, slen2: 2 }, { slen1: 3, slen2: 3 }, { slen1: 4, slen2: 2 }, { slen1: 4, slen2: 3 }    
];

/*
 * number of LSF scalefactor band values
 * derived from section 2.4.3.2 of ISO/IEC 13818-3
 */
exports.NSFB_TABLE = [
    [ [  6,  5,  5, 5 ],
      [  9,  9,  9, 9 ],
      [  6,  9,  9, 9 ] ],

    [ [  6,  5,  7, 3 ],
      [  9,  9, 12, 6 ],
      [  6,  9, 12, 6 ] ],

    [ [ 11, 10,  0, 0 ],
      [ 18, 18,  0, 0 ],
      [ 15, 18,  0, 0 ] ],

    [ [  7,  7,  7, 0 ],
      [ 12, 12, 12, 0 ],
      [  6, 15, 12, 0 ] ],

    [ [  6,  6,  6, 3 ],
      [ 12,  9,  9, 6 ],
      [  6, 12,  9, 6 ] ],

    [ [  8,  8,  5, 0 ],
      [ 15, 12,  9, 0 ],
      [  6, 18,  9, 0 ] ]
];
 

/***/ }),
/* 125 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var tables = __webpack_require__(124);
var MP3FrameHeader = __webpack_require__(117);
var MP3Frame = __webpack_require__(120);
var utils = __webpack_require__(121);

function Layer2() {    
    this.samples = new Float64Array(3);
    this.allocation = utils.makeArray([2, 32], Uint8Array);
    this.scfsi = utils.makeArray([2, 32], Uint8Array);
    this.scalefactor = utils.makeArray([2, 32, 3], Uint8Array);
}

MP3Frame.layers[2] = Layer2;

// possible quantization per subband table
const SBQUANT = [
  // ISO/IEC 11172-3 Table B.2a
  { sblimit: 27, offsets:
      [ 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0 ] },
      
  // ISO/IEC 11172-3 Table B.2b
  { sblimit: 30, offsets:
      [ 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0 ] },
      
  // ISO/IEC 11172-3 Table B.2c
  {  sblimit: 8, offsets:
      [ 5, 5, 2, 2, 2, 2, 2, 2 ] },
      
  // ISO/IEC 11172-3 Table B.2d
  { sblimit: 12, offsets:
      [ 5, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ] },
      
  // ISO/IEC 13818-3 Table B.1
  { sblimit: 30, offsets:
      [ 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] }
];

// bit allocation table
const BITALLOC = [
    { nbal: 2, offset: 0 },  // 0
    { nbal: 2, offset: 3 },  // 1
    { nbal: 3, offset: 3 },  // 2
    { nbal: 3, offset: 1 },  // 3
    { nbal: 4, offset: 2 },  // 4
    { nbal: 4, offset: 3 },  // 5
    { nbal: 4, offset: 4 },  // 6
    { nbal: 4, offset: 5 }   // 7
];

// offsets into quantization class table
const OFFSETS = [
    [ 0, 1, 16                                             ],  // 0
    [ 0, 1,  2, 3, 4, 5, 16                                ],  // 1
    [ 0, 1,  2, 3, 4, 5,  6, 7,  8,  9, 10, 11, 12, 13, 14 ],  // 2
    [ 0, 1,  3, 4, 5, 6,  7, 8,  9, 10, 11, 12, 13, 14, 15 ],  // 3
    [ 0, 1,  2, 3, 4, 5,  6, 7,  8,  9, 10, 11, 12, 13, 16 ],  // 4
    [ 0, 2,  4, 5, 6, 7,  8, 9, 10, 11, 12, 13, 14, 15, 16 ]   // 5
];



/*
 * These are the Layer II classes of quantization.
 * The table is derived from Table B.4 of ISO/IEC 11172-3.
 */
const QC_TABLE = [
    { nlevels:     3, group: 2, bits:  5, C: 1.33333333333, D: 0.50000000000 },
    { nlevels:     5, group: 3, bits:  7, C: 1.60000000000, D: 0.50000000000 },
    { nlevels:     7, group: 0, bits:  3, C: 1.14285714286, D: 0.25000000000 },
    { nlevels:     9, group: 4, bits: 10, C: 1.77777777777, D: 0.50000000000 },
    { nlevels:    15, group: 0, bits:  4, C: 1.06666666666, D: 0.12500000000 },
    { nlevels:    31, group: 0, bits:  5, C: 1.03225806452, D: 0.06250000000 },
    { nlevels:    63, group: 0, bits:  6, C: 1.01587301587, D: 0.03125000000 },
    { nlevels:   127, group: 0, bits:  7, C: 1.00787401575, D: 0.01562500000 },
    { nlevels:   255, group: 0, bits:  8, C: 1.00392156863, D: 0.00781250000 },
    { nlevels:   511, group: 0, bits:  9, C: 1.00195694716, D: 0.00390625000 },
    { nlevels:  1023, group: 0, bits: 10, C: 1.00097751711, D: 0.00195312500 },
    { nlevels:  2047, group: 0, bits: 11, C: 1.00048851979, D: 0.00097656250 },
    { nlevels:  4095, group: 0, bits: 12, C: 1.00024420024, D: 0.00048828125 },
    { nlevels:  8191, group: 0, bits: 13, C: 1.00012208522, D: 0.00024414063 },
    { nlevels: 16383, group: 0, bits: 14, C: 1.00006103888, D: 0.00012207031 },
    { nlevels: 32767, group: 0, bits: 15, C: 1.00003051851, D: 0.00006103516 },
    { nlevels: 65535, group: 0, bits: 16, C: 1.00001525902, D: 0.00003051758 }
];

Layer2.prototype.decode = function(stream, frame) {
    var header = frame.header;
    var nch = header.nchannels();
    var index;
    
    if (header.flags & MP3FrameHeader.FLAGS.LSF_EXT) {
        index = 4;
    } else if (header.flags & MP3FrameHeader.FLAGS.FREEFORMAT) {
        index = header.samplerate === 48000 ? 0 : 1;
    } else {
        var bitrate_per_channel = header.bitrate;
        
        if (nch === 2) {
            bitrate_per_channel /= 2;
            
            /*
             * ISO/IEC 11172-3 allows only single channel mode for 32, 48, 56, and
             * 80 kbps bitrates in Layer II, but some encoders ignore this
             * restriction, so we ignore it as well.
             */
        } else {
            /*
        	 * ISO/IEC 11172-3 does not allow single channel mode for 224, 256,
        	 * 320, or 384 kbps bitrates in Layer II.
        	 */
            if (bitrate_per_channel > 192000)
                throw new Error('bad bitrate/mode combination');
        }
        
        if (bitrate_per_channel <= 48000)
            index = header.samplerate === 32000 ? 3 : 2;
        else if (bitrate_per_channel <= 80000)
            index = 0;
        else
            index = header.samplerate === 48000 ? 0 : 1;
    }
    
    var sblimit = SBQUANT[index].sblimit;
    var offsets = SBQUANT[index].offsets;
    
    var bound = 32;
    if (header.mode === MP3FrameHeader.MODE.JOINT_STEREO) {
        header.flags |= MP3FrameHeader.FLAGS.I_STEREO;
        bound = 4 + header.mode_extension * 4;
    }
    
    if (bound > sblimit)
        bound = sblimit;
    
    // decode bit allocations
    var allocation = this.allocation;
    for (var sb = 0; sb < bound; sb++) {
        var nbal = BITALLOC[offsets[sb]].nbal;
        
        for (var ch = 0; ch < nch; ch++)
            allocation[ch][sb] = stream.read(nbal);
    }
    
    for (var sb = bound; sb < sblimit; sb++) {
        var nbal = BITALLOC[offsets[sb]].nbal;
        
        allocation[0][sb] =
        allocation[1][sb] = stream.read(nbal);
    }
    
    // decode scalefactor selection info
    var scfsi = this.scfsi;
    for (var sb = 0; sb < sblimit; sb++) {
        for (var ch = 0; ch < nch; ch++) {
            if (allocation[ch][sb])
                scfsi[ch][sb] = stream.read(2);
        }
    }
    
    if (header.flags & MP3FrameHeader.FLAGS.PROTECTION) {
        // TODO: crc check
    }
    
    // decode scalefactors
    var scalefactor = this.scalefactor;
    for (var sb = 0; sb < sblimit; sb++) {
        for (var ch = 0; ch < nch; ch++) {
            if (allocation[ch][sb]) {
                scalefactor[ch][sb][0] = stream.read(6);
                
                switch (scfsi[ch][sb]) {
            	    case 2:
            	        scalefactor[ch][sb][2] =
                        scalefactor[ch][sb][1] = scalefactor[ch][sb][0];
                        break;
                        
                    case 0:
                        scalefactor[ch][sb][1] = stream.read(6);
                    	// fall through
                    	
                    case 1:
                    case 3:
                        scalefactor[ch][sb][2] = stream.read(6);
                }
                
                if (scfsi[ch][sb] & 1)
                    scalefactor[ch][sb][1] = scalefactor[ch][sb][scfsi[ch][sb] - 1];
                    
                /*
            	 * Scalefactor index 63 does not appear in Table B.1 of
            	 * ISO/IEC 11172-3. Nonetheless, other implementations accept it,
            	 * so we do as well.
            	 */
            }
        }
    }
    
    // decode samples
    for (var gr = 0; gr < 12; gr++) {
        // normal
        for (var sb = 0; sb < bound; sb++) {
            for (var ch = 0; ch < nch; ch++) {                
                if (index = allocation[ch][sb]) {
                    index = OFFSETS[BITALLOC[offsets[sb]].offset][index - 1];
                    this.decodeSamples(stream, QC_TABLE[index]);
                    
                    var scale = tables.SF_TABLE[scalefactor[ch][sb][gr >> 2]];
                    for (var s = 0; s < 3; s++) {
                        frame.sbsample[ch][3 * gr + s][sb] = this.samples[s] * scale;
                    }
                } else {
                    for (var s = 0; s < 3; s++) {
                        frame.sbsample[ch][3 * gr + s][sb] = 0;
                    }
                }
            }
        }
        
        // joint stereo
        for (var sb = bound; sb < sblimit; sb++) {
            if (index = allocation[0][sb]) {
                index = OFFSETS[BITALLOC[offsets[sb]].offset][index - 1];
                this.decodeSamples(stream, QC_TABLE[index]);
                
                for (var ch = 0; ch < nch; ch++) {
                    var scale = tables.SF_TABLE[scalefactor[ch][sb][gr >> 2]];
                    for (var s = 0; s < 3; s++) {
                        frame.sbsample[ch][3 * gr + s][sb] = this.samples[s] * scale;
                    }
                }
            } else {
                for (var ch = 0; ch < nch; ch++) {
                    for (var s = 0; s < 3; s++) {
                        frame.sbsample[ch][3 * gr + s][sb] = 0;
                    }
                }
            }
        }
        
        // the rest
        for (var ch = 0; ch < nch; ch++) {
            for (var s = 0; s < 3; s++) {
                for (var sb = sblimit; sb < 32; sb++) {
                    frame.sbsample[ch][3 * gr + s][sb] = 0;
                }
            }
        }
    }
};

Layer2.prototype.decodeSamples = function(stream, quantclass) {
    var sample = this.samples;
    var nb = quantclass.group;
    
    if (nb) {
        // degrouping
        var c = stream.read(quantclass.bits);
        var nlevels = quantclass.nlevels;
        
        for (var s = 0; s < 3; s++) {
            sample[s] = c % nlevels;
            c = c / nlevels | 0;
        }
    } else {
        nb = quantclass.bits;
        for (var s = 0; s < 3; s++) {
            sample[s] = stream.read(nb);
        }
    }
    
    for (var s = 0; s < 3; s++) {
        // invert most significant bit, and form a 2's complement sample
        var requantized = sample[s] ^ (1 << (nb - 1));
        requantized |= -(requantized & (1 << (nb - 1)));
        requantized /= (1 << (nb - 1));
        
        // requantize the sample
        sample[s] = (requantized + quantclass.D) * quantclass.C;
    }
};

module.exports = Layer2;


/***/ }),
/* 126 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var AV = __webpack_require__(84);
var tables = __webpack_require__(124);
var MP3FrameHeader = __webpack_require__(117);
var MP3Frame = __webpack_require__(120);
var huffman = __webpack_require__(127);
var IMDCT = __webpack_require__(128);
var utils = __webpack_require__(121);

function MP3SideInfo() {
    this.main_data_begin = null;
    this.private_bits = null;
    this.gr = [new MP3Granule(), new MP3Granule()];
    this.scfsi = new Uint8Array(2);
}

function MP3Granule() {
    this.ch = [new MP3Channel(), new MP3Channel()];
}

function MP3Channel() {
    // from side info
    this.part2_3_length    = null;
    this.big_values        = null;
    this.global_gain       = null;
    this.scalefac_compress = null;
    
    this.flags         = null;
    this.block_type    = null;
    this.table_select  = new Uint8Array(3);
    this.subblock_gain = new Uint8Array(3);
    this.region0_count = null;
    this.region1_count = null;
    
    // from main_data
    this.scalefac = new Uint8Array(39);
}

function Layer3() {
    this.imdct = new IMDCT();
    this.si = new MP3SideInfo();
    
    // preallocate reusable typed arrays for performance
    this.xr = [new Float64Array(576), new Float64Array(576)];
    this._exponents = new Int32Array(39);
    this.reqcache = new Float64Array(16);
    this.modes = new Int16Array(39);
    this.output = new Float64Array(36);
    
    this.tmp = utils.makeArray([32, 3, 6]);
    this.tmp2 = new Float64Array(32 * 3 * 6);
}

MP3Frame.layers[3] = Layer3;

Layer3.prototype.decode = function(stream, frame) {
    var header = frame.header;
    var next_md_begin = 0;
    var md_len = 0;
    
    var nch = header.nchannels();
    var si_len = (header.flags & MP3FrameHeader.FLAGS.LSF_EXT) ? (nch === 1 ? 9 : 17) : (nch === 1 ? 17 : 32);
        
    // check frame sanity
    if (stream.next_frame - stream.nextByte() < si_len) {
        stream.md_len = 0;
        throw new Error('Bad frame length');
    }
    
    // check CRC word
    if (header.flags & MP3FrameHeader.FLAGS.PROTECTION) {
        // TODO: crc check
    }
    
    // decode frame side information
    var sideInfo = this.sideInfo(stream, nch, header.flags & MP3FrameHeader.FLAGS.LSF_EXT);        
    var si = sideInfo.si;
    var data_bitlen = sideInfo.data_bitlen;
    var priv_bitlen = sideInfo.priv_bitlen;
    
    header.flags        |= priv_bitlen;
    header.private_bits |= si.private_bits;
    
    // find main_data of next frame
    var peek = stream.copy();
    peek.seek(stream.next_frame * 8);
    
    var nextHeader = peek.read(16);    
    if ((nextHeader & 0xffe6) === 0xffe2) { // syncword | layer
        if ((nextHeader & 1) === 0) // protection bit
            peek.advance(16); // crc check
            
        peek.advance(16); // skip the rest of the header
        next_md_begin = peek.read((nextHeader & 8) ? 9 : 8);
    }
    
    // find main_data of this frame
    var frame_space = stream.next_frame - stream.nextByte();
    
    if (next_md_begin > si.main_data_begin + frame_space)
        next_md_begin = 0;
        
    var md_len = si.main_data_begin + frame_space - next_md_begin;
    var frame_used = 0;
    var ptr;
    
    if (si.main_data_begin === 0) {
        ptr = stream.stream;
        stream.md_len = 0;
        frame_used = md_len;
    } else {
        if (si.main_data_begin > stream.md_len) {
            throw new Error('bad main_data_begin pointer');
        } else {
            var old_md_len = stream.md_len;
            
            if (md_len > si.main_data_begin) {
                if (stream.md_len + md_len - si.main_data_begin > MP3FrameHeader.BUFFER_MDLEN) {
                    throw new Error("Assertion failed: (stream.md_len + md_len - si.main_data_begin <= MAD_MP3FrameHeader.BUFFER_MDLEN)");
                }
                
                frame_used = md_len - si.main_data_begin;
                this.memcpy(stream.main_data, stream.md_len, stream.stream.stream, stream.nextByte(), frame_used);
                stream.md_len += frame_used;
            }
            
            ptr = new AV.Bitstream(AV.Stream.fromBuffer(new AV.Buffer(stream.main_data)));
            ptr.advance((old_md_len - si.main_data_begin) * 8);
        }
    }
    
    var frame_free = frame_space - frame_used;
    
    // decode main_data
    this.decodeMainData(ptr, frame, si, nch);
    
    // preload main_data buffer with up to 511 bytes for next frame(s)
    if (frame_free >= next_md_begin) {
        this.memcpy(stream.main_data, 0, stream.stream.stream, stream.next_frame - next_md_begin, next_md_begin);
        stream.md_len = next_md_begin;
    } else {
        if (md_len < si.main_data_begin) {
            var extra = si.main_data_begin - md_len;
            if (extra + frame_free > next_md_begin)
                extra = next_md_begin - frame_free;

            if (extra < stream.md_len) {
                this.memcpy(stream.main_data, 0, stream.main_data, stream.md_len - extra, extra);
                stream.md_len = extra;
            }
        } else {
            stream.md_len = 0;
        }
        
        this.memcpy(stream.main_data, stream.md_len, stream.stream.stream, stream.next_frame - frame_free, frame_free);
        stream.md_len += frame_free;
    }
};

Layer3.prototype.memcpy = function(dst, dstOffset, pSrc, srcOffset, length) {
    var subarr;
    if (pSrc.subarray)
        subarr = pSrc.subarray(srcOffset, srcOffset + length);
    else
        subarr = pSrc.peekBuffer(srcOffset - pSrc.offset, length).data;

    // oh my, memcpy actually exists in JavaScript?
    dst.set(subarr, dstOffset);
    return dst;
};

Layer3.prototype.sideInfo = function(stream, nch, lsf) {
    var si = this.si;
    var data_bitlen = 0;
    var priv_bitlen = lsf ? ((nch === 1) ? 1 : 2) : ((nch === 1) ? 5 : 3);
    
    si.main_data_begin = stream.read(lsf ? 8 : 9);
    si.private_bits    = stream.read(priv_bitlen);

    var ngr = 1;
    if (!lsf) {
        ngr = 2;
        for (var ch = 0; ch < nch; ++ch)
            si.scfsi[ch] = stream.read(4);
    }
    
    for (var gr = 0; gr < ngr; gr++) {
        var granule = si.gr[gr];
        
        for (var ch = 0; ch < nch; ch++) {
            var channel = granule.ch[ch];
            
            channel.part2_3_length    = stream.read(12);
            channel.big_values        = stream.read(9);
            channel.global_gain       = stream.read(8);
            channel.scalefac_compress = stream.read(lsf ? 9 : 4);

            data_bitlen += channel.part2_3_length;

            if (channel.big_values > 288)
                throw new Error('bad big_values count');

            channel.flags = 0;

            // window_switching_flag
            if (stream.read(1)) {
                channel.block_type = stream.read(2);

                if (channel.block_type === 0)
                    throw new Error('reserved block_type');

                if (!lsf && channel.block_type === 2 && si.scfsi[ch])
                    throw new Error('bad scalefactor selection info');

                channel.region0_count = 7;
                channel.region1_count = 36;

                if (stream.read(1))
                    channel.flags |= tables.MIXED_BLOCK_FLAG;
                else if (channel.block_type === 2)
                    channel.region0_count = 8;

                for (var i = 0; i < 2; i++)
                    channel.table_select[i] = stream.read(5);

                for (var i = 0; i < 3; i++)
                    channel.subblock_gain[i] = stream.read(3);
            } else {
                channel.block_type = 0;

                for (var i = 0; i < 3; i++)
                    channel.table_select[i] = stream.read(5);

                channel.region0_count = stream.read(4);
                channel.region1_count = stream.read(3);
            }

            // [preflag,] scalefac_scale, count1table_select
            channel.flags |= stream.read(lsf ? 2 : 3);
        }
    }
    
    return {
        si: si,
        data_bitlen: data_bitlen,
        priv_bitlen: priv_bitlen
    };
};

Layer3.prototype.decodeMainData = function(stream, frame, si, nch) {
    var header = frame.header;
    var sfreq = header.samplerate;

    if (header.flags & MP3FrameHeader.FLAGS.MPEG_2_5_EXT)
        sfreq *= 2;

    // 48000 => 0, 44100 => 1, 32000 => 2,
    // 24000 => 3, 22050 => 4, 16000 => 5
    var sfreqi = ((sfreq >>  7) & 0x000f) + ((sfreq >> 15) & 0x0001) - 8;

    if (header.flags & MP3FrameHeader.FLAGS.MPEG_2_5_EXT)
        sfreqi += 3;
        
    // scalefactors, Huffman decoding, requantization
    var ngr = (header.flags & MP3FrameHeader.FLAGS.LSF_EXT) ? 1 : 2;
    var xr = this.xr;
    
    for (var gr = 0; gr < ngr; ++gr) {
        var granule = si.gr[gr];
        var sfbwidth = [];
        var l = 0;
        
        for (var ch = 0; ch < nch; ++ch) {
            var channel = granule.ch[ch];
            var part2_length;
            
            sfbwidth[ch] = tables.SFBWIDTH_TABLE[sfreqi].l;
            if (channel.block_type === 2) {
                sfbwidth[ch] = (channel.flags & tables.MIXED_BLOCK_FLAG) ? tables.SFBWIDTH_TABLE[sfreqi].m : tables.SFBWIDTH_TABLE[sfreqi].s;
            }

            if (header.flags & MP3FrameHeader.FLAGS.LSF_EXT) {
                part2_length = this.scalefactors_lsf(stream, channel, ch === 0 ? 0 : si.gr[1].ch[1], header.mode_extension);
            } else {
                part2_length = this.scalefactors(stream, channel, si.gr[0].ch[ch], gr === 0 ? 0 : si.scfsi[ch]);
            }

            this.huffmanDecode(stream, xr[ch], channel, sfbwidth[ch], part2_length);
        }
        
        // joint stereo processing
        if (header.mode === MP3FrameHeader.MODE.JOINT_STEREO && header.mode_extension !== 0)
            this.stereo(xr, si.gr, gr, header, sfbwidth[0]);
        
        // reordering, alias reduction, IMDCT, overlap-add, frequency inversion
        for (var ch = 0; ch < nch; ch++) {
            var channel = granule.ch[ch];
            var sample = frame.sbsample[ch].slice(18 * gr);
            
            var sb, l = 0, i, sblimit;
            var output = this.output;
            
            if (channel.block_type === 2) {
                this.reorder(xr[ch], channel, sfbwidth[ch]);

                /*
                 * According to ISO/IEC 11172-3, "Alias reduction is not applied for
                 * granules with block_type === 2 (short block)." However, other
                 * sources suggest alias reduction should indeed be performed on the
                 * lower two subbands of mixed blocks. Most other implementations do
                 * this, so by default we will too.
                 */
                if (channel.flags & tables.MIXED_BLOCK_FLAG)
                    this.aliasreduce(xr[ch], 36);
            } else {
                this.aliasreduce(xr[ch], 576);
            }
            
            // subbands 0-1
            if (channel.block_type !== 2 || (channel.flags & tables.MIXED_BLOCK_FLAG)) {
                var block_type = channel.block_type;
                if (channel.flags & tables.MIXED_BLOCK_FLAG)
                    block_type = 0;

                // long blocks
                for (var sb = 0; sb < 2; ++sb, l += 18) {
                    this.imdct_l(xr[ch].subarray(l, l + 18), output, block_type);
                    this.overlap(output, frame.overlap[ch][sb], sample, sb);
                }
            } else {
                // short blocks
                for (var sb = 0; sb < 2; ++sb, l += 18) {
                    this.imdct_s(xr[ch].subarray(l, l + 18), output);
                    this.overlap(output, frame.overlap[ch][sb], sample, sb);
                }
            }
            
            this.freqinver(sample, 1);

            // (nonzero) subbands 2-31
            var i = 576;
            while (i > 36 && xr[ch][i - 1] === 0) {
                --i;
            }
            
            sblimit = 32 - (((576 - i) / 18) << 0);

            if (channel.block_type !== 2) {
                // long blocks
                for (var sb = 2; sb < sblimit; ++sb, l += 18) {
                    this.imdct_l(xr[ch].subarray(l, l + 18), output, channel.block_type);
                    this.overlap(output, frame.overlap[ch][sb], sample, sb);

                    if (sb & 1)
                        this.freqinver(sample, sb);
                }
            } else {
                // short blocks
                for (var sb = 2; sb < sblimit; ++sb, l += 18) {
                    this.imdct_s(xr[ch].subarray(l, l + 18), output);
                    this.overlap(output, frame.overlap[ch][sb], sample, sb);

                    if (sb & 1)
                        this.freqinver(sample, sb);
                }
            }
            
            // remaining (zero) subbands
            for (var sb = sblimit; sb < 32; ++sb) {
                this.overlap_z(frame.overlap[ch][sb], sample, sb);

                if (sb & 1)
                    this.freqinver(sample, sb);
            }
        }
    }
};

Layer3.prototype.scalefactors = function(stream, channel, gr0ch, scfsi) {
    var start = stream.offset();
    var slen1 = tables.SFLEN_TABLE[channel.scalefac_compress].slen1;
    var slen2 = tables.SFLEN_TABLE[channel.scalefac_compress].slen2;
    var sfbi;
    
    if (channel.block_type === 2) {
        sfbi = 0;

        var nsfb = (channel.flags & tables.MIXED_BLOCK_FLAG) ? 8 + 3 * 3 : 6 * 3;
        while (nsfb--)
            channel.scalefac[sfbi++] = stream.read(slen1);

        nsfb = 6 * 3;
        while (nsfb--)
            channel.scalefac[sfbi++] = stream.read(slen2);

        nsfb = 1 * 3;
        while (nsfb--)
            channel.scalefac[sfbi++] = 0;
    } else {
        if (scfsi & 0x8) {
            for (var sfbi = 0; sfbi < 6; ++sfbi)
                channel.scalefac[sfbi] = gr0ch.scalefac[sfbi];
        } else {
            for (var sfbi = 0; sfbi < 6; ++sfbi)
                channel.scalefac[sfbi] = stream.read(slen1);
        }

        if (scfsi & 0x4) {
            for (var sfbi = 6; sfbi < 11; ++sfbi)
                channel.scalefac[sfbi] = gr0ch.scalefac[sfbi];
        } else {
            for (var sfbi = 6; sfbi < 11; ++sfbi)
                channel.scalefac[sfbi] = stream.read(slen1);
        }

        if (scfsi & 0x2) {
            for (var sfbi = 11; sfbi < 16; ++sfbi)
                channel.scalefac[sfbi] = gr0ch.scalefac[sfbi];
        } else {
            for (var sfbi = 11; sfbi < 16; ++sfbi)
                channel.scalefac[sfbi] = stream.read(slen2);
        }

        if (scfsi & 0x1) {
            for (var sfbi = 16; sfbi < 21; ++sfbi)
                channel.scalefac[sfbi] = gr0ch.scalefac[sfbi];
        } else {
            for (var sfbi = 16; sfbi < 21; ++sfbi)
                channel.scalefac[sfbi] = stream.read(slen2);
        }

        channel.scalefac[21] = 0;
    }
    
    return stream.offset() - start;
};

Layer3.prototype.scalefactors_lsf = function(stream, channel, gr1ch, mode_extension) {
    var start = stream.offset();
    var scalefac_compress = channel.scalefac_compress;
    var index = channel.block_type === 2 ? (channel.flags & tables.MIXED_BLOCK_FLAG ? 2 : 1) : 0;
    var slen = new Int32Array(4);
    var nsfb;
    
    if (!((mode_extension & tables.I_STEREO) && gr1ch)) {
        if (scalefac_compress < 400) {
            slen[0] = (scalefac_compress >>> 4) / 5;
            slen[1] = (scalefac_compress >>> 4) % 5;
            slen[2] = (scalefac_compress % 16) >>> 2;
            slen[3] =  scalefac_compress %  4;
        
            nsfb = tables.NSFB_TABLE[0][index];
        } else if (scalefac_compress < 500) {
            scalefac_compress -= 400;

            slen[0] = (scalefac_compress >>> 2) / 5;
            slen[1] = (scalefac_compress >>> 2) % 5;
            slen[2] =  scalefac_compress % 4;
            slen[3] = 0;

            nsfb = tables.NSFB_TABLE[1][index];
        } else {
            scalefac_compress -= 500;

            slen[0] = scalefac_compress / 3;
            slen[1] = scalefac_compress % 3;
            slen[2] = 0;
            slen[3] = 0;

            channel.flags |= tables.PREFLAG;
            nsfb = tables.NSFB_TABLE[2][index];
        }
        
        var n = 0;
        for (var part = 0; part < 4; part++) {
            for (var i = 0; i < nsfb[part]; i++) {
                channel.scalefac[n++] = stream.read(slen[part]);
            }
        }
        
        while (n < 39) {
            channel.scalefac[n++] = 0;
        }
    } else {  // (mode_extension & tables.I_STEREO) && gr1ch (i.e. ch == 1)
        scalefac_compress >>>= 1;
        
        if (scalefac_compress < 180) {
            slen[0] =  scalefac_compress / 36;
            slen[1] = (scalefac_compress % 36) / 6;
            slen[2] = (scalefac_compress % 36) % 6;
            slen[3] = 0;

            nsfb = tables.NSFB_TABLE[3][index];
        } else if (scalefac_compress < 244) {
            scalefac_compress -= 180;

            slen[0] = (scalefac_compress % 64) >>> 4;
            slen[1] = (scalefac_compress % 16) >>> 2;
            slen[2] =  scalefac_compress %  4;
            slen[3] = 0;

            nsfb = tables.NSFB_TABLE[4][index];
        } else {
            scalefac_compress -= 244;

            slen[0] = scalefac_compress / 3;
            slen[1] = scalefac_compress % 3;
            slen[2] = 0;
            slen[3] = 0;

            nsfb = tables.NSFB_TABLE[5][index];
        }
        
        var n = 0;
        for (var part = 0; part < 4; ++part) {
            var max = (1 << slen[part]) - 1;
            for (var i = 0; i < nsfb[part]; ++i) {
                var is_pos = stream.read(slen[part]);

                channel.scalefac[n] = is_pos;
                gr1ch.scalefac[n++] = is_pos === max ? 1 : 0;
            }
        }
        
        while (n < 39) {
            channel.scalefac[n] = 0;
            gr1ch.scalefac[n++] = 0;  // apparently not illegal
        }
    }
    
    return stream.offset() - start;
};

Layer3.prototype.huffmanDecode = function(stream, xr, channel, sfbwidth, part2_length) {
    var exponents = this._exponents;
    var sfbwidthptr = 0;
    
    var bits_left = channel.part2_3_length - part2_length;    
    if (bits_left < 0)
        throw new Error('bad audio data length');
    
    this.exponents(channel, sfbwidth, exponents);
    
    var peek = stream.copy();
    stream.advance(bits_left);
    
    /* align bit reads to byte boundaries */
    var cachesz  = 8 - peek.bitPosition;
    cachesz += ((32 - 1 - 24) + (24 - cachesz)) & ~7;
    
    var bitcache = peek.read(cachesz);
    bits_left -= cachesz;

    var xrptr = 0;
    
    // big_values
    var region = 0;
    var reqcache = this.reqcache;
    
    var sfbound = xrptr + sfbwidth[sfbwidthptr++];
    var rcount  = channel.region0_count + 1;
    
    var entry = huffman.huff_pair_table[channel.table_select[region]];
    var table     = entry.table;
    var linbits   = entry.linbits;
    var startbits = entry.startbits;
    
    if (typeof table === 'undefined')
        throw new Error('bad Huffman table select');
        
    var expptr = 0;
    var exp = exponents[expptr++];
    var reqhits = 0;
    var big_values = channel.big_values;
    
    while (big_values-- && cachesz + bits_left > 0) {
         if (xrptr === sfbound) {
             sfbound += sfbwidth[sfbwidthptr++];

             // change table if region boundary
             if (--rcount === 0) {
                 if (region === 0)
                     rcount = channel.region1_count + 1;
                 else
                     rcount = 0; // all remaining

                 entry     = huffman.huff_pair_table[channel.table_select[++region]];
                 table     = entry.table;
                 linbits   = entry.linbits;
                 startbits = entry.startbits;

                 if (typeof table === 'undefined')
                     throw new Error('bad Huffman table select');
             }

             if (exp !== exponents[expptr]) {
                 exp = exponents[expptr];
                 reqhits = 0;
             }

             ++expptr;
         }
         
         if (cachesz < 21) {
             var bits   = ((32 - 1 - 21) + (21 - cachesz)) & ~7;
             bitcache   = (bitcache << bits) | peek.read(bits);
             cachesz   += bits;
             bits_left -= bits;
         }
         
         var clumpsz = startbits;
         var pair = table[ (((bitcache) >> ((cachesz) - (clumpsz))) & ((1 << (clumpsz)) - 1))];
         
         while (!pair.final) {
             cachesz -= clumpsz;
             clumpsz = pair.ptr.bits;
             pair    = table[pair.ptr.offset + (((bitcache) >> ((cachesz) - (clumpsz))) & ((1 << (clumpsz)) - 1))];
         }
         
         cachesz -= pair.value.hlen;
         
         if (linbits) {
             var value = pair.value.x;
             var x_final = false;
             
             switch (value) {
                 case 0:
                     xr[xrptr] = 0;
                     break;

                 case 15:
                     if (cachesz < linbits + 2) {
                         bitcache   = (bitcache << 16) | peek.read(16);
                         cachesz   += 16;
                         bits_left -= 16;
                     }

                     value += (((bitcache) >> ((cachesz) - (linbits))) & ((1 << (linbits)) - 1));
                     cachesz -= linbits;

                     requantized = this.requantize(value, exp);
                     x_final = true; // simulating goto, yay
                     break;

                 default:
                     if (reqhits & (1 << value)) {
                         requantized = reqcache[value];
                     } else {
                         reqhits |= (1 << value);
                         requantized = reqcache[value] = this.requantize(value, exp);
                     }
                     
                     x_final = true;
             }
             
             if(x_final) {
                 xr[xrptr] = ((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized;
             }
             
             value = pair.value.y;
             var y_final = false;
             
             switch (value) {
                 case 0:
                     xr[xrptr + 1] = 0;
                     break;

                 case 15:
                     if (cachesz < linbits + 1) {
                         bitcache   = (bitcache << 16) | peek.read(16);
                         cachesz   += 16;
                         bits_left -= 16;
                     }

                     value += (((bitcache) >> ((cachesz) - (linbits))) & ((1 << (linbits)) - 1));
                     cachesz -= linbits;

                     requantized = this.requantize(value, exp);
                     y_final = true;
                     break; // simulating goto, yayzor

                 default:
                     if (reqhits & (1 << value)) {
                         requantized = reqcache[value];
                     } else {
                         reqhits |= (1 << value);
                         reqcache[value] = this.requantize(value, exp);
                         requantized = reqcache[value];
                     }
                     
                     y_final = true;
             }
             
             if(y_final) {
                 xr[xrptr + 1] = ((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized;
             }
             
         } else {
             var value = pair.value.x;

             if (value === 0) {
                 xr[xrptr] = 0;
             } else {
                 if (reqhits & (1 << value))
                     requantized = reqcache[value];
                 else {
                     reqhits |= (1 << value);
                     requantized = reqcache[value] = this.requantize(value, exp);
                 }

                 xr[xrptr] = ((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized;
             }

             value = pair.value.y;

             if (value === 0) {
                 xr[xrptr + 1] = 0;
             } else {
                 if (reqhits & (1 << value))
                     requantized = reqcache[value];
                 else {
                     reqhits |= (1 << value);
                     requantized = reqcache[value] = this.requantize(value, exp);
                 }

                 xr[xrptr + 1] = ((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized;
             }
         }

         xrptr += 2;
    }
    
    if (cachesz + bits_left < 0)
        throw new Error('Huffman data overrun');
    
    // count1    
    var table = huffman.huff_quad_table[channel.flags & tables.COUNT1TABLE_SELECT];
    var requantized = this.requantize(1, exp);
    
    while (cachesz + bits_left > 0 && xrptr <= 572) {
        if (cachesz < 10) {
            bitcache   = (bitcache << 16) | peek.read(16);
            cachesz   += 16;
            bits_left -= 16;
        }
        
        var quad = table[(((bitcache) >> ((cachesz) - (4))) & ((1 << (4)) - 1))];
        
        // quad tables guaranteed to have at most one extra lookup
        if (!quad.final) {
            cachesz -= 4;
            quad = table[quad.ptr.offset + (((bitcache) >> ((cachesz) - (quad.ptr.bits))) & ((1 << (quad.ptr.bits)) - 1))];
        }
        
        cachesz -= quad.value.hlen;

        if (xrptr === sfbound) {
            sfbound += sfbwidth[sfbwidthptr++];

            if (exp !== exponents[expptr]) {
                exp = exponents[expptr];
                requantized = this.requantize(1, exp);
            }

            ++expptr;
        }
        
        // v (0..1)
        xr[xrptr] = quad.value.v ? (((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized) : 0;

        // w (0..1)
        xr[xrptr + 1] = quad.value.w ? (((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized) : 0;

        xrptr += 2;
        if (xrptr === sfbound) {
            sfbound += sfbwidth[sfbwidthptr++];

            if (exp !== exponents[expptr]) {
                exp = exponents[expptr];
                requantized = this.requantize(1, exp);
            }

            ++expptr;
        }
        
        // x (0..1)
        xr[xrptr] = quad.value.x ? (((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized) : 0;

        // y (0..1)
        xr[xrptr + 1] = quad.value.y ? (((bitcache) & (1 << ((cachesz--) - 1))) ? -requantized : requantized) : 0;

        xrptr += 2;
        
        if (cachesz + bits_left < 0) {
            // technically the bitstream is misformatted, but apparently
            // some encoders are just a bit sloppy with stuffing bits
            xrptr -= 4;
        }
    }
    
    if (-bits_left > MP3FrameHeader.BUFFER_GUARD * 8) {
        throw new Error("assertion failed: (-bits_left <= MP3FrameHeader.BUFFER_GUARD * CHAR_BIT)");
    }
    
    // rzero
    while (xrptr < 576) {
        xr[xrptr]     = 0;
        xr[xrptr + 1] = 0;
        xrptr += 2;
    }
};

Layer3.prototype.requantize = function(value, exp) {
    // usual (x >> 0) tricks to make sure frac and exp stay integers
    var frac = (exp % 4) >> 0;  // assumes sign(frac) === sign(exp)
    exp = (exp / 4) >> 0;

    var requantized = Math.pow(value, 4.0 / 3.0);
    requantized *= Math.pow(2.0, (exp / 4.0));
    
    if (frac) {
        requantized *= Math.pow(2.0, (frac / 4.0));
    }
    
    if (exp < 0) {
        requantized /= Math.pow(2.0, -exp * (3.0 / 4.0));
    }

    return requantized;
};

Layer3.prototype.exponents = function(channel, sfbwidth, exponents) {
    var gain = channel.global_gain - 210;
    var scalefac_multiplier = (channel.flags & tables.SCALEFAC_SCALE) ? 2 : 1;
    
    if (channel.block_type === 2) {
        var sfbi = 0, l = 0;
        
        if (channel.flags & tables.MIXED_BLOCK_FLAG) {
            var premask = (channel.flags & tables.PREFLAG) ? ~0 : 0;
            
            // long block subbands 0-1
            while (l < 36) {
                exponents[sfbi] = gain - ((channel.scalefac[sfbi] + (tables.PRETAB[sfbi] & premask)) << scalefac_multiplier);
                l += sfbwidth[sfbi++];
            }
        }
        
        // this is probably wrong for 8000 Hz short/mixed blocks
        var gain0 = gain - 8 * channel.subblock_gain[0];
        var gain1 = gain - 8 * channel.subblock_gain[1];
        var gain2 = gain - 8 * channel.subblock_gain[2];
        
        while (l < 576) {
            exponents[sfbi + 0] = gain0 - (channel.scalefac[sfbi + 0] << scalefac_multiplier);
            exponents[sfbi + 1] = gain1 - (channel.scalefac[sfbi + 1] << scalefac_multiplier);
            exponents[sfbi + 2] = gain2 - (channel.scalefac[sfbi + 2] << scalefac_multiplier);
            
            l += 3 * sfbwidth[sfbi];
            sfbi += 3;
        }
    } else {
        if (channel.flags & tables.PREFLAG) {
            for (var sfbi = 0; sfbi < 22; sfbi++) {
                exponents[sfbi] = gain - ((channel.scalefac[sfbi] + tables.PRETAB[sfbi]) << scalefac_multiplier);
            }
        } else {
            for (var sfbi = 0; sfbi < 22; sfbi++) {
                exponents[sfbi] = gain - (channel.scalefac[sfbi] << scalefac_multiplier);
            }
        }
    }
};

Layer3.prototype.stereo = function(xr, granules, gr, header, sfbwidth) {
    var granule = granules[gr];
    var modes = this.modes;
    var sfbi, l, n, i;
    
    if (granule.ch[0].block_type !== granule.ch[1].block_type || (granule.ch[0].flags & tables.MIXED_BLOCK_FLAG) !== (granule.ch[1].flags & tables.MIXED_BLOCK_FLAG))
        throw new Error('incompatible stereo block_type');
        
    for (var i = 0; i < 39; i++)
        modes[i] = header.mode_extension;
        
    // intensity stereo
    if (header.mode_extension & tables.I_STEREO) {
        var right_ch = granule.ch[1];
        var right_xr = xr[1];
        
        header.flags |= MP3FrameHeader.FLAGS.tables.I_STEREO;
         
        // first determine which scalefactor bands are to be processed
        if (right_ch.block_type === 2) {
            var lower, start, max, bound = new Uint32Array(3), w;

            lower = start = max = bound[0] = bound[1] = bound[2] = 0;
            sfbi = l = 0;
            
            if (right_ch.flags & tables.MIXED_BLOCK_FLAG) {
                while (l < 36) {
                    n = sfbwidth[sfbi++];

                    for (var i = 0; i < n; ++i) {
                        if (right_xr[i]) {
                            lower = sfbi;
                            break;
                        }
                    }

                    right_xr += n;
                    l += n;
                }

                start = sfbi;
            }
            
            var w = 0;
            while (l < 576) {
                n = sfbwidth[sfbi++];

                for (i = 0; i < n; ++i) {
                    if (right_xr[i]) {
                        max = bound[w] = sfbi;
                        break;
                    }
                }

                right_xr += n;
                l += n;
                w = (w + 1) % 3;
            }
            
            if (max)
                lower = start;

            // long blocks
            for (i = 0; i < lower; ++i)
                modes[i] = header.mode_extension & ~tables.I_STEREO;

            // short blocks
            w = 0;
            for (i = start; i < max; ++i) {
                if (i < bound[w])
                    modes[i] = header.mode_extension & ~tables.I_STEREO;

                w = (w + 1) % 3;
            }
        } else {
            var bound = 0;
            for (sfbi = l = 0; l < 576; l += n) {
                n = sfbwidth[sfbi++];

                for (i = 0; i < n; ++i) {
                    if (right_xr[i]) {
                        bound = sfbi;
                        break;
                    }
                }

                right_xr += n;
            }

            for (i = 0; i < bound; ++i)
                modes[i] = header.mode_extension & ~tables.I_STEREO;
        }
        
        // now do the actual processing
        if (header.flags & MP3FrameHeader.FLAGS.LSF_EXT) {
            var illegal_pos = granules[gr + 1].ch[1].scalefac;

            // intensity_scale
            var lsf_scale = IS_Ltables.SF_TABLE[right_ch.scalefac_compress & 0x1];
            
            for (sfbi = l = 0; l < 576; ++sfbi, l += n) {
                n = sfbwidth[sfbi];

                if (!(modes[sfbi] & tables.I_STEREO))
                    continue;

                if (illegal_pos[sfbi]) {
                    modes[sfbi] &= ~tables.I_STEREO;
                    continue;
                }

                is_pos = right_ch.scalefac[sfbi];
                
                for (i = 0; i < n; ++i) {
                    var left = xr[0][l + i];

                    if (is_pos === 0) {
                        xr[1][l + i] = left;
                    } else {
                        var opposite = left * lsf_scale[(is_pos - 1) / 2];

                        if (is_pos & 1) {
                            xr[0][l + i] = opposite;
                            xr[1][l + i] = left;
                        }
                        else {
                            xr[1][l + i] = opposite;
                        }
                    }
                }
            }
        } else {
            for (sfbi = l = 0; l < 576; ++sfbi, l += n) {
                n = sfbwidth[sfbi];

                if (!(modes[sfbi] & tables.I_STEREO))
                    continue;

                is_pos = right_ch.scalefac[sfbi];

                if (is_pos >= 7) {  // illegal intensity position
                    modes[sfbi] &= ~tables.I_STEREO;
                    continue;
                }

                for (i = 0; i < n; ++i) {
                    var left = xr[0][l + i];
                    xr[0][l + i] = left * tables.IS_TABLE[is_pos];
                    xr[1][l + i] = left * tables.IS_TABLE[6 - is_pos];
                }
            }
        }
    }
    
    // middle/side stereo
    if (header.mode_extension & tables.MS_STEREO) {
        header.flags |= tables.MS_STEREO;

        var invsqrt2 = tables.ROOT_TABLE[3 + -2];

        for (sfbi = l = 0; l < 576; ++sfbi, l += n) {
            n = sfbwidth[sfbi];

            if (modes[sfbi] !== tables.MS_STEREO)
                continue;

            for (i = 0; i < n; ++i) {
                var m = xr[0][l + i];
                var s = xr[1][l + i];

                xr[0][l + i] = (m + s) * invsqrt2;  // l = (m + s) / sqrt(2)
                xr[1][l + i] = (m - s) * invsqrt2;  // r = (m - s) / sqrt(2)
            }
        }
    }
};

Layer3.prototype.aliasreduce = function(xr, lines) {
    for (var xrPointer = 18; xrPointer < lines; xrPointer += 18) {
        for (var i = 0; i < 8; ++i) {
            var a = xr[xrPointer - i - 1];
            var b = xr[xrPointer + i];

            xr[xrPointer - i - 1] = a * tables.CS[i] - b * tables.CA[i];
            xr[xrPointer + i] = b * tables.CS[i] + a * tables.CA[i];
        }
    }
};

// perform IMDCT and windowing for long blocks
Layer3.prototype.imdct_l = function (X, z, block_type) {
    // IMDCT
    this.imdct.imdct36(X, z);

    // windowing
    switch (block_type) {
        case 0:  // normal window
            for (var i = 0; i < 36; ++i) z[i] = z[i] * tables.WINDOW_L[i];
            break;

        case 1:  // start block
            for (var i =  0; i < 18; ++i) z[i] = z[i] * tables.WINDOW_L[i];
            for (var i = 24; i < 30; ++i) z[i] = z[i] * tables.WINDOW_S[i - 18];
            for (var i = 30; i < 36; ++i) z[i] = 0;
            break;

        case 3:  // stop block
            for (var i =  0; i <  6; ++i) z[i] = 0;
            for (var i =  6; i < 12; ++i) z[i] = z[i] * tables.WINDOW_S[i - 6];
            for (var i = 18; i < 36; ++i) z[i] = z[i] * tables.WINDOW_L[i];
            break;
    }
};

/*
 * perform IMDCT and windowing for short blocks
 */
Layer3.prototype.imdct_s = function (X, z) {
    var yptr = 0;
    var wptr;
    var Xptr = 0;
    
    var y = new Float64Array(36);
    var hi, lo;

    // IMDCT
    for (var w = 0; w < 3; ++w) {
        var sptr = 0;

        for (var i = 0; i < 3; ++i) {
            lo = X[Xptr + 0] * IMDCT.S[sptr][0] +
                 X[Xptr + 1] * IMDCT.S[sptr][1] +
                 X[Xptr + 2] * IMDCT.S[sptr][2] +
                 X[Xptr + 3] * IMDCT.S[sptr][3] +
                 X[Xptr + 4] * IMDCT.S[sptr][4] +
                 X[Xptr + 5] * IMDCT.S[sptr][5];


            y[yptr + i + 0] = lo;
            y[yptr + 5 - i] = -y[yptr + i + 0];

            ++sptr;

            lo = X[Xptr + 0] * IMDCT.S[sptr][0] +
                 X[Xptr + 1] * IMDCT.S[sptr][1] +
                 X[Xptr + 2] * IMDCT.S[sptr][2] +
                 X[Xptr + 3] * IMDCT.S[sptr][3] +
                 X[Xptr + 4] * IMDCT.S[sptr][4] +
                 X[Xptr + 5] * IMDCT.S[sptr][5];

            y[yptr +  i + 6] = lo;
            y[yptr + 11 - i] = y[yptr + i + 6];

            ++sptr;
        }

        yptr += 12;
        Xptr += 6;
    }

    // windowing, overlapping and concatenation
    yptr = 0;
    var wptr = 0;

    for (var i = 0; i < 6; ++i) {
        z[i + 0] = 0;
        z[i + 6] = y[yptr +  0 + 0] * tables.WINDOW_S[wptr + 0];

        lo = y[yptr + 0 + 6] * tables.WINDOW_S[wptr + 6] +
             y[yptr + 12 + 0] * tables.WINDOW_S[wptr + 0];

        z[i + 12] = lo;

        lo = y[yptr + 12 + 6] * tables.WINDOW_S[wptr + 6] +
             y[yptr + 24 + 0] * tables.WINDOW_S[wptr + 0];

        z[i + 18] = lo;
        z[i + 24] = y[yptr + 24 + 6] * tables.WINDOW_S[wptr + 6];
        z[i + 30] = 0;

        ++yptr;
        ++wptr;
    }
};

Layer3.prototype.overlap = function (output, overlap, sample, sb) {
    for (var i = 0; i < 18; ++i) {
        sample[i][sb] = output[i] + overlap[i];
        overlap[i]    = output[i + 18];
    }
};

Layer3.prototype.freqinver = function (sample, sb) {
    for (var i = 1; i < 18; i += 2)
        sample[i][sb] = -sample[i][sb];
};

Layer3.prototype.overlap_z = function (overlap, sample, sb) {
    for (var i = 0; i < 18; ++i) {
        sample[i][sb] = overlap[i];
        overlap[i]    = 0;
    }
};

Layer3.prototype.reorder = function (xr, channel, sfbwidth) {
    var sfbwidthPointer = 0;
    var tmp = this.tmp;
    var sbw = new Uint32Array(3);
    var sw  = new Uint32Array(3);
    
    // this is probably wrong for 8000 Hz mixed blocks

    var sb = 0;
    if (channel.flags & tables.MIXED_BLOCK_FLAG) {
        var sb = 2;

        var l = 0;
        while (l < 36)
            l += sfbwidth[sfbwidthPointer++];
    }

    for (var w = 0; w < 3; ++w) {
        sbw[w] = sb;
        sw[w]  = 0;
    }

    f = sfbwidth[sfbwidthPointer++];
    w = 0;

    for (var l = 18 * sb; l < 576; ++l) {
        if (f-- === 0) {
            f = sfbwidth[sfbwidthPointer++] - 1;
            w = (w + 1) % 3;
        }
        
        tmp[sbw[w]][w][sw[w]++] = xr[l];

        if (sw[w] === 6) {
            sw[w] = 0;
            ++sbw[w];
        }
    }

    var tmp2 = this.tmp2;
    var ptr = 0;
    
    for (var i = 0; i < 32; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 6; k++) {
                tmp2[ptr++] = tmp[i][j][k];
            }
        }
    }
    
    var len = (576 - 18 * sb); 
    for (var i = 0; i < len; i++) {
        xr[18 * sb + i] = tmp2[sb + i];
    }
};

module.exports = Layer3;


/***/ }),
/* 127 */
/***/ ((__unused_webpack_module, exports) => {

/*
 * These are the Huffman code words for Layer III.
 * The data for these tables are derived from Table B.7 of ISO/IEC 11172-3.
 *
 * These tables support decoding up to 4 Huffman code bits at a time.
 */

var PTR = function(offs, bits) {
    return {
        final: 0,
        ptr: {
            bits:   bits,
            offset: offs
        }
    };
};

var huffquad_V = function (v, w, x, y, hlen) {
    return {
        final: 1,
        value: {
            v: v,
            w: w,
            x: x,
            y: y,
            hlen: hlen
        }
    };
};

const hufftabA = [
  /* 0000 */ PTR(16, 2),
  /* 0001 */ PTR(20, 2),
  /* 0010 */ PTR(24, 1),
  /* 0011 */ PTR(26, 1),
  /* 0100 */ huffquad_V(0, 0, 1, 0, 4),
  /* 0101 */ huffquad_V(0, 0, 0, 1, 4),
  /* 0110 */ huffquad_V(0, 1, 0, 0, 4),
  /* 0111 */ huffquad_V(1, 0, 0, 0, 4),
  /* 1000 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1001 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1010 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1011 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1100 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1101 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1110 */ huffquad_V(0, 0, 0, 0, 1),
  /* 1111 */ huffquad_V(0, 0, 0, 0, 1),

  /* 0000 ... */
  /* 00   */ huffquad_V(1, 0, 1, 1, 2),	/* 16 */
  /* 01   */ huffquad_V(1, 1, 1, 1, 2),
  /* 10   */ huffquad_V(1, 1, 0, 1, 2),
  /* 11   */ huffquad_V(1, 1, 1, 0, 2),

  /* 0001 ... */
  /* 00   */ huffquad_V(0, 1, 1, 1, 2),	/* 20 */
  /* 01   */ huffquad_V(0, 1, 0, 1, 2),
  /* 10   */ huffquad_V(1, 0, 0, 1, 1),
  /* 11   */ huffquad_V(1, 0, 0, 1, 1),

  /* 0010 ... */
  /* 0    */ huffquad_V(0, 1, 1, 0, 1),	/* 24 */
  /* 1    */ huffquad_V(0, 0, 1, 1, 1),

  /* 0011 ... */
  /* 0    */ huffquad_V(1, 0, 1, 0, 1),	/* 26 */
  /* 1    */ huffquad_V(1, 1, 0, 0, 1)
];

const hufftabB = [
  /* 0000 */ huffquad_V(1, 1, 1, 1, 4),
  /* 0001 */ huffquad_V(1, 1, 1, 0, 4),
  /* 0010 */ huffquad_V(1, 1, 0, 1, 4),
  /* 0011 */ huffquad_V(1, 1, 0, 0, 4),
  /* 0100 */ huffquad_V(1, 0, 1, 1, 4),
  /* 0101 */ huffquad_V(1, 0, 1, 0, 4),
  /* 0110 */ huffquad_V(1, 0, 0, 1, 4),
  /* 0111 */ huffquad_V(1, 0, 0, 0, 4),
  /* 1000 */ huffquad_V(0, 1, 1, 1, 4),
  /* 1001 */ huffquad_V(0, 1, 1, 0, 4),
  /* 1010 */ huffquad_V(0, 1, 0, 1, 4),
  /* 1011 */ huffquad_V(0, 1, 0, 0, 4),
  /* 1100 */ huffquad_V(0, 0, 1, 1, 4),
  /* 1101 */ huffquad_V(0, 0, 1, 0, 4),
  /* 1110 */ huffquad_V(0, 0, 0, 1, 4),
  /* 1111 */ huffquad_V(0, 0, 0, 0, 4)
];

var V = function (x, y, hlen) {
    return {
        final: 1,
        value: {
            x: x,
            y: y,
            hlen: hlen
        }
    };
};

const hufftab0 = [
  /*      */ V(0, 0, 0)
];

const hufftab1 = [
  /* 000  */ V(1, 1, 3),
  /* 001  */ V(0, 1, 3),
  /* 010  */ V(1, 0, 2),
  /* 011  */ V(1, 0, 2),
  /* 100  */ V(0, 0, 1),
  /* 101  */ V(0, 0, 1),
  /* 110  */ V(0, 0, 1),
  /* 111  */ V(0, 0, 1)
];

const hufftab2 = [
  /* 000  */ PTR(8, 3),
  /* 001  */ V(1, 1, 3),
  /* 010  */ V(0, 1, 3),
  /* 011  */ V(1, 0, 3),
  /* 100  */ V(0, 0, 1),
  /* 101  */ V(0, 0, 1),
  /* 110  */ V(0, 0, 1),
  /* 111  */ V(0, 0, 1),

  /* 000 ... */
  /* 000  */ V(2, 2, 3),	/* 8 */
  /* 001  */ V(0, 2, 3),
  /* 010  */ V(1, 2, 2),
  /* 011  */ V(1, 2, 2),
  /* 100  */ V(2, 1, 2),
  /* 101  */ V(2, 1, 2),
  /* 110  */ V(2, 0, 2),
  /* 111  */ V(2, 0, 2)
];

const hufftab3 = [
  /* 000  */ PTR(8, 3),
  /* 001  */ V(1, 0, 3),
  /* 010  */ V(1, 1, 2),
  /* 011  */ V(1, 1, 2),
  /* 100  */ V(0, 1, 2),
  /* 101  */ V(0, 1, 2),
  /* 110  */ V(0, 0, 2),
  /* 111  */ V(0, 0, 2),

  /* 000 ... */
  /* 000  */ V(2, 2, 3),	/* 8 */
  /* 001  */ V(0, 2, 3),
  /* 010  */ V(1, 2, 2),
  /* 011  */ V(1, 2, 2),
  /* 100  */ V(2, 1, 2),
  /* 101  */ V(2, 1, 2),
  /* 110  */ V(2, 0, 2),
  /* 111  */ V(2, 0, 2)
];

const hufftab5 = [
  /* 000  */ PTR(8, 4),
  /* 001  */ V(1, 1, 3),
  /* 010  */ V(0, 1, 3),
  /* 011  */ V(1, 0, 3),
  /* 100  */ V(0, 0, 1),
  /* 101  */ V(0, 0, 1),
  /* 110  */ V(0, 0, 1),
  /* 111  */ V(0, 0, 1),

  /* 000 ... */
  /* 0000 */ PTR(24, 1),	/* 8 */
  /* 0001 */ V(3, 2, 4),
  /* 0010 */ V(3, 1, 3),
  /* 0011 */ V(3, 1, 3),
  /* 0100 */ V(1, 3, 4),
  /* 0101 */ V(0, 3, 4),
  /* 0110 */ V(3, 0, 4),
  /* 0111 */ V(2, 2, 4),
  /* 1000 */ V(1, 2, 3),
  /* 1001 */ V(1, 2, 3),
  /* 1010 */ V(2, 1, 3),
  /* 1011 */ V(2, 1, 3),
  /* 1100 */ V(0, 2, 3),
  /* 1101 */ V(0, 2, 3),
  /* 1110 */ V(2, 0, 3),
  /* 1111 */ V(2, 0, 3),

  /* 000 0000 ... */
  /* 0    */ V(3, 3, 1),	/* 24 */
  /* 1    */ V(2, 3, 1)
];

const hufftab6 = [
  /* 0000 */ PTR(16, 3),
  /* 0001 */ PTR(24, 1),
  /* 0010 */ PTR(26, 1),
  /* 0011 */ V(1, 2, 4),
  /* 0100 */ V(2, 1, 4),
  /* 0101 */ V(2, 0, 4),
  /* 0110 */ V(0, 1, 3),
  /* 0111 */ V(0, 1, 3),
  /* 1000 */ V(1, 1, 2),
  /* 1001 */ V(1, 1, 2),
  /* 1010 */ V(1, 1, 2),
  /* 1011 */ V(1, 1, 2),
  /* 1100 */ V(1, 0, 3),
  /* 1101 */ V(1, 0, 3),
  /* 1110 */ V(0, 0, 3),
  /* 1111 */ V(0, 0, 3),

  /* 0000 ... */
  /* 000  */ V(3, 3, 3),	/* 16 */
  /* 001  */ V(0, 3, 3),
  /* 010  */ V(2, 3, 2),
  /* 011  */ V(2, 3, 2),
  /* 100  */ V(3, 2, 2),
  /* 101  */ V(3, 2, 2),
  /* 110  */ V(3, 0, 2),
  /* 111  */ V(3, 0, 2),

  /* 0001 ... */
  /* 0    */ V(1, 3, 1),	/* 24 */
  /* 1    */ V(3, 1, 1),

  /* 0010 ... */
  /* 0    */ V(2, 2, 1),	/* 26 */
  /* 1    */ V(0, 2, 1)
];

const hufftab7 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 2),
  /* 0011 */ V(1, 1, 4),
  /* 0100 */ V(0, 1, 3),
  /* 0101 */ V(0, 1, 3),
  /* 0110 */ V(1, 0, 3),
  /* 0111 */ V(1, 0, 3),
  /* 1000 */ V(0, 0, 1),
  /* 1001 */ V(0, 0, 1),
  /* 1010 */ V(0, 0, 1),
  /* 1011 */ V(0, 0, 1),
  /* 1100 */ V(0, 0, 1),
  /* 1101 */ V(0, 0, 1),
  /* 1110 */ V(0, 0, 1),
  /* 1111 */ V(0, 0, 1),

  /* 0000 ... */
  /* 0000 */ PTR(52, 2),	/* 16 */
  /* 0001 */ PTR(56, 1),
  /* 0010 */ PTR(58, 1),
  /* 0011 */ V(1, 5, 4),
  /* 0100 */ V(5, 1, 4),
  /* 0101 */ PTR(60, 1),
  /* 0110 */ V(5, 0, 4),
  /* 0111 */ PTR(62, 1),
  /* 1000 */ V(2, 4, 4),
  /* 1001 */ V(4, 2, 4),
  /* 1010 */ V(1, 4, 3),
  /* 1011 */ V(1, 4, 3),
  /* 1100 */ V(4, 1, 3),
  /* 1101 */ V(4, 1, 3),
  /* 1110 */ V(4, 0, 3),
  /* 1111 */ V(4, 0, 3),

  /* 0001 ... */
  /* 0000 */ V(0, 4, 4),	/* 32 */
  /* 0001 */ V(2, 3, 4),
  /* 0010 */ V(3, 2, 4),
  /* 0011 */ V(0, 3, 4),
  /* 0100 */ V(1, 3, 3),
  /* 0101 */ V(1, 3, 3),
  /* 0110 */ V(3, 1, 3),
  /* 0111 */ V(3, 1, 3),
  /* 1000 */ V(3, 0, 3),
  /* 1001 */ V(3, 0, 3),
  /* 1010 */ V(2, 2, 3),
  /* 1011 */ V(2, 2, 3),
  /* 1100 */ V(1, 2, 2),
  /* 1101 */ V(1, 2, 2),
  /* 1110 */ V(1, 2, 2),
  /* 1111 */ V(1, 2, 2),

  /* 0010 ... */
  /* 00   */ V(2, 1, 1),	/* 48 */
  /* 01   */ V(2, 1, 1),
  /* 10   */ V(0, 2, 2),
  /* 11   */ V(2, 0, 2),

  /* 0000 0000 ... */
  /* 00   */ V(5, 5, 2),	/* 52 */
  /* 01   */ V(4, 5, 2),
  /* 10   */ V(5, 4, 2),
  /* 11   */ V(5, 3, 2),

  /* 0000 0001 ... */
  /* 0    */ V(3, 5, 1),	/* 56 */
  /* 1    */ V(4, 4, 1),

  /* 0000 0010 ... */
  /* 0    */ V(2, 5, 1),	/* 58 */
  /* 1    */ V(5, 2, 1),

  /* 0000 0101 ... */
  /* 0    */ V(0, 5, 1),	/* 60 */
  /* 1    */ V(3, 4, 1),

  /* 0000 0111 ... */
  /* 0    */ V(4, 3, 1),	/* 62 */
  /* 1    */ V(3, 3, 1)
];

const hufftab8 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ V(1, 2, 4),
  /* 0011 */ V(2, 1, 4),
  /* 0100 */ V(1, 1, 2),
  /* 0101 */ V(1, 1, 2),
  /* 0110 */ V(1, 1, 2),
  /* 0111 */ V(1, 1, 2),
  /* 1000 */ V(0, 1, 3),
  /* 1001 */ V(0, 1, 3),
  /* 1010 */ V(1, 0, 3),
  /* 1011 */ V(1, 0, 3),
  /* 1100 */ V(0, 0, 2),
  /* 1101 */ V(0, 0, 2),
  /* 1110 */ V(0, 0, 2),
  /* 1111 */ V(0, 0, 2),

  /* 0000 ... */
  /* 0000 */ PTR(48, 3),	/* 16 */
  /* 0001 */ PTR(56, 2),
  /* 0010 */ PTR(60, 1),
  /* 0011 */ V(1, 5, 4),
  /* 0100 */ V(5, 1, 4),
  /* 0101 */ PTR(62, 1),
  /* 0110 */ PTR(64, 1),
  /* 0111 */ V(2, 4, 4),
  /* 1000 */ V(4, 2, 4),
  /* 1001 */ V(1, 4, 4),
  /* 1010 */ V(4, 1, 3),
  /* 1011 */ V(4, 1, 3),
  /* 1100 */ V(0, 4, 4),
  /* 1101 */ V(4, 0, 4),
  /* 1110 */ V(2, 3, 4),
  /* 1111 */ V(3, 2, 4),

  /* 0001 ... */
  /* 0000 */ V(1, 3, 4),	/* 32 */
  /* 0001 */ V(3, 1, 4),
  /* 0010 */ V(0, 3, 4),
  /* 0011 */ V(3, 0, 4),
  /* 0100 */ V(2, 2, 2),
  /* 0101 */ V(2, 2, 2),
  /* 0110 */ V(2, 2, 2),
  /* 0111 */ V(2, 2, 2),
  /* 1000 */ V(0, 2, 2),
  /* 1001 */ V(0, 2, 2),
  /* 1010 */ V(0, 2, 2),
  /* 1011 */ V(0, 2, 2),
  /* 1100 */ V(2, 0, 2),
  /* 1101 */ V(2, 0, 2),
  /* 1110 */ V(2, 0, 2),
  /* 1111 */ V(2, 0, 2),

  /* 0000 0000 ... */
  /* 000  */ V(5, 5, 3),	/* 48 */
  /* 001  */ V(5, 4, 3),
  /* 010  */ V(4, 5, 2),
  /* 011  */ V(4, 5, 2),
  /* 100  */ V(5, 3, 1),
  /* 101  */ V(5, 3, 1),
  /* 110  */ V(5, 3, 1),
  /* 111  */ V(5, 3, 1),

  /* 0000 0001 ... */
  /* 00   */ V(3, 5, 2),	/* 56 */
  /* 01   */ V(4, 4, 2),
  /* 10   */ V(2, 5, 1),
  /* 11   */ V(2, 5, 1),

  /* 0000 0010 ... */
  /* 0    */ V(5, 2, 1),	/* 60 */
  /* 1    */ V(0, 5, 1),

  /* 0000 0101 ... */
  /* 0    */ V(3, 4, 1),	/* 62 */
  /* 1    */ V(4, 3, 1),

  /* 0000 0110 ... */
  /* 0    */ V(5, 0, 1),	/* 64 */
  /* 1    */ V(3, 3, 1)
];

const hufftab9 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 3),
  /* 0010 */ PTR(40, 2),
  /* 0011 */ PTR(44, 2),
  /* 0100 */ PTR(48, 1),
  /* 0101 */ V(1, 2, 4),
  /* 0110 */ V(2, 1, 4),
  /* 0111 */ V(2, 0, 4),
  /* 1000 */ V(1, 1, 3),
  /* 1001 */ V(1, 1, 3),
  /* 1010 */ V(0, 1, 3),
  /* 1011 */ V(0, 1, 3),
  /* 1100 */ V(1, 0, 3),
  /* 1101 */ V(1, 0, 3),
  /* 1110 */ V(0, 0, 3),
  /* 1111 */ V(0, 0, 3),

  /* 0000 ... */
  /* 0000 */ PTR(50, 1),	/* 16 */
  /* 0001 */ V(3, 5, 4),
  /* 0010 */ V(5, 3, 4),
  /* 0011 */ PTR(52, 1),
  /* 0100 */ V(4, 4, 4),
  /* 0101 */ V(2, 5, 4),
  /* 0110 */ V(5, 2, 4),
  /* 0111 */ V(1, 5, 4),
  /* 1000 */ V(5, 1, 3),
  /* 1001 */ V(5, 1, 3),
  /* 1010 */ V(3, 4, 3),
  /* 1011 */ V(3, 4, 3),
  /* 1100 */ V(4, 3, 3),
  /* 1101 */ V(4, 3, 3),
  /* 1110 */ V(5, 0, 4),
  /* 1111 */ V(0, 4, 4),

  /* 0001 ... */
  /* 000  */ V(2, 4, 3),	/* 32 */
  /* 001  */ V(4, 2, 3),
  /* 010  */ V(3, 3, 3),
  /* 011  */ V(4, 0, 3),
  /* 100  */ V(1, 4, 2),
  /* 101  */ V(1, 4, 2),
  /* 110  */ V(4, 1, 2),
  /* 111  */ V(4, 1, 2),

  /* 0010 ... */
  /* 00   */ V(2, 3, 2),	/* 40 */
  /* 01   */ V(3, 2, 2),
  /* 10   */ V(1, 3, 1),
  /* 11   */ V(1, 3, 1),

  /* 0011 ... */
  /* 00   */ V(3, 1, 1),	/* 44 */
  /* 01   */ V(3, 1, 1),
  /* 10   */ V(0, 3, 2),
  /* 11   */ V(3, 0, 2),

  /* 0100 ... */
  /* 0    */ V(2, 2, 1),	/* 48 */
  /* 1    */ V(0, 2, 1),

  /* 0000 0000 ... */
  /* 0    */ V(5, 5, 1),	/* 50 */
  /* 1    */ V(4, 5, 1),

  /* 0000 0011 ... */
  /* 0    */ V(5, 4, 1),	/* 52 */
  /* 1    */ V(0, 5, 1)
];

const hufftab10 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 2),
  /* 0011 */ V(1, 1, 4),
  /* 0100 */ V(0, 1, 3),
  /* 0101 */ V(0, 1, 3),
  /* 0110 */ V(1, 0, 3),
  /* 0111 */ V(1, 0, 3),
  /* 1000 */ V(0, 0, 1),
  /* 1001 */ V(0, 0, 1),
  /* 1010 */ V(0, 0, 1),
  /* 1011 */ V(0, 0, 1),
  /* 1100 */ V(0, 0, 1),
  /* 1101 */ V(0, 0, 1),
  /* 1110 */ V(0, 0, 1),
  /* 1111 */ V(0, 0, 1),

  /* 0000 ... */
  /* 0000 */ PTR(52, 3),	/* 16 */
  /* 0001 */ PTR(60, 2),
  /* 0010 */ PTR(64, 3),
  /* 0011 */ PTR(72, 1),
  /* 0100 */ PTR(74, 2),
  /* 0101 */ PTR(78, 2),
  /* 0110 */ PTR(82, 2),
  /* 0111 */ V(1, 7, 4),
  /* 1000 */ V(7, 1, 4),
  /* 1001 */ PTR(86, 1),
  /* 1010 */ PTR(88, 2),
  /* 1011 */ PTR(92, 2),
  /* 1100 */ V(1, 6, 4),
  /* 1101 */ V(6, 1, 4),
  /* 1110 */ V(6, 0, 4),
  /* 1111 */ PTR(96, 1),

  /* 0001 ... */
  /* 0000 */ PTR(98, 1),	/* 32 */
  /* 0001 */ PTR(100, 1),
  /* 0010 */ V(1, 4, 4),
  /* 0011 */ V(4, 1, 4),
  /* 0100 */ V(4, 0, 4),
  /* 0101 */ V(2, 3, 4),
  /* 0110 */ V(3, 2, 4),
  /* 0111 */ V(0, 3, 4),
  /* 1000 */ V(1, 3, 3),
  /* 1001 */ V(1, 3, 3),
  /* 1010 */ V(3, 1, 3),
  /* 1011 */ V(3, 1, 3),
  /* 1100 */ V(3, 0, 3),
  /* 1101 */ V(3, 0, 3),
  /* 1110 */ V(2, 2, 3),
  /* 1111 */ V(2, 2, 3),

  /* 0010 ... */
  /* 00   */ V(1, 2, 2),	/* 48 */
  /* 01   */ V(2, 1, 2),
  /* 10   */ V(0, 2, 2),
  /* 11   */ V(2, 0, 2),

  /* 0000 0000 ... */
  /* 000  */ V(7, 7, 3),	/* 52 */
  /* 001  */ V(6, 7, 3),
  /* 010  */ V(7, 6, 3),
  /* 011  */ V(5, 7, 3),
  /* 100  */ V(7, 5, 3),
  /* 101  */ V(6, 6, 3),
  /* 110  */ V(4, 7, 2),
  /* 111  */ V(4, 7, 2),

  /* 0000 0001 ... */
  /* 00   */ V(7, 4, 2),	/* 60 */
  /* 01   */ V(5, 6, 2),
  /* 10   */ V(6, 5, 2),
  /* 11   */ V(3, 7, 2),

  /* 0000 0010 ... */
  /* 000  */ V(7, 3, 2),	/* 64 */
  /* 001  */ V(7, 3, 2),
  /* 010  */ V(4, 6, 2),
  /* 011  */ V(4, 6, 2),
  /* 100  */ V(5, 5, 3),
  /* 101  */ V(5, 4, 3),
  /* 110  */ V(6, 3, 2),
  /* 111  */ V(6, 3, 2),

  /* 0000 0011 ... */
  /* 0    */ V(2, 7, 1),	/* 72 */
  /* 1    */ V(7, 2, 1),

  /* 0000 0100 ... */
  /* 00   */ V(6, 4, 2),	/* 74 */
  /* 01   */ V(0, 7, 2),
  /* 10   */ V(7, 0, 1),
  /* 11   */ V(7, 0, 1),

  /* 0000 0101 ... */
  /* 00   */ V(6, 2, 1),	/* 78 */
  /* 01   */ V(6, 2, 1),
  /* 10   */ V(4, 5, 2),
  /* 11   */ V(3, 5, 2),

  /* 0000 0110 ... */
  /* 00   */ V(0, 6, 1),	/* 82 */
  /* 01   */ V(0, 6, 1),
  /* 10   */ V(5, 3, 2),
  /* 11   */ V(4, 4, 2),

  /* 0000 1001 ... */
  /* 0    */ V(3, 6, 1),	/* 86 */
  /* 1    */ V(2, 6, 1),

  /* 0000 1010 ... */
  /* 00   */ V(2, 5, 2),	/* 88 */
  /* 01   */ V(5, 2, 2),
  /* 10   */ V(1, 5, 1),
  /* 11   */ V(1, 5, 1),

  /* 0000 1011 ... */
  /* 00   */ V(5, 1, 1),	/* 92 */
  /* 01   */ V(5, 1, 1),
  /* 10   */ V(3, 4, 2),
  /* 11   */ V(4, 3, 2),

  /* 0000 1111 ... */
  /* 0    */ V(0, 5, 1),	/* 96 */
  /* 1    */ V(5, 0, 1),

  /* 0001 0000 ... */
  /* 0    */ V(2, 4, 1),	/* 98 */
  /* 1    */ V(4, 2, 1),

  /* 0001 0001 ... */
  /* 0    */ V(3, 3, 1),	/* 100 */
  /* 1    */ V(0, 4, 1)
];

const hufftab11 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ PTR(64, 3),
  /* 0100 */ V(1, 2, 4),
  /* 0101 */ PTR(72, 1),
  /* 0110 */ V(1, 1, 3),
  /* 0111 */ V(1, 1, 3),
  /* 1000 */ V(0, 1, 3),
  /* 1001 */ V(0, 1, 3),
  /* 1010 */ V(1, 0, 3),
  /* 1011 */ V(1, 0, 3),
  /* 1100 */ V(0, 0, 2),
  /* 1101 */ V(0, 0, 2),
  /* 1110 */ V(0, 0, 2),
  /* 1111 */ V(0, 0, 2),

  /* 0000 ... */
  /* 0000 */ PTR(74, 2),	/* 16 */
  /* 0001 */ PTR(78, 3),
  /* 0010 */ PTR(86, 2),
  /* 0011 */ PTR(90, 1),
  /* 0100 */ PTR(92, 2),
  /* 0101 */ V(2, 7, 4),
  /* 0110 */ V(7, 2, 4),
  /* 0111 */ PTR(96, 1),
  /* 1000 */ V(7, 1, 3),
  /* 1001 */ V(7, 1, 3),
  /* 1010 */ V(1, 7, 4),
  /* 1011 */ V(7, 0, 4),
  /* 1100 */ V(3, 6, 4),
  /* 1101 */ V(6, 3, 4),
  /* 1110 */ V(6, 0, 4),
  /* 1111 */ PTR(98, 1),

  /* 0001 ... */
  /* 0000 */ PTR(100, 1),	/* 32 */
  /* 0001 */ V(1, 5, 4),
  /* 0010 */ V(6, 2, 3),
  /* 0011 */ V(6, 2, 3),
  /* 0100 */ V(2, 6, 4),
  /* 0101 */ V(0, 6, 4),
  /* 0110 */ V(1, 6, 3),
  /* 0111 */ V(1, 6, 3),
  /* 1000 */ V(6, 1, 3),
  /* 1001 */ V(6, 1, 3),
  /* 1010 */ V(5, 1, 4),
  /* 1011 */ V(3, 4, 4),
  /* 1100 */ V(5, 0, 4),
  /* 1101 */ PTR(102, 1),
  /* 1110 */ V(2, 4, 4),
  /* 1111 */ V(4, 2, 4),

  /* 0010 ... */
  /* 0000 */ V(1, 4, 4),	/* 48 */
  /* 0001 */ V(4, 1, 4),
  /* 0010 */ V(0, 4, 4),
  /* 0011 */ V(4, 0, 4),
  /* 0100 */ V(2, 3, 3),
  /* 0101 */ V(2, 3, 3),
  /* 0110 */ V(3, 2, 3),
  /* 0111 */ V(3, 2, 3),
  /* 1000 */ V(1, 3, 2),
  /* 1001 */ V(1, 3, 2),
  /* 1010 */ V(1, 3, 2),
  /* 1011 */ V(1, 3, 2),
  /* 1100 */ V(3, 1, 2),
  /* 1101 */ V(3, 1, 2),
  /* 1110 */ V(3, 1, 2),
  /* 1111 */ V(3, 1, 2),

  /* 0011 ... */
  /* 000  */ V(0, 3, 3),	/* 64 */
  /* 001  */ V(3, 0, 3),
  /* 010  */ V(2, 2, 2),
  /* 011  */ V(2, 2, 2),
  /* 100  */ V(2, 1, 1),
  /* 101  */ V(2, 1, 1),
  /* 110  */ V(2, 1, 1),
  /* 111  */ V(2, 1, 1),

  /* 0101 ... */
  /* 0    */ V(0, 2, 1),	/* 72 */
  /* 1    */ V(2, 0, 1),

  /* 0000 0000 ... */
  /* 00   */ V(7, 7, 2),	/* 74 */
  /* 01   */ V(6, 7, 2),
  /* 10   */ V(7, 6, 2),
  /* 11   */ V(7, 5, 2),

  /* 0000 0001 ... */
  /* 000  */ V(6, 6, 2),	/* 78 */
  /* 001  */ V(6, 6, 2),
  /* 010  */ V(4, 7, 2),
  /* 011  */ V(4, 7, 2),
  /* 100  */ V(7, 4, 2),
  /* 101  */ V(7, 4, 2),
  /* 110  */ V(5, 7, 3),
  /* 111  */ V(5, 5, 3),

  /* 0000 0010 ... */
  /* 00   */ V(5, 6, 2),	/* 86 */
  /* 01   */ V(6, 5, 2),
  /* 10   */ V(3, 7, 1),
  /* 11   */ V(3, 7, 1),

  /* 0000 0011 ... */
  /* 0    */ V(7, 3, 1),	/* 90 */
  /* 1    */ V(4, 6, 1),

  /* 0000 0100 ... */
  /* 00   */ V(4, 5, 2),	/* 92 */
  /* 01   */ V(5, 4, 2),
  /* 10   */ V(3, 5, 2),
  /* 11   */ V(5, 3, 2),

  /* 0000 0111 ... */
  /* 0    */ V(6, 4, 1),	/* 96 */
  /* 1    */ V(0, 7, 1),

  /* 0000 1111 ... */
  /* 0    */ V(4, 4, 1),	/* 98 */
  /* 1    */ V(2, 5, 1),

  /* 0001 0000 ... */
  /* 0    */ V(5, 2, 1),	/* 100 */
  /* 1    */ V(0, 5, 1),

  /* 0001 1101 ... */
  /* 0    */ V(4, 3, 1),	/* 102 */
  /* 1    */ V(3, 3, 1)
];

const hufftab12 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ PTR(64, 2),
  /* 0100 */ PTR(68, 3),
  /* 0101 */ PTR(76, 1),
  /* 0110 */ V(1, 2, 4),
  /* 0111 */ V(2, 1, 4),
  /* 1000 */ PTR(78, 1),
  /* 1001 */ V(0, 0, 4),
  /* 1010 */ V(1, 1, 3),
  /* 1011 */ V(1, 1, 3),
  /* 1100 */ V(0, 1, 3),
  /* 1101 */ V(0, 1, 3),
  /* 1110 */ V(1, 0, 3),
  /* 1111 */ V(1, 0, 3),

  /* 0000 ... */
  /* 0000 */ PTR(80, 2),	/* 16 */
  /* 0001 */ PTR(84, 1),
  /* 0010 */ PTR(86, 1),
  /* 0011 */ PTR(88, 1),
  /* 0100 */ V(5, 6, 4),
  /* 0101 */ V(3, 7, 4),
  /* 0110 */ PTR(90, 1),
  /* 0111 */ V(2, 7, 4),
  /* 1000 */ V(7, 2, 4),
  /* 1001 */ V(4, 6, 4),
  /* 1010 */ V(6, 4, 4),
  /* 1011 */ V(1, 7, 4),
  /* 1100 */ V(7, 1, 4),
  /* 1101 */ PTR(92, 1),
  /* 1110 */ V(3, 6, 4),
  /* 1111 */ V(6, 3, 4),

  /* 0001 ... */
  /* 0000 */ V(4, 5, 4),	/* 32 */
  /* 0001 */ V(5, 4, 4),
  /* 0010 */ V(4, 4, 4),
  /* 0011 */ PTR(94, 1),
  /* 0100 */ V(2, 6, 3),
  /* 0101 */ V(2, 6, 3),
  /* 0110 */ V(6, 2, 3),
  /* 0111 */ V(6, 2, 3),
  /* 1000 */ V(6, 1, 3),
  /* 1001 */ V(6, 1, 3),
  /* 1010 */ V(1, 6, 4),
  /* 1011 */ V(6, 0, 4),
  /* 1100 */ V(3, 5, 4),
  /* 1101 */ V(5, 3, 4),
  /* 1110 */ V(2, 5, 4),
  /* 1111 */ V(5, 2, 4),

  /* 0010 ... */
  /* 0000 */ V(1, 5, 3),	/* 48 */
  /* 0001 */ V(1, 5, 3),
  /* 0010 */ V(5, 1, 3),
  /* 0011 */ V(5, 1, 3),
  /* 0100 */ V(3, 4, 3),
  /* 0101 */ V(3, 4, 3),
  /* 0110 */ V(4, 3, 3),
  /* 0111 */ V(4, 3, 3),
  /* 1000 */ V(5, 0, 4),
  /* 1001 */ V(0, 4, 4),
  /* 1010 */ V(2, 4, 3),
  /* 1011 */ V(2, 4, 3),
  /* 1100 */ V(4, 2, 3),
  /* 1101 */ V(4, 2, 3),
  /* 1110 */ V(1, 4, 3),
  /* 1111 */ V(1, 4, 3),

  /* 0011 ... */
  /* 00   */ V(3, 3, 2),	/* 64 */
  /* 01   */ V(4, 1, 2),
  /* 10   */ V(2, 3, 2),
  /* 11   */ V(3, 2, 2),

  /* 0100 ... */
  /* 000  */ V(4, 0, 3),	/* 68 */
  /* 001  */ V(0, 3, 3),
  /* 010  */ V(3, 0, 2),
  /* 011  */ V(3, 0, 2),
  /* 100  */ V(1, 3, 1),
  /* 101  */ V(1, 3, 1),
  /* 110  */ V(1, 3, 1),
  /* 111  */ V(1, 3, 1),

  /* 0101 ... */
  /* 0    */ V(3, 1, 1),	/* 76 */
  /* 1    */ V(2, 2, 1),

  /* 1000 ... */
  /* 0    */ V(0, 2, 1),	/* 78 */
  /* 1    */ V(2, 0, 1),

  /* 0000 0000 ... */
  /* 00   */ V(7, 7, 2),	/* 80 */
  /* 01   */ V(6, 7, 2),
  /* 10   */ V(7, 6, 1),
  /* 11   */ V(7, 6, 1),

  /* 0000 0001 ... */
  /* 0    */ V(5, 7, 1),	/* 84 */
  /* 1    */ V(7, 5, 1),

  /* 0000 0010 ... */
  /* 0    */ V(6, 6, 1),	/* 86 */
  /* 1    */ V(4, 7, 1),

  /* 0000 0011 ... */
  /* 0    */ V(7, 4, 1),	/* 88 */
  /* 1    */ V(6, 5, 1),

  /* 0000 0110 ... */
  /* 0    */ V(7, 3, 1),	/* 90 */
  /* 1    */ V(5, 5, 1),

  /* 0000 1101 ... */
  /* 0    */ V(0, 7, 1),	/* 92 */
  /* 1    */ V(7, 0, 1),

  /* 0001 0011 ... */
  /* 0    */ V(0, 6, 1),	/* 94 */
  /* 1    */ V(0, 5, 1)
];

const hufftab13 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ PTR(64, 2),
  /* 0100 */ V(1, 1, 4),
  /* 0101 */ V(0, 1, 4),
  /* 0110 */ V(1, 0, 3),
  /* 0111 */ V(1, 0, 3),
  /* 1000 */ V(0, 0, 1),
  /* 1001 */ V(0, 0, 1),
  /* 1010 */ V(0, 0, 1),
  /* 1011 */ V(0, 0, 1),
  /* 1100 */ V(0, 0, 1),
  /* 1101 */ V(0, 0, 1),
  /* 1110 */ V(0, 0, 1),
  /* 1111 */ V(0, 0, 1),

  /* 0000 ... */
  /* 0000 */ PTR(68, 4),	/* 16 */
  /* 0001 */ PTR(84, 4),
  /* 0010 */ PTR(100, 4),
  /* 0011 */ PTR(116, 4),
  /* 0100 */ PTR(132, 4),
  /* 0101 */ PTR(148, 4),
  /* 0110 */ PTR(164, 3),
  /* 0111 */ PTR(172, 3),
  /* 1000 */ PTR(180, 3),
  /* 1001 */ PTR(188, 3),
  /* 1010 */ PTR(196, 3),
  /* 1011 */ PTR(204, 3),
  /* 1100 */ PTR(212, 1),
  /* 1101 */ PTR(214, 2),
  /* 1110 */ PTR(218, 3),
  /* 1111 */ PTR(226, 1),

  /* 0001 ... */
  /* 0000 */ PTR(228, 2),	/* 32 */
  /* 0001 */ PTR(232, 2),
  /* 0010 */ PTR(236, 2),
  /* 0011 */ PTR(240, 2),
  /* 0100 */ V(8, 1, 4),
  /* 0101 */ PTR(244, 1),
  /* 0110 */ PTR(246, 1),
  /* 0111 */ PTR(248, 1),
  /* 1000 */ PTR(250, 2),
  /* 1001 */ PTR(254, 1),
  /* 1010 */ V(1, 5, 4),
  /* 1011 */ V(5, 1, 4),
  /* 1100 */ PTR(256, 1),
  /* 1101 */ PTR(258, 1),
  /* 1110 */ PTR(260, 1),
  /* 1111 */ V(1, 4, 4),

  /* 0010 ... */
  /* 0000 */ V(4, 1, 3),	/* 48 */
  /* 0001 */ V(4, 1, 3),
  /* 0010 */ V(0, 4, 4),
  /* 0011 */ V(4, 0, 4),
  /* 0100 */ V(2, 3, 4),
  /* 0101 */ V(3, 2, 4),
  /* 0110 */ V(1, 3, 3),
  /* 0111 */ V(1, 3, 3),
  /* 1000 */ V(3, 1, 3),
  /* 1001 */ V(3, 1, 3),
  /* 1010 */ V(0, 3, 3),
  /* 1011 */ V(0, 3, 3),
  /* 1100 */ V(3, 0, 3),
  /* 1101 */ V(3, 0, 3),
  /* 1110 */ V(2, 2, 3),
  /* 1111 */ V(2, 2, 3),

  /* 0011 ... */
  /* 00   */ V(1, 2, 2),	/* 64 */
  /* 01   */ V(2, 1, 2),
  /* 10   */ V(0, 2, 2),
  /* 11   */ V(2, 0, 2),

  /* 0000 0000 ... */
  /* 0000 */ PTR(262, 4),	/* 68 */
  /* 0001 */ PTR(278, 4),
  /* 0010 */ PTR(294, 4),
  /* 0011 */ PTR(310, 3),
  /* 0100 */ PTR(318, 2),
  /* 0101 */ PTR(322, 2),
  /* 0110 */ PTR(326, 3),
  /* 0111 */ PTR(334, 2),
  /* 1000 */ PTR(338, 1),
  /* 1001 */ PTR(340, 2),
  /* 1010 */ PTR(344, 2),
  /* 1011 */ PTR(348, 2),
  /* 1100 */ PTR(352, 2),
  /* 1101 */ PTR(356, 2),
  /* 1110 */ V(1, 15, 4),
  /* 1111 */ V(15, 1, 4),

  /* 0000 0001 ... */
  /* 0000 */ V(15, 0, 4),	/* 84 */
  /* 0001 */ PTR(360, 1),
  /* 0010 */ PTR(362, 1),
  /* 0011 */ PTR(364, 1),
  /* 0100 */ V(14, 2, 4),
  /* 0101 */ PTR(366, 1),
  /* 0110 */ V(1, 14, 4),
  /* 0111 */ V(14, 1, 4),
  /* 1000 */ PTR(368, 1),
  /* 1001 */ PTR(370, 1),
  /* 1010 */ PTR(372, 1),
  /* 1011 */ PTR(374, 1),
  /* 1100 */ PTR(376, 1),
  /* 1101 */ PTR(378, 1),
  /* 1110 */ V(12, 6, 4),
  /* 1111 */ V(3, 13, 4),

  /* 0000 0010 ... */
  /* 0000 */ PTR(380, 1),	/* 100 */
  /* 0001 */ V(2, 13, 4),
  /* 0010 */ V(13, 2, 4),
  /* 0011 */ V(1, 13, 4),
  /* 0100 */ V(11, 7, 4),
  /* 0101 */ PTR(382, 1),
  /* 0110 */ PTR(384, 1),
  /* 0111 */ V(12, 3, 4),
  /* 1000 */ PTR(386, 1),
  /* 1001 */ V(4, 11, 4),
  /* 1010 */ V(13, 1, 3),
  /* 1011 */ V(13, 1, 3),
  /* 1100 */ V(0, 13, 4),
  /* 1101 */ V(13, 0, 4),
  /* 1110 */ V(8, 10, 4),
  /* 1111 */ V(10, 8, 4),

  /* 0000 0011 ... */
  /* 0000 */ V(4, 12, 4),	/* 116 */
  /* 0001 */ V(12, 4, 4),
  /* 0010 */ V(6, 11, 4),
  /* 0011 */ V(11, 6, 4),
  /* 0100 */ V(3, 12, 3),
  /* 0101 */ V(3, 12, 3),
  /* 0110 */ V(2, 12, 3),
  /* 0111 */ V(2, 12, 3),
  /* 1000 */ V(12, 2, 3),
  /* 1001 */ V(12, 2, 3),
  /* 1010 */ V(5, 11, 3),
  /* 1011 */ V(5, 11, 3),
  /* 1100 */ V(11, 5, 4),
  /* 1101 */ V(8, 9, 4),
  /* 1110 */ V(1, 12, 3),
  /* 1111 */ V(1, 12, 3),

  /* 0000 0100 ... */
  /* 0000 */ V(12, 1, 3),	/* 132 */
  /* 0001 */ V(12, 1, 3),
  /* 0010 */ V(9, 8, 4),
  /* 0011 */ V(0, 12, 4),
  /* 0100 */ V(12, 0, 3),
  /* 0101 */ V(12, 0, 3),
  /* 0110 */ V(11, 4, 4),
  /* 0111 */ V(6, 10, 4),
  /* 1000 */ V(10, 6, 4),
  /* 1001 */ V(7, 9, 4),
  /* 1010 */ V(3, 11, 3),
  /* 1011 */ V(3, 11, 3),
  /* 1100 */ V(11, 3, 3),
  /* 1101 */ V(11, 3, 3),
  /* 1110 */ V(8, 8, 4),
  /* 1111 */ V(5, 10, 4),

  /* 0000 0101 ... */
  /* 0000 */ V(2, 11, 3),	/* 148 */
  /* 0001 */ V(2, 11, 3),
  /* 0010 */ V(10, 5, 4),
  /* 0011 */ V(6, 9, 4),
  /* 0100 */ V(10, 4, 3),
  /* 0101 */ V(10, 4, 3),
  /* 0110 */ V(7, 8, 4),
  /* 0111 */ V(8, 7, 4),
  /* 1000 */ V(9, 4, 3),
  /* 1001 */ V(9, 4, 3),
  /* 1010 */ V(7, 7, 4),
  /* 1011 */ V(7, 6, 4),
  /* 1100 */ V(11, 2, 2),
  /* 1101 */ V(11, 2, 2),
  /* 1110 */ V(11, 2, 2),
  /* 1111 */ V(11, 2, 2),

  /* 0000 0110 ... */
  /* 000  */ V(1, 11, 2),	/* 164 */
  /* 001  */ V(1, 11, 2),
  /* 010  */ V(11, 1, 2),
  /* 011  */ V(11, 1, 2),
  /* 100  */ V(0, 11, 3),
  /* 101  */ V(11, 0, 3),
  /* 110  */ V(9, 6, 3),
  /* 111  */ V(4, 10, 3),

  /* 0000 0111 ... */
  /* 000  */ V(3, 10, 3),	/* 172 */
  /* 001  */ V(10, 3, 3),
  /* 010  */ V(5, 9, 3),
  /* 011  */ V(9, 5, 3),
  /* 100  */ V(2, 10, 2),
  /* 101  */ V(2, 10, 2),
  /* 110  */ V(10, 2, 2),
  /* 111  */ V(10, 2, 2),

  /* 0000 1000 ... */
  /* 000  */ V(1, 10, 2),	/* 180 */
  /* 001  */ V(1, 10, 2),
  /* 010  */ V(10, 1, 2),
  /* 011  */ V(10, 1, 2),
  /* 100  */ V(0, 10, 3),
  /* 101  */ V(6, 8, 3),
  /* 110  */ V(10, 0, 2),
  /* 111  */ V(10, 0, 2),

  /* 0000 1001 ... */
  /* 000  */ V(8, 6, 3),	/* 188 */
  /* 001  */ V(4, 9, 3),
  /* 010  */ V(9, 3, 2),
  /* 011  */ V(9, 3, 2),
  /* 100  */ V(3, 9, 3),
  /* 101  */ V(5, 8, 3),
  /* 110  */ V(8, 5, 3),
  /* 111  */ V(6, 7, 3),

  /* 0000 1010 ... */
  /* 000  */ V(2, 9, 2),	/* 196 */
  /* 001  */ V(2, 9, 2),
  /* 010  */ V(9, 2, 2),
  /* 011  */ V(9, 2, 2),
  /* 100  */ V(5, 7, 3),
  /* 101  */ V(7, 5, 3),
  /* 110  */ V(3, 8, 2),
  /* 111  */ V(3, 8, 2),

  /* 0000 1011 ... */
  /* 000  */ V(8, 3, 2),	/* 204 */
  /* 001  */ V(8, 3, 2),
  /* 010  */ V(6, 6, 3),
  /* 011  */ V(4, 7, 3),
  /* 100  */ V(7, 4, 3),
  /* 101  */ V(5, 6, 3),
  /* 110  */ V(6, 5, 3),
  /* 111  */ V(7, 3, 3),

  /* 0000 1100 ... */
  /* 0    */ V(1, 9, 1),	/* 212 */
  /* 1    */ V(9, 1, 1),

  /* 0000 1101 ... */
  /* 00   */ V(0, 9, 2),	/* 214 */
  /* 01   */ V(9, 0, 2),
  /* 10   */ V(4, 8, 2),
  /* 11   */ V(8, 4, 2),

  /* 0000 1110 ... */
  /* 000  */ V(7, 2, 2),	/* 218 */
  /* 001  */ V(7, 2, 2),
  /* 010  */ V(4, 6, 3),
  /* 011  */ V(6, 4, 3),
  /* 100  */ V(2, 8, 1),
  /* 101  */ V(2, 8, 1),
  /* 110  */ V(2, 8, 1),
  /* 111  */ V(2, 8, 1),

  /* 0000 1111 ... */
  /* 0    */ V(8, 2, 1),	/* 226 */
  /* 1    */ V(1, 8, 1),

  /* 0001 0000 ... */
  /* 00   */ V(3, 7, 2),	/* 228 */
  /* 01   */ V(2, 7, 2),
  /* 10   */ V(1, 7, 1),
  /* 11   */ V(1, 7, 1),

  /* 0001 0001 ... */
  /* 00   */ V(7, 1, 1),	/* 232 */
  /* 01   */ V(7, 1, 1),
  /* 10   */ V(5, 5, 2),
  /* 11   */ V(0, 7, 2),

  /* 0001 0010 ... */
  /* 00   */ V(7, 0, 2),	/* 236 */
  /* 01   */ V(3, 6, 2),
  /* 10   */ V(6, 3, 2),
  /* 11   */ V(4, 5, 2),

  /* 0001 0011 ... */
  /* 00   */ V(5, 4, 2),	/* 240 */
  /* 01   */ V(2, 6, 2),
  /* 10   */ V(6, 2, 2),
  /* 11   */ V(3, 5, 2),

  /* 0001 0101 ... */
  /* 0    */ V(0, 8, 1),	/* 244 */
  /* 1    */ V(8, 0, 1),

  /* 0001 0110 ... */
  /* 0    */ V(1, 6, 1),	/* 246 */
  /* 1    */ V(6, 1, 1),

  /* 0001 0111 ... */
  /* 0    */ V(0, 6, 1),	/* 248 */
  /* 1    */ V(6, 0, 1),

  /* 0001 1000 ... */
  /* 00   */ V(5, 3, 2),	/* 250 */
  /* 01   */ V(4, 4, 2),
  /* 10   */ V(2, 5, 1),
  /* 11   */ V(2, 5, 1),

  /* 0001 1001 ... */
  /* 0    */ V(5, 2, 1),	/* 254 */
  /* 1    */ V(0, 5, 1),

  /* 0001 1100 ... */
  /* 0    */ V(3, 4, 1),	/* 256 */
  /* 1    */ V(4, 3, 1),

  /* 0001 1101 ... */
  /* 0    */ V(5, 0, 1),	/* 258 */
  /* 1    */ V(2, 4, 1),

  /* 0001 1110 ... */
  /* 0    */ V(4, 2, 1),	/* 260 */
  /* 1    */ V(3, 3, 1),

  /* 0000 0000 0000 ... */
  /* 0000 */ PTR(388, 3),	/* 262 */
  /* 0001 */ V(15, 15, 4),
  /* 0010 */ V(14, 15, 4),
  /* 0011 */ V(13, 15, 4),
  /* 0100 */ V(14, 14, 4),
  /* 0101 */ V(12, 15, 4),
  /* 0110 */ V(13, 14, 4),
  /* 0111 */ V(11, 15, 4),
  /* 1000 */ V(15, 11, 4),
  /* 1001 */ V(12, 14, 4),
  /* 1010 */ V(13, 12, 4),
  /* 1011 */ PTR(396, 1),
  /* 1100 */ V(14, 12, 3),
  /* 1101 */ V(14, 12, 3),
  /* 1110 */ V(13, 13, 3),
  /* 1111 */ V(13, 13, 3),

  /* 0000 0000 0001 ... */
  /* 0000 */ V(15, 10, 4),	/* 278 */
  /* 0001 */ V(12, 13, 4),
  /* 0010 */ V(11, 14, 3),
  /* 0011 */ V(11, 14, 3),
  /* 0100 */ V(14, 11, 3),
  /* 0101 */ V(14, 11, 3),
  /* 0110 */ V(9, 15, 3),
  /* 0111 */ V(9, 15, 3),
  /* 1000 */ V(15, 9, 3),
  /* 1001 */ V(15, 9, 3),
  /* 1010 */ V(14, 10, 3),
  /* 1011 */ V(14, 10, 3),
  /* 1100 */ V(11, 13, 3),
  /* 1101 */ V(11, 13, 3),
  /* 1110 */ V(13, 11, 3),
  /* 1111 */ V(13, 11, 3),

  /* 0000 0000 0010 ... */
  /* 0000 */ V(8, 15, 3),	/* 294 */
  /* 0001 */ V(8, 15, 3),
  /* 0010 */ V(15, 8, 3),
  /* 0011 */ V(15, 8, 3),
  /* 0100 */ V(12, 12, 3),
  /* 0101 */ V(12, 12, 3),
  /* 0110 */ V(10, 14, 4),
  /* 0111 */ V(9, 14, 4),
  /* 1000 */ V(8, 14, 3),
  /* 1001 */ V(8, 14, 3),
  /* 1010 */ V(7, 15, 4),
  /* 1011 */ V(7, 14, 4),
  /* 1100 */ V(15, 7, 2),
  /* 1101 */ V(15, 7, 2),
  /* 1110 */ V(15, 7, 2),
  /* 1111 */ V(15, 7, 2),

  /* 0000 0000 0011 ... */
  /* 000  */ V(13, 10, 2),	/* 310 */
  /* 001  */ V(13, 10, 2),
  /* 010  */ V(10, 13, 3),
  /* 011  */ V(11, 12, 3),
  /* 100  */ V(12, 11, 3),
  /* 101  */ V(15, 6, 3),
  /* 110  */ V(6, 15, 2),
  /* 111  */ V(6, 15, 2),

  /* 0000 0000 0100 ... */
  /* 00   */ V(14, 8, 2),	/* 318 */
  /* 01   */ V(5, 15, 2),
  /* 10   */ V(9, 13, 2),
  /* 11   */ V(13, 9, 2),

  /* 0000 0000 0101 ... */
  /* 00   */ V(15, 5, 2),	/* 322 */
  /* 01   */ V(14, 7, 2),
  /* 10   */ V(10, 12, 2),
  /* 11   */ V(11, 11, 2),

  /* 0000 0000 0110 ... */
  /* 000  */ V(4, 15, 2),	/* 326 */
  /* 001  */ V(4, 15, 2),
  /* 010  */ V(15, 4, 2),
  /* 011  */ V(15, 4, 2),
  /* 100  */ V(12, 10, 3),
  /* 101  */ V(14, 6, 3),
  /* 110  */ V(15, 3, 2),
  /* 111  */ V(15, 3, 2),

  /* 0000 0000 0111 ... */
  /* 00   */ V(3, 15, 1),	/* 334 */
  /* 01   */ V(3, 15, 1),
  /* 10   */ V(8, 13, 2),
  /* 11   */ V(13, 8, 2),

  /* 0000 0000 1000 ... */
  /* 0    */ V(2, 15, 1),	/* 338 */
  /* 1    */ V(15, 2, 1),

  /* 0000 0000 1001 ... */
  /* 00   */ V(6, 14, 2),	/* 340 */
  /* 01   */ V(9, 12, 2),
  /* 10   */ V(0, 15, 1),
  /* 11   */ V(0, 15, 1),

  /* 0000 0000 1010 ... */
  /* 00   */ V(12, 9, 2),	/* 344 */
  /* 01   */ V(5, 14, 2),
  /* 10   */ V(10, 11, 1),
  /* 11   */ V(10, 11, 1),

  /* 0000 0000 1011 ... */
  /* 00   */ V(7, 13, 2),	/* 348 */
  /* 01   */ V(13, 7, 2),
  /* 10   */ V(4, 14, 1),
  /* 11   */ V(4, 14, 1),

  /* 0000 0000 1100 ... */
  /* 00   */ V(12, 8, 2),	/* 352 */
  /* 01   */ V(13, 6, 2),
  /* 10   */ V(3, 14, 1),
  /* 11   */ V(3, 14, 1),

  /* 0000 0000 1101 ... */
  /* 00   */ V(11, 9, 1),	/* 356 */
  /* 01   */ V(11, 9, 1),
  /* 10   */ V(9, 11, 2),
  /* 11   */ V(10, 10, 2),

  /* 0000 0001 0001 ... */
  /* 0    */ V(11, 10, 1),	/* 360 */
  /* 1    */ V(14, 5, 1),

  /* 0000 0001 0010 ... */
  /* 0    */ V(14, 4, 1),	/* 362 */
  /* 1    */ V(8, 12, 1),

  /* 0000 0001 0011 ... */
  /* 0    */ V(6, 13, 1),	/* 364 */
  /* 1    */ V(14, 3, 1),

  /* 0000 0001 0101 ... */
  /* 0    */ V(2, 14, 1),	/* 366 */
  /* 1    */ V(0, 14, 1),

  /* 0000 0001 1000 ... */
  /* 0    */ V(14, 0, 1),	/* 368 */
  /* 1    */ V(5, 13, 1),

  /* 0000 0001 1001 ... */
  /* 0    */ V(13, 5, 1),	/* 370 */
  /* 1    */ V(7, 12, 1),

  /* 0000 0001 1010 ... */
  /* 0    */ V(12, 7, 1),	/* 372 */
  /* 1    */ V(4, 13, 1),

  /* 0000 0001 1011 ... */
  /* 0    */ V(8, 11, 1),	/* 374 */
  /* 1    */ V(11, 8, 1),

  /* 0000 0001 1100 ... */
  /* 0    */ V(13, 4, 1),	/* 376 */
  /* 1    */ V(9, 10, 1),

  /* 0000 0001 1101 ... */
  /* 0    */ V(10, 9, 1),	/* 378 */
  /* 1    */ V(6, 12, 1),

  /* 0000 0010 0000 ... */
  /* 0    */ V(13, 3, 1),	/* 380 */
  /* 1    */ V(7, 11, 1),

  /* 0000 0010 0101 ... */
  /* 0    */ V(5, 12, 1),	/* 382 */
  /* 1    */ V(12, 5, 1),

  /* 0000 0010 0110 ... */
  /* 0    */ V(9, 9, 1),	/* 384 */
  /* 1    */ V(7, 10, 1),

  /* 0000 0010 1000 ... */
  /* 0    */ V(10, 7, 1),	/* 386 */
  /* 1    */ V(9, 7, 1),

  /* 0000 0000 0000 0000 ... */
  /* 000  */ V(15, 14, 3),	/* 388 */
  /* 001  */ V(15, 12, 3),
  /* 010  */ V(15, 13, 2),
  /* 011  */ V(15, 13, 2),
  /* 100  */ V(14, 13, 1),
  /* 101  */ V(14, 13, 1),
  /* 110  */ V(14, 13, 1),
  /* 111  */ V(14, 13, 1),

  /* 0000 0000 0000 1011 ... */
  /* 0    */ V(10, 15, 1),	/* 396 */
  /* 1    */ V(14, 9, 1)
];

const hufftab15 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ PTR(64, 4),
  /* 0100 */ PTR(80, 4),
  /* 0101 */ PTR(96, 3),
  /* 0110 */ PTR(104, 3),
  /* 0111 */ PTR(112, 2),
  /* 1000 */ PTR(116, 1),
  /* 1001 */ PTR(118, 1),
  /* 1010 */ V(1, 1, 3),
  /* 1011 */ V(1, 1, 3),
  /* 1100 */ V(0, 1, 4),
  /* 1101 */ V(1, 0, 4),
  /* 1110 */ V(0, 0, 3),
  /* 1111 */ V(0, 0, 3),

  /* 0000 ... */
  /* 0000 */ PTR(120, 4),	/* 16 */
  /* 0001 */ PTR(136, 4),
  /* 0010 */ PTR(152, 4),
  /* 0011 */ PTR(168, 4),
  /* 0100 */ PTR(184, 4),
  /* 0101 */ PTR(200, 3),
  /* 0110 */ PTR(208, 3),
  /* 0111 */ PTR(216, 4),
  /* 1000 */ PTR(232, 3),
  /* 1001 */ PTR(240, 3),
  /* 1010 */ PTR(248, 3),
  /* 1011 */ PTR(256, 3),
  /* 1100 */ PTR(264, 2),
  /* 1101 */ PTR(268, 3),
  /* 1110 */ PTR(276, 3),
  /* 1111 */ PTR(284, 2),

  /* 0001 ... */
  /* 0000 */ PTR(288, 2),	/* 32 */
  /* 0001 */ PTR(292, 2),
  /* 0010 */ PTR(296, 2),
  /* 0011 */ PTR(300, 2),
  /* 0100 */ PTR(304, 2),
  /* 0101 */ PTR(308, 2),
  /* 0110 */ PTR(312, 2),
  /* 0111 */ PTR(316, 2),
  /* 1000 */ PTR(320, 1),
  /* 1001 */ PTR(322, 1),
  /* 1010 */ PTR(324, 1),
  /* 1011 */ PTR(326, 2),
  /* 1100 */ PTR(330, 1),
  /* 1101 */ PTR(332, 1),
  /* 1110 */ PTR(334, 2),
  /* 1111 */ PTR(338, 1),

  /* 0010 ... */
  /* 0000 */ PTR(340, 1),	/* 48 */
  /* 0001 */ PTR(342, 1),
  /* 0010 */ V(9, 1, 4),
  /* 0011 */ PTR(344, 1),
  /* 0100 */ PTR(346, 1),
  /* 0101 */ PTR(348, 1),
  /* 0110 */ PTR(350, 1),
  /* 0111 */ PTR(352, 1),
  /* 1000 */ V(2, 8, 4),
  /* 1001 */ V(8, 2, 4),
  /* 1010 */ V(1, 8, 4),
  /* 1011 */ V(8, 1, 4),
  /* 1100 */ PTR(354, 1),
  /* 1101 */ PTR(356, 1),
  /* 1110 */ PTR(358, 1),
  /* 1111 */ PTR(360, 1),

  /* 0011 ... */
  /* 0000 */ V(2, 7, 4),	/* 64 */
  /* 0001 */ V(7, 2, 4),
  /* 0010 */ V(6, 4, 4),
  /* 0011 */ V(1, 7, 4),
  /* 0100 */ V(5, 5, 4),
  /* 0101 */ V(7, 1, 4),
  /* 0110 */ PTR(362, 1),
  /* 0111 */ V(3, 6, 4),
  /* 1000 */ V(6, 3, 4),
  /* 1001 */ V(4, 5, 4),
  /* 1010 */ V(5, 4, 4),
  /* 1011 */ V(2, 6, 4),
  /* 1100 */ V(6, 2, 4),
  /* 1101 */ V(1, 6, 4),
  /* 1110 */ PTR(364, 1),
  /* 1111 */ V(3, 5, 4),

  /* 0100 ... */
  /* 0000 */ V(6, 1, 3),	/* 80 */
  /* 0001 */ V(6, 1, 3),
  /* 0010 */ V(5, 3, 4),
  /* 0011 */ V(4, 4, 4),
  /* 0100 */ V(2, 5, 3),
  /* 0101 */ V(2, 5, 3),
  /* 0110 */ V(5, 2, 3),
  /* 0111 */ V(5, 2, 3),
  /* 1000 */ V(1, 5, 3),
  /* 1001 */ V(1, 5, 3),
  /* 1010 */ V(5, 1, 3),
  /* 1011 */ V(5, 1, 3),
  /* 1100 */ V(0, 5, 4),
  /* 1101 */ V(5, 0, 4),
  /* 1110 */ V(3, 4, 3),
  /* 1111 */ V(3, 4, 3),

  /* 0101 ... */
  /* 000  */ V(4, 3, 3),	/* 96 */
  /* 001  */ V(2, 4, 3),
  /* 010  */ V(4, 2, 3),
  /* 011  */ V(3, 3, 3),
  /* 100  */ V(4, 1, 2),
  /* 101  */ V(4, 1, 2),
  /* 110  */ V(1, 4, 3),
  /* 111  */ V(0, 4, 3),

  /* 0110 ... */
  /* 000  */ V(2, 3, 2),	/* 104 */
  /* 001  */ V(2, 3, 2),
  /* 010  */ V(3, 2, 2),
  /* 011  */ V(3, 2, 2),
  /* 100  */ V(4, 0, 3),
  /* 101  */ V(0, 3, 3),
  /* 110  */ V(1, 3, 2),
  /* 111  */ V(1, 3, 2),

  /* 0111 ... */
  /* 00   */ V(3, 1, 2),	/* 112 */
  /* 01   */ V(3, 0, 2),
  /* 10   */ V(2, 2, 1),
  /* 11   */ V(2, 2, 1),

  /* 1000 ... */
  /* 0    */ V(1, 2, 1),	/* 116 */
  /* 1    */ V(2, 1, 1),

  /* 1001 ... */
  /* 0    */ V(0, 2, 1),	/* 118 */
  /* 1    */ V(2, 0, 1),

  /* 0000 0000 ... */
  /* 0000 */ PTR(366, 1),	/* 120 */
  /* 0001 */ PTR(368, 1),
  /* 0010 */ V(14, 14, 4),
  /* 0011 */ PTR(370, 1),
  /* 0100 */ PTR(372, 1),
  /* 0101 */ PTR(374, 1),
  /* 0110 */ V(15, 11, 4),
  /* 0111 */ PTR(376, 1),
  /* 1000 */ V(13, 13, 4),
  /* 1001 */ V(10, 15, 4),
  /* 1010 */ V(15, 10, 4),
  /* 1011 */ V(11, 14, 4),
  /* 1100 */ V(14, 11, 4),
  /* 1101 */ V(12, 13, 4),
  /* 1110 */ V(13, 12, 4),
  /* 1111 */ V(9, 15, 4),

  /* 0000 0001 ... */
  /* 0000 */ V(15, 9, 4),	/* 136 */
  /* 0001 */ V(14, 10, 4),
  /* 0010 */ V(11, 13, 4),
  /* 0011 */ V(13, 11, 4),
  /* 0100 */ V(8, 15, 4),
  /* 0101 */ V(15, 8, 4),
  /* 0110 */ V(12, 12, 4),
  /* 0111 */ V(9, 14, 4),
  /* 1000 */ V(14, 9, 4),
  /* 1001 */ V(7, 15, 4),
  /* 1010 */ V(15, 7, 4),
  /* 1011 */ V(10, 13, 4),
  /* 1100 */ V(13, 10, 4),
  /* 1101 */ V(11, 12, 4),
  /* 1110 */ V(6, 15, 4),
  /* 1111 */ PTR(378, 1),

  /* 0000 0010 ... */
  /* 0000 */ V(12, 11, 3),	/* 152 */
  /* 0001 */ V(12, 11, 3),
  /* 0010 */ V(15, 6, 3),
  /* 0011 */ V(15, 6, 3),
  /* 0100 */ V(8, 14, 4),
  /* 0101 */ V(14, 8, 4),
  /* 0110 */ V(5, 15, 4),
  /* 0111 */ V(9, 13, 4),
  /* 1000 */ V(15, 5, 3),
  /* 1001 */ V(15, 5, 3),
  /* 1010 */ V(7, 14, 3),
  /* 1011 */ V(7, 14, 3),
  /* 1100 */ V(14, 7, 3),
  /* 1101 */ V(14, 7, 3),
  /* 1110 */ V(10, 12, 3),
  /* 1111 */ V(10, 12, 3),

  /* 0000 0011 ... */
  /* 0000 */ V(12, 10, 3),	/* 168 */
  /* 0001 */ V(12, 10, 3),
  /* 0010 */ V(11, 11, 3),
  /* 0011 */ V(11, 11, 3),
  /* 0100 */ V(13, 9, 4),
  /* 0101 */ V(8, 13, 4),
  /* 0110 */ V(4, 15, 3),
  /* 0111 */ V(4, 15, 3),
  /* 1000 */ V(15, 4, 3),
  /* 1001 */ V(15, 4, 3),
  /* 1010 */ V(3, 15, 3),
  /* 1011 */ V(3, 15, 3),
  /* 1100 */ V(15, 3, 3),
  /* 1101 */ V(15, 3, 3),
  /* 1110 */ V(13, 8, 3),
  /* 1111 */ V(13, 8, 3),

  /* 0000 0100 ... */
  /* 0000 */ V(14, 6, 3),	/* 184 */
  /* 0001 */ V(14, 6, 3),
  /* 0010 */ V(2, 15, 3),
  /* 0011 */ V(2, 15, 3),
  /* 0100 */ V(15, 2, 3),
  /* 0101 */ V(15, 2, 3),
  /* 0110 */ V(6, 14, 4),
  /* 0111 */ V(15, 0, 4),
  /* 1000 */ V(1, 15, 3),
  /* 1001 */ V(1, 15, 3),
  /* 1010 */ V(15, 1, 3),
  /* 1011 */ V(15, 1, 3),
  /* 1100 */ V(9, 12, 3),
  /* 1101 */ V(9, 12, 3),
  /* 1110 */ V(12, 9, 3),
  /* 1111 */ V(12, 9, 3),

  /* 0000 0101 ... */
  /* 000  */ V(5, 14, 3),	/* 200 */
  /* 001  */ V(10, 11, 3),
  /* 010  */ V(11, 10, 3),
  /* 011  */ V(14, 5, 3),
  /* 100  */ V(7, 13, 3),
  /* 101  */ V(13, 7, 3),
  /* 110  */ V(4, 14, 3),
  /* 111  */ V(14, 4, 3),

  /* 0000 0110 ... */
  /* 000  */ V(8, 12, 3),	/* 208 */
  /* 001  */ V(12, 8, 3),
  /* 010  */ V(3, 14, 3),
  /* 011  */ V(6, 13, 3),
  /* 100  */ V(13, 6, 3),
  /* 101  */ V(14, 3, 3),
  /* 110  */ V(9, 11, 3),
  /* 111  */ V(11, 9, 3),

  /* 0000 0111 ... */
  /* 0000 */ V(2, 14, 3),	/* 216 */
  /* 0001 */ V(2, 14, 3),
  /* 0010 */ V(10, 10, 3),
  /* 0011 */ V(10, 10, 3),
  /* 0100 */ V(14, 2, 3),
  /* 0101 */ V(14, 2, 3),
  /* 0110 */ V(1, 14, 3),
  /* 0111 */ V(1, 14, 3),
  /* 1000 */ V(14, 1, 3),
  /* 1001 */ V(14, 1, 3),
  /* 1010 */ V(0, 14, 4),
  /* 1011 */ V(14, 0, 4),
  /* 1100 */ V(5, 13, 3),
  /* 1101 */ V(5, 13, 3),
  /* 1110 */ V(13, 5, 3),
  /* 1111 */ V(13, 5, 3),

  /* 0000 1000 ... */
  /* 000  */ V(7, 12, 3),	/* 232 */
  /* 001  */ V(12, 7, 3),
  /* 010  */ V(4, 13, 3),
  /* 011  */ V(8, 11, 3),
  /* 100  */ V(13, 4, 2),
  /* 101  */ V(13, 4, 2),
  /* 110  */ V(11, 8, 3),
  /* 111  */ V(9, 10, 3),

  /* 0000 1001 ... */
  /* 000  */ V(10, 9, 3),	/* 240 */
  /* 001  */ V(6, 12, 3),
  /* 010  */ V(12, 6, 3),
  /* 011  */ V(3, 13, 3),
  /* 100  */ V(13, 3, 2),
  /* 101  */ V(13, 3, 2),
  /* 110  */ V(13, 2, 2),
  /* 111  */ V(13, 2, 2),

  /* 0000 1010 ... */
  /* 000  */ V(2, 13, 3),	/* 248 */
  /* 001  */ V(0, 13, 3),
  /* 010  */ V(1, 13, 2),
  /* 011  */ V(1, 13, 2),
  /* 100  */ V(7, 11, 2),
  /* 101  */ V(7, 11, 2),
  /* 110  */ V(11, 7, 2),
  /* 111  */ V(11, 7, 2),

  /* 0000 1011 ... */
  /* 000  */ V(13, 1, 2),	/* 256 */
  /* 001  */ V(13, 1, 2),
  /* 010  */ V(5, 12, 3),
  /* 011  */ V(13, 0, 3),
  /* 100  */ V(12, 5, 2),
  /* 101  */ V(12, 5, 2),
  /* 110  */ V(8, 10, 2),
  /* 111  */ V(8, 10, 2),

  /* 0000 1100 ... */
  /* 00   */ V(10, 8, 2),	/* 264 */
  /* 01   */ V(4, 12, 2),
  /* 10   */ V(12, 4, 2),
  /* 11   */ V(6, 11, 2),

  /* 0000 1101 ... */
  /* 000  */ V(11, 6, 2),	/* 268 */
  /* 001  */ V(11, 6, 2),
  /* 010  */ V(9, 9, 3),
  /* 011  */ V(0, 12, 3),
  /* 100  */ V(3, 12, 2),
  /* 101  */ V(3, 12, 2),
  /* 110  */ V(12, 3, 2),
  /* 111  */ V(12, 3, 2),

  /* 0000 1110 ... */
  /* 000  */ V(7, 10, 2),	/* 276 */
  /* 001  */ V(7, 10, 2),
  /* 010  */ V(10, 7, 2),
  /* 011  */ V(10, 7, 2),
  /* 100  */ V(10, 6, 2),
  /* 101  */ V(10, 6, 2),
  /* 110  */ V(12, 0, 3),
  /* 111  */ V(0, 11, 3),

  /* 0000 1111 ... */
  /* 00   */ V(12, 2, 1),	/* 284 */
  /* 01   */ V(12, 2, 1),
  /* 10   */ V(2, 12, 2),
  /* 11   */ V(5, 11, 2),

  /* 0001 0000 ... */
  /* 00   */ V(11, 5, 2),	/* 288 */
  /* 01   */ V(1, 12, 2),
  /* 10   */ V(8, 9, 2),
  /* 11   */ V(9, 8, 2),

  /* 0001 0001 ... */
  /* 00   */ V(12, 1, 2),	/* 292 */
  /* 01   */ V(4, 11, 2),
  /* 10   */ V(11, 4, 2),
  /* 11   */ V(6, 10, 2),

  /* 0001 0010 ... */
  /* 00   */ V(3, 11, 2),	/* 296 */
  /* 01   */ V(7, 9, 2),
  /* 10   */ V(11, 3, 1),
  /* 11   */ V(11, 3, 1),

  /* 0001 0011 ... */
  /* 00   */ V(9, 7, 2),	/* 300 */
  /* 01   */ V(8, 8, 2),
  /* 10   */ V(2, 11, 2),
  /* 11   */ V(5, 10, 2),

  /* 0001 0100 ... */
  /* 00   */ V(11, 2, 1),	/* 304 */
  /* 01   */ V(11, 2, 1),
  /* 10   */ V(10, 5, 2),
  /* 11   */ V(1, 11, 2),

  /* 0001 0101 ... */
  /* 00   */ V(11, 1, 1),	/* 308 */
  /* 01   */ V(11, 1, 1),
  /* 10   */ V(11, 0, 2),
  /* 11   */ V(6, 9, 2),

  /* 0001 0110 ... */
  /* 00   */ V(9, 6, 2),	/* 312 */
  /* 01   */ V(4, 10, 2),
  /* 10   */ V(10, 4, 2),
  /* 11   */ V(7, 8, 2),

  /* 0001 0111 ... */
  /* 00   */ V(8, 7, 2),	/* 316 */
  /* 01   */ V(3, 10, 2),
  /* 10   */ V(10, 3, 1),
  /* 11   */ V(10, 3, 1),

  /* 0001 1000 ... */
  /* 0    */ V(5, 9, 1),	/* 320 */
  /* 1    */ V(9, 5, 1),

  /* 0001 1001 ... */
  /* 0    */ V(2, 10, 1),	/* 322 */
  /* 1    */ V(10, 2, 1),

  /* 0001 1010 ... */
  /* 0    */ V(1, 10, 1),	/* 324 */
  /* 1    */ V(10, 1, 1),

  /* 0001 1011 ... */
  /* 00   */ V(0, 10, 2),	/* 326 */
  /* 01   */ V(10, 0, 2),
  /* 10   */ V(6, 8, 1),
  /* 11   */ V(6, 8, 1),

  /* 0001 1100 ... */
  /* 0    */ V(8, 6, 1),	/* 330 */
  /* 1    */ V(4, 9, 1),

  /* 0001 1101 ... */
  /* 0    */ V(9, 4, 1),	/* 332 */
  /* 1    */ V(3, 9, 1),

  /* 0001 1110 ... */
  /* 00   */ V(9, 3, 1),	/* 334 */
  /* 01   */ V(9, 3, 1),
  /* 10   */ V(7, 7, 2),
  /* 11   */ V(0, 9, 2),

  /* 0001 1111 ... */
  /* 0    */ V(5, 8, 1),	/* 338 */
  /* 1    */ V(8, 5, 1),

  /* 0010 0000 ... */
  /* 0    */ V(2, 9, 1),	/* 340 */
  /* 1    */ V(6, 7, 1),

  /* 0010 0001 ... */
  /* 0    */ V(7, 6, 1),	/* 342 */
  /* 1    */ V(9, 2, 1),

  /* 0010 0011 ... */
  /* 0    */ V(1, 9, 1),	/* 344 */
  /* 1    */ V(9, 0, 1),

  /* 0010 0100 ... */
  /* 0    */ V(4, 8, 1),	/* 346 */
  /* 1    */ V(8, 4, 1),

  /* 0010 0101 ... */
  /* 0    */ V(5, 7, 1),	/* 348 */
  /* 1    */ V(7, 5, 1),

  /* 0010 0110 ... */
  /* 0    */ V(3, 8, 1),	/* 350 */
  /* 1    */ V(8, 3, 1),

  /* 0010 0111 ... */
  /* 0    */ V(6, 6, 1),	/* 352 */
  /* 1    */ V(4, 7, 1),

  /* 0010 1100 ... */
  /* 0    */ V(7, 4, 1),	/* 354 */
  /* 1    */ V(0, 8, 1),

  /* 0010 1101 ... */
  /* 0    */ V(8, 0, 1),	/* 356 */
  /* 1    */ V(5, 6, 1),

  /* 0010 1110 ... */
  /* 0    */ V(6, 5, 1),	/* 358 */
  /* 1    */ V(3, 7, 1),

  /* 0010 1111 ... */
  /* 0    */ V(7, 3, 1),	/* 360 */
  /* 1    */ V(4, 6, 1),

  /* 0011 0110 ... */
  /* 0    */ V(0, 7, 1),	/* 362 */
  /* 1    */ V(7, 0, 1),

  /* 0011 1110 ... */
  /* 0    */ V(0, 6, 1),	/* 364 */
  /* 1    */ V(6, 0, 1),

  /* 0000 0000 0000 ... */
  /* 0    */ V(15, 15, 1),	/* 366 */
  /* 1    */ V(14, 15, 1),

  /* 0000 0000 0001 ... */
  /* 0    */ V(15, 14, 1),	/* 368 */
  /* 1    */ V(13, 15, 1),

  /* 0000 0000 0011 ... */
  /* 0    */ V(15, 13, 1),	/* 370 */
  /* 1    */ V(12, 15, 1),

  /* 0000 0000 0100 ... */
  /* 0    */ V(15, 12, 1),	/* 372 */
  /* 1    */ V(13, 14, 1),

  /* 0000 0000 0101 ... */
  /* 0    */ V(14, 13, 1),	/* 374 */
  /* 1    */ V(11, 15, 1),

  /* 0000 0000 0111 ... */
  /* 0    */ V(12, 14, 1),	/* 376 */
  /* 1    */ V(14, 12, 1),

  /* 0000 0001 1111 ... */
  /* 0    */ V(10, 14, 1),	/* 378 */
  /* 1    */ V(0, 15, 1)
];

const hufftab16 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ PTR(64, 2),
  /* 0100 */ V(1, 1, 4),
  /* 0101 */ V(0, 1, 4),
  /* 0110 */ V(1, 0, 3),
  /* 0111 */ V(1, 0, 3),
  /* 1000 */ V(0, 0, 1),
  /* 1001 */ V(0, 0, 1),
  /* 1010 */ V(0, 0, 1),
  /* 1011 */ V(0, 0, 1),
  /* 1100 */ V(0, 0, 1),
  /* 1101 */ V(0, 0, 1),
  /* 1110 */ V(0, 0, 1),
  /* 1111 */ V(0, 0, 1),

  /* 0000 ... */
  /* 0000 */ PTR(68, 3),	/* 16 */
  /* 0001 */ PTR(76, 3),
  /* 0010 */ PTR(84, 2),
  /* 0011 */ V(15, 15, 4),
  /* 0100 */ PTR(88, 2),
  /* 0101 */ PTR(92, 1),
  /* 0110 */ PTR(94, 4),
  /* 0111 */ V(15, 2, 4),
  /* 1000 */ PTR(110, 1),
  /* 1001 */ V(1, 15, 4),
  /* 1010 */ V(15, 1, 4),
  /* 1011 */ PTR(112, 4),
  /* 1100 */ PTR(128, 4),
  /* 1101 */ PTR(144, 4),
  /* 1110 */ PTR(160, 4),
  /* 1111 */ PTR(176, 4),

  /* 0001 ... */
  /* 0000 */ PTR(192, 4),	/* 32 */
  /* 0001 */ PTR(208, 3),
  /* 0010 */ PTR(216, 3),
  /* 0011 */ PTR(224, 3),
  /* 0100 */ PTR(232, 3),
  /* 0101 */ PTR(240, 3),
  /* 0110 */ PTR(248, 3),
  /* 0111 */ PTR(256, 3),
  /* 1000 */ PTR(264, 2),
  /* 1001 */ PTR(268, 2),
  /* 1010 */ PTR(272, 1),
  /* 1011 */ PTR(274, 2),
  /* 1100 */ PTR(278, 2),
  /* 1101 */ PTR(282, 1),
  /* 1110 */ V(5, 1, 4),
  /* 1111 */ PTR(284, 1),

  /* 0010 ... */
  /* 0000 */ PTR(286, 1),	/* 48 */
  /* 0001 */ PTR(288, 1),
  /* 0010 */ PTR(290, 1),
  /* 0011 */ V(1, 4, 4),
  /* 0100 */ V(4, 1, 4),
  /* 0101 */ PTR(292, 1),
  /* 0110 */ V(2, 3, 4),
  /* 0111 */ V(3, 2, 4),
  /* 1000 */ V(1, 3, 3),
  /* 1001 */ V(1, 3, 3),
  /* 1010 */ V(3, 1, 3),
  /* 1011 */ V(3, 1, 3),
  /* 1100 */ V(0, 3, 4),
  /* 1101 */ V(3, 0, 4),
  /* 1110 */ V(2, 2, 3),
  /* 1111 */ V(2, 2, 3),

  /* 0011 ... */
  /* 00   */ V(1, 2, 2),	/* 64 */
  /* 01   */ V(2, 1, 2),
  /* 10   */ V(0, 2, 2),
  /* 11   */ V(2, 0, 2),

  /* 0000 0000 ... */
  /* 000  */ V(14, 15, 3),	/* 68 */
  /* 001  */ V(15, 14, 3),
  /* 010  */ V(13, 15, 3),
  /* 011  */ V(15, 13, 3),
  /* 100  */ V(12, 15, 3),
  /* 101  */ V(15, 12, 3),
  /* 110  */ V(11, 15, 3),
  /* 111  */ V(15, 11, 3),

  /* 0000 0001 ... */
  /* 000  */ V(10, 15, 2),	/* 76 */
  /* 001  */ V(10, 15, 2),
  /* 010  */ V(15, 10, 3),
  /* 011  */ V(9, 15, 3),
  /* 100  */ V(15, 9, 3),
  /* 101  */ V(15, 8, 3),
  /* 110  */ V(8, 15, 2),
  /* 111  */ V(8, 15, 2),

  /* 0000 0010 ... */
  /* 00   */ V(7, 15, 2),	/* 84 */
  /* 01   */ V(15, 7, 2),
  /* 10   */ V(6, 15, 2),
  /* 11   */ V(15, 6, 2),

  /* 0000 0100 ... */
  /* 00   */ V(5, 15, 2),	/* 88 */
  /* 01   */ V(15, 5, 2),
  /* 10   */ V(4, 15, 1),
  /* 11   */ V(4, 15, 1),

  /* 0000 0101 ... */
  /* 0    */ V(15, 4, 1),	/* 92 */
  /* 1    */ V(15, 3, 1),

  /* 0000 0110 ... */
  /* 0000 */ V(15, 0, 1),	/* 94 */
  /* 0001 */ V(15, 0, 1),
  /* 0010 */ V(15, 0, 1),
  /* 0011 */ V(15, 0, 1),
  /* 0100 */ V(15, 0, 1),
  /* 0101 */ V(15, 0, 1),
  /* 0110 */ V(15, 0, 1),
  /* 0111 */ V(15, 0, 1),
  /* 1000 */ V(3, 15, 2),
  /* 1001 */ V(3, 15, 2),
  /* 1010 */ V(3, 15, 2),
  /* 1011 */ V(3, 15, 2),
  /* 1100 */ PTR(294, 4),
  /* 1101 */ PTR(310, 3),
  /* 1110 */ PTR(318, 3),
  /* 1111 */ PTR(326, 3),

  /* 0000 1000 ... */
  /* 0    */ V(2, 15, 1),	/* 110 */
  /* 1    */ V(0, 15, 1),

  /* 0000 1011 ... */
  /* 0000 */ PTR(334, 2),	/* 112 */
  /* 0001 */ PTR(338, 2),
  /* 0010 */ PTR(342, 2),
  /* 0011 */ PTR(346, 1),
  /* 0100 */ PTR(348, 2),
  /* 0101 */ PTR(352, 2),
  /* 0110 */ PTR(356, 1),
  /* 0111 */ PTR(358, 2),
  /* 1000 */ PTR(362, 2),
  /* 1001 */ PTR(366, 2),
  /* 1010 */ PTR(370, 2),
  /* 1011 */ V(14, 3, 4),
  /* 1100 */ PTR(374, 1),
  /* 1101 */ PTR(376, 1),
  /* 1110 */ PTR(378, 1),
  /* 1111 */ PTR(380, 1),

  /* 0000 1100 ... */
  /* 0000 */ PTR(382, 1),	/* 128 */
  /* 0001 */ PTR(384, 1),
  /* 0010 */ PTR(386, 1),
  /* 0011 */ V(0, 13, 4),
  /* 0100 */ PTR(388, 1),
  /* 0101 */ PTR(390, 1),
  /* 0110 */ PTR(392, 1),
  /* 0111 */ V(3, 12, 4),
  /* 1000 */ PTR(394, 1),
  /* 1001 */ V(1, 12, 4),
  /* 1010 */ V(12, 0, 4),
  /* 1011 */ PTR(396, 1),
  /* 1100 */ V(14, 2, 3),
  /* 1101 */ V(14, 2, 3),
  /* 1110 */ V(2, 14, 4),
  /* 1111 */ V(1, 14, 4),

  /* 0000 1101 ... */
  /* 0000 */ V(13, 3, 4),	/* 144 */
  /* 0001 */ V(2, 13, 4),
  /* 0010 */ V(13, 2, 4),
  /* 0011 */ V(13, 1, 4),
  /* 0100 */ V(3, 11, 4),
  /* 0101 */ PTR(398, 1),
  /* 0110 */ V(1, 13, 3),
  /* 0111 */ V(1, 13, 3),
  /* 1000 */ V(12, 4, 4),
  /* 1001 */ V(6, 11, 4),
  /* 1010 */ V(12, 3, 4),
  /* 1011 */ V(10, 7, 4),
  /* 1100 */ V(2, 12, 3),
  /* 1101 */ V(2, 12, 3),
  /* 1110 */ V(12, 2, 4),
  /* 1111 */ V(11, 5, 4),

  /* 0000 1110 ... */
  /* 0000 */ V(12, 1, 4),	/* 160 */
  /* 0001 */ V(0, 12, 4),
  /* 0010 */ V(4, 11, 4),
  /* 0011 */ V(11, 4, 4),
  /* 0100 */ V(6, 10, 4),
  /* 0101 */ V(10, 6, 4),
  /* 0110 */ V(11, 3, 3),
  /* 0111 */ V(11, 3, 3),
  /* 1000 */ V(5, 10, 4),
  /* 1001 */ V(10, 5, 4),
  /* 1010 */ V(2, 11, 3),
  /* 1011 */ V(2, 11, 3),
  /* 1100 */ V(11, 2, 3),
  /* 1101 */ V(11, 2, 3),
  /* 1110 */ V(1, 11, 3),
  /* 1111 */ V(1, 11, 3),

  /* 0000 1111 ... */
  /* 0000 */ V(11, 1, 3),	/* 176 */
  /* 0001 */ V(11, 1, 3),
  /* 0010 */ V(0, 11, 4),
  /* 0011 */ V(11, 0, 4),
  /* 0100 */ V(6, 9, 4),
  /* 0101 */ V(9, 6, 4),
  /* 0110 */ V(4, 10, 4),
  /* 0111 */ V(10, 4, 4),
  /* 1000 */ V(7, 8, 4),
  /* 1001 */ V(8, 7, 4),
  /* 1010 */ V(10, 3, 3),
  /* 1011 */ V(10, 3, 3),
  /* 1100 */ V(3, 10, 4),
  /* 1101 */ V(5, 9, 4),
  /* 1110 */ V(2, 10, 3),
  /* 1111 */ V(2, 10, 3),

  /* 0001 0000 ... */
  /* 0000 */ V(9, 5, 4),	/* 192 */
  /* 0001 */ V(6, 8, 4),
  /* 0010 */ V(10, 1, 3),
  /* 0011 */ V(10, 1, 3),
  /* 0100 */ V(8, 6, 4),
  /* 0101 */ V(7, 7, 4),
  /* 0110 */ V(9, 4, 3),
  /* 0111 */ V(9, 4, 3),
  /* 1000 */ V(4, 9, 4),
  /* 1001 */ V(5, 7, 4),
  /* 1010 */ V(6, 7, 3),
  /* 1011 */ V(6, 7, 3),
  /* 1100 */ V(10, 2, 2),
  /* 1101 */ V(10, 2, 2),
  /* 1110 */ V(10, 2, 2),
  /* 1111 */ V(10, 2, 2),

  /* 0001 0001 ... */
  /* 000  */ V(1, 10, 2),	/* 208 */
  /* 001  */ V(1, 10, 2),
  /* 010  */ V(0, 10, 3),
  /* 011  */ V(10, 0, 3),
  /* 100  */ V(3, 9, 3),
  /* 101  */ V(9, 3, 3),
  /* 110  */ V(5, 8, 3),
  /* 111  */ V(8, 5, 3),

  /* 0001 0010 ... */
  /* 000  */ V(2, 9, 2),	/* 216 */
  /* 001  */ V(2, 9, 2),
  /* 010  */ V(9, 2, 2),
  /* 011  */ V(9, 2, 2),
  /* 100  */ V(7, 6, 3),
  /* 101  */ V(0, 9, 3),
  /* 110  */ V(1, 9, 2),
  /* 111  */ V(1, 9, 2),

  /* 0001 0011 ... */
  /* 000  */ V(9, 1, 2),	/* 224 */
  /* 001  */ V(9, 1, 2),
  /* 010  */ V(9, 0, 3),
  /* 011  */ V(4, 8, 3),
  /* 100  */ V(8, 4, 3),
  /* 101  */ V(7, 5, 3),
  /* 110  */ V(3, 8, 3),
  /* 111  */ V(8, 3, 3),

  /* 0001 0100 ... */
  /* 000  */ V(6, 6, 3),	/* 232 */
  /* 001  */ V(2, 8, 3),
  /* 010  */ V(8, 2, 2),
  /* 011  */ V(8, 2, 2),
  /* 100  */ V(4, 7, 3),
  /* 101  */ V(7, 4, 3),
  /* 110  */ V(1, 8, 2),
  /* 111  */ V(1, 8, 2),

  /* 0001 0101 ... */
  /* 000  */ V(8, 1, 2),	/* 240 */
  /* 001  */ V(8, 1, 2),
  /* 010  */ V(8, 0, 2),
  /* 011  */ V(8, 0, 2),
  /* 100  */ V(0, 8, 3),
  /* 101  */ V(5, 6, 3),
  /* 110  */ V(3, 7, 2),
  /* 111  */ V(3, 7, 2),

  /* 0001 0110 ... */
  /* 000  */ V(7, 3, 2),	/* 248 */
  /* 001  */ V(7, 3, 2),
  /* 010  */ V(6, 5, 3),
  /* 011  */ V(4, 6, 3),
  /* 100  */ V(2, 7, 2),
  /* 101  */ V(2, 7, 2),
  /* 110  */ V(7, 2, 2),
  /* 111  */ V(7, 2, 2),

  /* 0001 0111 ... */
  /* 000  */ V(6, 4, 3),	/* 256 */
  /* 001  */ V(5, 5, 3),
  /* 010  */ V(0, 7, 2),
  /* 011  */ V(0, 7, 2),
  /* 100  */ V(1, 7, 1),
  /* 101  */ V(1, 7, 1),
  /* 110  */ V(1, 7, 1),
  /* 111  */ V(1, 7, 1),

  /* 0001 1000 ... */
  /* 00   */ V(7, 1, 1),	/* 264  */
  /* 01   */ V(7, 1, 1),
  /* 10   */ V(7, 0, 2),
  /* 11   */ V(3, 6, 2),

  /* 0001 1001 ... */
  /* 00   */ V(6, 3, 2),	/* 268 */
  /* 01   */ V(4, 5, 2),
  /* 10   */ V(5, 4, 2),
  /* 11   */ V(2, 6, 2),

  /* 0001 1010 ... */
  /* 0    */ V(6, 2, 1),	/* 272 */
  /* 1    */ V(1, 6, 1),

  /* 0001 1011 ... */
  /* 00   */ V(6, 1, 1),	/* 274 */
  /* 01   */ V(6, 1, 1),
  /* 10   */ V(0, 6, 2),
  /* 11   */ V(6, 0, 2),

  /* 0001 1100 ... */
  /* 00   */ V(5, 3, 1),	/* 278 */
  /* 01   */ V(5, 3, 1),
  /* 10   */ V(3, 5, 2),
  /* 11   */ V(4, 4, 2),

  /* 0001 1101 ... */
  /* 0    */ V(2, 5, 1),	/* 282 */
  /* 1    */ V(5, 2, 1),

  /* 0001 1111 ... */
  /* 0    */ V(1, 5, 1),	/* 284 */
  /* 1    */ V(0, 5, 1),

  /* 0010 0000 ... */
  /* 0    */ V(3, 4, 1),	/* 286 */
  /* 1    */ V(4, 3, 1),

  /* 0010 0001 ... */
  /* 0    */ V(5, 0, 1),	/* 288 */
  /* 1    */ V(2, 4, 1),

  /* 0010 0010 ... */
  /* 0    */ V(4, 2, 1),	/* 290 */
  /* 1    */ V(3, 3, 1),

  /* 0010 0101 ... */
  /* 0    */ V(0, 4, 1),	/* 292 */
  /* 1    */ V(4, 0, 1),

  /* 0000 0110 1100 ... */
  /* 0000 */ V(12, 14, 4),	/* 294 */
  /* 0001 */ PTR(400, 1),
  /* 0010 */ V(13, 14, 3),
  /* 0011 */ V(13, 14, 3),
  /* 0100 */ V(14, 9, 3),
  /* 0101 */ V(14, 9, 3),
  /* 0110 */ V(14, 10, 4),
  /* 0111 */ V(13, 9, 4),
  /* 1000 */ V(14, 14, 2),
  /* 1001 */ V(14, 14, 2),
  /* 1010 */ V(14, 14, 2),
  /* 1011 */ V(14, 14, 2),
  /* 1100 */ V(14, 13, 3),
  /* 1101 */ V(14, 13, 3),
  /* 1110 */ V(14, 11, 3),
  /* 1111 */ V(14, 11, 3),

  /* 0000 0110 1101 ... */
  /* 000  */ V(11, 14, 2),	/* 310 */
  /* 001  */ V(11, 14, 2),
  /* 010  */ V(12, 13, 2),
  /* 011  */ V(12, 13, 2),
  /* 100  */ V(13, 12, 3),
  /* 101  */ V(13, 11, 3),
  /* 110  */ V(10, 14, 2),
  /* 111  */ V(10, 14, 2),

  /* 0000 0110 1110 ... */
  /* 000  */ V(12, 12, 2),	/* 318 */
  /* 001  */ V(12, 12, 2),
  /* 010  */ V(10, 13, 3),
  /* 011  */ V(13, 10, 3),
  /* 100  */ V(7, 14, 3),
  /* 101  */ V(10, 12, 3),
  /* 110  */ V(12, 10, 2),
  /* 111  */ V(12, 10, 2),

  /* 0000 0110 1111 ... */
  /* 000  */ V(12, 9, 3),	/* 326 */
  /* 001  */ V(7, 13, 3),
  /* 010  */ V(5, 14, 2),
  /* 011  */ V(5, 14, 2),
  /* 100  */ V(11, 13, 1),
  /* 101  */ V(11, 13, 1),
  /* 110  */ V(11, 13, 1),
  /* 111  */ V(11, 13, 1),

  /* 0000 1011 0000 ... */
  /* 00   */ V(9, 14, 1),	/* 334 */
  /* 01   */ V(9, 14, 1),
  /* 10   */ V(11, 12, 2),
  /* 11   */ V(12, 11, 2),

  /* 0000 1011 0001 ... */
  /* 00   */ V(8, 14, 2),	/* 338 */
  /* 01   */ V(14, 8, 2),
  /* 10   */ V(9, 13, 2),
  /* 11   */ V(14, 7, 2),

  /* 0000 1011 0010 ... */
  /* 00   */ V(11, 11, 2),	/* 342 */
  /* 01   */ V(8, 13, 2),
  /* 10   */ V(13, 8, 2),
  /* 11   */ V(6, 14, 2),

  /* 0000 1011 0011 ... */
  /* 0    */ V(14, 6, 1),	/* 346 */
  /* 1    */ V(9, 12, 1),

  /* 0000 1011 0100 ... */
  /* 00   */ V(10, 11, 2),	/* 348 */
  /* 01   */ V(11, 10, 2),
  /* 10   */ V(14, 5, 2),
  /* 11   */ V(13, 7, 2),

  /* 0000 1011 0101 ... */
  /* 00   */ V(4, 14, 1),	/* 352 */
  /* 01   */ V(4, 14, 1),
  /* 10   */ V(14, 4, 2),
  /* 11   */ V(8, 12, 2),

  /* 0000 1011 0110 ... */
  /* 0    */ V(12, 8, 1),	/* 356 */
  /* 1    */ V(3, 14, 1),

  /* 0000 1011 0111 ... */
  /* 00   */ V(6, 13, 1),	/* 358 */
  /* 01   */ V(6, 13, 1),
  /* 10   */ V(13, 6, 2),
  /* 11   */ V(9, 11, 2),

  /* 0000 1011 1000 ... */
  /* 00   */ V(11, 9, 2),	/* 362 */
  /* 01   */ V(10, 10, 2),
  /* 10   */ V(14, 1, 1),
  /* 11   */ V(14, 1, 1),

  /* 0000 1011 1001 ... */
  /* 00   */ V(13, 4, 1),	/* 366 */
  /* 01   */ V(13, 4, 1),
  /* 10   */ V(11, 8, 2),
  /* 11   */ V(10, 9, 2),

  /* 0000 1011 1010 ... */
  /* 00   */ V(7, 11, 1),	/* 370 */
  /* 01   */ V(7, 11, 1),
  /* 10   */ V(11, 7, 2),
  /* 11   */ V(13, 0, 2),

  /* 0000 1011 1100 ... */
  /* 0    */ V(0, 14, 1),	/* 374 */
  /* 1    */ V(14, 0, 1),

  /* 0000 1011 1101 ... */
  /* 0    */ V(5, 13, 1),	/* 376 */
  /* 1    */ V(13, 5, 1),

  /* 0000 1011 1110 ... */
  /* 0    */ V(7, 12, 1),	/* 378 */
  /* 1    */ V(12, 7, 1),

  /* 0000 1011 1111 ... */
  /* 0    */ V(4, 13, 1),	/* 380 */
  /* 1    */ V(8, 11, 1),

  /* 0000 1100 0000 ... */
  /* 0    */ V(9, 10, 1),	/* 382 */
  /* 1    */ V(6, 12, 1),

  /* 0000 1100 0001 ... */
  /* 0    */ V(12, 6, 1),	/* 384 */
  /* 1    */ V(3, 13, 1),

  /* 0000 1100 0010 ... */
  /* 0    */ V(5, 12, 1),	/* 386 */
  /* 1    */ V(12, 5, 1),

  /* 0000 1100 0100 ... */
  /* 0    */ V(8, 10, 1),	/* 388 */
  /* 1    */ V(10, 8, 1),

  /* 0000 1100 0101 ... */
  /* 0    */ V(9, 9, 1),	/* 390 */
  /* 1    */ V(4, 12, 1),

  /* 0000 1100 0110 ... */
  /* 0    */ V(11, 6, 1),	/* 392 */
  /* 1    */ V(7, 10, 1),

  /* 0000 1100 1000 ... */
  /* 0    */ V(5, 11, 1),	/* 394 */
  /* 1    */ V(8, 9, 1),

  /* 0000 1100 1011 ... */
  /* 0    */ V(9, 8, 1),	/* 396 */
  /* 1    */ V(7, 9, 1),

  /* 0000 1101 0101 ... */
  /* 0    */ V(9, 7, 1),	/* 398 */
  /* 1    */ V(8, 8, 1),

  /* 0000 0110 1100 0001 ... */
  /* 0    */ V(14, 12, 1),	/* 400 */
  /* 1    */ V(13, 13, 1)
];

const hufftab24 = [
  /* 0000 */ PTR(16, 4),
  /* 0001 */ PTR(32, 4),
  /* 0010 */ PTR(48, 4),
  /* 0011 */ V(15, 15, 4),
  /* 0100 */ PTR(64, 4),
  /* 0101 */ PTR(80, 4),
  /* 0110 */ PTR(96, 4),
  /* 0111 */ PTR(112, 4),
  /* 1000 */ PTR(128, 4),
  /* 1001 */ PTR(144, 4),
  /* 1010 */ PTR(160, 3),
  /* 1011 */ PTR(168, 2),
  /* 1100 */ V(1, 1, 4),
  /* 1101 */ V(0, 1, 4),
  /* 1110 */ V(1, 0, 4),
  /* 1111 */ V(0, 0, 4),

  /* 0000 ... */
  /* 0000 */ V(14, 15, 4),	/* 16 */
  /* 0001 */ V(15, 14, 4),
  /* 0010 */ V(13, 15, 4),
  /* 0011 */ V(15, 13, 4),
  /* 0100 */ V(12, 15, 4),
  /* 0101 */ V(15, 12, 4),
  /* 0110 */ V(11, 15, 4),
  /* 0111 */ V(15, 11, 4),
  /* 1000 */ V(15, 10, 3),
  /* 1001 */ V(15, 10, 3),
  /* 1010 */ V(10, 15, 4),
  /* 1011 */ V(9, 15, 4),
  /* 1100 */ V(15, 9, 3),
  /* 1101 */ V(15, 9, 3),
  /* 1110 */ V(15, 8, 3),
  /* 1111 */ V(15, 8, 3),

  /* 0001 ... */
  /* 0000 */ V(8, 15, 4),	/* 32 */
  /* 0001 */ V(7, 15, 4),
  /* 0010 */ V(15, 7, 3),
  /* 0011 */ V(15, 7, 3),
  /* 0100 */ V(6, 15, 3),
  /* 0101 */ V(6, 15, 3),
  /* 0110 */ V(15, 6, 3),
  /* 0111 */ V(15, 6, 3),
  /* 1000 */ V(5, 15, 3),
  /* 1001 */ V(5, 15, 3),
  /* 1010 */ V(15, 5, 3),
  /* 1011 */ V(15, 5, 3),
  /* 1100 */ V(4, 15, 3),
  /* 1101 */ V(4, 15, 3),
  /* 1110 */ V(15, 4, 3),
  /* 1111 */ V(15, 4, 3),

  /* 0010 ... */
  /* 0000 */ V(3, 15, 3),	/* 48 */
  /* 0001 */ V(3, 15, 3),
  /* 0010 */ V(15, 3, 3),
  /* 0011 */ V(15, 3, 3),
  /* 0100 */ V(2, 15, 3),
  /* 0101 */ V(2, 15, 3),
  /* 0110 */ V(15, 2, 3),
  /* 0111 */ V(15, 2, 3),
  /* 1000 */ V(15, 1, 3),
  /* 1001 */ V(15, 1, 3),
  /* 1010 */ V(1, 15, 4),
  /* 1011 */ V(15, 0, 4),
  /* 1100 */ PTR(172, 3),
  /* 1101 */ PTR(180, 3),
  /* 1110 */ PTR(188, 3),
  /* 1111 */ PTR(196, 3),

  /* 0100 ... */
  /* 0000 */ PTR(204, 4),	/* 64 */
  /* 0001 */ PTR(220, 3),
  /* 0010 */ PTR(228, 3),
  /* 0011 */ PTR(236, 3),
  /* 0100 */ PTR(244, 2),
  /* 0101 */ PTR(248, 2),
  /* 0110 */ PTR(252, 2),
  /* 0111 */ PTR(256, 2),
  /* 1000 */ PTR(260, 2),
  /* 1001 */ PTR(264, 2),
  /* 1010 */ PTR(268, 2),
  /* 1011 */ PTR(272, 2),
  /* 1100 */ PTR(276, 2),
  /* 1101 */ PTR(280, 3),
  /* 1110 */ PTR(288, 2),
  /* 1111 */ PTR(292, 2),

  /* 0101 ... */
  /* 0000 */ PTR(296, 2),	/* 80 */
  /* 0001 */ PTR(300, 3),
  /* 0010 */ PTR(308, 2),
  /* 0011 */ PTR(312, 3),
  /* 0100 */ PTR(320, 1),
  /* 0101 */ PTR(322, 2),
  /* 0110 */ PTR(326, 2),
  /* 0111 */ PTR(330, 1),
  /* 1000 */ PTR(332, 2),
  /* 1001 */ PTR(336, 1),
  /* 1010 */ PTR(338, 1),
  /* 1011 */ PTR(340, 1),
  /* 1100 */ PTR(342, 1),
  /* 1101 */ PTR(344, 1),
  /* 1110 */ PTR(346, 1),
  /* 1111 */ PTR(348, 1),

  /* 0110 ... */
  /* 0000 */ PTR(350, 1),	/* 96 */
  /* 0001 */ PTR(352, 1),
  /* 0010 */ PTR(354, 1),
  /* 0011 */ PTR(356, 1),
  /* 0100 */ PTR(358, 1),
  /* 0101 */ PTR(360, 1),
  /* 0110 */ PTR(362, 1),
  /* 0111 */ PTR(364, 1),
  /* 1000 */ PTR(366, 1),
  /* 1001 */ PTR(368, 1),
  /* 1010 */ PTR(370, 2),
  /* 1011 */ PTR(374, 1),
  /* 1100 */ PTR(376, 2),
  /* 1101 */ V(7, 3, 4),
  /* 1110 */ PTR(380, 1),
  /* 1111 */ V(7, 2, 4),

  /* 0111 ... */
  /* 0000 */ V(4, 6, 4),	/* 112 */
  /* 0001 */ V(6, 4, 4),
  /* 0010 */ V(5, 5, 4),
  /* 0011 */ V(7, 1, 4),
  /* 0100 */ V(3, 6, 4),
  /* 0101 */ V(6, 3, 4),
  /* 0110 */ V(4, 5, 4),
  /* 0111 */ V(5, 4, 4),
  /* 1000 */ V(2, 6, 4),
  /* 1001 */ V(6, 2, 4),
  /* 1010 */ V(1, 6, 4),
  /* 1011 */ V(6, 1, 4),
  /* 1100 */ PTR(382, 1),
  /* 1101 */ V(3, 5, 4),
  /* 1110 */ V(5, 3, 4),
  /* 1111 */ V(4, 4, 4),

  /* 1000 ... */
  /* 0000 */ V(2, 5, 4),	/* 128 */
  /* 0001 */ V(5, 2, 4),
  /* 0010 */ V(1, 5, 4),
  /* 0011 */ PTR(384, 1),
  /* 0100 */ V(5, 1, 3),
  /* 0101 */ V(5, 1, 3),
  /* 0110 */ V(3, 4, 4),
  /* 0111 */ V(4, 3, 4),
  /* 1000 */ V(2, 4, 3),
  /* 1001 */ V(2, 4, 3),
  /* 1010 */ V(4, 2, 3),
  /* 1011 */ V(4, 2, 3),
  /* 1100 */ V(3, 3, 3),
  /* 1101 */ V(3, 3, 3),
  /* 1110 */ V(1, 4, 3),
  /* 1111 */ V(1, 4, 3),

  /* 1001 ... */
  /* 0000 */ V(4, 1, 3),	/* 144 */
  /* 0001 */ V(4, 1, 3),
  /* 0010 */ V(0, 4, 4),
  /* 0011 */ V(4, 0, 4),
  /* 0100 */ V(2, 3, 3),
  /* 0101 */ V(2, 3, 3),
  /* 0110 */ V(3, 2, 3),
  /* 0111 */ V(3, 2, 3),
  /* 1000 */ V(1, 3, 2),
  /* 1001 */ V(1, 3, 2),
  /* 1010 */ V(1, 3, 2),
  /* 1011 */ V(1, 3, 2),
  /* 1100 */ V(3, 1, 2),
  /* 1101 */ V(3, 1, 2),
  /* 1110 */ V(3, 1, 2),
  /* 1111 */ V(3, 1, 2),

  /* 1010 ... */
  /* 000  */ V(0, 3, 3),	/* 160 */
  /* 001  */ V(3, 0, 3),
  /* 010  */ V(2, 2, 2),
  /* 011  */ V(2, 2, 2),
  /* 100  */ V(1, 2, 1),
  /* 101  */ V(1, 2, 1),
  /* 110  */ V(1, 2, 1),
  /* 111  */ V(1, 2, 1),

  /* 1011 ... */
  /* 00   */ V(2, 1, 1),	/* 168 */
  /* 01   */ V(2, 1, 1),
  /* 10   */ V(0, 2, 2),
  /* 11   */ V(2, 0, 2),

  /* 0010 1100 ... */
  /* 000  */ V(0, 15, 1),	/* 172 */
  /* 001  */ V(0, 15, 1),
  /* 010  */ V(0, 15, 1),
  /* 011  */ V(0, 15, 1),
  /* 100  */ V(14, 14, 3),
  /* 101  */ V(13, 14, 3),
  /* 110  */ V(14, 13, 3),
  /* 111  */ V(12, 14, 3),

  /* 0010 1101 ... */
  /* 000  */ V(14, 12, 3),	/* 180 */
  /* 001  */ V(13, 13, 3),
  /* 010  */ V(11, 14, 3),
  /* 011  */ V(14, 11, 3),
  /* 100  */ V(12, 13, 3),
  /* 101  */ V(13, 12, 3),
  /* 110  */ V(10, 14, 3),
  /* 111  */ V(14, 10, 3),

  /* 0010 1110 ... */
  /* 000  */ V(11, 13, 3),	/* 188 */
  /* 001  */ V(13, 11, 3),
  /* 010  */ V(12, 12, 3),
  /* 011  */ V(9, 14, 3),
  /* 100  */ V(14, 9, 3),
  /* 101  */ V(10, 13, 3),
  /* 110  */ V(13, 10, 3),
  /* 111  */ V(11, 12, 3),

  /* 0010 1111 ... */
  /* 000  */ V(12, 11, 3),	/* 196 */
  /* 001  */ V(8, 14, 3),
  /* 010  */ V(14, 8, 3),
  /* 011  */ V(9, 13, 3),
  /* 100  */ V(13, 9, 3),
  /* 101  */ V(7, 14, 3),
  /* 110  */ V(14, 7, 3),
  /* 111  */ V(10, 12, 3),

  /* 0100 0000 ... */
  /* 0000 */ V(12, 10, 3),	/* 204 */
  /* 0001 */ V(12, 10, 3),
  /* 0010 */ V(11, 11, 3),
  /* 0011 */ V(11, 11, 3),
  /* 0100 */ V(8, 13, 3),
  /* 0101 */ V(8, 13, 3),
  /* 0110 */ V(13, 8, 3),
  /* 0111 */ V(13, 8, 3),
  /* 1000 */ V(0, 14, 4),
  /* 1001 */ V(14, 0, 4),
  /* 1010 */ V(0, 13, 3),
  /* 1011 */ V(0, 13, 3),
  /* 1100 */ V(14, 6, 2),
  /* 1101 */ V(14, 6, 2),
  /* 1110 */ V(14, 6, 2),
  /* 1111 */ V(14, 6, 2),

  /* 0100 0001 ... */
  /* 000  */ V(6, 14, 3),	/* 220 */
  /* 001  */ V(9, 12, 3),
  /* 010  */ V(12, 9, 2),
  /* 011  */ V(12, 9, 2),
  /* 100  */ V(5, 14, 2),
  /* 101  */ V(5, 14, 2),
  /* 110  */ V(11, 10, 2),
  /* 111  */ V(11, 10, 2),

  /* 0100 0010 ... */
  /* 000  */ V(14, 5, 2),	/* 228 */
  /* 001  */ V(14, 5, 2),
  /* 010  */ V(10, 11, 3),
  /* 011  */ V(7, 13, 3),
  /* 100  */ V(13, 7, 2),
  /* 101  */ V(13, 7, 2),
  /* 110  */ V(14, 4, 2),
  /* 111  */ V(14, 4, 2),

  /* 0100 0011 ... */
  /* 000  */ V(8, 12, 2),	/* 236 */
  /* 001  */ V(8, 12, 2),
  /* 010  */ V(12, 8, 2),
  /* 011  */ V(12, 8, 2),
  /* 100  */ V(4, 14, 3),
  /* 101  */ V(2, 14, 3),
  /* 110  */ V(3, 14, 2),
  /* 111  */ V(3, 14, 2),

  /* 0100 0100 ... */
  /* 00   */ V(6, 13, 2),	/* 244 */
  /* 01   */ V(13, 6, 2),
  /* 10   */ V(14, 3, 2),
  /* 11   */ V(9, 11, 2),

  /* 0100 0101 ... */
  /* 00   */ V(11, 9, 2),	/* 248 */
  /* 01   */ V(10, 10, 2),
  /* 10   */ V(14, 2, 2),
  /* 11   */ V(1, 14, 2),

  /* 0100 0110 ... */
  /* 00   */ V(14, 1, 2),	/* 252 */
  /* 01   */ V(5, 13, 2),
  /* 10   */ V(13, 5, 2),
  /* 11   */ V(7, 12, 2),

  /* 0100 0111 ... */
  /* 00   */ V(12, 7, 2),	/* 256 */
  /* 01   */ V(4, 13, 2),
  /* 10   */ V(8, 11, 2),
  /* 11   */ V(11, 8, 2),

  /* 0100 1000 ... */
  /* 00   */ V(13, 4, 2),	/* 260 */
  /* 01   */ V(9, 10, 2),
  /* 10   */ V(10, 9, 2),
  /* 11   */ V(6, 12, 2),

  /* 0100 1001 ... */
  /* 00   */ V(12, 6, 2),	/* 264 */
  /* 01   */ V(3, 13, 2),
  /* 10   */ V(13, 3, 2),
  /* 11   */ V(2, 13, 2),

  /* 0100 1010 ... */
  /* 00   */ V(13, 2, 2),	/* 268 */
  /* 01   */ V(1, 13, 2),
  /* 10   */ V(7, 11, 2),
  /* 11   */ V(11, 7, 2),

  /* 0100 1011 ... */
  /* 00   */ V(13, 1, 2),	/* 272 */
  /* 01   */ V(5, 12, 2),
  /* 10   */ V(12, 5, 2),
  /* 11   */ V(8, 10, 2),

  /* 0100 1100 ... */
  /* 00   */ V(10, 8, 2),	/* 276 */
  /* 01   */ V(9, 9, 2),
  /* 10   */ V(4, 12, 2),
  /* 11   */ V(12, 4, 2),

  /* 0100 1101 ... */
  /* 000  */ V(6, 11, 2),	/* 280 */
  /* 001  */ V(6, 11, 2),
  /* 010  */ V(11, 6, 2),
  /* 011  */ V(11, 6, 2),
  /* 100  */ V(13, 0, 3),
  /* 101  */ V(0, 12, 3),
  /* 110  */ V(3, 12, 2),
  /* 111  */ V(3, 12, 2),

  /* 0100 1110 ... */
  /* 00   */ V(12, 3, 2),	/* 288 */
  /* 01   */ V(7, 10, 2),
  /* 10   */ V(10, 7, 2),
  /* 11   */ V(2, 12, 2),

  /* 0100 1111 ... */
  /* 00   */ V(12, 2, 2),	/* 292 */
  /* 01   */ V(5, 11, 2),
  /* 10   */ V(11, 5, 2),
  /* 11   */ V(1, 12, 2),

  /* 0101 0000 ... */
  /* 00   */ V(8, 9, 2),	/* 296 */
  /* 01   */ V(9, 8, 2),
  /* 10   */ V(12, 1, 2),
  /* 11   */ V(4, 11, 2),

  /* 0101 0001 ... */
  /* 000  */ V(12, 0, 3),	/* 300 */
  /* 001  */ V(0, 11, 3),
  /* 010  */ V(3, 11, 2),
  /* 011  */ V(3, 11, 2),
  /* 100  */ V(11, 0, 3),
  /* 101  */ V(0, 10, 3),
  /* 110  */ V(1, 10, 2),
  /* 111  */ V(1, 10, 2),

  /* 0101 0010 ... */
  /* 00   */ V(11, 4, 1),	/* 308 */
  /* 01   */ V(11, 4, 1),
  /* 10   */ V(6, 10, 2),
  /* 11   */ V(10, 6, 2),

  /* 0101 0011 ... */
  /* 000  */ V(7, 9, 2),	/* 312 */
  /* 001  */ V(7, 9, 2),
  /* 010  */ V(9, 7, 2),
  /* 011  */ V(9, 7, 2),
  /* 100  */ V(10, 0, 3),
  /* 101  */ V(0, 9, 3),
  /* 110  */ V(9, 0, 2),
  /* 111  */ V(9, 0, 2),

  /* 0101 0100 ... */
  /* 0    */ V(11, 3, 1),	/* 320 */
  /* 1    */ V(8, 8, 1),

  /* 0101 0101 ... */
  /* 00   */ V(2, 11, 2),	/* 322 */
  /* 01   */ V(5, 10, 2),
  /* 10   */ V(11, 2, 1),
  /* 11   */ V(11, 2, 1),

  /* 0101 0110 ... */
  /* 00   */ V(10, 5, 2),	/* 326 */
  /* 01   */ V(1, 11, 2),
  /* 10   */ V(11, 1, 2),
  /* 11   */ V(6, 9, 2),

  /* 0101 0111 ... */
  /* 0    */ V(9, 6, 1),	/* 330 */
  /* 1    */ V(10, 4, 1),

  /* 0101 1000 ... */
  /* 00   */ V(4, 10, 2),	/* 332 */
  /* 01   */ V(7, 8, 2),
  /* 10   */ V(8, 7, 1),
  /* 11   */ V(8, 7, 1),

  /* 0101 1001 ... */
  /* 0    */ V(3, 10, 1),	/* 336 */
  /* 1    */ V(10, 3, 1),

  /* 0101 1010 ... */
  /* 0    */ V(5, 9, 1),	/* 338 */
  /* 1    */ V(9, 5, 1),

  /* 0101 1011 ... */
  /* 0    */ V(2, 10, 1),	/* 340 */
  /* 1    */ V(10, 2, 1),

  /* 0101 1100 ... */
  /* 0    */ V(10, 1, 1),	/* 342 */
  /* 1    */ V(6, 8, 1),

  /* 0101 1101 ... */
  /* 0    */ V(8, 6, 1),	/* 344 */
  /* 1    */ V(7, 7, 1),

  /* 0101 1110 ... */
  /* 0    */ V(4, 9, 1),	/* 346 */
  /* 1    */ V(9, 4, 1),

  /* 0101 1111 ... */
  /* 0    */ V(3, 9, 1),	/* 348 */
  /* 1    */ V(9, 3, 1),

  /* 0110 0000 ... */
  /* 0    */ V(5, 8, 1),	/* 350 */
  /* 1    */ V(8, 5, 1),

  /* 0110 0001 ... */
  /* 0    */ V(2, 9, 1),	/* 352 */
  /* 1    */ V(6, 7, 1),

  /* 0110 0010 ... */
  /* 0    */ V(7, 6, 1),	/* 354 */
  /* 1    */ V(9, 2, 1),

  /* 0110 0011 ... */
  /* 0    */ V(1, 9, 1),	/* 356 */
  /* 1    */ V(9, 1, 1),

  /* 0110 0100 ... */
  /* 0    */ V(4, 8, 1),	/* 358 */
  /* 1    */ V(8, 4, 1),

  /* 0110 0101 ... */
  /* 0    */ V(5, 7, 1),	/* 360 */
  /* 1    */ V(7, 5, 1),

  /* 0110 0110 ... */
  /* 0    */ V(3, 8, 1),	/* 362 */
  /* 1    */ V(8, 3, 1),

  /* 0110 0111 ... */
  /* 0    */ V(6, 6, 1),	/* 364 */
  /* 1    */ V(2, 8, 1),

  /* 0110 1000 ... */
  /* 0    */ V(8, 2, 1),	/* 366 */
  /* 1    */ V(1, 8, 1),

  /* 0110 1001 ... */
  /* 0    */ V(4, 7, 1),	/* 368 */
  /* 1    */ V(7, 4, 1),

  /* 0110 1010 ... */
  /* 00   */ V(8, 1, 1),	/* 370 */
  /* 01   */ V(8, 1, 1),
  /* 10   */ V(0, 8, 2),
  /* 11   */ V(8, 0, 2),

  /* 0110 1011 ... */
  /* 0    */ V(5, 6, 1),	/* 374 */
  /* 1    */ V(6, 5, 1),

  /* 0110 1100 ... */
  /* 00   */ V(1, 7, 1),	/* 376 */
  /* 01   */ V(1, 7, 1),
  /* 10   */ V(0, 7, 2),
  /* 11   */ V(7, 0, 2),

  /* 0110 1110 ... */
  /* 0    */ V(3, 7, 1),	/* 380  */
  /* 1    */ V(2, 7, 1),

  /* 0111 1100 ... */
  /* 0    */ V(0, 6, 1),	/* 382 */
  /* 1    */ V(6, 0, 1),

  /* 1000 0011 ... */
  /* 0    */ V(0, 5, 1),	/* 384 */
  /* 1    */ V(5, 0, 1)
];

/* hufftable constructor */
function MP3Hufftable(table, linbits, startbits) {
    this.table = table;
    this.linbits = linbits;
    this.startbits = startbits;
};

/* external tables */
exports.huff_quad_table = [ hufftabA, hufftabB ];
exports.huff_pair_table = [
  /*  0 */ new MP3Hufftable(hufftab0,   0, 0),
  /*  1 */ new MP3Hufftable(hufftab1,   0, 3),
  /*  2 */ new MP3Hufftable(hufftab2,   0, 3),
  /*  3 */ new MP3Hufftable(hufftab3,   0, 3),
  /*  4 */ null, //new MP3Hufftable(0 /* not used */),
  /*  5 */ new MP3Hufftable(hufftab5,   0, 3),
  /*  6 */ new MP3Hufftable(hufftab6,   0, 4),
  /*  7 */ new MP3Hufftable(hufftab7,   0, 4),
  /*  8 */ new MP3Hufftable(hufftab8,   0, 4),
  /*  9 */ new MP3Hufftable(hufftab9,   0, 4),
  /* 10 */ new MP3Hufftable(hufftab10,  0, 4),
  /* 11 */ new MP3Hufftable(hufftab11,  0, 4),
  /* 12 */ new MP3Hufftable(hufftab12,  0, 4),
  /* 13 */ new MP3Hufftable(hufftab13,  0, 4),
  /* 14 */ null, //new MP3Hufftable(0 /* not used */),
  /* 15 */ new MP3Hufftable(hufftab15,  0, 4),
  /* 16 */ new MP3Hufftable(hufftab16,  1, 4),
  /* 17 */ new MP3Hufftable(hufftab16,  2, 4),
  /* 18 */ new MP3Hufftable(hufftab16,  3, 4),
  /* 19 */ new MP3Hufftable(hufftab16,  4, 4),
  /* 20 */ new MP3Hufftable(hufftab16,  6, 4),
  /* 21 */ new MP3Hufftable(hufftab16,  8, 4),
  /* 22 */ new MP3Hufftable(hufftab16, 10, 4),
  /* 23 */ new MP3Hufftable(hufftab16, 13, 4),
  /* 24 */ new MP3Hufftable(hufftab24,  4, 4),
  /* 25 */ new MP3Hufftable(hufftab24,  5, 4),
  /* 26 */ new MP3Hufftable(hufftab24,  6, 4),
  /* 27 */ new MP3Hufftable(hufftab24,  7, 4),
  /* 28 */ new MP3Hufftable(hufftab24,  8, 4),
  /* 29 */ new MP3Hufftable(hufftab24,  9, 4),
  /* 30 */ new MP3Hufftable(hufftab24, 11, 4),
  /* 31 */ new MP3Hufftable(hufftab24, 13, 4)
];


/***/ }),
/* 128 */
/***/ ((module) => {

function IMDCT() {
    this.tmp_imdct36 = new Float64Array(18);
    this.tmp_dctIV = new Float64Array(18);
    this.tmp_sdctII = new Float64Array(9);
}

// perform X[18]->x[36] IMDCT using Szu-Wei Lee's fast algorithm
IMDCT.prototype.imdct36 = function(x, y) {
    var tmp = this.tmp_imdct36;

    /* DCT-IV */
    this.dctIV(x, tmp);

    // convert 18-point DCT-IV to 36-point IMDCT
    for (var i =  0; i <  9; ++i) {
        y[i] =  tmp[9 + i];
    }
    for (var i =  9; i < 27; ++i) {
        y[i] = -tmp[36 - (9 + i) - 1];
    }
    for (var i = 27; i < 36; ++i) {
        y[i] = -tmp[i - 27];
    }
};

var dctIV_scale = [];
for(i = 0; i < 18; i++) {
    dctIV_scale[i] = 2 * Math.cos(Math.PI * (2 * i + 1) / (4 * 18));
}

IMDCT.prototype.dctIV = function(y, X) {
    var tmp = this.tmp_dctIV;

    // scaling
    for (var i = 0; i < 18; ++i) {
        tmp[i] = y[i] * dctIV_scale[i];
    }

    // SDCT-II
    this.sdctII(tmp, X);

    // scale reduction and output accumulation
    X[0] /= 2;
    for (var i = 1; i < 18; ++i) {
        X[i] = X[i] / 2 - X[i - 1];
    }
};

var sdctII_scale = [];
for (var i = 0; i < 9; ++i) {
    sdctII_scale[i] = 2 * Math.cos(Math.PI * (2 * i + 1) / (2 * 18));
}

IMDCT.prototype.sdctII = function(x, X) {
    // divide the 18-point SDCT-II into two 9-point SDCT-IIs
    var tmp = this.tmp_sdctII;

    // even input butterfly
    for (var i = 0; i < 9; ++i) {
        tmp[i] = x[i] + x[18 - i - 1];
    }

    fastsdct(tmp, X, 0);

    // odd input butterfly and scaling
    for (var i = 0; i < 9; ++i) {
        tmp[i] = (x[i] - x[18 - i - 1]) * sdctII_scale[i];
    }

    fastsdct(tmp, X, 1);

    // output accumulation
    for (var i = 3; i < 18; i += 2) {
        X[i] -= X[i - 2];
    }
};

var c0 = 2 * Math.cos( 1 * Math.PI / 18);
var c1 = 2 * Math.cos( 3 * Math.PI / 18);
var c2 = 2 * Math.cos( 4 * Math.PI / 18);
var c3 = 2 * Math.cos( 5 * Math.PI / 18);
var c4 = 2 * Math.cos( 7 * Math.PI / 18);
var c5 = 2 * Math.cos( 8 * Math.PI / 18);
var c6 = 2 * Math.cos(16 * Math.PI / 18);

function fastsdct(x, y, offset) {
    var a0,  a1,  a2,  a3,  a4,  a5,  a6,  a7,  a8,  a9,  a10, a11, a12;
    var a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25;
    var m0,  m1,  m2,  m3,  m4,  m5,  m6,  m7;

    a0 = x[3] + x[5];
    a1 = x[3] - x[5];
    a2 = x[6] + x[2];
    a3 = x[6] - x[2];
    a4 = x[1] + x[7];
    a5 = x[1] - x[7];
    a6 = x[8] + x[0];
    a7 = x[8] - x[0];

    a8  = a0  + a2;
    a9  = a0  - a2;
    a10 = a0  - a6;
    a11 = a2  - a6;
    a12 = a8  + a6;
    a13 = a1  - a3;
    a14 = a13 + a7;
    a15 = a3  + a7;
    a16 = a1  - a7;
    a17 = a1  + a3;

    m0 = a17 * -c3;
    m1 = a16 * -c0;
    m2 = a15 * -c4;
    m3 = a14 * -c1;
    m4 = a5  * -c1;
    m5 = a11 * -c6;
    m6 = a10 * -c5;
    m7 = a9  * -c2;

    a18 =     x[4] + a4;
    a19 = 2 * x[4] - a4;
    a20 = a19 + m5;
    a21 = a19 - m5;
    a22 = a19 + m6;
    a23 = m4  + m2;
    a24 = m4  - m2;
    a25 = m4  + m1;

    // output to every other slot for convenience
    y[offset +  0] = a18 + a12;
    y[offset +  2] = m0  - a25;
    y[offset +  4] = m7  - a20;
    y[offset +  6] = m3;
    y[offset +  8] = a21 - m6;
    y[offset + 10] = a24 - m1;
    y[offset + 12] = a12 - 2 * a18;
    y[offset + 14] = a23 + m0;
    y[offset + 16] = a22 + m7;
}

IMDCT.S = [
  /*  0 */  [ 0.608761429,
              -0.923879533,
              -0.130526192,
               0.991444861,
              -0.382683432,
              -0.793353340 ],

  /*  6 */  [ -0.793353340,
               0.382683432,
               0.991444861,
               0.130526192,
              -0.923879533,
              -0.608761429 ],

  /*  1 */  [  0.382683432,
              -0.923879533,
               0.923879533,
              -0.382683432,
              -0.382683432,
               0.923879533 ],

  /*  7 */  [ -0.923879533,
              -0.382683432,
               0.382683432,
               0.923879533,
               0.923879533,
               0.382683432 ],

  /*  2 */  [  0.130526192,
              -0.382683432,
               0.608761429,
              -0.793353340,
               0.923879533,
              -0.991444861 ],

  /*  8 */  [ -0.991444861,
              -0.923879533,
              -0.793353340,
              -0.608761429,
              -0.382683432,
              -0.130526192 ]
];

module.exports = IMDCT;


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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