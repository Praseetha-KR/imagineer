---
title: "Reveal your Terminal’s most used Commands"
slug: reveal-your-terminals-most-used-commands
date: 2011-09-11 09:45:00
tags:
    - linux
blurb: "Check top 10 most-used commands in terminal"
theme: "#363C40"
title_color: "#999"
luminance: light
---

This small piece of code lets you know the top 10 most-used commands in terminal.

```console
$ history | awk ‘{print $2}’| sort | uniq -c | sort -rn | head -10
```

We can also do the same using the following code:

```console
$ cut -d\  -f 1 ~/.bash_history | sort | uniq -c | sort -rn | head -n 10 | sed ‘s/.*/  &/g’
```
