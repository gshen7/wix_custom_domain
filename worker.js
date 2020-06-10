const MY_DOMAIN = '';
const BASE_WIXSITE = '';
const WIX_PAGE_TITLE = 'Step Up Virtual';
const WIX_PAGE_DESCRIPTION = 'Virtual summer camp';
const ICON_LINK = 'https://img.icons8.com/material/4ac144/256/user-male.png'
const ID_TO_ANCHOR = {
    "a tag id": "anchor/id to scroll to", 
};
const DISABLE_IDS = [
    "a tag id"
]
const HIDE_IDS = [
    "a tag id"
]

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions(request) {
    if (request.headers.get('Origin') !== null &&
        request.headers.get('Access-Control-Request-Method') !== null &&
        request.headers.get('Access-Control-Request-Headers') !== null) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders
        });
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                'Allow': 'GET, HEAD, POST, PUT, OPTIONS',
            }
        });
    }
}

async function fetchAndApply(request) {
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    }
    let url = new URL(request.url);
    let response;

    const wixUrl = 'https://' + BASE_WIXSITE + '.wixsite.com/' + url.pathname;
    
    response = await fetch(wixUrl, {
        body: request.body,
        headers: request.headers,
        method: request.method,
    });
    response = new Response(response.body, response);
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('X-Content-Security-Policy');
    return wixAppendJavascript(response, ID_TO_ANCHOR, DISABLE_IDS, HIDE_IDS)
}

class WixHtmlRewriter {
    element(element) {
        element.setAttribute('style', 'scroll-behavior:smooth;')
    }
}

class WixMetaRewriter {
    element(element) {
        if (WIX_PAGE_TITLE !== '') {
            if (element.getAttribute('property') === 'og:title'
                || element.getAttribute('name') === 'twitter:title') {
                element.setAttribute('content', WIX_PAGE_TITLE);
            }
            if (element.tagName === 'title') {
                element.setInnerContent(WIX_PAGE_TITLE);
            }
        }
        if (WIX_PAGE_DESCRIPTION !== '') {
            if (element.getAttribute('name') === 'description'
                || element.getAttribute('property') === 'og:description'
                || element.getAttribute('name') === 'twitter:description') {
                element.setAttribute('content', WIX_PAGE_DESCRIPTION);
            }
        }
        if (element.getAttribute('property') === 'og:url'
            || element.getAttribute('name') === 'twitter:url') {
            element.setAttribute('content', MY_DOMAIN);
        }
        if (element.getAttribute('name') === 'apple-itunes-app') {
            element.remove();
        }
    }
}

class WixHeadRewriter {
    element(element) {
        element.append(`
      <script>
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        let head = document.querySelector('head');
        let headObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if ('${ICON_LINK}' != '') {
                    var link = document.querySelector("link[rel*='shortcut icon']") || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = '${ICON_LINK}';
                    
                    link = document.querySelector("link[rel*='apple-touch-icon']") || document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'apple-touch-icon';
                    link.href = '${ICON_LINK}';
                }
            });
        });
        headObserver.observe(head, { subtree: true, childList: true });  
        </script>
        `, {
            html: true
        });
    }
}

class WixBodyRewriter {
    constructor(ID_TO_ANCHOR, DISABLE_IDS, HIDE_IDS) {
        this.ID_TO_ANCHOR = ID_TO_ANCHOR;
        this.DISABLE_IDS = DISABLE_IDS;
        this.HIDE_IDS = HIDE_IDS;
    }
    element(element) {
        element.append(`
      <script>
        const DISABLE_IDS = ${JSON.stringify(this.DISABLE_IDS)};
        const HIDE_IDS = ${JSON.stringify(this.HIDE_IDS)};
        const ID_TO_ANCHOR = ${JSON.stringify(this.ID_TO_ANCHOR)};

        function hideElement(qs) {
            let eles = document.querySelectorAll(qs)
            eles && eles.forEach(ele => ele.style.display = "none")
        }
        function shiftElement(qs) {
            let eles = document.querySelectorAll(qs)
            eles && eles.forEach(ele => ele.style.top = "0px")
        }

        let BodyMutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        let body = document.querySelector('body');
        let bodyObserver = BodyMutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                for (var i = 0; i < HIDE_IDS.length; i++) {
                    hideElement("#"+HIDE_IDS[i])
                }
                hideElement("#WIX_ADS")
                shiftElement("#SITE_ROOT")

                var anchors = document.getElementsByTagName("a");
                for (var i = 0; i < anchors.length; i++) {
                    anchors[i].href = anchors[i].href.replace("https://${BASE_WIXSITE}.wixsite.com",'https://${MY_DOMAIN}')
                    if(Object.keys(ID_TO_ANCHOR).includes(anchors[i].id)){
                        let anchor = ID_TO_ANCHOR[anchors[i].id]
                        let base = anchors[i].href.indexOf("#") > -1 ? anchors[i].href.substring(0,anchors[i].href.indexOf("#")) : anchors[i].href
                        anchors[i].href = base + "#" + anchor
                    }
                    if(DISABLE_IDS.includes(anchors[i].id)) {
                        anchors[i].href=""
                        anchors[i].setAttribute("onclick", "return false;")
                    }
                }
            });
        });
        bodyObserver.observe(body, { subtree: true, childList: true });  
        </script>
        `, {
            html: true
        });
    }
}

async function wixAppendJavascript(res, ID_TO_ANCHOR, DISABLE_IDS, HIDE_IDS) {
    return new HTMLRewriter()
        .on('html', new WixHtmlRewriter())
        .on('title', new WixMetaRewriter())
        .on('meta', new WixMetaRewriter())
        .on('body', new WixBodyRewriter(ID_TO_ANCHOR, DISABLE_IDS, HIDE_IDS))
        .transform(res);
}

