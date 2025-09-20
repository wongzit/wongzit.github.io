---
layout: post
title:  "Hartree-Fock Exchange of DFT Functionals"
date:   2023-08-01 16:46:56 +0900
tags: [Computation]
author: Zhe Wang
---

# Global Hybrid Functionals

|Functional|HF Exchange / %|
|:---|:---:|
|GGA<br>*meta*-GGA|0|
|TPSSh<br>r2SCANh|10|
|O3LYP|11.61|
|TPSS1KCIS|13|
|MPW1KCIS|15|
|(*hybrid*) B97|19.43|
|B3LYP<br>B3P86<br>B3PW91|20|
|B97-1<br>B97-2<br>HCTH93|21|
|MPW3LYP<br>X3LYP|21.8|
|PBE1KCIS|22|
|APFD|23|
|PBE0<br>TPSS0<br>SCAN0<br>r2SCAN0<br>B1B95<br>mPW1PW91|25|
|M06|27|
|PW6B95<br>M05|28|
|MPW1B95|31|
|PBE0-1/3|33.33|
|PBE38|37.5|
|BB1K<br>BMK|42|
|MPW1K|42.8|
|MPWB1K|44|
|MN15|44|
|PWB6K|46|
|BHandHLYP<br>PBE50<br>r2SCAN50|50|
|M08-HX|52.23|
|M06-2X|54|
|M05-2X|56|
|M08-SO|56.79|
|M06-HF|100|

# Range Separated Functionals

|Functional|Short Range / %|Long Range / %|ω|
|:---|:---:|:---:|:---:|
|LC-ωPBE|0|100|0.4|
|LC-PBE0|25|100|0.3|
|ωB97|0|100|0.4|
|ωB97X|15.77|100|0.3|
|ωB97XD|22.2|100|0.2|
|ωB97X-D3(0)|19.57|100|0.25|
|ωB97X-V|16.7|100|0.3|
|ωB97M-V|15|100|0.3|
|CAM-B3LYP|19|65|0.33|
|M11|42.8|100|0.25|
|HSE03<br>HSE06<br>MN12-SX<br>N12-SX|25|0|


