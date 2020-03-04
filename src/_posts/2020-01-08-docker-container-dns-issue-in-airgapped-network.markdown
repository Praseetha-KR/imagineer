---
layout: post
title: "Docker container DNS resolution issue in air-gapped network"
date: 2020-01-08 12:12:00
tags:
    - networking
    - devops
blurb: "Issue with DNS server list realtime sync between Ubuntu Host and Docker Containers running in bridge mode"
theme: '#3988ad'
title_color: '#dfeef5'
luminance: dark
---

### Problem

The scenario is where docker containers are running on a host system with Ubuntu, which is connected in an air gapped network, with the router configured with a list of local DNS servers. The host doesn't have any manual DNS entries, though it is able to make DNS queries via the LAN's upstream DNS servers. Containers running on Bridge mode, on the other hand, are trying to resolve from `8.8.8.8` instead of using LAN's DNS. The expected behaviour is that containers should resolve from the LAN's upstream servers.


### Analysis

Here is a bit of related information to understand how Ubuntu DNS resolution works & how docker container's DNS configuration is being handled:

##### Host DNS

Ubuntu has changed the DNS resolution flow [since 18.04](https://www.digitalocean.com/community/tutorials/what-s-new-in-ubuntu-18-04#default-dns-resolver) with the introduction of [`systemd-resolved`](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html) as the default resolver.

<div>
    <blockquote>
        <strong>systemd-resolved</strong> is a systemd service that provides network name resolution to local applications via three interfaces:
        <ul>
            <li>A <a href="https://www.freedesktop.org/wiki/Software/systemd/resolved/" target="_blank">D-Bus API</a></li>
            <li>GNU C Library (glibc) <a href="http://man7.org/linux/man-pages/man3/getaddrinfo.3.html" target="_blank"><code>getaddrinfo</code></a> and its related resolver functions, including <a href="http://man7.org/linux/man-pages/man3/gethostbyname.3.html" target="_blank"><code>gethostbyname</code></a> via Name Service Switch (NSS) with plugin <a href="https://www.freedesktop.org/software/systemd/man/nss-resolve.html" target="_blank"><code>nss-resolve</code></a> module. <br><small>(<code>nss-resolve</code> via <code>systemd-resolved</code> get nameserver list from <code>/etc/resolv.conf</code>, <code>/etc/hosts</code> and/or <code>/etc/hostname</code> files based on the <code>/etc/nsswitch.conf</code> configuration)</small></li>
            <li>A local DNS stub listener on <code>127.0.0.53</code></li>
        </ul>
    </blockquote>
</div>


In short, `systemd-resolved` daemon also acts as a DNS server by listening on IP address `127.0.0.53` on the local loopback interface. `lo` is hardcoded, it cannot listen on any other network interfaces such as `docker0`, `eth0`,`en0`, etc.

Any non-local DNS queries, in our case, will be forwarded to the upstream DNS server of the LAN. System gets this DNS server details during the DHCP connection, which will be updated in `/etc/resolv.conf` file dynamically.

`/etc/resolv.conf` file shouldn't be edited manually, rather it should be symlinked to one of the following files [as per your use-case](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html#/etc/resolv.conf), where you can specify hardcoded nameservers if there any:

- `/run/systemd/resolve/stub-resolv.conf`
- `/usr/lib/systemd/resolv.conf`
- `/run/systemd/resolve/resolv.conf`

##### Container DNS

When docker containers are started in Bridge mode, docker daemon copies any non-localhost entries of `/etc/resolv.conf`, `/etc/hosts` and `/etc/hostname` files from the host to the container; if no non-localhost entries are found, container's `/etc/resolv.conf` will be initialized with hardcoded `nameserver 8.8.8.8`.


<div>
    <figure class="figure-l p-2h-top p-2-bottom text-center">
        <img src="/assets/img/posts/airgapped-docker-dns/docker_container_dns_issue.png" width="100%" alt="Docker DNS issue in air-gapped network">
        <figcaption>fig 1: Docker DNS issue in air-gapped network</figcaption>
    </figure>
</div>

Whenever the host machine receives new DNS configuration over DHCP, it will be updated to the docker container once it gets restarted. When upstream DNS configuration changes, there is no way the running containers to know about the changes.


### Solution

Hardcoding nameservers in instance doesn't solve the issue, because whenever a nameserver change is required, it needs to be updated in every system of the network. All running docker container instances need to be restarted as well in order to get the updated DNS list.

One solution for this problem would be to enable host system to listen on docker interface apart from the local loopback interface. i.e., forwarding all DNS queries from the docker containers to the host's `127.0.0.53`.

Since `systemd-resolved` cannot listen on `docker0` interface, we can use `dnsmasq` to bind to docker interface. `dnsmasq` will accept queries from the containers and relay to the `systemd-resolvd`.

```bash
$ sudo apt-get install dnsmasq
```

`/etc/dnsmasq.conf`
```conf
interface=docker0
bind-interfaces
```

We also need to configure docker daemon to point all container DNS queries to forward to the docker host system.

`/etc/docker/daemon.json`
```json
{
    "dns": ["172.17.0.1"]
}
```

Then restart both `docker` & `dnsmasq` services:

```bash
$ sudo service docker restart
$ sudo service dnsmasq restart
```

<div>
    <figure class="figure-l p-1h-top p-q-bottom text-center">
        <img src="/assets/img/posts/airgapped-docker-dns/docker_container_dns_solution.png" width="100%" alt="dnsmasq relaying DNS queries from docker interface to loopback interface">
        <figcaption>fig 2: dnsmasq relaying DNS queries from docker interface to loopback interface</figcaption>
    </figure>
</div>

Now you would be able to get LAN's updated upstream DNS servers inside docker containers whenever host's DHCP connection changes, and will be reflected within the containers without restart.
