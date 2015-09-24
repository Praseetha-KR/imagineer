---
layout: post
title:  "Daemonizing processes in OSX"
date:   2015-09-24 23:35:00
categories: blog
blurb: "Experiments"
---

Processes such as `redis` and `mongodb` have to be started manually each time after system restart and they occupy a terminal instance each. Daemonizing them will make the process to start automatically & without need for a dedicated terminal.

Daemon is a computer program that runs as a background process. Daemon is executed while booting. User agent is similar to daemon, but it is acting on behalf of the logged in user instead of root user.

Behaviour of daemon/agent is specified in a XML file called property list (.plist). Depending on where it is stored it will be treated as a daemon or an agent.

I have created it as agent because I wanted to make it specific to the user. Here is the demonstration of **creating mongodb as a daemon in OSX (10.9.5)**:

####Setting up mongodb:
1) Download [MongoDB](https://www.mongodb.org/)

2) Unzip & copy files:
{% highlight bash %}
tar -xvf mongodb-osx-x86_64-3.0.6.tgz
cd mongodb-osx-x86_64-3.0.6
cp bin/* /usr/local/bin
{% endhighlight %}

<br>Test if everything works fine: `mongo --version`

3) Create config file at `~/etc/mongo/mongod.conf`. ([Check out configuration options](http://docs.mongodb.org/manual/reference/configuration-options/)). Here is a sample config file:

{% highlight yaml %}
systemLog:
    path: "/Users/username/logs/mongo/mongo.log"
    logAppend: true
    destination: file
net:
    ipv6: true
    http:
        enabled: true
        RESTInterfaceEnabled: true
storage:
    dbPath: "/Users/username/var/mongo"
{% endhighlight %}
<br>
4) Create DB folder `~/var/mongo/` and logs folder `~/logs/mongo/`

####Creating Daemon/UserAgent:
1) Create `~/Library/LaunchAgents/mongodb.plist`. (or, `~/Library/LaunchDaemons/mongodb.plist` for daemon)

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>mongod</string>
        <key>ProgramArguments</key>
        <array>
            <string>/usr/local/bin/mongod</string>
            <string>--config</string>
            <string>/Users/username/etc/mongo/mongod.conf</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>StandardErrorPath</key>
        <string>/Users/username/logs/mongo/mongo_stderr.log</string>
        <key>StandardOutPath</key>
        <string>/Users/username/logs/mongo/mongo_stdout.log</string>
    </dict>
</plist>
{% endhighlight %}
<br>
2) To check if the daemon/agent already exists:
{% highlight bash %}
launchctl list | grep "mongo"
{% endhighlight %}
<br>
3) Load & start agent job:
{% highlight bash %}
launchctl load ~/Library/LaunchAgents/mongo.plist
launchctl start mongod
{% endhighlight %}
<br>
Ensure if the user agent is running:
{% highlight bash %}
ps aux | grep mongod
{% endhighlight %}
<br>

#####Reference:
[http://launchd.info/](http://launchd.info/)

