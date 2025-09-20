---
layout: post
title:  Orbital Composition Analysis
date:   2025-06-03 10:25:25 +0900
author: Zhe Wang
featured: false
---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
</script>
<script type="text/x-mathjax-config">
 MathJax.Hub.Config({
 tex2jax: {
 inlineMath: [['$', '$'] ],
 displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
 }
 });
</script>

This blog shows how to perform orbial composition analysis based on Gaussian output files.

## 1. General Information

Orbital composition analysis is to evaluate the contributions of various components that make up an orbital.The orbitals could be any type of orbitals (MO, LMO, NO, etc). These components can be analyzed at different levels, from smallest to largest: (1) **basis functions**, (2) **atomic orbitals**, (3) **atoms**, (4) **molecular fragments**.

## 2. Calculate Contributions of Basis Functions

Here we will use a water molecule as example to explain. Input file is like this:

```
#p b3lyp/6-31(d) pop=full iop(3/33=1)

Basis functions composition

0 1
O                     0.        0.        0.11972 
H                     0.        0.76155  -0.47887 
H                     0.       -0.76155  -0.47887 
```

Using the keyword `pop=full` prints out the orbital coefficient and `iop(3/33=1)` outputs the overlap matrix (see below).

The orbital part in the output file appears as follows:

```
     Molecular Orbital Coefficients:
                           1         2         3         4         5
                        (A1)--O   (A1)--O   (B2)--O   (A1)--O   (B1)--O
     Eigenvalues --   -19.13815  -0.99790  -0.51718  -0.37220  -0.29119
   1 1   O  1S          0.99286  -0.20950   0.00000  -0.08809   0.00000
   2        2S          0.02622   0.46921   0.00000   0.17724   0.00000
   3        2PX         0.00000   0.00000   0.00000   0.00000   0.64458
   4        2PY         0.00000   0.00000   0.51744   0.00000   0.00000
   5        2PZ        -0.00110  -0.12769   0.00000   0.55184   0.00000
   6        3S          0.01011   0.43950   0.00000   0.41041   0.00000
   7        3PX         0.00000   0.00000   0.00000   0.00000   0.50605
   8        3PY         0.00000   0.00000   0.26974   0.00000   0.00000
   9        3PZ        -0.00000  -0.06064   0.00000   0.37218   0.00000
  10        4XX        -0.00772  -0.01093   0.00000  -0.00026   0.00000
  11        4YY        -0.00777   0.01879   0.00000   0.00089   0.00000
  12        4ZZ        -0.00775   0.01607   0.00000  -0.05242   0.00000
  13        4XY         0.00000   0.00000   0.00000   0.00000   0.00000
  14        4XZ         0.00000   0.00000   0.00000   0.00000  -0.03544
  15        4YZ         0.00000   0.00000  -0.04127   0.00000   0.00000
  16 2   H  1S          0.00037   0.13915   0.23745  -0.14372   0.00000
  17        2S         -0.00103   0.00645   0.14193  -0.11426   0.00000
  18 3   H  1S          0.00037   0.13915  -0.23745  -0.14372   0.00000
  19        2S         -0.00103   0.00645  -0.14193  -0.11426   0.00000
```

From the output, the HOMO (No.5) wavefunction can be writen as:

$$ \Psi _5 = 0.64458 \times \chi_3 + 0.50605 \times \chi _7 -0.03544 \times \chi _{14} $$

Since the orbital must be normalized:

$$ \langle \Psi _5 | \Psi _5 \rangle = 1 = 0.64458^2 \times \langle \chi_3|\chi_3 \rangle + 0.50605^2 \times \langle \chi_7|\chi_7 \rangle + 0.03544^2 \times \langle \chi_{14}|\chi_{14} \rangle + 2 \times 0.64458 \times 0.50605 \langle \chi_3|\chi_7 \rangle - 2 \times 0.64458 \times 0.03544 \langle \chi_3|\chi_{14} \rangle - 2 \times 0.50605 \times 0.03544 \langle \chi_7|\chi_{14} \rangle $$

