---
title: "Traefik with SSL: understanding ACME"
slug: traefik-ssl-with-letsencrypt-and-cloudflare
date: 2024-05-01 10:00:00
tags:
    - homelab
    - devops
blurb: "Understanding ACME protocol hands-on through automating Lets Encrypt certificate generation for Traefik"
theme: "#2b3544"
title_color: "#6695bb"
luminance: light
graphic:
    preview:
        png: "/images/posts/traefik-letsencrypt-cloudflare/preview.png"
        webp: "/images/posts/traefik-letsencrypt-cloudflare/preview.png"
    main:
        png: "/images/posts/traefik-letsencrypt-cloudflare/main.png"
        overlap: "4.2"
---

Enabling SSL certificates with automated renewals for Traefik in my Homelab setup turned out to be quite straightforward. All I had to do was configure Let's Encrypt as the Certificate Authority (CA) with Cloudflare as the DNS provider in Traefik's config files, and then activate it for services in the Docker Compose file. Once all the configurations were in place, Let's Encrypt promptly issued certificates for the specified subdomains as outlined in the Traefik config. It left me in a bit of a 'what just happened' state. 

While the Traefik container logs include info on some key events, it was not sufficient to understand the ACME protocol flow. I wanted to see API interactions between Traefik, the Let's Encrypt server, and Cloudflare in order to understand the complete ACME flow. To gain a better understanding, I redirected the Traefik container's traffic via BurpSuite proxy. This captured a comprehensive list of the APIs involved, aligning perfectly with the ACME flow specified in RFC 8555.

In this post, I'm sharing the configurations used and a rundown of the captured APIs in the ACME flow, giving you a peek into the process of generating a new Let's Encrypt SSL certificate.


## Traefik setup without SSL

Let’s assume the Traefik VM has the IP `192.168.0.123`. There are four URLs  representing different services (arbitrarily chosen for this post) that need to be routed through Traefik:

- `Traefik Dashboard`: An internal service of Traefik running on port 8080.
- `whoami`: A Docker container residing in the same VM.
- `Dozzle`: Service in another VM within the same network.
- `example.com`: Represents an external URL.


<table class="textsize-small">
    <tr>
        <th>Service</th>
        <th>Before</th>
        <th>After</th>
    </tr>
    <tr>
        <td>Traefik&nbsp;dashboard</td>
        <td><code>http://192.168.0.123:8080</code></td>
        <td><code>http://192.168.0.123:8080</code></td>
    </tr>
    <tr>
        <td>whoami</td>
        <td><code>http://192.168.0.123/whoami</code></td>
        <td><code>http://192.168.0.123/whoami</code></td>
    </tr>
    <tr>
        <td>Dozzle</td>
        <td><code>https://192.168.0.124:2443/dozzle</code></td>
        <td><code>http://192.168.0.123/dozzle</code></td>
    </tr>
    <tr>
        <td>example.com</td>
        <td><code>https://example.com</code></td>
        <td><code>http://192.168.0.123/example</code></td>
    </tr>
</table>

As you can see, we are unifying all services to be accessible via the Trafik VM IP with HTTP. Services except Traefik dashboard are now available on the specified paths.

<div>
    <figure class="figure-l p-2h-top p-2-bottom text-center">
        <picture class="contain-width">
            <!-- <source type="image/webp" srcset="/images/posts/traefik-letsencrypt-cloudflare/traefik-http-setup.png"> -->
            <img src="/images/posts/traefik-letsencrypt-cloudflare/traefik-http-setup.png" alt="Docker DNS issue in air-gapped network">
        </picture>
        <figcaption>fig 1: Traefik HTTP Setup</figcaption>
    </figure>
</div>

Here are the docker compose file and Traefik static & dynamic configuration files for the HTTP setup: 

##### Docker Compose file:
<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/docker-compose.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table" >}}
services:
  traefik:
    image: "traefik:v2.11"
    container_name: "traefik"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "/home/ubuntu/traefik/etc/traefik:/etc/traefik"
  whoami:
    image: "traefik/whoami"
    container_name: "whoami"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=PathPrefix(`/whoami`)"
      - "traefik.http.routers.whoami.entrypoints=web"
{{< / highlight >}}

</div>
</div>
</div>

<br>

##### Traefik Static Configuration file:

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/traefik.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table" >}}
log:
  level: DEBUG
api:
  insecure: true
accessLog: false
providers:
  docker:
    exposedByDefault: false
  file:
    directory: "/etc/traefik/sites"
entryPoints:
  web:
    address: ":80"
{{< / highlight >}}

</div>
</div>
</div>

<br>

##### Traefik Dynamic Configuration files:

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/sites/dozzle.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table" >}}
http:
  routers:
    dozzle:
      rule: PathPrefix(`/dozzle`)
      entryPoints: web
      service: dozzle@file
  services:
    dozzle:
      loadBalancer:
        serversTransport: dozzle
        servers:
          - url: "https://192.168.0.124:2443/dozzle"
  serversTransports:
    dozzle:
      insecureSkipVerify: true
{{< / highlight >}}

</div>
</div>
</div>

<br>

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/sites/example.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table" >}}
http:
  routers:
    example:
      rule: PathPrefix(`/example`)
      entryPoints: web
      service: example@file
  services:
    example:
      loadBalancer:
        passHostHeader: false
        servers:
          - url: "https://example.com"
{{< / highlight >}}

</div>
</div>
</div>


## Traefik setup with SSL

Our next goal is to establish SSL - all URLs will be directed to port `443`.

We also need to setup automated certificate renewals using Let's Encrypt certificates for mitigating the overhead of managing the SSL certificate manually. 



Here is the plan:

