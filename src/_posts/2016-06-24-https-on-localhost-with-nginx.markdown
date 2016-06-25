---
layout: post
title:  "HTTPS on localhost with NGINX"
date:   2016-06-24 10:45:20
categories: blog, programming, sysadmin
blurb: "How to get https for a website running on localhost"
theme: '#7ebb61'
---

<img src="/assets/img/posts/https_localhost.jpg" alt="HTTPS Localhost">

Websites need an SSL certificate to work on HTTPS. Usually it is signed & issued by CAs(Certificate Authorities). We will generate a self-signed certificate for local use. (Note that, I have tested it only on OSX 10.11.5).

## Prerequisites:

### 1. openssl
OSX by default comes with [openssl](https://www.openssl.org/).

```zsh
$ openssl version
OpenSSL 0.9.8zh 14 Jan 2016
```

#### [Optional] Getting the latest openssl in OSX

The default openssl comes along with OSX El Captan is *v0.9.8* (which is located in `/usr/bin/openssl`). You can download the latest with homebrew (which is `/usr/local/Cellar/openssl/1.0.2h_1/bin/openssl`) and create alias for that without altering default version. I used alias **openssll** for the latest.

```zsh
# install openssl latest
$ brew install openssl

# add alias in ~/.zshrc
alias openssll="/usr/local/Cellar/openssl/1.0.2h_1/bin/openssl"

#check version
$ openssll version
OpenSSL 1.0.2h  3 May 2016
```

### 2. nginx

Install:

```shell
$ brew install nginx
$ nginx -v
nginx version: nginx/1.10.1
```

<br><br>

## Setting Up HTTPS for localhost

Alright, this is the interesting part. Follow the steps to get https locally:

### STEP 1: Running Local Server

Start your local development server. (this can be just an index.html file with 'hello world' inside `/projects/server1`).

```shell
$ cd /projects/server1
$ python -m SimpleHTTPServer 9999
```

*[OPTIONAL]*: If you want to simulate multiple servers running for your app, create few more local servers. (Nginx will serve them in round robin). I have added 2 more servers just to see the traffic control :)

```shell
$ cd /projects/server2
$ python -m SimpleHTTPServer 9009
$ cd /projects/server3
$ python -m SimpleHTTPServer 9090
```

Let `www.website.dev` and `local.website.dev` be two aliases to your app. Add that to `/etc/hosts` file.

```config
127.0.0.1 local.website.dev
127.0.0.1 www.website.dev
```

### STEP 2: Generate Self-signed SSL Certificate

Use openssl to generate a self-signed SSL certificate & private key pair, this will get generated in the current directory.

```shell
$ openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout localhost.key -out localhost.crt
```

This command will ask for the following info:

- Country Name
- State or Province Name
- Locality Name
- Organization Name
- Organizational Unit Name
- **Common Name**<sup>*</sup>
- Email Address

> **Common Name** value should be the domain name of your website.
> If you have multiple sub domains, use a wildcard
>
> Eg: Use `*.website.dev` for [`local.website.dev`, `www.website.dev`]


The generated certificate will be in x509 container format with SHA256 signature algorithm, 2048bit RSA authentication key and is valid for 365 days.

 **[OPTIONAL]**: *If you want to view the contents of encoded certificate, do this:*

```shell
$ openssl x509 -text -noout -in localhost.crt
```

### STEP 4: Trust authority of the certificate

When browser get certificate from server, it will verify the authenticity. Browser has a known list of trusted CAs, if the certificate issuer is not there, then browser will be showing a security warning 'untrusted connection'.

Our generated certificate is self signed. So browser will give security warning. In order to bypass that, we need to manually verify the trust of certificate.

In OSX, you can do that in Keychain access as shown below: (or, open keychain access ui and add cerificate there).

```shell
$ sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /path/to/file/localhost.crt
```

*Note: this will work on chrome & safari, because those browsers check keychain access in OSX to check for certificates. On the other hand, firefox stores its own list of trusted CAs in the browser, so firefox will still throw the security error.*

### STEP 5: Configure &amp; Reload nginx

This is a sample nginx configuration you can make use of. Save its as `nginx_custom.conf`

```nginx
events {}
http {
    upstream backend {
        server 127.0.0.1:9999 weight=3;
        server 127.0.0.1:9009;
        server 127.0.0.1:9090;
    }
    server {
        server_name local.website.dev;
        rewrite ^(.*) https://local.website.dev$1 permanent;
    }
    server {
        server_name www.website.dev;
        rewrite ^(.*) https://www.website.dev$1 permanent;
    }
    server {
        listen               443;
        ssl                  on;
        ssl_certificate      /path/to/file/localhost.crt;
        ssl_certificate_key  /path/to/file/localhost.key;
        ssl_ciphers          HIGH:!aNULL:!MD5;
        server_name          www.website.dev local.website.dev;
        location / {
            proxy_pass  http://backend;
        }
    }
}
```


Start/Reload nginx

```shell
# START nginx with nginx_custom.conf
$ sudo nginx -c /path/to/file/nginx_custom.conf

# RELOAD nginx whenever you modify config
$ sudo nginx -c /path/to/file/nginx_custom.conf -s reload
```


### STEP 6: Access website from browser
This is the final step! Access any of these localhost:

[https://local.website.dev](https://local.website.dev) or [https://www.website.dev](https://www.website.dev)

Yes, you read it correctly, its **https**! You can see that little green padlock icon <i class="fa fa-lock" style="color: #94C867"></i> in the address bar!