Thus,

$$ 1 = 0.41548 \times S_{3,3} + 0.25609 \times S_{7,7} + 0.00126 \times S_{14,14} + 0.65238 \times S_{3,7} - 0.04569 \times S_{3,14} - 0.03587 \times S_{7,14} $$

In the above equetion, *0.41548* represents the contribution of basis χ<sub>3</sub> to HOMO, while *0.65238* reflects the combined contribution of basis χ<sub>3</sub> and χ<sub>7</sub> to HOMO. Since, <i>S</i><sub>a,a</sub> = 1,

Thus,

$$ \langle \Psi _5 | \Psi _5 \rangle = 0.67283 + 0.65238 \times S_{3,7} - 0.04569 \times S_{3,14} - 0.03587 \times S_{7,14} $$

To calculate the contribution of each basis function, we need overlap integral <i>S</i><sub>3,7</sub>, <i>S</i><sub>3,14</sub>, and <i>S</i><sub>7,14</sub>. These overlap integral can be obtained using `iop(3/33=1)` keyword and aresummarized in the **Overlap** section:

```
 *** Overlap *** 
                1             2             3             4             5 
      1  0.100000D+01
      2  0.233690D+00  0.100000D+01
      3  0.000000D+00  0.000000D+00  0.100000D+01
      4  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
      5  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
      6  0.167280D+00  0.763641D+00  0.000000D+00  0.000000D+00  0.000000D+00
      7  0.000000D+00  0.000000D+00  0.501521D+00  0.000000D+00  0.000000D+00
      8  0.000000D+00  0.000000D+00  0.000000D+00  0.501521D+00  0.000000D+00
      9  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.501521D+00
     10  0.335315D-01  0.547066D+00  0.000000D+00  0.000000D+00  0.000000D+00
     11  0.335315D-01  0.547066D+00  0.000000D+00  0.000000D+00  0.000000D+00
     12  0.335315D-01  0.547066D+00  0.000000D+00  0.000000D+00  0.000000D+00
     13  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     14  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     15  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     16  0.334348D-01  0.241296D+00  0.000000D+00  0.221010D+00 -0.173718D+00
     17  0.681738D-01  0.376405D+00  0.000000D+00  0.116274D+00 -0.913932D-01
     18  0.334348D-01  0.241296D+00  0.000000D+00 -0.221010D+00 -0.173718D+00
     19  0.681738D-01  0.376405D+00  0.000000D+00 -0.116274D+00 -0.913932D-01
                6             7             8             9            10 
      6  0.100000D+01
      7  0.000000D+00  0.100000D+01
      8  0.000000D+00  0.000000D+00  0.100000D+01
      9  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
     10  0.699015D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
     11  0.699015D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.333333D+00
     12  0.699015D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.333333D+00
     13  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     14  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     15  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00
     16  0.421231D+00  0.000000D+00  0.457410D+00 -0.359532D+00  0.162722D+00
     17  0.678714D+00  0.000000D+00  0.379588D+00 -0.298363D+00  0.395977D+00
     18  0.421231D+00  0.000000D+00 -0.457410D+00 -0.359532D+00  0.162722D+00
     19  0.678714D+00  0.000000D+00 -0.379588D+00 -0.298363D+00  0.395977D+00
               11            12            13            14            15 
     11  0.100000D+01
     12  0.333333D+00  0.100000D+01
     13  0.000000D+00  0.000000D+00  0.100000D+01
     14  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
     15  0.000000D+00  0.000000D+00  0.000000D+00  0.000000D+00  0.100000D+01
     16  0.401135D+00  0.310019D+00  0.000000D+00  0.000000D+00 -0.324581D+00
     17  0.440358D+00  0.423396D+00  0.000000D+00  0.000000D+00 -0.604210D-01
     18  0.401135D+00  0.310019D+00  0.000000D+00  0.000000D+00  0.324581D+00
     19  0.440358D+00  0.423396D+00  0.000000D+00  0.000000D+00  0.604210D-01
               16            17            18            19 
     16  0.100000D+01
     17  0.658292D+00  0.100000D+01
     18  0.502482D-01  0.221846D+00  0.100000D+01
     19  0.221846D+00  0.512715D+00  0.658292D+00  0.100000D+01
```

