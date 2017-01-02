---
layout: post
title:  "Quickstart tmux"
date:   2017-01-03 01:15:20
categories: blog, programming, sysadmin
blurb: "Tmuxifying terminal life"
image: "/assets/img/posts/tmux.png"
theme: '#7ebb61'
---

I haven't been using [tmux](https://tmux.github.io/) since I'm a happy user of [iTerm2](https://www.iterm2.com/). Eventhough tmux had been used in servers I used to work with, I preferred avoiding it because of the fallacious assumption that it would be hard to remember all those scary key-shortcuts. I gave it a try today, and totally regret for not learning it earlier.

<ol class="post__index">
    <li><a href="#why-tmux">Why tmux</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#managing-sessions">Managing Sessions</a></li>
    <li><a href="#configuration-file">Configuration file</a></li>
</ol>

<img src="/assets/img/posts/tmux.png" alt="tmux window">

## Why tmux?

**tmux** is a terminal multiplexer. It enables to run multiple processes in one terminal.

With tmux you can create multiple sessions in a terminal, each session can have multiple windows which can be split into panes. Sessions can be attached/detached to the working terminal. This is heavily useful for multiuser concurrent system-terminals.

Another advantage is that processes running inside tmux sessions can continue even after closing the terminal.


## Installation

In OSX, tmux can be installed with homebrew.

```bash
$ brew install tmux
```

## Usage

Typing `tmux` will start a new session, you can see the session status displayed on the bottom bottom of the window in a green bar.

```bash
$ tmux
```

When you are inside tmux session, every tmux command need to have a **prefix**. By default it is `CTRL+B`. For example, *commands below does splitting window into vertical panes*.

```
CTRL+B %
```

Here is a list of useful commands,

<table class="table__size--small">
    <thead>
        <tr>
            <th>Prefix</th>
            <th>Command</th>
            <th>Use</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="28"><code>&nbsp;CTRL+B&nbsp;</code></td>
            <td colspan="2" class="table__subtitle">Sessions</td>
        </tr>
        <tr>
            <td>s</td>
            <td>list sessions</td>
        </tr>
        <tr>
            <td>:new<code>&lt;ENTER&gt;</code></td>
            <td>create new session</td>
        </tr>
        <tr>
            <td>$</td>
            <td>rename session</td>
        </tr>
        <tr>
            <td>d</td>
            <td>detach session</td>
        </tr>
        <tr>
            <td colspan="2" class="table__subtitle">Windows</td>
        </tr>
        <tr>
            <td>w</td>
            <td>list windows</td>
        </tr>
        <tr>
            <td>f</td>
            <td>find window</td>
        </tr>
        <tr>
            <td>c</td>
            <td>create window</td>
        </tr>
        <tr>
            <td>&</td>
            <td>kill window</td>
        </tr>
        <tr>
            <td>,</td>
            <td>rename window</td>
        </tr>
        <tr>
            <td>n</td>
            <td>next window</td>
        </tr>
        <tr>
            <td>p</td>
            <td>previous window</td>
        </tr>
        <tr>
            <td colspan="2" class="table__subtitle">Panes</td>
        </tr>
        <tr>
            <td>%</td>
            <td>vertical split</td>
        </tr>
        <tr>
            <td>"</td>
            <td>horizontal split</td>
        </tr>
        <tr>
            <td>q</td>
            <td>show pane numbers, if pane number is typed immediately, control is switched to that pane</td>
        </tr>
        <tr>
            <td>x</td>
            <td>kill pane</td>
        </tr>
        <tr>
            <td>z</td>
            <td>toggle zoom pane</td>
        </tr>
        <tr>
            <td><code>&lt;ARROW&nbsp;KEY&gt;</code></td>
            <td>switch to pane pointed by arrow key</td>
        </tr>
        <tr>
            <td>o</td>
            <td>swap panes</td>
        </tr>
        <tr>
            <td>{</td>
            <td>move current pane to left</td>
        </tr>
        <tr>
            <td>}</td>
            <td>move current pane to right</td>
        </tr>
        <tr>
            <td><code>&lt;SPACE&nbsp;BAR&gt;</code></td>
            <td>toggle between different pane layouts</td>
        </tr>
        <tr>
            <td colspan="2" class="table__subtitle">Extras</td>
        </tr>
        <tr>
            <td>t</td>
            <td>show time</td>
        </tr>
        <tr>
            <td>?</td>
            <td>list shortcuts</td>
        </tr>
        <tr>
            <td>:</td>
            <td>prompt</td>
        </tr>
    </tbody>
</table>

As mentioned in the last entry of table above, `CTRL+B :` will give tmux prompt at the bottom of the window, you can enter commands there.

```
: <command>
```

<table class="table__size--small">
    <thead>
        <tr>
            <th colspan="2">Command</th>
            <th>Use</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2">:setw synchronize-panes</td>
            <td>synchronize cursor on all panes (repeat same for toggle)</td>
        </tr>
        <tr>
            <td rowspan="3">:resize-pane</td>
            <td>-L</td>
            <td>resize current pane to left<br>(Available flags: L, R, T, D for left, right, top, down respectively)</td>
        </tr>
        <tr>
            <td>-D 50</td>
            <td>resize current pane down by 50 cells</td>
        </tr>
        <tr>
            <td>-t 2 -R 30</td>
            <td>resize pane number 2 right by 30 cells</td>
        </tr>
    </tbody>
</table>

## Managing sessions

Sessions are by default numbered as 0, 1, 2, .. You can name/rename sessions with strings.

<table>
    <thead>
        <tr>
            <th>Action</th>
            <th>Command</th>
        </tr>
    </thead>
    <tbody>
       <tr>
           <td>create session</td>
           <td>
                <code>$ tmux</code><br>
                <code>$ tmux new</code><br>
                <code>$ tmux new -s &lt;session_name&gt;</code>
           </td>
       </tr>
       <tr>
           <td>list sessions</td>
           <td><code>$ tmux ls</code></td>
       </tr>
       <tr>
           <td>detach session</td>
           <td><code>CTRL+B d</code></td>
       </tr>
       <tr>
           <td>attach session</td>
           <td>
                <code>$ tmux a -t &lt;session_name&gt;</code>
           </td>
       </tr>
       <tr>
           <td>kill session</td>
           <td><code>$ tmux kill-session -t &lt;session_name&gt;</code></td>
       </tr>
    </tbody>
</table>


## Configuration file

If you want to save commands entered in tmux prompt to for all of your sessions, it can be saved to configuration file `~/.tmux.conf`

Here is an example config file:

```conf
# enable mouse actions
set -g mouse on

# change default PREFIX from CTRL+B to CTRL+A
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# split panes using | and -
bind | split-window -h
bind - split-window -v
unbind '"'
unbind %

# reload config file inside session with PREFIX+r
bind r source-file ~/.tmux.conf

# Change theme of pane border
set -g pane-border-fg red
set -g pane-active-border-fg yellow

```

For more options: [`man tmux`](http://man.openbsd.org/OpenBSD-current/man1/tmux.1)
