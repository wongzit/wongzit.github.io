---
layout: post
title:  "MEMO: Install Gaussian and GaussView on Linux Machine"
date:   2022-05-13 18:45:05 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
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
> The settings in this file have a lower priority than the %mem and %nproc settings in the input file. Therefore, the -M- setting here is used only when %mem is not written in the input file, and the -P- setting here is used only when %nproc is not written in the input file (if you neither set -P- nor %nproc here, then the program uses only single-core computing. If you neither set -M- nor write %mem here, then the G09 uses up to 256MB of memory and the G16 uses up to 800MB of memory).

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
