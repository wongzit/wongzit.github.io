---
layout: post
title:  Gaussian 16 Calculation Task Continuation
date:   2024-02-13 00:20:36 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

### 1. Geometry Optimization

**Prerequisite:** A checkpoint file (*.chk*) from a previous calculation is required.

**Continuation Method:** Add `opt=restart` to the route section.

##### Example

**Original input file:**

```
%chk=xxx.chk
#p opt=QST2 ...
```

**Continuation input file:**

```
%chk=xxx.chk
#p opt=(QST2,restart) ...
```

**Additional Notes:**

1. If there are other options after the `opt` keyword in the original input file, you can simply add `restart`.
2. If the original input file contains `CalcFC` or `RCFC` options, you can ignore them in the continuation input file and use the `restart` option directly.
3. To resume geometry optimization from a specific step, use the `step=n` option in the `geom` keyword. For example:
```
%oldchk=xxx.chk
%chk=new_xxx.chk
#p opt geom=(allcheck,step=6) guess=read
```

### 2. IRC

**Prerequisites:**

- The calculation is not finished.
- Or the calculation is finished, but you want to continue the calculation with more steps.

**Continuation Method:** Use the `IRC=restart` command.

##### Examples

**For unfinished calculation:**

```
%chk=xxx.chk
#p IRC=restart ...
```

**Calculation finished, adding more steps:**

```
%chk=xxx.chk
#p IRC=(restart,maxpoint=20) ...
```

### 3. Vibrational Analysis

**Prerequisites:**

- In addition to the *.chk* file, you also need the *.rwf* file.
- The *.rwf* file is located in the **Scratch** folder.

**Continuation Method:**

1. Add the `%rwf` section to the input file to specify the path to the *.rwf* file.
2. Use the `restart` keyword.

##### Example

```
%chk=xxx.chk
%rwf=/path/filename.rwf
# restart
```

**Obtaining the .rwf File Path:**

The *.rwf* file name is written at the beginning of the *.log* or *.out* output file, for example:

```
Entering Gaussian System, Link 0=g16
Initial command:
/home/wangzhe/g16/l1.exe "/home/wangzhe/g16/Scratch/Gau-73779.inp" -scrdir="/home/wangzhe/g16/Scratch/"
Default is to use a total of  16 processors:
                              16 via shared-memory
                               1 via Linda
Entering Link 1 = /home/wangzhe/g16/l1.exe PID=     73781.
```

In this example, the path to the *.rwf* file is:

```
/home/wangzhe/g16/Scratch/Gau-73781.rwf
```