---
layout: post
title:  "Reveal your Terminal’s most used Commands"
date:   2011-09-11 09:45:00
categories: blog, opensource
---

This small piece of code lets you know the top 10 most-used commands in terminal.

`history | awk ‘{print $2}’| sort | uniq -c | sort -rn | head -10`

We can also do the same using the following code:

`cut -d\  -f 1 ~/.bash_history | sort | uniq -c | sort -rn | head -n 10 | sed ‘s/.*/  &/g’`