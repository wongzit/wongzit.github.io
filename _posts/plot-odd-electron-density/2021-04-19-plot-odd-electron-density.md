---
layout: post
title:  "Plot Odd Electron Density"
date:   2021-04-19 19:01:33 +0900
categories: computation
---

Source of this blog: [ResearchGate](https://www.researchgate.net/post/What-is-the-procedure-for-plotting-odd-electron-density-plots-of-organic-diradicals) 

**1. Open .fchk file in GaussView**

**2. Generate .cube files of HOMO and LUMO (for unrestricted calculation, alpha and beta are separated).**

<p align="center">
<img alt="oddfig1" src="/assets/blog/figure71.png">
</p>

**3. Generate combined HOMO and LUMO by adding two cubes of alpha and beta orbitals.**

<p align="center">
<img alt="oddfig2" src="/assets/blog/figure72.png" style="height:400px;">
</p>

**4. Square the new generated HOMO and LUMO cubes.**

<p align="center">
<img alt="oddfig3" src="/assets/blog/figure73.png" style="height:300px;">
</p>

**5. Add two squared cubes.**

<p align="center">
<img alt="oddfig4" src="/assets/blog/figure74.png">
</p>

**6. Plot.**

<p align="center">
<img alt="oddfig5" src="/assets/blog/figure75.png" style="height:300px;">
</p>

> Input file of this calculation:

```
%nprocshared=4
%mem=10GB
%chk=indenyl_opt.chk
#p opt freq ub3lyp/6-31g(d)

Indenyl_optimization//b3lyp/6-31g*

0 2
 H                 -0.21700000    1.98300000   -1.28800000
 C                 -0.14700000    2.17800000   -0.22700000
 C                  0.03900000    2.64800000    2.57900000
 C                 -0.10100000    1.12300000    0.68200000
 C                 -0.09800000    3.48400000    0.28500000
 C                 -0.00600000    3.71500000    1.67000000
 C                 -0.01000000    1.35400000    2.06400000
 H                 -0.13100000    4.32400000   -0.40000000
 H                  0.03000000    4.73300000    2.04400000
 H                  0.10900000    2.80800000    3.64700000
 C                  0.01600000    0.12000000    2.71400000
 H                  0.08300000   -0.04900000    3.78800000
 C                 -0.05900000   -0.87600000    1.72700000
 H                 -0.06100000   -1.95000000    1.90600000
 C                 -0.13200000   -0.25500000    0.46800000
 H                 -0.20000000   -0.76500000   -0.49200000
 
```
