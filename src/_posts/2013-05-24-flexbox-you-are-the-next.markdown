---
layout: post
title:  "Flexbox, you are the next!"
date:   2013-05-24 18:17:46
categories: blog
blurb: "In the shiny edge of flexbox!"
status: 'draft'
---

Time has come to get rid of the complexity of layouting with float and position properties, its the turn for flexbox. We are able to create more complex layouts with float, position properties, plus a little bit of javascript. But the complexity to implement it in the wide variety of browsers is also awful. Flexible box or in short, flexbox is the property in CSS which make the layout model much easier.

Technically flexbox is not a new concept, but it has got a remarkable evolution over the past few years. The problem still persist with flexbox is the browser compatibility. With the support of CSS3, flexbox may take some time to get support across browsers; even though if we combine both "old" and "new" flexboxes together, we can accomplish a decent browser support. There are mainly 3 versions:

*	2009 : `display: box;` and properties as `box-{*}`
*	2011: `display: flexbox;` and flex() function
*	current: `display: flex;` and `flex-{*}`


<table border="1">
	<tbody>
		<tr>
			<th>Version</th>
			<th>Firefox</th>
			<th>Chrome</th>
			<th>Opera</th>
			<th>Safari</th>
			<th>IE</th>
		</tr>
		<tr>
			<td>New</td>
			<td></td>
			<td> 21+ (-webkit-)</td>
			<td> 12.10+</td>
			<td></td>
			<td> 11?</td>
		</tr>
		<tr>
			<td>Mid</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td> 10 (-ms-)</td>
		</tr>
		<tr>
			<td>Old</td>
			<td> 3+ (-moz-)</td>
			<td> &lt;21 (-webkit-)</td>
			<td></td>
			<td> 3+ (-webkit)</td>
			<td></td>
		</tr>
	</tbody>
</table>

<a href="http://caniuse.com/flexbox" target="_blank">Compatibility table for support of Flexible Box Layout Module in desktop and mobile browsers.</a>

## I. Flexbox Properties:

Let's have an example:

##### HTML:

```html
<div class="container">
    <nav class="box1">Box1 contents</nav>
    <article class="box2">Box2 contents</article>
    <aside class="box3">Box3 contents</aside>
</div>
```

##### CSS:

```css
.container           { padding: 2em }
.box1, .box2, .box3 { padding: 1em }
```


This snippet doesn't have any float or position properties. Let's layout it with flexbox.  

### 1. Display Property

For the child elements _box1, box2, box3_ to arranges inside the _container_ with flexbox, the parent tag need to set the display property.

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Block-level flex</th><th>Inline-level flex</th></tr><tr><td>New</td><td>display</td><td>flex</td><td>inline-flex</td></tr><tr><td>Mid</td><td>display</td><td>flexbox</td><td>inline-flexbox</td></tr><tr><td>Old</td><td>display</td><td>box</td><td>inline-box</td></tr></tbody></table><br>


<div class="container" style="padding: 1em; background-color: #6D899F; border-radius: 5px; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

-----------------------------

### 2. Orientation of flexbox axis

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Horizontal</th><th>Reversed horizontal</th><th>Vertical</th><th>Reversed vertical</th></tr><tr><td>New</td><td>flex-direction</td><td>row</td><td>row-reverse</td><td>column</td><td>column-reverse</td></tr><tr><td>Mid</td><td>flex-direction</td><td>row</td><td>row-reverse</td><td>column</td><td>column-reverse</td></tr><tr><td>Old</td><td>box-orientbox-direction</td><td>horizontalnormal</td><td>horizontalreverse</td><td>verticalnormal</td><td>verticalreverse</td></tr></tbody></table><br>

<div class="container" style="padding: 1em; background-color: #6D899F; border-radius: 5px; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex;-webkit-box-orient: vertical; -moz-box-orient: vertical; -ms-flex-orient: vertical; orient: vertical;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

-----------------------------

### 3. Sizing
<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Value</th></tr><tr><td>New</td><td>flex</td><td>&lt;number&gt;</td></tr><tr><td>Mid</td><td>flex</td><td>&lt;number&gt;</td></tr><tr><td>Old</td><td>box-flex</td><td>&lt;number&gt;</td></tr></tbody></table><br>

<div class="container" style="padding: 1em; background-color: #6D899F; border-radius: 5px; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;-webkit-box-flex: 1; -moz-box-flex: 1; -webkit-flex: 1; -ms-flex: 1; flex: 1;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;-webkit-box-flex: 10; -moz-box-flex: 10; -webkit-flex: 10; -ms-flex: 10; flex: 10;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;-webkit-box-flex: 1; -moz-box-flex: 1; -webkit-flex: 1; -ms-flex: 1; flex: 1;">    box 3 contents  </section></div>
--------------------------------

