---
title: "Math behind blend modes"
slug: math-behind-blend-modes
date: 2016-03-11 02:03:30
tags:
    - web
    - css
    - concepts
blurb: "Implements blend modes generetor in Javascript"
image: "/images/posts/porter-duff-compositing/subpixel_regions.png"
theme: "#9356b9"
title_color: "#f3e9f5"
luminance: dark
---

Ever since I dabbled around [css blend modes](https://imagineer.in/blog/pixr-css-image-editor/), I wanted to look into the math behind it.

## Compositing in CSS
Compositing is <strong>combining separate visual elements into a single image</strong>. There have been 2 types of compositing techniques used in CSS so far.

<table>
    <thead>
        <tr>
            <th width="50%">Simple Alpha Compositing</th>
            <th>Porter-Duff Compositing <a href="http://keithp.com/~keithp/porterduff/" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white"><!-- Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"/></svg></a></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Mixing effect is obtained by <strong>overlapping</strong> of transparent layers</td>
            <td>Colors are mixed by <strong>blending functions</strong> and resultant region is obtained by Porter-Duff <em>source-over</em> operator</td>
        </tr>
        <tr>
            <td>Used by old versions of CSS</td>
            <td>Used in CSS3<sup>*</sup></td>
        </tr>
    </tbody>
</table>

## Porter-Duff Compositing
When 2 pixels get combined, 4 subpixel regions are formed:

   - Region where only source is present
   - only destination is present
   - both are present
   - neither is present (always empty)

<div class="p-2-v">
    <img src="/images/posts/porter-duff-compositing/subpixel_regions.png" alt="Porter-Duff Compositing subpixel regions" class="half-width centered">
</div>

There are 12 of operators which decides the behaviour in these regions.

<table class="m-1-v table-striped">
    <thead>
        <tr>
            <th colspan="6">Porter-Duff Operations (source S on backdrop B)</th>
        </tr>
        <tr>
            <td width="2%">No.</td>
            <td width="25%">Operation</td>
            <td width="25%">Quadraple</td>
            <td width="8%">Diagram</td>
            <td width="20%">F<sub>S</sub></td>
            <td width="20%">F<sub>B</sub></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>Clear</td>
            <td>(0,0,0,0)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/clear.png" alt="Porter-Duff Compositing Clear operation"></td>
            <td>0</td>
            <td>0</td>
        </tr>
        <tr>
            <td>2</td>
            <td>S</td>
            <td>(0,S,0,S)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s.png" alt="Porter-Duff Compositing S operation"></td>
            <td>1</td>
            <td>0</td>
        </tr>
        <tr>
            <td>3</td>
            <td>B</td>
            <td>(0,0,B,B)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/b.png" alt="Porter-Duff Compositing B operation"></td>
            <td>1</td>
            <td>0</td>
        </tr>
        <tr class="fill-white">
            <td>4</td>
            <td>S over B</td>
            <td>(0,S,B,S)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s_over_b.png" alt="Porter-Duff Compositing S over B operation"></td>
            <td>1</td>
            <td>1 - α<sub>S</sub></td>
        </tr>
        <tr>
            <td>5</td>
            <td>B over S</td>
            <td>(0,S,B,B)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/b_over_s.png" alt="Porter-Duff Compositing B over S operation"></td>
            <td>1 - α<sub>B</sub></td>
            <td>1</td>
        </tr>
        <tr>
            <td>6</td>
            <td>S in B</td>
            <td>(0,0,0,S)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s_in_b.png" alt="Porter-Duff Compositing S in B operation"></td>
            <td>α<sub>B</sub></td>
            <td>0</td>
        </tr>
        <tr>
            <td>7</td>
            <td>B in S</td>
            <td>(0,0,0,B)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/b_in_s.png" alt="Porter-Duff Compositing B in S operation"></td>
            <td>0</td>
            <td>α<sub>S</sub></td>
        </tr>
        <tr>
            <td>8</td>
            <td>S out B</td>
            <td>(0,S,0,0)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s_out_b.png" alt="Porter-Duff Compositing S out B operation"></td>
            <td>1 - α<sub>B</sub></td>
            <td>0</td>
        </tr>
        <tr>
            <td>9</td>
            <td>B out S</td>
            <td>(0,0,B,0)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/b_out_s.png" alt="Porter-Duff Compositing B out S operation"></td>
            <td>0</td>
            <td>1 - α<sub>S</sub></td>
        </tr>
        <tr>
            <td>10</td>
            <td>S atop B</td>
            <td>(0,0,B,S)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s_atop_b.png" alt="Porter-Duff Compositing S atop B operation"></td>
            <td>α<sub>B</sub></td>
            <td>1 - α<sub>A</sub></td>
        </tr>
        <tr>
            <td>11</td>
            <td>B atop S</td>
            <td>(0,S,0,B)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/b_atop_s.png" alt="Porter-Duff Compositing B atop S operation"></td>
            <td>1 - α<sub>B</sub></td>
            <td>α<sub>S</sub></td>
        </tr>
        <tr>
            <td>12</td>
            <td>S xor B</td>
            <td>(0,S,B,0)</td>
            <td class="nopad nopush"><img src="/images/posts/porter-duff-compositing/s_xor_b.png" alt="Porter-Duff Compositing S xor B operation"></td>
            <td>1 - α<sub>B</sub></td>
            <td>1 - α<sub>S</sub></td>
        </tr>
    </tbody>
</table>

<div>
<blockquote>CSS is using the Souce over Backdrop operation (4th entry in the table above) for blend modes.</blockquote>
</div>

Color obtained from compositing source color Cs and backdrop color Cb is given by general Porter Duff equation:

``` bash
co = αs x Fs x Cs + αb x Fb x Cb
αo = αs x 1 + αb x (1 – αs)
```


## Blending
Blending is the aspect of compositing that calculates the mixing of colors where the source element and backdrop overlap.

``` bash
Cr = (1 - αb) x Cs + αb x B(Cb, Cs)
```
where B(Cb, Cs) is the blending function.

<table>
    <thead>
        <tr>
            <th>Blend mode</th>
            <th>Calculation</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>normal</td>
            <td><pre>B(Cb, Cs) = Cs</pre></td>
        </tr>
        <tr>
            <td>multiply</td>
            <td><pre>B(Cb, Cs) = Cb x Cs</pre></td>
        </tr>
        <tr>
            <td>screen</td>
            <td><pre>B(Cb, Cs) = 1 - [(1 - Cb) x (1 - Cs)]<br>= Cb + Cs -(Cb x Cs)</pre></td>
        </tr>
        <tr>
            <td>overlay</td>
            <td><pre>B(Cb, Cs) = HardLight(Cs, Cb)</pre></td>
        </tr>
        <tr>
            <td>darken</td>
            <td><pre>B(Cb, Cs) = min(Cb, Cs)</pre></td>
        </tr>
        <tr>
            <td>lighten</td>
            <td><pre>B(Cb, Cs) = max(Cb, Cs)</pre></td>
        </tr>
        <tr>
            <td>color-dodge</td>
            <td><pre>
if(Cb == 0)
    B(Cb, Cs) = 0
else if(Cs == 1)
    B(Cb, Cs) = 1
else
    B(Cb, Cs) = min(1, Cb / (1 - Cs))</pre></td>
        </tr>
        <tr>
            <td>color-burn</td>
            <td><pre>
if(Cb == 1)
    B(Cb, Cs) = 1
else if(Cs == 0)
    B(Cb, Cs) = 0
else
    B(Cb, Cs) = 1 - min(1, (1 - Cb) / Cs)
            </pre></td>
        </tr>
        <tr>
            <td>hard-light</td>
            <td><pre>
if(Cs <= 0.5)
    B(Cb, Cs) = Multiply(Cb, 2 x Cs)
else
    B(Cb, Cs) = Screen(Cb, 2 x Cs -1)
            </pre></td>
        </tr>
        <tr>
            <td>soft-light</td>
            <td><pre>
if(Cs <= 0.5)
    B(Cb, Cs) = Cb - (1 - 2 x Cs) x Cb x (1 - Cb)
else
    B(Cb, Cs) = Cb + (2 x Cs - 1) x (D(Cb) - Cb)
with
    if(Cb <= 0.25)
        D(Cb) = ((16 * Cb - 12) x Cb + 4) x Cb
    else
        D(Cb) = sqrt(Cb)
            </pre></td>
        </tr>
        <tr>
            <td>difference</td>
            <td><pre>B(Cb, Cs) = | Cb - Cs |</pre></td>
        </tr>
        <tr>
            <td>exclusion</td>
            <td><pre>B(Cb, Cs) = Cb + Cs - 2 x Cb x Cs</pre></td>
        </tr>
        <tr>
            <td>hue</td>
            <td><pre>h(Cs), s(Cb), l(Cb)</pre></td>
        </tr>
        <tr>
            <td>saturation</td>
            <td><pre>h(Cb), s(Cs), l(Cb)</pre></td>
        </tr>
        <tr>
            <td>color</td>
            <td><pre>h(Cs), s(Cs), l(Cb)</pre></td>
        </tr>
        <tr>
            <td>luminosity</td>
            <td><pre>h(Cb), s(Cb), l(Cs)</pre></td>
        </tr>
    </tbody>
</table>

<br><br>

<p>Here is a demo for blend mode generator in javascript:</p>

<p data-height="600" data-theme-id="light" data-slug-hash="grrWba" data-default-tab="result" data-user="Praseetha-KR" class="codepen">See the Pen <a href="http://codepen.io/Praseetha-KR/pen/grrWba/">CSS Blend Modes: Generator in JS</a> by Praseetha KR (<a href="http://codepen.io/Praseetha-KR">@Praseetha-KR</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>
