---
title: "A Melting Temperature Calculator"
permalink: /program/tmcalc/
layout: page
excerpt: tmcalc
comments: false
---

<p align = "center">
<img alt="tmcalc_wide" class="icon" src="/assets/program/TmCalc_wide.png">
</p>

Latest version: **1.0.1**, updated at 2022-01-25

## Usage

Input sequences separated by comma (','), and press ENTER key.

```
Input menu number to modify concentration, or input primer sequences:
e.g.: ATCGGACTAGACGAT,AGGGTCTTACAGAGCT,GGGCTTTAGAATAGA
>>> (User input) ATCGGACTAGACGAT,AGGGTCTTACAGAGCT
```

The GC% and Tm calculated with Nearest neighbor, Wallace and GC% methods would be displayed as following:
```
Sequence: ATCGGACTAGACGAT
GC = 46.7%, Length = 15
---------- Melting Temperature ----------
      Nearest Neighbor Method: 46.4
               Wallace Method: 44.0
                   GC% Method: 45.7

Sequence: AGGGTCTTACAGAGCT
GC = 50.0%, Length = 16
---------- Melting Temperature ----------
      Nearest Neighbor Method: 48.3
               Wallace Method: 48.0
                   GC% Method: 49.2
```

## Modify Parameters

The default concentrations are 50 mM of salt and 500 nM of primer. 
Users can modify these concentration by input menu number at first.

```
===================================
       Concentration Setting       
-----------------------------------
   1 - Salt conc. = 50 mM             <<<--- Default concentration of salt
   2 - Primer conc. = 500 nM          <<<--- Default concentration of primer
===================================
Input menu number to modify concentration, or input primer sequences:
e.g.: ATCGGACTAGACGAT,AGGGTCTTACAGAGCT,GGGCTTTAGAATAGA
1       <<<--- Modify the salt concentration
Input the concentration of salt, in mM:60       <<<--- Input the salt concentration

===================================
       Concentration Setting       
-----------------------------------
   1 - Salt conc. = 60.0 mM           <<<--- Modified concentration of salt
   2 - Primer conc. = 500 nM
===================================
Input menu number to modify concentration, or input primer sequences:
e.g.: ATCGGACTAGACGAT,AGGGTCTTACAGAGCT,GGGCTTTAGAATAGA

```

## Download

Executable file for **macOS** could be download from [here](https://wongzit.github.io/program/TmCalc).

## LICENSE
Tm.**Calc** is following MIT license. The LICENSE file could be found along with Tm.**Calc** source code.

```
MIT License
Copyright (c) 2021 Zhe Wang
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