<table class="textsize-small">
    <tr>
        <th>Service</th>
        <th>Before</th>
        <th>After</th>
    </tr>
    <tr>
        <td>Traefik&nbsp;dashboard</td>
        <td><code>http://192.168.0.123:8080</code></td>
        <td><code>https://nas.mycustomservice.local/dashboard</code></td>
    </tr>
    <tr>
        <td>whoami</td>
        <td><code>http://192.168.0.123/whoami</code></td>
        <td><code>https://nas.mycustomservice.local/whoami</code></td>
    </tr>
    <tr>
        <td>Dozzle</td>
        <td><code>https://192.168.0.123/dozzle</code></td>
        <td><code>https://nas.mycustomservice.local/dozzle</code></td>
    </tr>
    <tr>
        <td>example.com</td>
        <td><code>http://192.168.0.123/example</code></td>
        <td><code>https://nas.mycustomservice.local/example</code></td>
    </tr>
</table>

Note that the Traefik dashboard is no longer bound to a port, but under a URL path.

<div>
    <figure class="figure-l p-2h-top p-2-bottom text-center">
        <picture class="contain-width">
            <!-- <source type="image/webp" srcset="/images/posts/traefik-letsencrypt-cloudflare/traefik-https-setup.png"> -->
            <img src="/images/posts/traefik-letsencrypt-cloudflare/traefik-https-setup.png" alt="Docker DNS issue in air-gapped network">
        </picture>
        <figcaption>fig 2: Traefik HTTPS Setup</figcaption>
    </figure>
</div>

We will attach the domain name `nas.mycustomservice.local` instead of the IP `192.168.0.123`. Additionally, for demo purposes, I'm planning to add `test1.test2.mycustomservice.local` as an alias for this domain and also `*.nas.mycustomservice.local` to make the services available with subdomain access in case if required. 

Here are the DNS records, local network IPs will make the services to be available within the Homelab network:

```txt
A       nas                    192.168.0.123
A       test.local             192.168.0.123
CNAME   *.nas                  nas.mycustomservice.local
```

<br> 

Here are the docker compose file and Traefik static & dynamic configuration files for the HTTPS setup. Additional lines are highlighted: 

##### Docker Compose file:
<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/docker-compose.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=8 12-14 22-25" >}}
services:
  traefik:
    image: "traefik:v2.11"
    container_name: "traefik"
    ports:
      - "80:80"
      - "8080:8080"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "/home/ubuntu/traefik/etc/traefik:/etc/traefik"
    environment:
      CLOUDFLARE_DNS_API_TOKEN: "<token>"
      CLOUDFLARE_ZONE_API_TOKEN: "<token>"
  whoami:
    image: "traefik/whoami"
    container_name: "whoami"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=PathPrefix(`/whoami`)"
      - "traefik.http.routers.whoami.entrypoints=web"
      - "traefik.http.routers.whoami.middlewares=http2https@file"
      - "traefik.http.routers.whoami-secure.rule=PathPrefix(`/whoami`)"
      - "traefik.http.routers.whoami-secure.entrypoints=websecure"
      - "traefik.http.routers.whoami-secure.tls=true"
{{< / highlight >}}

</div>
</div>
</div>

<br>

> To generate Cloudflare API tokens, refer to https://go-acme.github.io/lego/dns/cloudflare/#api-tokens

##### Traefik Static Configuration file:

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/traefik.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=18-19 21-34" >}}
log:
  level: DEBUG

api:
  insecure: true

accessLog: false

providers:
  docker:
    exposedByDefault: false
  file:
    directory: "/etc/traefik/sites"

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letEncryptStagingResolver:
    acme:
      caServer: https://acme-staging-v02.api.letsencrypt.org/directory
      email: mycustomemail@mailservice.com
      storage: /etc/traefik/acme.json
      dnsChallenge:
        provider: cloudflare
  letEncryptProductionResolver:
    acme:
      email: mycustomemail@mailservice.com
      storage: /etc/traefik/acme.json
      dnsChallenge:
        provider: cloudflare
{{< / highlight >}}

</div>
</div>
</div>

<br>

##### Traefik Dynamic Configuration files:

Note: Use `letEncryptStagingResolver` during testing, and switch to `letEncryptProductionResolver` once finalized.

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/sites/letsencrypt.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=0-10" >}}
tls:
  stores:
    default:
      defaultGeneratedCert:
        resolver: letEncryptProductionResolver
        domain:
          main: "nas.mycustomservice.local"
          sans:
            - "*.nas.mycustomservice.local"
            - "test1.test2.mycustomservice.local"
{{< / highlight >}}

</div>
</div>
</div>

<br>

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/sites/dozzle.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=7-13 23-26" >}}
http:
  routers:
    dozzle:
      rule: PathPrefix(`/dozzle`)
      entryPoints: web
      service: dozzle@file
      middlewares:
        - http2https
    dozzle-secure:
      rule: PathPrefix(`/dozzle`)
      entryPoints: websecure
      service: dozzle@file
      tls: {}
  services:
    dozzle:
      loadBalancer:
        serversTransport: dozzle
        servers:
          - url: "https://192.168.0.124:2443/dozzle"
  serversTransports:
    dozzle:
      insecureSkipVerify: true
  middlewares:
    http2https:
      redirectScheme:
        scheme: https
{{< / highlight >}}

</div>
</div>
</div>

<br>

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/etc/traefik/sites/example.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=7-13 23-26" >}}
http:
  routers:
    example:
      rule: PathPrefix(`/example`)
      entryPoints: web
      service: example@file
      middlewares: 
        - http2https
    example-secure:
      rule: PathPrefix(`/example`)
      entryPoints: websecure
      service: example@file
      tls: {}
  services:
    example:
      loadBalancer:
        passHostHeader: false
        servers:
          - url: "https://example.com"
{{< / highlight >}}

</div>
</div>
</div>

Once saved, Traefik would contact Let's Encrypt server to issue SSL certificates. If you monitor DNS records, you could see temporary DNS records getting created in Cloudflare. 

