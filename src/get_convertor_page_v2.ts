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
        <div class="loading-div">
          <div class="container"  style="margin-left: calc(50vw - 5px);">
            <div class="ispinner ispinner-large">
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
            </div>
          </div>
          <!-- <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i> -->
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);margin-top: -70px;display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
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
                    text-align: right;">训练数据量</font></td>
                  <td id="test_data_amount" style="text-align: right;padding-right: 15px;padding-top: 20px;padding-bottom: 20px;"></td>
                </tr>
                <tr style="border: solid 3px;height: 40px;border-color: #D6D6D6;">
                  <td style="padding-left: 15px;border: solid 2px;border-color: #D6D6D6;padding-top: 20px;padding-bottom: 20px;"><font style="font-family: SourceHanSansCN-Normal;
                    font-size: 16px;
                    color: #333333;
                    text-align: right;">测试数据量</font></td>
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
  
  .container {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 15px;
    box-sizing: border-box;
  }
  .container:last-child {
    padding: 31.5px;
  }
  .container::after {
    position: absolute;
    width: 100px;
    height: 60px;
    left: 0;
    bottom: -30px;
    line-height: 30px;
    text-align: center;
  }
  .container:last-child::after {
    content: 'large';
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
  <link rel="stylesheet" media="all" href="http://localhost:6003/css/ispinner.prefixed.css" />
  
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
        // for(var i=0;i<data_info.test_sample_imgs.length;++i){
        //   for(var j=0;j<data_info.test_sample_imgs[i].hist_gram_bins.length;++j){
        //     if(data_info.test_sample_imgs[i].hist_gram_bins[j] > 0){
        //       data_info.test_sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.test_sample_imgs[i].hist_gram_bins[j]);
        //     }
        //   }
        // }
  
        // for(var i=0;i<data_info.sample_imgs.length;++i){
        //   for(var j=0;j<data_info.sample_imgs[i].hist_gram_bins.length;++j){
        //     if(data_info.sample_imgs[i].hist_gram_bins[j] > 0){
        //       data_info.sample_imgs[i].hist_gram_bins[j] = Math.log10(data_info.sample_imgs[i].hist_gram_bins[j]);
        //     }
        //   }
        // }
  
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
      display_data_bar_chart(data_info.hist_bin_names, data_info.test_sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","像素值","数量", "test_bar_chart_histgram");
    }else{
      display_data_bar_chart(data_info.hist_bin_names, data_info.sample_imgs[sampleIdx].hist_gram_bins, "像素分布", "像素灰度值分布","像素值","数量", "bar_chart_histgram");
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
                    },
                    nameLocation: 'center',
                    nameGap: 30
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
        <div class="loading-div">
          <div class="container"  style="margin-left: calc(50vw - 5px);">
            <div class="ispinner ispinner-large">
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
              <div class="ispinner-blade"></div>
            </div>
          </div>
          <!-- <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i> -->
          <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);margin-top: -70px;display: block;"><font style="color: #333;font-weight: bolder;">模型信息加载中...</font></span>
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
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">层数</td>
                    <td id="model_total_layers" style="padding-left: 10px;font-family: SourceHanSansCN-Heavy;
                    font-size: 14px;
                    color: #4D4D4D;text-align: right;padding-right: 15px;padding-top: 8px; padding-bottom: 8px;"></td>
                  </tr>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px; border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 14px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">参数数量</td>
                    <td id="model_total_param" style="padding-left: 10px;font-family: SourceHanSansCN-Heavy;
                    font-size: 14px;
                    color: #4D4D4D;text-align: right;padding-right: 15px;padding-top: 8px; padding-bottom: 8px;"></td>
                  </tr>
                  <tr style="border: solid 3px;border-color: #D6D6D6;">
                    <td style="padding-left: 15px; border: solid 2px;border-color: #D6D6D6;font-family: SourceHanSansCN-Normal;
                    font-size: 14px;
                    color: #333333;
                    text-align: left;padding-top: 8px; padding-bottom: 8px;">神经元数量</td>
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
                  <div class="col-md-12" style="height: 400px;overflow-y: auto;">
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
                </div>
              </div>
  
            </div>
  
            <!--模型各层的可视化-->
            <div style="width: 100%;margin-top: 12px;">
              <div id="model_layers_vis" style="background: rgba(238,238,238,0.4);display: inline-block;width: 700px;height: 400px;">
                <div id="model_layers_vis_tab_caption" style="text-align: center;font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">卷积输出可视化</div>
                <!--动态创建-->
                <div id="layers_vis_div" class="row" style="width: 620px;margin-left: 40px;margin-top: 40px;margin-bottom: 0px; margin-right: 40px;padding: 0px;background: rgb(238,238,238);color: #333;border: 2px solid #333;height: 58px;border-color: #D6D6D6;">
                  <div class="col-md-3" style="border-right: 2px solid #333;height: 56px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">layer 名称</div>
                  <!-- <div class="col-md-3" style="border-right: 2px solid #333;height: 56px;border-color: #D6D6D6;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">layer 编号</div> -->
                  <div class="col-md-9" style="height: 56px;font-family: SourceHanSansCN-Regular;
                  font-size: 16px;
                  color: #666666;text-align: center;vertical-align: middle;padding-top: 20px;">特征图</div>
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
  
  .container {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 15px;
    box-sizing: border-box;
  }
  .container:last-child {
    padding: 31.5px;
  }
  .container::after {
    position: absolute;
    width: 100px;
    height: 60px;
    left: 0;
    bottom: -30px;
    line-height: 30px;
    text-align: center;
  }
  .container:last-child::after {
    content: 'large';
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
  <link rel="stylesheet" media="all" href="http://localhost:6003/css/ispinner.prefixed.css" />
  
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
              $("#model_total_param").text(model_general_info.total_params);;
              $("#model_total_units").text(model_general_info.total_units);
            }else if(data.model_detail_info){
              var detail_info = JSON.parse(data.model_detail_info);
              var table = document.getElementById("model_detail_table");
              var layer_uniq_names = new Array(); // layer 名称列表 layername+index
              var layer_params_info = new Array(); // <name, value> 各layer的参数量
              var layer_params_list = new Array();
              var total_params=0;
  
              let total_layer_count = 0;
              for (var i=0;i < detail_info.length;++i) {
                if(detail_info[i].name === 'BatchNormalization' || detail_info[i].name === 'Activation' || detail_info[i].name === 'Dropout' || detail_info[i].name === 'InputLayer') {
                  continue;
                }
                ++total_layer_count;
              }
              $("#model_total_layers").text(total_layer_count);
  
              var layer_idx = 0;
              for(var i=0;i<detail_info.length;++i){
                if (detail_info[i].name !== "Conv2D" && detail_info[i].name !== "InputLayer" && detail_info[i].name !== "AveragePooling2D" &&
                    detail_info[i].name !== "MaxPooling2D" && detail_info[i].name !== "Dense") {
                      continue;
                  }
                  layer_idx += 1
                  var line = document.createElement("tr");
                  line.style.border = "solid 3px";
                  line.style.height = "45px";
                  line.style.borderColor ="#D6D6D6";
                  var col_name = document.createElement("td");
                  col_name.style = "padding-left: 15px;border: solid 2px;border-color: #D6D6D6;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_name.innerText = detail_info[i].name+"_"+layer_idx
                  var col_shape = document.createElement("td");
                  col_shape.style = "border: solid 2px;border-color: #D6D6D6;text-align: right; padding-right:15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_shape.innerText = '('+detail_info[i].shape+')';
                  var col_params = document.createElement("td");
                  col_params.style = "border: solid 2px;border-color: #D6D6D6;text-align: right; padding-right:15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 15px; padding-bottom: 15px;";
                  col_params.innerText = detail_info[i].params;
                  
                  if( parseInt(detail_info[i].params, 10) > 0){
                    layer_uniq_names.push(detail_info[i].name+"_"+layer_idx);
                    layer_params_info.push({"name": detail_info[i].name+"_"+layer_idx, "value": parseInt(detail_info[i].params, 10)});
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
              // for(var i=0;i<layer_params_list.length;++i){
              //   layer_params_list[i] = Math.log10(layer_params_list[i]);
              // }
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
                  layer_name_div.innerText = layer_name+"_"+layer_idx;
                  img_div.appendChild(layer_name_div);
  
                  // var layer_index_div = document.createElement("div");
                  // layer_index_div.style = "border-right: 2px solid #333;height: 58px;border-color: #D6D6D6;text-align: right; padding-right: 15px;font-family: ArialMT;font-size: 12px;color: #333333;padding-top: 20px;";
                  // layer_index_div.setAttribute("class", "col-md-3");
  
                  // layer_index_div.innerText = layer_idx;
                  // img_div.append(layer_index_div);
  
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
                      layer_img_tag.style.marginLeft = "15%";
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
                    name:"层",
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
                  type: 'log',
                  min:1,
                  logBase:10,
                    scale:true,
                    name:"参数数量",
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
                  type: 'log',
                  min: 1,
                  logBase: 10,
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
                      name: '参数量(10^n)',
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

export function getConvertorPageV2(){
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
    
    <button id="modal_dialog_import_files" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModalImportFiles" style="display: none;">
      导入文件
    </button>
    <!-- 模态框（Modal） -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white; width: 747px">
        <div class="modal-content" style="width: 747px; height: 498px; background-color: white;border-radius: 15px;">
          <div style="background: #EEEEEE; height: 60px; border-top-right-radius: 15px; border-top-left-radius: 15px;">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);
            margin-right: 30px;
            width: 30px;
            height: 30px;
            margin-top: 9px;
            padding-top: 15px;
            ">
              &times;
            </button>
            <div id="myModalLabel" style="font-family: SourceHanSansCN-Medium;
            font-size: 24px;
            color: #333333;
            font-weight: bold;
            letter-spacing: 1.26px;padding-left: 29px;padding-top: 15px;
          ">
              项目创建向导
            </div>
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
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 200px;">项目名称: </label>
                            <input type="text" id="project_name" style="background: white; 
                            border: 1px solid #D9D9D9;
                            border-radius: 6px;
                            border-radius: 6px;width: 478px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                        </div>
                        <div id="project_name_error">
                            <p id="project_name_error_id" style="font-family: SourceHanSansCN-Normal;
                            font-size: 18px;
                            color: #EC7760;
                            margin-left: 204px;
                            margin-bottom: 2px;
                            letter-spacing: 1.15px;
                            display: none;
                            ">
                                项目名称不可为空
                            </p>
                        </div>
                        <div style="margin-top: 20px;">
                            <label for="select_type" style="font-family: SourceHanSansCN-Normal;
                            font-size: 22px;
                            color: #333333;
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 200px;">项目类别: </label>
                            <select id="select_type" style="background: white;
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
                                <option>疲劳检测</option>
                            </select>
                        </div>
                        <div style="margin-top: 20px;">
                          <label for="proj_save_path_input"  style="font-family: SourceHanSansCN-Normal;
                          font-size: 22px;
                          color: #333333;
                          letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 200px;">项目路径: </label>
                          <input type="text" id="proj_save_path_input" style="background: white;
                          border: 1px solid #D9D9D9;
                          border-radius: 6px;
                          border-radius: 6px;width: 380px;font-family: PingFangSC-Regular;
    font-size: 22px;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;">
                        <button id="span_save_path" type="button" class="btn btn-default" style="background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                        border-radius: 6px;width: 80px;margin-left: 15px;"><span style="color: white;">浏览...</span></button>
                        <p id="proj_save_path_error_id" style="font-family: SourceHanSansCN-Normal;
                          font-size: 18px;
                          color:  #EC7760;
                          margin-left: 204px;
                          margin-bottom: 2px;
                          letter-spacing: 1.15px;
                          height: 20px;
                          display: none;">项目路径不可为空</p>
                      </div>
    
                    </form>
          </div>
          <div style="margin-top: 40px;margin-bottom: 40px;">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss" style="background: #F3F3F3;
            border: 1px solid #D7D7D7;
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 200px;">关闭
            </button>
            <button type="button" class="btn btn-primary" onclick="checkoutCreateProjectAction()" id="create" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
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
            font-weight: bold;
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
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 180px;">项目名称: </label>
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
                            letter-spacing: 1.26px;padding-right: 5px;text-align: right;width: 180px;">项目类别: </label>
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
                                <option>疲劳检测</option>
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
    
    
    
    
    <!--导入数据与模型文件-->
    <div class="modal fade" id="myModalImportFiles" tabindex="-1" role="dialog" aria-labelledby="myModalLabelImportFiles" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;width: 800px;">
        <div class="modal-content" style="background-color: white;">
          <div style="background: #EEEEEE;padding: 15px;">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);margin-right: 30px;">
              &times;
            </button>
            <h4 id="myModalLabelImportFiles" style="font-family: SourceHanSansCN-Medium;
            font-size: 20px;
            color: #333333;
            letter-spacing: 0.89px;">
              导入文件
            </h4>
          </div>
          <div class="modal-body">
                    <form role="form" id="project_info_form_import_files">
                      <div style="margin-top: 20px;margin-left: 100px;">
                        <label for="import_files_xnorm"><font  style="font-family: SourceHanSansCN-Normal;
                          font-size: 20px;
                          color: #333333;
                          letter-spacing: 1.14px;font-weight: normal;">训练数据: </font></label>
                        <input type="text" id="import_files_xnorm" style="background: #FFFFFF;
                        border: 1px solid #C0C0C0;
                        border-radius: 6px;
                        border-radius: 6px;">
                        <button id="span_import_xnorm" type="button" class="btn btn-default" style="background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                        border-radius: 6px;
                        border-radius: 6px;"><span style="font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 1.14px;">浏览...</span></button>
                      </div>
    
                      <div style="margin-top: 20px;margin-left: 100px;">
                        <label for="import_files_xtest"><font  style="font-family: SourceHanSansCN-Normal;
                          font-size: 20px;
                          color: #333333;
                          letter-spacing: 1.14px;font-weight: normal;">测试数据: </font></label>
                        <input type="text" id="import_files_xtest" style="background: #FFFFFF;
                        border: 1px solid #C0C0C0;
                        border-radius: 6px;
                        border-radius: 6px;">
                        <button id="span_import_xtest" type="button" class="btn btn-default" style="background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                        border-radius: 6px;
                        border-radius: 6px;"><span style="font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 1.14px;">浏览...</span></button>
                      </div>
    
                      <div style="margin-top: 20px;margin-left: 60px;">
                        <label for="import_files_ytest"><font  style="font-family: SourceHanSansCN-Normal;
                          font-size: 20px;
                          color: #333333;
                          letter-spacing: 1.14px;font-weight: normal;">测试数据标签: </font></label>
                        <input type="text" id="import_files_ytest" style="background: #FFFFFF;
                        border: 1px solid #C0C0C0;
                        border-radius: 6px;
                        border-radius: 6px;">
                        <button id="span_import_ytest" type="button" class="btn btn-default" style="background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                        border-radius: 6px;
                        border-radius: 6px;"><span style="font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 1.14px;">浏览...</span></button>
                      </div>
    
                      <div style="margin-top: 20px;margin-left: 95px;">
                        <label for="import_files_ann"><font  style="font-family: SourceHanSansCN-Normal;
                          font-size: 20px;
                          color: #333333;
                          letter-spacing: 1.14px;font-weight: normal;">ANN模型: </font></label>
                        <input type="text" id="import_files_ann" style="background: #FFFFFF;
                        border: 1px solid #C0C0C0;
                        border-radius: 6px;
                        border-radius: 6px;">
                        <button id="span_import_ann" type="button" class="btn btn-default" style="background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                        border-radius: 6px;
                        border-radius: 6px;"><span style="font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 1.14px;">浏览...</span></button>
                      </div>
                    </form>
          </div>
          <div style="margin-top: 40px;margin-bottom: 40px;">
            <button type="button" class="btn btn-default" data-dismiss="modal" id="dismiss_importFiles" style="background: #F3F3F3;
            border: 1px solid #D7D7D7;
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 200px;">取消
            </button>
            <button type="button" class="btn btn-primary" id="create_importFiles" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
            border-radius: 2px;
            border-radius: 2px;width: 140px;margin-left: 60px;">确认
            </button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal -->
    </div>
    
    
    <!-- 背景主界面 -->
    <div id="login" class="login_body_bg">
      <div style="line-height: normal;margin: auto;">
          <!-- <img src="http://127.0.0.1:6003/src/img/zhijiang-logo.png" alt="zhejiang lab" style="vertical-align: middle;"/>
          <span style="vertical-align: middle;color: #333;margin-left: 100px;">达尔文类脑应用集成开发环境</span>
          <img src="http://127.0.0.1:6003/src/img/zheda-logo.png" alt="zhejiang university" style="vertical-align: middle;margin-left: 100px;"/> -->
      </div>
    
    </div>
    
    
    
    <div class="modal fade" id="myModal_show_error" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_show_error" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;width: 800px;">
        <div class="modal-content" style="height: 495px; width: 560px; background-color: white;border-radius: 15px;">
          <div style="height: 70px; margin-top: -10px; background: #EEEEEE;border-top-right-radius: 15px; border-top-left-radius: 15px">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);
            padding-right: 30px;
            padding-top: 25px;
            ">
              &times;
            </button>
            <h4 id="myModalLabel_show_error" style="font-family: SourceHanSansCN-Medium;
            font-size: 20px;
            color: #666666;
            letter-spacing: 0.89px;padding-left: 20px;padding-top: 20px;">
              警告
            </h4>
          </div>
          <div class="modal-body">
            <div id="loading_anim" style="display: none;" class="container">
              <div class="ispinner ispinner-large" style="margin-left: 300px;margin-top: 100px;">
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
                <div class="ispinner-blade"></div>
              </div>
            </div>
            <div align="center" style="height: 150px; padding-top: 60px;" ><img src="http://127.0.0.1:6003/src/img/warning.png" height=96px; width=96px; alt="警告"></div>
            <div style="margin-top: 50px; width: 500px; height: 30px;">
              <div id="error_detail" for="project_name_projrefac" style="font-family: SourceHanSansCN-Bold;font-size: 28px;color: #666666;letter-spacing: 1.25px; text-align: center;padding-left: 50px;">错误信息</div>
            </div>
          </div>
          <div style="margin-top: 40px;">
            <button id="close_modal_btn" type="button" class="btn btn-primary" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
            border-radius: 2px;
            margin-left: 210px;width: 150px;height: 50px; text-align: center;display: inline-block;" data-dismiss="modal">关闭
            </button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal -->
    </div>
    
    <button id="alert_modal_btn" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal_show_error" style="display: none;"></button>
    
    </body>
    <style>
    
    .login_body_bg {
      text-align: center;
    }
    
    .login_body_bg::after {
        content: "";
        background: url("http://127.0.0.1:6003/src/img/zhijiang.png");
        opacity: 1;
        top: 25px;
        left: 25px;
        bottom: 25px;
        right: 25px;
        position: absolute;
        z-index: -1;
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }
    
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
    
    .container {
      position: relative;
      display: inline-block;
      width: 100px;
      height: 100px;
      margin: 15px;
      box-sizing: border-box;
    }
    .container:last-child {
      padding: 31.5px;
    }
    .container::after {
      position: absolute;
      width: 100px;
      height: 60px;
      left: 0;
      bottom: -30px;
      line-height: 30px;
      text-align: center;
    }
    .container:last-child::after {
      content: 'large';
    }
    
    </style>
    
    <!-- <link rel="stylesheet" href="http://localhost:6003/css/bootstrap.min.css">
    <script src="http://localhost:6003/js/jquery.min.js"></script>
    <script src="http://localhost:6003/js/bootstrap.min.js"></script> -->
    <link rel="stylesheet" media="all" href="http://localhost:6003/css/ispinner.prefixed.css" />
    
    <script>
    
        const vscode = acquireVsCodeApi();
        $(document).ready(function(){
          $("#close_modal_btn").on("click", ()=>{
            $("#error_detail").css("height", "300px");
            $("#error_detail").css("width", "700px");
          });
          window.addEventListener("message", (event)=>{
            const data = JSON.parse(event.data);
            if (data.show_error) {
              console.log("接收到show_error 消息："+data.show_error);
              $("#error_detail").html(data.show_error);
              if (data.display_loading) {
                $("#loading_anim").css("display", "block");
                // $("#error_detail").css("color", "#000000");
                // $("#myModalLabel_show_error").css("color", "#000000");
                $("#myModalLabel_show_error").text("提示");
                $("#alert_modal_btn").click();
                console.log("alert_modal_btn click.");
              } else if(data.hide) {
                $("#close_modal_btn").click();
                console.log("close modal btn click.");
              } else {
                $("#error_detail").css("height", "30px");
                $("#error_detail").css("width", "500px");
                $("#loading_anim").css("display", "none");
                // $("#error_detail").css("color", "#f87307");
                // $("#myModalLabel_show_error").css("color", "#ee1414");
                if (data.is_error) {
                    $("#myModalLabel_show_error").text("错误提示");
                }
              }
              $("#alert_modal_btn").click();
            } else if (data.import_files) {
              // 导入数据与模型文件
              $("#modal_dialog_import_files").click();
            } else if (data.ftarget === "xnorm")  {
              $("#import_files_xnorm").val(data.path);
            } else if (data.ftarget === "xtest") {
              $("#import_files_xtest").val(data.path);
            } else if (data.ftarget === "ytest") {
              $("#import_files_ytest").val(data.path);
            } else if (data.ftarget === "ann") {
              $("#import_files_ann").val(data.path);
            }
          });
          $("#span_import_xnorm").on("click", ()=>{
            vscode.postMessage(JSON.stringify({"import_choose_path":"yes", "import_ftarget":"xnorm"}));
          });
          $("#span_import_xtest").on("click", ()=>{
            vscode.postMessage(JSON.stringify({"import_choose_path":"yes", "import_ftarget":"xtest"}));
          });
    
          $("#span_import_ytest").on("click", ()=>{
            vscode.postMessage(JSON.stringify({"import_choose_path":"yes", "import_ftarget":"ytest"}));
          });
    
          $("#span_import_ann").on("click", ()=>{
            vscode.postMessage(JSON.stringify({"import_choose_path":"yes", "import_ftarget":"ann"}));
          });
    
          $("#create_importFiles").on("click", ()=>{
            vscode.postMessage(JSON.stringify({
              "choose_import_file_paths": {
                "xnorm": $("#import_files_xnorm").val(),
                "xtest": $("#import_files_xtest").val(),
                "ytest": $("#import_files_ytest").val(),
                "ann": $("#import_files_ann").val()
              }
            }));
            $("#dismiss_importFiles").click();
          });
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
                document.getElementById("project_name_error_id").style.display="none";
                document.getElementById("proj_save_path_error_id").style.display="none";
                
                console.log("创建xxx");
                // 字段检查
                if($("#project_name").val() === undefined || $("#project_name").val().toString().trim().length === 0 ||
                    $("#project_name").val() === ""
                ){
                  document.getElementById("project_name_error_id").style.display="block";
                  return;
                }else if($("#project_name").val().toString().trim().length > 20){
                  document.getElementById("project_name_error_id").value="项目名称不可超过20个字符";
                  document.getElementById("project_name_error_id").style.display="block";
                  return;
                }else if($("#project_name").val().toString().trim().search("[\~\!\！\@\#\$\￥\%\<\>\》\《\.\?\？]") >=0){
                  document.getElementById("project_name_error_id").value="项目名称不可包含特殊字符";
                  document.getElementById("project_name_error_id").style.display="block";
                  return;
                }
    
                if($("#proj_save_path_input").val().toString().trim().length === 0
                  || $("#proj_save_path_input").val() === ""){
                  document.getElementById("proj_save_path_error_id").style.display="block";
                  return;
                }
    
                var project_name = $("#project_name").val();
                var project_type = $("#select_type").val();
                // 发送到extension
                vscode.postMessage(JSON.stringify({"project_info":{
                  "project_name":project_name, "project_type":project_type
                }}));
                $("#dismiss").click();
            });
            $("#dismiss").on("click", function(){
                document.getElementById("project_name").value = "";
                document.getElementById("proj_save_path_input").value= "";
                
                document.getElementById("project_name_error_id").style.display="none";
                document.getElementById("proj_save_path_error_id").style.display="none";
                console.log("取消创建");
            });
    
            $("#create_projrefac").on("click", function(){
              console.log("修改项目属性");
              var proj_name = $("#project_name_projrefac").val();
              var proj_type = $("#select_type_refac").val();
    
              // 发送到extension
              vscode.postMessage(JSON.stringify({"project_refac_info":{
                "project_name":proj_name, "project_type":proj_type
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


export function getANNSNNConvertPage(){
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
              letter-spacing: 0.91px;">等待转换...</font></span>
      </div>
  
      <div class="loading-div" id="loader_tb" style="position: absolute;top: 400px;left: 740px;background: rgba(238,238,238);width: 760px;height: 500px;z-index: 2;">
          <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="margin-top: 200px;color: #333;"></i>
          <span style="color: #333;height: 50px;width: 120px;display: block;"><font style="margin-left: 300px;font-family: SourceHanSansCN-Normal;
              font-size: 16px;
              color: #333333;
              letter-spacing: 0.91px;">等待转换...</font></span>
      </div>
  
      <div style="height: 140px;background: rgba(238,238,238,0.4);width: 1500px;">
          <div class="col-md-12">
              <div style="text-align: center;margin-left: -60px;"><font style="font-family: SourceHanSansCN-Normal;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 1.14px;">转换参数配置</font></div>
              <form role="form" class="row" style="margin-left: 80px;margin-top: 15px;" id="project_info_form">
                  <div class="col-md-2" style="text-align: center;margin-left: -60px;">
                      <div><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">脉冲发放阈值</font></div>
                          <input type="text" id="select_vthresh" style="background: #ffffff;
                          border: 1px solid #D9D9D9;
                          border-radius: 6px;
                          border-radius: 6px;width: 200px;font-family: PingFangSC-Regular;
                          font-size: 12px;
                          padding-top: 10px;
                          padding-bottom: 10px;
                          padding-left: 20px;
                          color: #000000;
                          letter-spacing: 0;
                          line-height: 14px;margin-top: 5px;">
                  </div>
                  <div class="col-md-2" style="margin-left: 330px;text-align: center;">
                      <label for="select_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">神经元与突触dt</font></label>
                      <select class="form-control" id="select_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 130px;text-align: center;display: none;">
                      <label for="select_synapse_dt"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">突触dt</font></label>
                      <select class="form-control" id="select_synapse_dt">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div style="margin-left: 28px;text-align: center;display: none;">
                      <label for="select_delay"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">delay</font></label>
                      <select class="form-control" id="select_delay">
                          <option>1ms</option>
                          <option>0.1ms</option>
                      </select>
                  </div>
      
                  <div class="col-md-2" style="margin-left: 300px;text-align: center;">
                      <div for="select_dura"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                          font-size: 16px;
                          color: #333333;
                          letter-spacing: 0.91px;">模拟时长(ms)</font></div>
                              <input type="text" id="select_dura" style="background: #ffffff;
                              border: 1px solid #D9D9D9;
                              border-radius: 6px;
                              border-radius: 6px;width: 200px;font-family: PingFangSC-Regular;
                              font-size: 12px;
                              padding-top: 10px;
                              padding-bottom: 10px;
                              padding-left: 20px;
                              color: #000000;
                              letter-spacing: 0;
                              line-height: 14px;margin-top: 5px;">
                      <!-- <select class="form-control" id="select_dura">
                          <option>100ms</option>
                      </select> -->
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
    border-radius: 20px;">1</div>调整网络结构</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 30px;height: 40px;margin-top: 10px;">
                          <div id="model_convert_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 30px;
                               border-radius: 30px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: 20px;">
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
    border-radius: 20px;">2</div>权重归一化<span id="self_def_preprocess_alg" style="text-decoration: underline;color: #77A4FF;cursor: pointer;">(自定义实现)</span></div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 30px;height: 40px;margin-top: 10px;">
                          <div id="preprocess_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 30px;
                               border-radius: 30px;">
                          </div>
                      </div>
                  </div>
  
                  <div class="col-md-1" style="margin-top: 20px;">
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
    border-radius: 20px;">3</div>量化<span id="self_def_opt_alg" style="text-decoration: underline;color: #77A4FF;cursor: pointer;">(自定义实现)</span></div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 30px;height: 40px;margin-top: 10px;">
                          <div id="search_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 30px;
                               border-radius: 30px;">
                          </div>
                      </div>
                  </div>
              
                  <div class="col-md-1" style="margin-top: 20px;">
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
    border-radius: 20px;">4</div>SNN验证</div>
                      <div class="progress" style="background: #E6E6E6;
                      border-radius: 30px;height: 40px;margin-top: 10px;">
                          <div id="darlang_progress_div" class="progress-bar progress-bar-info" role="progressbar"
                               aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                               style="width: 0%; opacity: 0.7;
                               background-image: -webkit-linear-gradient(180deg, #A5CBFF 0%, #77A4FF 100%);
                               border-radius: 30px;
                               border-radius: 30px;">
                          </div>
                      </div>
                  </div>
              </div>
          
              <!-- <div class="row"> -->
                  <!-- <span>启动</span> -->
                  <!-- <i id="start_convert_btn" class="large material-icons" style="margin-left: 0px;cursor: pointer;">play_circle_outline</i> -->
                  <!-- <div class="progress" style="width: 85%;display: inline-block;margin-bottom: 0;margin-left: 60px;background: #E6E6E6;
                  border-radius: 15px;">
                      <div id="total_progress_div" class="progress-bar progress-bar-success" role="progressbar"
                           aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"
                           style="width: 0%; opacity: 0.76;
                           background-image: linear-gradient(180deg, #AED77C 0%, #8FB740 100%);
                           border-radius: 15px;">
                      </div>
                  </div>
              </div> -->
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
                      letter-spacing: 1.14px;">转换各阶段用时</font></div>
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
                          color: #666666;">调整网络结构耗时(秒)</td>
                          <td id="stage1_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">权重归一化耗时(秒)</td>
                          <td id="stage2_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">量化耗时(秒)</td>
                          <td id="stage3_time_use" style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;text-align: right;padding-left: 80px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">xxx</td>
                      </tr>
                      <tr>
                          <td style="border: solid 2px #D6D6D6;padding-top: 10px;padding-bottom: 10px;padding-left: 15px;font-family: SourceHanSansCN-Medium;
                          font-size: 14px;
                          color: #666666;">SNN验证耗时(秒)</td>
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
  
  <div class="modal fade" id="myModal_select_alg" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_select_alg" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;width: 800px;">
          <div class="modal-content" style="background-color: white;">
              <div style="background: #EEEEEE;padding: 10px;">
                  <button id="select_alg_modal_close" type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);
                  margin-right: 30px;margin-top: 10px;font-size: 40px;">
                      &times;
                  </button>
                  <h4 id="myModalLabel_select_alg" style="font-family: SourceHanSansCN-Medium;
                  font-size: 20px;
                  color: #333333;
                  letter-spacing: 0.89px;padding-top: 15px;padding-left: 20px;">
                      选择调用算法
                  </h4>
              </div>
              <div class="modal-body">
          <div style="margin-top: 30px;display: inline-block; width: 50%;">
              <div style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;margin-left: 40px;">预处理步骤：</div>
              <div class="radio" style="margin-top: 30px;margin-left: 80px;">
                  <label>
                      <input type="radio" name="alg_call_radios" id="default_alg" value="default_alg" checked> <span style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">默认算法</span>
                  </label>
              </div>
              <div class="radio" style="margin-top: 30px;margin-left: 80px;">
                  <label>
                      <input type="radio" name="alg_call_radios" id="self_alg" value="self_alg"> <span style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">自定义算法</span>
                  </label>
              </div>
          </div>
          <div style="margin-top: 30px;display: inline-block;width: 50%;">
              <div style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;margin-left: 40px;">参数调优步骤：</div>
              <div class="radio" style="margin-top: 30px;margin-left: 80px;">
                  <label>
                      <input type="radio" name="opt_alg_call_radios" id="default_opt_alg" value="default_opt_alg" checked> <span style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">默认算法</span>
                  </label>
              </div>
              <div class="radio" style="margin-top: 30px;margin-left: 80px;">
                  <label>
                      <input type="radio" name="opt_alg_call_radios" id="self_opt_alg" value="self_opt_alg"> <span style="font-family: SourceHanSansCN-Normal;
                      font-size: 20px;
                      color: #333333;
                      letter-spacing: 1.14px;">自定义算法</span>
                  </label>
              </div>
          </div>
              </div>
              <div style="margin-top: 40px;margin-bottom: 40px;">
                  <button  id="check_alg_select_btn" type="button" class="btn btn-primary" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
                  border-radius: 6px;
                  border-radius: 6px;width: 150px;height: 50px;margin-left: calc(40%);" data-dismiss="modal">确认
                  </button>
              </div>
          </div><!-- /.modal-content -->
      </div><!-- /.modal -->
  </div>
  
  <button id="select_alg_modal_btn" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal_select_alg" style="display: none;"></button>
  
  <!-- 错误信息弹窗 -->
  <div class="modal fade" id="myModal_exec_error" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_exec_error" aria-hidden="true" style="background-color: white;color: #333;">
      <div class="modal-dialog" style="background-color: white;width: 800px;">
          <div class="modal-content" style="background-color: white;">
              <div>
                  <button id="exec_error_modal_close" type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);margin-right: 30px;">
                      &times;
                  </button>
                  <h4 id="myModalLabel_exec_error" style="font-family: SourceHanSansCN-Normal;
          font-size: 24px;
          font-weight: bold;
          color: rgb(252, 101, 101);
          letter-spacing: 1.07px;margin-left: 20px;">
                      转换代码执行错误
                  </h4>
              </div>
              <div id="error_msg_div" class="modal-body" style="overflow:scroll;white-space: pre-line;height: 400px;">
              </div>
              <div style="margin-top: 40px;margin-bottom: 40px;">
                  <button  id="exec_error_btn" type="button" class="btn btn-primary" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
          border-radius: 2px;
          border-radius: 2px;width: 100%;margin: auto;text-align: center;display: inline-block;" data-dismiss="modal">确认
                  </button>
              </div>
          </div><!-- /.modal-content -->
      </div><!-- /.modal -->
  </div>
  
  <button id="exec_error_modal_btn" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal_exec_error" style="display: none;"></button>
  
  <!-- 总进度提示 -->
  <!-- <div id="total_progress_ball" class="box" style="display: none;position: fixed;left: calc(50vw - 100px);">
      <svg class="wave" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 200 210">
        <defs>
          <path id="wave-shape" stroke="rgba(255,255,255,.8)" stroke-width=".5" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 58-18 88-18 58 18 88 18 v185h-528z"></path>
        </defs>
        <g class="parallax">
          <use xlink:href="#wave-shape" x="50" y="0" fill="url(#linear)"></use>
          <use xlink:href="#wave-shape" x="50" y="3" fill="url(#linear)"></use>
          <use xlink:href="#wave-shape" x="50" y="6" fill="url(#linear)"></use>
        </g>
        <defs>
          <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(90)">
            <stop offset="30%"   stop-color="#304CA6" stop-opacity="0.2" />
          </linearGradient>
        </defs>
        <text id="total_progress_text" x="90" y="30"
          font-family="SimHei"
          font-size="20px"
          margin-top="30px"
          margin-left="100px"
          stroke="#304CA6">
          0%
      </text>
      </svg>
  </div> -->
  <div id="total_progress_ball" class="pie" style="display: none;">
  </div>
  
  
  <div class="modal fade" id="myModal_show_error" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_show_error" aria-hidden="true" style="background-color: white;color: #333;">
    <div class="modal-dialog" style="background-color: white;width: 800px;">
      <div class="modal-content" style="background-color: white;">
        <div>
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="color: rgb(0, 0, 0);margin-right: 30px;">
            &times;
          </button>
          <h4 id="myModalLabel_show_error" style="font-family: SourceHanSansCN-Normal;
          font-size: 24px;
          font-weight: bold;
          color: #ee1414;
          letter-spacing: 1.07px;margin-left: 20px;">
            警告
          </h4>
        </div>
        <div class="modal-body">
          <div style="margin-top: 50px;">
            <span id="error_detail" for="project_name_projrefac" style="font-family: SourceHanSansCN-Normal;
            font-size: 22px;
            color: #f87307;
            letter-spacing: 1.26px;margin: auto;text-align: center;width: 100%;display: inline-block;">错误信息</span>
          </div>
        </div>
        <div style="margin-top: 40px;margin-bottom: 40px;">
          <button type="button" class="btn btn-primary" style="background-image: linear-gradient(180deg, #AFD1FF 0%, #77A4FF 100%);
          border-radius: 2px;
          border-radius: 2px;width: 100%;margin: auto;text-align: center;display: inline-block;" data-dismiss="modal">关闭
          </button>
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal -->
  </div>
  
  <button id="alert_modal_btn" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#myModal_show_error" style="display: none;"></button>
  
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
  
  *{
        margin:0;
      }
      .box{
        width: 200px;
        height: 200px;
        left: 40%;
        top: 50%;
        /* margin: 50px auto; */
        background-image: linear-gradient(-180deg, rgba(255,255,255,0.00) 0%, rgba(87, 178, 231, 0.96) 68%);
        border-radius: 100%;
        overflow: hidden;
        position: absolute;
        z-index: 3;
      }
      .box:before{
        content: '';
        width: 180px;
        height: 180px;
        background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(87, 178, 231, 0.96) 68%);
        border-radius: 100%;
        position: absolute;
        left: 10px;
        top: 10px;
      }
      .box:after{
        content: '';
        width: 160px;
        height: 160px;
        background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(87, 178, 231, 1) 50%);
        border-radius: 100%;
        position: absolute;
        left: 20px;
        top: 20px;
      }
      .wave{
        margin-top: 0px;
        width: 100%;
        height: 560px; /*560px progress 0, 200 progress 100*/
        position: relative;
        overflow: hidden;
        z-index: 4;
      }
      .parallax>use {
        animation: wave-move 1s linear infinite;
        animation-duration: .9s;
      }
      .parallax>use:nth-child(1) {
        animation-delay: -.1s;
      }
      .parallax>use:nth-child(2) {
        animation-delay: -.5s;
      }
      .parallax>use:nth-child(3) {
        animation-delay: -.8s;
      }
      @keyframes wave-move {
        0% {
          transform: translate(90px,0);
        }
        100% {
          transform: translate(-85px,0);
        }
      }
  
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
  
  .pie {
      display: flex;
      width: 15vw;
      height: 15vw;
      position: absolute;
      opacity: 60%;
      margin-left: 540px;
      margin-top: -600px;
      z-index: 9;
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
  
  let error_occurred = false;
  
  let log_output_lists = new Array();
  
  let prev_clicked_img_li_id=undefined;
  var process_pie_option = {
      // backgroundColor: '#2F4056',//背景颜色
      title: {
          text: '',//圆环中间显示的数值单位
          subtext: '',//圆环数值单位下面的描述文字
          x: 'center',
          y: 'center',
          itemGap: 15,//描述文字与上面数值单位的垂直距离
          textStyle: {
              color: '#666666',
              fontSize: 16,
          },
          subtextStyle: {
              color: 'rgba(255,255,255,0.7)',
              fontSize: 16,
          }
      },
      tooltip: {//提示框浮层属性
          show: true,
          transitionDuration: 0.8,
          formatter: "{a} - {c}%"//提示框浮层内容格式器，支持字符串模板和回调函数两种形式
      },
      series: [{
          name: '',
          type: 'pie',//饼图类型
          radius: ['72%', '100%'],//饼图的内、外半径
          hoverAnimation: false,
          label: {
              normal: {
                  show: false,
              }
          },
          itemStyle: {
              normal: {
                  color: '#666666',
              }
          },
          data: [{//系列中的数据内容数组
              value: 0,
              itemStyle: {
                  normal: {
                      color: '#FF994B'
                  }
              }
          }, {
              value: 100,
          }
          ],
          animationEasingUpdate: 'cubicInOut',
          animationDurationUpdate: 10
      }]
  };
  function process_pie_init(option) {
      let processByPie = echarts.init(document.getElementById("total_progress_ball"));
      option.title.text = "0%";
      processByPie.setOption(option);
      return processByPie;
  }
  
  function process_pie_update(process_pie, option, percent) {
      option.series[0].data[0].value = percent;
      option.series[0].data[1].value = 100 - percent;
      option.title.text = ""+percent+"%";
      process_pie.setOption(option, true);
  }
  
  function process_pie_end(process_pie, option) {
      option.series[0].data[0].value = 100;
      option.series[0].data[1].value = 0;
      option.title.text = "100%";
      process_pie.setOption(option, true);
  }
  
  function process_pie_reset(process_pie, option) {
      option.series[0].data[0].value = 0;
      option.series[0].data[1].value = 100;
      option.title.text = "0%";
      process_pie.setOption(option, true);
  }
  
  let processPie = undefined;
  
        $(document).ready(function(){
          $("#select_vthresh").val("21"); // default value
          $("#select_dura").val("100");
            $("#self_def_preprocess_alg").on("click", function(){
                vscode.postMessage(JSON.stringify({"convert_self_def": "preprocess"}));
            });
            $("#self_def_opt_alg").on("click", function(){
                vscode.postMessage(JSON.stringify({"convert_self_def": "opt"}));
            });
            $("#check_alg_select_btn").on("click", ()=>{
                msg = {}
                if (document.getElementById("default_alg").checked) {
                    msg["select_alg_res"] = "default";
                } else {
                    msg["select_alg_res"] = "self";
                }
  
                if (document.getElementById("default_opt_alg").checked) {
                    msg["select_alg_res_opt"] = "default";
                } else {
                    msg["select_alg_res_opt"] = "self";
                }
                console.log("向 extension 发送选择调用的算法 ： " + JSON.stringify(msg));
                vscode.postMessage(JSON.stringify(msg));
              });
            window.addEventListener("message", function(evt){
                console.log("ANN 转SNN 模型接收到extension 消息："+evt.data);
                const data = JSON.parse(evt.data);
                if(data.log_output){
                  log_output_lists = log_output_lists.concat(data.log_output.split("<br/>"));
                  console.log("data.logoutput=["+data.log_output+"]");
                  console.log("data split list len="+log_output_lists.length);
                  // $("#log_output_div").html(log_output_lists.join("<br/>"));
                  // document.getElementById("log_output_div").scrollTop = document.getElementById("log_output_div").scrollHeight;
                  if(log_output_lists.length <= 152){
                      console.log("increase sub progress bar 1, style width="+""+parseInt(log_output_lists.length/152*100)+"%");
                          document.getElementById("model_convert_progress_div").style.width = ""+parseInt(log_output_lists.length/152*100)+"%";
                  }
                  if(stage1_convert_finish){
                      if(log_output_lists.length < 228 && stage2_preprocess_finish !== true){
                          console.log("increase sub progress bar 2");
                              document.getElementById("preprocess_progress_div").style.width = ""+parseInt((log_output_lists.length-152)/(228-152)*100)+"%";
                      }
                  }
                  if(stage2_preprocess_finish){
                      if(log_output_lists.length < 330 && stage3_search_finish !== true){
                          console.log("increase sub progress bar 3");
                              document.getElementById("search_progress_div").style.width = ""+parseInt((log_output_lists.length-228)/(330-228)*100)+"%";
                      }
                  }
                  if(stage3_search_finish){
                      if(log_output_lists.length < 397 && stage4_all_finish !== true){
                          console.log("increase sub progress bar 4");
                              document.getElementById("darlang_progress_div").style.width = ""+parseInt((log_output_lists.length-330)/(397-330)*100)+"%";
                      }
                  }
                  // if(stage4_all_finish !== true){
                  //     console.log("increase sub progress bar total");
                  //     document.getElementById("total_progress_div").style.width = ""+parseInt(log_output_lists.length/397*100)+"%";
                  // }
                  // $(".wave").attr("height", ""+(560 - Math.floor(log_output_lists.length / 397 * (560 - 200)))+"px");
                  // $(".wave").css("height",  ""+(560 - Math.floor(log_output_lists.length / 397 * (560 - 200)))+"px");
                  // $("#total_progress_text").text(""+Math.min(Math.floor((log_output_lists.length / 397) * 100), 100)+"%");
                  process_pie_update(processPie, process_pie_option, Math.min(Math.floor((log_output_lists.length / 397) * 100), 100));
                  document.getElementById("model_convert_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("model_convert_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("preprocess_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("preprocess_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("search_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("search_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("darlang_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("darlang_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  // document.getElementById("total_progress_div").innerHTML = "<span style='color: #333;'>"+Math.min(parseInt(document.getElementById("total_progress_div").style.width.replace("%", "")), 100)+"%</span>";
                }else if(data.exec_finish){
                    if (!error_occurred) {
                      // 结束
                      //   document.getElementById("start_convert_btn").style.backgroundColor = "";
                      console.log("total finished, log_output_list length="+log_output_lists.length);
                      document.getElementById("model_convert_progress_div").style.width = "100%";
                      document.getElementById("preprocess_progress_div").style.width = "100%";
                      document.getElementById("search_progress_div").style.width = "100%";
                      document.getElementById("darlang_progress_div").style.width = "100%";
                      $("#total_progress_text").text("100%");
                      //   document.getElementById("total_progress_div").style.width = "100%";
                      document.getElementById("model_convert_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>100%</div>";
                      document.getElementById("preprocess_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>100%</div>";
                      document.getElementById("search_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>100%</div>";
                      document.getElementById("darlang_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>100%</div>";
                      // document.getElementById("total_progress_div").innerHTML = "<span style='color: #333;'>100%</span>";
                      console.log("LINE COUNT all_finish="+log_output_lists.length);
                      $(".loading-div").hide();
                      document.getElementById("total_progress_ball").style.display = "none";
                      stage4_all_finish = true;
                    }
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
  
                    let bar_chart_label_names = ["调整网络结构", "权重归一化", "量化", "SNN验证"];
                    let bar_chart_label_counts = [parseFloat(convert_infos.stage1_time_use), parseFloat(convert_infos.stage2_time_use),
                                  parseFloat(convert_infos.stage3_time_use), parseFloat(convert_infos.stage4_time_use)];
                    display_bar_chart(bar_chart_label_names, bar_chart_label_counts, "","秒","use_time_bar_chart");
                }else if(data.ann_model_start_convert){
                    // 接收到启动转换的命令，初始化
                  error_occurred = false;
  
                  let v_thresh = $("#select_vthresh").val().replace("ms","");
                  let neuron_dt = $("#select_dt").val().replace("ms","");
                  // let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
                  let synapse_dt = neuron_dt;
                  let delay = $("#select_delay").val().replace("ms", "");
                  let dura = $("#select_dura").val().replace("ms","");
  
                  // 字段检查
                  if (v_thresh.indexOf(".") >= 0 || Number.isNaN(parseInt(v_thresh))) {
                      $("#error_detail").text("'脉冲发放阈值'应该是整数！");
                      $("#alert_modal_btn").click();
                  } else {
                      document.getElementById("total_progress_ball").style.display = "flex";
                      // $(".wave").attr("height", "560px");
                      processPie = process_pie_init(process_pie_option);
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
                      $("#total_progress_text").text("0%");
                      // document.getElementById("total_progress_div").style.width = "0%";
                      $(".loading-div").show();
                      $("#total_progress_text").text("0%");
                  }
                }else if(data.scale_factors){
                  // scale_factors_table
                  // <tr style="margin-top: 15px;height: 35px;">
                  //     <td style="width: 200px;font-size: medium;font-weight: bold;">缩放系数</td>
                  //     <td>系数2</td>
                  // </tr> -->
                  scale_fac = JSON.parse(data.scale_factors);
                  // document.getElementById("scale_factors_table").innerHTML = "";
                  // console.log("scale factor table children len="+$("#scale_factors_table").children.length);
                  // while ($("#scale_factors_table").children.length > 1) {
                  //     $("#scale_factors_table tr:last").remove();
                  // }
                  // console.log("scale factor table children len after remove ="+$("#scale_factors_table").children.length);
                  document.getElementById("scale_factors_table").innerHTML = "<tr style='border: solid 2px #D6D6D6;'>\
  <td style='border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;\
  font-size: 16px;\
  color: #666666;'>神经层</td>\
  <td style='border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;\
  font-size: 16px;\
  color: #666666;'>参数缩放系数</td>\
  </tr>";
                  for(obj in scale_fac){
                      let table_line = document.createElement("tr");
                      table_line.style.height = "35px";
                      table_line.style.border = "solid 2px #D6D6D6";
                      table_line.style.color = "#333";
                      let line_td1 = document.createElement("td");
                      line_td1.style.border = "solid 2px #D6D6D6";
                      line_td1.style.paddingTop = '10px';
                      line_td1.style.paddingBottom = '10px';
                      line_td1.style.paddingLeft = '10px';
                      line_td1.style.paddingRight = '80px';
                      line_td1.style.fontFamily = 'SourceHanSansCN-Medium';
                      line_td1.style.fontSize = '14px';
                      line_td1.style.color = '#666666';
                      line_td1.innerHTML = ""+obj;
                      table_line.appendChild(line_td1);
                      let line_td2 = document.createElement("td");
                      line_td2.style.border = "solid 2px #D6D6D6";
                      line_td2.style.paddingTop = '10px';
                      line_td2.style.paddingBottom = '10px';
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
                } else if (data.select_default_or_self_alg) {
                    // 弹出对话框，选择使用默认算法/自定义算法
                    $("#select_alg_modal_btn").click();
                  //   $("#select_alg_modal_close").on("click",()=>{
                  //     if (document.getElementById("default_alg").checked) {
                  //           console.log("选择使用默认算法....");
                  //           vscode.postMessage(JSON.stringify({"select_alg_res": "default"}));
                  //       } else {
                  //           console.log("选择使用自定义算法...");
                  //           vscode.postMessage(JSON.stringify({"select_alg_res":"self"}));
                  //       }
                  //   });
                } else if (data.exec_error) {
                    error_occurred = true;
                  // 重置界面状态
                  document.getElementById("scale_factors_table").innerHTML = "<tr style='border: solid 2px #D6D6D6;'>\
  <td style='border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;\
  font-size: 16px;\
  color: #666666;'>神经层</td>\
  <td style='border: solid 2px #D6D6D6;background: #EEEEEE;text-align: center;padding-top: 15px;padding-bottom: 15px;font-family: SourceHanSansCN-Medium;\
  font-size: 16px;\
  color: #666666;'>参数缩放系数</td>\
  </tr>";
                  document.getElementById("model_convert_progress_div").style.width = "0%";
                  document.getElementById("preprocess_progress_div").style.width = "0%";
                  document.getElementById("search_progress_div").style.width = "0%";
                  document.getElementById("darlang_progress_div").style.width = "0%";
  
                  document.getElementById("model_convert_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("model_convert_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("preprocess_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("preprocess_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("search_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("search_progress_div").style.width.replace("%", "")), 100)+"%</div>";
                  document.getElementById("darlang_progress_div").innerHTML = "<div style='color: #333;font-size:20px;padding-top:10px;'>"+Math.min(parseInt(document.getElementById("darlang_progress_div").style.width.replace("%", "")), 100)+"%</div>";
  
                  log_output_lists.splice(0);
                  stage1_convert_finish = false;
                  stage2_preprocess_finish = false;
                  stage3_search_finish = false;
                  stage4_all_finish = false;
                  $(".loading-div").show();
  
                  $("#error_msg_div").text(data.exec_error);
                  $("#exec_error_modal_btn").click();
                  document.getElementById("total_progress_ball").style.display = "none";
                } else if (data.show_error)  {
                  $("#error_detail").text(data.show_error);
                  $("#alert_modal_btn").click();
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
              // let synapse_dt = $("#select_synapse_dt").val().replace("ms","");
              let synapse_dt = neuron_dt;
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
              //   document.getElementById("total_progress_div").style.width = "0%";
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


export function getSNNSimuPage(){
  return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>模型转换器</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
    <div class="loading-div">
      <div class="container"  style="margin-left: calc(50vw - 5px);">
        <div class="ispinner ispinner-large">
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
        </div>
      </div>
      <!-- <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i> -->
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);margin-top: -70px;display: block;"><font style="color: #333;font-weight: bolder;">仿真数据加载中...</font></span>
    </div>
  
      <div style="margin-top: 5px;display: block;">
  
          <div style="background: rgba(238,238,238,0.4);width: 700px;height: 380px;display: inline-block;vertical-align: bottom;">
            <div>
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">仿真配置结果评估</font></div>
              <table id="layer_conf_val" style="width: 600px;margin-left:40px;margin-top: 5px;border: solid 3px #D6D6D6;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">统计指标</td>
                    <td style="border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                    font-size: 16px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;text-align: center;">指标值</td>
                  </tr>
                  <!-- <tr style="height: 25px; border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">膜电位阈值</td>
                    <td id="simulate_vthresh" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr> -->
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">神经元时间步长(ms)</td>
                    <td id="simulate_neuron_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">突触时间步长(ms)</td>
                    <td id="simulate_synapse_dt" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td  style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">脉冲传输延迟(ms)</td>
                    <td id="simulate_delay" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">仿真时长(ms)</td>
                    <td id="simulate_dura" style="text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">ANN准确率</td>
                    <td id="simulate_acc" style="color: #e71f1fe0;text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>    
                  <tr style="height: 25px;border: solid 2px #D6D6D6;color: #333;">
                    <td style="padding-left: 15px;border: solid 2px #D6D6D6;font-family: SourceHanSansCN-Medium;
                    font-size: 14px;
                    color: #666666;padding-top: 12px;padding-bottom: 12px;">SNN准确率</td>
                    <td id="simulate_acc_snn" style="color: #e71f1fe0;text-align: right;padding-right: 15px;padding-top: 12px;padding-bottom: 12px;"></td>
                  </tr>  
              </table>
            </div>
          </div>
  
          <div style="background: rgba(238,238,238,0.4);width: 750px;height: 380px;display: inline-block;">
            <div style="text-align: center;margin: auto;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">放电次数均值方差统计</font></div>
              <div style="width: 640px;height: 340px;overflow-y: scroll;margin-left: 80px;">
                <table id="snn_layers_spike_table" style="width: 600px;height: 380px;margin-left:10px;margin-top: 5px;margin-right: 280px;border: solid 3px #D6D6D6;">
                  <!-- <caption class="white-text" style="caption-side: top;text-align: center;"></caption> -->
                </table>
              </div>
          </div>
  
      </div>
      <div style="margin-top: 5px;display: block;">
          <!-- <div style="display: inline-block;width: 760px;height: 460px;background: rgba(238,238,238,0.4);">
            <div id="model_input_spike_cap" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">脉冲神经网络输入层脉冲</font></div>
            <div id="input_spike_charts" style="width:660px;height: 400px;margin-left: 70px;display: inline-block;margin-top: 20px;"></div>
            <ul id="input_spike_sample_imgs_ul" style="height: 80px;width: 660px;overflow: auto; white-space: nowrap;display: block;margin-left: 55px;margin-top: -40px;z-index: 2;">
            </ul>
          </div> -->
          <div style="background: rgba(238,238,238,0.4);width: 700px;height: 460px;display: inline-block;">
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
                        <option>layer_1</option>
                        <option>out</option>
                    </select>
                    </div>
                  </div>
                </form>
              </div>
              <div id="neurons_v_chart" style="width: 640px;height: 320px;margin-left: 40px;margin-top: 20px;"></div>
            </div>
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
  
  .container {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 15px;
    box-sizing: border-box;
  }
  .container:last-child {
    padding: 31.5px;
  }
  .container::after {
    position: absolute;
    width: 100px;
    height: 60px;
    left: 0;
    bottom: -30px;
    line-height: 30px;
    text-align: center;
  }
  .container:last-child::after {
    content: 'large';
  }
  
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  <link rel="stylesheet" media="all" href="http://localhost:6003/css/ispinner.prefixed.css" />
  
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
  
                        let output_chart_cls_names = []; // x-axis, time stamps
                        let simu_dura = parseInt(infos.extra_simu_info.simulate_dura);
                        for (let i = 0; i < simu_dura; ++i) {
                          output_chart_cls_names.push(""+i);
                        }
                        let output_chart_spike_tuples = []
                        for (let j = 0; j < test_img_spikes[i].spike_tuples.length; ++j) {
                          output_chart_spike_tuples.push([test_img_spikes[i].spike_tuples[j][1], test_img_spikes[i].spike_tuples[j][0]]);
                        }
                        console.log("Uniqe class counts="+parseInt(test_img_spikes[i].label_counts));
                        display_spike_scatter_chart(output_chart_cls_names, output_chart_spike_tuples, parseInt(test_img_spikes[i].label_counts));
                        // display_spike_scatter_chart(test_img_spikes[i].cls_names, test_img_spikes[i].spike_tuples);
  
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
  
                    // console.log("创建输入层脉冲激发图......");
                    // let input_chart_cls_names = []; // x-axis, time stamps
                    // let simu_dura = parseInt(infos.extra_simu_info.simulate_dura);
                    // for (let i = 0; i < simu_dura; ++i) {
                    //   input_chart_cls_names.push(""+i);
                    // }
                    // 创建输入层脉冲激发图
                    // for(let i=0;i<infos.spikes.snn_input_spikes.length;++i){
                    //   var input_img_li = document.createElement("li");
                    //   input_img_li.style.listStyle = "none";
                    //   input_img_li.id = "inputimg_li_"+i;
                    //   input_img_li.style.width = "53px";
                    //   input_img_li.style.height = "50";
                    //   input_img_li.style.display = "inline-block";
                    //   input_img_li.style.marginRight = "10px";
                    //   var input_img_tag = document.createElement("img");
                    //   input_img_tag.src = test_img_uris[i];
                    //   input_img_tag.id = "inputimg_"+i;
                    //   input_img_tag.style.width = "50px";
                    //   input_img_tag.style.height = "50px";
                    //   input_img_tag.style.opacity = "0.5";
                    //   input_img_tag.onclick = ()=>{
                    //     console.log("input spike display img idx "+i);
                    //     // if(prev_clicked_input_li !== undefined){
                    //     //   document.getElementById(prev_clicked_input_li).style.backgroundColor ="";
                    //     // }
                    //     // document.getElementById("input_img_li_"+i).style.backgroundColor = "chocolate";
                    //     prev_clicked_input_li = "inputimg_li_"+i;
                    //     if(prev_clicked_input_img !== undefined){
                    //       document.getElementById(prev_clicked_input_img).style.border = '';
                    //     }
                    //     prev_clicked_input_img = 'inputimg_'+i;
                    //     document.getElementById(prev_clicked_input_img).style.border = '10px outset orange';
                    //     console.log("Current cls_names="+infos.spikes.snn_input_spikes[i].cls_names);
                    //     console.log("Current spike data="+infos.spikes.snn_input_spikes[i].spike_tuples);
                    //     let input_chart_spike_tuples = [];
                    //     for (let j = 0; j < infos.spikes.snn_input_spikes[i].spike_tuples.length; ++j) {
                    //       input_chart_spike_tuples.push([infos.spikes.snn_input_spikes[i].spike_tuples[j][1], infos.spikes.snn_input_spikes[i].spike_tuples[j][0]]);
                    //     }
                    //     display_input_spikes_scatter_chart(input_chart_cls_names, input_chart_spike_tuples);
                    //     // display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                    //   };
                    //   input_img_li.appendChild(input_img_tag);
                    //   // document.getElementById("input_spike_sample_imgs_ul").appendChild(input_img_li);
                    //   // var layer_li = document.createElement("li");
                    //   // layer_li.style.listStyle="circle";
                    //   // layer_li.id = "input_layer_li_"+i;
                    //   // document.getElementById("layer_indexs").appendChild(layer_li);
                    //   // layer_li.onclick = ()=>{
                    //   //   console.log("Input layer "+i+" is clicked");
                    //   //   // display input spike
                    //   //   display_input_spikes_scatter_chart(infos.spikes.snn_input_spikes[i].cls_names, infos.spikes.snn_input_spikes[i].spike_tuples);
                    //   // };
                    // }
  
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
                      if(select_layer_val === "layer_1"){
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
                    // $("#simulate_vthresh").text(infos.extra_simu_info.simulate_vthresh);
                    $("#simulate_neuron_dt").text(infos.extra_simu_info.simulate_neuron_dt);
                    $("#simulate_synapse_dt").text(infos.extra_simu_info.simulate_synapse_dt);
                    $("#simulate_delay").text(infos.extra_simu_info.simulate_delay);
                    $("#simulate_dura").text(infos.extra_simu_info.simulate_dura);
                    $("#simulate_acc").text(infos.extra_simu_info.simulate_acc.substr(0, infos.extra_simu_info.simulate_acc.indexOf("-")));
                    $("#simulate_acc_snn").text(infos.extra_simu_info.simulate_acc.substr(infos.extra_simu_info.simulate_acc.indexOf("-") + 4));
  
  
                    // fill layers spike info table
                    // $("#snn_layers_spike_table")
  //                   document.getElementById("snn_layers_spike_table").innerHTML = '<tr id="snn_layers_spike_table_thead_tr" style="height: 25px; border: solid 2px #D6D6D6;color: #333;">\
  // <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;\
  // font-size: 16px;\
  // color: #666666;padding-top: 12px;padding-bottom: 12px;">层编号</td>\
  // <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;\
  // font-size: 16px;\
  // color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数均值</td>\
  // <td style="text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;\
  // font-size: 16px;\
  // color: #666666;padding-top: 12px;padding-bottom: 12px;">放电次数方差</td>\
  // </tr>';
                      let table_line = document.createElement("tr");
                      table_line.style.height = "25px";
                      table_line.style.border = "solid 2px #D6D6D6";
                      table_line.style.color = "#333";
  
                      let td_id = document.createElement("td");
                      td_id.style.fontFamily = 'SourceHanSansCN-Medium';
                      td_id.style.backgroundColor = '#EEEEEE';
                      td_id.style.fontSize = '16px';
                      td_id.style.color = '#666666';
                      td_id.style.textAlign = 'center';
                      td_id.style.border = "solid 2px #D6D6D6";
                      td_id.style.paddingTop = '12px';
                      td_id.style.paddingBottom = '12px';
                      td_id.innerText = "层编号";
                      table_line.appendChild(td_id);
  
                      let td_id2 = document.createElement("td");
                      td_id2.style.fontFamily = 'SourceHanSansCN-Medium';
                      td_id2.style.fontSize = '16px';
                      td_id2.style.color = '#666666';
                      td_id2.style.textAlign = 'center';
                      td_id2.style.backgroundColor = '#EEEEEE';
                      td_id2.style.border = "solid 2px #D6D6D6";
                      td_id2.style.paddingTop = '12px';
                      td_id2.style.paddingBottom = '12px';
                      td_id2.innerText = "放电次数均值";
                      table_line.appendChild(td_id2);
  
                      let td_id3 = document.createElement("td");
                      td_id3.style.fontFamily = 'SourceHanSansCN-Medium';
                      td_id3.style.fontSize = '16px';
                      td_id3.style.color = '#666666';
                      td_id3.style.textAlign = 'center';
                      td_id3.style.backgroundColor = '#EEEEEE';
                      td_id3.style.border = "solid 2px #D6D6D6";
                      td_id3.style.paddingTop = '12px';
                      td_id3.style.paddingBottom = '12px';
                      td_id3.innerText = "放电次数方差";
                      table_line.appendChild(td_id3);
  
                      document.getElementById("snn_layers_spike_table").appendChild(table_line);
  
  
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
                      // td_id.innerText = ""+j;
                      if (j == 0) {
                        td_id.innerText = "input";
                      } else if (j == infos.record_spike_out_info.spike_count_avgs.length - 1) {
                        td_id.innerText = "out";
                      } else {
                        td_id.innerText = "layer_"+j;
                      }
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
                    // document.getElementById("inputimg_0").click();
  
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
  
        function display_spike_scatter_chart(labels, datas, cls_counts){
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
                      name: "时间(ms)",
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
                      name:"类别",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
                          }
                      },
                      min: 0,
                      max: (cls_counts - 1),
                      splitNumber:cls_counts
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
                      name: "时间(ms)",
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
                      name:"神经元ID",
                      nameTextStyle:{
                        color:"#999999"
                      },
                      axisLabel: {
                          formatter: '{value}',
                          textStyle:{
                            color:"#999999"
                          }
                      },
                      min: 0,
                      max: 800,
                      splitNumber: 9
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


export function getSNNModelPage():string{
  return `
  <!DOCTYPE html>
  <html style="height: 640px;width: 100%;">
  
  <head>
    <meta charset="UTF-8">
    <title>SNN模型</title>
  </head>
  
  <body class="dark-mode" style="height: 100%;width: 100%;white-space: nowrap;overflow: auto;">
  
    <div class="loading-div">
      <div class="container"  style="margin-left: calc(50vw - 5px);">
        <div class="ispinner ispinner-large">
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
          <div class="ispinner-blade"></div>
        </div>
      </div>
      <!-- <i class="fa fa-spinner fa-pulse fa-3x fa-fw" style="display: block;margin-left: 50vw;color: #333;"></i> -->
      <span style="color: #333;height: 50px;width: 120px;margin-left: calc(50vw - 20px);margin-top: -70px;display: block;"><font style="color: #333;font-weight: bolder;">数据信息加载中...</font></span>
    </div>
  
      <div style="height: 500px;margin-top: -5px;">
        <div style="height: 460px;width: 740px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
          <div style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
            font-size: 20px;
            color: #333333;
            letter-spacing: 1.14px;">ANN SNN模型对应关系图</font></div>
          <div id="sangky_chart" style="width: 700px;height: 400px;display: inline-block;margin-left: 50px;overflow-y: auto;overflow-x: hidden;"></div>
        </div>
        <!--权重分布图-->
        <div style="height: 460px;width: 770px;display: inline-block;vertical-align: top;background: rgba(238,238,238,0.4);">
            <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">脉冲神经网络权重分布</font></div>
                <div style="margin-left: 300px;text-align: center;width: 200px;">
                  <label for="select_wt_layer"><font style="font-family: SourceHanSansCN-Normal;font-weight: normal;
                      font-size: 16px;
                      color: #333333;
                      letter-spacing: 0.91px;">选择连接</font></label>
                  <select class="form-control" id="select_wt_layer">
                  </select>
              </div>
            <div id="weight_dist_chart" style="width: 700px;height: 360px;margin-left: 40px;margin-top: 10px;"></div>
        </div>
      </div>
  
      <div style="height: 400px;margin-top: -25px;">
          <!-- SNN神经元信息 -->
          <div style="display: inline-block;background: rgba(238,238,238,0.4); height: 400px;width: 740px;">
              <div id="model_layers_vis_tab_caption" style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
                font-size: 20px;
                color: #333333;
                letter-spacing: 1.14px;">各神经元组详细信息</font></div>
              <table id="snn_neurons_table" style="margin-left:80px;border: solid 3px #D6D6D6;width: 600px;">
                  <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
                  <thead>
                    <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">神经元组</td>
                      <!-- <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">神经元个数</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">求解方法</td> -->
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">电压阈值</td>
                      <td style="width: 100px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                      font-size: 16px;
                      color: #666666;padding-top: 12px; padding-bottom: 12px;">神经元类型</td>
                    </tr>
                    <!-- 动态加载 -->
                  </thead>
              </table>
          </div>
  
          <div style="display: inline-block;background: rgba(238,238,238,0.4);height: 400px;width: 750px;">
            <div style="text-align: center;"><font style="font-family: SourceHanSansCN-Normal;
              font-size: 20px;
              color: #333333;
              letter-spacing: 1.14px;">层连接权重统计</font></div>
            <table id="snn_layer_wt_table" style="border: solid 3px #D6D6D6;width: 600px;margin-left: 60px;">
              <caption class="white-text" style="caption-side: top;text-align: center;"></caption>
              <thead>
                <tr style="margin-top: 15px;border: solid 2px #D6D6D6;color: #333;">
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">连接</td>
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">均值</td>
                  <td style="width: 80px;text-align: center;border: solid 2px #D6D6D6;background: #EEEEEE;font-family: SourceHanSansCN-Medium;
                  font-size: 16px;
                  color: #666666;padding-top: 12px; padding-bottom: 12px;">方差</td>
                </tr>
              </thead>
            </table>
          </div>
  
          <!-- <div style="height: 400px;margin-top: 20px;display: inline-block;background: rgba(238,238,238,0.4);width: 500px;">
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
                     动态加载 -->
                  </thead>
              </table>
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
  
  .container {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 15px;
    box-sizing: border-box;
  }
  .container:last-child {
    padding: 31.5px;
  }
  .container::after {
    position: absolute;
    width: 100px;
    height: 60px;
    left: 0;
    bottom: -30px;
    line-height: 30px;
    text-align: center;
  }
  .container:last-child::after {
    content: 'large';
  }
  #sangky_chart svg {
    width: 140%;
    height: 140%;
  }
  </style>
  <!-- Compiled and minified CSS -->
  <link rel="stylesheet" href="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="http://localhost:6003/css/font-awesome.min.css">
  <link rel="stylesheet" media="all" href="http://localhost:6003/css/ispinner.prefixed.css" />
  <link href="https://cdn.bootcdn.net/ajax/libs/jointjs/3.3.1/joint.css" rel="stylesheet">
  
  <script src="https://cdn.staticfile.org/jquery/2.1.1/jquery.min.js"></script>
  <script src="https://cdn.staticfile.org/twitter-bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts-en.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/backbone.js/1.4.0/backbone.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/jointjs/3.3.1/joint.js"></script>
  
  <script>
  const vscode = acquireVsCodeApi();
        $(document).ready(function(){
            vscode.postMessage(JSON.stringify({"ready": true}));
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
                        if (i == 0) {
                          col_1.innerText = "input";
                        } else if (i == neurons_info.length - 1) {
                          col_1.innerText = "out";
                        } else {
                          col_1.innerText = "layer_"+neurons_info[i].idx;
                        }
                        // col_1.innerText = neurons_info[i].idx;
  
                        // var col_2 = document.createElement("td");
                        // col_2.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        // col_2.innerText = neurons_info[i].neuron_count;
  
                        // var col_3 = document.createElement("td");
                        // col_3.style = "border: solid 3px #D6D6D6;padding-left:10px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        // col_3.innerText = neurons_info[i].method;
  
                        var col_4 = document.createElement("td");
                        col_4.style = "border: solid 3px #D6D6D6;text-align:center; padding-right:15px;;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col_4.innerText = neurons_info[i].vthresh;
  
                        var col5 = document.createElement("td");
                        col5.style = "border: solid 3px #D6D6D6;text-align:center; padding-right:15px;;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                        col5.innerText = "IF";
  
  
                        line.appendChild(col_1);
                        // line.appendChild(col_2);
                        // line.appendChild(col_3);
                        line.appendChild(col_4);
                        line.appendChild(col5);
  
                        neurons_table.appendChild(line);
                    }
                    // 构建突触表格
                    // var synaps_info = infos.layer_conns;
                    // var synaps_table = document.getElementById("layer_conns_table");
                    // for(var i=0;i<synaps_info.length;++i){
                    //     var line = document.createElement("tr");
                    //     line.style = "margin-top: 15px; border: solid 3px #D6D6D6; color:#333;";
                    //     var col_1 = document.createElement("td");
                    //     col_1.style = "text-align:center; padding-right:15px;border: solid 3px #D6D6D6;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                    //     col_1.innerText = synaps_info[i].idx + "-"+(synaps_info[i].idx+1);
  
                    //     var col_2 = document.createElement("td");
                    //     col_2.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                    //     col_2.innerText = synaps_info[i].ratio;
  
                    //     var col_3 = document.createElement("td");
                    //     col_3.style = "border: solid 3px #D6D6D6;text-align:right; padding-right:15px;font-family: ArialMT;font-size: 14px;color: #333333;padding-top: 12px; padding-bottom: 12px;";
                    //     col_3.innerText = synaps_info[i].avg_conn;
  
                    //     line.appendChild(col_1);
                    //     line.appendChild(col_2);
                    //     line.appendChild(col_3);
                    //     synaps_table.appendChild(line);
                    // }
  
                    // 绘制权重分布图
                    console.log("权重数据："+infos.layers_weights.wt_label);
                    console.log("数值:"+infos.layers_weights.wt_count);
                    console.log("浮点权重数据："+infos.layer_flt_weights.wt_label);
                    console.log("数值："+infos.layer_flt_weights.wt_count);
                    // for(var i=0;i<infos.layers_weights.wt_count.length;++i){
                    //   if (infos.layers_weights.wt_count[i] > 0) {
                    //     infos.layers_weights.wt_count[i] = Math.log10(infos.layers_weights.wt_count[i]);
                    //   } else {
                    //     infos.layers_weights.wt_count[i] = 0;
                    //   }
                    // }
                    // for (var i = 0; i < infos.layer_flt_weights.wt_count.length;++i) {
                    //   if (infos.layer_flt_weights.wt_count[i] > 0) {
                    //     infos.layer_flt_weights.wt_count[i] = Math.log10(infos.layer_flt_weights.wt_count[i]);
                    //   } else {
                    //     infos.layer_flt_weights.wt_count[i] = 0;
                    //   }
                    // }
  
                    // 添加选项
                    let innerhtml4option = "";
                    for (let k = 0; k < infos.each_layer_wt_infos.wt_counts.length; ++k) {
                      if (k == 0){
                        innerhtml4option += "<option>input-->layer_1</option>";
                      } else if (k == infos.each_layer_wt_infos.wt_counts.length - 1){
                        innerhtml4option += "<option>layer_"+k+"-->out</option>"
                      } else {
                        innerhtml4option += "<option>layer_"+(k)+"-->layer_"+(k+1)+"</option>";
                      }
                    }
                    document.getElementById("select_wt_layer").innerHTML = innerhtml4option;
                    $("#select_wt_layer").change(()=>{
                      let select_which = $("#select_wt_layer").val();
                      if (select_which.indexOf("input") >=0){
                        display_weight_chart(infos.each_layer_wt_infos.flt_wt_labels[0], infos.each_layer_wt_infos.flt_wt_counts[0], 
                                  infos.each_layer_wt_infos.wt_labels[0], infos.each_layer_wt_infos.wt_counts[0]);
                      } else if(select_which.indexOf("out") >=0){
                        var len_of_lay = infos.each_layer_wt_infos.flt_wt_labels.length - 1;
                        display_weight_chart(infos.each_layer_wt_infos.flt_wt_labels[len_of_lay], infos.each_layer_wt_infos.flt_wt_counts[len_of_lay], 
                                  infos.each_layer_wt_infos.wt_labels[len_of_lay], infos.each_layer_wt_infos.wt_counts[len_of_lay]);
                      } else {
                        var idx = parseInt(select_which.substr(select_which.lastIndexOf("_") + 1)) - 1;
                        display_weight_chart(infos.each_layer_wt_infos.flt_wt_labels[idx], infos.each_layer_wt_infos.flt_wt_counts[idx], 
                                  infos.each_layer_wt_infos.wt_labels[idx], infos.each_layer_wt_infos.wt_counts[idx]);
                      }
                    });
  
                    display_weight_chart(infos.each_layer_wt_infos.flt_wt_labels[0], infos.each_layer_wt_infos.flt_wt_counts[0], 
                                  infos.each_layer_wt_infos.wt_labels[0], infos.each_layer_wt_infos.wt_counts[0]);
                    // display_weight_chart(infos.layer_flt_weights.wt_label, infos.layer_flt_weights.wt_count,infos.layers_weights.wt_label, infos.layers_weights.wt_count);
  
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
                      // td_id.innerText = ""+i+"-"+(i+1);
                      if (i == 0) {
                        td_id.innerText = "input ---> "+"layer_"+(i+1);
                      } else if (i == infos.record_layers_wt_info.record_wts_avg.length - 1) {
                        td_id.innerText = "layer_"+i+" ---> "+"out";
                      } else {
                        td_id.innerText = "layer_"+(i)+" ---> layer_"+(i+1);
                      }
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
  
                    // 显示模型框图
                    let origin_layer_names = infos.origin_layer_names;
                    console.log("origin_layer_names="+origin_layer_names);
                    var graph = new joint.dia.Graph;
                    var paper = new joint.dia.Paper({
                        el: document.getElementById('sangky_chart'),
                        model: graph,
                        width: 600,
                        height: 400,
                        gridSize: 1,
                        drawGrid: true,
                        background: {
                            color: 'rgba(238,238,238,0.4)'
                        }
                    });
  
                    var rect_tip = new joint.shapes.standard.Rectangle();
                    rect_tip.position(20, 20);
                    rect_tip.resize(160, 200);
                    rect_tip.attr({
                      body:{
                        fill:"rgb(255,248,220)"
                      },
                      label: {
                        text: joint.util.breakText("图例", {width: 80}),
                        fill: "black",
                        refY: "5%"
                      }
                    });
                    rect_tip.addTo(graph);
  
                    var rect_legend1 = new joint.shapes.standard.Rectangle();
                    rect_legend1.position(40,40);
                    rect_legend1.resize(120,30);
                    rect_legend1.attr({
                      body:{
                        fill: 'red'
                      },
                      label: {
                        text: "ANN层(删除)",
                        fill:"black"
                      }
                    });
                    rect_legend1.addTo(graph);
  
                    var rect_legend2 = new joint.shapes.standard.Rectangle();
                    rect_legend2.position(40, 90);
                    rect_legend2.resize(120, 30);
                    rect_legend2.attr({
                      body: {
                        fill: '#FF9800'
                      },
                      label: {
                        text: "ANN层(前向融合)",
                        fill: "black"
                      }
                    });
                    rect_legend2.addTo(graph);
                    
                    var rect_legend3 = new joint.shapes.standard.Rectangle();
                    rect_legend3.position(40, 140);
                    rect_legend3.resize(120, 30);
                    rect_legend3.attr({
                      body: {
                        fill: 'gray'
                      },
                      label: {
                        text: "ANN层(转换)",
                        fill: 'black'
                      }
                    });
                    rect_legend3.addTo(graph);
  
                    var rect_legend4 = new joint.shapes.standard.Rectangle();
                    rect_legend4.position(40, 190);
                    rect_legend4.resize(120, 30);
                    rect_legend4.attr({
                      body: {
                        fill: 'green'
                      },
                      label: {
                        text: "SNN层",
                        fill: 'black'
                      }
                    });
                    rect_legend4.addTo(graph);
  
                    let prev_rect = undefined;
                    let idx4layer = 0;
                    let k_pos = 0;
                    let extra_idx = -1;
                    for (let k = 0; k < origin_layer_names.length; ++k) {
                      var layer_idx = "layer_"+idx4layer;
                      if (k === 0) {
                        layer_idx = "input";
                      } else if (k === origin_layer_names.length - 1) {
                        layer_idx = "out";
                      }
                      var rect = new joint.shapes.standard.Rectangle();
                      rect.position(200, 40 * k_pos + 20);
                      rect.resize(120, 20);
                      rect.attr({
                          body: {
                              fill: 'gray'
                          },
                          label: {
                              text: origin_layer_names[k],
                              fill: 'white'
                          }
                      });
                      var rect_snn_ctpt = new joint.shapes.standard.Rectangle();
                      var is_rect_snn_ctpt_added = false;
                      if (origin_layer_names[k] == "Activation" ||
                          origin_layer_names[k] == "Dropout" || origin_layer_names[k] == "Flatten") {
                          rect.attr("body/fill", "red");
                          rect.attr("label/text", origin_layer_names[k]);
                      } else if (origin_layer_names[k] == "BatchNormalization") {
                        rect.attr("body/fill", "#FF9800");
                        rect.attr("label/text", origin_layer_names[k]);
                      }
                      else {
                        idx4layer += 1;
                        // 对应snn层/input/out layer
                        rect_snn_ctpt.position(350, 40 * k_pos + 20);
                        rect_snn_ctpt.resize(120, 20);
                        rect_snn_ctpt.attr({
                          body: {
                            fill: "green"
                          },
                          label: {
                            text: "",
                            fill:'white'
                          }
                        });
                        if (k === 0) {
                          rect_snn_ctpt.attr("label/text", "input");
                        } else if (k === origin_layer_names.length - 1) {
                          rect_snn_ctpt.attr("label/text", "out");
                        } else {
                          rect_snn_ctpt.attr("label/text", ""+layer_idx);
                        }
                        is_rect_snn_ctpt_added = true;
                        // var rect_legend3 = new joint.shapes.standard.Rectangle();
                        // rect_legend3.position(40, 140);
                        // rect_legend3.resize(80, 30);
                        // rect_legend3.attr({
                        //   body: {
                        //     fill: 'gray'
                        //   },
                        //   label: {
                        //     text: "转换",
                        //     fill: 'black'
                        //   }
                        // });
                        // rect_legend3.addTo(graph);
                      }
                      rect.addTo(graph);
                      if (is_rect_snn_ctpt_added) {
                        rect_snn_ctpt.addTo(graph);
                        var link_ann_snn_contpt = new joint.shapes.standard.Link();
                        link_ann_snn_contpt.attr("line/strokeDasharray", 1+' '+1);
                        link_ann_snn_contpt.attr("line/stroke", '#7DCEA0');
                        link_ann_snn_contpt.source(rect);
                        link_ann_snn_contpt.target(rect_snn_ctpt);
                        link_ann_snn_contpt.addTo(graph);
                      }
  
                      if (prev_rect !== undefined) {
                        var link = new joint.shapes.standard.Link();
                        link.source(prev_rect);
                        link.target(rect);
                        link.addTo(graph);
                      }
                      prev_rect = rect;
                      if (origin_layer_names[k] === "Conv2D") {
                        extra_idx++;
                          if (infos.layer_extras[k] === "relu") {
                            k_pos++;
                            var rect_extra = new joint.shapes.standard.Rectangle();
                            rect_extra.position(200, 40 * k_pos + 20);
                            rect_extra.resize(120, 20);
                            rect_extra.attr({
                              body: {
                                fill: "red"
                              },
                              label: {
                                text: "Activation",
                                fill: 'white'
                              }
                            });
                            rect_extra.addTo(graph);
                            var link_extra = new joint.shapes.standard.Link();
                            link_extra.source(prev_rect);
                            link_extra.target(rect_extra);
                            link_extra.addTo(graph);
  
                            prev_rect = rect_extra;
                        }
                      }
                      k_pos++;
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
                  // console.log("显示SNN 结构图.....");
                  // net_structure_show("sangky_chart", data.snn_map);
  
                }
            });
        });
  
        function display_weight_chart(flt_label_names, flt_label_counts,label_names, label_counts){
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
                  legend: {
                    data: ['浮点数权重', "定点数权重"],
                    textStyle: {
                      color: '#999'
                    }
                  },
                  xAxis: [
                    {
                        type: 'category',
                        data: flt_label_names,
                        name:"浮点权重",
                        nameLocation: 'center',
                        nameGap : 30,
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
                      },
                      show:true,
                      position: 'top'
                    },
                    {
                        type: 'category',
                        data: label_names,
                        name:"定点权重",
                        nameLocation: 'center',
                        nameGap: 30,
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
                      },
                      position: 'bottom'
                    }
                  ],
                  yAxis: [
                   {
                      type: 'log',
                      min: 1,
                      logBase: 2,
                      name:"浮点权重数量",
                      nameLocation: 'center',
                      nameGap: 40,
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
                      },
                      inverse:false
                    },
                    {
                      type: 'log',
                      min: 1,
                      logBase: 10,
                      name:"定点权重数量",
                      nameLocation: 'center',
                      nameGap: 40,
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
                      },
                      inverse:false
                    },
                  ],
                  series: [{
                      data: flt_label_counts,
                      type: 'bar',
                      name: "浮点数权重",
                      xAxisIndex:0,
                      YAxisIndex:0
                  },
                  {
                    data: label_counts,
                    type: 'bar',
                    name: "定点数权重",
                    xAxisIndex:1,
                    yAxisIndex:1
                  }
                ]
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