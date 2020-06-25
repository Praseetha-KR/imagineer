---
layout: post
title:  "Authorizing Twitter API Calls in Javascript"
date:   2016-06-11 03:10:20
tags:
    - api
    - javascript
    - web
blurb: "How to generate OAuth 1.0 signature & configure request header"
image: "/assets/img/posts/encryption.jpg"
theme: '#27A4DD'
title_color: '#edf7fb'
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

<a class="btn btn-theme m-1-v" target="_blank" href="https://github.com/Praseetha-KR/twick"><i class="fa fa-code p-h-right"></i>Twick Code at Github</a>


#### References:

- [how to authorize a request](https://dev.twitter.com/oauth/overview/authorizing-requests)
- [Creating signatures](https://dev.twitter.com/oauth/overview/creating-signatures)