This completes the SSL certificate setup, `https://nas.mycustomservice.local/<service_path>` would give the service access.

The generated SSL certificate can be viewed at `/etc/traefik/acme.json`:


<div>
<div class="code-snippet">
<div class="chroma-filename">/etc/traefik/acme.json</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=18-26" >}}
{
    "letEncryptStagingResolver": {
        "Account": {
            "Email": "mycustomemail@mailservice.com",
            "Registration": {
                "body": {
                    "status": "valid",
                    "contact": [
                        "mailto:mycustomemail@mailservice.com"
                    ]
                },
                "uri": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789"
            },
            "PrivateKey": "MIIJKQIB...F9t44KnJ",
            "KeyType": "4096"
        },
        "Certificates": [{
            "domain": {
                "main": "*.nas.mycustomservice.local",
                "sans": [
                    "nas.mycustomservice.local",
                    "test1.test2.mycustomservice.local"
                ]
            },
            "certificate": "LS0tLS1...LS0tLS0K",
            "key": "LS0tLS1...S0tLS0tCg==",
            "Store": "default"
        }]
    },
    "letEncryptProductionResolver": {
        "Account": null,
        "Certificates": null
    }
}
{{< / highlight >}}

</div>
</div>
</div>

<br>

<hr>

## What's happening internally?

The diagram below depicts the typical sequence of requests for SSL certificate issuance by Traefik using the ACME protocol (*Let's Encrypt* as Certificate Authority) and with DNS challenge type (*Cloudflare* as DNS provider). 

<div class="p-1-top p-1-bottom full-width">
    <div class="align-center p-4-right p-4-left">
        <figure class="figure-c p-2h-top p-2-bottom text-center">
            <picture class="contain-width">
                <!-- <source type="image/webp" srcset="/images/posts/traefik-letsencrypt-cloudflare/ACME_overview.png"> -->
                <img src="/images/posts/traefik-letsencrypt-cloudflare/ACME_overview.png" alt="SSL issuance process">
            </picture>
            <figcaption>fig 3: SSL certificate issuance process with ACME</figcaption>
        </figure>
    </div>
</div>

#### [Debugging] How to view API requests?

Burp Suite proxy was utilized to capture these API requests. Initially, the proxy was enabled, and the CA certificate was exported in DER format. Subsequently, it was converted to PEM format using the following command:


```bash
openssl x509 -in /path/to/burp_ca.der -out /path/to/burp_ca.pem -outform pem
```

This file was then transferred to the VM hosting the Traefik container, and the docker-compose file was updated as shown below. This enabled to view all the APIs in BurpSuite's `Proxy > HTTP History`.

<div>
<div class="code-snippet">
<div class="chroma-filename">traefik/docker-compose.yml</div>
<div class="chroma-linenos">

{{< highlight yml "linenos=table,hl_lines=12 16-17" >}}
services:
  traefik:
    image: "traefik:v2.11"
    container_name: "traefik"
    ports:
      - "80:80"
      - "8080:8080"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "/home/ubuntu/traefik/etc/traefik:/etc/traefik"
      - "/home/ubuntu/traefik/burp_ca.pem:/etc/ssl/certs/burp_ca.pem"
    environment:
      CLOUDFLARE_DNS_API_TOKEN: "<token>"
      CLOUDFLARE_ZONE_API_TOKEN: "<token>"
      HTTP_PROXY: "<IP_of_the_machine_with_burpsuite_proxy>"
      HTTPS_PROXY: "<IP_of_the_machine_with_burpsuite_proxy>"
  whoami:
    image: "traefik/whoami"
    container_name: "whoami"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=PathPrefix(`/whoami`)"
      - "traefik.http.routers.whoami.entrypoints=web"
      - "traefik.http.routers.whoami.middlewares=http2https@file"
      - "traefik.http.routers.whoami-secure.rule=PathPrefix(`/whoami`)"
      - "traefik.http.routers.whoami-secure.entrypoints=websecure"
      - "traefik.http.routers.whoami-secure.tls=true"
{{< / highlight >}}

</div>
</div>
</div>

<br>

### Cloudflare ↔ Traefik ↔ Let's Encrypt API Interaction

Here's the expanded version with request and response details for each API call recorded in BurpSuite: (click on each request to expand details)

<style>
    .diagram--request-response__section {
        display: grid;
        grid-template-columns: 0.3em 20em 0.3em;
        margin-top: 2em;
        width: 100%;
    }
    .diagram__column {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: center;
    }
    .diagram__vertical-box {
        display: flex;
        flex-direction: column;
        vertical-align: center;
        height: 100%;
        width: 0.3em;
        background: #000;
        /* border: 1px solid #000; */
        position: relative;
    }
    .diagram__vertical-box__title {
        position: absolute;
        z-index: 2;
        background: #f4f6fa;
    }
    .diagram__request {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 2em;
        position: relative;
    }
    .diagram__request__arrow {
        height: 1px;
        width: 100%;
        background: #000;
    }
    .diagram__request__arrow--ltr::after {
        content: "";
        position: absolute;
        right: -1px;
        top: -3.5px;
        border-width: 4px 0 4px 15px;
        border-color: transparent transparent transparent #000;
        border-style: solid;
    }
    .diagram__request__arrow--rtl::after {
        content: "";
        position: absolute;
        left: -1px;
        top: -3.5px;
        border-width: 4px 15px 4px 0;
        border-color: transparent #000 transparent transparent;
        border-style: solid;
    }
    .diagram__request__detail {
        width: 100%;
        background: #fdf1eb;
        border: 1px solid #eed3c6;
        /* border-radius: 0.3em; */
        padding: 0.2em 0.6em;
        font-size: 0.8em;
        text-align: left;
    }
    .diagram__request__detail__title {
        color: #b14a0f;
        word-break: break-word;
        line-height: 1.2;
    }
    .diagram__request__subtitle {
        font-size: 0.6em;
        text-transform: uppercase;
        font-weight: bold;
        padding-bottom: 0.2em;
        color: #642d0e;
        padding-top: 0.5em;
    }
    .diagram__request__detail__summary-request-response {
        width: 100%;
        /* background: #333; */
        padding: 0.3em 0.3em 0.8em;
    }
    .diagram__request__detail__pre {
        width: 100%;
        background: #fffcfb;
        overflow-x: scroll;
        font-size: 0.8em;
        padding: 0.6em .8em;
        padding-bottom: 1em;
    }
    .hidden-one-col {
        display: none;
    }
    .hidden-multi-col {
        display: flex;
    }
    @media (min-width: 992px) {
        .diagram--request-response__section {
            grid-template-columns: 0.3em 20em 0.3em 20em 0.3em;
            margin-top: 0;
        }
        .hidden-one-col {
            display: flex;
        }
        .hidden-multi-col {
            display: none;
        }
    }
</style>

<div>
<div class="figure-l p-2h-top p-2-bottom text-center align-center">
    <div class="diagram--request-response-flow">
        <div class="diagram--request-response__section">
            <div class="diagram__column hidden-one-col">
                <div class="diagram__vertical-box__title">Cloudflare</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column hidden-one-col">
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title">Server (Traefik)</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column">
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">GET /directory</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1" >}}
GET /directory HTTP/1.1
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Accept-Encoding: gzip, deflate, br
Connection: close

