---
layout: post
title:  "EPR Prediction with ORCA Program"
date:   2021-05-27 21:29:20 +0900
tags: [ORCA, Computation]
author: Zhe Wang
---

**Contents**
- [1. Input File Structure](https://wongzit.github.io/epr-prediction-with-orca-program/#1-input-file-structure)
- [2. Hyperfine Coupling Constant](https://wongzit.github.io/epr-prediction-with-orca-program/#2-hyperfile-coupling-constant)
- [3. Zero-field Splitting (ZFS) Prediction](https://wongzit.github.io/epr-prediction-with-orca-program/#3-zero-field-splitting-zfs-prediction)
- [4. Example](https://wongzit.github.io/epr-prediction-with-orca-program/#4-example)
- [4.1 Predict HFC of TEMPO radical](https://wongzit.github.io/epr-prediction-with-orca-program/#41-predict-hfc-of-tempo-radical)
- [4.2 Predict ZFS of cyclopentane-1,3-diyl diradical](https://wongzit.github.io/epr-prediction-with-orca-program/#42-predict-zfs-of-cyclopentane-13-diyl-diradical)
- [5. End](https://wongzit.github.io/epr-prediction-with-orca-program/#5-end)

# 1. Input File Structure
ORCA input file for EPR calculation have to (at least) include following section: (1) Calculation method, (2) geometry coordinates, and (3) additional keywords section. The (2) geometry coordinates can be inserted in input file, or save the structure as .xyz file in the same dictionary with input file. Here are 2 examples of input file.

**Input file 1**: including Cartesian coordinates in input file. The coordinates structure is same as those in Gaussian input file.

```
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyz [charge] [spin multiplicity]
 [Cartesian coordinates]
*
%eprnmr
    [EPR keywords section]
end
```

**Input file 2**: Save the geometry as .xyz file at same dictionary with ORCA input file, the ORCA program will read geometry information from .xyz file.

```
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyzfile [charge] [spin multiplicity] [geometry.xyz]
%eprnmr
    [EPR keywords section]
end
```

**Details about the input file:**

<u>R/U/ROKS</u>: For restricted Hartree-Fock (HF) calculation, use RKS; for unrestricted HF, use UKS and for restricted-open HF, use ROKS. It is better to use ROKS rather than UKS for D and E tensors prediction (<i>J. Phys. Chem. A</i> <b>2006</b>, <i>110</i>, 12267-12275). For g tensor and HFC, use default (UHF).

<u>method</u>: Specify the calculation method, like B3LYP, BP, etc.

<u>basis set</u>: Specify the basis set, like 6-31G(d), etc. EPR-II and EPR-III are widely used basis sets optimized for EPR prediction. ( I always use EPR-II for my calculations due to its high-efficiency. EPR-III is more accurate but much more expensive calculation cost is needed.)

<u>charge</u> <u>spin multiplicity</u>: Same with Gaussian (e.g., for neutral triplet, use 0 3).

<u>EPR keywords section</u>: This would be discussed in following section.

Keywords *AutoAux* and *RIJCOSX* could be added to speed up calculations with introducing a very very small error (usually smaller than basis set errors and much smaller than electronic-structure-method errors). For more information about these keywords, please check the [ORCA manual](https://sites.google.com/site/orcainputlibrary/basis-sets/ri-and-auxiliary-basis-sets).

# 2. Hyperfine Coupling Constant

For predicting hyperfine coupling (HFC), you need to include following keywords in <u>EPR keywords section</u>.

```
 %eprnmr
     gtensor = true
     Nuclei = all N {flags}  # flags = aiso, adip, aorb, fgrad, rho, etc.
     Nuclei = all C {flags}
 end
```
 
<u>gtensor</u> flag must be set to true or 1 to compute it.

<u>Nuclei = ...</u>: This flag defines the atoms for the hyperfine coupling calculations. all H calculates the HFC on all hydrogens, or use all N, all C and so on for different atoms. You can also use Nuclei = 1,5,8 to give one list per atom type (in this example, atom 1,5,8 must be same element) with the atom numbering starting from 1. The {flags} in Nuclei lines requests calculation option for HFC:

```
 aiso: calculate the isotropic part of the HFC
 adip: calculate the dipolar part of the HFC
 aorb: 2nd order contribution to the HFC from SOC
fgrad: calculate the electric field gradient
  rho: calculate the electron density at the nucleus
```

After the calculation is completed, the g tensor and HFC could be read from output file:

```
-------------------
ELECTRONIC G-MATRIX
-------------------

 The g-matrix: 
              2.0060206    0.0004709   -0.0003205
              0.0006221    2.0032154    0.0023911
             -0.0002906    0.0024341    2.0088349

 gel          2.0023193    2.0023193    2.0023193
 gRMC        -0.0002988   -0.0002988   -0.0002988
 gDSO(tot)    0.0001605    0.0002266    0.0001485
 gPSO(tot)    0.0000400    0.0038717    0.0075621
             ----------   ----------   ----------
 g(tot)       2.0022210    2.0061188    2.0097311 iso=  2.0060236
 Delta-g     -0.0000983    0.0037995    0.0074118 iso=  0.0037043
---------------------------------------------------------------
          Euler rotation of hyperfine tensor to g-tensor
---------------------------------------------------------------

----------------------------------------------------------------
 Atom  |   Alpha    Beta    Gamma   |   Ax       Ay       Az 
       |          [degrees]         |           [MHz]         
----------------------------------------------------------------
  0N       67.4      3.0    -66.1      67.76    -0.70    -0.22
  5H      174.1     28.6   -139.2      -2.86    -2.63     3.86
  6H       47.5     24.4    -77.2      -2.26    -2.34     2.02
  7H      -21.5     27.0     29.3      -0.56    -0.36     5.53
  8H      -82.6     20.1     99.2       2.36     2.43     6.83
  9H       79.0     26.7    -97.0      28.68    41.28    28.42
----------------------------------------------------------------
```

# 3. Zero-field Splitting (ZFS) Prediction

If you want to predict ZFS parameters for the systems with S > 1/2, please include following keywords in <u>EPR keywords section</u>. Keywords after the # indicate for other options.

For UKS calculation:

```
%eprnmr
    dtensor ssandso   # ss, so
    dss uno           # direct
    dsoc cp           # qro, pk, cvw
end
```

For ROKS calculation:

```
%eprnmr
    dtensor ss
    dss direct
end
```

<u>dtensor</u> flag has three options for predict the D tensor: (1) ssandso (spin-spin and spin-orbital component), (2) ss (only spin-spin component) and (3) so (only spin-orbital component). All of these three options could be applied in unrestricted (UKS) calculation, but for restricted-open (ROKS) calculation, only spin-spin part (ss) could be estimated.

<u>dss</u> flag controls the algorithms of calculation of spin-spin component. Two options is available: (1) uno (use spin density from UNOs, this could only be used in UKS calculation) and (2) direct (directly use the canonical orbitals for the spin density).

<u>dsoc</u> flag controls the algorithms of calculation of spin-orbital component. This is not available in restricted-open calculation. Other options:

```
 cp: coupled-perturbed method (default)
qro: quasi-restricted method, must be done with keyword !uno
 pk: Pederson-Khanna method
cvw: van Wüllen method
```

After the calculation is completed, you could read the ZFS parameters from output file:

```
D   =    0.019661  cm**-1
E/D =    0.172867
```

# 4. Example

Here I put two input files I used for EPR prediction. (TEMPO radical and triplet cyclopentane-1,3-diyl diradical, all geometries were optimized at UB3LYP/6-31G* level of theory with *Gaussian 16 B.01*). These file could be download from [here](https://github.com/wongzit/blogFiles/tree/main/blog_epr_orca).

## 4.1 Predict HFC of TEMPO radical

```
!B3LYP EPR-II Autoaux rijcosx pal8
* xyzfile 0 2 tempo_opt.xyz
%eprnmr
    gtensor 1
    Nuclei = all N {aiso, adip, aorb, fgrad, rho}
    Nuclei = all C {aiso, adip, aorb, fgrad, rho}
end

```

## 4.2 Predict ZFS of cyclopentane-1,3-diyl diradical

Calculate at ROBP/EPR-II level of theory:

```
!roks bp epr-ii autoaux rijcosx pal8
* xyz 0 3
 C   1.022000   0.768000  -0.094000
 C   1.022000  -0.768000   0.094000
 C  -0.408000  -1.170000  -0.081000
 C  -1.335000  -0.000000  -0.000000
 C  -0.408000   1.170000   0.081000
 H   1.696000   1.277000   0.607000
 H   1.385000   1.030000  -1.101000
 H   1.385000  -1.030000   1.101000
 H   1.696000  -1.277000  -0.607000
 H  -2.016000   0.056000  -0.871000
 H  -2.016000  -0.056000   0.871000
 H  -0.742000   2.201000   0.123000
 H  -0.742000  -2.201000  -0.123000
*
%eprnmr
    dtensor ss
    dss direct
end
```

Calculate at UBP/EPR-II level of theory.

```
!uks bp epr-ii autoaux rijcosx pal8
* xyz 0 3
 C   1.022000   0.768000  -0.094000
 C   1.022000  -0.768000   0.094000
 C  -0.408000  -1.170000  -0.081000
 C  -1.335000  -0.000000  -0.000000
 C  -0.408000   1.170000   0.081000
 H   1.696000   1.277000   0.607000
 H   1.385000   1.030000  -1.101000
 H   1.385000  -1.030000   1.101000
 H   1.696000  -1.277000  -0.607000
 H  -2.016000   0.056000  -0.871000
 H  -2.016000  -0.056000   0.871000
 H  -0.742000   2.201000   0.123000
 H  -0.742000  -2.201000  -0.123000
*
%eprnmr
    dtensor ssandso
    dss uno
    dsoc cp
end
```

# 5. End

The EPR prediction of ZFS may get better results from CASSCF method.
For more information, please refer to the ORCA official manual (for EPR calculation keywords, from page 888 to page 891 in the manual of version 4.2.1).
[This website](https://www.orcasoftware.de/tutorials_orca/spec/EPR.html) also have some useful information on EPR calculation with ORCA.
