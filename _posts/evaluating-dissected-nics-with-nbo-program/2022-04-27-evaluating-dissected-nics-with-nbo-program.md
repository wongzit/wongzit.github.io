---
layout: post
title:  "Evaluating Dissected NICS with NBO Program"
date:   2022-04-27 10:26:08 +0900
categories: computation
---

# General information

This blog is a memo for calculation NICS values from π-orbital contributions, so-called "dissected NICS values".
NBO 3.1, which is a built-in module in Gaussian 09/16 is not available for dissected NICS calculation. At least NBO 5.0+ is necessary.

# Computation

This memo is based on the paper [Which NICS Aromaticity Index for Planar π Ring is Best?](https://doi.org/10.1021/ol0529546). For more detail informations, please refer to the paper and supporting information.

## Input

A general input file for evaluating dissected NICS values with NBO program is shown below: 

```
# nmr b3lyp/6-31+g(d) iop(10/46=1) pop=nbo7read

Title

Geometry specification

$NBO NPA NBO NBOSUM BNDIDX E2PERT NLMO DIPOLE CMO NRT NCS <XYZ MO> $END

```

## Output

An example of output is shown below. Find the following table in the output file:

```
Principal components of the tensor (ppm) for atom gh( 16):
 Canonical MO contributions

        MO                 11      22      33     CSA     ISO
 =============================================================
    2.                      0.00   -0.01    0.21    0.22    0.07
    3.                     -0.01    0.00    0.21    0.22    0.07
    4.                      0.00    0.01    0.47    0.46    0.16
    5.                      0.01    0.00    0.47    0.46    0.16
    6.                     -0.01   -0.01    0.80    0.81    0.26
    7.                     -1.43   -1.43    2.46    3.89   -0.13
    8.                      0.03    0.43    2.69    2.46    1.05
    9.                      0.43    0.03    2.69    2.46    1.05
   10.                      0.53    0.54    2.59    2.05    1.22
   11.                      0.54    0.53    2.59    2.05    1.22
   12.                     -0.08   -0.08    2.46    2.55    0.76
   13.                     -0.01   -0.01   -0.73   -0.72   -0.25
   14.                     -0.09   -0.09    2.40    2.49    0.74
   15.                      0.43    0.54   -1.27   -1.75   -0.10
   16.                      0.54    0.43   -1.26   -1.75   -0.10
   17.                     -1.71   -1.71    4.55    6.26    0.37
   18.                      0.46   -0.07   -6.33   -6.53   -1.98
   19.                     -0.07    0.46   -6.33   -6.53   -1.98
   20.                     -0.51   -0.45    4.20    4.67    1.08
   21.                     -0.45   -0.51    4.20    4.67    1.08
 -------------------------------------------------------------
                 Total   -1.41   -1.41   17.07   18.48    4.75
 -------------------------------------------------------------
```

In this case, the π-orbitals could be identified to MO 17, 20 and 21 by examining the MO structure. So, we could calculated the NICS values:

- NICS(zz) = -17.07 ppm.
- NICS(iso) = -4.75 ppm.
- NICS(π,zz) = -(4.55 + 4.20 + 4.20) = -12.95 ppm.
- NICS(π,iso) = -(0.37 + 1.08 + 1.08) = -2.53 ppm.

# Processing output with py.Aroma

The py.Aroma v2.0.0 has been updated to support the dissected NICS calculations with NBO program. Further information will be updated.