### 4. Ordering

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Value</th></tr><tr><td>New</td><td>Order</td><td>&lt;number&gt;</td></tr><tr><td>Mid</td><td>flex-order</td><td>&lt;number&gt;</td></tr><tr><td>Old</td><td>box-ordinal-group</td><td>&lt;integer&gt;</td></tr></tbody></table><br>

<div class="container" style="padding: 1em; background-color: #6D899F; border-radius: 5px; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em; -webkit-box-ordinal-group: 3; -moz-box-ordinal-group: 3; -ms-flex-order: 3; -webkit-order: 3; order: 3;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em; -webkit-box-ordinal-group: 1; -moz-box-ordinal-group: 1; -ms-flex-order: 1; -webkit-order: 1; order: 1;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em; -webkit-box-ordinal-group: 2; -moz-box-ordinal-group: 2; -ms-flex-order: 2; -webkit-order: 2; order: 2;">    box 3 contents  </section></div>

---------------------------------

### 5. Horizontal Align

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Start</th><th>Center</th><th>End</th><th>Justify</th><th>Distribute</th></tr><tr><td>New</td><td>justify-content</td><td>flex-start</td><td>center</td><td>flex-end</td><td>space-between</td><td>space-around</td></tr><tr><td>Mid</td><td>flex-pack</td><td>start</td><td>center</td><td>end</td><td>justify</td><td>distribute</td></tr><tr><td>Old</td><td>box-pack</td><td>start</td><td>center</td><td>end</td><td>justify</td><td>--</td></tr></tbody></table><br>
#### Start
<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; width: 100%; -webkit-box-pack: start; -moz-box-pack: start; -ms-flexbox-pack: start; -webkit-flex-pack: start; flex-pack: start; -webkit-justify-content: flex-start; -moz-justify-content: flex-start; -ms-justify-content: flex-start; -justify-content: flex-start;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### Center
<div class="container" style="border-radius: 5px; width: 100%; padding: 1em; background-color: #6D899F; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-pack: center; -moz-box-pack: center; -ms-flexbox-pack: center; -webkit-flex-pack: center; flex-pack: center; -webkit-justify-content: center; -moz-justify-content: center; -ms-justify-content: center; -justify-content: center;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### End
<div class="container" style="border-radius: 5px; width: 100%; padding: 1em; background-color: #6D899F; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-pack: end; -moz-box-pack: end; -ms-flexbox-pack: end; -webkit-flex-pack: end; flex-pack: end; -webkit-justify-content: flex-end; -moz-justify-content: flex-end; -ms-justify-content: flex-end; -justify-content: flex-end;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

-----------------------------

### 6. Vertcal Align

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>Start</th><th>Center</th><th>End</th><th>Baseline</th><th>Stretch</th></tr><tr><td>New</td><td>align-items</td><td>flex-start</td><td>center</td><td>flex-end</td><td>baseline</td><td>stretch</td></tr><tr><td>Mid</td><td>flex-align</td><td>start</td><td>center</td><td>end</td><td>baseline</td><td>stretch</td></tr><tr><td>Old</td><td>box-align</td><td>start</td><td>center</td><td>end</td><td>baseline</td><td>stretch</td></tr></tbody></table><br>
#### Start

<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; height: 80px; -webkit-box-align: start; -moz-box-align: start; -ms-flexbox-align: start; -webkit-flex-align: start; flex-align: start; -webkit-align-items: flex-start; -moz-align-items: flex-start; -ms-align-items: flex-start; -align-items: flex-start;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### Center
<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; height: 80px; -webkit-box-align: center; -moz-box-align: center; -ms-flexbox-align: center; -webkit-flex-align: center; flex-align: center; -webkit-align-items: center; -moz-align-items: center; -ms-align-items: center; -align-items: center;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### End
<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; height: 80px; -webkit-box-align: end; -moz-box-align: end; -ms-flexbox-align: end; -webkit-flex-align: end; flex-align: end; -webkit-align-items: flex-end; -moz-align-items: flex-end; -ms-align-items: flex-end; -align-items: flex-end;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### Baseline
<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; height: 80px; width: 100%; -webkit-box-align: baseline; -moz-box-align: baseline; -ms-flexbox-align: baseline; -webkit-flex-align: baseline; flex-align: baseline; -webkit-align-items: baseline; -moz-align-items: baseline; -ms-align-items: baseline; -align-items: baseline;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