{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=20-22" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:23 GMT
Content-Type: application/json
Content-Length: 821
Cache-Control: public, max-age=0, no-cache
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
    "aXXX5so4OUM": "https://community.letsencrypt.org/t/adding-random-entries-to-the-directory/33417",
    "keyChange": "https://acme-staging-v02.api.letsencrypt.org/acme/key-change",
    "meta": {
        "caaIdentities": [
            "letsencrypt.org"
        ],
        "termsOfService": "https://letsencrypt.org/documents/LE-SA-v1.4-April-3-2024.pdf",
        "website": "https://letsencrypt.org/docs/staging-environment/"
    },
    "newAccount": "https://acme-staging-v02.api.letsencrypt.org/acme/new-acct",
    "newNonce": "https://acme-staging-v02.api.letsencrypt.org/acme/new-nonce",
    "newOrder": "https://acme-staging-v02.api.letsencrypt.org/acme/new-order",
    "renewalInfo": "https://acme-staging-v02.api.letsencrypt.org/draft-ietf-acme-ari-02/renewalInfo/",
    "revokeCert": "https://acme-staging-v02.api.letsencrypt.org/acme/revoke-cert"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">HEAD /acme/new-nonce</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1" >}}
HEAD /acme/new-nonce HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:23 GMT
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_1>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/new-acct</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 10-12 22" >}}
POST /acme/new-acct HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1979
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload": {
    "contact": [
      "mailto:user@example.com"
    ],
    "termsOfServiceAgreed": true
  },
  "protected": {
    "alg": "RS256",
    "jwk": {
      "kty": "RSA",
      "n": "txHVs5DnkevYfwsxT...qJRoxmQYVNdo-Gp0G5MeIFaAk",
      "e": "AQAB"
    },
    "nonce": "<nonce_1>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/new-acct"
  },
  "signature": "PkiNgKlURafo...8V2yQRzibY"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6 9-11 21-24 26" >}}
HTTP/2 201 Created
Server: nginx
Date: Mon, 15 Apr 2024 22:44:24 GMT
Content-Type: application/json
Content-Length: 907
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://letsencrypt.org/documents/LE-SA-v1.4-April-3-2024.pdf>;rel="terms-of-service"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789
Replay-Nonce: <nonce_2>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "key": {
    "kty": "RSA",
    "n": "txHVs5DnkevYfwsxTSndw...Gp0G5MeIFaAk",
    "e": "AQAB"
  },
  "contact": [
    "mailto:user@example.com"
  ],
  "initialIp": "<server_ip>",
  "createdAt": "2024-04-15T22:44:24.238667243Z",
  "status": "valid"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/new-order</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 10-23 27-28" >}}
POST /acme/new-order HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1210
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload": {
    "identifiers": [
      {
        "type": "dns",
        "value": "*.nas.mycustomservice.local"
      },
      {
        "type": "dns",
        "value": "nas.mycustomservice.local"
      },
      {
        "type": "dns",
        "value": "test1.test2.mycustomservice.local"
      }
    ]
  },
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_2>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/new-order"
  },
  "signature":"iHW7BjmDfBxv6hO...m3B2BPtUxk_7Jzw"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6 9-10 15-36" >}}
HTTP/2 201 Created
Server: nginx
Date: Mon, 15 Apr 2024 22:44:24 GMT
Content-Type: application/json
Content-Length: 648
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/order/123456789/11122233344
Replay-Nonce: <nonce_3>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "identifiers": [
    {
      "type": "dns",
      "value": "*.nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "test1.test2.mycustomservice.local"
    }
  ],
  "authorizations": [
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  ],
  "finalize": "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/123456789/11122233344"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/11111111111</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 12-13" >}}
POST /acme/authz-v3/11111111111 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_3>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111"
  },
  "signature":"pYj8p8yW2FCFJrr...fLpx4jtFAHjFFM2-SA"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6 9 14-28" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:25 GMT
Content-Type: application/json
Content-Length: 392
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_4>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
      "token": "<token_1>"
    }
  ],
  "wildcard": true
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">HEAD /acme/new-nonce</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1" >}}
HEAD /acme/new-nonce HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:25 GMT
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_5>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">HEAD /acme/new-nonce</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1" >}}
HEAD /acme/new-nonce HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:25 GMT
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_6>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/22222222222</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 12-13" >}}
POST /acme/authz-v3/22222222222 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_5>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222"
  },
  "signature":"Hh2nnXUaDQe...Kqvz5Tliq19FRNpg5Q"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6 9 14-39" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:25 GMT
