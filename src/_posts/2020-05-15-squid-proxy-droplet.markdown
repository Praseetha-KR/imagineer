---
layout: post
title: "Set up a Proxy Server Droplet in less than 5 minutes"
date: 2020-05-15 00:00:05
tags:
    - linux
    - devops
blurb: "Squid proxy in Ubuntu 20.04 configued via cloud-init, hosted in DigitalOcean droplet managed via doctl"
theme: '#212285'
title_color: '#3B60ED'
luminance: light
graphic:
    url: '/assets/img/posts/squid-droplet.png'
    overlap: '7'
---

This post shows how to quickly run Squid proxy server on a DigitalOcean droplet via command line interface.

### TLDR;

##### Create droplet:
```bash
$ doctl compute droplet create ubuntu-squid-proxy \
    --image ubuntu-20-04-x64 \
    --region sfo2 \
    --size s-1vcpu-1gb \
    --ssh-keys 01234567,12345678 \
    --tag-names test,proxy,squid,cli \
    --user-data-file user-data.yml \
    --wait
```
*where `user-data.yml` has content of this <a href="https://gist.github.com/Praseetha-KR/3920ad51c75b8d8a5951122a2cb5e697" target="_blank">gist</a>*

##### Use proxy:
```bash
$ curl https://imagineer.in --proxy http://USERNAME:PASSWORD@<Droplet_PublicIP>:3128
```

##### Delete droplet:
```bash
$ doctl compute droplet delete ubuntu-squid-proxy
```

<hr class="m-3-top m-2-bottom">

<a href="http://www.squid-cache.org/" target="_blank">Squid</a> is a popular caching and forwarding HTTP web proxy.

Let's setup squid proxy with Basic authentication in Ubuntu 20.04 instance. We will be creating a droplet using `doctl` (CLI for DigitalOcean) to host this proxy server.

### Required info for droplet creation

Run `doctl compute droplet create --help` to see the available options.

Required flags info can be obtained with the following commands:

<div>
    <table class="table contain-width">
        <thead>
            <tr>
                <th>doctl commands</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="table__subtitle"><code>image</code></td>
            </tr>
            <tr>
                <td>
                    <details>
                        <summary><code>doctl compute image list-distribution</code></summary>
                            <div class="highlighter-rouge language-bash">
<pre class="highlight noprewrap">
ID          Name                 Type        Distribution    Slug                  Public    Min Disk
53893572    18.04.3 (LTS) x64    snapshot    Ubuntu          ubuntu-18-04-x64      true      20
62569011    20.04 (LTS) x64      snapshot    Ubuntu          ubuntu-20-04-x64      true      20
31354013    6.9 x32              snapshot    CentOS          centos-6-x32          true      20
60461760    10.3 x64             snapshot    Debian          debian-10-x64         true      20
62823611    32 x64               snapshot    Fedora          fedora-32-x64         true      20
...
</pre>
                        </div>
                    </details>
                </td>
            </tr>

             <tr>
                <td class="table__subtitle"><code>region</code></td>
            </tr>
            <tr>
                <td>
                    <details>
                        <summary><code>doctl compute region list</code></summary>
                            <div class="highlighter-rouge language-bash">
<pre class="highlight noprewrap">
Slug    Name               Available
blr1    Bangalore 1        true
lon1    London 1           true
nyc1    New York 1         true
sgp1    Singapore 1        true
sfo2    San Francisco 2    true
...
</pre>
                        </div>
                    </details>
                </td>
            </tr>

             <tr>
                <td class="table__subtitle"><code>size</code></td>
            </tr>
            <tr>
                <td>
                    <details>
                        <summary><code>doctl compute size list</code></summary>
                            <div class="highlighter-rouge language-bash">
<pre class="highlight noprewrap">
Slug               Memory    VCPUs    Disk    Price Monthly    Price Hourly
s-1vcpu-1gb        1024      1        25      5.00             0.007440
512mb              512       1        20      5.00             0.007440
s-1vcpu-2gb        2048      1        50      10.00            0.014880
1gb                1024      1        30      10.00            0.014880
s-3vcpu-1gb        1024      3        60      15.00            0.022320
...
</pre>
                        </div>
                    </details>
                </td>
            </tr>

             <tr>
                <td class="table__subtitle"><code>ssh-keys</code></td>
            </tr>
            <tr>
                <td>
                    <details>
                        <summary><code>doctl compute ssh-key list</code></summary>
                            <div class="highlighter-rouge language-bash">
<pre class="highlight noprewrap">
ID          Name        FingerPrint
01234567    mykey1      00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff
12345678    mykey2      aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99
</pre>
                        </div>
                    </details>
                </td>
            </tr>

             <tr>
                <td class="table__subtitle"><code>tag-names</code></td>
            </tr>
            <tr>
                <td>
                    <details>
                        <summary><code>doctl compute tag list</code></summary>
                            <div class="highlighter-rouge language-bash">
<pre class="highlight noprewrap">
Name         Droplet Count
cli          0
test         1
</pre>
                        </div>
                    </details>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<br>
**user-data-file:**

