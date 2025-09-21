---
title: py.<b>Aroma</b>
description: Known Issues
layout: page
permalink: /program/pyaroma/issue/
---

<hr/>

[🏕️ home](https://wongzit.github.io/program/pyaroma) / [⬇️ download](https://wongzit.github.io/program/pyaroma/download) / [📄 manual](https://wongzit.github.io/program/pyaroma/manual_v41.pdf) / **🔧 issues** / [💎 citations](https://wongzit.github.io/program/pyaroma/citation)

<hr/>

## 1. "Launch Error" on macOS

<p align="center">
<img alt="launcherrir" src="/program/pyaroma/launch.png" style="width:300px;">
</p>

If a **"Launch error"** (see above) popped up on a Mac computer with Apple Silicon, please force the **py.Aroma 4** run in Rosetta mode, as following procedure.

1. Find **py.Aroma 4.app** in your `/Applications` folder.
2. Select **py.Aroma 4.app**, and then press Cmd+I (or right-click/use the File menu and select *Get Info*.). This will open an Info window with details about the app.
3. In the Info window, look for a checkbox labeled, "Open using Rosetta", check the box.
4. Close the Info window.
5. Quit **py.Aroma 4** and reopen it.

## 2. (Windows only) Crashing when save .txt of BLA data

**py.Aroma 4** somehow crashes when trying to save the BLA data into .txt file. This problem only occurred when running prepackaged *.exe* file on Microsoft Windows.