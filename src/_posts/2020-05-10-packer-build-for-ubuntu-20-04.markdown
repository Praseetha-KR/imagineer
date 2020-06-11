---
layout: post
title: "Packer build using Ubuntu 20.04 server ISO"
date: 2020-05-10 02:38:00
tags:
    - linux
    - devops
blurb: "Packer build config for Ubuntu server: subiquity vs debian-installer"
theme: '#C44227'
title_color: '#29001C'
luminance: light
graphic:
    url: '/assets/img/posts/packer-ubuntu.png'
    overlap: '8.2'
---

Ubuntu is discontinuing support for the Debian-installer based classic server installer from 20.04 LTS (Focal Fossa) making the way for subiquity server installer. This post shows how the [Packer](https://www.packer.io) build config vary for both installers.

<div>
    <blockquote>Ubuntu 20.04 <a href="http://cdimage.ubuntu.com/ubuntu/releases/20.04/release/" target="_blank">live server</a> has only subiquity support. For debian-installer you can use <a href="http://cdimage.ubuntu.com/ubuntu-legacy-server/releases/20.04/release/" target="_blank">legacy server</a> version.</blockquote>
</div>

## subiquity

[subiquity](https://github.com/CanonicalLtd/subiquity) is the Ubuntu server's new automated installer, which was introduced in `18.04`. It is the server counterpart of [ubiquity](https://wiki.ubuntu.com/Ubiquity) installer used by desktop live CD installation.

Autoinstallation lets you answer all those configuration questions ahead of time with autoinstall config and lets the installation process run without any external interaction. The autoinstall config is provided via cloud-init configuration. Values are taken from the config file if set, else default values are used.

There are multiple ways to provide configuration data for cloud-init. Typically user config is stored in `user-data` and cloud specific config in `meta-data` file. The list of supported cloud datasources can be found in [cloudinit docs](https://cloudinit.readthedocs.io/en/latest/topics/datasources.html#known-sources). Since packer builds it locally, data source is <a href="https://cloudinit.readthedocs.io/en/latest/topics/datasources/nocloud.html" target="_blank">NoCloud</a> in our case and the config files will served to the installer over http.


#### Packer config to build a VMWare virtual machine from Ubuntu 20.04 live server ISO


1) *ubuntu-20.04-live-server-packer.json*:

<div>
<div class="code-snippet">
<div class="highlighter-filename">ubuntu-20.04-live-server-packer.json</div>
<div class="highlighter-rouge highlighter-linenos">
{% highlight json linenos %}
{% raw %}
{
  "builders": [
    {
      "type": "vmware-iso",

      "guest_os_type": "ubuntu-64",
      "memory": 1024,
      "name": "ubuntu-20.04-live-server",
      "iso_urls": [
        "iso/ubuntu-20.04-live-server-amd64.iso",
        "http://cdimage.ubuntu.com/ubuntu/releases/20.04/release/ubuntu-20.04-live-server-arm64.iso"
      ],
      "iso_checksum_type": "sha256",
      "iso_checksum": "caf3fd69c77c439f162e2ba6040e9c320c4ff0d69aad1340a514319a9264df9f",

      "http_directory": "subiquity/http",
      "output_directory": "output/live-server",

      "boot_wait": "5s",
      "boot_command": [
        "<enter><enter><f6><esc><wait> ",
        "autoinstall ds=nocloud-net;seedfrom=http://{{ .HTTPIP }}:{{ .HTTPPort }}/",
        "<enter><wait>"
      ],
      "shutdown_command": "shutdown -P now",

      "ssh_username": "ubuntu",
      "ssh_password": "ubuntu",
      "ssh_pty": true,
      "ssh_timeout": "20m",
      "ssh_handshake_attempts": "20"
    }
  ],

  "provisioners": [
    {
      "type": "shell",
      "inline": ["ls /"]
    }
  ]
}
{% endraw %}
{% endhighlight %}
</div>
</div>
</div>

2) *http/meta-data*: *empty file*


3) *http/user-data*:

