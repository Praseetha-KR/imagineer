---
layout: post
title:  "CSS Data Types"
date:   2016-03-07 01:23:45
tags:
    - css
    - web
blurb: "A note on CSS data types"
theme: '#69B869'
---

Here is a quick reference for CSS data types:

<table class="css-table">
    <thead>
        <tr>
            <th width="170">data type</th>
            <th>description, values/units, remark, example</th>
        </tr>
    </thead>
    <tbody>
        <!-- angle -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;angle&gt;</td>
            <td class="fill-desc"><em>degree of rotation</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>deg, rad, grad, turn</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">360 deg = 400 grad = 2π radian = 1 turn</td>
        </tr>
        <tr>
            <td class="fill-eg"><code>transform: rotate(45deg)</code></td>
        </tr>

        <!-- basic-shape -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;basic-shape&gt;</td>
            <td class="fill-desc"><em>functions to define shapes</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>inset(), polygon(), circle(), ellipse()</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">
                <code>inset(&lt;shape-arg&gt;{1,4} [round &lt;border-radius&gt;]?)</code><br> <code>polygon([&lt;fill-rule&gt;,]? [&lt;shape-arg&gt; &lt;shape-arg&gt;]#)</code><br> <code>circle([&lt;shape-radius&gt;]? [at &lt;position&gt;]?)</code><br> <code>ellipse([&lt;shape-radius&gt;{2}]? [at &lt;position&gt;]?)</code><br>
                where: <code>&lt;shape-arg&gt; = &lt;length&gt; &#124; &lt;percentage&gt;, &lt;shape-radius&gt; = &lt;length&gt; &#124; &lt;percentage&gt; &#124; closest-side &#124; farthest-side</code></td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>shape-outside: inset(100px 100px 100px 100px);</code><br>
                <code>shape-outside: polygon(0 0, 0 100%, 100% 100%);</code><br>
                <code>shape-outside: circle(40%)</code>
            </td>
        </tr>

        <!-- blend-mode -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;blend-mode&gt;</td>
            <td class="fill-desc"><em>calculating the final color value of a pixel when layers overlap</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, hue, saturation, color, luminosity</strong></td>
        </tr>
        <!-- <tr>
            <td class="fill-remark"></td>
        </tr> -->
        <tr>
            <td class="fill-eg">
                <code>background-blend-mode: color;</code><br>
                <code>mix-blend-mode: multiply;</code>
            </td>
        </tr>

        <!-- color -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;color&gt;</td>
            <td class="fill-desc"><em>denotes a color in the sRGB color space</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>&lt;keyword&gt;, #hex, #hexdec, rgb(), rgba(), hsl(), hsla(), transparent, currentcolor</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">RGB cubic-coordinate system: #hex, rgb(), rgba()<br>HSL cylindrical-coordinate system: hsl(), hsla()<br>currentcolor is similar to inherit keyword</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>color: rebeccapurple;</code><br>
                <code>color: hsla(240,100%,50%,0.05);</code><br>
                <code>background: currentcolor;</code>
            </td>
        </tr>

        <!-- custom-ident -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;custom-ident&gt;</td>
            <td class="fill-desc"><em>identifier token created by the stylesheet author to reference content in a different part of the stylesheet.</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>&lt;identifier&gt;</strong></td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>counter-increment: h1-counter; content: counter(h1-counter);</code><br>
                <code>counter-reset: subSectionCounter;</code><br>
                <code>@keyframes colorChange {…}</code>
            </td>
        </tr>

        <!-- frequency -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;frequency&gt;</td>
            <td class="fill-desc"><em>denotes a frequency dimension</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>Hz, kHz</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">Introduced in CSS2 to define pitch of voice for aural media, deprecated since then. Reintroduced in CSS3, though none of the css properties are using this at the moment.</td>
        </tr>

        <!-- gradient -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;gradient&gt;</td>
            <td class="fill-desc"><em>CSS &lt;image&gt; made of a progressive transition between two or more colors</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>linear-gradient(), radial-gradient(), repeating-linear-gradient()</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">A CSS gradient is not a CSS &lt;color&gt; but an image with no intrinsic dimensions</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>background: linear-gradient(to right,red,orange,yellow, green, blue,indigo,violet);</code><br>
                <code>background: radial-gradient(red, yellow, rgb(30, 144, 255));</code><br>
                <code>repeating-linear-gradient(to top left, red, red 5px, white 5px, white 10px);</code>
            </td>
        </tr>

        <!-- image -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;image&gt;</td>
            <td class="fill-desc"><em>represents 2D image</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>url(), linear-gradient(), element()</strong></td>
        </tr>
        <tr>
            <td class="fill-remark"><ul><li>intrinsic dimensions: .jpg, .png, etc.</li><li>several intrinsic dimensions: .ico</li><li>no intrinsic dimension, but with intrinsic aspect ratio: SVG</li><li> neither intrinsic dimensions, nor an intrinsic aspect ratio: CSS gradient</li></ul>Used in background-image, list-style-image, border-image, cursor & content</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>url(img.jpg);</code><br>
                <code>linear-gradient(to bottom, tomato, seagreen);</code><br>
                <code>relement(#elementid);</code>
            </td>
        </tr>

        <!-- integer -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;integer&gt;</td>
            <td class="fill-desc"><em>denotes an +/- integer number</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>[+-]?&lt;number&gt;</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">used in properties like z-index, counter-increment, column-count, etc.</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>counter-increment: count1 count2 -6;</code><br>
                <code>column-count: 3;</code><br>
                <code>z-index: -2;</code>
            </td>
        </tr>

        <!-- length -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;length&gt;</td>
            <td class="fill-desc"><em>denotes distance measurements</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>em, ex, ch, rem, vh, vw, vmin, vmax, px, mm, cm, in, pt, pc</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">
                Font-relative:
                <li>em: calculated font size</li>
                <li>ex: font's x-height</li>
                <li>ch: width of glyph '0'</li>
                <li>rem: font-size of root element</li>
                Viewport percentage:
                <li>vh: viewport height / 100</li>
                <li>vw: viewport width / 100</li>
                <li>vmin: min(viewport height, viewport width) / 100</li>
                <li>vmax: max(viewport height, viewport width) / 100</li>
                Absolute units:
                <li>px: relative to device</li>
                <li>pt: 1/72 inch</li>
                <li>pc: 12 pt = 1 pica</li>
            </td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>border-width: 0.2ch;</code><br>
            </td>
        </tr>

        <!-- number -->
        <tr>
            <td rowspan="2" class="fill-key">&lt;number&gt;</td>
            <td class="fill-desc"><em>integer/fractional number</em></td>
        </tr>

        <tr>
            <td class="fill-eg">
                <code>cubic-bezier(2.45, 0.6, 4, 0.1);</code><br>
                <code>left: -1e+7px;</code>
            </td>
        </tr>

        <!-- percentage -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;percentage&gt;</td>
            <td class="fill-desc"><em>percentage values</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>&lt;number&gt;%</strong></td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>font-size: 200%;</code>
            </td>
        </tr>

        <!-- position -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;position&gt;</td>
            <td class="fill-desc"><em>coordinate in a 2D space used to set a location relative to a box</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>top, bottom, center, left, right, &lt;percentage&gt;, &lt;length&gt;</strong></td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>background-position: center 80%;</code>
            </td>
        </tr>

        <!-- ratio -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;ratio&gt;</td>
            <td class="fill-desc"><em>describe aspect ratio in media queries</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>&lt;integer&gt;/&lt;integer&gt;</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">used in media queries</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>@media screen and (device-aspect-ratio: 1280/720) { … }</code>
            </td>
        </tr>

        <!-- resolution -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;resolution&gt;</td>
            <td class="fill-desc"><em>denotes the pixel density of an output device</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>dpi, dpcm, dppx</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">used in media queries</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>@media print and (min-resolution: 300dpi) { … }</code>
            </td>
        </tr>

        <!-- shape -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;shape&gt;</td>
            <td class="fill-desc"><em>denotes the specific form of a region</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>rect()</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">rect(top, right, bottom, left) produces a rectangular region</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>clip: rect(10px, 20px, 20px, 10px);</code>
            </td>
        </tr>

        <!-- string -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;string&gt;</td>
            <td class="fill-desc"><em>represents a string</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>&lt;Unicode characters delimited by " or '&gt;</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">multiline escaping by \ or \A</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>content: "Awesome string with \Aline break";</code>
            </td>
        </tr>

        <!-- time -->
        <tr>
            <td rowspan="3" class="fill-key">&lt;time&gt;</td>
            <td class="fill-desc"><em>time dimensions</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>s, ms</strong></td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>animation-duration: 0.5s;</code>
            </td>
        </tr>

        <!-- timing-function -->
        <tr>
            <td rowspan="4" class="fill-key">&lt;timing-function&gt;</td>
            <td class="fill-desc"><em>a mathematical function that describes how fast one-dimensional values change during transitions or animations</em></td>
        </tr>
        <tr>
            <td class="fill-val"><strong>cubic-bezier(), steps(), linear, ease, ease-in, ease-out, ease-in-out, step-start, step-end</strong></td>
        </tr>
        <tr>
            <td class="fill-remark">multiline escaping by \ or \A</td>
        </tr>
        <tr>
            <td class="fill-eg">
                <code>transition-timing-function: ease-in-out;</code><br>
                <code>animation-timing-function: steps(4, end);</code><br>
                <code>animation-timing-function: cubic-bezier(0.1, 0.7, 1.0, 0.1);</code><br>
            </td>
        </tr>
    </tbody>
</table>
