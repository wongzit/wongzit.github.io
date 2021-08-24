---
layout: post
title:  "NICS Analyses with NICSgen"
date:   2021-06-03 22:00:16 +0900
categories: software guide
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

# Statement of need

NICS (Nucleus-Independent Chemical Shifts) is a popular method for analyzing aromaticity of cyclic compound, by calculating the magnetic shielding tensor (in ppm) with NMR calculation. In NICS calculation, ghost atoms (Bq) are needed to be included in the input file. NICS(n) is widely used for n = 0 and n = 1 ([Which NICS aromaticity index for planar π rings is best?](https://pubs.acs.org/doi/10.1021/ol0529546)), we need to add the ghost atom to the height of 1 Å from the center point of the plane. It is difficult to add the ghost atom accurately. So, I present the Python program NICSgen, to help user add the ghost atom in the right position.

# Statement of need

NICSgen could be download from homepage and [*GitHub*](https://github.com/wongzit/NICSgen). To install and run the programs, please refer to the user manuals

# Mathematic Principle

Imagine we have *m* (*m* >= 3) points *p* on plane in Cartesian coordinate space system, the coordinates of these points are:

$$ p_1 = (x_1,y_1,z_1) $$
$$ p_2 = (x_2,y_2,z_2) $$
$$ p_3 = (x_3,y_3,z_3) $$
$$ \cdots $$
$$ p_m = (x_m,y_m,z_m) $$

So, the center point p(c) of these point should be located at:

$$ p_c = (x_c,y_c,z_c),{\rm where:} $$
$$ x_c=\frac{1}{m} \sum_{i=1}^m x_i,\:y_c=\frac{1}{m} \sum_{i=1}^m y_i,\:z_c=\frac{1}{m} \sum_{i=1}^m z_i $$

The coordinates of *p*(*c*) is the ghost atom for NICS(0) calculation.

Next, for NICS(n): we need to add the ghost atom to the height of n Å from the center point of the plane. Here is the common solution:

<p align="center">
<img alt="nicsfig1" src="/assets/blog/figure61.png" style="height:500px;">
</p>

Vector *n* is the normal vector of plane Π, so,

$$  $$