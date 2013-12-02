---
layout: post
title:  "Starting with Raspberry Pi"
date:   2013-12-02 07:14:30
categories: blog
---

I have started using Raspberry Pi today, and I can't control myself from saying that it is **AWESOME!** 

RPi has got a ARM1176JZF-S 700 MHz processor with 512MB RAM. I have attached a 8GB class 10 SD card to it.

###Setting up RPi in Windows 7:###

1. Preparing SD Card:
	- Download the SD Formatting Tool from <a target="_blank" href="https://www.sdcard.org/downloads/formatter_4/eula_windows/">https://www.sdcard.org/downloads/formatter_4/eula_windows/</a>
	- install and run
	- select SD card drive, from 'options' set "FORMAT SIZE ADJUSTMENT" to ON
	- format

2. Download OS:
	- There are <a target="_blank" href="http://www.raspberrypi.org/downloads">many distros available</a>, I used Raspbian <a target="_blank" href="http://downloads.raspberrypi.org/raspbian_latest">http://downloads.raspberrypi.org/raspbian_latest</a>

3. Burn OS image to SD card:
	- Download and install <a target="_blank" href="http://sourceforge.net/projects/win32diskimager/">Win32DiskImager</a>
	- Select Raspbian image file and write it to SD Card

4. Setting up connections:
	- Inserd SD card to RPi
	- Power up board using micro USB cable
	- Connect it to a monitor using HDMI cable
	- Connect keyboard and mouse via USB

5. Boot from RPi
	You can customize different options on booting process such as 'Change Password', 'Enable SSH', etc. Note that the default user/password is `pi/raspberry`.

Thats all! Raspbian has booted up running on RPi!
<div class="row">
	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">	
		<img src="http://i844.photobucket.com/albums/ab6/voidimagineer/RPi_connection_to_monitor_zps775c7904.jpg" width="100%" alt="RPi_connection_to_monitor">
	</div>
	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
		<br>
		<img src="http://i844.photobucket.com/albums/ab6/voidimagineer/RPi_Raspbian_os_zps609d7ee6.jpg" width="100%" alt="RPi_Raspbian_os">
	</div>
</div>


###SSHing to RPi:###
I have connected a LAN cable from laptop to RPi. Laptop have WiFi access, which has to be shared to LAN. So, on start button, search for 'View network connections', from the opened window right click on 'Wireless Network Connection' and choose 'properties'. Goto 'sharing' tab and check 'Allow other network users to connect through this computer's internet connection' along with selecting Home networking connection as 'Local Area Connection'.
Now the RPi has got LAN Access.

To get IP address of RPi, you can either get LAN IP from `ipconfig` and run a ping scan with command `FOR /L %i IN (i,i,254) DO ping -n 1 192.168.1.%i | FIND /i "Reply">> c:\lanipaddresses.txt` where `192.168.1.%i` is replaced with LAN's IP, or try command `arp -a`

Once the IP of RPi is known, you can SSH using <a href="http://www.putty.org/">Putty</a>.
<div class="row">
	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">	
<img src="http://i844.photobucket.com/albums/ab6/voidimagineer/RPi_ssh_with_LAN_cable_zpse9cd5e61.jpg" width="100%" alt="RPi_ssh_with_LAN_cable">
	</div>
	<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
		<br>
<img src="http://i844.photobucket.com/albums/ab6/voidimagineer/RPi_putty_ssh_access_zps757939cb.jpg" width="100%" alt="RPi_putty_ssh">
	</div>
</div>