Content-Type: application/json
Content-Length: 816
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_7>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/eeeEEE",
      "token": "<token_2>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB",
      "token": "<token_2>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/dddDDD",
      "token": "<token_2>"
    }
  ]
}

{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/33333333333</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 12-13" >}}
POST /acme/authz-v3/33333333333 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_6>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  },
  "signature":"O3i3GhFrvTjBsWp...iWgkXuJJ1u7TR8g4"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=6 9 14-39" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:25 GMT
Content-Type: application/json
Content-Length: 830
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_8>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "test1.test2.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/fffFFF",
      "token": "<token_3>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
      "token": "<token_3>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/gggGGG",
      "token": "<token_3>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title">Let's Encrypt Server</div>
                <div class="diagram__vertical-box"></div>
            </div>
        </div>
                <div class="diagram--request-response__section">
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Cloudflare</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column">
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">GET /client/v4/zones?name=example.com&per_page=50</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3-4" >}}
GET /client/v4/zones?name=example.com&per_page=50 HTTP/1.1
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_1>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Accept-Encoding: gzip, deflate, br
Connection: close
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 20-22 48-51 59-62" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:44:26 GMT
Content-Type: application/json
Cf-Ray: 4ba0722d24fb3b1b-SFO
Cf-Cache-Status: DYNAMIC
Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
Expires: Sun, 25 Jan 1981 05:00:00 GMT
Set-Cookie: __cflb=0...D; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:14:27 GMT; HttpOnly
Strict-Transport-Security: max-age=31536000
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Vary: Accept-Encoding
Set-Cookie: __cfruid=f...6; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": [
        {
            "id": "zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ",
            "name": "example.com",
            "status": "active",
            "paused": false,
            "type": "full",
            "development_mode": 0,
            "name_servers": [
                "dina.ns.cloudflare.com",
                "phil.ns.cloudflare.com"
            ],
            "original_name_servers": null,
            "original_registrar": null,
            "original_dnshost": null,
            "modified_on": "2024-04-02T19:46:42.072328Z",
            "created_on": "2022-12-19T05:26:53.707734Z",
            "activated_on": "2022-12-19T05:38:03.856067Z",
            "meta": {
                "step": 2,
                "custom_certificate_quota": 0,
                "page_rule_quota": 3,
                "phishing_detected": false,
                "multiple_railguns_allowed": false
            },
            "owner": {
                "id": null,
                "type": "user",
                "email": null
            },
            "account": {
                "id": "<acc_id>",
                "name": "<acc_name>"
            },
            "tenant": {
                "id": null,
                "name": null
            },
            "tenant_unit": {
                "id": null
            },
            "permissions": [
                "#zone:read",
                "#zone_settings:read"
            ],
            "plan": {
                "id": "0feeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                "name": "Free Website",
                "price": 0,
                "currency": "USD",
                "frequency": "",
                "is_subscribed": false,
                "can_subscribe": false,
                "legacy_id": "free",
                "legacy_discount": false,
                "externally_managed": false
            }
        }
    ],
    "result_info": {
        "page": 1,
        "per_page": 50,
        "total_pages": 1,
        "count": 1,
        "total_count": 1
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3 12-15" >}}
POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Content-Length: 174
Accept-Encoding: gzip, deflate, br

{
    "created_on": "0001-01-01T00:00:00Z",
    "modified_on": "0001-01-01T00:00:00Z",
    "type": "TXT",
    "name": "nas.mycustomservice.local",
    "content": "BbR...E1I",
    "ttl": 120
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 13-18 21" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:44:27 GMT
Content-Type: application/json
Cf-Ray: 874f75d4c9b73c12-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...F; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:14:28 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=7...7; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA",
        "zone_id": "zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ",
        "zone_name": "example.com",
        "name": "nas.mycustomservice.local",
        "type": "TXT",
        "content": "BbR...E1I",
        "proxiable": false,
        "proxied": false,
        "ttl": 120,
        "locked": false,
        "meta": {
            "auto_added": false,
            "managed_by_apps": false,
            "managed_by_argo_tunnel": false
        },
        "comment": null,
        "tags": [],
        "created_on": "2024-04-15T22:44:27.736818Z",
        "modified_on": "2024-04-15T22:44:27.736818Z"
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3 12-15" >}}
POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Content-Length: 174
Accept-Encoding: gzip, deflate, br

{
    "created_on": "0001-01-01T00:00:00Z",
    "modified_on": "0001-01-01T00:00:00Z",
    "type": "TXT",
    "name": "nas.mycustomservice.local",
    "content": "_SN...xi0",
    "ttl": 120
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 13-18 21" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:44:28 GMT
Content-Type: application/json
Cf-Ray: 874f75dabaee3c12-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...F; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:14:29 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=1...; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB",
        "zone_id": "zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ",
        "zone_name": "example.com",
        "name": "nas.mycustomservice.local",
        "type": "TXT",
        "content": "_SN...xi0",
        "proxiable": false,
        "proxied": false,
        "ttl": 120,
        "locked": false,
        "meta": {
            "auto_added": false,
            "managed_by_apps": false,
            "managed_by_argo_tunnel": false,
        },
        "comment": null,
        "tags": [],
        "created_on": "2024-04-15T22:44:28.444277Z",
        "modified_on": "2024-04-15T22:44:28.444277Z",
    },
    "success": true,
    "errors": [],
    "messages": [],
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3 12-15" >}}
POST /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Content-Length: 204
Accept-Encoding: gzip, deflate, br

{
    "created_on": "0001-01-01T00:00:00Z",
    "modified_on": "0001-01-01T00:00:00Z",
    "type": "TXT",
    "name": "_acme-challenge.test1.test2.mycustomservice.local",
    "content": "g4K...Prg",
    "ttl": 120
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 13-18 21" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:44:29 GMT
Content-Type: application/json
Cf-Ray: 874f75dfcc0a3c12-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...m; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:14:30 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=1...9; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "cCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC",
        "zone_id": "zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ",
        "zone_name": "example.com",
        "name": "_acme-challenge.test1.test2.mycustomservice.local",
        "type": "TXT",
        "content": "g4K...Prg",
        "proxiable": false,
        "proxied": false,
        "ttl": 120,
        "locked": false,
        "meta": {
            "auto_added": false,
            "managed_by_apps": false,
            "managed_by_argo_tunnel": false
        },
        "comment": null,
        "tags": [],
        "created_on": "2024-04-15T22:44:29.294042Z",
        "modified_on": "2024-04-15T22:44:29.294042Z"
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Server (Traefik)</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column hidden-one-col">
            </div>
            <div class="diagram__column hidden-one-col">
                <div class="diagram__vertical-box__title hidden-multi-col">Let's Encrypt Server</div>
                <div class="diagram__vertical-box"></div>
            </div>
        </div>
        <div class="diagram--request-response__section">
            <div class="diagram__column hidden-one-col">
                <div class="diagram__vertical-box__title hidden-multi-col">Cloudflare</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column hidden-one-col">
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Server (Traefik)</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column">
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/chall-v3/11111111111/aaaAAA</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/chall-v3/11111111111/aaaAAA HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1045
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"e30",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_8>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA"
  },
  "signature": "YpujTx3RiJszf3D...wfdef6KmEFfFrrQ"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9-11 16-17" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:31 GMT
Content-Type: application/json
Content-Length: 193
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111>;rel="up"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA
Replay-Nonce: <nonce_9>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "type": "dns-01",
  "status": "pending",
  "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
  "token": "<token_1>"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/11111111111</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/11111111111 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_9>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111"
  },
  "signature": "nJBPLq2Lds321...oGvkZANUXIm284"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:32 GMT
Content-Type: application/json
Content-Length: 392
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_10>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
      "token": "<token_1>"
    }
  ],
  "wildcard": true
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/11111111111</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/11111111111 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_10>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111"
  },
  "signature": "r-N9y58zlB9i2r...CIW-Y8w8qwo1_ws"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:35 GMT
