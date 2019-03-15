---
layout: post
title:  "Using Android as development machine"
date: 2019-03-16 01:11:22
tags:
    - android
    - programming
blurb: "How to use Android phone as a quick development machine"
theme: '#7ebb61'
---

There had been many scenarios where I wished if mobile phone could be used as a development machine. Scenarios such as quick SSHing to servers or pushing a hotfix to Github while on the roads, testing out a snippet which just popped in mind while jogging, etc.

I tried to make Nexus 5 as a pocket development machine. I was able to set it up, but with some limitations. Here is what all I did:

## 1. Lineage OS & Root user

#### TWRP Installation

1. Connect Nexus 5 to laptop via USB. Verify by listing connected devices:
    ```
    adb devices
    ```
2. Reboot phone to bootloader screen:
    ```
    adb reboot bootloader
    ```
3. Flash [TWRP image](https://dl.twrp.me/hammerhead/):
    ```
    fastboot devices
    fastboot oem unlock
    fastboot flash recovery twrp-3.2.3-0-hammerhead.img
    ```
4. Now, from bootloader screen, reboot in recovery mode. This would load TWRP app.


#### Install Lineage OS

Optionally you can wipe existing data from TWRP Wipe option.

Sideload Lineage OS & gapps files:
- Lineage OS 15.1 can be downloaded from [XDA - unofficial build](https://forum.xda-developers.com/google-nexus-5/development/rom-lineageos-15-1-nexus-5-t3756643). (Current official build is [14.1](https://download.lineageos.org/hammerhead))
- For Nexus 5 [GApps](https://opengapps.org/), I downloaded ARM 8.1 pico package.

```
adb sideload lineage-15.1-20180923-UNOFFICIAL-hammerhead.zip
adb sideload open_gapps-arm-8.1-pico-20190312.zip
```

Then reboot the system. You'll have to go through OS initial setup process.


#### SU Addon for root access

1. Download [`su` addon](https://download.lineageos.org/extras) `arm 15.1` and copy to phone.
    ```
    adb push addonsu-15.1-arm-signed.zip /sdcard
    ```

2. Reboot in recovery mode to go to TWRP app, Install > select `addonsu-15.1-arm-signed.zip`

After that reboot the system. Lineage OS  with root access is ready now!


## 2. Shell setup

There are many terminal apps available in Google Playstore. I chose [Termux](https://play.google.com/store/apps/details?id=com.termux), which has powerful terminal emulation with an extensive Linux package collection.

The default location of Termux's bash is `/data/data/com.termux/files/home`.

Let's switch to zsh.

1. Installation:
    ```
    pkg install -y zsh
    ```
2. oh-my-zsh:
    ```
    pkg install -y git
    git clone git://github.com/robbyrussell/oh-my-zsh.git $HOME/.oh-my-zsh --depth 1
    cp $HOME/.oh-my-zsh/templates/zshrc.zsh-template $HOME/.zshrc
    ```
    >
    > Create `$HOME/.termux` folder & add the following files for theme customization:
    >
    >`$HOME/.termux/colors.properties` - [example](https://github.com/4679/oh-my-termux/blob/master/.termux/colors.properties)
    >
    >`$HOME/.termux/font.ttf` [example](https://github.com/4679/oh-my-termux/blob/master/.termux/font.ttf)

    <br>

3. Restart Termux to make zsh as default shell.
    ```
    chsh -s zsh
    exit
    ```

## 3. SSH

```
pkg install -y openssh
ssh-keygen -t rsa -b 4096 -C "<email>"
```


## 4. Git setup

We have already installed `git` package. Now let's add Github support.

[Add public key to your Github account](https://github.com/settings/keys).

```
pkg install -y hub
git config --global user.email "<email>"
git config --global user.name "<username>"
```
Now we can git clone repos & commit changes.

## 5. Code Editors

We can use in-built `nano` editor or install `vim`
```
pkg install -y vim
```

## 6. Programming languages support

As of now termux has ~815 packages. You can view all with the following command:

```
pkg list-all
```

There is `python`, `nodejs`, `ruby`, `golang` & `rust` packages available.

<br><br>

Now we can clone any repo, edit in vim & commit to Github, SSH to a remote server and do a quick snippet compilation. Pretty much what all I needed 🎉

<figure class="figure-c">
    <img src="/assets/img/posts/termux.jpg" width="75%" alt="Termux">
    <figcaption>Termux</figcaption>
</figure>

<br>

## Pitfalls:

- Termux packages are available only for that app. So projects folder outside of this app's location won't be able to use any termux package. **Because of that I had to create projects folder inside Termux's scope itself.** (`/data/data/com.termux/files/home/storage/projects/`)
- Since project files are in app specific location, we can't use any code editor apps such as [DroidEdit](https://play.google.com/store/apps/details?id=com.aor.droidedit) which is running outside of that user scope.


If you know a better way to do this, let me know in comments :)
