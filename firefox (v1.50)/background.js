/*--------------------------------------------------------------
>>> BACKGROUND:
----------------------------------------------------------------
1.0 Global variables
2.0 Functions
3.0 Context menu items
4.0 Message listener
5.0 Storage change listener
6.0 Initialization
7.0 Uninstall URL
8.0 Google analytics
--------------------------------------------------------------*/

/*-----------------------------------------------------------------------------
1.0 Global variables
-----------------------------------------------------------------------------*/

var locale_code = 'en',
    browser_icon = false;


/*-----------------------------------------------------------------------------
2.0 Functions
-----------------------------------------------------------------------------*/

function isset(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
}

function getTranslations() {
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function() {
        if (chrome && chrome.tabs) {
            chrome.tabs.query({}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].hasOwnProperty('url')) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            name: 'improvedtube_translation_response',
                            value: xhr.responseText
                        });
                    }
                }
            });
        }

        chrome.runtime.sendMessage({
            name: 'improvedtube_translation_response',
            value: xhr.responseText
        });
    });

    xhr.open('POST', '../_locales/' + locale_code + '/messages.json', true);
    xhr.send();
}

function browserActionIcon() {
    if (browser_icon === 'always') {
        chrome.browserAction.setIcon({
            path: 'extension/img/32.png'
        });
    } else {
        chrome.browserAction.setIcon({
            path: 'extension/img/32g.png'
        });
    }
}


/*-----------------------------------------------------------------------------
3.0 Context menu items
-----------------------------------------------------------------------------*/

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    id: '1111',
    title: 'Donate',
    contexts: ['browser_action']
});

chrome.contextMenus.create({
    id: '1112',
    title: 'Rate me',
    contexts: ['browser_action']
});

chrome.contextMenus.create({
    id: '1113',
    title: 'GitHub',
    contexts: ['browser_action']
});

chrome.contextMenus.onClicked.addListener(function(event) {
    if (event.menuItemId === '1111') {
        window.open('http://www.improvedtube.com/donate');
    } else if (event.menuItemId === '1112') {
        window.open('https://chrome.google.com/webstore/detail/improvedtube-for-youtube/bnomihfieiccainjcjblhegjgglakjdd');
    } else if (event.menuItemId === '1113') {
        window.open('https://github.com/ImprovedTube/ImprovedTube');
    }
});


/*-----------------------------------------------------------------------------
4.0 Message listener
-----------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (isset(request) && typeof request === 'object') {
        if (request.enabled === true && browser_icon !== 'always') {
            chrome.browserAction.setIcon({
                path: 'extension/img/32.png',
                tabId: sender.tab.id
            });
        }

        if (request.name === 'improvedtube_translation_request') {
            getTranslations();
        }

        if (request === 'improvedtube_translation_request') {
            getTranslations();
        }

        if (isset(request.export)) {
            chrome.storage.local.get(function(data) {
                chrome.permissions.request({
                    permissions: ['downloads'],
                    origins: ['https://www.youtube.com/*']
                }, function(granted) {
                    if (granted) {
                        var blob = new Blob([JSON.stringify(data)], {
                                type: 'application/octet-stream'
                            }),
                            date = new Date();

                        chrome.downloads.download({
                            url: URL.createObjectURL(blob),
                            filename: 'improvedtube_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getFullYear() + '.json',
                            saveAs: true
                        });
                    }
                });
            });
        }
    }
});


/*-----------------------------------------------------------------------------
5.0 Storage change listener
-----------------------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function(changes) {
    if (isset(changes.improvedtube_language)) {
        locale_code = changes.improvedtube_language.newValue;
    }

    if (isset(changes.improvedtube_browser_icon)) {
        browser_icon = changes.improvedtube_browser_icon.newValue;
    }

    browserActionIcon();
});


/*-----------------------------------------------------------------------------
6.0 Initialization
-----------------------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    var version = chrome.runtime.getManifest().version;

    if (isset(items.improvedtube_language)) {
        locale_code = items.improvedtube_language;
    }

    if (isset(items.improvedtube_browser_icon)) {
        browser_icon = items.improvedtube_browser_icon;
    }

    browserActionIcon();

    if (chrome.runtime.getManifest().version === chrome.runtime.getManifest().version_name) {
        _gaq.push(['_trackPageview', '/background-' + version, 'page-loaded']);
    }
});


/*-----------------------------------------------------------------------------
7.0 Uninstall URL
-----------------------------------------------------------------------------*/

chrome.runtime.setUninstallURL('http://improvedtube.com/uninstalled');


/*-----------------------------------------------------------------------------
8.0 Google analytics
-----------------------------------------------------------------------------*/

if (chrome.runtime.getManifest().version === chrome.runtime.getManifest().version_name) {
    var _gaq = _gaq || [];

    _gaq.push(['_setAccount', 'UA-88354155-1']);
    _gaq.push(['_setSessionCookieTimeout', 14400000]);

    (function() {
        var ga = document.createElement('script'),
            s = document.getElementsByTagName('script')[0];

        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        s.parentNode.insertBefore(ga, s);
    })();
}