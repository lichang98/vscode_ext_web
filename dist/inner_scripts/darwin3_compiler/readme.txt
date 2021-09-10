--API
  --simulator.py
     Darwin III simulator

--scripts
   脚本工具

   --run_dwnc32.exe
      darwin code运行工具（生成配置+生成脉冲+汇编+运行+解析）

      生成配置(gen_config_dwnc)
      run_dwnc32 -connections connections.data [-vth vth] [-rsm rsm] [-gt] -skip_compile -skip_run
      通过连接文件，编译得到config.dwnc，可以设置阈值，膜电位复位模式和比较方式

      生成脉冲(gen_spk_dwnc)
      run_dwnc32 -spikes spikes.data -steps steps [-input_axon input_axon]-skip_compile -skip_run
      通过脉冲文件和输入轴突，生成spk.dwnc。

      汇编(gen_flit)
      run_dwnc32 [-prefix pre] -skip_run
      汇编pre_input.dwnc，得到微片flitin.txt

      运行(run)
      run_dwnc32 -skip_compile
      发送微片flitin.txt到Darwin III硬件运行，并得到返回结果微片recv_flitout.txt

      解析(analyse)
      run_dwnc32 -skip_compile -skip_run -analyse
      解析微片recv_flitout.txt，得到脉冲或查询信息。

   --flit_sender32.exe/flit_bin_sender32.exe
      微片发送器（运行）

   --flit_analyser32.exe
      微片解析器（解析）

   --bin2hex32.exe/hex2bin32.exe
      微片十六进制和二进制转换

   --run.py
      在目标应用目录下，运行Darwin III simulator，并同步运行在Darwin III硬件，比较结果。
      python run.py vth steps rsm

   --batch_test
      对一系列应用批量运行run.py

--apps
   应用

   --digit_vth50_rsm1_steps49
      数字手写识别应用

      --connections.data
         网络连接描述，pickle文件，字典类型，{(p_sid,p_tid) : [[n_sid0,n_tid0,w0], [n_sid1,n_tid1,w1], ... , [n_sidn,n_tidn,wn]]}
         描述source/target neuron population(全局唯一群编号区分)之间的连接，
         连接信息为source-target neuron(全局唯一神经元编号区分)之间的权重。

      --spikes.data
         输入脉冲描述，pickle文件，字典类型，{t : [id0, id1, ... , idn]}
         描述输入neuron population内部神经元发放情况，
         即t时刻，id0-idn(群内相对编号)神经元发放。

   --transform_digit_vth9_rsm2_steps49
      转换得到的数字手写识别应用

   --train_digit_vth1_rsm2_steps1999
      训练得到的数字手写识别应用

--sys
   Darwin III硬件系统配置

   --fin_flitin.bin
      释放Darwin III硬件的占用