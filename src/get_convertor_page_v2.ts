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
        <div class="row" style="height: 45%;width: 100%;margin-top:35px;">
          <div id="sample_data_div" class="col-md-6">
            <div style="text-align: center;font-weight: bold;font-size: large;margin-left:15px;">
              训练集样例数据
            </div>
            <ul id="sample_imgs_ul" style="height: 300px;width: 100px;overflow: auto;display: inline-block;">
              <li id="sample_img0_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img0" onclick="sample_img_click(this);" src="${sample0}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img1_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img1" onclick="sample_img_click(this);" src="${sample1}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img2_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img2" onclick="sample_img_click(this);" src="${sample2}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img3_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img3" onclick="sample_img_click(this);" src="${sample3}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img4_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img4" onclick="sample_img_click(this);" src="${sample4}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img5_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img5" onclick="sample_img_click(this);" src="${sample5}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img6_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img6" onclick="sample_img_click(this);" src="${sample6}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img7_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img7" onclick="sample_img_click(this);" src="${sample7}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img8_li" style="list-style: none;margin-bottom: 10px;">
                <img id="sample_img8" onclick="sample_img_click(this);" src="${sample8}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="sample_img9_li" style="list-style: none;margin-bottom: 10px;">
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
              <li id="test_sample_img0_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img0" onclick="sample_img_click(this);" src="${test_sample0}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img1_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img1" onclick="sample_img_click(this);" src="${test_sample1}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img2_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img2" onclick="sample_img_click(this);" src="${test_sample2}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img3_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img3" onclick="sample_img_click(this);" src="${test_sample3}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img4_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img4" onclick="sample_img_click(this);" src="${test_sample4}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img5_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img5" onclick="sample_img_click(this);" src="${test_sample5}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img6_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img6" onclick="sample_img_click(this);" src="${test_sample6}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img7_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img7" onclick="sample_img_click(this);" src="${test_sample7}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img8_li" style="list-style: none;margin-bottom: 10px;">
                <img id="test_sample_img8" onclick="sample_img_click(this);" src="${test_sample8}" style="width: 50px;height: 50px;margin-left: 20px;">
              </li>
              <li id="test_sample_img9_li" style="list-style: none;margin-bottom: 10px;">
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
    if(sampleId.substring(0,4) === "test"){
      if(prev_click_img_li_test_id !== undefined){
        document.getElementById(prev_click_img_li_test_id).style.backgroundColor="";
      }
      prev_click_img_li_test_id = sampleId+"_li";
      document.getElementById(prev_click_img_li_test_id).style.backgroundColor = "chocolate";
    }else{
      if(prev_click_img_li_id !== undefined){
        document.getElementById(prev_click_img_li_id).style.backgroundColor = "";
      }
      prev_click_img_li_id = sampleId+"_li";
      document.getElementById(prev_click_img_li_id).style.backgroundColor = "chocolate";
    }
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


