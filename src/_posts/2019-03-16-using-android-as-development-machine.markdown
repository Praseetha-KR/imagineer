---
layout: post
title:  "Using Android as development machine"
date: 2019-03-16 01:11:22
tags:
    - android
    - programming
blurb: "How to use Android phone as a quick development machine"
theme: '#7ebb61'
# luminance: light
---

There had been many scenarios where I wished if mobile phone could be used as a development machine. Scenarios such as quick SSHing to servers or pushing a hotfix to Github while on the roads, testing out a snippet which just popped in mind while jogging, etc.

I tried to make **Nexus 5** as a pocket development machine. I was able to set it up, but with some limitations. Here is what all I did:

<div class="post__block post__block--2 post__block--right">
    <div class="post__block__center">
        <h3>Part A: Full system access with Lineage OS & root user</h3>
    </div>
    <div class="post__block__side">
        <div class="sideblock sideblock--right sideblock--for-h3 ">
            <div class="annotation">* This is required only if you need root access to your phone, otherwise proceed to <a href="#part-b-development-setup">part B</a>.</div>
        </div>
    </div>
</div>

##### TWRP Installation

1. Connect phone to laptop via USB. Verify by listing connected devices:
    ```zsh
    $ adb devices
    ```
2. Reboot phone to bootloader screen:
    ```zsh
    $ adb reboot bootloader
    ```
3. Flash [TWRP image for Nexus 5](https://dl.twrp.me/hammerhead/):
    ```zsh
    $ fastboot devices
    $ fastboot oem unlock
    $ fastboot flash recovery twrp-3.2.3-0-hammerhead.img
    ```
4. Now, from bootloader screen, reboot in recovery mode. This would load TWRP app.


##### Lineage OS

Sideload Lineage OS & gapps files:
- Lineage OS 15.1 can be downloaded from [XDA - unofficial build](https://forum.xda-developers.com/google-nexus-5/development/rom-lineageos-15-1-nexus-5-t3756643). (Current official build is [14.1](https://download.lineageos.org/hammerhead))
- For Nexus 5 [GApps](https://opengapps.org/), I downloaded ARM 8.1 pico package.


(Optionally you can wipe existing data from TWRP's **Wipe** option.)

```zsh
$ adb sideload lineage-15.1-20180923-UNOFFICIAL-hammerhead.zip
$ adb sideload open_gapps-arm-8.1-pico-20190312.zip
```

Then reboot the system. You'll have to go through OS initial setup process.


##### SU Addon for root access

1. Download [`su` addon](https://download.lineageos.org/extras) `arm 15.1` and copy to phone.
    ```zsh
    $ adb push addonsu-15.1-arm-signed.zip /sdcard
    ```

2. Reboot in recovery mode to go to TWRP app, Install > select `addonsu-15.1-arm-signed.zip`

After that reboot the system. Lineage OS  with root access is ready now!

<br>

---

## Part B: Development Setup

There are many terminal apps available in Google Playstore. I chose [Termux](https://play.google.com/store/apps/details?id=com.termux), which has powerful terminal emulation with essential Linux package collection.

The default location of Termux's bash is `/data/data/com.termux/files/home`.

**Few basic commands:**
```console
$ pkg search <term>
$ pkg show <packages>

$ pkg list-all
$ pkg list-installed

$ pkg install <packages>
$ pkg reinstall <packages>
$ pkg uninstall <packages>

$ apt list --upgradable
$ pkg upgrade

$ pkg help
```


### 1. Text Editor

`pkg search editor` can help you to get a glimpse of available editors in termux package repo.

`vim`, `nano`, `emacs` are few choices.

```console
$ pkg install -y vim
```

### 2. Git

Install git:
```console
$ pkg install -y git
```

##### Github setup:
[Add public key to your Github account](https://github.com/settings/keys).

```console
$ pkg install -y hub
$ git config --global user.email "<email>"
$ git config --global user.name "<username>"
```


### 3. zsh

1. Installation:
    ```console
    $ pkg install -y zsh
    ```
2. oh-my-zsh:
    ```console
    $ git clone git://github.com/robbyrussell/oh-my-zsh.git $HOME/.oh-my-zsh --depth 1
    $ cp $HOME/.oh-my-zsh/templates/zshrc.zsh-template $HOME/.zshrc
    ```
    >
    > Create `$HOME/.termux` folder & add the following files for theme customization:
    >
    >`$HOME/.termux/colors.properties` - [example](https://github.com/4679/oh-my-termux/blob/master/.termux/colors.properties)
    >
    >`$HOME/.termux/font.ttf` [example](https://github.com/4679/oh-my-termux/blob/master/.termux/font.ttf)

    <br>

3. Restart Termux to make zsh as default shell.
    ```console
    $ chsh -s zsh
    $ exit
    ```

### 4. SSH

```console
$ pkg install -y openssh
$ ssh-keygen -t rsa -b 4096 -C "<email>"
```

##### Connect to remote servers from phone:

```console
$ ssh user@example.com
```

##### SSH into phone:

1. Start SSH server daemon in phone:

    ```console
    $ sshd
    ```

2. Password SSHing is difficult, add your public key to `~/.ssh/authorized_keys` file.

3. Then, from any other device:
    ```zsh
    $ ssh -p 8022 <IP_address_of_phone>
    ```

4. Stop SSH daemon:

    ```console
    $ pkill sshd
    ```


### 5. Programming languages

Language packages such as `clang`, `python`, `nodejs`, `ruby`, `golang`, `rust`, `erlang`, `lua`, `perl`, etc. are available.


<br><br>

<div>
    <figure class="figure-c">
        <img src="/assets/img/posts/termux.jpg" width="50%" alt="Termux">
        <figcaption>Termux</figcaption>
    </figure>
</div>

Now we can clone any repo, edit in vim & commit to Github, SSH to a remote server and do a quick snippet compilation. Pretty much what all I needed 🎉

<br>

## Limitations:

- Since Termux has access to only `/data/data/com.termux`, we can't create our `projects/` folder outside of that location.
- Since project files are in app specific location, we can't use any code editor apps such as [DroidEdit](https://play.google.com/store/apps/details?id=com.aor.droidedit) which is running outside of that user scope.
- `su` root shell can't run termux packages directly.
> A workaround for using termux packages in root shell is to export `LD_LIBRARY_PATH` pointing to termux's `/usr/lib/` and execute package binaries by specifying path:
>
> ```console
> $ export LD_LIBRARY_PATH=/data/data/com.termux/files/usr/lib/
>
> $ /data/data/com.termux/files/usr/bin/python --version
> $ /data/data/com.termux/files/usr/bin/vim test.txt
> ```
>


If there is a way to solve these limitations, please let me know in comments.
