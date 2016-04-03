---
layout: post
title:  "Daemonizing processes in OSX"
date:   2015-09-24 23:35:00
categories: blog
blurb: "Experiments"
theme1: '#AE448A'
theme2: '#5879CF'
---

Processes such as `redis` and `mongodb` have to be started manually each time after system restart on *Mac* and they occupy a terminal instance each. Daemonizing them will make the process to start automatically & without the need for a dedicated terminal.

There are two ways to daemonize a process in osx:

1. Agents
2. Daemons

Both of which are managed by [Launchd](https://en.wikipedia.org/wiki/Launchd) process running on osx.

The main difference between Agents & Daemons (:P Dan Brown) on osx is the time when process is executed.
A Daemon process is executed as soon as the os is booted up whereas Agents are executed when a user has logged on.

Behaviour of Daemon/Agent is specified in a XML file called property list (.plist). Depending on where it is stored it will be treated as a Daemon or an Agent.

Here is the demonstration of **creating Mongodb as a daemon in OSX (10.9.5) via User Agent**. I am making it as a User Agent because I wanted to make it specific to the user.

####Setting up MongoDB:
1. Download [MongoDB](https://www.mongodb.org/)

2. Unzip & copy files:

    ```bash
    tar -xf mongodb-osx-x86_64-3.0.6.tgz
    cd mongodb-osx-x86_64-3.0.6
    sudo cp bin/* /usr/local/bin
    ```

3. Create config file at `~/etc/mongo/mongod.conf`. ([Check out configuration options](http://docs.mongodb.org/manual/reference/configuration-options/)). Here is a sample config file:

    ```yaml
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
    ```

4. Create DB folder `~/var/mongo/` and logs folder `~/logs/mongo/`

####Creating User Agent:
1. Create `~/Library/LaunchAgents/mongodb.plist`.

    ```xml
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
    ```

2. Load agent job:

    ```bash
    launchctl load ~/Library/LaunchAgents/mongo.plist
    ```

3. To check if the daemon/agent already exists:

    ```bash
    launchctl list | grep "mongo"
    ```

4. Start the agent job:

    ```bash
    launchctl start mongod
    ```

5. Ensure if the user agent is running:

    ```bash
    ps aux | grep mongod
    ```

#####Reference:
[http://launchd.info/](http://launchd.info/)

