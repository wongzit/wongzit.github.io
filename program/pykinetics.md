---
title: "A Kinetics Analyzing Tool"
permalink: /program/pykinetics/
layout: page
excerpt: pykinetics
comments: false
---

<p align = "center">
<img alt="pykinetics" class="icon" src="/assets/program/pyKinetics_wide.png">
</p>

Latest version: **1.0.0**, updated at 2021-11-10

## 1. Overview

### 1.1 About py.Kinetics

py.**Kinetics** is an open-source Python software for kinetics analyses, designed for 
UNISOKU laser flash photolysis measurements on Mac computers. We created this program to 
solve the problem that the official *UNISOKU S&K* (kinetics analyzing software) could only be run on Windows PC.

py.Kinetics is developed with Python 3.9.6, thus, users can run py.Kinetics through Python IDE. 
It can be freely download from the [GitHub page](https://github.com/wongzit/pyKinetics). The source code, 
executable file for macOS could be found for the latest release.

### 1.2 How It Works

py.**Kinetics** reads transient absorption data from a .csv file. Since the program is designed 
for UNISOKU spectrometer, a .*hdr* file which has a same file name with .*csv* file is also needed to read time unit.

### 1.3 Testing Platform
py.**Kinetics** has been test on following platform:
1. MacBook Pro (M1 Pro, 2021), macOS 12.0.1
2. Mac mini (i5-8500B, 2018), macOS 12.0.1
3. Intel CoreTM i7-10700 PC, Microsoft Windows 11 Education (Source code mode)

## 2. Install

### 2.1 Run with Source Code
If Python IDE is installed, py.**Kinetics** could be run from the source code. Python 3.7+ is 
recommended. You can download the latest version of Python from [homepage](https://www.python.org). 
py.**Kinetics** is running with external library *matplotlib*, *numpy*, *scipy* and *Pillow*, 
please make sure all of these *lib* are installed on your computer before running py.**Kinetics**.

### 2.2 Run with Executable File

#### 2.2.1 Use Pre-packaged Executable File

Executable file for macOS is pre-packaged. Download the executable file and save it in the `/Applications` 
folder, and you can run py.**Kinetics** from Launchpad.

#### 2.2.2 Common Issues

If the packaged programs cannot work due to system security problem, please refer to the following methods.

> If warning window: “Cannot open an app from an unidentified developer” showed up when you run packaged 
> executable file, please go to “System setting” -> “Security & Privacy” and click “Open Anyway”, click “Open”. 
> Then, you could run the program by double click.
