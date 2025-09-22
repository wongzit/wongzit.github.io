---
title: "A Kinetics Analyzing Tool"
permalink: /program/pykinetics/
layout: page
excerpt: pykinetics
comments: false
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
    {% include figure.liquid loading="eager" path="assets/program/pyKinetics_wide.png" class="img-fluid" %}
</div>

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

Executable file for macOS is pre-packaged. Download the executable file from [here](https://drive.google.com/file/d/1Xog0z_sVIo2iDa9iQV3b-HGQ-FvKBPe7/view?usp=sharing) and save it in the `/Applications` 
folder, and you can run py.**Kinetics** from Launchpad.

#### 2.2.2 Common Issues

If the packaged programs cannot work due to system security problem, please refer to the following methods.

> If warning window: “Cannot open an app from an unidentified developer” showed up when you run packaged 
> executable file, please go to “System setting” -> “Security & Privacy” and click “Open Anyway”, click “Open”. 
> Then, you could run the program by double click.

## 3. Usage

### 3.1 Basic of py.Kinetics

The main py.**Kinetics** interface is illustrated in Figure 1.

<p align="center">
<img alt="pykinetics_fig_1" src="/assets/pyKinetics/fig1.png" style="width:400px;">
</p>

> Figure 1. Main window of py.**Kinetics**

It consists of these main components:

![](/assets/pyKinetics/open_icon.png) **Open**: Click on this button will bring up an Open file dialog. User can open a .*csv* 
file. The file name would be displayed in the bottom orange bar.  
![](/assets/pyKinetics/read_icon.png) **Read**: Plot the data from specified .*csv* file. A .*hdr* file is also needed to read 
time unit, if the .*hdr* file does not exist, a warning window (Figure 2) will show up and 
nanosecond ‘ns’ will be used for the time unit.  
![](/assets/pyKinetics/set_icon.png) **Setting**: Open the setting panel, see section 3.4.  
![](/assets/pyKinetics/web_icon.png) **Help**: Jump to the homepage of py.**Kinetics** with an online version of user manual.  
![](/assets/pyKinetics/quit_icon.png) **Quit**: Terminate the whole program. Quit the py.**Kinetics** by this button is 
recommended. Users do not need to close all active windows before quitting the py.**Kinetics**.

<p align="center">
<img alt="pykinetics_fig_2" src="/assets/pyKinetics/fig2.png" style="width:300px;">
</p>

> Figure 2. Warning window if .hdr file does not exist

### 3.2 Working with Transient Absorption Spectrum

If a multi-wavelength transient absorption data is read, 3D view plot will be displayed in a 
new window (Figure 3). If the .csv file is monochromic data, only time trace plot will be displayed (Figure 6, left).

<p align="center">
<img alt="pykinetics_fig_3" src="/assets/pyKinetics/fig3.png" style="width:400px;">
</p>

> Figure 3. 3D view window of a transient absorption spectra data

Basic functions in 3D-view window:

![](/assets/pyKinetics/htmp_icon.png) **Heatmap**: Show the heatmap in a new window.  
![](/assets/pyKinetics/tas_icon.png) **TAS**: Show 2D transient absorption spectrum in a new window.  
![](/assets/pyKinetics/dec_icon.png) **TAS in time trace**: Show time traces in a new window.  
![](/assets/pyKinetics/decayWaveIcon.png) **Time trace of single wavelength**: Show time trace at a single wavelength in a new 
window, select the wavelength from the list box.  

<p align="center">
<img alt="pykinetics_fig_4" src="/assets/pyKinetics/fig4.png" style="width:400px;">
<img alt="pykinetics_fig_5" src="/assets/pyKinetics/fig5.png" style="width:400px;">
<img alt="pykinetics_fig_6" src="/assets/pyKinetics/fig6.png" style="width:400px;">
</p>

> Figure 4. From top: heatmap, 2D transient absorption spectrum, time traces

For 2D transient absorption spectrum and time traces, user can highlight a single 
curve by the slider at the bottom of the window (Figure 5).

<p align="center">
<img alt="pykinetics_fig_8" src="/assets/pyKinetics/fig8.png" style="width:400px;">
<img alt="pykinetics_fig_7" src="/assets/pyKinetics/fig7.png" style="width:400px;">
</p>

> Figure 5. Highlight a single curve using slider

### 3.3 Exponential Fitting

py.**Kinetics** have 3 built-in exponential fitting model:

**Single exponential decay**: ![](/assets/pyKinetics/fit_icon_1.png)

$$ y = p_1 + p_3 \exp(-t/p_4) $$

**Second-order exponential decay**: ![](/assets/pyKinetics/fit_icon_2.png)

$$ y = p_1 + p_3 \exp(-t/p_4) + p_5 \exp(-t/p_5) $$

**Third-order exponential decay**: ![](/assets/pyKinetics/fit_icon_3.png)

$$ y = p_1 + p_3 \exp(-t/p_4) + p_5 \exp(-t/p_6) + p_7 \exp(-t/p_8) $$

In the time trace window, the fitting buttons are displayed at the bottom. To fitting 
a time trace, first users need to set the fitting region by specify the initial (red) 
and ending (green) lines using left and right click on the mouse, respectively. Then, 
click the fitting button will bring out the fitting result in a new window. The original 
data line, fitting line and difference line will be showed up. The fitted parameters will 
also be displayed on the screen (Figure 6). Initial guess of line fitting could be 
customized from setting panel (Section 3.4).

<p align="center">
<img alt="pykinetics_fig_9" src="/assets/pyKinetics/fig9.png" style="width:400px;">
<img alt="pykinetics_fig_10" src="/assets/pyKinetics/fig10.png" style="width:400px;">
</p>



> Figure 6. (Top) Monochromic time trace, (bottom) line fitting window

### 3.4 The Program Setting Panel

The program setting panel could be accessed from the main window. Users can customize 
the plot style and initial guess of line fitting (Figure 7). After setting the program 
parameters, click the “OK” button to save the changed parameters.

<p align="center">
<img alt="pykinetics_fig_11" src="/assets/pyKinetics/fig11.png" style="width:400px;">
</p>

> Figure 7. Setting panel window of py.**Kinetics**

#### 3.4.1 Time Trace Plot Style

Users can choose a plot style for the time trace from 10 plot styles. The default style is `Tableau`.

#### 3.4.2 Line Width & Color Style

Line width option is available for transient absorption and time traces plots, 
users can choose a value in the range from 0.5 to 5.0, with 0.5 step size. The 
default line width value is 0.5 (Figure 8). Line color and heatmap color map are 
supported by matplotlib color system. Users can use all colors and colormap those 
allowed by matplotlib. For more information, please refer to the **Appendix** and *matplotlib* 
documents. The default line color is `tab:blue` and default colormap is `plasma`.

<p align="center">
<img alt="pykinetics_fig_12" src="/assets/pyKinetics/fig12.png" style="width:400px;">
<img alt="pykinetics_fig_13" src="/assets/pyKinetics/fig13.png" style="width:400px;">
</p>

> Figure 8. Time traces with different line width: 0.5 (top) and 1.5 (bottom)

## Appendix I Line Color

### 1. Use color name colorpalette

*Matplotlib* has several built-in colors, users can use these colors by inputting the color name directly.

<p align="center">
<img alt="pykinetics_colorpalette" src="/assets/pyKinetics/colorpalette.png" style="width:400px;">
</p>

### 2. Use single character

The following eight major colors can be specified with a single character, consisting of the 
three primary colors of light (RGB), the three primary colors of color (CMY), and black and white (KW).

<p align="center">
<img alt="pykinetics_onechar" src="/assets/pyKinetics/onechar.png" style="width:400px;">
</p>

### 3. Use HEX color codes

*Matplotlib* allows users to use hexadecimal number those used in HTML and CSS, 
such as `#ff0000` (red), `#000000` (black). Here are some examples:

<p align="center">
<img alt="pykinetics_hex" src="/assets/pyKinetics/hex.png" style="width:400px;">
</p>

### 4. Use greyscale

Color can also be specified in a grayscale from 0.0 (black) to 1.0 (white).

<p align="center">
<img alt="pykinetics_grey" src="/assets/pyKinetics/grey.png" style="width:400px;">
</p>

> Although RGB code (e.g.: `[1.0 0.5 0.0]`) is supported by matplotlib for color specifying, but due 
to variable type problem, RGB code is not allowed in py.**Kinetics**.

## Appendix II Colormap

*Matplotlib* has plenty of built-in colormaps. In py.**Kinetics**, users can easily access 
these colormap by colormap code. All available colormap are listed following.

<p align="center">
<img alt="pykinetics_cmap" src="/assets/pyKinetics/cmap.png" style="width:400px;">
</p>

## LICENSE
py.**Kinetics** is following MIT license. The LICENSE file could be found along with py.**Kinetics** source code.

```
MIT License
Copyright (c) 2021 Zhe Wang & Takuma Miyamura
Permission is hereby granted, free of charge, to any person obtaining 
a copy of this software and associated documentation files (the "Sof-
tware"), to deal in the Software without restriction, including with-
out limitation the rights to use, copy, modify, merge, publish, dist-
ribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the f-
ollowing conditions:
The above copyright notice and this permission notice shall be inclu-
ded in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPR-
ESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCH-
ANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CL-
AIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, T-
ORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOF-
TWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
