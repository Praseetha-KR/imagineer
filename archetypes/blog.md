---
title: "{{ replace (substr .Name 11) "-" " " | title }}"
slug: {{ substr .Name 11 }}
date: {{ substr .Name 0 10 }} 00:00:00
tags:
    - web
blurb: ""
theme: "#212285"
title_color: "#3B60ED"
luminance: light
graphic:
    url: ""
    overlap: "7"
draft: true
---

Test
