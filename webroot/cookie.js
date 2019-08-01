var cookieScripts = document.getElementsByTagName("script"),
    cookieScriptSrc = cookieScripts[cookieScripts.length - 1].src,
    cookieQuery = null,
    cookieScriptPosition = "top",
    // cookieScriptSource = "servizi.informcity.it",
    cookieScriptDomain = "",
    // cookieScriptReadMore = "http://www.corvallis.it/Apps/WebObjects/Corvallis.woa/1/wa/viewSection?id=928&lang=ita",
    cookieId = "cookie",
    cookieScriptDebug = 0,
    // cookieScriptTitle = '<h4 id="cookiescript_header">INFORMATIVA SUI COOKIE</h4>',
    // cookieScriptTitle = '',
    //cookieScriptDesc = "Questo sito utilizza solo cookie tecnici per il corretto funzionamento delle pagine web e per il miglioramento dei servizi.<br />Se vuoi saperne di più o negare il consenso consulta l'informativa sulla privacy.<br />Cliccando su 'Accetto' acconsenti all'uso dei cookie.<br />",
    // cookieScriptDesc = "Questo sito utilizza solo cookie tecnici per il corretto funzionamento delle pagine web e per il miglioramento dei servizi.<br />Utilizzando il sito si intende accettata la Cookie Policy.",
    //cookieScriptDesc = "Questo sito utilizza cookies tecnici per migliorare l'esperienza utente.<br />Navigando sul sito stai dando il tuo implicito consenso all'utilizzo di cookies.",
    cookieScriptAccept = "Accetto",
    cookieScriptMore = "Informazioni",
    cookieScriptCopyrights = "Accetto",
    cookieBackground = "#111",
    cookieTextColor = "#FFF",
    cookieScriptLoadJavaScript = function(k, p) {
        var f = document.getElementsByTagName("head")[0],
            a = document.createElement("script");
        a.type = "text/javascript";
        a.src = k;
        void 0 != p && (a.onload = a.onreadystatechange = function() {
            a.readyState && !/loaded|complete/.test(a.readyState) || (a.onload = a.onreadystatechange = null, f && a.parentNode && f.removeChild(a), a = void 0, p())
        });
        f.insertBefore(a,
            f.firstChild)
    },
    InjectCookieScript = function() {
        function k(a) {
            "show" == a ? (cookieQuery("#cookiescript_overlay", cookieScriptWindow).show(), cookieQuery("#cookiescript_info_box", cookieScriptWindow).show()) : "hide" == a && (cookieQuery("#cookiescript_overlay", cookieScriptWindow).hide(), cookieQuery("#cookiescript_info_box", cookieScriptWindow).hide())
        }

        function p() {
            cookieScriptDebug && (console.log(window.location.host), console.log(cookieQuery.cookie()));
            var a = cookieQuery.cookie(),
                e;
            for (e in a)
                if (!cookieQuery.removeCookie(e)) {
                    cookiePossibleHosts = [window.location.host, "." + window.location.host];
                    a = /[a-z-0-9]{2,63}.[a-z.]{2,5}$/.exec(window.location.host);
                    a = window.location.host.replace(a[0], "").slice(0, -1);
                    "" != a && cookiePossibleHosts.push(window.location.host.substr(a.length));
                    for (var b in cookiePossibleHosts) cookieQuery.removeCookie(e, {
                        path: "/",
                        domain: cookiePossibleHosts[b]
                    }) && cookieScriptDebug && console.log("deleting cookie:" + e + "| domain:" + cookiePossibleHosts[b])
                }
        }

        function f() {
            cookieQuery('script.cscookiesaccepted[type="text/plain"]').each(function() {
                cookieQuery(this).attr("src") ?
                    cookieQuery(this).after('<script type="text/javascript" src="' + cookieQuery(this).attr("src") + '">\x3c/script>') : cookieQuery(this).after('<script type="text/javascript">' + cookieQuery(this).html() + "\x3c/script>");
                cookieQuery(this).empty()
            })
        }
        cookieScriptDropfromFlag = 0;
        //HOOK
        // if (cookieScriptSrc != "http://www.marcucciogemel.it/cookie.js" && cookieScriptSrc != "http://www.marcucciogemel.it/cookie.js" && cookieScriptSrc != "http://www.marcucciogemel.it/cookie.js" && "" != cookieScriptSrc) return !1;
        cookieScriptDroptoFlag = 0;
        cookieScriptCreateCookie = function(a, e, b) {
            var d = "",
                g;
            b && (g = new Date, g.setTime(g.getTime() + 864E5 * b), d = "; expires=" + g.toGMTString());
            b = "";
            "" != cookieScriptDomain && (b = "; domain=" + cookieScriptDomain);
            document.cookie = a + "=" + e + d + b + "; path=/"
        };
        cookieScriptReadCookie = function(a) {
            a += "=";
            for (var e = document.cookie.split(";"), b, d = 0; d < e.length; d++) {
                for (b = e[d];
                    " " == b.charAt(0);) b = b.substring(1, b.length);
                if (0 == b.indexOf(a)) return b.substring(a.length, b.length)
            }
            return null
        };
        cookieQuery(function() {
            cookieScriptWindow =
                window.document;
            cookieQuery("#cookiescript_injected", cookieScriptWindow).remove();
            cookieQuery("#cookiescript_overlay", cookieScriptWindow).remove();
            cookieQuery("#cookiescript_info_box", cookieScriptWindow).remove();
            if ("visit" == cookieScriptReadCookie("cookiescriptaccept")) return !1;
            cookieQuery("body", cookieScriptWindow).append('<div id="cookiescript_injected"><div id="cookiescript_wrapper">' + cookieScriptTitle + cookieScriptDesc + '<div id="cookiescript_buttons"><div id="cookiescript_accept">' + cookieScriptAccept +
                '</div><div id="cookiescript_readmore">' + cookieScriptMore + '</div></div><a href="//' + cookieScriptSource + '" target="_blank" id="cookiescript_link" style="display:block !important"></a><div id="cookiescript_pixel"></div></div>');
            cookieQuery("#cookiescript_injected", cookieScriptWindow).css({
                "background-color": "#111111",
                "z-index": 999999,
                opacity: 1,
                position: "fixed",
                padding: "15px 0px 5px 0",
                width: "100%",
                left: 0,
                "font-size": "13px",
                "font-weight": "normal",
                "text-align": "left",
                color: "#FFFFFF",
                "font-family": "Arial, sans-serif",
                display: "none",
                "-moz-box-shadow": "0px 0px 8px #000000",
                "-webkit-box-shadow": "0px 0px 8px #000000",
                "box-shadow": "0px 0px 8px #000000"
            });
            cookieQuery("#cookiescript_buttons", cookieScriptWindow).css({
                width: "204px",
                margin: "0 auto",
                "font-size": "13px",
                "font-weight": "normal",
                "text-align": "center",
                "font-family": "Arial, sans-serif"
            });
            cookieQuery("#cookiescript_wrapper", cookieScriptWindow).css({
                width: "100%",
                margin: "0 auto",
                "font-size": "13px",
                "font-weight": "normal",
                "text-align": "center",
                color: "#FFFFFF",
                "font-family": "Arial, sans-serif",
                "line-height": "18px"
            });
            "top" == cookieScriptPosition ? cookieQuery("#cookiescript_injected", cookieScriptWindow).css("top", 0) : cookieQuery("#cookiescript_injected", cookieScriptWindow).css("bottom", 0);
            cookieQuery("#cookiescript_injected h4#cookiescript_header", cookieScriptWindow).css({
                "background-color": "#111111",
                "z-index": 999999,
                padding: "0 0 7px 0",
                "text-align": "center",
                color: "#FFFFFF",
                "font-family": "Arial, sans-serif",
                display: "block",
                "font-size": "15px",
                "font-weight": "bold",
                margin: "0"
            });
            cookieQuery("#cookiescript_injected span", cookieScriptWindow).css({
                display: "block",
                "font-size": "100%",
                margin: "5px 0"
            });
            cookieQuery("#cookiescript_injected a", cookieScriptWindow).css({
                "text-decoration": "underline",
                color: cookieTextColor
            });
            cookieQuery("#cookiescript_injected a#cookiescript_link", cookieScriptWindow).css({
                "text-decoration": "none",
                color: "#FFFFFF",
                "font-size": "85%",
                "text-decoration": "none",
                "float": "right",
                padding: "0px 10px 0 0"
            });
            cookieQuery("#cookiescript_injected div#cookiescript_accept,#cookiescript_injected div#cookiescript_readmore",
                cookieScriptWindow).css({
                "-webkit-border-radius": "5px",
                "-khtml-border-radius": "5px",
                "-moz-border-radius": "5px",
                "border-radius": "5px",
                border: 0,
                padding: "6px 10px",
                "font-weight": "bold",
                cursor: "pointer",
                margin: "5px 0px",
                "-webkit-transition": "0.25s",
                "-moz-transition": "0.25s",
                transition: "0.25s",
                "text-shadow": "rgb(0, 0, 0) 0px 0px 2px"
            });
            cookieQuery("#cookiescript_injected div#cookiescript_readmore", cookieScriptWindow).css({
                "background-color": "#697677",
                color: "#FFFFFF",
                "float": "right"
            });
            cookieQuery("#cookiescript_injected div#cookiescript_accept",
                cookieScriptWindow).css({
                "background-color": "#3068B2",
                color: "#FFFFFF",
                "float": "left"
            });
            cookieQuery("#cookiescript_injected div#cookiescript_pixel", cookieScriptWindow).css({
                width: "1px",
                height: "1px",
                "float": "left"
            });
            cookieQuery("#cookiescript_injected", cookieScriptWindow).fadeIn(1E3);
            cookieQuery("#cookiescript_injected div#cookiescript_accept", cookieScriptWindow).click(function() {
                cookieQuery("#cookiescript_injected", cookieScriptWindow).fadeOut(200);
                cookieScriptCreateCookie("cookiescriptaccept", "visit",
                    30);
                k("hide");
                f()
            });
            cookieQuery("#cookiescript_injected div#cookiescript_readmore", cookieScriptWindow).click(function() {
                window.open(cookieScriptReadMore, "_blank");
                return !1
            });
            cookieQuery("#cookiescript_overlay", cookieScriptWindow).click(function() {
                k("hide")
            });
            cookieQuery("#cookiescript_info_close", cookieScriptWindow).click(function() {
                k("hide")
            });
            document.onkeydown = function(a) {
                a = a || window.event;
                27 == a.keyCode && k("hide")
            }
        });
        (function(a) {
            "function" === typeof define && define.amd ? define(["jquery"], a) : "object" ===
                typeof exports ? a(require("jquery")) : a(cookieQuery)
        })(function(a) {
            function e(a) {
                a = g.json ? JSON.stringify(a) : String(a);
                return g.raw ? a : encodeURIComponent(a)
            }

            function b(b, e) {
                var c;
                if (g.raw) c = b;
                else a: {
                    var h = b;
                    0 === h.indexOf('"') && (h = h.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
                    try {
                        h = decodeURIComponent(h.replace(d, " "));
                        c = g.json ? JSON.parse(h) : h;
                        break a
                    } catch (f) {}
                    c = void 0
                }
                return a.isFunction(e) ? e(c) : c
            }
            var d = /\+/g,
                g = a.cookie = function(m, f, c) {
                    if (void 0 !== f && !a.isFunction(f)) {
                        c = a.extend({}, g.defaults,
                            c);
                        if ("number" === typeof c.expires) {
                            var h = c.expires,
                                d = c.expires = new Date;
                            d.setTime(+d + 864E5 * h)
                        }
                        return document.cookie = [g.raw ? m : encodeURIComponent(m), "=", e(f), c.expires ? "; expires=" + c.expires.toUTCString() : "", c.path ? "; path=" + c.path : "", c.domain ? "; domain=" + c.domain : "", c.secure ? "; secure" : ""].join("")
                    }
                    c = m ? void 0 : {};
                    for (var h = document.cookie ? document.cookie.split("; ") : [], d = 0, k = h.length; d < k; d++) {
                        var l = h[d].split("="),
                            n;
                        n = l.shift();
                        n = g.raw ? n : decodeURIComponent(n);
                        l = l.join("=");
                        if (m && m === n) {
                            c = b(l, f);
                            break
                        }
                        m ||
                            void 0 === (l = b(l)) || (c[n] = l)
                    }
                    return c
                };
            g.defaults = {};
            a.removeCookie = function(b, d) {
                if (void 0 === a.cookie(b) || "gifexclusioncookiecheck" == b) return !1;
                a.cookie(b, "", a.extend({}, d, {
                    expires: -1
                }));
                return !a.cookie(b)
            }
        });
        "visit" != cookieScriptReadCookie("cookiescriptaccept") && setTimeout(p, 500);
        "visit" == cookieScriptReadCookie("cookiescriptaccept") && f()
    };
window.jQuery && jQuery.fn && /^(1\.[8-9]|2\.[0-9])/.test(jQuery.fn.jquery) ? (cookieScriptDebug && window.console && console.log("Using existing jQuery version " + jQuery.fn.jquery), cookieQuery = window.jQuery, InjectCookieScript()) : (cookieScriptDebug && window.console && console.log("Loading jQuery 1.8.1 from ajax.googleapis.com"), cookieScriptLoadJavaScript(("https:" == document.location.protocol ? "https://" : "http://") + "ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js", function() {
    cookieQuery = jQuery.noConflict(!0);
    InjectCookieScript()
}));