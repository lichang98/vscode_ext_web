import * as vscode from "vscode";

export function getConvertorDataPageV2(sample0:vscode.Uri,sample1:vscode.Uri,sample2:vscode.Uri,
                                    sample3:vscode.Uri,sample4:vscode.Uri,
                                    sample5:vscode.Uri,sample6:vscode.Uri,sample7:vscode.Uri,
                                    sample8:vscode.Uri,sample9:vscode.Uri,test_sample0:vscode.Uri,
                                    test_sample1:vscode.Uri,test_sample2:vscode.Uri,
                                    test_sample3:vscode.Uri,test_sample4:vscode.Uri,
                                    test_sample5:vscode.Uri,test_sample6:vscode.Uri,
                                    test_sample7:vscode.Uri,test_sample8:vscode.Uri,test_sample9:vscode.Uri,){
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
        <div class="row" style="height: 45%;width: 100%;margin-top:15px;">
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


export function getConvertorModelPageV2(){
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