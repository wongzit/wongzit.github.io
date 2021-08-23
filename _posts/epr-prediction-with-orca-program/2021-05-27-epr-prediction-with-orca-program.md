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

{% highlight ruby %}
! [R/U/ROKS] [method] [basis set] [CPU cores]
* xyzfile [charge] [spin multiplicity] [geometry.xyz]
%eprnmr
    [EPR keywords section]
end
{% endhighlight %}
