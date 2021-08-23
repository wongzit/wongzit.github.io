---
layout: post
title:  "EPR Prediction with ORCA Program"
date:   2021-05-27 21:29:20 +0900
categories: jekyll update
---

# Input File Structure
ORCA input file for EPR calculation have to (at least) include following section: (1) Calculation method, (2) geometry coordinates, and (3) additional keywords section. The (2) geometry coordinates can be inserted in input file, or save the structure as .xyz file in the same dictionary with input file. Here are 2 examples of input file.

**Input file 1**: including Cartesian coordinates in input file. The coordinates structure is same as those in Gaussian input file.

{% highlight xml %}
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyz [charge] [spin multiplicity]
 [Cartesian coordinates]
*
%eprnmr
    [EPR keywords section]
end
{% endhighlight %}

**Input file 2**: Save the geometry as .xyz file at same dictionary with ORCA input file, the ORCA program will read geometry information from .xyz file.

{% highlight xml %}
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyzfile [charge] [spin multiplicity] [geometry.xyz]
%eprnmr
    [EPR keywords section]
end
{% endhighlight %}

**Details about the input file:**

<u>R/U/ROKS</u>: For restricted Hartree-Fock (HF) calculation, use RKS; for unrestricted HF, use UKS and for restricted-open HF, use ROKS. It is better to use ROKS rather than UKS for EPR prediction (<i>J. Phys. Chem. A</i> <b>2006</b>, <i>110</i>, 12267-12275).

<u>method</u>: Specify the calculation method, like B3LYP, BP, etc.

<u>basis set</u>: Specify the basis set, like 6-31G*, etc. EPR-II and EPR-III are widely used basis sets optimized for EPR prediction. ( I always use EPR-II for my calculations due to its high-efficiency. EPR-III is more accurate but much more expensive calculation cost is needed.)

<u>charge</u> <u>spin multiplicity</u>: Same with Gaussian (e.g., for neutral triplet, use 0 3).

<u>EPR keywords section</u>: This would be discussed in following section.

Keywords *AutoAux* and *RIJCOSX* could be added to speed up calculations with introducing a very very small error (usually smaller than basis set errors and much smaller than electronic-structure-method errors). For more information about these keywords, please check the [ORCA manual](https://sites.google.com/site/orcainputlibrary/basis-sets/ri-and-auxiliary-basis-sets).

# Hyperfine Coupling Constant

For predicting hyperfine coupling (HFC), you need to include following keywords in <u>EPR keywords section</u>.

{% highlight xml %}
 %eprnmr
     gtensor = true
     Nuclei = all N {flags}  # flags = aiso, adip, aorb, etc...
     Nuclei = all C {flags}
 end
 {% endhighlight %}
 
<u>gtensor</u> flag must be set to true or 1 to compute it.

<u>Nuclei = ...</u>: This flag defines the atoms for the hyperfine coupling calculations. all H calculates the HFC on all hydrogens, or use all N, all C and so on for different atoms. You can also use Nuclei = 1,5,8 to give one list per atom type (in this example, atom 1,5,8 must be same element) with the atom numbering starting from 1. The {flags} in Nuclei lines requests calculation option for HFC:

{% highlight xml %}
 aiso: calculate the isotropic part of the HFC
 adip: calculated the dipolar part of the HFC
aorb: 2nd order contribution to the HFC from SOC
{% endhighlight %}

After the calculation is completed, the g tensor and HFC could be read from output file:

{% highlight xml %}
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
{% endhighlight %}

# Zero-field Splitting (ZFS) Prediction

If you want to predict ZFS parameters for the systems with S > 1/2, please include following keywords in <u>EPR keywords section</u>. Keywords after the # indicate for other options.

For UKS calculation:

{% highlight xml %}
%eprnmr
    dtensor ssandso     # ss, so
    dss uno                 # direct
    dsoc cp                 # qro, pk, cvw
end
{% endhighlight %}

For ROKS calculation:

{% highlight xml %}
%eprnmr
    dtensor ss
    dss direct
end
{% endhighlight %}

<u>dtensor</u> flag has three options for predict the D tensor: (1) ssandso (spin-spin and spin-orbital component), (2) ss (only spin-spin component) and (3) so (only spin-orbital component). All of these three options could be applied in unrestricted (UKS) calculation, but for restricted-open (ROKS) calculation, only spin-spin part (ss) could be estimated.

<u>dss</u> flag controls the algorithms of calculation of spin-spin component. Two options is available: (1) uno (use spin density from UNOs, this could only be used in UKS calculation) and (2) direct (directly use the canonical orbitals for the spin density).

<u>dsoc</u> flag controls the algorithms of calculation of spin-orbital component. This is not available in restricted-open calculation. Other options:

{% highlight xml %}
   cp: coupled-perturbed method (default)
 qro: quasi-restricted method, must be done with keyword !uno
   pk: Pederson-Khanna method
cvw: van Wüllen method
{% endhighlight %}

After the calculation is completed, you could read the ZFS parameters from output file:

{% highlight xml %}
D     =    0.019661  cm**-1
E/D =    0.172867
{% endhighlight %}

# Example

Here I put two input files I used for EPR prediction. (methyl radical and triplet cyclopentane-1,3-diyl diradical, all geometries were optimized at UB3LYP/6-31G* level of theory with *Gaussian 16 B.01*).

## Predict HFC of methyl radical

{% highlight ruby %}
! roks b3lyp epr-ii autoaux pal8
* xyzfile 0   2
 C          0.12985        0.22512        0.99745
 H         -0.05078       -0.08769       -0.01940
 H          1.02784       -0.08847        1.50742
 H         -0.59091        0.84605        1.50753
%eprnmr
    gtensor 1
    Nuclei = all H {aiso, adip, aorb}
end
{% endhighlight %}

## Predict ZFS of cyclopentane-1,3-diyl diradical

Calculate at ROBP/EPR-II level of theory:

{% highlight xml %}
!roks bp epr-ii autoaux pal8
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
{% endhighlight %}

Calculate at UBP/EPR-II level of theory.

{% highlight xml %}
!uks bp epr-ii autoaux pal8
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
{% endhighlight %}

# End

The EPR prediction of ZFS may get better results from CASSCF method.
For more information, please refer to the ORCA official manual (for EPR calculation keywords, from page 888 to page 891 in the manual of version 4.2.1).
[This website](https://www.orcasoftware.de/tutorials_orca/spec/EPR.html) also have some useful information on EPR calculation with ORCA.
