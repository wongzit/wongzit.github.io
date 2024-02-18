---
layout: post
title:  "Install Dalton on Linux Machine"
date:   2022-04-06 11:30:16 +0900
tags: [Dalton, Computation]
author: Zhe Wang
---

**Note:** This blog based on the Dalton 2022.0 version. OpenMPI is needed for parallel run on multi-cores, check [this](https://wongzit.github.io/install-orca-5-on-linux-machine/#2-install-openmpi) blog for more information about install OpenMPI on a linux machine.


## 1. Download and Setup Dalton from GitLab

Execute following commands:

```
git clone --recursive https://gitlab.com/dalton/dalton.git
cd dalton
./setup --mpi
cd build
make
```

## 2. Enviromental Variables

Assuming that the Dalton folder is download to `~/dalton`, create a folder in `~/dalton` for scratch files.

Add following environmental variables to `~/.bashrc`:

```
export PATH=~/dalton/build:$PATH
export DALTON_TMPDIR=~/dalton/scratch
alias dalton=~/dalton/build/dalton
```

## 3. Run Dalton

A `filename.dal` and a `filename.mol` are necessary for running calculation with Dalton. Execute following command to run Dalton with 6 cores.

```
dalton -N 6 filename filename
```

## Error: Cmake version is too old

If the Cmake version is too old to complie the Dalton code, run `pip3 install cmake --upgrade` to update the Cmake to the newest version. `Python3` should be installed first before running `pip3` command.