<div>
<div class="code-snippet">
<div class="highlighter-filename">http/user-data</div>
<div class="highlighter-rouge highlighter-linenos">
{% highlight yml linenos %}
#cloud-config
autoinstall:
  version: 1
  locale: en_US
  keyboard:
    layout: en
    variant: us
  network:
    network:
      version: 2
      ethernets:
        ens33:
          dhcp4: true
  storage:
    layout:
      name: lvm
  identity:
    hostname: ubuntu
    username: ubuntu
    password: $6$rounds=4096$8dkK1P/oE$2DGKKt0wLlTVJ7USY.0jN9du8FetmEr51yjPyeiR.zKE3DGFcitNL/nF1l62BLJNR87lQZixObuXYny.Mf17K1
  ssh:
    install-server: yes
  user-data:
    disable_root: false
  late-commands:
    - 'sed -i "s/dhcp4: true/&\n      dhcp-identifier: mac/" /target/etc/netplan/00-installer-config.yaml'
    - echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' > /target/etc/sudoers.d/ubuntu
{% endhighlight %}
</div>
</div>
</div>

<br>
Run the packer build:
```bash
$ packer build -force ubuntu-20.04-live-server-packer.json

==> Retrieving ISO
==> Trying iso/ubuntu-20.04-live-server-amd64.iso
==> Trying iso/ubuntu-20.04-live-server-amd64.iso?checksum=sha256%3Acaf3fd69c77c439f162e2ba6040e9c320c4ff0d69aad1340a514319a9264df9f
==> iso/ubuntu-20.04-live-server-amd64.iso?checksum=sha256%3Acaf3fd69c77c439f162e2ba6040e9c320c4ff0d69aad1340a514319a9264df9f => /path/to/packer-ubuntu/iso/ubuntu-20.04-live-server-amd64.iso
==> Deleting previous output directory...
==> Creating required virtual machine disks
==> Building and writing VMX file
==> Starting HTTP server on port 8100
==> Starting virtual machine...
==> Waiting 5s for boot...
==> Connecting to VM via VNC (127.0.0.1:5984)
==> Typing the boot command over VNC...
==> Using ssh communicator to connect: 172.16.255.203
==> Waiting for SSH to become available...

==> Connected to SSH!
==> Provisioning with shell script: /var/folders/lw/n4rl9vm16t38zzv2x_kl74xc0000gn/T/packer-shell298726450
    bin   cdrom  etc   lib	  lib64   lost+found  mnt  proc  run   snap  sys  usr
    boot  dev    home  lib32  libx32  media       opt  root  sbin  srv   tmp  var

==> Gracefully halting virtual machine...
    Waiting for VMware to clean up after itself...
==> Deleting unnecessary VMware files...
    Deleting: output/live-server/packer-ubuntu-20.04-live-server.plist
    Deleting: output/live-server/startMenu.plist
    Deleting: output/live-server/vmware.log
==> Compacting all attached virtual disks...
    Compacting virtual disk 1
==> Cleaning VMX prior to finishing up...
    Detaching ISO from CD-ROM device ide0:0...
    Disabling VNC server...
==> Skipping export of virtual machine (export is allowed only for ESXi)...
Build 'ubuntu-20.04-live-server' finished.

==> Builds finished. The artifacts of successful builds are:
--> VM files in directory: output/live-server
```

#### Notes

##### ⏳ Boot interaction sequence for live server

1. Initial empty screen
2. Press `<any key>` to goto advanced welcome page
3. Press `F6` to open *Other Options* popup + activate boot commandline
4. Press `ESC` to close popup & focus on edit existing boot command `initrd=/casper/initrd quiet ---` *(with cursor at the end)*
5. The autoinstall boot command in the following format is entered by Packer via VNC connection and then awaits the installation completion:
    ```bash
    initrd=/casper/initrd quiet --- autoinstall ds=nocloud-net;seedfrom=http://<ip>:<port>
    ```

<div class="p-3-top p-2-bottom full-width">
    <div class="align-center">
        <div class="p-q-right">
            <figure class="figure-c">
                <img src="/assets/img/posts/packer-ubuntu/live-server-init-screen.png" class="contain-width" alt="Initial empty screen of live server">
                <figcaption>Initial empty screen</figcaption>
            </figure>
        </div>
        <div class="p-q-left">
            <figure class="figure-c">
                <img src="/assets/img/posts/packer-ubuntu/live-server-boot-command.png" class="contain-width" alt="Live server boot command">
                <figcaption>Live server boot command</figcaption>
            </figure>
        </div>
    </div>
</div>

##### 🔐 Generating hashed password

```
mkpasswd --methhod=SHA-512 --rounds=4096
```

