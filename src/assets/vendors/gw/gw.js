/**
 * gw.js for rendering github widget
 * v0.0.1
 */

/**
 * renderGWSkeletonTpl renders widget's DOM template skeleton
 * @param  {String} base      container node class
 * @param  {String} prefix    widget global class for BEM prefixing
 */
function renderSkeletonTpl(base, prefix) {
    var tpl = `<div class="${prefix}">
        <a class="${prefix}__link" href="#" target="_blank">
            <div class="${prefix}__user">
                <div class="${prefix}__user__pic">
                    <img class="${prefix}__avatar" src="https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png" alt="avatar">
                </div>
                <div class="${prefix}__user__info">
                    <div class="${prefix}__name"></div>
                    <div class="${prefix}__username"></div>
                </div>
            </div>
            <div class="${prefix}__status">
                <div class="${prefix}__status__box">
                    <div class="${prefix}__repos ${prefix}__status__count"></div>
                    <div class="${prefix}__status__label">Repos</div>
                </div>
                <div class="${prefix}__status__box">
                    <div class="${prefix}__followers ${prefix}__status__count"></div>
                    <div class="${prefix}__status__label">Followers</div>
                </div>
                <div class="${prefix}__status__box">
                    <div class="${prefix}__following ${prefix}__status__count"></div>
                    <div class="${prefix}__status__label">Following</div>
                </div>
            </div>
        </a>
    </div>`;
    var widget = document.querySelector(base);
    widget.innerHTML = tpl;
    return;
}

/**
 * renderData maps api result data to GW template
 * @param  {JSON}   data        JSON data from github
 * @param  {String} prefix      widget prefix for BEM classes
 */
function renderData(data, prefix) {
    var $ = document.querySelector,
        doc = document;

    var widget = $.call(doc, '.' + prefix);

    var widgetTextData = [
        {
            value: data.name,
            class: `${prefix}__name`
        },
        {
            value: '@' + data.login,
            class: `${prefix}__username`
        },
        {
            value: data.public_repos,
            class: `${prefix}__repos`
        },
        {
            value: data.followers,
            class: `${prefix}__followers`
        },
        {
            value: data.following,
            class: `${prefix}__following`
        }
    ];
    var widgetAttrData = [
        {
            attr: 'src',
            value: data.avatar_url,
            class: `${prefix}__avatar`
        },
        {
            attr: 'href',
            value: data.avatar_url,
            class: `${prefix}__link`
        }
    ];

    widgetTextData.map(function(item) {
        var textnode = $.call(doc, '.' + item.class);
        textnode.innerHTML = item.value;
    });

    widgetAttrData.map(function(item) {
        var textnode = $.call(doc, '.' + item.class);
        textnode[item.attr] = item.value;
    });
    return;
}

/**
 * getGithubProfile makes AJAX call to get user profile data
 * @param {String} username     github username
 * @param {String} prefix       widget prefix class
 */
function fetchGithubProfile(username, prefix) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        var res = JSON.parse(this.response);
        renderData(res, prefix);
        return;
    });
    req.open('GET', 'https://api.github.com/users/' + username);
    req.send();
    return;
}

function init() {
    var baseClass    = '.github-widget',
        widgetPrefix = 'gw';

    var baseNode = document.querySelector(baseClass);
    var username = baseNode.getAttribute('data-username');

    if (username) {
        renderSkeletonTpl(baseClass, widgetPrefix);
        fetchGithubProfile(username, widgetPrefix);
    }
}

init();
