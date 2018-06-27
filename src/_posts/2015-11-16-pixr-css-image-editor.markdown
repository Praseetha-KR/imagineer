---
layout: post
title:  "Pixr - CSS image editor"
date:   2015-11-16 03:35:00
tags:
    - css
    - experiment
    - web
blurb: "Image effects with CSS filters & blend modes"
image: "/assets/img/media/demo_pixr.jpg"
theme: '#DF816A'
---
I'm definitely late to the party! though it is better than not to show up at all 😎

There are a ton of articles on internet about the *moderately latest* CSS properties such as `filter`, `background-blend-mode` and `mix-blend-mode`. Neglecting the fact that it is not possible to use these features in production apps in near future (due to lack of old browsers support), I just wanted to look how it works.

### tl;dr
<a class="btn btn-theme" href="http://praseetha-kr.github.io/pixr/" target="_blank">Pixr - CSS Image Editor</a>

## filter

Applies different filters on top of image. [Browser support](http://caniuse.com/#search=filter)


| Filter function   | value type        | value range                        |
|-------------------|-------------------|------------------------------------|
| blur()                | length                | length in *px*                     |
| hue-rotate()      | angle             | 0deg - 360deg                      |
| opacity()         | number/percentage | 0% - 100% *or* +ve number          |
| grayscale()           | number/percentage | 0% - 100% *or* +ve number          |
| sepia()               | number/percentage | 0% - 100% *or* +ve number          |
| invert()          | number/percentage | 0% - 100% *or* +ve number          |
| saturate()            | number/percentage | 0% - (any number)% *or* +ve number |
| brightness()      | number/percentage | 0% - (any number)% *or* +ve number |
| contrast()            | number/percentage | 0% - (any number)% *or* +ve number |

<br>Eg:

```css
.image {
    -webkit-filter: blur(2px) saturate(110%);
    filter: blur(2px saturate(110%));
}
```

## background-blend-mode
Background image is blended with background color of the same element. [Browser support](http://caniuse.com/#search=background-blend-mode)

<br>Eg:

```css
.bg-image {
    background-image: url('img.jpg');
    background-color: deeppink;
    background-blend-mode: multiply;
}
```

## mix-blend-mode
A div is blended on top of another div with background image. [Browser support](http://caniuse.com/#search=mix-blend-mode)

<br>Eg:

```css
.bg-image {
    background-image: url('img.jpg');
    background-color: deeppink;
}
.overlay-div {
    width: 400px;
    height: 300px;
    background-color: yellow;
    mix-blend-mode: lighten;
}
```

| background-blend-mode & mix-blend-mode values |
|-----------------------|
| normal                     |
| multiply               |
| screen                     |
| overlay                |
| darken                     |
| lighten                |
| color-dodge            |
| color-burn                 |
| hard-light                 |
| soft-light                 |
| difference                 |
| exclusion                  |
| hue                        |
| saturation                 |
| luminosity                 |


### Here is a demo for all these three properties.
<a class="btn btn-theme" href="http://praseetha-kr.github.io/pixr/" target="_blank">Pixr - CSS Image Editor</a>
