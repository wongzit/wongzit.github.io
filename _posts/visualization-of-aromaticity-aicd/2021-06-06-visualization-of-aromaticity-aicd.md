---
layout: post
title:  "Visualization of Aromaticity: AICD"
date:   2021-06-06 00:33:56 +0900
categories: computation
---

> This blog is part of theme collection: Visualization of Aromaticity, see post of GIMIC in this collection.

# Background

Anisotropy of the Induced Current Density (AICD) has been widely used for aromaticity analyses. More basic knowledge about AICD, please refer to this [review paper](https://pubs.acs.org/doi/10.1021/cr0300901). In this blog, I will show you how to make the AICD plot and apply AICD to your research. AICD is a free and open source program, you can obtain the program freely from the [author](rherges@oc.uni-kiel.de).

The biggest feature of AICD is that it can separate the orbital contribution (from all molecular orbitals, or from π orbitals only), this is useful when analyze the aromaticity from the contribution of π electrons.

# Procedure

In this section, I will use an example of 1-methylazulene as a demo calculation to explain how to make the AICD plot. Calculation files could be download from [here](https://github.com/wongzit/blogFiles/tree/main/blog_AICD). I also uploaded a slide for AICD analysis of cyclo[18]carbon, it is also a good example for AICD analysis.

## NMR calculation

Before doing this NMR calculation, make sure you have already optimized your geometry. The 1-methylazulene was optimized at ωB97X-D/6-31G(d) level of theory. The input file for NMR calculation have to contain following keywords:

**Contribution from all ortbials**

```
# nmr=csgt b3lyp/6-31g(d) iop(10/93=1)

 title

 0 1
 […Coordinates…]

 filename.txt

```

**Contribution from specified orbitals**

```
# nmr=csgt b3lyp/6-31g(d) iop(10/93=2)

title

0 1
[…Coordinates…]

filename.txt

orbital number 1
orbital number 2
...

```

There are several important points for the input file:

1. Use `CSGT` method for NMR calculation.
2. B3LYP/6-31G(d) is often enough to yield qualitatively satisfactory result.
3. Include the `IOp(10/93=n)` keywords: *n* = 1 for calculating contribution from all orbitals and *n* = 2 for calculating contribution from specified orbitals.
4. A .txt file including ring current grid information would be saved during the NMR calculation, so, you need to specify a file name for it.
5. Include the molecular orbital numbers (those will be considered for NMR calculation) in the end of input file if you use `IOp(10/93=2)`. (For unrestricted calculation, alpha orbitals and beta orbitals are separated, the orbital numbers of alpha orbital are same as those displayed in GaussView, but, the orbital numbers of beta orbitals are those in GaussView plus occupied orbital numbers. e.g., for the ith alpha and beta orbitals, and total *n* occupied orbitals, you need to write "*i*" and "*i+n*".)

<p align="center">
<img alt="aicdfig1" src="/assets/blog/figure81.png" style="height:300px;">
</p>

Submit this input file to Gaussian calculation. Once the calculation is completed, .log (or .out) and .txt files would be generated, these 2 files are necessary for next step AICD calculation.

## AICD calculation

Execute following command for AICD calculation:

```
AICD option1 value1 option2 value2 --povrayinput -c xxx.log
```

There are some useful option for make high quality AICD plots:

### -m *n*
Molecular view in AICD plots, *n* = 1-4. (1: single view, surface only; 2: single view, surface and arrows; 3: multi view, surface only; 4: multi view, surface and arrows)

<p align="center">
<img alt="aicdfig2" src="/assets/blog/figure82.png">
</p>

### -b *x y z*
Direction of external magnetic field (default is 0 0 1), the external magnetic field is defined in vector space with *x*, *y*, *z* direction. The external is only defined in direction, the magnitude is out of consideration (e.g.: 0 0 1 is same as 0 0 2).

<p align="center">
<img alt="aicdfig3" src="/assets/blog/figure83.png" style="height:300px;">
</p>

### -l *r*

Iso-surface value.

<p align="center">
<img alt="aicdfig4" src="/assets/blog/figure84.png" style="height:300px;">
</p>

### -p *n*

Number of data points, default is 40000, larger *n* value will generate more arrows and smoother iso-surface. More computational cost is needed.

<p align="center">
<img alt="aicdfig5" src="/assets/blog/figure85.png" style="height:300px;">
</p>

### --maxarrowlength *f*

Define the maximum of arrow length, the arrows longer than value *f* would not be displayed in AICD map (similar option: `--minarrowlength`)

<p align="center">
<img alt="aicdfig6" src="/assets/blog/figure86.png" style="height:300px;">
</p>

### -s

Smoothly graphical representation, needs more computational cost.

<p align="center">
<img alt="aicdfig7" src="/assets/blog/figure87.png" style="height:300px;">
</p>

More options can be found from `AICD -h` command. After AICD calculation, several files would be generated and we need the files in the folder named as “*xxxxxxxxxxxxxx.d*”. Copy this folder to a computer with POV-Ray installed.

## AICD visualization

To visualize the AICD plot, image rendering software, POV-Ray, is needed. POV-Ray could be freely download from the [homepage](http://www.povray.org). Open the “*RenderMich.pov*” file with POV-Ray in the “*xxxxxxxxxxxxxx.d*” folder. Choose the resolution and click “Run” icon. The AICD plot will be shown in a new window, and it will be saved as .png image at current path automatically, so, you don’t need to save it manually.

Here are some common issues when using the POV-Ray:

### Molecular structure could not be fully displayed

The following figure shows how the POV-Ray renders an image:

<p align="center">
<img alt="aicdfig8" src="/assets/blog/figure88.png" style="height:300px;">
</p>

If the molecule is not displayed in full, please modify the `camera - location` coordinate <*x*, *y*, *z*> in the “*RenderMich.pov*” file. More negative *z* value will give smaller size molecule. 

```
camera{
  location <  0, 0, -160 >
  direction < 0, 0, 2 >
  sky < 0, 1, 0 >
  up < 0, 1, 0 >
  right < 1.333, 0, 0 >
  orthographic
}
```

<p align="center">
<img alt="aicdfig9" src="/assets/blog/figure89.png" style="height:300px;">
</p>

### Geometries are overlapping with others

If the molecule is overlapping to each other, please modify the object translate coordinates in the end of the file. The value also consists with <*x*, *y*, *z*> coordinates, *z* should always be 0 (on the plane).

```
object           // vertical view in the 1st column
{ MolUndMag
  translate < -45,32,0 >
}
object           // front view in the 1st column
{ MolUndMag
  rotate < 90,0,0 >
  translate < -45,0,0 >
}
object           // side view in the 1st column
{ MolUndMag
  rotate < 0,90,0 >
  translate < -45,-32,0 >
}


object           // vertical view in the 2nd column
{ MolUndIso
  translate < -10,29,0 >
}
object           // front view in the 2nd column
{ MolUndIso
  rotate < 90,0,0 >
  translate < -10,0,0 >
}
object           // side view in the 2nd column
{ MolUndIso
  rotate < 0,90,0 >
  translate < -10,-29,0 >
}

object           // vertical view in the 3rd column
{ MolUndIso
  rotate < 0,180,0 >
  translate < 35,29,0 >
}
object           // front view in the 3rd column
{ MolUndIso
  rotate < 90,0,0 >
  rotate < 0,180,0 >
  translate < 35,0,0 >
}
object           // side view in the 3rd column
{ MolUndIso
  rotate < 0,90,0 >
  rotate < 0,180,0 >
  translate < 35,-29,0 >
}

```

<p align="center">
<img alt="aicdfig10" src="/assets/blog/figure810.png">
</p>