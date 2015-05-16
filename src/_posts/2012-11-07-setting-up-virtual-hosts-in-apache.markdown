---
layout: post
title:  "Setting up Virtual Hosts in Apache"
date:   2012-11-07 10:41:29
categories: blog
blurb: "How to set up virtual hosts for website testing in windows"
---

I have a Windows7 PC with <a href="http://www.apachefriends.org/en/xampp-windows.html">XAMPP</a> installed in it. Whenever I need to setup multiple sites in my machine, I used to put the site folders under <code>C:\\xampp\\htdocs\\</code> folder, which is the default <code>localhost</code> directory. The reason is that dynamically linked files need a host to run perfectly.

An alternative way or the perfect solution to this method is to use the Virtual Hosts. Through this way we are able to make virtual hosts irrespective of the location of working directory of the website. In simple words, we don’t need to put all the website files to default location of localhost directory (C:\xampp\htdocs\).

Virtual host is actually localhost itself, but with a different alias. Every virtual host points to local IP, i.e., 127.0.0.1. The simple way to setup virtual hosts for multiple sites for the Apache server in xampp is described below:

1) Stop the apache service from xampp control panel.

2) Open file <code>C:\xampp\apache\conf\extra\httpd-vhosts.conf</code> with a text editor.

3) Uncomment the line 19 “<code># NameVirtualHost *:80</code>“. So, we will get,
{% highlight bash %}
	NameVirtualHost *:80
{% endhighlight %}

4) Concatenate the following snippet at the end of the file. This will help you to access ‘localhost’ all time.
{% highlight bash %}
    <VirtualHost *>
        ServerAdmin admin@localhost.com
        DocumentRoot "C:/xampp/htdocs"
        ServerName localhost
        ServerAlias localhost
        <Directory "C:/xampp/htdocs">
            Options Indexes FollowSymLinks Includes ExecCGI
            Order allow,deny
            Allow from all
        </Directory>
    </VirtualHost>
{% endhighlight %}

5) For any additional virtual host, add the code to the bottom of the above file. For example, I want to setup a virtual host ‘testhost’ at D:\websites\
	{% highlight bash %}
	    <VirtualHost *>
	        ServerAdmin admin@localhost.com
	        DocumentRoot "D:\website"
	        ServerName testhost
	        ServerAlias testhost
	        <Directory "D:\website">
	            Order allow,deny
	            Allow from all
	        </Directory>
	    </VirtualHost>
	{% endhighlight %}
Don’t forget to save the httpd-vhosts.conf file.

6) Now we have to set the IP for virtual host. For that, open Windows hosts file (C:\Windows\System32\drivers\etc\hosts) with a text editor.

7) Find the following lines in hosts file:
{% highlight bash %}
# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
{% endhighlight %}
add the virtual host ip as same as localhost after that line.
{% highlight bash %}
# localhost name resolution is handled within DNS itself.
	127.0.0.1       localhost
	127.0.0.1       testhost #this is the virtual host name
{% endhighlight %}


8) Restart Apache and type ‘testhost‘ in addressbar of browser. You can see your website running in the new virtual host!
