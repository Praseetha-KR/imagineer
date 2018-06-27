---
layout: post
title:  "Huawei E303C not detecting in MacBook Pro"
date:   2014-01-07 21:40:30
tags:
    - osx
    - hardware
masthead: "/assets/img/posts/e303c.jpg"
blurb: "Glitches of plugging in E303C huawei datacard in Macbook Pro Retina laptop"
theme: "#7A6861"
---

I have been trying to get my Huawei E303C 3G datacard to be working in MacBook Pro (15" retina i7 with OSX 10.8.3). Device showed a blinking green light, otherwise there was no sign of a connected USB device.

1. Downloaded <a target="_blank" href="http://consumer.huawei.com/en/support/downloads/index.htm?id=5221&name=E303Cs">Huawei Mobile Partner client for Mac</a>
2. System preferences > Network > (checked for Huawei service), but it wasn't there.
3. Checked for disk filesystems: `$ df -h`, it didn't listed huawei device.
4. Listed all devices: `$ ls /dev`, and checked for `tty.HUAWEIMobile-Pcui`, but still it was the same. <a target="_blank" href="http://superuser.com/questions/624838/how-can-huawei-e3276-usb-modem-work-on-mac-os-x-10-8-4#answer-633762">(more info)</a>
5. Installed '3 connect installer', to search seperately for Huawei device, still no presence of datacard detected. <a target="_blank" href="http://pasamio.com/2011/07/22/getting-your-huawei-modem-working-with-mac-os-x-lion/">(more info)</a>

Little green light kept on blinking, though device didn't get detected at all. Googled and tried out even more ways, till I found out this - *connect datacard via USB hub* - and guess what - it worked perfectly fine! Thats one of the unexpected solutions I ever have seen!!

the problem is with MacBook Pro's new USB ports (USB 2.0 and 3.0 integrated) and Huawei E303C Datacard.
It is a hardware support issue with Huawei E303C Datacard.