##### ⚠️ Packer SSH timeout issue due to IP change on instance restart

While building in VMWare, restart after installation causes change in IP address of the instance. This leads packer build to timeout awaiting SSH connection. To fix this issue, we can configure MAC address to be send as identifier in DHCP request.


```
    dhcp-identifier: mac
```

Since there is no option to set `dhcp-identifier` via cloud config, this is appended to `ens33` interface in `/etc/netplan/00-installer-config.yaml` via `late-commands`.

##### 🔧 Default user sudo with no-password
Cloud config `identity` doesn't provide a way to set sudo `NOPASSWD` option. That is also being directly written to to `sudoers.d/ubuntu` file.


<br>
<hr>

## debian-installer

`debian-installer` or just `d-i` is a text-based automated installer with little user interaction. It consists of a number of components to perform each installation task. Component asks questions to the user based on the priority set.

Preseeding is a way to set answers to questions asked during the installation process, without having to manually enter the answers while the installation is running. We can create a preseed.cfg file and pass it to the debian-installer. In the default mode, when the answer to a question is not present in a preseed, `d-i` stops and asks the user for input.

Installation process is quite slow compared to subiquity.

#### Packer config to build a VMWare virtual machine from Ubuntu 20.04 legacy server ISO

1) *ubuntu-20.04-legacy-server-packer.json*:

<div class="highlighter-rouge highlighter-linenos">
{% highlight json linenos %}
{% raw %}
{
  "builders": [
    {
      "type": "vmware-iso",

      "guest_os_type": "ubuntu-64",
      "memory": 1024,
      "name": "ubuntu-20.04-legacy-server",
      "iso_urls": [
        "iso/ubuntu-20.04-legacy-server-amd64.iso",
        "http://cdimage.ubuntu.com/ubuntu-legacy-server/releases/20.04/release/ubuntu-20.04-legacy-server-amd64.iso"
      ],
      "iso_checksum_type": "sha256",
      "iso_checksum": "36f15879bd9dfd061cd588620a164a82972663fdd148cce1f70d57d314c21b73",

      "http_directory": "debian-installer/http",
      "output_directory": "output/live-server",

      "boot_wait": "5s",
      "boot_command": [
        "<esc><wait>",
        "<esc><wait>",
        "<enter><wait>",
        "/install/vmlinuz<wait>",
        " initrd=/install/initrd.gz",
        " auto-install/enable=true",
        " debconf/priority=critical",
        " preseed/url=http://{{ .HTTPIP }}:{{ .HTTPPort }}/preseed.cfg<wait>",
        " -- <wait>",
        "<enter><wait>"
      ],
      "shutdown_command": "shutdown -P now",

      "ssh_username": "ubuntu",
      "ssh_password": "ubuntu",
      "ssh_pty": true,
      "ssh_timeout": "20m",
      "ssh_handshake_attempts": "20"
    }
  ],

  "provisioners": [
    {
      "type": "shell",
      "inline": ["ls /"]
    }
  ]
}
{% endraw %}
{% endhighlight %}
</div>

2) *http/preseed.cfg*:

<div class="highlighter-rouge highlighter-linenos">
{% highlight nix linenos %}
# Localization
d-i debian-installer/locale string en_US.UTF-8

# Clock and time zone setup
d-i clock-setup/utc boolean true
d-i clock-setup/utc-auto boolean true
d-i time/zone string UTC

# Keyboard selection.
d-i keyboard-configuration/layoutcode string us
d-i keyboard-configuration/modelcode string pc105
d-i console-setup/ask_detect boolean false

# Base system installation
d-i base-installer/kernel/override-image string linux-server

# Finishing up the installation
d-i finish-install/reboot_in_progress note

# Boot loader installation
d-i grub-installer/only_debian boolean true
d-i grub-installer/with_other_os boolean true

# Partitioning
d-i partman-auto/disk string /dev/sda
d-i partman-auto-lvm/guided_size string max
d-i partman-auto/choose_recipe select atomic
d-i partman-auto/method string lvm
d-i partman-lvm/confirm boolean true
d-i partman-lvm/confirm boolean true
d-i partman-lvm/confirm_nooverwrite boolean true
d-i partman-lvm/device_remove_lvm boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true
d-i partman/confirm_write_new_label boolean true

