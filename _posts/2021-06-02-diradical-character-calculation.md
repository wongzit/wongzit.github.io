---
layout: post
title:  "Diradical Character Calculation"
date:   2021-06-02 21:23:19 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

**Contents**

- [1. Principle](https://wongzit.github.io/diradical-character-calculation/#1-principle)
- [2. Input File Structure](https://wongzit.github.io/diradical-character-calculation/#2-input-file-structure)
- [3. Get Ocuupation Number from Output](https://wongzit.github.io/diradical-character-calculation/#3-get-ocuupation-number-from-output)
- [4. Example: Comparison of Calculation Method](https://wongzit.github.io/diradical-character-calculation/#4-example-comparison-of-calculation-method)

Diradical character has been widely used for estimating the diradical properties of open-shell species. Here I put my memo on calculating diradical character with CASSCF(2,2) method to this blog.

# 1. Principle

1. To calculate diradical character, we need to calculate the occupation number of HOMO and LUMO, (in natural orbitals, HONO and LUNO). Thus, we need to include `pop=no` keyword in the input file.
2. Convergence may be difficult to achieve with direct calculation by CASSCF.
3. We can start the calculations from HF with a small basis set, and save the molecular orbitals (MO) information to .chk file. Then, CASSCF calculations can read the MO information from the .chk file, and use it as the initial guess (`guess=read`).

# 2. Input File Structure

## 2.1 Faster way (but maybe difficult to converge)

For initial MO, we can use RHF/6-31G(d).

```
%chk=filename.chk
# rhf/6-31g(d)

Title

0 1
[...Coordinates...]

--Link1--
%chk=filename.chk
# casscf(2,2)/6-31g(d) guess=read pop=no geom=allcheck

```

## 2.2 Slower way (but easier to converge)

We can start the calculation from a small basis set, like RHF/STO-3g, and increase the basis set step by step to 6-31G(d). **This method is a better choice.**

```
%chk=filename.chk
# rhf/sto-3g

Title

0 1
[...Coordinates...]

--Link1--
%chk=filename.chk
# casscf(2,2)/sto-3g guess=read pop=no geom=allcheck

--Link1--
%chk=filename.chk
# casscf(2,2)/4-31g guess=read pop=no geom=allcheck

--Link1--
%chk=filename.chk
# casscf(2,2)/6-31g(d) guess=read pop=no geom=allcheck

```

# 3. Get Ocuupation Number from Output
Open the output file (.log) with GaussView and check the MO, find the orbital number for HOMO and LUMO. Then, open the output file by text editor, search "Natural Orbital Corfficients", you could get following information:

```
    Natural Orbital Coefficients:
                           1         2         3    
     Eigenvalues --     2.00000   2.00000   2.00000
   1 1   C  1S         -0.04334   0.02638  -0.11872
   2        2S          0.29242   0.01903   0.20825
   3        2PX        -0.05979  -0.04169  -0.02156
```

The number in the first row is orbital number, the eigenvalues are occupation number for each orbital. So, you can find the occupation number for your HOMO and LUMO (here, natural orbital, so they should be called as HONO and LUNO). The occupation number of LUNO could be treated as diradical character.

# 4. Example: Comparison of Calculation Method

Following methods were used for estimating the diradical character of cyclopentant-1,3-diyl diradical. The input and output files could be download from [*here*](https://github.com/wongzit/blogFiles/tree/main/diradical_character).

1. RHF/6-31G(d)   ->   CASSCF(2,2)/6-31G(d)
2. UHF/6-31G(d)   ->   CASSCF(2,2)/6-31G(d)
3. UHF/6-31G(d) guess=mix   ->   CASSCF(2,2)/6-31G(d)
4. RHF/STO-3G   ->   CASSCF(2,2)/STO-3g   ->   CASSCF(2,2)/6-31G(d)
5. RHF/STO-3G   ->   CASSCF(2,2)/STO-3g   ->   CASSCF(2,2)/4-31G   ->   CASSCF(2,2)/6-31G(d)

## Results
1. n(LUNO) = 0.95328
2. n(LUNO) = 0.00000
3. Not converged, error termination
4. n(LUNO) = 0.95328
5. n(LUNO) = 0.97337 **Best method**