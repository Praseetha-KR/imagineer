---
layout: post
title:  "Building OpenCV from source for OSX"
date:   2015-05-12 11:52:00
tags:
    - osx
    - tools
blurb: "Setting up of python version of Open CV, a computer vision library, in Mac OSX"
theme: '#33797C'
---

Today I have been trying to figure out installation of [OpenCV](http://opencv.org/) (a computer vision library) in my laptop. This article explain how I did the setup of OpenCV in Mac OSX (Mavericks).

## Pre-requisite: Install CMake

1. Download [CMake](http://www.cmake.org/) build system from the official [CMake website](http://www.cmake.org/download/). I downloaded it from here: [http://www.cmake.org/files/v3.2/cmake-3.2.2-Darwin-x86_64.dmg](http://www.cmake.org/files/v3.2/cmake-3.2.2-Darwin-x86_64.dmg)

2. Install the dmg package and launch it from Applications. That will give you the UI app of CMake
3. Add `cmake` command:
   1. Close the CMake app and open it from the terminal with *sudo*: <br>`sudo /Applications/CMake.app/Contents/MacOS/CMake`
   5. From the CMake app window, choose menu `Tools --> Install For Command Line Use`. Install folder will be `/usr/bin/` by default, submit it by choosing `Install command line links`.
   6. Make sure it works checking `cmake --version`.

## Installation: OpenCV building from source

<br>Download OpenCV from the [official website](http://opencv.org/downloads.html). I downloaded it from [OpenCV 3.0 RC1 for Linux/Mac](https://github.com/Itseez/opencv/archive/3.0.0-rc1.zip).

Extract the zip file, copy the folder `opencv-3.0.0-rc1` to your projects folder,

```bash
mv opencv-3.0.0-rc1 opencv
cd opencv
mkdir build
cd build
```

```bash
cmake -D CMAKE_BUILD_TYPE=RELEASE ..
make -j4
make install
```

<br>Thats it, OpenCV is installed on your system. To confirm installation, do `import cv` from the python terminal:

```bash
$ python
    Python 2.7.8 |Anaconda 2.0.1 (x86_64)| (default, Aug 21 2014, 15:21:46)
    [GCC 4.2.1 (Apple Inc. build 5577)] on darwin
    Type "help", "copyright", "credits" or "license" for more information.
    Anaconda is brought to you by Continuum Analytics.
    Please check out: http://continuum.io/thanks and https://binstar.org
    >>> import cv
    >>>
```

<br>If `import cv` doesn't show errors, then the installation is success! Go ahead and write your hello-world opencv app!