Squid installation & configuration inside the droplet is automated via cloud-init. A local file with the following [gist](https://gist.github.com/Praseetha-KR/3920ad51c75b8d8a5951122a2cb5e697) content needs to be created and passed to droplet create command using `--user-data-file` flag. Don't forget to replace `USERNAME` and `PASSWORD` values.

<script src="https://gist.github.com/Praseetha-KR/3920ad51c75b8d8a5951122a2cb5e697.js"></script>

Note that cloud-init overrides the default `/etc/squid/squid.conf` file after installation and creates `/etc/squid/htpasswd` file with content `<USERNAME>:<hashed PASSWORD>`. Ports required for Squid and SSH will be allowed by the firewall.


### Create droplet

Command below creates a $5 droplet (1 CPU, 1GB RAM, 25GB SSD disk) named `ubuntu-squid-proxy` with Ubuntu 20.04 LTS base image.

```bash
$ doctl compute droplet create ubuntu-squid-proxy \
    --image ubuntu-20-04-x64 \
    --region sfo2 \
    --size s-1vcpu-1gb \
    --ssh-keys 01234567,12345678 \
    --tag-names test,proxy,squid,cli \
    --user-data-file user-data.yml \
    --wait
```

Output will give name, IP and other details:

```bash
ID           Name                  Public IPv4        Private IPv4    Public IPv6    Memory    VCPUs    Disk    Region    Image                     Status    Tags                    Features    Volumes
XXXXXXXXX    ubuntu-squid-proxy    XXX.XXX.XXX.XXX                                   1024      1        25      sfo2      Ubuntu 20.04 (LTS) x64    active    test,proxy,squid,cli
```


### Accessing Squid proxy

Once the droplet is created, there will be few minutes delay for config init to make the proxy server up and running.


<div class="m-2-bottom">
    <div class="block block--primary">
        <div class="p-1-bottom">
            <strong>Tip:</strong> Use netcat to probe proxy port <code>3128</code> to check whether the proxy server is running.
        </div>
        <div class="highlighter-rouge language-bash">
{% highlight bash %}
$ nc -zv XXX.XXX.XXX.XXX 3128
nc: connectx to XXX.XXX.XXX.XXX port 3128 (tcp) failed: Connection refused

$ nc -zv XXX.XXX.XXX.XXX 3128
found 0 associations
found 1 connections:
     1:	flags=82<CONNECTED,PREFERRED>
	outif en0
	src 192.168.0.XXX port 53190
	dst XXX.XXX.XXX.XXX port 3128
	rank info not available
	TCP aux info available

Connection to XXX.XXX.XXX.XXX port 3128 [tcp/ndl-aas] succeeded!
{% endhighlight %}
        </div>
    </div>
</div>


Proxy URL:
```html
http://USERNAME:PASSWORD@DROPLET_IP:3128
```

Let's send a sample curl request via proxy:
```bash
$ curl https://imagineer.in --proxy http://USERNAME:PASSWORD@XXX.XXX.XXX.XXX:3128
```

<div class="m-2-v">
    <div class="block block--primary">
        <div class="p-q-bottom">
            <strong>Verify status of squid inside the droplet:</strong>
        </div>
        <div class="highlighter-rouge language-bash">
{% highlight bash %}
root@ubuntu-squid-proxy:~# systemctl status squid
● squid.service - Squid Web Proxy Server
     Loaded: loaded (/lib/systemd/system/squid.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2020-05-14 12:35:29 UTC; 2h 2min ago
       Docs: man:squid(8)
    Process: 14588 ExecStartPre=/usr/sbin/squid --foreground -z (code=exited, status=0/SUCCESS)
    Process: 14601 ExecStart=/usr/sbin/squid -sYC (code=exited, status=0/SUCCESS)
   Main PID: 14602 (squid)
      Tasks: 5 (limit: 1137)
     Memory: 16.3M
     CGroup: /system.slice/squid.service
             ├─14602 /usr/sbin/squid -sYC
             ├─14604 (squid-1) --kid squid-1 -sYC
             ├─14606 (logfile-daemon) /var/log/squid/access.log
             ├─14607 (pinger)
             └─14827 (basic_ncsa_auth) /etc/squid/htpasswd
{% endhighlight %}
        </div>
        <div class="highlighter-rouge language-bash">
{% highlight bash %}
root@ubuntu-squid-proxy:~# netstat -tuplan | grep squid
tcp        0      0 0.0.0.0:3128            0.0.0.0:*               LISTEN      14604/(squid-1)
udp        0      0 0.0.0.0:38658           0.0.0.0:*                           14604/(squid-1)
udp6       0      0 :::49608                :::*                                14604/(squid-1)
udp6       0      0 ::1:52717               ::1:54193               ESTABLISHED 14604/(squid-1)
{% endhighlight %}
        </div>
        <div class="highlighter-rouge language-bash">
{% highlight bash %}
root@ubuntu-squid-proxy:~# tail -f /var/log/squid/access.log
1589459665.565    113 XXX.XXX.XXX.XXX TCP_DENIED/407 4084 CONNECT imagineer.in:443 USERNAME HIER_NONE/- text/html
1589459747.799   1878 XXX.XXX.XXX.XXX TCP_TUNNEL/200 34245 CONNECT imagineer.in:443 USERNAME HIER_DIRECT/XXX.XXX.XXX.XXX -
{% endhighlight %}
        </div>
    </div>
</div>


### Delete droplet

Once you are done with the proxy testing, you can delete the droplet `ubuntu-squid-proxy` at any time by running:

```bash
$ doctl compute droplet delete ubuntu-squid-proxy
```

### References

- [doctl Reference](https://www.digitalocean.com/docs/apis-clis/doctl/reference/)
- [cloud-init Documentation](https://cloudinit.readthedocs.io/en/latest/index.html)
- [Squid configuration directives](http://www.squid-cache.org/Doc/config/)
