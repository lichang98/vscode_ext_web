import * as vscode from "vscode";

export function getConvertorDataPageV2(sample0:vscode.Uri, sample1:vscode.Uri, sample2:vscode.Uri,
      sample3:vscode.Uri, sample4:vscode.Uri, sample5:vscode.Uri){
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
          </div><div class="gap-patch">
            <div class="circle"></div>
          </div><div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
      </div>

      <!--展示的主面板-->
      <div class="row" style="height: 45%;width: 100%;">
          <div class="col-md-5">
            <!-- 数据基本信息表格 -->
            <table id="data_general_table">
              <caption class="white-text" style="caption-side: top;text-align: center;font-size: large;">导入数据统计</caption>
              <tr style="font-size:small;">
                <td>总数据大小</td>
                <td id="total_data_amount">16000</td>
              </tr>
              <tr style="font-size:small;">
                <td>测试数据量</td>
                <td id="test_data_amount">10000</td>
              </tr>
              <tr style="font-size:small;">
                <td>验证数据量</td>
                <td id="val_data_amount">6000</td>
              </tr>
            </table>
          </div>
          <div class="col-md-5">
            <div id="pie_chart_container" style="width: 440px; height: 240px;">
            </div>
          </div>
      </div>
      <div class="row" style="height: 45%;width: 100%;">
        <div id="sample_data_div" class="col-md-5">
          <div style="text-align: center;font-weight: bold;font-size: large;">
            样例数据
          </div>
          <ul style="height: 60px;width: 100%;overflow: auto;">
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample0}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample1}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample2}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample3}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample4}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
            <li style="list-style: none;float: left;">
              <img id="sample_img" src="${sample5}" style="width: 50px;height: 50px;margin-left: 20px;">
            </li>
          </ul>
          <div id="bar_chart_histgram" style="width: 440px;height: 240px;margin-top: 0px;"></div>
        </div>
        <div id="sample_test_data_div" class="col-md-5">
          <div id="bar_chart_testdata_container" style="width: 440px;height: 240px;margin-top: 100px;"></div>
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
      display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
            [0.098,0.1135,0.1032,0.101,0.0982,0.0892,0.0958,0.1028,0.0974,0.1009],"训练数据集各类别分布", "数据占比","pie_chart_container");
      display_data_bar_chart(["0-28","28-56","56-85","85-113","113-141","141-170","170-198","198-226","226-255"],
              [639,8,7,1,19,18,8,9,79,0],"像素分布","该范围内像素点个数","bar_chart_histgram");
      display_data_bar_chart(['0','1','2','3','4','5','6','7','8','9'],
        [0.098,0.101,0.1028,0.0974,0.1009,0.1135,0.0982,0.0892,0.0958,0.1032],"测试数据集各类别分布","数据占比","bar_chart_testdata_container")
      
    });


    function display_data_bar_chart(label_names, label_counts, title,series_name,target_id){
      console.log("label names:"+label_names);
      console.log("label counts:"+label_counts);
      var option = {
            title: {  
                  text: title,
                  left: 'center',
                  textStyle:{
                    color:"#FDFEFE",
                    fontSize: 14
                  }
          },
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


export function getConvertorModelPageV2(){
  return `
  
  `;
}

export function getConvertorPageV2(){
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
      开始演示模态框
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
            // 接收从extension 的消息
            window.addEventListener('message', event=>{
                const message = event.data; // JSON data from extension
                console.log("从extension 接收到消息：xxxxxx");
                $("#modal_dialog").click();
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