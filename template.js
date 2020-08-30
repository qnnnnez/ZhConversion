// ==UserScript==
// @name:zh-CN   繁体转换
// @name:en      Convert Traditional Chinese to Simplified Chinese
// @namespace    qnnnez
// @version      0.0.1
// @description:zh-CN  将任意网站上的繁体文字转换成简体
// @author       qnnnnez
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    var char_conv = __CHAR_CONV__;

    const regex_expr = new RegExp(char_conv.regex, 'g');
    const replace_map = char_conv.replace_map;
    char_conv = null;

    function translateText(txt) {
        if (!txt) {
            return "";
        }
        return txt.replace(regex_expr, word => replace_map[word]);
    }

    function translateBody(pNode) {
        var childs;
        if (pNode) {
            childs = pNode.childNodes;
        } else {
            childs = document.documentElement.childNodes;
        }
        if (childs) {
            for (var i = 0; i < childs.length; i++) {
                var child = childs.item(i);
                if (/BR|META|SCRIPT|HR|TEXTAREA/.test(child.tagName)) continue;
                if (child.title) {
                    let title = translateText(child.title);
                    if (child.title != title) {
                        child.title = title;
                    }
                }
                if (child.alt) {
                    let alt = translateText(child.alt);
                    if (child.alt != alt) {
                        child.alt = alt;
                    }
                }
                if (child.tagName == "INPUT" && child.value !== "" && child.type != "text" && child.type != "search" && child.type != "hidden") {
                    let value = translateText(child.value);
                    if (child.value != value) {
                        child.value = value;
                    }
                } else if (child.nodeType == 3) {
                    let data = translateText(child.data);
                    if (child.data != data) {
                        child.data = data;
                    }
                } else translateBody(child);
            }
        }
    }

    document.title = translateText(document.title);
    translateBody(document.body);

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function (records) {
        records.map(function (record) {
            if (record.addedNodes) {
                [].forEach.call(record.addedNodes, function (item) {
                    translateBody(item);
                });
            }
        });
    });
    var option = {
        'childList': true,
        'subtree': true
    };
    observer.observe(document.body, option);

    console.log("繁体转换加载完毕，已加载", replace_map.size, "条转换规则。");
})();
