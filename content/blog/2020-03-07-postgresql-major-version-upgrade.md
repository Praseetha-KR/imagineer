---
title: "Migrating the data for PostgreSQL major version upgrade"
slug: postgresql-major-version-upgrade
date: 2020-03-07 01:26:00
tags:
    - database
    - devops
blurb: "How to upgrade postgres databases from version 9.6 to 12 in Ubuntu"
theme: "#2b3544"
title_color: "#6695bb"
luminance: light
graphic:
    preview:
        png: "/images/posts/postgres-upgrade/preview.png"
        webp: "/images/posts/postgres-upgrade/preview.webp"
    main:
        png: "/images/posts/postgres-upgrade/main.png"
        overlap: "3.8"
---

PostgreSQL databases can be migrated without doing database dump-and-restore.
Here are the steps to migrate from Postgres 9.6 to 12 in Ubuntu 18.04
<br>

### Existing PostgreSQL 9.6

Let's first check the list of installed postgres related packages, service status and the running cluster details.

##### Packages list:

```console
$ dpkg -l | grep postgres
pgdg-keyring                2018.2                  all     keyring for apt.postgresql.org
postgresql-9.6              9.6.17-2.pgdg18.04+1    amd64   object-relational SQL database, version 9.6 server
postgresql-client-9.6       9.6.17-2.pgdg18.04+1    amd64   front-end programs for PostgreSQL 9.6
postgresql-client-common    213.pgdg18.04+1         all     manager for multiple PostgreSQL client versions
postgresql-common           213.pgdg18.04+1         all     PostgreSQL database-cluster manager
postgresql-contrib-9.6      9.6.17-2.pgdg18.04+1    amd64   additional facilities for PostgreSQL
```

##### Service:
```console
$ systemctl list-dependencies postgresql
postgresql.service
● ├─postgresql@9.6-main.service
● ├─system.slice
● └─sysinit.target
●   ├─ ...
```

##### Cluster:
```console
$ pg_lsclusters
Ver Cluster Port    Status  Owner       Data directory                  Log file
9.6 main    5432    online  postgres    /var/lib/postgresql/9.6/main    /var/log/postgresql/postgresql-9.6-main.log
```
<br>
<hr>

### Installig PostgreSQL 12

Multiple versions of postgres can co-exist in a system.

##### Installation:

<div class="post__block post__block--2 post__block--right">
    <div class="post__block__center">
    Install postgres 12 via apt (<a href="https://www.postgresql.org/download/linux/ubuntu" target="_blank">postgresql.org/download/linux/ubuntu</a>)
    </div>
    <div class="post__block__side">
        <div class="sideblock sideblock--right">
            <div class="annotation">* note that apt repo is already added during istallation of the existing version</div>
        </div>
    </div>
</div>

```console
$ cat /etc/apt/sources.list.d/pgdg.list
deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main
```

```console
$ wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
$ apt-get update
$ apt-get install postgresql-12
```
Postgres 12 cluster will start automatically after the installation.


##### Verify status:

You'll be seeing version 12 in packages list:
```console
$ dpkg -l | grep postgres
pgdg-keyring                2018.2                  all     keyring for apt.postgresql.org
postgresql-12               12.2-2.pgdg18.04+1      amd64   object-relational SQL database, version 12 server
postgresql-9.6              9.6.17-2.pgdg18.04+1    amd64   object-relational SQL database, version 9.6 server
postgresql-client-12        12.2-2.pgdg18.04+1      amd64   front-end programs for PostgreSQL 12
postgresql-client-9.6       9.6.17-2.pgdg18.04+1    amd64   front-end programs for PostgreSQL 9.6
postgresql-client-common    213.pgdg18.04+1         all     manager for multiple PostgreSQL client versions
postgresql-common           213.pgdg18.04+1         all     PostgreSQL database-cluster manager
postgresql-contrib-9.6      9.6.17-2.pgdg18.04+1    amd64   additional facilities for PostgreSQL
```

Services:
```console
$ systemctl list-dependencies postgresql
postgresql.service
● ├─postgresql@12-main.service
● ├─postgresql@9.6-main.service
● ├─system.slice
● └─sysinit.target
●   ├─...
```

