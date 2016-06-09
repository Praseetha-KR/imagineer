---
layout: post
title:  "Understanding the working of browsers"
date:   2015-04-26 11:21:00
categories: blog
blurb: "A brief note on the basic internal working of web browsers"
theme: '#E3A976'
---

Recently I have read about the basic internal working of web browsers. Here is a brief note on it.

Web browsers are the application softwares intended to request web resources from the server and display it on client machine screen. *Web resources* can be markup documets, pdf or image files. They are located on the internet using <abbr title="Uniform Resource Identifier">URI</abbr>.

A browser have the following main parts:

1. User interface window
2. Web browser engine
3. Networking
4. Javascript engine
5. UI backend
6. Data storage


### 1. User Interface Window
The major components of browser interface include:

- **Address bar**: to input the web address (URI)
- **Content window**: to display the loaded resource
- **Reload and Stop buttons**: to re-load the web resource or to stop its loading
- **Back and Forward buttons**: to navigate between recently loaded pages
- **Bookmark**: option to save the URI for later reference

### 2. Web Browser Engine (Layout engine or Rendering engine)
It takes marked up content (such as HTML, XML, image files, etc.) and formatting information (such as CSS, XSL, etc.) from the networking layer, parse it and then displays the formatted content on the screen.

Parsing includes tokenization and parse tree (DOM tree and render tree) formation, which is followed by layout and paint events on the content window.

Here is a list of recent browser engines:

- **Blink**: Google Chrome, Opera
- **Gecko**: Firefox
- **Trident**: Internet Explorer
- **Webkit**: Safari

Chrome runs multiple instances of rendering engine one for each tab. (Each tab runs a separate process).

### 3. Networking
Responsible for network calls such as HTTP requests, REST etc.

### 4. Javascript Engine
It interprets and executes javascript.
List of js engines:

- **V8**: Google Chrome
- **Spidermonkey and Rhino**: Firefox
- **Chakra**: Internet Explorer
- **JavaScriptCore**: Safari

### 5. UI Backend
This draws OS specific widgets such as input fields, windows, combo boxes etc.

### 6. Data Storage
It is a small database saved on client computer which store cache, cookies, etc. Browsers support storage mechanisms such as localStorage, IndexedDB, WebSQL and FileSystem.

Here is an illustration of these processes:
<figure>
    <img src="/assets/img/posts/browser.jpg" width="100%" alt="Browser working">
    <figcaption>Working of browser</figcaption>
</figure>
