# Imagineer [![Build Status](https://travis-ci.org/Praseetha-KR/imagineer.svg?branch=master)](https://travis-ci.org/Praseetha-KR/imagineer)

This is my personal weblog, hosted at [https://imagineer.in](https://imagineer.in).


### Install

Make sure you have:
 - Ruby > 2.2
 - Node > 5.0

```bash
gem install jekyll jekyll-paginate kramdown rouge
npm install
npm install -g gulp-cli
```

### development build
```bash
gulp
```
This will generate build files into `/dev`, and it's view will get loaded into a new tab in your default browser.

### production build
```
gulp build
```
This will do production build into `/prod`
