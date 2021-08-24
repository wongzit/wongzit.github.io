---
layout: post
title:  "Install ORCA 5 on Linux Machine"
date:   2021-07-02 12:01:59 +0900
categories: software install
---

ORCA got it major update to 5.0.0 on July, 1st, 2021. Many new features are introduced, especially the new SHARK module. This blog will give an instruction on how to install ORCA on a Linux computer.

## Download necessary packages

(1) Download ORCA package from ORCA [homepage](https://orcaforum.kofo.mpg.de), here I install the dynamically linked version, the name is `ORCA 5.0.0, Linux, x86-64, shared-version, .tar.xz`.

(2) Parallel running of ORCA relies on the OpenMPI 4.1.1, download the installer from OpenMPI [homepage](https://www.open-mpi.org). I used the `openmpi-4.1.1.tar.bz2` file.

## Install OpenMPI

For running ORCA in serial, skip this step.

 (1) Execute following commands:

```
tar -xjf openmpi-4.1.1.tar.bz2
cd openmpi-4.1.1
./configure --prefix=/home/wangzhe/openmpi411
                                    # OpenMPI will be installed in 
                                    #  /home/wangzhe/openmpi411
make -j8         # Use 8 CPU cores to compile
make install
```

(2) Add following environmental variables to `~/.bashrc`:

{% highlight xml %}
export PATH=/home/wangzhe/openmpi411/bin:$PATH
export LD_LIBRARY_PATH=/home/wangzhe/openmpi411/lib:$LD_LIBRARY_PATH
{% endhighlight %}

(3) Execute `mpiexec -V` to check the installation was succeeded or not.

## Install ORCA 5

(1) Unzip the install file:

{% highlight xml %}
tar -Jxvf orca_5_0_0_linux_x86-64_shared_openmpi411.tar.xz
{% endhighlight %}

(2) Rename the ORCA folder (default name is too long):

{% highlight xml %}
mv ./orca_5_0_0_linux_x86-64_shared_openmpi411 ./orca500
{% endhighlight %}

(3) Add following variables to `~/.bashrc`:

{% highlight xml %}
export PATH=/home/wangzhe/orca500:$PATH
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/home/wangzhe/orca500
alias orca='/home/wangzhe/orca500/orca'
{% endhighlight %}

(4) Re-enter the terminal window, execute `orca` to run ORCA 5.0.0.
