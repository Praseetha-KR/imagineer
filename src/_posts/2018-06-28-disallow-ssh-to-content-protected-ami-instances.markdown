---
layout: post
title:  "Disallow SSH to content-protected AMI instances"
date:   2018-06-28 05:22:20
tags:
    - aws
    - devops
    - linux
blurb: "How to allow/disallow SSH keys for instances launced from AWS EC2 AMIs"
theme: '#eaa349'
# luminance: light
---

AWS adds an SSH key on every EC2 instance creation, either by adding a new key-pair or using the existing one based on the user's choice. This gets a bit annoying while distributing a sealed (content-protected) AMI. Any user who has access to this AMI for deployment could create an instance by adding their key, thus gets access to the protected content residing inside the instance.


### How EC2 instance gets user's SSH key?

During the instance creation, a `systemd` service named `cloud-init` gets invoked by `multi-user.target`. This service appends user-input SSH key into `~/.ssh/allowed_keys`.

Files responsible for this service are `cloud-init.service`, `cloud-init-local.service`, `cloud-config.service` & `cloud-final.service`, which can be located under `/etc/systemd/system/cloud-init.target/`.


### Prevention method - `systemd` for the rescue!

The easiest way to fix this is by removing user's SSH key as soon as the instance boot up, instead override `allowed_keys` with owner's key. This can be performed by writing a custom `systemd` service.

(If you are using tools such as [Packer](https://www.packer.io/docs/builders/amazon.html) to build AMI, this can be included in provisioning scripts.)

##### STEP 1: Script to override allowed_keys

`/opt/customssh/override_ssh_key`:

```bash
#!/bin/bash

allowed_key=<SSH_PUBLIC_KEY>
echo $allowed_key > ~/.ssh/allowed_keys
```

##### STEP 2: Service to execute the above script

`/etc/systemd/system/customssh.service`:

```ini
[Unit]
Description=custom ssh override service
After=network-online.target cloud-final.service
Requires=sshd.service

[Service]
Type=oneshot
ExecStart=/opt/customssh/override_ssh_key

[Install]
WantedBy=cloud-init.target
```

- `Type` is `oneshot` because the service should just execute an action without keeping active processes.
- This `customssh` is executed by `cloud-init.target` as soon as `cloud-final.service` is completed.
- After the `allowed_keys` override, `sshd` (SSH Daemon) restart is also required.

##### STEP 3: Enabling the service

```console
$ systemctl enable customssh.service

Created symlink from /etc/systemd/system/cloud-init.target.wants/customssh.service to /etc/systemd/system/customssh.service.
```
`enable` will hook the specified unit into relevant places, so that it will automatically start on boot.

Check status:
```console
$ systemctl status customssh.service
```

That's it. Our `customssh` service would be executed whenever an instance is created from the AMI. This always overrides with owner's SSH public key, thus removes any key auto added by AWS.
