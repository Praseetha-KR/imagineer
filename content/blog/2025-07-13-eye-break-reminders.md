---
title: "How I use my fitness band for eye break reminders"
slug: eye-break-reminders
date: 2025-07-13 00:00:00
tags:
    - projects
    - problem-solving
    - android
blurb: "20-20-20 rule based eye break reminders with android app and fitness band"
theme: "#212285"
title_color: "#3B60ED"
luminance: light
graphic:
    preview:
        png: "/images/posts/eye-break-reminders/preview.png"
        webp: "/images/posts/eye-break-reminders/preview.webp"
    main:
        png: "/images/posts/eye-break-reminders/main.png"
        webp: "/images/posts/eye-break-reminders/main.webp"
        overlap: "15"
---

## The Problem

Staring at screens every day has been gradually affecting my eyes. Reducing screen time seems unattainable, Pomodoro technique is hard to follow consistently everyday, so I decided take regular screen breaks with the 20-20-20 rule.

> 20-20-20 concept: taking a 20-second break every 20 minutes to focus on an object 20 feet away

I tried using [Time Out app](https://apps.apple.com/us/app/time-out-break-reminders/id402592703) on my Mac, which displays an overlay on the screen every 20 minutes with a 20-second break countdown.

<div>
    <figure class="figure-m p-1h-top p-q-bottom text-center">
        <img src="/images/posts/eye-break-reminders/time_out_app.png" class="contain-width" alt="Mesh pattern">
        <figcaption>fig 1: Time out app's reminder overlay</figcaption>
    </figure>
</div>

While the Time Out app's intention is great, it didn’t work for me. Here's why:

1. **Disrupts focus**: The overlay popping up every 20 minutes broke my flow. It was hard to stay in the zone with this kind of interruption.
2. **Anxiety-inducing**: Even when I tried to look away at a distant object, I kept looking back at the screen to see if the overlay had gone - almost obsessively waiting for it to disappear so I could resume my work.
3. **Repetitive dismissals &amp; disabling**: Over time, I developed the habit of instantly dismissing the overlay or just turning off the app completely. That kind of defeated the entire point using it.
4. **Multi device limitation**: The app was only installed on my personal laptop. But I switch between multiple devices — phone, tablet, kindle, work laptop, TV, and other devices - so the eye strain continued on those. Installing such reminder apps on all devices is not an option. Imagine how they’d all buzz at the same time every 20 minutes! LOL 🤣


## The Solution

I thought of alternative non-disruptive solutions:
1. **idea 1 - Enabling notifications in laptop and mobile instead of screen overlay**: Notifications are easy to get ignored and are too noisy. And the multi-device issue is not resolved with this approach. So NO ❌
2. **idea 2 - Creating a Mac toolbar app which would display some color indicator based on the time since the last eye break**: Highly likely I would not even notice it in hyperfocused mode, and certainly the multi-device issue is not resolved. So NO ❌
3. **idea 3 - Setting periodic reminders with Alexa**: Multi-device issue can be resolved to an extend with this, but it will be a disturbance to others in the room, and is tied up to a geographic location (can't use at office). So NO ❌

What I need is a gentle, context-agnostic nudge — something that works even when I’m reading a book. 

That’s when I realized my "underutilized" **fitness band might be the simplest solution** here!


#### Eye break reminder system with notification app + fitness band

I built a tiny Android app called **LookAway**. It simply sends a notification every 20 minutes. Phone notifications for this app are silenced. Then configured my fitness band app  (Zepp Life) to forward these notifications to the fitness band (Xiaomi MI Band 5), which triggers a gentle vibration upon notification.  That’s it. No full-screen takeover, no buzz on all devices — just one quiet nudge on my wrist.

<div class="p-2-bottom">
    <div class="images-row images-row--responsive figure-l">
        <div>
            <figure >
                <img src="/images/posts/eye-break-reminders/reminder_system_configuration.png" class="contain-width" alt="Reminder system configuration">
                <figcaption>fig 2: Configure notifications in LookAway & Zepp Life apps</figcaption>
            </figure>
        </div>
        <div>
            <figure >
                <img src="/images/posts/eye-break-reminders/reminder_system_notification.png" class="contain-width" alt="Reminder system notification">
                <figcaption>fig 3: Take breaks to relax eyes whenever fitness band alerts</figcaption>
            </figure>
        </div>
    </div>
</div>


It works well because it:
- <span class="color--black">doesn't block my work</span>. (I can complete my chain of thoughts or finish up the current action in the game and then take a break)
- doesn’t have a time countdown while looking away. (I can take as much time as I want for shifting eye focus and/or for long blinks)
- is universal. It works when I'm using any screen including TV, and even with non-screen staring (like reading book).
- offloads sensory input from visual to motor (I don't use my band for notifications, so I can assume the band's vibration is coming from eye break reminder app without looking at it's display)
- works independent of location (home/office)

It’s not perfect — I still get interrupted — but it's much gentler and less anxiety-inducing than the previous system. I (not the machine) have the control of taking breaks based on my mental state. It's a forgiving system, and that makes it sustainable.

<div>
    <figure class="figure-l p-1h-top p-q-bottom text-center">
        <img src="/images/posts/eye-break-reminders/look_away_band_notification.jpg" class="contain-width" alt="Notification in fitness band">
        <figcaption>fig 4: Notification in fitness band</figcaption>
    </figure>
</div>

---

#### LookAway app

It is a simple notification app. I did AI-assisted coding to quickly code the LookAway app in Kotlin. Code is available at [github.com/Praseetha-KR/LookAway](https://github.com/Praseetha-KR/LookAway) repo.

##### Features
- The app lets you configure active hours to get notified, sleeping duration can be excluded with this option.
- Frequency of reminder is also configurable. (Instead of 20 mins if you want to configure for 1 hour, that's possible)
- [`TODO`] Add “snooze until tomorrow” &amp; “disable for next N hours” options with one tap. (This will help in temporary pausing without manual restart)
- [`TODO`] Auto-detect sleep time, exercise time and traveling state using band's tracked data, and pause notifications accordingly.

##### User interface
For the UI, I thought of adding a relaxing vibe, so decided to use an anime theme with a randomized cherry blossom petals animation. Background image was generated using Google AI Studio imagen 4 (preview).

<div class="p-2-bottom full-width">
    <div class="images-row images-row--responsive">
        <div class="p-4-h">
            <figure class="figure-c p-q-bottom text-center">
                <img src="/images/posts/eye-break-reminders/lookaway_app_screenshots.png" class="contain-width" alt="LookAway app screenshots">
                <figcaption>fig 6: LookAway app user interface</figcaption>
            </figure>
        </div>
    </div>
</div>

#### How it works?

Here is a block diagram illustrating control flow of the entire reminder system:

<div class="p-2-bottom">
    <div class="images-row">
        <figure class="figure-l p-q-bottom text-center">
            <img src="/images/posts/eye-break-reminders/reminder_system_block_diagram.png" class="contain-width" alt="Block diagram of eye break reminder system">
            <figcaption>fig 5: Block diagram of eye break reminder system (notification app + fitness band)</figcaption>
        </figure>
    </div>
</div>

---

I kept the success metric for this system really low - if at least 3 times a day I could rest my eyes then its a win. My brain got adapted to it in a week's time with the focus interruption levels reduced, I hope the eye strain issues will subside on the long run.
