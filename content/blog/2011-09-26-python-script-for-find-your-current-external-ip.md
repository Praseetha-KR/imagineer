---
title: "Python script to find the current External IP"
slug: python-script-for-find-your-current-external-ip
date: 2011-09-26 01:17:50
tags:
    - python
    - web
blurb: "A tiny python script for finding the current external IP"
theme: "#623F41"
title_color: "#537dca"
luminance: light
---

Here is a simple python 2.7 snippet for finding the current external IP address.

<div class="chroma-linenos">
{{< highlight python "linenos=table" >}}
import httplib
import string

conn = httplib.HTTPConnection("checkip.dyndns.org", 80)
conn.request("GET","/index.html")
res = conn.getresponse()
conn.close()

if res.status == 200:
   response = res.read()
else:
   print 'Error connecting to the server!! Check your internet connection'
   exit()

startstr = string.find(response,': ')+2
endstr = string.find(response,'</b')
print response[startstr:endstr]
{{< / highlight >}}
</div>
