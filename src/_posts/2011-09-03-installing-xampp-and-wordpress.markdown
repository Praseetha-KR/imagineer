---
layout: post
title:  "Installing XAMPP and WordPress"
date:   2011-09-03 12:45:00
categories: blog, opensource, web
blurb: "Notes on setting up XAMPP server and WordPress in windows laptop"
theme: '#A27B56'
---

The easiest way to setup a website and to test it before publishing to web is using XAMPP and WordPress.

XAMPP combines many different sofware packages like Apache, MySQL, PHP, Perl, FileZilla FTP server etc. into a single package.

WordPress is a tool with which we can create a beautiful website or blog.

* To download xampp, click <a href="http://www.apachefriends.org/en/xampp.html">here</a>.

* Xampp is available as installer and zip file.

	a. In the case of installer, simply run that .exe file according to directions. Then run xampp control panel from desktop shortcut or from start menu.

	b. If it is a zip archive, first extract all files and place it in your computer’s root directory in xampp folder (eg: C:\xampp\). Then click `setup_xampp.bat`.

	Once you have the success message, click `xampp-control.exe` to get the xampp control panel.

* Start `Apache` and `MySQL` services from xampp control panel.

	<img src="http://i844.photobucket.com/albums/ab6/voidimagineer/xampp-control-panel_zpse1a921d7.jpg" class="small-img" alt="XAMPP Control Panel">

* In your browser, enter the address `http://localhost/xampp/splash.php` and select language.

* Now select phpMyAdmin from Tools. To create a new database, type the database name(eg: ‘wordpress‘) and press ‘create‘ button.

	Xampp is almost ready now.

* Now to download WordPress, click <a href="http://wordpress.org/download/">here</a>

* Extract zip file and place the wordpress folder in Root directory > Xampp > htdocs. (eg: `C:\xampp\htdocs\wordpress`)

* Open `wp-config-sample.php`. You can see code like this:

{% highlight php %}

/** The name of the database for WordPress */
define(‘DB_NAME’, ‘database_name_here’);

/** MySQL database username */
define(‘DB_USER’, ‘username_here’);

/** MySQL database password */
define(‘DB_PASSWORD’, ‘password_here’);

/** MySQL hostname */
define(‘DB_HOST’, ‘localhost’);
{% endhighlight %}

Now edit the file like this:

{% highlight php %}
define(‘DB_NAME’, ‘wordpress’);

define(‘DB_USER’, ‘root’);

define(‘DB_PASSWORD’, ”);

define(‘DB_HOST’, ‘localhost’);
{% endhighlight %}

save this file as `wp-config.php`.

(More details on editing wp-config-sample.php is <a href="http://codex.wordpress.org/Editing_wp-config.php">here</a>)

* Now go to `http://localhost/wordpress/wp-admin/install.php` and give required fields there. After login you can see wordpress dashboard. There you can add posts or pages to your site from there, can add plugins or chage themes and a lot more!!! everything from there should run smoothly!

* To view your site, go to `http://localhost/wordpress/`

this site will be seen only on your computer. So, you can modify it according to your wish. After all changes, when your site is ready for publishing,

a. Buy a domain to your site

b. Find a server for hosting, create a database in it and upload the contents of ‘htdocs‘ folder

Enjoy the power of WordPressing!
