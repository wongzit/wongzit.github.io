---
layout: post
title:  "MEMO: Simulation of EPR Spectrum with EasySpin"
date:   2021-07-02 18:45:05 +0900
categories: software usage
---

## S > 0.5 Case, plot EPR spectrum with EasySpin

```
Sys.S = 1;      % S = 1 for triplet and S = 2 for quintet states
Sys.g = 2.0023;      % g factor
convert = 100*clight/1e6;      % cm^-1 -> MHz conversion factor
Sys.D = [0.0100000 0.002000]*convert;      % input D and E value,
                                             in cm^-1
Sys.lwpp = 6;      % Gaussian-type line broadening
Exp.mwFreq = 9.4;      % Spectrometer frequency, in GHz
Exp.Range = [100 500];      % Lower and upper limit of the field 
                              sweep range, in mT
pepper(Sys,Exp)
```

## Save numeric data from Matlab figure

```
open(fname);      % fname = path to Matlab figure file
lh = findall(gca,'type','line');
xc = get(lh,'xdata');
yc = get(lh,'ydata');
```
