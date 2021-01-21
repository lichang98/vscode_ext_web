import * as vscode from "vscode";


export function getMainPageV2(arrow_down:vscode.Uri, arrow_leftdown:vscode.Uri, arrow_right:vscode.Uri,
          convertor_log:vscode.Uri, train_snn:vscode.Uri, model_pool:vscode.Uri, mapper:vscode.Uri,
          darwin_os:vscode.Uri){
    return `
    <!DOCTYPE html>
    <html style="height: 640px;width: 100%;">
    
    <head>
      <meta charset="UTF-8">
      <title>模型转换器</title>
    </head>
    
    <body class="dark-mode" style="height: 100%;width: 100%;">
    
      <!-- <div class="titlebar" style="width: 100%;height:30px;">
        <img src="./resources/favicon.ico" style="width: 30px;height: 30px;display: inline-block;">
        <div style="text-align: center;display: inline-block;margin-left: 280px;">Darwin IDE</div>
        <img id="main_window_minimize" src="./resources/min_window.png" style="width: 30px;height: 30px;display: inline-block;margin-left: 220px;">
        <img id="main_window_close" src="./resources/close_window.png" style="width: 30px;height: 30px;display: inline-block;margin-left: 10px;">
      </div> -->
      <div style="margin-left:180px;position:absolute;margin-top: 360px;width: 60px;height: 60px;">
        <img src="${arrow_down}" style="height: 60px;width: 40px;margin-left: 340px;">
      </div>
      <div style="margin-left:680px;position:absolute;margin-top: 360px;width: 60px;height: 60px;">
        <img src="${arrow_leftdown}" style="height: 60px;width: 80px;margin-left: 220px;">
      </div>
      <div style="margin-left:500px;position:absolute;margin-top: 600px;width: 60px;height: 60px;margin-left: 670px;">
        <img src="${arrow_right}" style="height: 40px;width: 60px;">
      </div>
      <div class="row" style="height:200px;width:600px;">
        <div id="convertor_entrance" class="col m5 s5 z-depth-4">
          <div class="card">
            <div class="card-image">
              <img src="${convertor_log}">
              <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: medium;">模型转换器</span>
            </div>
            <div class="card-content blue-text text-darken-3" style="font-size: smaller;">
              提供从ANN转换到SNN的功能
            </div>
          </div>
        </div>
    
        <div class="col m5 s5 offset-s1 offset-m1 z-depth-4">
          <div class="card">
            <div class="card-image">
              <img src="${train_snn}">
              <span class="card-title teal-text text-darken-4 green accent-1" style="font-size:medium">SNN训练器</span>
            </div>
            <div class="card-content blue-text text-darken-3" style="font-size: smaller;">
              提供构建以及训练SNN的功能
            </div>
          </div>
        </div>
      </div>
    
      <div class="row" style="height: 240px;">
          <div class="col-sm-12" style="margin-left: 440px;">
              <img src="${model_pool}" style="width: 200px;height: 160px;margin-left: -360px;"/>
              <div class="white" style="width: 200px;margin-left: 180px;">
                <div class="green accent-1 teal-text text-darken-4" style="font-size: medium">模型池</div>
                <div class="blue-text text-darken-3" style="font-size: smaller;">提供统一的模型存储</div>          
              </div>
          </div>
      </div>
    
      <div class="row" style="width:600px; height:600px;">
        <div class="col m5 s5 z-depth-4">
          <div class="card">
            <div class="card-image">
              <img src="${mapper}">
              <span class="card-title teal-text text-darken-4 green accent-1" style="font-size:medium">SNN映射器</span>
            </div>
            <div class="card-content blue-text text-darken-3" style="font-size: smaller;">
              提供SNN模型转换为可运行在达尔文类脑芯片上文件的功能
            </div>
          </div>
        </div>
    
        <div class="col m5 s5 offset-s1 offset-m1 z-depth-4">
          <div class="card">
            <div class="card-image">
              <img src="${darwin_os}">
              <span class="card-title teal-text text-darken-4 green accent-1" style="font-size: medium">类脑操作系统</span>
            </div>
            <div class="card-content blue-text text-darken-3" style="font-size: smaller;">
              提供达尔文类脑芯片硬件与应用运行管理功能
            </div>
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    
    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    
    <script>
        // const {ipcRenderer} = require('electron');
        // document.addEventListener('DOMContentLoaded', function() {
        //     document.getElementById("convertor_entrance").onclick = function(){
        //         console.log("jump_to_convertor_page");
        //         ipcRenderer.send("jump_to_convertor_page");
        //     }
        // });
        // document.getElementById("main_window_minimize").addEventListener("click",()=>{
        //   ipcRenderer.send("main-window-minimize");
        // });
        // document.getElementById("main_window_close").addEventListener("click",()=>{
        //   ipcRenderer.send("main-window-close");
        // });
        const vscode = acquireVsCodeApi();
        $("#convertor_entrance").on("click",function(){
          console.log("jump back to convertor page");
          vscode.postMessage(JSON.stringify({"click":"convertor_page"}));
        });
          
    </script>
    
    </html>
    `;
}