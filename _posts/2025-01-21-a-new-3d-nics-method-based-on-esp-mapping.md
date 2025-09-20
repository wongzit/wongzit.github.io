---
layout: post
title:  A New 3D NICS Method Based on ESP Mapping
date:   2025-01-21 15:53:36 +0900
tags: [Gaussian, Computation]
author: Zhe Wang
---

## Introduction

Nucleus-Independent Chemical Shift (NICS) has become one of the most popular methods for assessing aromaticity, primarily due to its straightforward implementation. Despite its widespread use, evaluating the aromaticity of contorted molecules with NICS remains challenging. To address these difficulties, several three-dimensional approaches—such as [3D-ICSS](DOI	https://doi.org/10.1039/B204629F) and the [3D IMS map](https://doi.org/10.1039/d1sc03368a)—have been proposed.

In this blog, I introduce a new 3D NICS approach that maps NICS values onto an electrostatic potential surface, thereby offering a more comprehensive understanding of the relationship between aromaticity and electron density (currently I name it as *denNICS*). A brief guide on how to implement *denNICS* is provided below. The source code required to perform these calculations is available [here](https://github.com/wongzit/minorScripts/blob/main/denNICS.py).

## Method Overview
#### 1. Compute Total Electron Density
Use **Gaussian** to calculate the total electron density. Make sure to save the results in a `.fchk` file.

#### 2. Generate a .cube File
From the `.fchk` file, create a `.cube` file for the total electron density using the `cubegen` module or **GaussView**.

#### 3. Run the Script (First Pass)
- Execute the script and provide the path to the `.cube` file when prompted.
- Press **Enter**. The script will generate multiple `.gjf` files and a `.pm` file.
> **Note:** You can modify the computational method in the script at lines 77 and 79 to suit your needs.

#### 4. Submit the .gjf Files
Run all generated `.gjf` files in **Gaussian**.

#### 5. Run the Script (Second Pass)
- Once the **Gaussian** calculations are complete, rerun the script.
- Provide the path to any of the resulting `.log` files when prompted and press **Enter**.
- A new `.cube` file named *denNICS.cube* will be generated.

#### 6. Map denNICS.cube
Finally, visualize *denNICS.cube* alongside the total electron density. This combined mapping allows for a clearer, more detailed picture of how aromaticity correlates with the underlying electron density distribution.

Following is an example for a phenanthrene trimer (ref.: [10.1039/d1sc03368a](https://doi.org/10.1039/d1sc03368a)).
<p align="center">
<img alt="reorganization" src="/assets/blog/dennics.png" style="height:366px;">
</p>

This procedure offers a practical way to investigate the aromaticity of complex molecules by integrating NICS values onto an electrostatic potential surface. By following the steps outlined, researchers can gain deeper insight into the interplay between aromaticity and electron density in three-dimensional space.

Currently, *denNICS* is still in development, and I plan to integrate it into the next version of [py.Aroma](https://wongzit.github.io/program/pyaroma/). In the meantime, if you encounter any issues with this method, please don’t hesitate to reach out.