#### Stretch
<div class="container" style="border-radius: 5px; padding: 1em; background-color: #6D899F; width: 100%; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; height: 80px; -webkit-box-align: stretch; -moz-box-align: stretch; -ms-flexbox-align: stretch; -webkit-flex-align: stretch; flex-align: stretch; -webkit-align-items: stretch; -moz-align-items: stretch -ms-align-items: stretch; -align-items: stretch;">  <section class="box1" style="background-color: #CE9B64; padding: 0.5em;">    box 1 contents  </section>  <section class="box2" style="background-color: #BCD39B; padding: 0.5em;">    box 2 contents  </section>  <section class="box3" style="background-color: #62626D; padding: 0.5em;">    box 3 contents  </section></div>

----------------------------------

### 7. Wrapping

<br><table border="1"><tbody><tr><th>Version</th><th>Property</th><th>No wrapping</th><th>Wrapping</th><th>Reversed wrapping</th></tr><tr><td>New</td><td>flex-wrap</td><td>nowrap</td><td>wrap</td><td>wrap-reverse</td></tr><tr><td>Mid</td><td>flex-wrap</td><td>nowrap</td><td>wrap</td><td>reverse-wrap</td></tr><tr><td>Old</td><td>box-lines</td><td>single</td><td>multiple</td><td>--</td></tr></tbody></table><br />

------------------------------------------


## II. Holy Grail Layout with Flexbox

One of the difficult problems in CSS - the holy grail layout -  can be done amazingly easier with flexbox method. Here is a sample (with good browser compatibility).<br />

##### HTML:

```html
<header>Header</header>
<div class="container">
    <article class="box1">
        Article contents<br/ >( Box 1 )
    </article>
    <nav class="box2">
        Navbar contents<br/ >( Box 2 )
    </nav>
    <aside class="box3">
        Sidebar contents<br/ >( Box 3 )
    </aside>
</div>
<footer>Footer</footer>
```

##### CSS:

```css
*{
	margin: 0;
	padding: 0;
}
body{
	padding: 2em;
	background-color: #6D899F;
}
header, footer{
	background-color: #FFFFFF;
	padding: 1em;
}
.container{
	display: -webkit-box;
	display: -moz-box;
	display: -ms-flexbox;
	display: -webkit-flex;
	display: flex;

	width: 100%;
}
.box1{
	-webkit-box-ordinal-group: 2;
	-moz-box-ordinal-group: 2;
	-ms-flex-order: 2;
	-webkit-order: 2;
	order: 2;

	-webkit-box-flex: 3;
	-moz-box-flex: 3;
	-webkit-flex: 3;
	-ms-flex: 3;
	flex: 3;

	background-color: #BCD39B;
}
.box2{
	-webkit-box-ordinal-group: 1;
	-moz-box-ordinal-group: 1;
	-ms-flex-order: 1;
	-webkit-order: 1;
	order: 1;

	-webkit-box-flex: 1;
	-moz-box-flex: 1;
	-webkit-flex: 1;
	-ms-flex: 1;
	flex: 1;

	background-color: #CE9B64;
}
.box3{
	-webkit-box-ordinal-group: 3;
	-moz-box-ordinal-group: 3;
	-ms-flex-order: 3;
	-webkit-order: 3;
	order: 3;

	-webkit-box-flex: 1;
	-moz-box-flex: 1;
	-webkit-flex: 1;
	-ms-flex: 1;
	flex: 1;

	background-color: #62626D;
}
.box1, .box2, .box3{
	padding: 1em;
}

/* mobile layout */
@media (max-width: 480px){
	.container{
		display: -webkit-box;
		display: -moz-box;
		display: -ms-flexbox;
		display: -webkit-flex;
		display: flex;

		width: 100%;

		-webkit-box-orient: vertical;
		-moz-box-orient: vertical;
                -ms-flex-orient: vertical;
                -webkit-orient: vertical;
                orient: vertical;
	}
	.box2{
		-webkit-box-ordinal-group: 2;
		-moz-box-ordinal-group: 2;
		-ms-flex-order: 2;
		-webkit-order: 2;
		order: 2;	}
	.box1{
		-webkit-box-ordinal-group: 1;
		-moz-box-ordinal-group: 1;
		-ms-flex-order: 1;
		-webkit-order: 1;
		order: 1;
	}
	.box3{
		-webkit-box-ordinal-group: 3;
		-moz-box-ordinal-group: 3;
		-ms-flex-order: 3;
		-webkit-order: 3;
		order: 3;
        }
}
```

<p data-height="268" data-theme-id="0" data-slug-hash="rJqEL" data-user="Praseetha-KR" data-default-tab="result" class='codepen'>See the Pen <a href='http://codepen.io/Praseetha-KR/pen/rJqEL'>Holy Grail Layout with Flexbox</a> by Praseetha KR (<a href='http://codepen.io/Praseetha-KR'>@Praseetha-KR</a>) on <a href='http://codepen.io'>CodePen</a></p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

So, Flexbox, you are the next!
