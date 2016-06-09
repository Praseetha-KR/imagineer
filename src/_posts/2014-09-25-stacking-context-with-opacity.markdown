---
layout: post
title:  "Stacking context with opacity"
date:   2014-09-25 08:15:00
categories: blog
blurb: "How the opacity affects stacking context in browsers"
theme: '#B4AB7E'
---

CSS box model is a stack of 2-dimensional layers in which the default behaviour is:

1. Each child element is on top of parent element
2. For sibling elements, current node appear on top of previous one

Every element in a document is stacked up with the base root element. It is well known that we can alter this stacking bahaviour with change of any of these default properties: `z-index: auto`, `position: auto`, `transform: none`.

Recently I came to know that `opacity` can also make changes in stacking context!

<blockquote>Since an element with opacity less than 1 is composited from a single offscreen image, content outside of it cannot be layered in z-order between pieces of content inside of it. For the same reason, implementations must create a new stacking context for any element with opacity less than 1. If an element with opacity less than 1 is not positioned, implementations must paint the layer it creates, within its parent stacking context, at the same stacking order that would be used if it were a positioned element with ‘z-index: 0’ and ‘opacity: 1’. <br><br>- <a href="http://www.w3.org/TR/css3-color/#transparency">W3C CSS Color Module Level 3 - Transparency</a></blockquote>

Here is an example: in the following <a href="http://codepen.io/Praseetha-KR/pen/BotKr">codepen sample code</a>, Fig. A shows the default stacking with respect to the root of the document. (There are 3 divs - red, green and blue, each surrounded by div containers.)

In Fig. B, red has got `z-index: 1` which introduces a new stacking context. All elements are stacked up against root with `z-index: auto`(or `z-index: 0`), while red will be raised from the that layer. So it appears on topmost layer.

**Question: how can we bring the red layer to the bottom without changing `position`, `z-index` and `transform`?**

**Answer: use opacity < 1 for parent of red.**

The container div of red is set with property `opacity: 0.9` in Fig. C, so a new stacking context will be induced in that div. Therefore the `z-index: 1` for red will be applied with respect to the parent div, instead of w.r.t root node. Thus it appears below green and blue blocks.

<p data-height="310" data-theme-id="8104" data-slug-hash="BotKr" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/Praseetha-KR/pen/BotKr/'>BotKr</a> by Praseetha KR (<a href='http://codepen.io/Praseetha-KR'>@Praseetha-KR</a>) on <a href='http://codepen.io'>CodePen</a>.</p>

<script src="//codepen.io/assets/embed/ei.js"></script>
