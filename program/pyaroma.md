---
title: "An Aromaticity Analyzer"
permalink: /program/pyaroma/
layout: page
excerpt: pyaroma
comments: false
---

<p align = "center">
<img alt="pyaroma" class="icon" src="/assets/program/pyAroma_rm.png">
</p>

Latest version: **1.0.0**, updated at 2021-08-29

## statement of need

py.**Aroma** is a Python program for aromaticity analyses, including ICSS, NICS, HOMA analyses tool. Users can easily create input files for NICS, 2D-ICSS and 3D-ICSS calculations and process output files of HOMA and ICSS calculations.

## how to run

### run with source code

If Python IDE is already installed, py.**Aroma** could be run with the source code. Python 3.9+ is recommended. You can download the newest version of Python from [homepage](https://www.python.org). py.**Aroma** is running with external library *matplotlib* and *numpy*, please make sure *matplotlib* and *numpy* are already installed on your computer before running py.**Aroma**.

For macOS and Linux users who want to run with source code, please run following command in terminal:

`python3 /path_to_pyAroma/pyAroma_src_v_1_0_0.py`

For Windows users, please execute following command in PowerShell or Command Prompt (*cmd.exe*):

`py3 /path_to_pyAroma/pyAroma_src_v_1_0_0.py`

### run with executable file

**use pre-packaged executable file**

Executable files are pre-packaged in *execufiles* folder.

For macOS/Linux users, you may need to add permission to the executable file before running for the first time. Assume the executable file is located at `/home/user/pyAroma/execufiles/pyAroma_mac_v_1_0_0`, run below command to add executable permission to it.

```
chmod +x /home/user/pyAroma/execufiles/pyAroma_mac_v_1_0_0
```

For macOS/Linux users, you can add following contents to the *my_profile* (for macOS) or *.bashrc* (for Linux) file. Then, you can run py.**Aroma** with simple command `pyarom`.

```
alias pyaroma=/home/user/pyAroma/execufiles/pyAroma_mac_v_1_0_0
```

For Microsoft Windows users, you can just run py.**Aroma** by double clicking the *pyAroma_win_v_1_0_0.exe* file.

**package from source code**

If the pre-packaged executable files do not work normally, please try to run with source code, or package from source code with packaging tools like pyinstaller. The *pyinstaller* could be installed from `pip`:

For macOS/Linux:   `pip3 install pyinstaller numpy matplotlib`

For Microsoft Windows:   `pip install pyinstaller numpy matplotlib`

And then, run following command in command window:

```
pyinstaller /path_to_pyAroma/pyAroma_src_v_1_0_0.py --onefile
```
The packaged executable file will be generated in the dist folder name as *pyAroma_src_v_1_0_0.exe*. Only *.exe* file is needed, you can delete other files.

## usage

For detail information, please refer to the user manual.

## download

- py.**Aroma** on [GitHub](https://github.com/wongzit/pyAroma), source code could be found here
- Executable files for macOS, Linux and Microsoft Windows on [Google Drive](https://drive.google.com/drive/folders/1-EtvkVDkh5snZns4pKYs2QX1ddMZc1pt?usp=sharing)