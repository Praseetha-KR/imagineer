---
layout: post
title:  "The why of video compression"
date:   2015-05-11 11:52:00
categories: blog
blurb: "The importance of video compression through some interesting figures"
---

This article explains the importance of video compression through some interesting figures.

Video comprises of collection of picture frames, picture is composed of pixels (aka picture elements). So let's start from pixels.

A pixel is the unit of display screen. Typically pixel is represented by RGB plus an alpha value, RGB (red, green, blue) values changing from 0-255 and alpha value on a scale of 0 to 1 with fractions. So each value can have 256 values = 2^8, that is 8 bits.

| Elements   | Total number of values | number of bytes        |
| ---------- |:----------------------:|-----------------------:|
| R          | 256                    | 2 ^ 8 = 8 bit = 1 byte |
| G          | 256                    | 1 byte                 |
| B          | 256                    | 1 byte                 |
| Alpha      | 256                    | 1 byte                 |
| Total      |                        | 4 bytes                |


<br>So 32 bits or 4 bytes memory is required to represent a pixel.

Consider a HD image, it is having resolution of 1920 x 1080.

Total number of pixels for an HD image:
{% highlight bash %}
1920 * 1080 = 2073600 pixels = 1.977 Mega pixels ~ 2 Mega pixels
{% endhighlight %}

<br>Memory required to represent an HD image:

{% highlight bash %}
2073600 * 4 = 8294400 bytes = 7.910 MB ~ 8 MB
{% endhighlight %}

<br>Since the persistence of vision is 1/16th of a second, there should be atleast 16 picture frames to make a video out of sequence of pictures. Usually this frequency is 24 fps or 30 fps (frames per second).

{% highlight bash %}
24 fps * 5 min = 24 fps * 5 * 60 s = 7200 frames
{% endhighlight %}

<br>5 min requires 7200 pictures.

{% highlight bash %}
7200 pictures * 8 MB = 57600 MB = 56.25 GB ~ 56 GB
{% endhighlight %}

<br>So a **5 min video require 56 GB memory!** This is even without audio!!

Usually a **5 min youtube video is of 120 MB** size. This size reduction is done with video compression.

Video compression is of 2 types: lossy compression & loseless compression. There are several video compression standards existing today such as H.261, MPEG-4, VP9 etc.

