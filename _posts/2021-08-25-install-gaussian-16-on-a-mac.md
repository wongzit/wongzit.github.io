---
layout: post
title:  "Install Gaussian 16 on a Mac"
date:   2021-08-25 22:13:16 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

**Note:** Official installation guide could be found [here](https://gaussian.com/g16/g16m_install.pdf).

**Contents**

- [1. Unzip installation file](https://wongzit.github.io/install-gaussian-16-on-a-mac/#1-unzip-installation-file)
- [2. Set Unix environment variables](https://wongzit.github.io/install-gaussian-16-on-a-mac/#2-set-unix-environment-variables)
- [3. Check installation](https://wongzit.github.io/install-gaussian-16-on-a-mac/#3-check-installation)

# 1. Unzip installation file

1. Find the `M*.tbz` file and double-click, the `g16` folder would be generated at current dictionary after finishing the decompressing.
2. Create a `Scratch` folder in the `g16` folder.
3. Move `g16` folder to the `/Application`.

# 2. Set Unix environment variables

1. Open *Terminal*.
2. Run `echo $SHELL` command, if `/bin/bash` is displayed in the command windows, you are running **bash** shell, if `/bin/tcsh` is displayed, you are running **tcsh** shell.
3. If the current shell is not **bash** or **tcsh**, run `chsh -s /bin/bash`, and refer to the following section **2.1**.

## 2.1 If you are running bash shell

1. Run following command:
```
cd
touch .bash_profile
ln -s .bash_profile my_profile
```
2. Go to `/Users/your_user_name` in Finder, and double-click the `my_profile` file (open it in *TextEdit*). Add following contents to the `my_profile` file:
```
export g16root=/Applications
. $g16root/g16/bsd/g16.profile
export GAUSS_SCRDIR=/Applications/g16/Scratch
```

## 2.2 If you are running tcsh shell

1. Run following command:
```
cd
touch .login
ln -s .login my_login
```
2. Go to `/Users/your_user_name` in Finder, and double-click the `my_login` file (open it in *TextEdit*). Add following contents to the `my_login` file:
```
setenv g16root /Applications
source $g16root/g16/bsd/g16.login
setenv GAUSS_SCRDIR /Applications/g16/Scratch
```

# 3. Check installation

Run `g16` in *Terminal*, if `Entering Gaussian System, Link 0=g16` is displayed in current windows, the Gaussian 16 is successfully installed on your computer.
