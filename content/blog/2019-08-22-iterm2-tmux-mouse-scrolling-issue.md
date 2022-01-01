---
title: "iTerm2 tmux mouse scrolling issue"
slug: iterm2-tmux-mouse-scrolling-issue
date: 2019-08-22 05:44:30
tags:
    - osx
    - tools
blurb: "Fixing mouse scrolling in tmux scroll mode"
theme: "#131214"
title_color: "#66f96a"
luminance: light
graphic:
    preview:
        png: "/images/posts/tmux_scroll/preview.png"
        webp: "/images/posts/tmux_scroll/preview.webp"
    main:
        png: "/images/posts/tmux_scroll/main.png"
        overlap: "9.5"
---


I was in a Mosh session on a remote server and tried to do scroll using trackpad. Surprisingly instead of getting the scrolled content of the remote shell, it showed buffered content of my system's shell!

I opened up tmux inside the mosh session thinking may be it would help. Nope the same issue.

Local tmux as well has the same issue. The scoll mode (`ctrl` `B` `[`) in tmux with keyboard navigation worked as expected (in remote as well).

<figure class="figure-c">
    <img src="/images/posts/tmux_scroll/iterm_tmux_mouse_scrolling_broken.gif" width="100%" alt="mux mouse scrolling broken">
    <figcaption>tmux mouse scrolling broken</figcaption>
</figure>

## The fix

Appraently there is a quick fix with iTerm2 in Mac.

1. Goto **iTerm2 > Preferences > Advanced**
2. In Mouse section, set ***Scroll wheel sends arrow keys when in alternate screen mode*** to `Yes`

<div>
    <figure class="figure-l">
        <img src="/images/posts/tmux_scroll/iterm_advanced_preferences.png" width="100%" alt="iTerm advanced preferences">
        <figcaption>iTerm advanced preferences</figcaption>
    </figure>
</div>

Done!

Now the content will get scrolled correctly within tmux window pane in **scoll mode**.

<figure class="figure-c">
    <img src="/images/posts/tmux_scroll/iterm_tmux_mouse_scrolling_fixed.gif" width="100%" alt="tmux mouse scrolling fixed">
    <figcaption>tmux mouse scrolling fixed</figcaption>
</figure>

Although mosh scrolling issue is not fixed (now mosh scroll gives walk through commands history), tmux mouse scrolling fix, indirectly fixed my issue. So,  yay! 🎉
