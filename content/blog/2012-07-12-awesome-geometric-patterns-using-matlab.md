---
title: "Awesome Geometric Patterns Using Matlab"
slug: awesome-geometric-patterns-using-matlab
date: 2012-07-12 08:15:28
tags:
    - matlab
    - pattern
blurb: "Generating line patterns with a matlab script"
theme: "#445A88"
---

<div>
    <figure class="figure-l p-1h-top  p-q-bottom">
        <img src="/images/media/pattern-chess.png" class="contain-width" alt="3D chess pattern">
        <figcaption>fig 1: 3D chess pattern</figcaption>
    </figure>
</div>

Do you think it is difficult to make 3 dimensional patterns like this one? then you are wrong. Its absolutely not!

The basic line pattern of this chess pattern is as shown below:

<div>
    <figure class="figure-l p-1h-top p-q-bottom text-center">
        <img src="/images/media/35.png" class="contain-width" alt="Mesh pattern">
        <figcaption>fig 2: mesh pattern</figcaption>
    </figure>
</div>

Such line patterns can be easily generated using this simple Matlab script:

```matlab
function pattern(angle)
	lower = 2;
	upper = 12;
	stepvalue = 0.2;
	lastindex = (upper-lower) * (1/stepvalue) + 1;
	mid = ceil(lastindex/2);
	x = [lower:stepvalue:upper];
	line1 = tand(angle)*x;
	line2 = tand(180-angle)*x + line1(lastindex)+line1(1);
	plot(x,line1,x,line2);
	for i = 1:(mid-1)
		hold all
		plot([x(i),x(mid+i)],[line1(i),line2(mid+i)]);
		hold all
		plot([x(i),x(mid-i)],[line1(i),line2(mid-i)]);
		hold all
		plot([x((mid*2)-i),x(mid+i)],[line1((mid*2)-i),line2(mid+i)]);
		hold all
		plot([x((mid*2)-i),x(mid-i)],[line1((mid*2)-i),line2(mid-i)]);
	end

	daspect([1,1,1]);
	set(gca,'XTick',[0:1:(upper+2)]);
	set(gca,'YTick',[0:1:line1(lastindex)+1]);
	set(gca,'XLim',[0 (upper+2)]);
	set(gca,'YLim',[0 line1(lastindex)+1]);
	set(findobj('Type','line'),'Color','black');
end
```

Run this script as:

```console
>> pattern( angle_value )
```

For example,

```console
>> pattern(45)
```

This will generate the pattern shown below:

<div>
    <figure class="figure-l p-1h-top p-q-bottom text-center">
        <img src="/images/media/45.png" class="contain-width" alt="Mesh pattern">
        <figcaption>fig 3: Matlab generated mesh pattern</figcaption>
    </figure>
</div>


You can also generate colorful thread patterns using this script! Choose an angle value <em>between 90 to 180 degree</em> or <em>between 270 to 360 degree</em>, which will generate different patterns according to the angle input.

For example,

```console
>> pattern(145)
```

Sample multicolor pattern:

<figure class="full-width">
    <img src="/images/media/145.png" class="contain-width" alt="Mesh pattern">
    <figcaption>fig 4: colorful mesh pattern</figcaption>
</figure>


Isn't it really cool?
