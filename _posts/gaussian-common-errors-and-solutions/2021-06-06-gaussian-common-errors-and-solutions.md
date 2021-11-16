---
layout: post
title:  "Gaussian Common Errors and Solutions"
date:   2021-06-06 10:21:09 +0900
categories: software usage
---

> Original source of this blog (in Chinese):[http://bbs.keinsci.com/thread-4829-1-1.html](http://bbs.keinsci.com/thread-4829-1-1.html)


**Index:** [L101](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l101-l301), [L103](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l103), [L114](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l114), [L123](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l123), [L1](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l1), [L202](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l202), [L301](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l301), [L502](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l502), [L1002](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l502-l1002), [L508](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l508), [L801](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l801), [L9999](https://wongzit.github.io/gaussian-common-errors-and-solutions/#l9999)

## L101, L301

```
C -1.21995   2.13345   0.
End of file in ZSymb.
Error termination via Lnk1e in l101.exe
```

```
End of file reading basis center.
Error termination via Lnk1e in l301.exe
```

```
EOF while reading ECP pointer card.
Error termination via Lnk1e in l301.exe
```

### < Reason >

No blank line in the end of a paragraph (normally, end of the input file), Gaussian will read into an EOF (End of File) special characters, which caused the error.

### < Solution >

Add more blank line in the end of input file.


## L101

```
Wanted an integer as input.
Found a string as input.
H                0. 0. 0.
?
Error termination via Lnk1e in l101.exe
```

### < Reason >

Input file format error.

### < Solution >

Check the input file and modify the format error.

```
-------------------
Title Card Required
-------------------
Symbolic Z-matrix:
Charge =  0 Multiplicity = 1

Input Error Input Error Input Error Input Error Input Error Input Error

There are no atoms in this input structure !

Please fix the molecule specification section of your input and try again.

Input Error Input Error Input Error Input Error Input Error Input Error

Error termination via Lnk1e in l101.exe
```

### < Reason >

Gaussian did not find geometry specification in input file.

### < Solution >

Check the input file and modify the geometry section (or forget using `geom=allcheck`, `geom=check`).

## L103
```
Bend failed for angle     1 -    11 -     3
    Tors failed for dihedral     9 -     1 -    11 -     3
    Tors failed for dihedral    10 -     1 -    11 -     3
    Tors failed for dihedral    12 -     1 -    11 -     3
    Tors failed for dihedral    14 -     3 -    11 -     1
    Tors failed for dihedral    17 -     3 -    11 -     1
    FormBX had a problem.
    Error termination via Lnk1e in l103.exe
```

```
GradGradGradGradGradGradGradGradGradGradGradGradGradGradGradGradGradGrad
Berny optimization.
Using GEDIIS/GDIIS optimizer.
Linear angle in Bend.
Error termination via Lnk1e in l103.exe
```

```
NTrRot=    -1 NTRed=   798 NAtoms=    66 NSkip=   606 IsLin=F
Error in internal coordinate system.
Error termination via Lnk1e in l103.exe
Berny optimization.
Using GEDIIS/GDIIS optimizer.
Linear angle in Tors.
Error termination via Lnk1e in l103.exe
```

### < Reason >

The internal coordinates have inherent limitations, and this problem may occur when several atoms line up exactly during the optimization process.

### < Solution >

1. **Using `opt=cartesian`:**
This method solves the problem completely in principle, but opt=cartesian increases the number of steps needed to optimize to the corresponding minima in most cases. If the system is not very time-consuming, this keyword can be used directly until the optimization converged. If the system is time-consuming, you can use opt=cartesian, after 2 or 3 optimization steps, save the optimized structure, redo the optimization with default opt method. Please be noted that, this method is not suitable when using `opt=modredundant` keyword.

2. Sometimes re-opt the final structure directly can solve this problem, Gaussian actually adds some linear bend automatically for atoms close to the line, but it doesn't always work.

```
Iteration 96 RMS(Cart)=  0.00000206 RMS(Int)=  0.00542712
Iteration 97 RMS(Cart)=  0.00000193 RMS(Int)=  0.00542766
Iteration 98 RMS(Cart)=  0.00000180 RMS(Int)=  0.00542817
Iteration 99 RMS(Cart)=  0.00000169 RMS(Int)=  0.00542865
Iteration100 RMS(Cart)=  0.00000158 RMS(Int)=  0.00542909
New curvilinear step not converged.
Error imposing constraints
Error termination via Lnk1e in l103.exe 
```

### < Reason >

Performing calculations that require restricted optimization (e.g., F and S with `opt=modredundant`, `QST2`, etc.), Optimizer does not know how to take the structural initial guesses  under the current constraints.

### < Solution >

1. If `QST2` is used, try `TS(Berny)` or `QST3`.
2. If doing `opt=modredundant` calculations, use smaller step size, or modify the initial geometry.
3. If doing fopt calculation, make a bit change on geometry and re-submit to calculation.

## L114
```
NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-NEF-
NUMERICAL EIGENVECTOR FOLLOWING MINIMUM SEARCH
INITIALIZATION PASS

************************************************
** ERROR IN INITNF. NUMBER OF VARIABLES (  0) **
**   INCORRECT (SHOULD BE BETWEEN 1 AND 50)   **
************************************************

Error termination via Lnk1e in l114.exe
```

### < Reason >

Optimization using a non-resolved gradient method without explicitly declaring variables, like CCSD(T).

### < Solution >

Use other method.

## L123

```
Delta-x Convergence NOT Met
     Maximum number of corrector steps exceeded.
     Error termination via Lnk1e in l123.exe
```

```
GS2 Optimization Failure.
    Error termination via Lnk1e in l123.exe
```

### < Reason >

Gaussian's default IRC algorithm HPC needs to be recalibrated in order to smooth the curve, but it often has the problem of non-convergence of the correction step. When switching to the GS2 algorithm, its restricted optimization sometimes does not converge either.

### < Solution >

Use `IRC=LQA`.


# L1

```
----------
#p sp freq
----------
Illegal ITpye or MSType generated by parse.
Error termination via Lnk1e in l1.exe
```

### < Reason >

Route line has illegal specification. In this example, sp can not use with freq at same time.

### < Solution >

Check input file, use correct keywords and route line specification.

```
------------------
#p m06-2x/6-31g(d)
------------------
QPErr --- A syntax error was detected in the input file.
#p M06-2X/6-31G(d)
       '
Last state= "GCL"
TCursr=      3656 LCursr=       7
Error termination via Lnk1e in l1.exe
```

### < Reason >

Keyword or syntax error in input file, the error is marked with '.

### < Solution >

Check the input file, use correct keyword and syntax.

# L202

```
Small interatomic distances encountered:      6     1     7     2     8     3     9     4    10     5
Problem with the distance matrix.
Error termination via Lnk1e in l202.exe
```

### < Reason >

There are at least two atoms have very close distance (probably to be 0).

### < Solution >

Open the input file with GaussView, check the structure.

```
Small interatomic distances encountered:
     2     1 5.00D-02
Atom too close.
Error termination via Lnk1e in l202.exe
```

### < Reason >

There are at least two atoms have very close distance (longer than 0 but much smaller than a normal distance).

### < Solution >

Open the input file with GaussView, check the structure. If the short distance is necessary for some reason, use `geom=nocrowd` to pass the atomic distance check.

# L301

```
Rotational constant (GHz):      0.0817250      0.0474806      0.0408748
Standard basis: 6-31G(d) (6D, 7F)
Atomic number out of range for 6-31G basis set.
Error termination via Lnk1e in l301.exe
```

### < Reason >

The geometry includes atoms which is not supported by current basis set. For example, the 6-31G basis set only support H-Kr.

### < Solution >

Use correct basis set.

```
 R6DQ: No Q value available for IA=                   0
 Error termination via Lnk1e in l301.exe
```

### < Reason >

Ghost atom Bq could not calculated with dispersion correction like `em` keyword and DFT functionals which including dispersion correction like `wb97XD`, `B97D`.

### < Solution >
When ghost atom is needed in calculations, do not use `em` or `empiricaldispersion` keywords. If DFT functionals like `wb97XD` must be used, include `IOp(3/124)=4` 
keyword to force the program not use dispersion correction.

```
Standard basis: 6-31G(d) (6D, 7F)
Ernie: Thresh= 0.10000D-02 Tol=  0.10000D-05 Strict=F.
The combination of multiplicity 1 and     1 electrons is impossible.
Error termination via Lnk1e in l301.exe
```

### < Reason >

The charge and multiplicity is not reasonable.

### < Solution >

Check the charge and spin multiplicity is correct or not. `Spin multiplicity = N(alpha electons) - N(beta electrons) + 1`.

```
IExCor=  408 DFT=T Ex=B Corr=PW91 ExCW=0 ScaHFX=  0.000000
ScaDFX=  1.000000  1.000000  1.000000  1.000000 ScalE2=  1.000000  1.000000
IRadAn=      0 IRanWt=     -1 IRanGd=            0 ICorTp=0 IEmpDi=141
NAtoms=    1 NActive=    1 NUniq=    1 SFac= 1.00D+00 NAtFMM=   60 NAOKFM=F Big=F
Integral buffers will be    262144 words long.
Raffenetti 2 integral format.
Two-electron integral symmetry is turned on.
R6DS8: Unable to choose the S8 parameter, IExCor=  408 IXCFnc=  0 ScaHFX=  0.000000 IDFTD=4
Error termination via Lnk1e in l301.exe
```

### < Reason >

When using `empiricaldispersion=GD3` or `GD3BJ`, the program does not have the dispersion correction parameters for the corresponding generalized functions.

### < Solution >

1. Make sure you are using the correct functions with D3(BJ) correction. For example, the Minnesota functionals series does not support D3BJ.
2. Use another functionals, or do not use dispersion correction.
3. Custom dispersion correction parameters from reported articles.

```
Integral buffers will be     262144 words long.
Raffenetti 2 integral format.
Two-electron integral symmetry is turned on.
R6DC6: No C6 coefficient available for IA= 96
Error termination via Lnk1e in l301.exe
```

```
Integral buffers will be     262144 words long.
Raffenetti 2 integral format.
Two-electron integral symmetry is turned on.
R6DRCv: No RCov radius available for IA= 96
Error termination via Lnk1e in l301.exe
```

### < Reason >

When using dispersion correction or DFT functionals with built-in dispersion correction (like wB97XD), but the program does not have the parameters for specified elements.

### < Solution >

Do not use dispersion correction. (May be no other choice).

# L502

```
Convergence failure --run terminated.
Error termination via Lnk1e in l502.exe
```

### < Reason >

SCF not converged.

### < Solution >

Please check this [post](https://wongzit.github.io/method-to-solve-the-scf-not-converged/) for "SCF not converged" problem.
# L502, L1002

```
Inaccurate quadrature in CalDSu.
Error termination via Lnk1e in l502.exe
Inaccurate quadrature in CalDSu.
Error termination via Lnk1e in l1002.exe
```

### < Reason >

The integral not enough, under DFT calculations with some basis sets.

### < Solution >

Check the input file, whether there was some miss in basis set or unreasonable structure. If not, use one of following keywords: (1) int=ultrafine (default in G16), or int=grid=300590; (2) SCF=novaracc; (3) guess=INDO. If not work, use (1), (2) and (3) at same time.

# L508

```
Density matrix breaks symmetry, PCut= 6.91D-03
Density matrix has no symmetry -- integrals replicated.
Iteration  80 EE= -1377.03506721338     Delta-E=     -0.001137227868 Grad=4.268D-02
Gradient too large for Newton-Raphson -- use scaled steepest descent instead.
Convergence failure.
Error termination via Lnk1e in l508.exe
```

### < Reason >

SCF not converged when QC method was used.

### < Solution >

Delete keywords like `SCF=QC`, `SCF=XQC`, `SCF=YQC` and submit to calculation again.

# L801

```
Largest valence mixing into a core orbital is  5.06D-01
Largest core mixing into a valence orbital is  4.89D-01
Excessive mixing of frozen core and valence orbitals.
Error termination via Lnk1e in l801.exe
```

### < Reason >

Gaussian will do frozen core approximation on post-HF, doubly-hybrid functionals and TD-SCF calculations, this approximation sometimes cause error problem.

### < Solution >

1. Use `(full)` option in keyword, for example, MP2 -> MP2(full), CCSD(T) -> CCSD(T,full).
2. Use `IOp(8/11=1)` to ignore the frozen core error. DO NOT forget to check whether the result if reasonable or not after calculation.

# L9999

```
Error termination via Lnk1e in l9999.exe
```

This error requires checking the output file for additional information. Please search up from the end of output file for "Optimization stop", you can see the following scenarios:

```
Optimization stopped.
-- Wrong number of Negative eigenvalues: Desired= 1 Actual= 4
-- Flag reset to prevent archiving.
```

### < Reason >

Gaussian will check the number of negative frequency after finishing the TS optimization, if there is more than 1 negative frequency, the calculation would be stopped.

### < Solution >

Use keyword opt=noeigen

```
Optimization stopped.
-- Number of steps exceeded, NStep= 100
-- Flag reset to prevent archiving.
```

### < Reason >

The optimization was not converged in a specified number of steps.

### < Solution >

Open the output file in GaussView, check whether the optimization steps is shaking.
1. If not, redo the optimization with the last geometry, and use keyword `opt=maxcycle=n` (n is 2 or 3 times of current number of step).
2. If yes, try following method:
2.1) Use different optimization method: `opt=RFO`, `opt=GDIIS`, `opt=GEDIIS`.
2.2) Use different coordinate system: `opt=cartesian`.
2.3) Modify the symmetry.
2.4) Try different DFT functionals or basis set.
