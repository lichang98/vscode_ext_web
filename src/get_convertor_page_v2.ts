

export function getConvertorPageV2(){
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

      <div class="col-sm-12" style="height: 100%;">
        <div class="row" style="width: 105%;height: 100%;">
          <!--左侧主面板-->
          <div id="main_panel_parent_div" class="col-sm-10 row" style="width: 100%;height: 100%;float: right;right: -10px;">
            <div id="main_panel" class="tab-content" style="display: inline-block;width: 98%;height: 100%;overflow: auto;">
              <!--数据可视化tab页-->
              <div id="data_vis_tab" class="tab-pane" style="width: 100%;">
                <div class="col m3">
                  <!-- 数据基本信息表格 -->
                  <table id="data_general_table" style="display: none;">
                    <caption class="white-text" style="caption-side: top;text-align: center;">导入数据统计</caption>
                    <tr>
                      <td>总数据大小</td>
                      <td id="total_data_amount"></td>
                    </tr>
                    <tr>
                      <td>测试数据量</td>
                      <td id="test_data_amount"></td>
                    </tr>
                    <tr>
                      <td>验证数据量</td>
                      <td id="val_data_amount"></td>
                    </tr>
                  </table>
                </div>
                <div class="col m5">
                  <div id="pie_chart_container" style="width: 440px; height: 360px;">
                  </div>
                </div>
                <div id="sample_data_div" class="col m3" style="display: none;">
                  <div style="text-align: center;font-weight: bold;">
                    样例数据
                  </div>
                  <img id="sample_img" src="./imgs/img_1.jpg" style="width: 50px;height: 50px;display: none;margin-left: 60px;margin-top: 40px;">
                  <div id="bar_chart_histgram" style="width: 300px;height: 300px;margin-left: 70px;"></div>
                </div>
              </div>
              <!--模型可视化tab页-->
              <div id="model_vis_tab" class="tab-pane" style="display: inline-block;width: 96%;">
                <div class="row">
                  <div class="col m3">
                    <!-- 模型总体信息表格 -->
                    <table id="model_general_table" style="display: none;">
                      <caption class="white-text" style="caption-side: top;text-align: center;width: 160px;">ANN模型基本信息</caption>
                      <tr>
                        <td>总层数</td>
                        <td id="model_total_layers"></td>
                      </tr>
                      <tr>
                        <td>总参数量</td>
                        <td id="model_total_param"></td>
                      </tr>
                      <tr>
                        <td>unit数量</td>
                        <td id="model_total_units"></td>
                      </tr>
                    </table>
                    <div id="ann_model_vis_img_parent_div">
                      <img id="ann_model_vis_img" style="width: 300px;height: 300px;display: none;">
                    </div>
                  </div>
                  <div class="col m3">
                      <!--模型详细信息表格-->
                      <table id="model_detail_table" style="display: none;">
                        <caption class="white-text" style="caption-side: top;text-align: center;width: 160px;">ANN模型各层信息</caption>
                        <thead>
                          <tr>
                            <td>名称</td>
                            <td>输出形状</td>
                            <td>参数量</td>
                          </tr>
                        </thead>
                        <!--通过加载模型的信息动态创建-->
                      </table>
                  </div>
                  <!--模型各层的可视化-->
                  <div id="model_layers_vis" class="col m3">
                    <div id="model_layers_vis_tab_caption" style="text-align: center;margin-top: 10px;display: none;">卷积与激活层输出可视化</div>
                    <!--动态创建-->
                    <div id="layers_vis_div" class="row" style="display: none;width: 320px;margin-top: 24px;">
                      <div class="col m2" style="width: 80px;font-size: small;">layer 名称</div>
                      <div class="col m2" style="width: 80px;font-size: small;">layer 编号</div>
                      <div class="col m7" style="width: 90px;font-size: small;">输出可视化</div>
                    </div>
                    <!-- 显示各层的参数量占比 -->
                    <div id="layer_param_percent_div" style="width: 560px;height: 400px;margin-left: -100px;"></div>
                  </div>
                </div>
              </div>
            </div>
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
      // 隐藏配置面板
      $("#toggle_config_panel_hide").on("click",()=>{
        document.getElementById("config_panel").style.display="none";
        document.getElementById("toggle_config_panel_show").style.display = "inline-block";
        document.getElementById("toggle_config_panel_show").style.float = "right";
        document.getElementById("toggle_config_panel_show").style.right = "-30px";
        document.getElementById("main_panel_parent_div").setAttribute("class","col-sm-12 row");
      });

      $("#hide_config_panel_img").on("click",()=>{
        // 重新显示
        document.getElementById("config_panel").style.display="inline-block";
        document.getElementById("toggle_config_panel_show").style.display = "none";
        document.getElementById("main_panel_parent_div").setAttribute("class","col-sm-10 row");
      });
    });
</script>
    `;
}