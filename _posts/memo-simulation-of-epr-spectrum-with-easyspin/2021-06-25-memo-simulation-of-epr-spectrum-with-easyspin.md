---
layout: post
title:  "MEMO: Simulation of EPR Spectrum with EasySpin"
date:   2021-06-25 18:45:05 +0900
categories: software usage
---

**Note:** MATLAB and [EasySpin](https://easyspin.org) are necessary for simulation of EPR spectra.

**Contents**
- [1. Install EasySpin](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#1-install-easyspin)
- [2. Simulation of EPR spectrum](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#2-simulation-of-epr-spectrum)
- [2.1 S = 0.5 Case](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#21-s--05-case)
- [2.2 S > 0.5 Case](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#22-s--05-case)
- [2.3 Save numeric data from MATLAB figure](https://wongzit.github.io/memo-simulation-of-epr-spectrum-with-easyspin/#23-save-numeric-data-from-matlab-figurem)

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