For this example, the <i>S</i><sub>3,7</sub> = 0.50152, and <i>S</i><sub>3,14</sub> = <i>S</i><sub>7,14</sub> = 0. Thus,

$$ \langle \Psi _5 | \Psi _5 \rangle = 0.67283 + 0.65238 \times 0.50152 = 1.00002 $$

To calculate the contribution of each basis function χ<sub>n</sub>, here are three methods:

#### (1) Mulliken Partition

In the Mulliken partition, when calculating the contribution of basis function χ<sub>n</sub> to an orbital, all the diagonal (localized, *i.e.*, <i>S</i><sub>n,n</sub>) terms of χ<sub>n</sub> are assigned entirely to χ<sub>n</sub>, while half of the off-diagonal (overlap, *i.e.*, <i>S</i><sub>n,m</sub>) terms between χ<sub>n</sub> and χ<sub>m</sub> are also attributed to χ<sub>n</sub>.

In the above example, the contribution of χ<sub>3</sub> to HOMO is:

$$ 0.64458^2 + 0.64458 \times 0.50605 \times 0.50152 = 0.57907 $$

Similar, the contribution of χ<sub>7</sub> and χ<sub>14</sub> to HOMO are 41.968% and 0.126%, respectively.

### (2) Stout-Politzer Partition

The Stout–Politzer partition accounts for the inequality between basis functions by partitioning the overlap terms in proportion to the squared coefficients of the two involved basis functions. For above example, the contribution of χ<sub>3</sub> to HOMO is:

$$ 0.64458^2 + 2 \times 0.64458 \times 0.50605 \times 0.50152 \times \frac {0.64458^2}{0.64458^2+0.50605^2} = 0.61790 $$

Similar, the contribution of χ<sub>7</sub> and χ<sub>14</sub> to HOMO are 38.085% and 0.126%, respectively.

### (3) Ros-Schuit (SCPA) partition 

*skip for now, maybe added later*

## 3. Calculate Contributions of Atomic Orbitals

Here are several methods to do this, and in this blog, I will introducing the NAO approach.

In Gaussian, using keyword `pop=nboread` and add `$NBO NAOMO $END` at the end of input file, the NBO module will print the NAO population results and orbital coefficient of NAO:

```
NATURAL POPULATIONS:  Natural atomic orbital occupancies 
                                                          
   NAO  Atom  No  lang   Type(AO)    Occupancy      Energy
 ----------------------------------------------------------
     1    O    1  S      Cor( 1S)     1.99992     -18.98955
     2    O    1  S      Val( 2S)     1.76556      -0.88052
     3    O    1  S      Ryd( 3S)     0.00271       1.19296
     4    O    1  S      Ryd( 4S)     0.00000       3.53766
     5    O    1  px     Val( 2p)     1.99661      -0.28809
     6    O    1  px     Ryd( 3p)     0.00088       0.89052
     7    O    1  py     Val( 2p)     1.45457      -0.25518
     8    O    1  py     Ryd( 3p)     0.00287       1.02985
     9    O    1  pz     Val( 2p)     1.69984      -0.28442
    10    O    1  pz     Ryd( 3p)     0.00043       0.93030
    11    O    1  dxy    Ryd( 3d)     0.00000       1.74635
    12    O    1  dxz    Ryd( 3d)     0.00251       1.77697
    13    O    1  dyz    Ryd( 3d)     0.00205       2.53155
    14    O    1  dx2y2  Ryd( 3d)     0.00069       2.13328
    15    O    1  dz2    Ryd( 3d)     0.00267       1.73849

    16    H    2  S      Val( 1S)     0.53264       0.14162
    17    H    2  S      Ryd( 2S)     0.00169       0.57225

    18    H    3  S      Val( 1S)     0.53264       0.14162
    19    H    3  S      Ryd( 2S)     0.00169       0.57225
```

