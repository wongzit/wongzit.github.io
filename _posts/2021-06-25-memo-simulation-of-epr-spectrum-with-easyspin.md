---
layout: post
title:  "MEMO: Simulation of EPR Spectrum with EasySpin"
date:   2021-06-25 18:45:05 +0900
tags: [ORCA, Computation]
author: Zhe Wang
---

**Note:** Softwares [MATLAB](https://jp.mathworks.com/products/matlab.html) and [EasySpin](https://easyspin.org) are necessary for simulation of EPR spectra.

**Contents**
- [1. Install EasySpin](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#1-install-easyspin)
- [2. Simulation of EPR spectrum](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#2-simulation-of-epr-spectrum)
- [2.1 S = 0.5 Case](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#21-s--05-case)
- [2.2 S > 0.5 Case](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#22-s--05-case)
- [2.3 Save numeric data from MATLAB figure](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#23-save-numeric-data-from-matlab-figurem)
- [3. Running Matlab and EasySpin on KYUSHU-ITO Computer](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#3-running-matlab-and-easyspin-on-kyushu-ito-computer)
- [3.1 Run Matlab](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#31-run-matlab)
- [3.2 Install EasySpin to Matlab Path (For first time running)](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#32-install-easyspin-to-matlab-path-for-first-time-running)

# 1. Install EasySpin

1. Download the EasySpin zip file and unpack it to a folder of your choice, e.g., `C:\ or /var/myfiles/`. Once unpacked, EasySpin is contained in a subfolder which in turn contains several subfolders.
2. Launch MATLAB and go to *Home* -> *Set Path*. Remove any folders containing older EasySpin installations from the MATLAB search path. Add the EasySpin subfolder `easyspin-x.y.z/easyspin` to the MATLAB search path by clicking on "Add Folder...", selecting the `easyspin-x.y.z/easyspin` subfolder from your new EasySpin directory, and clicking on "Save".
3. In MATLAB, type `easyspin` at the command prompt. This will display information about the installed version of EasySpin

# 2. Simulation of EPR spectrum

## 2.1 S = 0.5 Case

After EPR calculation with ORCA, a `.prop` file would be generated along with `.out` file. Use EasySpin's `orca2easyspin` to read calculated 
data from `.prop` file.
```
Sys = orca2easyspin('tempo.prop')
Sys.lwpp = 1;                              % Line broadening
Exp.mwFreq = 9.4;                          % Spectrometer frequency, in GHz
Exp.Range = [325 350];                     % Lower and upper limit of the field sweep range, in mT
pepper(Sys,Exp)                            % Plot spectrum
```

## 2.2 S > 0.5 Case

Exacute following command (before `%` symbol) in MATLAB, after running of `pepper(Sys,Exp)`, EPR spectrum would be displayed in current window.

```
Sys.S = 1;                                 % S = 1 for triplet and S = 2 for quintet states
Sys.g = 2.0023;                            % g factor
convert = 100*clight/1e6;                  % cm^-1 -> MHz conversion factor
Sys.D = [0.0100000 0.002000]*convert;      % Input D and E value, in cm^-1
Sys.lwpp = 6;                              % Gaussian-type line broadening
Exp.mwFreq = 9.4;                          % Spectrometer frequency, in GHz
Exp.Range = [100 500];                     % Lower and upper limit of the field sweep range, in mT
pepper(Sys,Exp)                            % Plot spectrum
```

## 2.3 Save numeric data from MATLAB figure

If you want to save numeric data from MATLAB figure, first, please save the EPR spectrum as MATLAB figure file (`xxx.fig`) and then, run following command. 

```
open("C:\Desktop\xxx.fig");                % input the path to MATLAB figure file
lh = findall(gca,'type','line');
xc = get(lh,'xdata');
yc = get(lh,'ydata');
```

The x axis and y axis data would be saved in `xc` and `yc` sheet, respectively.

<p align = "center">
<img alt="epr" src="/assets/blog/figure121.png" style="height:56px; background-color:transparent;">
</p>

Now, you can copy the data to Excel etc., and plot the EPR spectrum.

# 3. Running Matlab and EasySpin on KYUSHU-ITO Computer

## 3.1 Run Matlab

Make sure the [*XQuartz*](http://xquartz.org) has been installed on your computer (Mac), run following command to login:
```
ssh -Y -i keydir/ito_id_rsa -l p10101b ito.cc.kyushu-u.ac.jp
```
where `p10101b` is your account ID. If you could see following error message in *XQuartz* terminal window, run `ssh-keygen -R ito.cc.kyushu-u.ac.jp` and then, try to login again.
```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

Execute followinf commands to run Matlab:

```
ulimit -v 31457280
module load matlab/R2019b
matlab
```

Wait several minutes, the Matlab window would be popped-up.

## 3.2 Install EasySpin to Matlab Path (For first time running)

Download the EasySpin installer from [homepage](https://www.easyspin.org) and unzip it, and put the unzipped folder in your ITO folder, for example, the folder is located at`/home/usr1/p10101b`, execute command `addpath /home/usr1/p10101b/easyspin-5.2.28/easyspin`.

Then, execute `easyspin` command, if you could see follwoing information, the EasySpin has been installed.
```
Release:          5.2.28 (2020-01-31)
Expiry date:      31-Jan-2022
Folder:           /home/usr1/p10101b/easyspin-5.2.28/easyspin
MATLAB version:   9.7.0.1261785 (R2019b) Update 3
Platform:         Linux 3.10.0-514.26.2.el7.x86_64
mex-files:        mexa64, ok
System date:      12-Oct-2020 22:07:17
Temp dir:         /tmp/
```
