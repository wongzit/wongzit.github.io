---
layout: post
title:  "Analyze Intermolecular Interactions by SAPT"
date:   2023-11-09 16:26:56 +0900
tags: [Psi4, Computation]
author: Zhe Wang
---

This is a quick note of how to analyze intermolecular interaction by Sysmetry-Adapted Perturbation Theory (SAPT) 
using *Psi4*.

# 1. Preface

SAPT can divide intermolecular interaction into 4 components:

1. **Electrostatics**: describes the classical Coulomb interaction between fragments, with positive or negative values.
2. **Exchange**: describes the short-range exchange repulsion between fragments, with positive values (i.e. unfavorable for binding).
3. **Dispersion**: has a negative value and acts as an attractive force.
4. **Induction**: reflects the polarization and transfer of charges between fragments, with a negative value.

The SAPT theory involves intramolecular and intermolecular perturbations, and as the order of perturbations increases, the results get better. In principle (as the order of perturbations considered increases step by step), the accuracy order is `SAPT0`, `SAPT2`, `SAPT2+`, `SAPT2+(3)`, `SAPT2+3`. `SAPT0` can still be used for medium to moderately large systems, while `SAPT2+(3)` can only be used for small systems.

In order to improve the accuracy of SAPT interaction calculations, the `SAPT0` in the *Psi4* program also includes the `δHF` term, which reflects the high-order induction effect. For high-order SAPT such as `SAPT2+`, `SAPT2+(3)`, `SAPT2+3`, the `δMP2` term can also be added to consider the high-order coupling between induction and dispersion, such as `SAPT2+(3)` combined with `δMP2` called `SAPT2+(3)δMP2`. However, the physical meaning of the `δ` term is not very clear and cannot be further divided. The numerical value of the δ term is usually small, and it is generally classified as an induction term.

# 2. Input

An example is shown following:

```
memory 20 gb

molecule　dimer {
0 1
S       1.318033    5.842267    2.881214
N      -1.355505    5.579081    0.154536
H      -1.976421    5.935383   -0.153845
C      -0.705457    6.014672    1.291775
C      -0.905384    7.050266    2.235758
H      -1.629222    7.634376    2.237331
C      -0.563794    4.592784   -0.398267
C       0.472970    5.283299    1.488835
C       0.120527    7.070918    3.149491
H       0.169447    7.685226    3.846026
S      -1.318033    3.137133   -2.881214
N       1.355505    3.400319   -0.154536
H       1.976421    3.044017    0.153845
C       0.705457    2.964728   -1.291775
C       0.905384    1.929134   -2.235758
H       1.629222    1.345024   -2.237331
C       0.563794    4.386616    0.398267
C      -0.472970    3.696101   -1.488835
C      -0.120527    1.908482   -3.149491
H      -0.169447    1.294174   -3.846026
     --
     0 1
S       4.174133   -1.352567   -2.881214
N       1.500595   -1.089381   -0.154536
H       0.879679   -1.445683    0.153845
C       2.150643   -1.524972   -1.291775
C       1.950716   -2.560566   -2.235758
H       1.226878   -3.144676   -2.237331
C       2.292306   -0.103084    0.398267
C       3.329070   -0.793599   -1.488835
C       2.976627   -2.581218   -3.149491
H       3.025547   -3.195526   -3.846026
S       1.538067    1.352567    2.881214
N       4.211605    1.089381    0.154536
H       4.832521    1.445683   -0.153845
C       3.561557    1.524972    1.291775
C       3.761484    2.560566    2.235758
H       4.485322    3.144676    2.237331
C       3.419894    0.103084   -0.398267
C       2.383130    0.793599    1.488835
C       2.735573    2.581218    3.149491
H       2.686653    3.195526    3.846026
     units angstrom

}
set {
    basis jun-cc-pVDZ
    scf_type DF
    freeze_core True
}

energy('sapt0')
```

- `freeze_core True` can save computational cost.
- `scf_type DF` can utilize density fitting to accelerate the SCF process.

Run command `psi4 xxx.inp xxx.out -n 8` to start the calculation using 8 cores.

# 3. Output

The SAPT results would be summarized as following.

```
  Special recipe for scaled SAPT0 (see Manual):
    Electrostatics sSAPT0         -24.34792103 [mEh]     -15.27855111 [kcal/mol]     -63.92545785 [kJ/mol]
    Exchange sSAPT0                15.70145759 [mEh]       9.85281339 [kcal/mol]      41.22417122 [kJ/mol]
    Induction sSAPT0               -5.93603581 [mEh]      -3.72491871 [kcal/mol]     -15.58505986 [kJ/mol]
    Dispersion sSAPT0              -4.77805738 [mEh]      -2.99827627 [kcal/mol]     -12.54478793 [kJ/mol]
  Total sSAPT0                    -19.36055663 [mEh]     -12.14893270 [kcal/mol]     -50.83113444 [kJ/mol]
```


