---
layout: post
title:  "Building OpenCV from source for OSX"
date:   2015-05-12 11:52:00
categories: blog
---

Today I have been trying to figure out installation of [OpenCV](http://opencv.org/) (a computer vision library) in my laptop. This article explain how I did the setup of OpenCV in Mac OSX (Mavericks).

##Pre-requisite: Install CMake

1. Download [CMake](http://www.cmake.org/) build system from the official [CMake website](http://www.cmake.org/download/). I downloaded it from here: [http://www.cmake.org/files/v3.2/cmake-3.2.2-Darwin-x86_64.dmg](http://www.cmake.org/files/v3.2/cmake-3.2.2-Darwin-x86_64.dmg)

2. Install the dmg package and launch it from Applications. That will give you the UI app of CMake
3. Add `cmake` command:
   1. Close the CMake app
   2. Check whether `cmake` command already exists, (by typing `cmake --version`), <br>if exists then remove it using: <br>`brew uninstall cmake`
   3. Remove old links if any, do: <br>`cd /usr/bin`<br>`sudo rm cmake ccmake cmake-gui cpack ctest cmakexbuild`
   4. Open CMake app from the terminal with *sudo*: <br>`sudo /Applications/CMake.app/Contents/MacOS/CMake`
   5. From the CMake app window, choose menu `Tools --> Install For Command Line Use`. Install folder will be `/usr/bin/` by default, submit it by choosing `Install command line links`.
   6. Make sure it works checking `cmake --version`.

##Installation: OpenCV building from source

<br>Download OpenCV from the [official website](http://opencv.org/downloads.html). I downloaded it from [OpenCV 3.0 RC1 for Linux/Mac](https://github.com/Itseez/opencv/archive/3.0.0-rc1.zip).

Extract the zip file, copy the folder `opencv-3.0.0-rc1` to your projects folder,
{% highlight bash %}
mv opencv-3.0.0-rc1 opencv
cd opencv
mkdir build
cd build
{% endhighlight %}

{% highlight bash %}
cmake
make
make install
{% endhighlight %}

<br>Thats it, OpenCV is installed on your system. To confirm installation, do `import cv` from the python terminal:
{% highlight bash %}
$ python
    Python 2.7.8 |Anaconda 2.0.1 (x86_64)| (default, Aug 21 2014, 15:21:46)
    [GCC 4.2.1 (Apple Inc. build 5577)] on darwin
    Type "help", "copyright", "credits" or "license" for more information.
    Anaconda is brought to you by Continuum Analytics.
    Please check out: http://continuum.io/thanks and https://binstar.org
    >>> import cv
    >>>
{% endhighlight %}

<br>If `import cv` doesn't show errors, then the installation is success! Go ahead and write your hello-world opencv app!


*NB: I tried `brew install cmake` and `port install cmake` (using MacPorts), along with `brew install opencv`. But after installation, `import cv` from python terminal ended up throwing error `Segmentation fault`. So I would suggest using CMake app & its command to use for OpenCV compilation from source as explained above.*

