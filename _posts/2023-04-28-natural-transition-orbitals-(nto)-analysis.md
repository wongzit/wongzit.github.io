---
layout: post
title:  "Natural Transition Orbitals (NTO) Analysis"
date:   2023-04-28 16:26:56 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

# 1. Preface

When computing excited sates using CIS, TDHF, TDDFT methods, the transition modes can 
be expressed as a linear combination of different ways of transition between the occupied 
orbitals in the ground state and the virtual orbitals. In many cases, only one type of transition has a larger contribution. 
For example, following is a *Gaussian* output of acrolein @`RIS/6-31+G*`.

```
 Excited State   2:      Singlet-A'     7.0919 eV  174.83 nm  f=0.7713  <S**2>=0.000
      15 -> 16         0.66677
      15 -> 25        -0.13319
```

The MO15 -> MO16 transition contributed 88.9% (= 2 x 0.66677^2 x 100%) for excited state S0 -> S2. 
Therefore, the S0 -> S2 transition can be elucidated by analyzing this dominant orbital transition pattern.

On the other hand, for the excited state S0 -> S1 of same molecule:
```
 Excited State   1:      Singlet-A"     4.6966 eV  263.99 nm  f=0.0003  <S**2>=0.000
      14 -> 16         0.56407
      14 -> 20        -0.21920
      14 -> 25        -0.24192
      14 -> 29        -0.17712
      14 -> 33        -0.13568
```
Although MO14 -> MO16 contributed 63.6% of S0 -> S1 transition, this is not sufficient. However, if other orbital 
transitions with small coefficients are also considered, the analysis will be difficult to identify. Natural Transition 
Orbitals (NTO) can solve this problem by transforming the molecular orbitals. This allows describing the complex transition 
with just one transition from an occupied orbital to a virtual orbital, making the analysis much easier.

# 2. NTO Analysis

### 2.1 One-Step Method

As example, the route section of input file for NTO analysis (S0 -> S1) is like:

**TDDFT**: `#p td b3lyp/6-31g(d) pop=(saveNTO,NTO) density=transition=1`
**CIS**: `#p cis/6-31g(d) pop=(saveNTO,NTO) density=transition=1`

For further analysis of S0 -> S2 transition, here are 2 options:
1. `#p cis/6-31g(d) pop=(saveNTO,NTO) density=transition=2`
2. `#p cis(read)/6-31+G* guess=read pop=(saveNTO,NTO) density=transition=2`, this method should be faster.


### 2.2 Multi-Step Method

This method requires an excited state calculation at first.

**i) Excited State Calculation**
```
%chk=es.chk
#p td=(nstate=10) b3lyp/6-31g*

[Molecule Specification]
```

**ii) NTO Calculation**
```
%oldchk=es.chk
%chk=state_N.chk
#p b3lyp/6-31g* geom=allcheck guess=(read,only) density=(check,transition=N) pop=(saveNTO,NTO)
```

For method **2.1** and **2.2**, convert the .chk file to .fchk file, and open it by *GaussView* to plot the MO. 
In this example, the transition 15 -> 16 contributed 99.3% to S0 -> S1.

<div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/blog/nto.png" class="img-fluid" zoomable=true %}
</div>

### 2.3 via Multiwfn

[Multiwfn](http://sobereva.com/multiwfn/) also provides a function for NTO analysis. For more detail, please refer to the Section 4.18.6 in 
user manual.