Content-Type: application/json
Content-Length: 392
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_11>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
      "token": "<token_1>"
    }
  ],
  "wildcard": true
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/11111111111</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/11111111111 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_11>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111"
  },
  "signature": "sKKxfXxd8eVYmvLf...KSO9jzvdLA0VRk"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:45 GMT
Content-Type: application/json
Content-Length: 392
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_12>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
      "token": "<token_1>"
    }
  ],
  "wildcard": true
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/11111111111</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/11111111111 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_12>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111"
  },
  "signature": "m8VMj7Mdv8jI3...GbLqTZJEuqKYYE"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-34 37" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:56 GMT
Content-Type: application/json
Content-Length: 597
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_13>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "valid",
  "expires": "2024-05-15T22:44:51Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "valid",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/11111111111/aaaAAA",
      "token": "<token_1>",
      "validationRecord": [
        {
          "hostname": "nas.mycustomservice.local",
          "resolverAddrs": [
            "10.0.32.85:28460"
          ]
        }
      ],
      "validated": "2024-04-15T22:44:31Z"
    }
  ],
  "wildcard": true
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/chall-v3/22222222222/bbbBBB</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/chall-v3/22222222222/bbbBBB HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1045
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"e30",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_13>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB"
  },
  "signature": "KoR8Npq7IbAosgLUX...Ua9S_ai78uno4"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9-11 16-19" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:59 GMT
Content-Type: application/json
Content-Length: 193
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222>;rel="up"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB
Replay-Nonce: <nonce_14>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "type": "dns-01",
  "status": "pending",
  "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB",
  "token": "<token_2>"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/22222222222</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/22222222222 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_14>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222"
  },
  "signature":"W8SCrjEIrr6o...fAr4Bs0kiU1uIaw"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28-29 34-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:44:59 GMT
Content-Type: application/json
Content-Length: 816
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_15>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/eeeEEE",
      "token": "<token_2>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB",
      "token": "<token_2>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/dddDDD",
      "token": "<token_2>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/22222222222</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/22222222222 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_15>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222"
  },
  "signature":"NH-TaMdUBCoG9N...IMeHGs8LxRnSj-4s"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28-29 34-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:07 GMT
Content-Type: application/json
Content-Length: 816
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_16>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/eeeEEE",
      "token": "<token_2>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB",
      "token": "<token_2>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/dddDDD",
      "token": "<token_2>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/22222222222</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/22222222222 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload": "",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_16>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222"
  },
  "signature": "Rrl0vQb083f3qY6mr...56fDga--8YhSpk"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-34" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:12 GMT
Content-Type: application/json
Content-Length: 577
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_17>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "nas.mycustomservice.local"
  },
  "status": "valid",
  "expires": "2024-05-15T22:45:09Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "valid",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/22222222222/bbbBBB",
      "token": "<token_2>",
      "validationRecord": [
        {
          "hostname": "nas.mycustomservice.local",
          "resolverAddrs": [
            "10.0.32.82:23095"
          ]
        }
      ],
      "validated": "2024-04-15T22:44:59Z"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/chall-v3/33333333333/cccCCC</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/chall-v3/33333333333/cccCCC HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1045
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"e30",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_17>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC"
  },
  "signature":"pPaeqBiq4HqW5...QBSi3l87xrdUM"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9-11 16-19" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:14 GMT
Content-Type: application/json
Content-Length: 193
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333>;rel="up"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC
Replay-Nonce: <nonce_18>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "type": "dns-01",
  "status": "pending",
  "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
  "token": "<token_3>"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/33333333333</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/33333333333 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_18>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  },
  "signature":"HiH3Yh5hdLdQhm...qgYF1AM_1AC3Qo"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28-29 34-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:15 GMT
