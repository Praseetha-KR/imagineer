---
layout: post
title:  "Awesome Geometric Patterns Using Matlab"
date:   2013-11-02 14:54:02
categories: blog
---

<a href="/assets/img/media/pattern-chess.png"><img class="aligncenter size-full wp-image-334" title="pattern-chess" src="/assets/img/media/pattern-chess.png" alt="" width="598" height="422" /></a>

Do you think it is difficult to make 3 dimensional patterns like this one? then you are wrong. Its absolutely not! 

The basic line pattern of this chess pattern is as shown below:

<a href="/assets/img/media/35.png"><img class="aligncenter size-full wp-image-335" title="35" src="/assets/img/media/35.png" alt="" width="581" height="409" /></a>

Such line patterns can be easily generated using this simple Matlab script:

{% highlight matlab %}
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
{% endhighlight %}

Run this script as:
{% highlight bash %}
>> pattern( angle_value )
{% endhighlight %}

For example,

{% highlight bash %}
>> pattern(45)
{% endhighlight %}

This will generate the pattern shown below:

<a href="/assets/img/media/45.png"><img class="aligncenter  wp-image-336" title="45" src="/assets/img/media/45.png" alt="" width="554" height="519" /></a>

You can also generate colorful thread patterns using this script! Choose an angle value <em>between 90 to 180 degree</em> or <em>between 270 to 360 degree</em>, which will generate different patterns according to the angle input.

For example,

{% highlight bash %}
>> pattern(145)
{% endhighlight %}

Generate the following multicolor pattern:

<a href="/assets/img/media/145.png"><img class="aligncenter  wp-image-337" title="145" src="/assets/img/media/145.png" alt="" width="572" height="407" /></a>

Isn't it really cool?

[jekyll-gh]: /assets/img/media/pattern-chess.png