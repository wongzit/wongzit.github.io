---
title: uv.Plotter
layout: page
permalink: /program/uvplotter/
---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
 MathJax.Hub.Config({
 tex2jax: {
 inlineMath: [['$', '$'] ],
 displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
 }
 });
</script>

<div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/uvPlotter/uvPlotter_wide.png" class="img-fluid" %}
</div>

Latest version: **1.0.0**, updated at 2022-08-03

## 1. Overview

### 1.1 About uv.Plotter

uv.**Plotter** is an open-source Python software for easily creating UV-vis spectrum from
Gaussian TD-DFT output file.

uv.**Plotter** is developed with Python 3.10.6, thus, users can run uv.**Plotter** through Python IDE. 
It can be freely download from the [GitHub page](https://github.com/wongzit/uvPlotter). The source code, 
executable file for macOS and Windows could be found for the latest release.

### 1.2 How It Works

uv.**Plotter** reads Gaussian output for TD-DFT calculation from .log or .out file(s), extracts oscillator 
strength and calculate the absorption curve using Gaussian-type brodening. Basic mathematic information could 
be found from [here](https://gaussian.com/uvvisplot/).

## 2. Install

### 2.1 Run with Source Code
If Python IDE is installed, uv.**Plotter** could be run from the source code. Python 3.10+ is 
recommended. You can download the latest version of Python from [homepage](https://www.python.org). 
uv.**Plotter** is running with external library *matplotlib*, *numpy*, *openpyxl* and *Pillow*, 
please make sure all of these *lib* are installed on your computer before running uv.**Plotter**.

### 2.2 Run with Executable File

#### 2.2.1 Use Pre-packaged Executable File

Executable file for macOS and Windows were pre-packaged. Download the executable file from [here](https://drive.google.com/drive/folders/1R4a3_g4UJeRxrL_nqazdxVGyOfrwSXdE?usp=sharing). For masOS users, save it in the `/Applications` 
folder, and you can run uv.**Plotter** from Launchpad. Fow Windows users, double click the *.exe* file (PS: make sure the *assets* folder 
is at same dictionary with *.exe* file).

#### 2.2.2 Common Issues

If the packaged programs cannot work due to system security problem, please refer to the following methods.

> If warning window: “Cannot open an app from an unidentified developer” showed up when you run packaged 
> executable file, please go to “System setting” -> “Security & Privacy” and click “Open Anyway”, click “Open”. 
> Then, you could run the program by double click.

## 3. Usage

Main window of uv.**Plotter** is shown following. Users can open the TD-DFT output file(s) by click *Open* button. 
Up to 10 output files could be read at once.

<p align="center">
<img alt="fig1" src="/assets/uvPlotter/fig1.png" style="width:600px;">
</p>

Click ![](/assets/uvPlotter/read_icon.png) *Plot* button to plot the UV-vis absorption spectra using built-in module.

<p align="center">
<img alt="fig2" src="/assets/uvPlotter/abs_spec_1660112178.png" style="width:500px;">
</p>

The *Label* is useful when user plot more than one output files, it indicates the short name of each absorption curve 
those shown in legend. The default *Label* is the file name of output files.

<p align="center">
<img alt="fig3" src="/assets/uvPlotter/abs_spec_1660112202.png" style="width:500px;">
</p>

Once the spectra windows were closed, a *.png* file would be saved at the same dictionary as the first output file. 
Using ![](/assets/uvPlotter/txt_icon.png) *Save .txt* and ![](/assets/uvPlotter/excel_icon.png) *Save .xlsx* buttons, the *.txt* and *.xlsx* files 
including plotting data points would be saved also. The *.txt* file also inculdes the oscillator strength data, and *.xlsx* includes a UV-vis absorption 
spectrum in the file.

Users can change the color and plotting parameters from the ![](/assets/uvPlotter/set_icon.png) *Setting* panel. The colors were defined from 
*matplotlib*, please refer to the *Appendix* for more color defination.

<p align="center">
<img alt="fig4" src="/assets/uvPlotter/fig2.png" style="width:500px;">
</p>

Default value of standard deviation is 0.4 eV, just same as *GaussView*. FYI, larger standard deviation value will give more broadening peaks in 
UV-vis absorption spectrum, while smaller value will give sharper peaks in spectrum.

If you want to change the plotting range, please modify the wavelength range in the setting window.


