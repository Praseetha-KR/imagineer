---
layout: post
title:  "How opacity affect layering in CSS"
date:   2014-09-25 08:15:00
categories: blog
status: draft
---

Web developers use `position`, `z-index` and `transforms` for altering the default DOM layering in CSS. If I say `opacity` can also affect layering, would you agree? Well, in this article I'm gonna show you how it is done.

By default, the DOM nodes are not positioned unless it is specified. DOM layering is done by keeping the current element top of the previous layer. This behaviour is shown below with three non-positioned circlular blocks `.red`, `.green` and `.blue` wrapped inside divs:
<p data-height="215" data-theme-id="8104" data-slug-hash="mfcry" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/Praseetha-KR/pen/mfcry/'>mfcry</a> by Praseetha KR (<a href='http://codepen.io/Praseetha-KR'>@Praseetha-KR</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>


If we give `z-index: 1` to the first block, it appers as the top layer as shown below. (Note that z-index works only for positioned elements, so all elements are positioned `relative` here.) 
<p data-height="298" data-theme-id="8104" data-slug-hash="BotKr" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/Praseetha-KR/pen/BotKr/'>BotKr</a> by Praseetha KR (<a href='http://codepen.io/Praseetha-KR'>@Praseetha-KR</a>) on <a href='http://codepen.io'>CodePen</a>.</p>

Now the question is: how can we bring back the `.red` block to the lowest layer without using `position`, `z-index` or `transform`; and also without changing html markup?

You won't belive it first, but yes, it can be done with `opacity`!

If we apply `opacity: <less than one>` to the parent div of `.red`, it goes to the lowest layer. It is illustrated below: 
<p data-height="298" data-theme-id="8104" data-slug-hash="LGFhC" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/Praseetha-KR/pen/LGFhC/'>LGFhC</a> by Praseetha KR (<a href='http://codepen.io/Praseetha-KR'>@Praseetha-KR</a>) on <a href='http://codepen.io'>CodePen</a>.</p>

Unbelievable? If you know the stacking context concept in CSS and read the opacity specification in w3c, then you are done with it :)


<blockquote>Since an element with opacity less than 1 is composited from a single offscreen image, content outside of it cannot be layered in z-order between pieces of content inside of it. For the same reason, implementations must create a new stacking context for any element with opacity less than 1. If an element with opacity less than 1 is not positioned, implementations must paint the layer it creates, within its parent stacking context, at the same stacking order that would be used if it were a positioned element with ‘z-index: 0’ and ‘opacity: 1’.</blockquote>
<script src="//codepen.io/assets/embed/ei.js"></script>