# Mirror settings
choose-mirror-bin mirror/http/proxy string
d-i mirror/country string manual
d-i mirror/http/directory string /ubuntu/
d-i mirror/http/hostname string archive.ubuntu.com
d-i mirror/http/proxy string

# Package selection
tasksel tasksel/first standard
d-i pkgsel/include string openssh-server build-essential
d-i pkgsel/install-language-support boolean false
d-i pkgsel/update-policy select none
d-i pkgsel/upgrade select full-upgrade

# Account setup
d-i passwd/user-fullname string ubuntu
d-i passwd/username string ubuntu
d-i passwd/user-password password ubuntu
d-i passwd/user-password-again password ubuntu
d-i user-setup/allow-password-weak boolean true
d-i user-setup/encrypt-home boolean false
d-i passwd/user-default-groups ubuntu sudo

# Running custom commands during the installation
d-i preseed/late_command string \
    echo 'ubuntu ALL=(ALL) NOPASSWD: ALL' > /target/etc/sudoers.d/ubuntu ; \
    in-target /bin/chmod 440 /etc/sudoers.d/ubuntu
{% endhighlight %}
</div>

#### Notes

##### ⏳ Boot interaction sequence for legacy server

1. Press `ESC` to goto advanced welcome page
2. Press `ESC` to get popup alert "You are leaving the graphical boot menu and startinng the text mode interface"
3. Press `Enter` to select OK button
4. In the boot text mode interface, the boot command in the following format is entered by Packer via VNC connection and then awaits the installation completion. The installation progress will be visible via graphical interface, incase if any necessary value is not present in preseed, installer stops and waits for the user input to proceed.
    ```bash
/install/vmlinuz initrd=/install/initrd.gz auto-install/enable=true debconf/priority=critical preseed/url=http://<ip>:<port>/preseed.cfg --
    ```

<div class="p-5-top p-3-bottom full-width">
    <div class="align-center">
        <div class="p-h-right">
            <figure class="figure-c">
                <img src="/assets/img/posts/packer-ubuntu/legacy-server-exit-graphical-menu.png" class="contain-width" alt="Exiting from graphical menu">
                <figcaption>Exiting from graphical menu</figcaption>
            </figure>
        </div>
        <div class="p-h-left">
            <figure class="figure-c">
                <img src="/assets/img/posts/packer-ubuntu/legacy-server-boot-command.png" class="contain-width" alt="Legacy server boot command">
                <figcaption>Legacy server boot command</figcaption>
            </figure>
            <figure class="figure-c">
                <img src="/assets/img/posts/packer-ubuntu/legacy-server-boot-progress.png" class="contain-width" alt="Legacy server boot progress">
                <figcaption>Legacy server boot progress</figcaption>
            </figure>
        </div>
    </div>
</div>


#### Related Links
- <a href="https://wiki.ubuntu.com/FoundationsTeam/AutomatedServerInstalls/ConfigReference" target="_blank">Automated server install config referece</a>
- <a href="https://cloudinit.readthedocs.io/en/latest/index.html" target="_blank">Cloud-init documentation</a>
- <a href="https://netplan.io/reference#common-properties-for-all-device-types" target="_blank">Netplan reference</a>
- <a href="https://www.packer.io/docs/builders/vmware/iso/" target="_blank">Packer VMware Builder (from ISO)</a>
- <a href="https://www.packer.io/guides/automatic-operating-system-installs/preseed_ubuntu/" target="_blank">Packer Unattended Installation for Debian</a>
- <a href="https://ubuntuforums.org/showthread.php?t=2390785" target="_blank">Difference between live and alternative</a>
- <a href="https://help.ubuntu.com/lts/installation-guide/i386/ch06s01.html" target="_blank">How the debian-installer works</a>
- <a href="https://www.debian.org/releases/jessie/amd64/apbs02.html.en" target="_blank">Using preseeding</a>
- <a href="https://www.debian.org/releases/stable/example-preseed.txt" target="_blank">Preseed file example</a>

<div class="p-2-top p-1-bottom">
    <table class="contain-width">
        <tbody>
            <tr>
                <td class="align-center p-1h-v">
                    Code examples repo:
                    <div class="m-1-left"><a class="btn btn-accent" href="https://github.com/Praseetha-KR/packer-ubuntu" target="_blank">github.com/Praseetha-KR/packer-ubuntu</a></div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