Content-Type: application/json
Content-Length: 830
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_18>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "test1.test2.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/fffFFF",
      "token": "<token_3>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
      "token": "<token_3>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/gggGGG",
      "token": "<token_3>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/33333333333</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/33333333333 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
    "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_18>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  },
  "signature":"SMKKc-Da_EE...nxmjwTgJiNYqQc"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28-29 34-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:22 GMT
Content-Type: application/json
Content-Length: 830
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_19>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "test1.test2.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/fffFFF",
      "token": "<token_3>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
      "token": "<token_3>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/gggGGG",
      "token": "<token_3>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/33333333333</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/33333333333 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_19>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  },
  "signature":"fSjTHehqqfWz...bVvaG2uH4DXf7h74o"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 15-16 18 22-23 28-29 34-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:30 GMT
Content-Type: application/json
Content-Length: 830
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_20>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "test1.test2.mycustomservice.local"
  },
  "status": "pending",
  "expires": "2024-04-22T22:44:24Z",
  "challenges": [
    {
      "type": "http-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/fffFFF",
      "token": "<token_3>"
    },
    {
      "type": "dns-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
      "token": "<token_3>"
    },
    {
      "type": "tls-alpn-01",
      "status": "pending",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/gggGGG",
      "token": "<token_3>"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/authz-v3/33333333333</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/authz-v3/33333333333 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1033
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_20>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  },
  "signature":"axHJF6HwVPlLDNDj...blbKDbI6BpV_Gz0"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9 14-16 18 22-34" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:41 GMT
Content-Type: application/json
Content-Length: 605
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_21>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "identifier": {
    "type": "dns",
    "value": "test1.test2.mycustomservice.local"
  },
  "status": "valid",
  "expires": "2024-05-15T22:45:34Z",
  "challenges": [
    {
      "type": "dns-01",
      "status": "valid",
      "url": "https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/33333333333/cccCCC",
      "token": "<token_3>",
      "validationRecord": [
        {
          "hostname": "test1.test2.mycustomservice.local",
          "resolverAddrs": [
            "10.0.32.82:23095"
          ]
        }
      ],
      "validated": "2024-04-15T22:45:14Z"
    }
  ]
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Let's Encrypt Server</div>
                <div class="diagram__vertical-box"></div>
            </div>
        </div>
        <div class="diagram--request-response__section">
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Cloudflare</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column">
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/aAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3" >}}
DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/aAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Accept-Encoding: gzip, deflate, br
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 12-14" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:45:42 GMT
Content-Type: application/json
Cf-Ray: 874f77a6998e3c07-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...D; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:15:43 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=c...2; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3" >}}
DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Accept-Encoding: gzip, deflate, br
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 12-14" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:45:43 GMT
Content-Type: application/json
Cf-Ray: 21d51a9896374f07-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...j; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:15:44 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=7...3; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB"
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--rtl"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/cCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 3" >}}
DELETE /client/v4/zones/zzzzzzzzzzzzzzzzZZZZZZZZZZZZZZZZ/dns_records/cCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC HTTP/2
Host: api.cloudflare.com
Authorization: Bearer <bearer_token_2>
User-Agent: cloudflare-go/v4
Content-Type: application/json
Accept-Encoding: gzip, deflate, br
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 12-14" >}}
HTTP/2 200 OK
Date: Mon, 15 Apr 2024 22:45:43 GMT
Content-Type: application/json
Cf-Ray: 35084b19144de3bf-SFO
Cf-Cache-Status: DYNAMIC
Set-Cookie: __cflb=0...F; SameSite=Lax; path=/; expires=Tue, 16-Apr-24 01:15:44 GMT; HttpOnly
Vary: Accept-Encoding
Set-Cookie: __cfruid=7...3; path=/; domain=.api.cloudflare.com; HttpOnly; Secure; SameSite=None
Server: cloudflare

{
    "result": {
        "id": "cCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcC"
    },
    "success": true,
    "errors": [],
    "messages": []
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Server (Traefik)</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column hidden-one-col">
            </div>
            <div class="diagram__column hidden-one-col">
                <div class="diagram__vertical-box__title hidden-multi-col">Let's Encrypt Server</div>
                <div class="diagram__vertical-box"></div>
            </div>
        </div>
        <div class="diagram--request-response__section">
            <div class="diagram__column hidden-one-col">
                <div class="diagram__vertical-box__title hidden-multi-col">Cloudflare</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column hidden-one-col">
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Server (Traefik)</div>
                <div class="diagram__vertical-box"></div>
            </div>
            <div class="diagram__column">
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/finalize/123456789/11122233344</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 10 15" >}}
POST /acme/finalize/123456789/11122233344 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 3201
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload": {
    "csr": "MIIEsDCCApgCAQAwGDE...fmxnNbbWYA"
  },
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_21>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/123456789/11122233344"
  },
  "signature":"nqtwaW8gJo...KhY5w6SljCto"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=9-11 16-37" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:47 GMT
Content-Type: application/json
Content-Length: 651
Boulder-Requester: 123456789
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Location: https://acme-staging-v02.api.letsencrypt.org/acme/order/123456789/11122233344
Replay-Nonce: <nonce_22>
Retry-After: 3
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "status": "processing",
  "expires": "2024-04-22T22:44:24Z",
  "identifiers": [
    {
      "type": "dns",
      "value": "*.nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "test1.test2.mycustomservice.local"
    }
  ],
  "authorizations": [
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  ],
  "finalize": "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/123456789/11122233344"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/order/123456789/11122233344</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/order/123456789/11122233344 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1042
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_22>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/order/123456789/11122233344"
  },
  "signature":"K_ngn_c-LJUxr...bBE4wQHO0"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=8 13-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:47 GMT