Clusters:
```console
$ pg_lsclusters
Ver Cluster Port    Status  Owner       Data directory                  Log file
9.6 main    5432    online  postgres    /var/lib/postgresql/9.6/main    /var/log/postgresql/postgresql-9.6-main.log
12  main    5433    online  postgres    /var/lib/postgresql/12/main     /var/log/postgresql/postgresql-12-main.log
```

Version 12 cluster will be running along with version 9.6.

<br>

<hr>

### Upgrading PostgreSQL 9.6 to 12

##### pg_upgrade command format
To perform upgrade we will be using `pg_upgrade` which comes along with postgres package. Usage format is as follows:

```txt
<target_version_pg_upgrade> \
    -b <source_version_binary_dir> \
    -B <target_version_binary_dir> \
    -d <source_version_config_dir> \
    -D <source_version_config_dir>
```

##### Get directory paths of binary & config

Binary & config directory paths required for this command can be obtained from the respective version's service status:

```console
$ systemctl status postgresql@9.6-main
● postgresql@9.6-main.service - PostgreSQL Cluster 9.6-main
   ...
   CGroup: /system.slice/system-postgresql.slice/postgresql@9.6-main.service
           ├─2469 /usr/lib/postgresql/9.6/bin/postgres
                -D /var/lib/postgresql/9.6/main
                -c config_file=/etc/postgresql/9.6/main/postgresql.conf
           ├─...
```
```console
$ systemctl status postgresql@12-main
● postgresql@12-main.service - PostgreSQL Cluster 12-main
   ...
   CGroup: /system.slice/system-postgresql.slice/postgresql@12-main.service
           ├─2469 /usr/lib/postgresql/12/bin/postgres
                -D /var/lib/postgresql/12/main
                -c config_file=/etc/postgresql/12/main/postgresql.conf
           ├─...
```
As you can see, here the binary dir is `/usr/lib/postgresql/<version>/bin` and config dir is `/etc/postgresql/9.6/main`.


##### Stop clusters
Stop both servers before proceeding:
```console
sudo pg_ctlcluster 9.6 main stop
sudo pg_ctlcluster 12 main stop
```


##### Run upgrade
Now run `pg_upgrade` (example shown uses the default postgres user)

```console
$ su - postgres
postgres@istance:~$ /usr/lib/postgresql/12/bin/pg_upgrade \
    -b /usr/lib/postgresql/9.6/bin \
    -B /usr/lib/postgresql/12/bin \
    -d /etc/postgresql/9.6/main \
    -D /etc/postgresql/12/main \
    --verbose
```
The data migration will take time to complete.

<br>

<hr>

### Shutting down the old cluster, making the new cluster as the default

##### Switch ports

9.6 is currently configured to run on port 5432 and 12 in 5433. This need to be switched:

```console
$ vim /etc/postgresql/9.6/main/postgresql.conf

...
port = 5432 # <-- change to 5433
...
```
```console
$ vim /etc/postgresql/12/main/postgresql.conf

...
port = 5433 # <-- change to 5432
...
```

Veriy chages:
```console
$ grep -H '^port' /etc/postgresql/*/main/postgresql.conf
/etc/postgresql/12/main/postgresql.conf:port = 5432
/etc/postgresql/9.6/main/postgresql.conf:port = 5433
```

##### Start the new cluster
At this point both clusters are not running. We can start version 12 alone.
```console
sudo pg_ctlcluster 12 main start
```

```console
$ pg_lsclusters
Ver Cluster Port Status Owner    Data directory               Log file
9.6 main    5433 down   postgres /var/lib/postgresql/9.6/main /var/log/postgresql/postgresql-9.6-main.log
12  main    5432 online postgres /var/lib/postgresql/12/main  /var/log/postgresql/postgresql-12-main.log
```

##### Verify
The migration has completed, verify whether `psql` connects to the version 12 cluster by default:

```console
$ su - postgres
postgres@istance:~$ psql
psql (12.2 (Ubuntu 12.2-2.pgdg18.04+1))
Type "help" for help.

postgres=#
```

🎉
