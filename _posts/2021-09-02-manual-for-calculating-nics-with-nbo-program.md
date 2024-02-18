---
layout: post
title:  "Manual for Calculating NICS with NBO Program"
date:   2021-09-02 22:38:09 +0900
tags: [Gaussian, NBO, Computation]
author: Zhe Wang
---

> This post records a general manual for calculating NICS index using NBO program. About NICS index, please refer to this OL [paper](https://doi.org/10.1021/ol0529546).

**Note:** Input and output files could be found [here](https://github.com/wongzit/blogFiles/tree/main/blog_nics_index).

**Contents**

- [1. Input](https://wongzit.github.io/manual-for-calculating-nics-with-nbo-program/#1-input)
- [2. Output](https://wongzit.github.io/manual-for-calculating-nics-with-nbo-program/#2-output)
- [3. Issues about Running of NBO](https://wongzit.github.io/manual-for-calculating-nics-with-nbo-program/#3-issues-about-running-of-nbo)

# 1. Input

The input file for calculating NICS(0) and NICS(1/-1) for benzene is given below. 
The commercially abailable NBO 7.0 program will be used, if you are using NBO 3 embedded in Gaussian, 
this manual is not suitable for you since some NBO keywords are not available for the old version of NBO.

```
%nprocshared=8
%mem=10GB
%chk=benzene_nics_nbo.chk
# B3LYP/6-31+G(d) NMR pop=nbo7read iop(10/46=1)

NICSinput//Created_by_py.Aroma

0 1
 C           -1.339236           -0.395853            0.000005
 C           -0.326685           -1.357730            0.000069
 C            1.012421           -0.961878           -0.000055
 C            1.339202            0.395965            0.000008
 C            0.326798            1.357700            0.000062
 C           -1.012501            0.961798           -0.000058
 H           -2.381330           -0.704010           -0.000066
 H           -0.581086           -2.414245            0.000079
 H            1.800375           -1.710234           -0.000154
 H            2.381367            0.703858            0.000007
 H            0.580952            2.414267            0.000018
 H           -1.800276            1.710353           -0.000063
 Bq          -0.000006           -0.000010            0.000004
 Bq           0.000009           -0.000057            1.000004
 Bq          -0.000020            0.000036           -0.999996

$NBO NPA NBO NBOSUM BNDIDX E2PERT NLMO DIPOLE CMO NRT NCS <XYZ MO> $END

```

# 2. Output

NBO 7.0 program is appled, following information could be found in the output file, you could find the 
discription for each NBO keywords.

```
 *********************************** NBO 7.0 ***********************************
             N A T U R A L   A T O M I C   O R B I T A L   A N D
          N A T U R A L   B O N D   O R B I T A L   A N A L Y S I S
 ****************************** Zhe Wang (I102139) *****************************
  (c) Copyright 1996-2021 Board of Regents of the University of Wisconsin System
      on behalf of the Theoretical Chemistry Institute.  All rights reserved.

          Cite this program [NBO 7.0.10 (8-Feb-2021)] as:

          NBO 7.0.  E. D. Glendening, J. K. Badenhoop, A. E. Reed,
          J. E. Carpenter, J. A. Bohmann, C. M. Morales, P. Karafiloglou,
          C. R. Landis, and F. Weinhold, Theoretical Chemistry Institute,
          University of Wisconsin, Madison, WI (2018)

       /NPA    / : Natural Population Analysis
       /NBO    / : Natural Bond Orbital Analysis
       /NBOSUM / : Print summary of the NBO analysis
       /NLMO   / : Form natural localized molecular orbitals
       /NRT    / : Natural Resonance Theory Analysis
       /NCS    / : Natural Chemical Shielding Analysis
                     including chemical shielding anisotropy
                     in the molecular Cartesian axes
                     NCS Analysis with canonical MOs
       /E2PERT / : Print perturbative analysis of NBO Fock matrix
       /DIPOLE / : Print NBO/NLMO dipole moment analysis
       /CMO    / : Print NBO analysis of canonical MOs
       /BNDIDX / : Print bond indices based on the NAO density matrix
```

Search `Cartesian XYZ to principal shielding axes for atom` in the output file, you could find following output for every atoms, we only need to concern about the ghost atoms (Bq).

```
 Cartesian XYZ to principal shielding axes for atom gh ( 13):

        1         2         3
 -------------------------------
  X  0.818687  0.574240 -0.000004
  Y -0.574240  0.818687  0.000009
  Z  0.000008 -0.000005  1.000000

 Full Cartesian NMR shielding tensor (ppm) for atom gh( 13):
 Canonical MO contributions

   MO        XX      XY      XZ      YX      YY      YZ      ZX      ZY      ZZ
 ===============================================================================
    2.      0.10   -0.06    0.00   -0.06   -0.25    0.00    0.00    0.00    0.94
    3.     -0.25    0.06    0.00    0.06    0.10    0.00    0.00    0.00    0.94
    4.      0.06   -0.02    0.00   -0.02   -0.08    0.00    0.00    0.00    2.45
    5.     -0.08    0.03    0.00    0.03    0.06    0.00    0.00    0.00    2.45
    6.      0.05    0.00    0.00    0.00    0.05    0.00    0.00    0.00    3.84
    7.      5.27    0.00    0.00    0.00    5.27    0.00    0.00    0.00   14.39
    8.      2.32    2.03    0.00    2.03    2.03    0.00    0.00    0.00   10.77
    9.      2.03   -2.03    0.00   -2.03    2.32    0.00    0.00    0.00   10.77
   10.      3.12   -0.18    0.00   -0.18    1.84    0.00    0.00    0.00    6.30
   11.      1.84    0.18    0.00    0.18    3.12    0.00    0.00    0.00    6.30
   12.      4.74    0.00    0.00    0.00    4.74    0.00    0.00    0.00   11.79
   13.     -1.04    0.00    0.00    0.00   -1.04    0.00    0.00    0.00   -1.15
   14.    -10.98    0.00    0.00    0.00  -10.99    0.00    0.00    0.00    1.37
   15.      2.13    1.57    0.00    1.57  -13.10    0.00    0.00    0.00  -11.99
   16.    -13.10   -1.57    0.00   -1.57    2.13    0.00    0.00    0.00  -11.99
   17.     15.14    0.00    0.00    0.00   15.14    0.00    0.00    0.00   12.81
   18.     -1.65   -0.98    0.00   -0.98   -8.08    0.00    0.00    0.00  -35.01
   19.     -8.08    0.98    0.00    0.98   -1.65    0.00    0.00    0.00  -35.01
   20.     -3.64    4.51    0.00    4.51    7.48    0.00    0.00    0.00   11.64
   21.      7.48   -4.51    0.00   -4.51   -3.64    0.00    0.00    0.00   11.64
 -------------------------------------------------------------------------------
   Total    5.43    0.00    0.00    0.00    5.43    0.00    0.00    0.00   13.18
 -------------------------------------------------------------------------------

 Principal components of the tensor (ppm) for atom gh( 13):
 Canonical MO contributions

        MO                 11      22      33     CSA     ISO
 =============================================================
    2.                      0.04   -0.19    0.94    1.01    0.26
    3.                     -0.19    0.04    0.94    1.01    0.26
    4.                      0.04   -0.06    2.45    2.46    0.81
    5.                     -0.06    0.04    2.45    2.46    0.81
    6.                      0.05    0.05    3.84    3.80    1.31
    7.                      5.27    5.27   14.39    9.12    8.31
    8.                      0.32    4.04   10.77    8.59    5.04
    9.                      4.04    0.32   10.77    8.59    5.04
   10.                      2.86    2.10    6.30    3.82    3.75
   11.                      2.10    2.86    6.30    3.83    3.75
   12.                      4.74    4.74   11.79    7.05    7.09
   13.                     -1.04   -1.04   -1.15   -0.11   -1.07
   14.                    -10.99  -10.99    1.37   12.36   -6.87
   15.                     -4.37   -6.60  -11.99   -6.50   -7.65
   16.                     -6.60   -4.37  -11.99   -6.51   -7.65
   17.                     15.14   15.14   12.81   -2.33   14.36     #
   18.                     -2.85   -6.88  -35.01  -30.14  -14.91
   19.                     -6.88   -2.85  -35.01  -30.15  -14.91
   20.                     -4.21    8.06   11.64    9.71    5.16     #
   21.                      8.05   -4.21   11.64    9.72    5.16     #
 -------------------------------------------------------------
                 Total    5.43    5.43   13.18    7.75    8.02       #
 -------------------------------------------------------------
```

For benzene, molecular orbitals 17, 20 and 21 can be identified as the π-orbitals. NICS values are sign-reversed shielding tensors. 
Focus on the lines marked with # symbol in the second table, we could find:

- **NICS**πzz = -(12.81+11.64+11.64) = -36.09
- **NICS**zz = -13.18
- **NICS**π = -(14.36+5.16+5.16) = -24.68
- **NICS**iso = -8.02

# 3. Issues about Running of NBO

## Running NBO 7.0 with Gaussian 16

- For Gaussian 16 **B**.01, use keyword `pop=nbo6read` to read additional NBO **7.0** keyword.
- For Gaussian 16 **C**.01, use keyword `pop=nbo7read` to read additional NBO **7.0** keyword.

## MEMO: Running NBO 7.0 with .47 Files

1) Run Gaussian to get *.47* file:

```
# ... pop=nboread

...

$NBO ARCHIVE FILE=filename $END

```

2) Open the *.47* file with text editor, add NBO keyword between `$NBO` and `$END` in the 2nd line, save it.

```
 $NBO NPA NBO NBOSUM BNDIDX E2PERT NLMO DIPOLE CMO NRT NCS <XYZ MO> $END
```

3) Execute `gennbo filename` command to run NBO, the *.47* should not be included in the command.