```
MOs in the NAO basis:                                                         

          NAO        1       2       3       4       5       6       7       8
      ---------- ------- ------- ------- ------- ------- ------- ------- -------
   1.  O 1 (S)    0.9959 -0.0875 -0.0000 -0.0218  0.0000  0.0042 -0.0000 -0.0000
   2.  O 1 (S)    0.0840  0.8718 -0.0000  0.3402  0.0000  0.2404  0.0000  0.0000
   3.  O 1 (S)    0.0004  0.0134  0.0000 -0.0343 -0.0000 -0.1941 -0.0000  0.0000
   4.  O 1 (S)   -0.0000 -0.0000  0.0000  0.0000 -0.0000  0.0367 -0.0000  0.0000
   5.  O 1 (px)   0.0000  0.0000  0.0000 -0.0000  0.9992  0.0000 -0.0000 -0.0000
   6.  O 1 (px)  -0.0000 -0.0000 -0.0000  0.0000 -0.0210 -0.0000  0.0000  0.0000
   7.  O 1 (py)   0.0000  0.0000  0.8528 -0.0000  0.0000 -0.0000 -0.3862 -0.3369
   8.  O 1 (py)   0.0000 -0.0000  0.0379 -0.0000 -0.0000 -0.0000 -0.0097  0.3747
   9.  O 1 (pz)   0.0023 -0.2020 -0.0000  0.8995 -0.0000 -0.3068  0.0000 -0.0000
  10.  O 1 (pz)  -0.0010 -0.0051  0.0000 -0.0138  0.0000  0.0118  0.0000  0.0000
  11.  O 1 (d1)   0.0000  0.0000 -0.0000 -0.0000 -0.0000 -0.0000  0.0000 -0.0000
  12.  O 1 (d2)  -0.0000  0.0000  0.0000 -0.0000 -0.0354  0.0000 -0.0000  0.0000
  13.  O 1 (d3)  -0.0000 -0.0000 -0.0320  0.0000 -0.0000 -0.0000  0.0143 -0.1522
  14.  O 1 (d4)   0.0001 -0.0185 -0.0000  0.0023 -0.0000  0.0167  0.0000 -0.0000
  15.  O 1 (d5)  -0.0000  0.0083  0.0000 -0.0356  0.0000  0.0129 -0.0000  0.0000
  16.  H 2 (S)    0.0234  0.3082  0.3674 -0.1893 -0.0000 -0.4673  0.4331  0.3805
  17.  H 2 (S)    0.0020 -0.0228  0.0122 -0.0131 -0.0000 -0.4312  0.4875 -0.4655
  18.  H 3 (S)    0.0234  0.3082 -0.3674 -0.1893 -0.0000 -0.4673 -0.4331 -0.3805
  19.  H 3 (S)    0.0020 -0.0228 -0.0122 -0.0131  0.0000 -0.4312 -0.4875  0.4655
```

In the first output section, the core (`Cor`), valence (`Val`) and Rydberg (`Ryd`) NAOs of the natural minimum basis are summarized. In most cases, only the contributions from `Cor` and `Val` NAOs are significant, as the `Ryd` NAOs are typically negligible.

From the first table, we can see that the NAO orbital number for the 2p<sub>x</sub> orbital of the oxygen atom is *5* for `Val` and *6* for `Ryd`. These numbers can then be found in the second table. Focusing on the HOMO (No. 5) in this example, the contribution from O(2p<sub>x</sub>, Val) is 0.9992<sup>2</sup> = 99.84%, while that from O(2p<sub>x</sub>, Ryd) is (–0.0210)<sup>2</sup> = 0.04%. Since a polarization function is included in the `6-31G(d)` basis set, the O(3d<sub>xz</sub>, Ryd) also contributes 0.13% to the HOMO. In total, the oxygen atom accounts for 100% of the HOMO contribution.


- References: http://sobereva.com/131 (in Chinese)
