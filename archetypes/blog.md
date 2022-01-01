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
    preview:
        png: ""
        webp: ""
    main:
        png: ""
        webp: ""
        overlap: "0"
draft: true
---

Test
