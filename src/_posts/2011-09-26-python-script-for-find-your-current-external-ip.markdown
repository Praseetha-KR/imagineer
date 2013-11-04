---
layout: post
title:  "Python script to find the current External IP"
date:   2013-11-02 14:54:02
categories: blog
---

Here is a simple python program for finding the current external IP address.

{% highlight python %}
import httplib 
import string

conn = httplib.HTTPConnection("checkip.dyndns.org") 
conn.request("GET","/index.html")
r1 = conn.getresponse() 
conn.close() 
if r1.status == 200:
   data1 = r1.read() 
else:
   print 'Error connecting to the server!! Check your internet connection'
   exit() 
startstr = string.find(data1,': ')+2 
endstr = string.find(data1,'</b') 
print data1[startstr:endstr]

{% endhighlight %}

