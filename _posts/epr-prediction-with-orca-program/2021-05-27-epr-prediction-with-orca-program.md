---
layout: post
title:  "EPR Prediction with ORCA Program"
date:   2021-05-27 21:29:20 +0900
categories: jekyll update
---

# Input File Structure
ORCA input file for EPR calculation have to (at least) include following section: (1) Calculation method, (2) geometry coordinates, and (3) additional keywords section. The (2) geometry coordinates can be inserted in input file, or save the structure as .xyz file in the same dictionary with input file. Here are 2 examples of input file.

**Input file 1**: including Cartesian coordinates in input file. The coordinates structure is same as those in Gaussian input file.

{% highlight ruby %}
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyz [charge] [spin multiplicity]
 [Cartesian coordinates]
*
%eprnmr
    [EPR keywords section]
end
{% endhighlight %}

**Input file 2**: Save the geometry as .xyz file at same dictionary with ORCA input file, the ORCA program will read geometry information from .xyz file.

{% highlight %}
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyzfile [charge] [spin multiplicity] [geometry.xyz]
%eprnmr
    [EPR keywords section]
end
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

{% highlight ruby %}
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

{% highlight ruby %}
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