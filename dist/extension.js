module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const fs = __webpack_require__(3);
// 引入 TreeViewProvider 的类
const TreeViewProvider_1 = __webpack_require__(4);
const multiLevelTree_1 = __webpack_require__(7);
const get_convertor_page_v2_1 = __webpack_require__(8);
const child_process_1 = __webpack_require__(9);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // 实现树视图的初始化
    let treeview = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("treeView-item");
    let treeviewConvertor = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_convertor");
    let treeViewSimulator = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_simulator");
    let treeViewConvertDarLang = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_darwinLang_convertor");
    let treeViewBinConvertDarLang = TreeViewProvider_1.TreeViewProvider.initTreeViewItem("item_bin_darwinlang_convertor");
    let inMemTreeViewStruct = new Array();
    treeViewBinConvertDarLang.data = inMemTreeViewStruct;
    let x_norm_data_path = undefined;
    let x_test_data_path = undefined;
    let y_test_data_path = undefined;
    let model_file_path = undefined;
    let darwinlang_file_paths = new Array();
    let darwinlang_bin_paths = new Array();
    let panelDataVis = undefined;
    let panelAnnModelVis = undefined;
    let panelSNNModelVis = undefined;
    let proj_desc_info = {
        "project_name": "",
        "project_type": "",
        "python_type": "",
        "ann_lib_type": ""
    };
    vscode.window.registerTreeDataProvider("multiLevelTree", new multiLevelTree_1.MultiLevelTreeProvider());
    context.subscriptions.push(vscode.commands.registerCommand('itemClick', (label) => {
        vscode.window.showInformationMessage(label);
        console.log("label is :[" + label + "]");
        if (label.search("json") !== -1) {
            // 显示darlang文件
            console.log("显示转换后的darwinLang");
            let file_target = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "darlang_out", label));
            vscode.workspace.openTextDocument(file_target).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false).then(ed => {
                    ed.edit(edit => {
                    });
                });
            }, (err) => {
                console.log(err);
            });
        }
        else if (label.search("txt") !== -1) {
            // 显示二进制的darlang文件
            console.log("显示二进制的darwinLang");
            let file_target = vscode.Uri.file(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", label));
            vscode.workspace.openTextDocument(file_target).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false).then(ed => {
                    ed.edit(edit => {
                    });
                });
            }, (err) => {
                console.log(err);
            });
        }
    }));
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "darwin2" is now active!');
    // track current webview panel
    let currentPanel = undefined;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('darwin2.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (currentPanel) {
            currentPanel.reveal(columnToShowIn);
        }
        else {
            currentPanel = vscode.window.createWebviewPanel("darwin2web", "模型转换器", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            // 主界面由electron 应用启动
            currentPanel.webview.html = get_convertor_page_v2_1.getConvertorPageV2();
            // 启动后台资源server
            let scriptPath = path.join(__dirname, "inner_scripts", "img_server.py");
            let command_str = "python " + scriptPath;
            console.log("prepare to start img server.");
            child_process_1.exec(command_str, function (err, stdout, stderr) {
                console.log("img server started");
            });
            currentPanel.webview.onDidReceiveMessage(function (msg) {
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
                            new TreeViewProvider_1.TreeItemNode("测试数据标签", [])]), new TreeViewProvider_1.TreeItemNode("模型", [])]));
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
                    treeview.refresh();
                    treeviewConvertor.refresh();
                    treeViewSimulator.refresh();
                    treeViewConvertDarLang.refresh();
                    treeViewBinConvertDarLang.refresh();
                }
            });
        }
    });
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
            filters: { "Darwin2 Project": ['dar2'] }
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
                if (x_norm_data_path) {
                    fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", "x_norm.npz"), function (err) {
                    });
                }
                if (x_test_data_path) {
                    fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", "x_test.npz"), function (err) {
                    });
                }
                if (y_test_data_path) {
                    fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", "y_test.npz"), function (err) {
                    });
                }
                if (model_file_path) {
                    fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", "mnist_cnn.h5"), function (err) {
                    });
                }
                // 显示treeview
                TreeViewProvider_1.addSlfProj(proj_desc_info.project_name);
                inMemTreeViewStruct.push(new TreeViewProvider_1.TreeItemNode(proj_desc_info.project_name, [new TreeViewProvider_1.TreeItemNode("数据", [new TreeViewProvider_1.TreeItemNode("训练数据", []), new TreeViewProvider_1.TreeItemNode("测试数据", []),
                        new TreeViewProvider_1.TreeItemNode("测试数据标签", [])]), new TreeViewProvider_1.TreeItemNode("模型", [])]));
                TreeViewProvider_1.addSlfFile("x_norm");
                TreeViewProvider_1.addSlfFile("x_test");
                TreeViewProvider_1.addSlfFile("y_test");
                TreeViewProvider_1.addSlfFile("model_file");
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
                    (_a = inMemTreeViewStruct[0].children[1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("model_file"));
                }
                // add darwinlang and bin files
                TreeViewProvider_1.ITEM_ICON_MAP.set("Darwin模型", "imgs/file.png");
                (_b = inMemTreeViewStruct[0].children) === null || _b === void 0 ? void 0 : _b.push(new TreeViewProvider_1.TreeItemNode("Darwin模型", []));
                for (let i = 0; i < darwinlang_file_paths.length; ++i) {
                    TreeViewProvider_1.ITEM_ICON_MAP.set(path.basename(darwinlang_file_paths[i].toString()), "imgs/file.png");
                    if (inMemTreeViewStruct[0].children) {
                        var child_len = inMemTreeViewStruct[0].children.length;
                        (_c = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _c === void 0 ? void 0 : _c.push(new TreeViewProvider_1.TreeItemNode(path.basename(darwinlang_file_paths[i].toString())));
                    }
                }
                TreeViewProvider_1.ITEM_ICON_MAP.set("Darwin二进制模型", "imgs/file.png");
                (_d = inMemTreeViewStruct[0].children) === null || _d === void 0 ? void 0 : _d.push(new TreeViewProvider_1.TreeItemNode("Darwin二进制模型", []));
                for (let i = 0; i < darwinlang_bin_paths.length; ++i) {
                    if (inMemTreeViewStruct[0].children) {
                        var child_len = inMemTreeViewStruct[0].children.length;
                        TreeViewProvider_1.ITEM_ICON_MAP.set(path.basename(darwinlang_bin_paths[i].toString()), "imgs/file.png");
                        (_e = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _e === void 0 ? void 0 : _e.push(new TreeViewProvider_1.TreeItemNode(path.basename(darwinlang_bin_paths[i].toString())));
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
        treeview.refresh();
        treeviewConvertor.refresh();
        treeViewSimulator.refresh();
        treeViewConvertDarLang.refresh();
        treeViewBinConvertDarLang.refresh();
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
            else if (itemNode.label === "模型") {
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
        else if (itemNode.label === "模型") {
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
                    TreeViewProvider_1.ITEM_ICON_MAP.set("x_norm", "imgs/file.png");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[0].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[0].children.push(new TreeViewProvider_1.TreeItemNode("x_norm"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (x_norm_data_path) {
                        fs.copyFile(path.join(x_norm_data_path), path.join(__dirname, "darwin2sim", "target", "x_norm.npz"), function (err) {
                        });
                    }
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
                    TreeViewProvider_1.ITEM_ICON_MAP.set("x_test", "imgs/file.png");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[1].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("x_test"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (x_test_data_path) {
                        fs.copyFile(path.join(x_test_data_path), path.join(__dirname, "darwin2sim", "target", "x_test.npz"), function (err) {
                        });
                    }
                }
            });
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
                    TreeViewProvider_1.ITEM_ICON_MAP.set("y_test", "imgs/file.png");
                    if (treeview.data[0].children && treeview.data[0].children[0].children && treeview.data[0].children[0].children[2].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[0].children[2].children.push(new TreeViewProvider_1.TreeItemNode("y_test"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (y_test_data_path) {
                        fs.copyFile(path.join(y_test_data_path), path.join(__dirname, "darwin2sim", "target", "y_test.npz"), function (err) {
                        });
                    }
                }
            });
        }
        else if (itemNode.label === "模型") {
            const options = {
                canSelectMany: false,
                canSelectFolders: false,
                openLabel: "选择模型文件",
                filters: { "模型文件": ['*'] }
            };
            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) {
                    console.log("selected path: " + fileUri[0].fsPath);
                    model_file_path = fileUri[0].fsPath;
                    // 添加到treeview下
                    TreeViewProvider_1.ITEM_ICON_MAP.set("model_file", "imgs/file.png");
                    if (treeview.data[0].children && treeview.data[0].children[1].children) {
                        console.log("添加新的文件");
                        treeview.data[0].children[1].children.push(new TreeViewProvider_1.TreeItemNode("model_file"));
                        treeview.refresh();
                    }
                    // 拷贝文件到项目并重命名
                    if (model_file_path) {
                        fs.copyFile(path.join(model_file_path), path.join(__dirname, "darwin2sim", "target", "mnist_cnn.h5"), function (err) {
                        });
                    }
                }
            });
        }
    });
    context.subscriptions.push(disposable_import_command);
    vscode.commands.registerCommand("convertor.new_proj", () => {
        console.log("create new project");
    });
    // 启动模型转换
    vscode.commands.registerCommand("item_convertor.start_convert", () => {
        var _a, _b;
        if (currentPanel) {
            currentPanel.webview.html = get_convertor_page_v2_1.getANNSNNConvertPage();
            currentPanel.reveal();
            currentPanel.title = "ANN SNN模型转换";
            // 发送消息到web view ，开始模型的转换
            currentPanel.webview.postMessage(JSON.stringify({ "ann_model_start_convert": "yes" }));
            // 执行后台脚本，发送log 到webview 展示运行日志，执行结束之后发送消息通知ann_model
            let scriptPath = path.join(__dirname, "darwin2sim", "convert_with_stb.py");
            let command_str = "python " + scriptPath;
            let scriptProcess = child_process_1.exec(command_str, {});
            (_a = scriptProcess.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (data) {
                console.log(data);
                let formatted_data = data.replace(/\r\n/g, "<br/>");
                if (currentPanel) {
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
                }
            });
        }
    });
    // 启动仿真
    vscode.commands.registerCommand("item_simulator.start_simulate", () => {
        if (!panelSNNModelVis) {
            panelSNNModelVis = vscode.window.createWebviewPanel("snnvis", "SNN模型", vscode.ViewColumn.One, { localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))], enableScripts: true, retainContextWhenHidden: true });
            panelSNNModelVis.onDidDispose(() => {
                panelSNNModelVis = undefined;
            }, null, context.subscriptions);
        }
        panelSNNModelVis.reveal();
        panelSNNModelVis.webview.html = get_convertor_page_v2_1.getSNNSimuPage();
        panelSNNModelVis.title = "SNN模型";
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
        TreeViewProvider_1.ITEM_ICON_MAP.set("Darwin模型", "imgs/file.png");
        (_a = inMemTreeViewStruct[0].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("Darwin模型", []));
        darwinlang_file_paths.splice(0);
        if (inMemTreeViewStruct[0].children) {
            var child_len = inMemTreeViewStruct[0].children.length;
            fs.readdir(path.join(__dirname, "darwin2sim", "model_out", "darlang_out"), (err, files) => {
                files.forEach(file => {
                    var _a;
                    darwinlang_file_paths.push(path.join(__dirname, "darwin2sim", "model_out", "darlang_out", file));
                    TreeViewProvider_1.ITEM_ICON_MAP.set(file, "imgs/file.png");
                    if (inMemTreeViewStruct[0].children) {
                        (_a = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode(file));
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
    // 启动将darwinlang 文件转换为二进制文件的操作
    vscode.commands.registerCommand("bin_darlang_convertor.start_convert", function () {
        var _a;
        TreeViewProvider_1.ITEM_ICON_MAP.set("Darwin二进制模型", "imgs/file.png");
        (_a = inMemTreeViewStruct[0].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode("Darwin二进制模型", []));
        darwinlang_bin_paths.splice(0);
        if (inMemTreeViewStruct[0].children) {
            var child_len = inMemTreeViewStruct[0].children.length;
            fs.readdir(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out"), (err, files) => {
                files.forEach(file => {
                    var _a;
                    darwinlang_bin_paths.push(path.join(__dirname, "darwin2sim", "model_out", "bin_darwin_out", file));
                    TreeViewProvider_1.ITEM_ICON_MAP.set(file, "imgs/file.png");
                    if (inMemTreeViewStruct[0].children) {
                        (_a = inMemTreeViewStruct[0].children[child_len - 1].children) === null || _a === void 0 ? void 0 : _a.push(new TreeViewProvider_1.TreeItemNode(file));
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
    vscode.commands.executeCommand("darwin2.helloWorld");
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");;

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TreeViewProvider = exports.TreeItemNode = exports.addSlfFile = exports.addSlfProj = exports.ITEM_ICON_MAP = void 0;
const vscode_1 = __webpack_require__(1);
const path_1 = __webpack_require__(2);
const vscode = __webpack_require__(1);
// 创建每一项 label 对应的图片名称
// 其实就是一个Map集合，用 ts 的写法
exports.ITEM_ICON_MAP = new Map([
    ['项目', 'imgs/project.png'],
    ['数据', 'imgs/import_data.png'],
    ['模型', 'imgs/import_model.png'],
    ['训练数据', "imgs/file.png"],
    ['测试数据', "imgs/file.png"],
    ['测试数据标签', "imgs/file.png"]
    // ['转换与仿真',"imgs/simulate_run.png"],
    // ['测试添加',"imgs/simulate_run.png"]
]);
function addSlfProj(label) {
    exports.ITEM_ICON_MAP.set(label, 'imgs/project.png');
}
exports.addSlfProj = addSlfProj;
function addSlfFile(label) {
    exports.ITEM_ICON_MAP.set(label, "imgs/file.png");
}
exports.addSlfFile = addSlfFile;
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
            // tooltip: this.label,        // 鼠标覆盖时的小小提示框
            arguments: [
                this.label,
            ]
        };
        // iconPath： 为该项的图标因为我们是通过上面的 Map 获取的，所以我额外写了一个方法，放在下面
        this.iconPath = TreeItemNode.getIconUriForLabel(this.label);
        this.children = children ? children : [];
        // this.contextValue = isRoot ? "TreeViewProviderContext":undefined;
        this.contextValue = label;
    }
    // __filename：当前文件的路径
    // 重点讲解 Uri.file(join(__filename,'..', '..') 算是一种固定写法
    // Uri.file(join(__filename,'..','assert', ITEM_ICON_MAP.get(label)+''));   写成这样图标出不来
    // 所以小伙伴们就以下面这种写法编写
    static getIconUriForLabel(label) {
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
/* 5 */,
/* 6 */,
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


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
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSNNSimuPage = exports.getANNSNNConvertPage = exports.getConvertorPageV2 = exports.getConvertorModelPageV2 = exports.getConvertorDataPageV2 = void 0;
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
  
        <!--展示的主面板-->
        <div class="row" style="height: 45%;width: 100%;">
            <div class="col-md-6">
              <!-- 数据基本信息表格 -->
              <table id="data_general_table" style="width:440px; margin-left:100px;">
                <caption class="white-text" style="caption-side: top;font-weight: bold;text-align: center;font-size: large;">导入数据统计</caption>
                <tr style="font-size:small;">
                  <td>总数据大小</td>
                  <td id="total_data_amount"></td>
                </tr>
                <tr style="font-size:small;">
                  <td>测试数据量</td>
                  <td id="test_data_amount"></td>
                </tr>
                <tr style="font-size:small;">
                  <td>验证数据量</td>
                  <td id="val_data_amount"></td>
                </tr>
                <tr style="font-size: small;">
                  <td>数据类别个数</td>
                  <td id="class_counts"></td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <div style="text-align: center;font-weight: bold;font-size: large;margin-bottom:20px;">
                数据类别分布
              </div>
              <div id="bar_chart_testdata_container" style="width: 440px;height: 300px;margin-left:100px;"></div>
            </div>
        </div>
        <div class="row" style="height: 45%;width: 100%;margin-top:35px;">
          <div id="sample_data_div" class="col-md-6">
            <div style="text-align: center;font-weight: bold;font-size: large;margin-left:15px;">
              训练集样例数据
            </div>
            <ul id="sample_imgs_ul" style="height: 300px;width: 100px;overflow: auto;display: inline-block;">
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img0" onclick="sample_img_click(this);" src="${sample0}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img1" onclick="sample_img_click(this);" src="${sample1}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img2" onclick="sample_img_click(this);" src="${sample2}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img3" onclick="sample_img_click(this);" src="${sample3}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img4" onclick="sample_img_click(this);" src="${sample4}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img5" onclick="sample_img_click(this);" src="${sample5}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img6" onclick="sample_img_click(this);" src="${sample6}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img7" onclick="sample_img_click(this);" src="${sample7}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img8" onclick="sample_img_click(this);" src="${sample8}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img9" onclick="sample_img_click(this);" src="${sample9}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
            </ul>
            <div id="bar_chart_histgram" style="width: 440px;height: 320px;margin-top: 0px;display: inline-block;"></div>
          </div>
          <div id="sample_testdataset_data_div" class="col-md-6">
            <div style="text-align: center;font-weight: bold;font-size: large;margin-left:15px;">
              测试集样例数据
            </div>
            <ul id="test_sample_imgs_ul" style="height: 300px;width: 100px;overflow: auto;display: inline-block;">
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img0" onclick="sample_img_click(this);" src="${test_sample0}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img1" onclick="sample_img_click(this);" src="${test_sample1}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img2" onclick="sample_img_click(this);" src="${test_sample2}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img3" onclick="sample_img_click(this);" src="${test_sample3}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img4" onclick="sample_img_click(this);" src="${test_sample4}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img5" onclick="sample_img_click(this);" src="${test_sample5}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img6" onclick="sample_img_click(this);" src="${test_sample6}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img7" onclick="sample_img_click(this);" src="${test_sample7}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img8" onclick="sample_img_click(this);" src="${test_sample8}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img9" onclick="sample_img_click(this);" src="${test_sample9}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
            </ul>
            <div id="test_bar_chart_histgram" style="width: 440px;height: 320px;margin-top: 0px;display: inline-block;"></div>
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
    background-color: black;
    color: white;
    font-size: 25px;
  }
  
  .dark-mode {
    background-color: rgb(61, 57, 57);
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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
  
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script>
  <script>



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
            data_info.test_sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.test_sample_imgs[i].hist_gram_bins[j]);
          }
        }

        for(var i=0;i<data_info.sample_imgs.length;++i){
          for(var j=0;j<data_info.sample_imgs[i].hist_gram_bins.length;++j){
            data_info.sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.sample_imgs[i].hist_gram_bins[j]);
          }
        }

        console.log("display test data distribution...");
        display_data_bar_chart(class_labels, class_ratios, "测试数据集各类别分布",  "数据占比", "bar_chart_testdata_container");
        console.log("test data distribution bar chart displayed.");
    });
  });

  function sample_img_click(e){
    var sampleId = $(e).attr("id");
    console.log("current click img id="+sampleId);
    var sampleIdx = parseInt(sampleId.substring(sampleId.length-1));
    if(sampleId.substring(0,4) === "test"){
      display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布", "test_bar_chart_histgram");
    }else{
      display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布", "bar_chart_histgram");
    }
  }


  
      function display_data_bar_chart(label_names, label_counts, title,series_name,target_id){
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
              backgroundColor:"#17202A",
              xAxis: [
                  {
                      type: 'category',
                      data:label_names,
                      axisPointer: {
                          type: 'shadow'
                      },
                      axisLabel:{
                          textStyle:{
                              "color":"#FDFEFE "
                          },
                          rotate:30
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '',
                      min: 0,
                      max: Math.max(label_counts)*1.2,
                      interval: Math.max(label_counts)*1.2 / 5,
                      axisLabel: {
                          formatter: '{value}'
                      },
                      splitLine:{show:false},
                      axisLine: {show: false}, 
                      axisTick: {show: false},
                      axisLabel:{show:false}
                  },
                  {
                      type: 'value',
                      name: '',
                      min: 0,
                      max: Math.max(label_counts)*1.2,
                      interval: Math.max(label_counts)*1.2 / 5,
                      axisLabel: {
                          formatter: '{value}'
                      },
                      splitLine:{show:false},
                      axisLine: {show: false}, 
                      axisTick: {show: false},
                      axisLabel:{show:false}
                  }
              ],
              series: [
                  {
                      name: series_name,
                      type: 'bar',
                      data: label_counts
                  },
                  {
                      name: series_name,
                      type: 'line',
                      yAxisIndex: 1,
                      data: label_counts
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

        <div id="main_panel" style="width: 100%;height: 100%;overflow: auto;">
          <div class="row">
            <!-- 模型总体信息表格 -->
            <div class="col-md-6">
              <table id="model_general_table" style="width: 440px;margin-left:40px;">
                <caption class="white-text" style="caption-side: top;text-align: center;font-size: large;font-weight: bold;">ANN模型基本信息</caption>
                <tr>
                  <td style="font-size: small;">总层数</td>
                  <td id="model_total_layers" style="font-size: small;"></td>
                </tr>
                <tr>
                  <td style="font-size: small;">总参数量</td>
                  <td id="model_total_param" style="font-size: small;"></td>
                </tr>
                <tr>
                  <td style="font-size: small;">unit数量</td>
                  <td id="model_total_units" style="font-size: small;"></td>
                </tr>
              </table>
    
              <!-- python 绘制的模型结构简图 -->
              <div id="ann_model_vis_img_parent_div" style="margin-left: 40px;">
                <img id="ann_model_vis_img" style="width: 440px;height: 260px;">
              </div>
            </div>
  
            <!--模型详细信息表格-->
            <div class="col-sm-6">
              <div style="text-align: center;font-size: large;font-weight: bold;">各层详细信息</div>
              <div class="row">
                <div class="col-sm-6">
                  <table id="model_detail_table">
                    <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                    <thead>
                      <tr>
                        <td style="font-size: medium;">名称</td>
                        <td style="font-size: medium;">输出形状</td>
                        <td style="font-size: medium;">参数量</td>
                      </tr>
                    </thead>
                    <!--通过加载模型的信息动态创建-->
                  </table>
                </div>
                <div class="col-sm-6">
                  <table id="model_detail_table_secondary">
                    <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                    <thead>
                      <tr>
                        <td style="font-size: medium;">名称</td>
                        <td style="font-size: medium;">输出形状</td>
                        <td style="font-size: medium;">参数量</td>
                      </tr>
                    </thead>
                    <!--通过加载模型的信息动态创建-->
                  </table>
                </div>
              </div>
            </div>

          </div>

          <!--模型各层的可视化-->
          <div class="row">
            <div id="model_layers_vis" class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">卷积与激活层输出可视化</div>
              <!--动态创建-->
              <div id="layers_vis_div" class="row" style="margin-left: 40px;">
                <div class="col-md-3" style="font-size: medium;">layer 名称</div>
                <div class="col-md-3" style="font-size: medium;">layer 编号</div>
                <div class="col-md-6" style="font-size: medium;">输出可视化</div>
              </div>
              <div id="tmp_peer"></div>
            </div>
            <!-- 显示各层的参数量占比 -->
            <div class="col-md-6">
              <div style="font-size: large;font-weight: bold;text-align: center;">各层参数量分布</div>
              <div id="layer_param_percent_div" style="width: 600px;height: 260px;"></div>
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
  background-color: black;
  color: white;
  font-size: 25px;
}

.dark-mode {
  background-color: rgb(61, 57, 57);
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
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">

<script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script>
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
                var col_name = document.createElement("td");
                col_name.style = "font-size: small;";
                col_name.innerText = detail_info[i].name;
                var col_shape = document.createElement("td");
                col_shape.style = "font-size: small;";
                col_shape.innerText = detail_info[i].shape;
                var col_params = document.createElement("td");
                col_params.style = "font-size: small;";
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
                var col_name = document.createElement("td");
                col_name.style = "font-size: small;";
                col_name.innerText = detail_info[i].name;
                var col_shape = document.createElement("td");
                col_name.style = "font-size: small;";
                col_shape.innerText = detail_info[i].shape;
                var col_params = document.createElement("td");
                col_params.style = "font-size: small;";
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
                img_div.style = "margin-left: 40px;";

                var layer_name_div = document.createElement("div");
                layer_name_div.setAttribute("class", "col-md-3");
                layer_name_div.style = "font-size: small;";
                layer_name_div.innerText = layer_name;
                img_div.appendChild(layer_name_div);

                var layer_index_div = document.createElement("div");
                layer_index_div.style = "font-size: small;";
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
                  layer_vis_div.appendChild(layer_img_tag);
                  img_div.append(layer_img_tag);
                }
                // document.getElementById("model_layers_vis").appendChild(img_div);
                document.getElementById("model_layers_vis").insertBefore(img_div, document.getElementById("tmp_peer"));
              }
          }
          console.log("ann model img displayed");
          $("#ann_model_vis_img").attr("src", "http://127.0.0.1:6003/img/ann_model_vis.png");
      });
    });

    function display_layer_params_bar_chart(layer_names, layer_param_counts){
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
            backgroundColor:"#17202A",
            xAxis: [
                {
                    type: 'category',
                    data:layer_names,
                    axisPointer: {
                        type: 'shadow'
                    },
                    axisLabel:{
                        textStyle:{
                            "color":"#FDFEFE "
                        },
                        rotate:30
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '',
                    min: 0,
                    max: Math.max(layer_param_counts)*1.2,
                    interval: Math.max(layer_param_counts)*1.2 / 5,
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine:{show:false},
                    axisLine: {show: false}, 
                    axisTick: {show: false},
                    axisLabel:{show:false}
                },
                {
                    type: 'value',
                    name: '',
                    min: 0,
                    max: Math.max(layer_param_counts)*1.2,
                    interval: Math.max(layer_param_counts)*1.2 / 5,
                    axisLabel: {
                        formatter: '{value}'
                    },
                    splitLine:{show:false},
                    axisLine: {show: false}, 
                    axisTick: {show: false},
                    axisLabel:{show:false}
                }
            ],
            series: [
                {
                    name: '参数量(log_10)',
                    type: 'bar',
                    data: layer_param_counts
                },
                {
                    name: '参数量(log_10)',
                    type: 'line',
                    yAxisIndex: 1,
                    data: layer_param_counts
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
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="background-color: #333;">
      <div class="modal-dialog" style="background-color: #333;">
        <div class="modal-content" style="background-color: #333;">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: antiquewhite;">
              &times;
            </button>
            <h4 class="modal-title" id="myModalLabel">
              项目创建向导
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form">
                        <div class="form-group">
                            <label for="project_name">项目名称</label>
                            <input type="text" class="form-control" id="project_name">
                        </div>
                        <div class="form-group">
                            <label for="select_type">选择项目类别</label>
                            <select class="form-control" id="select_type">
                                <option>图像分类</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="python_type">选择python版本</label>
                            <select class="form-control" id="python_type">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group">
                          <label for="ann_lib_type">模型使用的神经网络库</label>
                          <select class="form-control" id="ann_lib_type">
                            <option>Keras(Tensorflow backended)</option>
                          </select>
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
    <div class="modal fade" id="myModalProjRefact" tabindex="-1" role="dialog" aria-labelledby="myModalLabelProjRefact" aria-hidden="true" style="background-color: #333;">
      <div class="modal-dialog" style="background-color: #333;">
        <div class="modal-content" style="background-color: #333;">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: antiquewhite;">
              &times;
            </button>
            <h4 class="modal-title" id="myModalLabelProjRefact">
              项目属性修改
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form_projrefac">
                        <div class="form-group">
                            <label for="project_name_projrefac">项目名称</label>
                            <input type="text" class="form-control" id="project_name_projrefac">
                        </div>
                        <div class="form-group">
                            <label for="select_type_refac">选择项目类别</label>
                            <select class="form-control" id="select_type_refac">
                                <option>图像分类</option>
                                <option>语音识别</option>
                                <option>目标检测</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="python_type_projrefac">选择python版本</label>
                            <select class="form-control" id="python_type_projrefac">
                                <option>python3.6x</option>
                                <option>python3.7x</option>
                                <option>python3.8x</option>
                            </select>
                        </div>
                        <div class="form-group">
                          <label for="ann_lib_type_projrefac">模型使用的神经网络库</label>
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
      background-color: black;
      color: white;
      font-size: 25px;
    }
    
    .dark-mode {
      background-color: rgb(61, 57, 57);
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
    <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
    <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
    
    <script>
    
        const vscode = acquireVsCodeApi();
        $(document).ready(function(){
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
  
  <body class="dark-mode" style="height: 100%;width: 100%;">
  
      <!-- 按钮触发模态框 -->
      <button id="modal_dialog" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#convertorModal" style="display: none;">
          转换进度
      </button>
      
      </button>
      <!-- 模态框（Modal） -->
      <div class="modal fade" id="convertorModal" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="convertorModalLabel" aria-hidden="true" style="background-color: #333;">
          <div class="modal-dialog" style="background-color: #333;">
              <div class="modal-content" style="background-color: #333;">
                  <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: antiquewhite;">
                          &times;
                      </button>
                      <h4 id="modal_header" class="modal-title" id="convertorModalLabel">
                          转换进度(处理中......)
                      </h4>
                  </div>
                  <div class="modal-body">
                      <div class="progress progress-striped active">
                          <div id="task_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                              <span id="progress_val" class="sr-only">0</span>
                          </div>
                      </div>
                      <div id="log_output_div" style="overflow: auto;width: 100%;height: 300px;">
                      </div>
                  </div>
              </div><!-- /.modal-content -->
          </div><!-- /.modal -->
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
  
  .dark-mode {
    background-color: rgb(61, 57, 57);
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
  
  <script>
        $(document).ready(function(){
          let interval_counter = undefined;
            window.addEventListener("message", function(evt){
              console.log("ANN 转SNN 模型接收到extension 消息："+evt.data);
                const data = JSON.parse(evt.data);
                if(data.ann_model_start_convert){
                    console.log("启动转换进度条");
                    $("#modal_dialog").click();
                }else if(data.log_output){
                  let prevData = $("#log_output_div").text();
                  prevData += data.log_output;
                  if(prevData.length >= 10000){
                    prevData = prevData.substring(prevData.length-10000, prevData.length);
                  }
                  $("#log_output_div").html(prevData);
                  document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight();
                }else if(data.exec_finish){
                  document.getElementById("task_progress_div").style.width = ""+100+"%";
                  $("#modal_header").text("转换结束！");
                  clearInterval(interval_counter);
                }
            });
  
            setTimeout(function(){
              interval_counter = window.setInterval(function(){
                var progress = parseInt($("#progress_val").text());
                progress += 1;
                if(progress >= 90){
                  return;
                }
                $("#progress_val").text(""+progress);
                document.getElementById("task_progress_div").style.width = ""+progress+"%";
              },10000);
            }, 2000);
        });
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
  
  <body class="dark-mode" style="height: 100%;width: 100%;">
  
      <div class="row" style="margin-top: 40px;">
          <!-- SNN神经元信息 -->
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络神经元组信息</div>
              <table id="snn_neurons_table" style="width: 540px;margin-left:80px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;">
                      <td style="font-size: medium;font-weight: bold;">layer编号</td>
                      <td style="font-size: medium;font-weight: bold;">神经元个数</td>
                      <td style="font-size: medium;font-weight: bold;">求解方法</td>
                      <td style="font-size: medium;font-weight: bold;">电压阈值</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
          <!--  -->
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络突触连接信息</div>
              <table id="layer_conns_table" style="width: 620px;margin-left:80px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;">
                      <td style="font-size: medium;font-weight: bold;">layer编号</td>
                      <td style="font-size: medium;font-weight: bold;">连接稠密度</td>
                      <td style="font-size: medium;font-weight: bold;">平均每个神经元的连接数</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
      </div>
      <div class="row" style="margin-top: 150px;">
          <!--权重分布图-->
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络权重分布</div>
              <div id="weight_dist_chart" style="width: 640px;height: 320px;margin-left: 25px;"></div>
          </div>
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络输出层脉冲</div>
              <div id="spike_charts" style="width: 640px;height: 320px;margin-left: 25px;"></div>
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
  
  .dark-mode {
    background-color: rgb(61, 57, 57);
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script>
  
  <script>
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
              console.log("SNN 仿真接收到extension 消息");
                const data = JSON.parse(evt.data);
                if(data.snn_info){
                    var infos =JSON.parse(data.snn_info);
                    // 构建neurons info 表格
                    var neurons_info = infos.neurons_info;
                    var neurons_table = document.getElementById("snn_neurons_table");
                    for(var i=0;i<neurons_info.length;++i){
                        var line = document.createElement("tr");
                        line.style = "margin-top: 15px;"
                        var col_1 = document.createElement("td");
                        col_1.style = "font-size: medium";
                        col_1.innerText = neurons_info[i].idx;
  
                        var col_2 = document.createElement("td");
                        col_2.style = "font-size: medium";
                        col_2.innerText = neurons_info[i].neuron_count;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "font-size: medium";
                        col_3.innerText = neurons_info[i].method;
  
                        var col_4 = document.createElement("td");
                        col_4.style = "font-size: medium";
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
                        line.style = "margin-top: 15px;";
                        var col_1 = document.createElement("td");
                        col_1.style = "font-size: medium";
                        col_1.innerText = synaps_info[i].idx;
  
                        var col_2 = document.createElement("td");
                        col_2.style = "font-size: medium";
                        col_2.innerText = synaps_info[i].ratio;
  
                        var col_3 = document.createElement("td");
                        col_3.style = "font-size: medium";
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
                    
                    // 绘制脉冲时间序列图
                    console.log("脉冲数据:"+infos.spikes.cls_names);
                    display_spike_scatter_chart(infos.spikes.cls_names, infos.spikes.spike_tuples);
                }
            });
        });
  
        function display_weight_chart(label_names, label_counts){
            var opt = {
                  xAxis: {
                      type: 'category',
                      data: label_names
                  },
                  yAxis: {
                      type: 'value',
                      splitLine:{show:false},
                      axisLine: {show: false}, 
                      axisTick: {show: false},
                      axisLabel:{show:false}
                  },
                  series: [{
                      data: label_counts,
                      type: 'bar'
                  }]
              };
              var weights_chart = echarts.init(document.getElementById("weight_dist_chart"));
              weights_chart.setOption(opt);
        }
  
        function display_spike_scatter_chart(labels, datas){
            var opt={
                  xAxis: {
                      type:'category',
                      data: labels
                  },
                  yAxis: {
                      splitLine:{show:false},
                      axisLine: {show: false}, 
                      axisTick: {show: false},
                      axisLabel:{show:false}
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
  </script>
  
  </html>
  `;
}
exports.getSNNSimuPage = getSNNSimuPage;


/***/ }),
/* 9 */
/***/ ((module) => {

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