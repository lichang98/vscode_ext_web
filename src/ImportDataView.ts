import * as vscode from 'vscode';

export class ImportDataShow{
    public static getView(img1:vscode.Uri, img2:vscode.Uri, img3:vscode.Uri, img4:vscode.Uri):string{
        return `<!DOCTYPE html>
        <html>
        <!-- Latest 点击新建项目后的页面 -->
        <head>
          <meta charset="UTF-8">
          <title>Darwin IDE</title>
        </head>
        
        <body>
             <!-- 数据可视化区域 -->
             <div class="col m6 z-depth-1">
                <!-- <img src="./resources/img_1.jpg" style="width: 100px;height: 100px; padding: 1px;">
                <img src="./resources/img_3.jpg" style="width: 100px;height: 100px; padding: 1px;">
                <img src="./resources/img_5.jpg" style="width: 100px;height: 100px; padding: 1px;">
                <img src="./resources/img_7.jpg" style="width: 100px;height: 100px; padding: 1px;"> -->
                <div id="img_carousel" class="carousel" style="height: 300px; width: 400px;">
                  <a class="carousel-item" href="#one!"><img src="${img1}"></a>
                  <a class="carousel-item" href="#two!"><img src="${img2}"></a>
                  <a class="carousel-item" href="#three!"><img src="${img3}"></a>
                  <a class="carousel-item" href="#four!"><img src="${img4}"></a>
                </div>
                <div id="histgram" style="width: 400px; height: 300px;margin-top: 30px;"></div>
                <div id="dist_pie" style="width: 400px;height: 300px; margin-top: 30px;"></div>
                <div id="data_heatmap" style="width: 400px; height: 300px; margin-top: 30px;"></div>
              </div>
        
              <!--模型可视化区域-->
              <div class="col m4 z-depth-1">
                <div id="sankey" style="width: 400px; height: 300px;margin-top: 30px;"></div>
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.0/echarts.min.js" integrity="sha512-ZRdjJAYP8Kij8Lkln9uiGj0jIrMDLAALm1ZB2b3VfV9XJ0nR4zbJmHKB42/A4tgMlZS4DTPnSAmcYRoS0dginA==" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
        <script>
        
        document.addEventListener('DOMContentLoaded', function() {
              var carouselDiv = document.getElementById("img_carousel");
              var carouselInst = M.Carousel.init(carouselDiv,{});
            });
        
        
                // 图片直方图绘制
                var echartHistgram = echarts.init(document.getElementById("histgram"));
            // 指定图表的配置项和数据
            var option = {
              title: {
                  text: '像素灰度直方图'
              },
              tooltip: {},
              legend: {
                  data:['累计个数']
              },
              xAxis: {
                  data: ["0~41","42~83","84~125","126~167","168~209","201~255"],
                  axisLabel:{
                    rotate: 30,
                    interval: 0
                  }
              },
              yAxis: {},
              series: [{
                  name: '像素累计',
                  type: 'bar',
                  data: [5, 20, 36, 10, 10, 20]
              }]
            };
            echartHistgram.setOption(option);
            // 数据类别分布饼图
            var echartDistPie = echarts.init(document.getElementById("dist_pie"));
            option = {
                  title: {
                      text: '数据分布',
                      left: 'center',
                      top: 20,
                      textStyle: {
                          color: '#34495E'
                      }
                  },
        
                  tooltip: {
                      trigger: 'item',
                      formatter: '{a} <br/>{b} : {c} ({d}%)'
                  },
        
                  visualMap: {
                      show: false,
                      min: 80,
                      max: 600,
                      inRange: {
                          colorLightness: [0, 1]
                      }
                  },
                  series: [
                      {
                          name: '数据占比',
                          type: 'pie',
                          radius: '55%',
                          center: ['50%', '50%'],
                          data: [
                              {value: 335, name: '类别1'},
                              {value: 310, name: '类别2'},
                              {value: 274, name: '类别3'},
                              {value: 235, name: '类别4'},
                              {value: 400, name: '类别5'}
                          ].sort(function (a, b) { return a.value - b.value; }),
                          roseType: 'radius',
                          label: {
                              color: '#34495E'
                          },
                          labelLine: {
                              lineStyle: {
                                  color: '#34495E'
                              },
                              smooth: 0.2,
                              length: 10,
                              length2: 20
                          },
                          itemStyle: {
                              color: '#c23531',
                              shadowBlur: 200,
                              shadowColor: 'rgba(0, 0, 0, 0.5)'
                          },
        
                          animationType: 'scale',
                          animationEasing: 'elasticOut',
                          animationDelay: function (idx) {
                              return Math.random() * 200;
                          }
                      }
                  ]
            };
            echartDistPie.setOption(option);
            // 数据热力图
            var echartHeatMap = echarts.init(document.getElementById("data_heatmap"));
            var xAxis = ['0','1','2','3','4','5','6','7','8','9'];
            var yAxis = ['0','1','2','3','4','5','6','7','8','9'];
            var data=[[0, 0, 48], [0, 1, 51], [0, 2, 95], [0, 3, 21], [0, 4, 97], [0, 5, 15], [0, 6, 41], [0, 7,
         82], [0, 8, 40], [0, 9, 31], [1, 0, 11], [1, 1, 90], [1, 2, 52], [1, 3, 15], [1, 4, 71], [
        1, 5, 14], [1, 6, 58], [1, 7, 30], [1, 8, 29], [1, 9, 31], [2, 0, 21], [2, 1, 49], [2, 2, 2
        ], [2, 3, 8], [2, 4, 19], [2, 5, 17], [2, 6, 53], [2, 7, 35], [2, 8, 93], [2, 9, 29], [3,
        0, 23], [3, 1, 16], [3, 2, 72], [3, 3, 57], [3, 4, 50], [3, 5, 38], [3, 6, 48], [3, 7, 39],
         [3, 8, 94], [3, 9, 72], [4, 0, 59], [4, 1, 14], [4, 2, 78], [4, 3, 31], [4, 4, 93], [4, 5,
         27], [4, 6, 23], [4, 7, 27], [4, 8, 85], [4, 9, 42], [5, 0, 23], [5, 1, 73], [5, 2, 70], [
        5, 3, 31], [5, 4, 88], [5, 5, 69], [5, 6, 98], [5, 7, 97], [5, 8, 22], [5, 9, 3], [6, 0, 63
        ], [6, 1, 52], [6, 2, 57], [6, 3, 30], [6, 4, 42], [6, 5, 83], [6, 6, 40], [6, 7, 39], [6,
        8, 93], [6, 9, 35], [7, 0, 52], [7, 1, 46], [7, 2, 84], [7, 3, 99], [7, 4, 68], [7, 5, 41],
         [7, 6, 3], [7, 7, 41], [7, 8, 99], [7, 9, 97], [8, 0, 81], [8, 1, 41], [8, 2, 13], [8, 3,
        33], [8, 4, 36], [8, 5, 37], [8, 6, 96], [8, 7, 92], [8, 8, 34], [8, 9, 5], [9, 0, 18], [9,
         1, 81], [9, 2, 59], [9, 3, 72], [9, 4, 54], [9, 5, 96], [9, 6, 73], [9, 7, 77], [9, 8, 79]
        , [9, 9, 61]];
        
          data = data.map(function (item) {
              return [item[1], item[0], item[2] || '-'];
          });
        
          option = {
            title: {
                      text: '热力图',
                      left: 'center',
                      top: 0,
                      textStyle: {
                          color: '#ccc'
                      }
              },
              tooltip: {
                  position: 'top'
              },
              animation: false,
              grid: {
                  height: '50%',
                  top: '10%'
              },
              xAxis: {
                  type: 'category',
                  data: xAxis,
                  splitArea: {
                      show: true
                  }
              },
              yAxis: {
                  type: 'category',
                  data: yAxis,
                  splitArea: {
                      show: true
                  }
              },
              visualMap: {
                  min: 0,
                  max: 100,
                  calculable: true,
                  orient: 'horizontal',
                  left: 'center',
                  bottom: '15%'
              },
              series: [{
                  name: 'Punch Card',
                  type: 'heatmap',
                  data: data,
                  label: {
                      show: true
                  },
                  emphasis: {
                      itemStyle: {
                          shadowBlur: 10,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                  }
              }]
          };
            echartHeatMap.setOption(option);
        
            // 模型桑基图
            var echartSankey = echarts.init(document.getElementById("sankey"));
            var nodeList = [
              {"name":"Input Layer"},
              {"name":"Dense Layer 1024"},
              {"name":"Dense Layer 512"},
              {"name":"Dense Layer 256"},
              {"name":"Dense Layer 32"},
              {"name":"Dense Layer 10"}
            ];
        
            var linkList = [
              {"source":"Input Layer","target":"Dense Layer 1024", value:4560},
              {"source":"Dense Layer 1024","target":"Dense Layer 512", value:2345},
              {"source":"Dense Layer 512","target":"Dense Layer 256", value:1245},
              {"source":"Dense Layer 256","target":"Dense Layer 32", value:978},
              {"source":"Dense Layer 32","target":"Dense Layer 10", value:900},
            ];
            option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        type: 'sankey',
                        data: nodeList,
                        links: linkList,
                        focusNodeAdjacency: 'allEdges',
                        itemStyle: {
                            borderWidth: 1,
                            borderColor: '#aaa'
                        },
                        lineStyle: {
                            color: 'source',
                            curveness: 0.5
                        }
                    }
                ]
            };
            echartSankey.setOption(option);
        </script>
        </html>`;
    }
}