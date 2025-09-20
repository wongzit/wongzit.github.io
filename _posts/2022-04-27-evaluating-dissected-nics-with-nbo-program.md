---
layout: post
title:  "Evaluating Dissected NICS with NBO Program"
date:   2022-04-27 10:26:08 +0900
tags: [Gaussian, NBO, Computation]
author: Zhe Wang
---

# General information

This blog is a memo for calculation NICS values from π-orbital contributions, so-called "dissected NICS values".
NBO 3.1, which is a built-in module in Gaussian 09/16 is not available for dissected NICS calculation. At least NBO 5.0+ is necessary.

# Computation

This memo is based on the paper ["Which NICS Aromaticity Index for Planar π Ring is Best?"](https://doi.org/10.1021/ol0529546). For more detail informations, please refer to the paper and supporting information.

## Input

A general input file for evaluating dissected NICS values of biphenyl with NBO program is shown below, all input and output files of this example could be download from [here](https://github.com/wongzit/blogFiles/tree/main/blog_NICS_NBO).

```
#p nmr rb3lyp/6-31+g(d) iop(10/46=1) pop=nbo7read

NICSinput//Created_by_py.Aroma

0 1
 H                  1.90900000   -0.93500000    0.91600000
 C                  1.07900000   -0.51700000    1.45200000
 C                 -1.07900000    0.51700000    2.83500000
 C                  0.00000000    0.00000000    0.74500000
 C                  1.07900000   -0.51700000    2.83500000
 C                  0.00000000    0.00000000    3.53100000
 C                 -1.07900000    0.51700000    1.45200000
 H                  1.91500000   -0.92500000    3.36700000
 H                  0.00000000    0.00000000    4.60300000
 H                 -1.90900000    0.93500000    0.91600000
 H                 -1.91500000    0.92500000    3.36700000
 C                  0.00000000    0.00000000   -0.74500000
 C                  0.00000000    0.00000000   -3.53100000
 C                  1.07900000    0.51700000   -1.45200000
 C                 -1.07900000   -0.51700000   -1.45200000
 C                 -1.07900000   -0.51700000   -2.83500000
 C                  1.07900000    0.51700000   -2.83500000
 H                  1.90900000    0.93500000   -0.91600000
 H                 -1.90900000   -0.93500000   -0.91600000
 H                 -1.91500000   -0.92500000   -3.36700000
 H                  1.91500000    0.92500000   -3.36700000
 H                  0.00000000    0.00000000   -4.60300000
 Bq                    0.432106       0.901823       2.138333
 Bq                   -0.432106      -0.901823       2.138333
 Bq                    0.432106      -0.901823      -2.145000
 Bq                   -0.432106       0.901823      -2.145000
 Bq                    0.000000       0.000000       2.145000

$NBO NPA NBO NBOSUM BNDIDX E2PERT NLMO DIPOLE CMO NRT NCS <XYZ MO> $END

```

## Output

An example of output is shown below. Find the following table in the output file:

```
Principal components of the tensor (ppm) for atom gh( 26):
 Canonical MO contributions
 This tensor is non-symmetric.  The antisymmetric part will be printed.

                      Principal components     Antisymmetric part
        MO             11      22      33      12      13      23     CSA     ISO
 =================================================================================
    1.               -0.12    0.04   -0.11    0.04    0.03   -0.06   -0.07   -0.06
    2.                0.94    0.02    0.51   -0.15   -0.15    0.36    0.02    0.49
    3.                0.54    0.04    1.87    0.01   -0.02   -0.21    1.57    0.82
    4.               -0.23   -0.04    1.01    0.00   -0.22   -0.15    1.15    0.25
    5.                0.22    0.04    0.89   -0.10   -0.21   -0.46    0.75    0.38
    6.               -0.06   -0.20    0.82    0.07   -0.02   -0.23    0.95    0.19
    7.                0.35    0.02    1.76   -0.02   -0.07   -0.65    1.58    0.71
    8.               -0.02    0.01    1.63    0.01   -0.22   -0.58    1.64    0.54
    9.                0.15    0.35    0.43    0.18    0.07   -0.34    0.17    0.31
   10.                0.00   -0.12    0.28   -0.24    0.05   -0.13    0.34    0.05
   11.                0.19    0.13   -1.90    0.19    0.17   -0.12   -2.07   -0.53
   12.                0.09   -0.03   -0.18   -0.04   -0.18   -0.21   -0.21   -0.04
   13.               -1.71   -0.81    2.41    0.11   -1.50   -2.05    3.67   -0.04
   14.                0.93   -0.66    5.42    0.04   -1.61   -4.67    5.29    1.90
   15.               -0.20    0.56    5.55    0.02   -0.97   -1.87    5.37    1.97
   16.                1.25   -0.03    6.01   -0.70   -0.42    0.37    5.40    2.41
   17.                1.05    0.92    3.55    0.18    0.42   -1.06    2.56    1.84
   18.               -1.07    0.36   -1.57   -0.18    0.32   -2.00   -1.22   -0.76
   19.                1.16    0.78    2.51   -0.05   -0.08   -0.57    1.53    1.48
   20.                1.55    0.91    2.59    0.51    0.12   -0.34    1.37    1.68
   21.                0.65    0.67    2.53   -0.60   -0.22   -0.35    1.88    1.28
   22.                0.65    1.00    2.22   -0.10   -0.41   -0.98    1.39    1.29
   23.                0.36    0.28    2.70    0.25   -0.67   -3.77    2.38    1.12
   24.               -0.21   -0.25    3.89   -0.06   -0.55   -2.25    4.13    1.14
   25.               -0.27   -0.13    0.78    0.13   -0.12    0.14    0.99    0.13
   26.               -2.15   -1.40    2.49    0.27   -0.26    1.89    4.27   -0.35
   27.                0.13    0.02    1.02   -0.04   -0.59   -1.27    0.95    0.39
   28.               -1.91   -1.11   -0.48   -0.40    0.55    2.11    1.03   -1.17
   29.               -0.16   -0.46   -2.95    0.35    1.23    4.44   -2.64   -1.19
   30.               -0.24   -1.07   -3.56    0.16    1.32    5.19   -2.90   -1.62
   31.                0.00    0.46   -3.39    0.15   -0.32   -0.91   -3.62   -0.98
   32.                3.17    1.94    3.43   -0.25   -0.41   -1.02    0.88    2.85
   33.               -1.20   -0.26  -12.71   -0.07    0.75    2.42  -11.98   -4.72
   34.                3.47    2.77    5.07   -0.06   -0.80   -1.51    1.95    3.77
   35.               -1.48    0.09   -8.69   -0.30    0.87    3.42   -7.99   -3.36
   36.               -0.56   -1.01   -7.56    0.08    1.07    2.92   -6.77   -3.04
   37.               -0.97   -0.08   -6.94    0.11    0.27    1.12   -6.42   -2.66
   38.               -2.65    0.58    6.40    0.23    1.69   -0.88    7.43    1.45
   39.                0.88   -2.65    4.07   -0.02    0.37    1.72    4.95    0.77
   40.               -0.59   -2.23    4.88    0.43   -0.08    2.04    6.29    0.68
   41.               -2.09    2.02    1.22    0.18    0.66    0.64    1.26    0.38
 ---------------------------------------------------------------------------------
             Total   -0.19    1.47   27.87    0.31   -0.13    0.13   27.23    9.72
 ---------------------------------------------------------------------------------
```

In this case, the π-orbitals could be identified to MO 32, 34, 38, 39 40 and 41 by examining the MO structure. So, we could calculated the NICS values:

<div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/blog/biphenyl_orbitals.png" class="img-fluid" zoomable=true %}
</div>

- NICS(zz) = -27,87 ppm, showed in "Principal components - 33" column.
- NICS(iso) = -9.72 ppm, showed in "ISO" column.
- NICS(π,zz) = -(3.43 + 5.07 + 6.40 + 4.07 + 4.88 + 1.22) = -25.07 ppm.
- NICS(π,iso) = -(2.85 + 3.77 + 1.45 + 0.77 + 0.68 + 0.38) = -9.9 ppm.

# Processing output with py.Aroma

The upcoming py.Aroma v2.0 will add the support for NICS calculation with NBO program. By inputting the π-orbitals number, the NICS(zz), NICS(iso), NICS(π,zz) and NICS(π,iso) values of each ghost atom would be summarized in table.

```
   Atom      NICS(zz)    NICS(iso)    NICS(π,zz)    NICS(π,iso)
==================================================================
  Bq( 23)     -27.87        -9.71        -25.07           -9.9
  Bq( 24)     -27.87        -9.71        -25.07           -9.9
  Bq( 25)     -27.87        -9.72        -25.07           -9.9
  Bq( 26)     -27.87        -9.72        -25.07           -9.9
  Bq( 27)     -12.12        -7.74        -30.05         -22.12
```