export function getANNSNNConvertPage(){
  return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;">
  
      <div class="row">
          <div class="col-md-10 col-md-offset-1">
              <div style="font-size: large;font-weight: bold;text-align: center;">转换进度</div>
              <div class="row" style="margin-left: 30px;">
                  <div class="col-md-2">
                      <div>ANN转SNN</div>
                      <div class="progress progress-striped active">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: 15px;">
                      <i class="material-icons">arrow_forward</i>
                  </div>
              
                  <div class="col-md-2">
                      <div>预处理</div>
                      <div class="progress  progress-striped active">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: 15px;">
                      <i class="material-icons">arrow_forward</i>
                  </div>
  
                  <div class="col-md-2">
                      <div>参数调优</div>
                      <div class="progress progress-striped active">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: 15px;">
                      <i class="material-icons">arrow_forward</i>
                  </div>
              
                  <div class="col-md-2">
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
                  <span>启动</span>
                  <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i>
                  <div class="progress progress-striped active" style="width: 90%;display: inline-block;margin-bottom: 0;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%;">
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      <div class="row" style="margin-top: 30px;">
          <div class="col-md-10 col-md-offset-1">
              <div style="font-size: large;font-weight: bold;text-align: center;">参数配置</div>
              <form role="form" class="row" style="margin-right: 10px;" id="project_info_form">
                  <div class="col-md-2">
                      <label for="select_vthresh">膜电压阈值</label>
                      <select class="form-control" id="select_vthresh">
                          <option>16</option>
                          <option>10</option>
                          <option>11</option>
                          <option>12</option>
                          <option>13</option>
                          <option>14</option>
                          <option>15</option>
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
                  <div class="col-md-2">
                      <label for="select_dt">神经元dt</label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2">
                      <label for="select_synapse_dt">突触dt</label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>0.1ms</option>
                          <option>1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2">
                      <label for="select_delay">delay</label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2">
                      <label for="select_dura">总时间</label>
                      <select class="form-control" id="select_dura">
                          <option>100ms</option>
                          <option>200ms</option>
                          <option>500ms</option>
                      </select>
                  </div>
              </form>
          </div>
      </div>
  
  
      <div class="row" style="height: 100%; margin-top: 50px;">
          <div class="col-md-3">
              <div style="font-size: large;font-weight: bold;text-align: center;">日志输出</div>
              <div id="log_output_div" style="margin-left: 50px;height: calc(100vh - 240px); overflow: auto;">
      
              </div>
          </div>
          <div class="col-md-3">
              <div style="font-size: large;font-weight: bold;text-align: center;">转换性能分析</div>
              <div id="use_time_bar_chart" style="width: 400px;height: 460px;margin-top: 15px;margin-left: -50px;"></div>
          </div>
          <div class="col-md-6" style="height:calc(100vh - 200px);">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">转换过程信息</div>
              <table id="info_simu_table" style="margin-left: auto;margin-right: auto;">
                  <tr style="margin-top: 15px;">
                      <td style="width: 200px;">转换总耗时</td>
                      <td id="total_use_time" style="font-size: medium;font-weight: bold;">xxx</td>
                  </tr>
                  <tr style="margin-top: 15px;">
                      <td>平均激发脉冲次数</td>
                      <td id="avg_spike" style="font-size: medium;font-weight: bold;">xxx</td>
                  </tr>
                  <tr style="margin-top: 15px;">
                      <td>激发脉冲次数方差</td>
                      <td id="std_spike" style="font-size: medium;font-weight: bold;">xxx</td>
                  </tr>
                  <tr style="margin-top: 15px;">
                      <td>连接权重均值</td>
                      <td id="avg_conn_wt" style="font-size: medium;font-weight: bold;">xxx</td>
                  </tr>
                  <tr style="margin-top: 15px;">
                      <td>连接权重方差</td>
                      <td id="std_conn_wt" style="font-size: medium;font-weight: bold;">xxx</td>
                  </tr>
              </table>
  
              <div style="margin-top: 30px;">
                  <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络输出层脉冲</div>
                  <div id="model_layers_vis_tab_caption" style="font-size: small;font-weight: bold;text-align: center;">统计计数</div>
                  <table id="spike_out_count_table" style="margin-left: 125px;">
                      <tr id="out_labels">
                      </tr>
                      <tr id="out_counts_tr">
                      </tr>
                  </table>
                  <ul id="sample_imgs_ul" style="height: 300px;width: 100px;overflow-x: hidden;display: inline-block;">
                      <!-- <li style="list-style: none;margin-bottom: 10px;">
                          <img style="height: 50px;width: 50px;">
                          <span style="text-align: center;">测试标签</span>
                      </li>
                      <li style="list-style: none;margin-bottom: 10px;background-color: chocolate;">
                          <img style="height: 50px;width: 50px;">
                          <span style="text-align: center;">测试标签</span>
                      </li> -->
                  </ul>
                  <div id="spike_charts" style="width: 420px;height: 340px;margin-left: 25px;display: inline-block;"></div>
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
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.1/echarts.min.js" integrity="sha512-vMD/IRB4/cFDdU2MrTwKXOLmIJ1ULs18mzmMIWLCNYg/nZZkCdjBX+UPrtQdkleuuf0YaqXssaKk8ZXOpHo3qg==" crossorigin="anonymous"></script>
  
  <script>
  
  const vscode = acquireVsCodeApi();
  
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
                  if($("#model_convert_progress_div").css("width") !== "100%"){
                      if(log_output_lists.length <= 150){
                          document.getElementById("model_convert_progress_div").style.width = ""+parseInt(log_output_lists.length/150*100)+"%";
                      }
                  }
                  if(log_output_lists.length > 200){
                      if($("#preprocess_progress_div").css("width") !== "100%"){
                          if(log_output_lists.length < 3000){
                              document.getElementById("preprocess_progress_div").style.width = ""+parseInt((log_output_lists.length-200)/2800*100)+"%";
                          }
                      }
                  }
                  if(log_output_lists.length > 3000){
                      if($("#search_progress_div").css("width") !== "100%"){
                          if(log_output_lists.length < 3200){
                              document.getElementById("search_progress_div").style.width = ""+parseInt((log_output_lists.length-3000)/134*100)+"%";
                          }
                      }
                  }
                  if(log_output_lists.length > 3200){
                      if($("#darlang_progress_div") !== "100%"){
                          if(log_output_lists.length < 3230){
                              document.getElementById("darlang_progress_div").style.width = ""+parseInt((log_output_lists.length-3200)/80*100)+"%";
                          }
                      }
                  }
                  if($("#total_progress_div").css("width") !== "100%"){
                      document.getElementById("total_progress_div").style.width = ""+parseInt(log_output_lists.length/3300*100)+"%";
                  }
                }else if(data.exec_finish){
                    // 结束
                    document.getElementById("start_convert_btn").style.backgroundColor = "";
                    document.getElementById("model_convert_progress_div").style.width = "100%";
                    document.getElementById("preprocess_progress_div").style.width = "100%";
                    document.getElementById("search_progress_div").style.width = "100%";
                    document.getElementById("darlang_progress_div").style.width = "100%";
                    document.getElementById("total_progress_div").style.width = "100%";
                    console.log("LINE COUNT all_finish="+log_output_lists.length);
                }else if(data.progress){
                    // 处理进度信息
                    if(data.progress === "convert_finish"){
                        document.getElementById("model_convert_progress_div").style.width = "100%";
                        console.log("LINE COUNT convert_finish="+log_output_lists.length);
                    }else if(data.progress === "preprocess_finish"){
                        document.getElementById("preprocess_progress_div").style.width = "100%";
                        console.log("LINE COUNT preprocess_progress_div="+log_output_lists.length);
                    }else if(data.progress === "search_finish"){
                        document.getElementById("search_progress_div").style.width = "100%";
                        console.log("LINE COUNT search_progress_div="+log_output_lists.length);
                    }
                }else if(data.snn_info){
                    // snn 相关数据
                    const infos = JSON.parse(data.snn_info);
                    var test_img_uls = document.getElementById("sample_imgs_ul");
                    var test_img_uris = infos.spikes.snn_test_imgs;
                    var test_img_spikes = infos.spikes.snn_test_spikes;
                    console.log("spiking img uris[0]"+test_img_uris[0]);
                    console.log("spiking spike infos[0]="+test_img_spikes[0].cls_names);
                    console.log("spike tuples[0]="+test_img_spikes[0].spike_tuples);
  
                    for(let i=0;i<test_img_uris.length;++i){
                      var img_li = document.createElement("li");
                      img_li.id = "img_li_"+i;
                      img_li.style.listStyle = "none";
                      img_li.style.marginBottom = "10px";
                      var img_tag = document.createElement("img");
                      img_tag.id = "sample_img_"+i;
                      img_tag.src = test_img_uris[i];
                      img_tag.style.width = "50px";
                      img_tag.style.height = "50px";
  
                      img_li.appendChild(img_tag);
                      test_img_uls.appendChild(img_li);
  
                      var label_span = document.createElement("span");
                      label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      img_li.appendChild(label_span);
  
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        console.log("reset background color of prev:"+prev_clicked_img_li_id);
                        if(prev_clicked_img_li_id !== undefined){
                            document.getElementById(prev_clicked_img_li_id).style.backgroundColor = "";
                        }
                        console.log("set background color of li: "+ "img_li_"+i);
                        document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_img_li_id = "img_li_"+i;
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        let cls_idx = test_img_spikes[i].spike_tuples[0][0];
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
                        spike_counts[spike_counts.length-1] = curr_count;
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "计数值:";
                        td_child.style.width = "60px";
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "60px";
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          td_child.innerText = test_img_spikes[i].cls_names[j];
                          td_child.style.width = "33px";
                          document.getElementById("out_labels").appendChild(td_child);
                        }
                      }
                    }
                }else if(data.convert_info){
                    const convert_infos = JSON.parse(data.convert_info);
                    $("#total_use_time").text(convert_infos.total_use_time);
                    $("#avg_spike").text(convert_infos.spk_mean);
                    $("#std_spike").text(convert_infos.spk_std);
                    $("#avg_conn_wt").text(convert_infos.wt_mean);
                    $("#std_conn_wt").text(convert_infos.wt_std);
  
                    let bar_chart_label_names = ["ANN转SNN用时", "预处理用时", "参数调优用时", "DarwinLang文件生成用时"];
                    let bar_chart_label_counts = [parseFloat(convert_infos.stage1_time_use), parseFloat(convert_infos.stage2_time_use),
                                  parseFloat(convert_infos.stage3_time_use), parseFloat(convert_infos.stage4_time_use)];
                    display_bar_chart(bar_chart_label_names, bar_chart_label_counts, "","秒","use_time_bar_chart");
                }
            });
  
            $("#start_convert_btn").on("click", ()=>{
                let v_thresh = $("#select_vthresh").val().replace("ms","");
                let neuron_dt = $("#select_dt").val().replace("ms","");
                let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
                let delay = $("#select_delay").val().replace("ms", "");
                let dura = $("#select_dura").val().replace("ms","");
                document.getElementById("start_convert_btn").style.backgroundColor = "chocolate";
                console.log("v_thresh="+v_thresh+", neuron_dt="+neuron_dt+", synapse_dt="+synapse_dt+", delay="+delay);
                vscode.postMessage(JSON.stringify({"model_convert_params":{
                    "vthresh": v_thresh,
                    "neuron_dt": neuron_dt,
                    "synapse_dt":synapse_dt,
                    "delay":delay,
                    "dura":dura
                }}));
                document.getElementById("model_convert_progress_div").style.width = "0%";
                document.getElementById("preprocess_progress_div").style.width = "0%";
                document.getElementById("search_progress_div").style.width = "0%";
                document.getElementById("darlang_progress_div").style.width = "0%";
                document.getElementById("total_progress_div").style.width = "0%";
  
            });
  
        });
  
  
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
                          rotate:18
                      }
                  }
              ],
              yAxis: [
                  {
                      type: 'value',
                      name: '时长(秒)',
                      scale:true,
                      axisLabel: {
                          formatter: '{value}'
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
                              label: {
                                  show: true, //开启显示
                                  position: 'top', //在上方显示
                                  textStyle: { //数值样式
                                      color: 'white',
                                      fontSize: 16
                                  }
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
  
  </html>
  `;
}


export function getSNNSimuPage(){
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
          <div class="col-md-4">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络神经元组信息</div>
              <table id="snn_neurons_table" style="width: 400px;margin-left:10px;">
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
          <div class="col-md-4">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络突触连接信息</div>
              <table id="layer_conns_table" style="width: 420px;margin-left:20px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;">
                      <td style="font-size: medium;font-weight: bold;">layer编号</td>
                      <td style="font-size: medium;font-weight: bold;">连接稠密度</td>
                      <td style="font-size: medium;font-weight: bold;">平均连接个数</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
  
          <div class="col-md-4">
            <div>
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">仿真配置结果评估</div>
              <table id="layer_conns_table" style="width: 360px;margin-left:60px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 30px;">
                    <td style="font-size: medium;font-weight: bold;">膜电压阈值</td>
                    <td id="simulate_vthresh"></td>
                  </tr>
                  <tr style="height: 30px;">
                    <td style="font-size: medium;font-weight: bold;">神经元时间步长</td>
                    <td id="simulate_neuron_dt"></td>
                  </tr>
                  <tr style="height: 30px;">
                    <td style="font-size: medium;font-weight: bold;">突触时间步长</td>
                    <td id="simulate_synapse_dt"></td>
                  </tr>
                  <tr style="height: 30px;">
                    <td  style="font-size: medium;font-weight: bold;">延迟</td>
                    <td id="simulate_delay"></td>
                  </tr>
                  <tr style="height: 30px;">
                    <td style="font-size: medium;font-weight: bold;">仿真时长</td>
                    <td id="simulate_dura"></td>
                  </tr>
                  <tr style="height: 30px;">
                    <td style="font-size: medium;font-weight: bold;">准确率</td>
                    <td id="simulate_acc"></td>
                  </tr>    
              </table>
            </div>
          </div>
      </div>
      <div class="row" style="margin-top: 50px;">
          <!--权重分布图-->
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络权重分布</div>
              <div id="weight_dist_chart" style="width: 640px;height: 320px;margin-left: -35px;margin-top: 80px;"></div>
          </div>
          <div class="col-md-6">
              <div id="model_layers_vis_tab_caption" style="font-size: large;font-weight: bold;text-align: center;">脉冲神经网络输出层脉冲</div>
              <div id="model_layers_vis_tab_caption" style="font-size: small;font-weight: bold;text-align: center;">统计计数</div>
              <table id="spike_out_count_table" style="margin-left: 125px;">
                  <tr id="out_labels">
                  </tr>
                  <tr id="out_counts_tr">
                  </tr>
              </table>
              <ul id="sample_imgs_ul" style="height: 300px;width: 100px;overflow-x: hidden;display: inline-block;">
              </ul>
              <div id="spike_charts" style="width: 420px;height: 340px;margin-left: 25px;display: inline-block;"></div>
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
    let prev_clicked_li = undefined;
    let need_red_img_li = new Array();
  
        $(document).ready(function(){
            window.addEventListener("message", function(evt){
              console.log("SNN 仿真接收到extension 消息");
              need_red_img_li.splice(0);
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
  
                    // 仿真配置与结果表格
                    $("#simulate_vthresh").text(infos.extra_simu_info.simulate_vthresh);
                    $("#simulate_neuron_dt").text(infos.extra_simu_info.simulate_neuron_dt);
                    $("#simulate_synapse_dt").text(infos.extra_simu_info.simulate_synapse_dt);
                    $("#simulate_delay").text(infos.extra_simu_info.simulate_delay);
                    $("#simulate_dura").text(infos.extra_simu_info.simulate_dura);
                    $("#simulate_acc").text(infos.extra_simu_info.simulate_acc);
                    
                    // 绘制脉冲时间序列图
                    // console.log("脉冲数据:"+infos.spikes.cls_names);
                    // display_spike_scatter_chart(infos.spikes.cls_names, infos.spikes.spike_tuples);
                    // function sample_img_click(evt){
                    //   var sampleId = $(evt).attr("id");
                    //   if(sampleId === undefined){
                    //     return;
                    //   }
                    //   console.log("current click sample img_id:" + sampleId);
                    //   var idx = parseInt(sampleId.split("_")[2]);
                    //   display_spike_scatter_chart(infos.spikes.snn_test_spikes[idx].cls_names, infos.spikes.snn_test_spikes[idx].spike_tuples);
                    // }
                    var test_img_uls = document.getElementById("sample_imgs_ul");
                    var test_img_uris = infos.spikes.snn_test_imgs;
                    var test_img_spikes = infos.spikes.snn_test_spikes;
                    console.log("spiking img uris[0]"+test_img_uris[0]);
                    console.log("spiking spike infos[0]="+test_img_spikes[0].cls_names);
                    console.log("spike tuples[0]="+test_img_spikes[0].spike_tuples);
  
                    calc_need_red(test_img_spikes);
  
                    for(let i=0;i<test_img_uris.length;++i){
                      var img_li = document.createElement("li");
                      img_li.style.listStyle = "none";
                      img_li.id = "img_li_"+i;
                      img_li.style.width = "53px";
                      img_li.style.height = "53px";
                      img_li.style.marginBottom = "16px";
                      var img_tag = document.createElement("img");
                      img_tag.id = "sample_img_"+i;
                      img_tag.onclick = function(){
                        console.log("draw NO."+i+" img and spikes");
                        if(prev_clicked_li !== undefined){
                          document.getElementById(prev_clicked_li).style.backgroundColor = "";
                        }
                        document.getElementById("img_li_"+i).style.backgroundColor = "chocolate";
                        prev_clicked_li = "img_li_"+i;
                        display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
                        // display counts in table
                        let cls_idx = test_img_spikes[i].spike_tuples[0][0];
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
                        spike_counts[spike_counts.length-1] = curr_count;
                        document.getElementById("out_labels").innerHTML = "";
                        let td_child = document.createElement("td");
                        td_child.innerText = "标签名称:";
                        td_child.style.width = "60px";
                        document.getElementById("out_labels").appendChild(td_child);
  
                        document.getElementById("out_counts_tr").innerHTML = '';
                        td_child = document.createElement("td");
                        td_child.innerText = "计数值:";
                        td_child.style.width = "60px";
                        document.getElementById("out_counts_tr").appendChild(td_child);
  
                        for(let j=0;j<spike_counts.length;++j){
                          let td_child = document.createElement("td");
                          td_child.innerText = spike_counts[j];
                          td_child.style.width = "33px";
                          document.getElementById("out_counts_tr").appendChild(td_child);
  
                          td_child = document.createElement("td");
                          td_child.innerText = test_img_spikes[i].cls_names[j];
                          td_child.style.width = "33px";
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
                      label_span.innerText = "标签: "+test_img_uris[i].split("_")[5].split(".")[0];
                      img_li.appendChild(label_span);
                    }
  
                    // mark reds
                    for(let i=0;i<need_red_img_li.length;++i){
                      if(prev_clicked_li === need_red_img_li[i]){
                        document.getElementById(need_red_img_li[i]).style.backgroundColor = "yellow";  
                      }else{
                        document.getElementById(need_red_img_li[i]).style.backgroundColor = "red";
                      }
                    }
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
  
        function multiple_argmax(lst){
          tmp_lst = new Array();
          for(let i=0;i<lst.length;++i){
            tmp_lst.push(parseInt(lst[i]));
          }
          tmp_lst.sort((a,b)=>{return a-b;}).reverse()
          if(tmp_lst[0] === tmp_lst[1]){
            return true;
          }else{
            return false;
          }
        }
  
        function calc_need_red(test_img_spikes){
          for(let i=0;i<test_img_spikes.length;++i){
            let cls_idx = test_img_spikes[i].spike_tuples[0][0];
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
            spike_counts[spike_counts.length-1] = curr_count;
            console.log("current check img:"+i+", spike_counts="+spike_counts);
            if(multiple_argmax(spike_counts)){
              need_red_img_li.push("img_li_"+i);
              console.log("img: "+i+" need mark.");
            }
          }
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