Content-Type: application/json
Content-Length: 651
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_23>
Retry-After: 3
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "status": "processing",
  "expires": "2024-04-22T22:44:24Z",
  "identifiers": [
    {
      "type": "dns",
      "value": "*.nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "test1.test2.mycustomservice.local"
    }
  ],
  "authorizations": [
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  ],
  "finalize": "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/123456789/11122233344"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/order/123456789/11122233344</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/order/123456789/11122233344 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1042
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_23>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/order/123456789/11122233344"
  },
  "signature":"RhBRVl87HQ4...osLPyPjw"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=8 13-35" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:48 GMT
Content-Type: application/json
Content-Length: 758
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Replay-Nonce: <nonce_24>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

{
  "status": "valid",
  "expires": "2024-04-22T22:44:24Z",
  "identifiers": [
    {
      "type": "dns",
      "value": "*.nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "nas.mycustomservice.local"
    },
    {
      "type": "dns",
      "value": "test1.test2.mycustomservice.local"
    }
  ],
  "authorizations": [
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/11111111111",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/22222222222",
    "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/33333333333"
  ],
  "finalize": "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/123456789/11122233344",
  "certificate": "https://acme-staging-v02.api.letsencrypt.org/acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX"
}
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1061
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_24>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX"
  },
  "signature":"bE2kWcDPuwJ...ZNGgjUDY"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 8-9 13-23" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:48 GMT
Content-Type: application/pem-certificate-chain
Content-Length: 4144
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://acme-staging-v02.api.letsencrypt.org/acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX/1>;rel="alternate"
Replay-Nonce: <nonce_25>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

-----BEGIN CERTIFICATE-----
MIIGPjCC...gYPhj1xAP5jqa
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIFWzCCA0...O1aw0PpQBPDQ==
-----END CERTIFICATE-----

{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
                <div class="diagram__request">
                    <div class="diagram__request__arrow diagram__request__arrow--ltr"></div>
                    <details class="diagram__request__detail">
                        <summary class="diagram__request__detail__title">POST /acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX/1</summary>
                        <div class="diagram__request__detail__summary-request-response">
                            <div class="diagram__request__subtitle">Request</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=1 13" >}}
POST /acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX/1 HTTP/2
Host: acme-staging-v02.api.letsencrypt.org
User-Agent: containous-traefik/2.11.0 xenolf-acme/4.15.0 (release; linux; amd64)
Content-Length: 1063
Content-Type: application/jose+json
Accept-Encoding: gzip, deflate, br

{
  "payload":"",
  "protected": {
    "alg": "RS256",
    "kid": "https://acme-staging-v02.api.letsencrypt.org/acme/acct/123456789",
    "nonce": "<nonce_25>",
    "url": "https://acme-staging-v02.api.letsencrypt.org/acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX/1"
  },
  "signature":"SWchkpGL7GUk...1zprNvJoVsAAIng"
}
{{< / highlight >}}
</div>
</div>
                            <div class="diagram__request__subtitle">Response</div>
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=4 8-9 13-23" >}}
HTTP/2 200 OK
Server: nginx
Date: Mon, 15 Apr 2024 22:45:49 GMT
Content-Type: application/pem-certificate-chain
Content-Length: 6052
Cache-Control: public, max-age=0, no-cache
Link: <https://acme-staging-v02.api.letsencrypt.org/directory>;rel="index"
Link: <https://acme-staging-v02.api.letsencrypt.org/acme/cert/xxxxXXXXxxxxXXXXxxxxXXXXxxxxXXXX/0>;rel="alternate"
Replay-Nonce: <nonce_26>
X-Frame-Options: DENY
Strict-Transport-Security: max-age=604800

-----BEGIN CERTIFICATE-----
MIIGPj...BgYPhj1xAP5jqa
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIFWz...O1aw0PpQBPDQ==
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIFVD...0BPHtenfhKj5
-----END CERTIFICATE-----

{{< / highlight >}}
</div>
</div>
<hr>
To view the certificate content, store the above response in a PEM file and run command:

```bash
while openssl x509 -noout -text; do :; done < cert.pem
```

Output:
<div class="code-snippet">
<div class="chroma-linenos">
{{< highlight yml "linenos=table,hl_lines=3 5-6" >}}
Certificate:
    Data:
        Subject: CN=*.nas.mycustomservice.local.Info
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:*.nas.mycustomservice.local, DNS:nas.mycustomservice.local, DNS:test1.test2.mycustomservice.local
            ...
        ...
Certificate:
    Data:
        Subject: C=US, O=(STAGING) Let's Encrypt, CN=(STAGING) Artificial Apricot R3
        ...
Certificate:
    Data:
        Subject: C=US, O=(STAGING) Internet Security Research Group, CN=(STAGING) Pretend Pear X1
    ...
{{< / highlight >}}
</div>
</div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="diagram__column">
                <div class="diagram__vertical-box__title hidden-multi-col">Let's Encrypt Server</div>
                <div class="diagram__vertical-box"></div>
            </div>
        </div>
    </div>
</div>
</div>

Now check out [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555), you would be able to map these APIs and understand it very easily!


### References

<ol>
    <li><a href="https://datatracker.ietf.org/doc/html/rfc8555" target="_blank">RFC 8555: Automatic Certificate Management Environment (ACME)</a></li>
    <li>
        <a href="https://go-acme.github.io/lego/dns/cloudflare/" target="_blank">LEGO DNS Providers > Cloudflare</a>
        (or, <a href="https://github.com/go-acme/lego/blob/42aa57e2b98e07a1a72dcf27848c053783b99d8f/docs/content/dns/zz_gen_cloudflare.md" target="_blank">Github link</a>)
    </li>
    <li><a href="https://developers.cloudflare.com/api/" target="_blank">Cloudflare API</a></li>
</ol>
