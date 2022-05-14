---
layout: post
title:  "MEMO: Install Gaussian and GaussView on Linux Machine"
date:   2022-05-213 18:45:05 +0900
categories: software usage
---

# 1. Install Gaussian 16

(1) Unzip the installer with command `tar -xvf xxx.tbz`.

(2) Move the decompressed folder to `/home/wangzhe`.

(3) Create the `Scratch` folder in `/home/wangzhe/g16`.

(4) Add following lines in `.bashrc` file:
```
export g16root=/home/wangzhe
export GAUSS_SCRDIR=/home/wangzhe/g16/Scratch
source /home/wangzhe/g16/bsd/g16.profile
```

(5) Create a `Default.Route` file including default CPU cores number and memory amount in `/home/wangzhe/g16`:
```
-M- 32GB
-P- 8
```
> 此文件中的设置优先级低于输入文件里的%mem和%nproc设置。因此，输入文件里没写%mem的时候才会用这里的-M-设置，输入文件里没写%nproc的时候才会使用这里的-P-设置（如果你既没在这里设-P-也没写%nproc，那么程序只用单核计算。如果你既没在这里设-M-也没写%mem，那么G09最多用256MB内存，G16最多用800MB内存）。

(6) In termial, go to `/home/wangzhe/g16`, execute `chmod 750 -R *` command.

# 2. Install GaussView 6

(1) Unzip the installer with command `tar -xvf xxx.tbz`.

(2) Move the decompressed folder to `/home/wangzhe`.

(3) Run `sudo yum install csh` (for Ubuntu: `sudo apt-get install csh`) to install **csh**.

(4) Add following lines in `.bashrc` file:
```
export GV_DIR=/home/wangzhe/gv/gview
export PATH="$PATH:/home/wangzhe/gv/gview"
alias gv=/home/wangzhe/gv/gview.sh
```

(5) Reboot the terminal window, run *GaussView* through command `gv`.

(6) If error shows there is no dynamic library, execute `sudo yum install mesa-libGLU.x86_64` comand to install.
