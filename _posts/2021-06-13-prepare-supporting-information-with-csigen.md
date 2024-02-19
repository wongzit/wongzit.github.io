---
layout: post
title:  "Prepare Supporting Information with CSIgen"
date:   2021-06-13 20:43:18 +0900
tags: [Software, Computation]
author: Zhe Wang
---

**CSIgen** is end of support. The basic functionalities have been combined into **py.Aroma**, a multi-functional tool for aromaticity analyses. Please check the [homepage](https://wongzit.github.io/program/pyaroma/) of **py.Aroma** for more information.

Computational supporting information (CSI) is necessary in scientific article but preparing CSI is a tiresome task. So, I wrote a program for myself to easily make CSI from Gaussian output file, and last weekend, I released it on [*GitHub*](https://github.com/wongzit/CSIgen).

<div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/blog/figure21.png" class="img-fluid" zoomable=true %}
</div>

Users can easily export the CSI in 6 built-in templates (including .txt and .xlsx format) by loading Gaussian output file to CSIgen. About more details on usage, please refer to the user manual.

Take a look on the CSI created by CSIgen.

<div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/blog/figure22.png" class="img-fluid" zoomable=true %}
</div>