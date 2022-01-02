---
title: "Authorizing Twitter API Calls in Javascript"
slug: authorizing-twitter-api-calls-in-javascript
date: 2016-06-11 03:10:20
tags:
    - api
    - javascript
    - web
blurb: "How to generate OAuth 1.0 signature & configure request header"
image: "/assets/img/posts/encryption.jpg"
theme: "#27A4DD"
title_color: "#edf7fb"
luminance: dark
---

I have been thinking of playing around Twitter APIs since a long time, but never sat down patiently to get it done. Procrastination is at its highest 😥 Anyways, I did it finally, with [Twick - an Angular app to fetch and display Twitter data](https://github.com/Praseetha-KR/twick).


## Getting Authorization header

Twitter has a good documentation on [how to authorize a request](https://dev.twitter.com/oauth/overview/authorizing-requests).

Lets take an example request:

```bash
GET https://api.twitter.com/1.1/users/show.json?screen_name=void_imagineer
Authorization: OAuth
    oauth_consumer_key="XXxxXXxxXXXXXxxx",
    oauth_nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
    oauth_signature="tnnArxj06cWHq44gCs1OSKk%2FjLY%3D",
    oauth_signature_method="HMAC-SHA1",
    oauth_timestamp="1318622958",
    oauth_token="ddddddd-xxxXXxxxxXXxxXXXXXxxxxxXXXXxxxxXXxxxxXX",
    oauth_version="1.0"
```

<br>

| OAuth Fields                | value                                 |
|-----------------------------|---------------------------------------|
| `oauth_consumer_key`        | Get from [apps.twitter.com](http://apps.twitter.com/) |
| `oauth_nonce`               | Any unique random string (eg: base64 encoding of consumerKey & timestamp)              |
| `oauth_signature`           | Described in next section             |
| `oauth_signature_method`    | `HMAC-SHA1`                           |
| `oauth_timestamp`           | unix timestamp                        |
| `oauth_token`               | Get from [apps.twitter.com](http://apps.twitter.com/) |
| `oauth_version`             | `1.0`                                 |


<br>Twitter access keys are stored in `keys.json` **only for local testing**.

``` bash
TWITTER_CONSUMER_KEY        = XXxxXXxxXXXXXxxx,
TWITTER_CONSUMER_SECRET     = xxxXXxxxxXXxxXXXXXxxxxxXXXXxxxxXXxxxxXX,
TWITTER_ACCESS_TOKEN        = ddddddd-xxxXXxxxxXXxxXXXXXxxxxxXXXXxxxxXXxxxxXX,
TWITTER_ACCESS_TOKEN_SECRET = XXXxxXXxxXXXXXxxxxxXXXXxxxxXXxxxxXX;
```

<br>

```javascript
function getAuthorization(httpMethod, baseUrl, reqParams) {
    // Get acces keys
    let keysJson            = require('keys.json');
    const consumerKey       = keysJson.TWITTER_CONSUMER_KEY,
        consumerSecret      = keysJson.TWITTER_CONSUMER_SECRET,
        accessToken         = keysJson.TWITTER_ACCESS_TOKEN,
        accessTokenSecret   = keysJson.TWITTER_ACCESS_TOKEN_SECRET;
    // timestamp as unix epoch
    let timestamp  = Math.round(Date.now() / 1000);
    // nonce as base64 encoded unique random string
    let nonce      = btoa(consumerKey + ':' + timestamp);
    // generate signature from base string & signing key
    let baseString = oAuthBaseString(httpMethod, baseUrl, reqParams, consumerKey, accessToken, timestamp, nonce);
    let signingKey = oAuthSigningKey(consumerSecret, accessTokenSecret);
    let signature  = oAuthSignature(baseString, signingKey);
    // return interpolated string
    return 'OAuth '                                         +
        'oauth_consumer_key="'  + consumerKey       + '", ' +
        'oauth_nonce="'         + nonce             + '", ' +
        'oauth_signature="'     + signature         + '", ' +
        'oauth_signature_method="HMAC-SHA1", '              +
        'oauth_timestamp="'     + timestamp         + '", ' +
        'oauth_token="'         + accessToken       + '", ' +
        'oauth_version="1.0"'                               ;
}
```

This function can be used to generate *Authorization* header. Example below shows sample **API call using Angular $resource**

```javascript
$resource(url, null, {
    get: {
        method: 'GET',
        headers: {
            'Authorization': getAuthorization(
                'GET',
                'https://api.twitter.com/1.1/users/show.json',
                { 'screen_name': 'void_imagineer'}
            )
        }
    }, options
).get({ 'screen_name': 'void_imagineer'}).$promise
```


## Generating Signature

OAuth 1.0 signature is created by HMAC-SHA1 encryption, where base string and signing key are generated as follows:


#### 1. Base string

```javascript
function oAuthBaseString(method, url, params, key, token, timestamp, nonce) {
    return method
            + '&' + percentEncode(url)
            + '&' + percentEncode(genSortedParamStr(params, key, token, timestamp, nonce));
};
```

#### 2. Signing key

```javascript
function oAuthSigningKey(consumer_secret, token_secret) {
    return consumer_secret + '&' + token_secret;
};
```

#### 3. Signature

```javascript
function oAuthSignature(base_string, signing_key) {
    var signature = hmac_sha1(base_string, signing_key);
    return percentEncode(signature);
};
```

#### Supporting functions

```javascript
// Percent encoding
function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!*()']/g, (character) => {
    return '%' + character.charCodeAt(0).toString(16);
  });
};
```

```javascript
// HMAC-SHA1 Encoding, uses jsSHA lib
var jsSHA = require('jssha');
function hmac_sha1(string, secret) {
    let shaObj = new jsSHA("SHA-1", "TEXT");
    shaObj.setHMACKey(secret, "TEXT");
    shaObj.update(string);
    let hmac = shaObj.getHMAC("B64");
    return hmac;
};
```

```javascript
// Merge two objects
function mergeObjs(obj1, obj2) {
    for (var attr in obj2) {
        obj1[attr] = obj2[attr];
    }
    return obj1;
};
```

```javascript
// Generate Sorted Parameter String for base string params
function genSortedParamStr(params, key, token, timestamp, nonce)  {
    // Merge oauth params & request params to single object
    let paramObj = mergeObjs(
        {
            oauth_consumer_key : key,
            oauth_nonce : nonce,
            oauth_signature_method : 'HMAC-SHA1',
            oauth_timestamp : timestamp,
            oauth_token : token,
            oauth_version : '1.0'
        },
        params
    );
    // Sort alphabetically
    let paramObjKeys = Object.keys(paramObj);
    let len = paramObjKeys.length;
    paramObjKeys.sort();
    // Interpolate to string with format as key1=val1&key2=val2&...
    let paramStr = paramObjKeys[0] + '=' + paramObj[paramObjKeys[0]];
    for (var i = 1; i < len; i++) {
        paramStr += '&' + paramObjKeys[i] + '=' + percentEncode(decodeURIComponent(paramObj[paramObjKeys[i]]));
    }
    return paramStr;
};
```

## Pitfalls for client-only app:

My idea was to **implement this app entirely on frontend**. This is **not feasible** because of 2 reasons:

- **Can't ensure security for access keys**: Storing these keys without revealing to browser console is impossible.<br>*Hard fix*: make the user to connect their own access keys by enabling Twitter authentication.

- **Browser blocking CORS**: Twitter API response doesn't have `Access-Control-Allow-Origin` header set, because of that browsesrs will not accept responses.<br>*Quick fix*: tunnel requests though a [corsproxy](https://www.npmjs.com/package/corsproxy) server.

You can check out the code for Twick (Angular Twitter data fetch app) in Github.

<a class="btn btn-theme m-1-v" target="_blank" href="https://github.com/Praseetha-KR/twick">
    <span class="align-center-vertical">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="18" height="18" fill="white" class="m-h-right"><!-- Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg> Twick Code at Github
    </span>
</a>


#### References:

- [how to authorize a request](https://dev.twitter.com/oauth/overview/authorizing-requests)
- [Creating signatures](https://dev.twitter.com/oauth/overview/creating-signatures)

