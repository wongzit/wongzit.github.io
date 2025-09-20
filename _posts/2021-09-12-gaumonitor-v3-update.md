---
layout: post
title:  "gauMonitor v3.0.0 Update"
date:   2021-09-12 20:18:13 +0900
tags: [Software, Computation]
author: Zhe Wang
---

The *Gaussian* monitoring tool, [**gauMonitor**](https://github.com/wongzit/gauMonitor), has been updated to version 3.0.0 on 
12 Sep 2021. New user interface for improved readability and some new features have been added into gauMonitor v3.

# New fetures in v3.0.0

### Updated userinterface for SCF iteration section and energy section.

```
 # SCF ITERATIONS
 - Summary of SCF Iterations: 
   Cycle    Max.Force     RMS.Force       Max.DP        RMS.DP    Converged?
 -----------------------------------------------------------------------------
            (0.000450)    (0.000300)    (0.001800)    (0.001200)  Threshold
      1      0.016673      0.008912      0.044431      0.023749      NNNN
      2      0.000166      0.000089      0.000468      0.000250      YYYY
 ----------------------------------------------------------------------------- 


 - Summary of electronic energy: 

   Cycle      E (Hartree)       E.rel (kcal/mol)     Delta-E
 -------------------------------------------------------------
     1      -40.5169484086            0.000000
     2      -40.5183831835           -0.900336          -
 -------------------------------------------------------------
```

### Now the directions (forward and reverse) will be displayed for IRC jobs. (only for calulations with `#p`)

```
# IRC STEPS
- Summary of electronic energy:

  Steps        E (Hartree)       E.rel (kcal/mol)     Delta-E
---------------------------------------------------------------
    1(TS)    -2617.24313084            0.000000

                  --- Forward path direction ---
    2        -2617.24551175           -1.494045          -
    3        -2617.24907454           -3.729731          -
    4        -2617.25336776           -6.423770          -
    5        -2617.25804643           -9.359682          -
    6        -2617.26280200          -12.343850          -
    7        -2617.26732990          -15.185152          -
    8        -2617.27132860          -17.694376          -
    9        -2617.27458632          -19.738628          -
   10        -2617.27711944          -21.328186          -
   11        -2617.27910974          -22.577120          -
   12        -2617.28070210          -23.576341          -
   13        -2617.28198965          -24.384292          -
   14        -2617.28301837          -25.029824          -
   15        -2617.28374463          -25.485559          -
   16        -2617.28404326          -25.672953          -
   17        -2617.28471426          -26.094012          -
   18        -2617.28514579          -26.364801          -
   19        -2617.28548831          -26.579736          -
   20        -2617.28581484          -26.784637          -

                  --- Reverse path direction ---
   21        -2617.24300980            0.075954          +
   22        -2617.24463414           -0.943336          -
   23        -2617.24657923           -2.163899          -
   24        -2617.24854233           -3.395764          -
   25        -2617.25049202           -4.619214          -
   26        -2617.25249890           -5.878551          -
   27        -2617.25470497           -7.262882          -
   28        -2617.25733646           -8.914169          -
   29        -2617.26068317          -11.014263          -
   30        -2617.26450015          -13.409456          -
   31        -2617.26857740          -15.967971          -
   32        -2617.27294537          -18.708916          -
   33        -2617.27758187          -21.618366          -
   34        -2617.28247708          -24.690159          -
   35        -2617.28757411          -27.888596          -
   36        -2617.29278935          -31.161212          -
   37        -2617.29801773          -34.442072          -
   38        -2617.30313054          -37.650412          -
   39        -2617.30797522          -40.690497          -
   40        -2617.31239831          -43.466030          -
---------------------------------------------------------------
```


### Electronic energies of stationary points for SCAN calculations would be summarized in a new table.

```
 # SCAN STEP
 - Summary of electronic energies for stationary points:

   Steps      E (Hartree)       E.rel (kcal/mol)     Delta-E
 -------------------------------------------------------------
     1      -2008.05829512            0.000000 
     2      -2008.05358381            2.956394          +
     3      -2008.04263173            9.828934          +
     4      -2008.02872412           18.556098          +
     5      -2008.01380169           27.920072          +
     6      -2007.99898817           37.215704          +
 -------------------------------------------------------------
```

### Document has been added, use command `guamonitor -h` to check the user document.

```
                      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                      |        D o c u m e n t s        |
                      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

# General Information

  gauMonitor is an open-source program for monitoring Gaussian jobs, it follows
MIT license. In current version of gauMonitor, optimization, frequency analyses
and IRC/SCAN calculation jobs are supported.

...
```

### Add supporting for calculations using `counterpoise` or `counter` keywords.

### Improved froce constant section for transition state calculations.

```
# FORCE CONSTANT
- Summary of eigenvectors and eigenvalues

 Cycle   Five minimum eigenvalues
         Six eigenvectors required to have negative eigenvalues
----------------------------------------------------------------
    1   -0.02572   0.01727   0.01770   0.02530   0.03065
         D(1,2,5,6)          L(1,2,6,5,-2)       A(5,2,6)            
         L(1,2,6,5,-1)       R(2,5)              R(1,6)              

    2   -0.02498   0.01303   0.01686   0.02454   0.02999
         L(1,2,6,5,-2)       A(5,2,6)            L(1,2,6,5,-1)       
         R(2,5)              R(1,6)              A(5,2,6)            

    3   -0.02342   0.00198   0.01436   0.02299   0.02898
         A(5,2,6)            L(1,2,6,5,-1)       R(2,5)              
         R(1,6)              A(5,2,6)            L(1,2,6,5,-2)       

    4   -0.01753  -0.00550   0.01272   0.02154   0.02816
         L(1,2,6,5,-1)       R(2,5)              R(1,6)              
         A(5,2,6)            L(1,2,6,5,-2)       D(1,2,5,6)          

    5   -0.04729  -0.00134   0.01739   0.02883   0.03259
         R(2,5)              R(1,6)              A(5,2,6)            
         L(1,2,6,5,-2)       D(1,2,5,6)          L(1,2,6,5,-1)       

    6   -0.05312   0.01114   0.02120   0.02858   0.04011
         R(1,6)              A(5,2,6)            L(1,2,6,5,-2)       
         D(1,2,5,6)          L(1,2,6,5,-1)       R(2,5)          
```

### A new termination message.

```
-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

         Termination of gauMonitor at Mon Sep 12 18:25:56 JST 2021.

-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
```