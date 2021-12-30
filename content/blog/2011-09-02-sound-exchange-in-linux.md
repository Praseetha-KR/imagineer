---
title: "SOund eXchange in Linux"
slug: sound-exchange-in-linux
date: 2011-09-02 09:45:00
tags:
    - linux
blurb: "Wanted to deal with audio files in linux? ‘sox‘ (Sound Exchange) is a powerful command for you. Here is some examples for sox command."
theme: "#566C86"
---

Wanted to deal with audio files in linux? `sox` (Sound Exchange) is a powerful command for you. Here is some examples for sox command.

Let’s combine two audio files with a single command line,

```console
$ sox -m first.wav second.wav combined.wav
```

with `-m` flag, sox mixes two input files together to produce output file. here *first.wav* and *second.wav* are input files and *combine.wav* is the output file.

If you don’t have any wav files and if all your music is in mp3, ogg, aac or ac3 formats, `ffmpeg` can fix this for you:

```console
$ ffmpeg -i foo.mp3 foo.wav
```

If you want to extract a part of the audio file, use `trim` option. The syntax is,

```console
$ sox input_file.wav output_file.wav trim [SECONDS TO STARTING POINT] [DURATION IN SECONDS]
```

For example,

```console
$ sox input.wav output.wav 0 10
```

Try other options available for sox. Its really fun! :-)

