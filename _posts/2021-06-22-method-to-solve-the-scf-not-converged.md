---
layout: post
title:  "Methods to Solve the SCF not Converged"
date:   2021-06-22 21:18:19 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

> Original source of this blog (in Chinese):[http://sobereva.com/61](http://sobereva.com/61)

This blog summarized some methods to solve the "SCF not converged" problem in Gaussian. These method may not 100% works, but they are worth to try.

1. For Minnesota functionals, like M05, M06-2X, etc., try to increase the integration grid. The default is `int=fine` for Gaussian 09 and `int=ultrafine` in Gaussian 16. Note that it is very important to use the same grid for all calculations where you intend to compare energies. More computational cost is needed if finer integration grid is used.
2. Gaussian automatically reduces the integration grid at the beginning of the calculation to speed it up, but there is a risk that SCF may not converged. For the calculations using diffuse functions with SCF not converged error, please try to use `SCF=NoVarAcc` to stop the reduction.
3. For the calculations using diffuse functions, you can increase the integration accuracy by `int=acc2e=12` (which is default in Gaussian 16).
4. Gaussian uses Incremental Fock by default to construct the Fock matrix in an approximate manner to significantly save time at each step of the iterative process, but may thus hinder convergence. This can be avoided by using `SCF=Noincfock`.
5. Use energy level shift method is used to increase the virtual orbital energy to increase the HOMO-LUMO gap and avoid excessive mixing between the virtual and occupied orbitals: `SCF=vshift=x`, where `x` is typically 300~500. This only affects the convergence process and definitely does not affect any final calculation results. For the case of small HOMO-LUMO gap, common for systems containing transition metals, this method may be useful.
6. The convergence limit could be changed with the `SCF=conver=N` keyword, which means that the density matrix RMS convergence limitation is 1E-N, and the density matrix maximum change and energy convergence limit are 1E(-N+2). However, the convergence requirement of the density matrix is a bit too strict and often not easy to achieve, and the energy has usually converged to a very high accuracy by the time SCF convergence is reached. For single point calculation, it can be safely reduced to `SCF=conver=6`, which is equivalent to relaxing the convergence criterion by 100 times, and the energy change is usually very small by the time of convergence. However, it is not recommended to lower the default SCF convergence limit when doing geometry optimization and vibration analysis, otherwise the results may be inaccurate and may also hinder the convergence of geometry optimization.
7. If SCF was not converged, try to use other density functionals. If SCF was converged at other functionals, use `guess=read` to read the converged wavefuntions as the initial guess.
8. Smaller basis sets are always easier to converge than larger basis sets. Use `guess=read` to read the converged wavefunctions (similar to method 7).
9. Change the initail guess method, like `guess=huckel`, `guess=indo`.
10. Use quadratic convergence method, `SCF=QC`. This method will cost more computational resources.
11. Use Fermi broadening, `SCF=Fermi`.
12. DIIS is the default method for speeding up the SCF convergence, but sometimes it make SCF not converge. Use `SCF=noDIIS` to stop using DIIS.
13. Make a smaller change on the molecular geometry, like slightly modify the bond lengths, bond angles, etc.
14. For open-shell systems, try to calculate its ionized closed-shell specie, if SCF converged, use `guess=read` as the initial guess for the calculation of open-shell specie.
15. SCF is often easier to converge with lower number of electrons, for example, cations are generally easier to converge SCF than anions. You can use `guess=read` from converged cations.
16. If solvation model is used, try to calculate it in gas-phase or other solvation models, if converged, use `guess=read` as the initial guess.

## DO NOT use following methods
1. Keyword `SCF=maxcyc=N` (equal to `scfcyc=N`) can increase the SCF cycle steps. This is normally useless. If SCF not converged in 128 steps (by default), check the SCF is shaking or not, if SCF is shaking, increase SCF steps is meaningless.
2. Keyword `IOp(5/13=1)` is a **stupid** method to “solve” the SCF not converge problem. `IOp(5/13=1)` means: SCF does not converge or report an error when it reaches the specified number of turns, and continues to run even on non-convergence. This is not a method for “solving” the problem, this is ignoring the problem. This keyword should never be used in every computations.