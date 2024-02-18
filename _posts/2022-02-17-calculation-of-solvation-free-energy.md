---
layout: post
title:  "Calculation of Solvation Free Energy"
date:   2022-02-17 10:07:28 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

# General

For implicit solvation model, the solvent effect can be divided into **polar** and **non-polar** parts. The 
polar part reflects the electrostatic interaction between solvent and solute molecules, and also includes 
the polarization of the solvent on the electron distribution of the solute, which is the main body of 
the implicit solvent model. The non-polar part is relatively minor, reflectin various non-electrostatic 
nteractions betwen solvent and solute molecues, with more complex components. Only whtn the non-polar 
part is also considered can the solvent free energy be calculated quantitatively and accurately.
*PCM*, *CPCM*, *IPCM*, *COSMO* only define how to calculate the polar part of solvent effect, but the non-polar 
part is not clearly given in the solvation model. In contrast, the *SMD* and *SMx* series clearly define how 
to calculate the non-polar part and specifically fit the parameters under different calculation levels.

# Implicit Solvation Model in Gaussian

## Default: IEFPCM

When use *IEFPCM* directly in Gaussian 16, the non-polar part is not calculate by default. To calculate the 
non-polar part, you have to write `read` in `scrf` keyword and write a blank line at the end of the coordinates 
and add following lines to the end of input file:

```
Dis
Rep
Cav
```
This means that the values of the non-polar part of the solvent effect are calculated and included in 
the calculated single point energy.

***If there are no special reason, it is always recommended to use SMD solvation model. If optimization does not
converged with SMD model, try the optimization with IEFPCM model and calculated the single point energy with 
SMD model.***

## Use of Built-in Solvent

Gaussian includes several built-in solvents when use `scrf=solvent=x`, check [this page](https://gaussian.com/scrf/) to see the all supported 
solvents.

## Define New Solvent (Polar Part Only)

Use `scrf=read` and add following part to the end of input file:

```
eps=x
epsinf=y
```

This means the solvent static and dynamic dielectric constants are defined as *x* and *y*, respectively, which 
are the two most important parameters of the implicit solvent model. For normal ground state calculations, it is 
enough to only define the `eps`, but, for the TD-DFT calculations, `epsinf` is also important. If you could not 
find the value for `epsinf`, the square of refractive index could be used instead of dynamic dielectric 
constants. If you could not find the refractive index, for non-polar solvent, use the same value of `eps` for 
`epsinf`, for polar solvent, use `epsinf=1.9`.

For mixture solvent, mixing the `eps` and `epsinf` of several solvents in proportion to their volume.

## Define New Solvent (Polar and Non-Polar Part)

For *SMD* model, the non-polar part is also necessary when users try to define a new solvent. Use `scrf=(read,SMD,solvent=generic)` keyword and add following lines to the end of input file:

```
eps=a
epsinf=b
HBondAcidity=c
HBondBasicity=d
SurfaceTensionAtInterface=e
CarbonAromaticity=f
ElectronegativeHalogenicity=g
```

`SurfaceTensionAtInterface` is the surface tension of solvent, in unit of *cal/mol/Å^2*. `CarbonAromaticity` is the number of aromatic carbon atoms as a percentage of the number of all carbon atoms. `ElectronegativeHalogenicity` is the number of halogen atoms as a percentage of the number of all non-hydrogen atoms. `HBondAcidity` and `HBondBasicity` are Abraham acidity and basicity.


If it is hard to find all the parameters for a new solvent, it is a good choice to use a built-in solvent which 
has similar properties with those of target solvent (e.g., hexane and heptane), and define the `eps` and 
`epsinf` only.

# Calculation of Solvation Free Energy

**Solvation free energy = Single point energy with solvation model - Single point energy at gas phase**

From the original paper of *SMD* model, the best calculaion level is **M052x/6-31g(d)**. Even for the anion, 
use **6-31g(d)** rather than **6-31+g(d)**. Since the **M062x** is similar to **M052x** and both of them have 
same HF components, so, the **M062x/6-31g(d)** should also okay for calculations of solvation free energy.

About the geometry optimization, normally, use the optimized geometry at gas phase should be enough.


# Calculation of Solute Free Energy

**Solute free energy (298.15 K, 1 M) in solution = Solute free energy (1 atm) at gas phase + Solvation Free Energy + 1.89 kcal/mol**

The value of *1.89 kcal/mol* is the free energy change from 1 atm in gas phase to 1 M in solution phase.

# Calculation Procedure


A general procedure for calculation of solute free energy (in ethanol):
```
%chk=test.chk
#p opt freq b3lyp/6-311g(d) em=gd3bj scrf=(smd,solvent=ethanol)

[Geometry]

--Link1--
%oldche=test.chk
#p b2plypd3/def2tzvp geom=allcheck

--Link1--
%oldchk=test.chk
#p m052x/6-31g(d) geom=allcheck

--Link1--
%oldchk=test.chk
#p m052x/6-31g(d) scrf=(smd,solvent=ethanol) geom=allcheck

```

In the first job, we could get the free energy in ethanol (in gas phase is also okay):
```
Thermal correction to Gibbs Free Energy=         (A)
```

In the second job, we could get the electroinc energy at high calculation level. In this example, the doubly 
hybrid density functional (DHDFT) is used, the electronic energy should be read from the archive part of output file, 
marked with `|MP2=(B)|`, rather than reading from the summary window in GaussView (5.0.9 and 6.0.16), since the later one is wrong (In GaussView 6.1.1, this problem has been fixed). This calculation maybe faster in ORCA than Gaussian. For the molecules with more than 50 atoms, M062x is a better choice than DHDFT.

In the third job, we could get the electronic energy `SCF Done:  E(RM052X) =  (C)` at gas phase.

In the forth job, we could get the electronic energy `SCF Done:  E(RM052X) =  (D)`at solution phase.

So, the solvation free energy is `(D) - (C)`, solute free energy is `(B) + (A) + (D) - (C) + 1.89 kcal/mol`.
