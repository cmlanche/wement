
import {http, wm_getCookie} from './utils.js'

// http.get('/test').then(data=>{
//     console.log(data)
// });

let wm_token = wm_getCookie("wm_token");
let wm_debug = true;
let wm_wement;
let wm_appid = "8659f72674440553f1ee7890cc25a4b1";

// check token

if(wm_token){
    wm_log("i got token, it is " + wm_token);
    wm_getWementInfo();
} else {
    wm_log("no token yet, request it");
    wm_requestAuth();
}

document.getElementById("wm-add-comment-btn").onclick = function (e) {
    wm_log("commit btn clicked");
    wm_addComment();
};

wm_autofit_textarea(document.getElementById("wm-content-textarea"));

/**
 * 请求授权
 */
function wm_requestAuth() {
    let path = document.location.origin + document.location.pathname;
    wm_log(path);
    http.get(`/login/github/` + encodeURIComponent(path)).then(authurl=>{
        window.location.href = authurl;
    });
}

/**
 * 获取用户信息
 */
function wm_getWementInfo() {
    http.post("/wementinfo", {"appid": wm_appid, "domain": document.location.host}).then(data=>{
        if(data){
            wm_setWementInfo(data);
            wm_getComments();
        }
        wm_log(data);
    })
}

function wm_log(msg) {
    if(wm_debug){
        console.log(msg);
    }
}

/**
 * 设置用户的信息
 * @param userinfo
 */
function wm_setWementInfo(data) {
    if(data.code == -1){
        // unauth
        wm_requestAuth();
    }else if(data.code == 0){
        wm_log("success");
        document.getElementById("wm-user-headimage").src = wm_wement.user.headimage;
    } else {
        wm_log(data.message);
    }
}

/**
 * 添加一条评论
 */
function wm_addComment() {
    if(wm_wement){
        let dom_editor = document.getElementById("wm-content-textarea");
        let content = dom_editor.value;
        http.post("/comment/add", {
            "websiteId": wm_getWebsiteId(),
            "domain": document.location.host,
            "postUrl": document.location.href,
            "content": content
        }).then(res=>{
            if(res){
                let json = JSON.parse(res);
                if(json.code == 0){
                    wm_log("add comment success");
                    dom_editor.value = "";
                    wm_ui_addcomment(document.getElementById("wm_comment"), json);
                }else{
                    wm_log("add comment failed, case:" + res);
                }
            }
        });
    }else{
        log("you are not login yet.");
    }
}

/**
 * 删除一条评论
 */
window.wm_delComment = function (e, id) {
    let confirm = window.confirm("确定要删除这条评论吗？");
    if(confirm){
        http.post("/comment/delete", {
            "_id": id
        }).then(res=>{
            if(res){
                let json = JSON.parse(res);
                if(json.code == 0){
                    let dom_comment = document.getElementById("wm_comment");
                    if(dom_comment){
                        dom_comment.removeChild(document.getElementById(id));
                    }
                    wm_log("delete comment success");
                }else{
                    wm_log("delete comment failed, case: " + res);
                }
            }
        });
    }else{
    }
};

/**
 * 获取当前页面评论列表
 */
function wm_getComments() {
    if(wm_wement){
        http.post("/comments/list", {
            "websiteId": wm_getWebsiteId(),
            "postUrl": document.location.href
        }).then(res=>{
            let json = JSON.parse(res);
            if(json.code == 0){
                let dom_comment = document.getElementById("wm_comment");
                for(let comment of json.comments){
                    wm_ui_addcomment(dom_comment, comment);
                }
                wm_log("get comments success");
            }else{
                wm_log("get comments failed, case:" + res);
            }
        });
    }
}

/**
 * 添加一条评论
 * @param e
 * @param comment
 */
function wm_ui_addcomment(e, comment) {
    wm_log(comment);
    let content = comment.content;
    let dom_comment_item = document.createElement("div");
    dom_comment_item.className = "wm-comment-item";
    dom_comment_item.id = comment._id;

    // 添加头像
    let dom_comment_user = document.createElement("div");
    dom_comment_user.className = "wm-user";
    let dom_comment_userimage = document.createElement("img");
    dom_comment_userimage.className = "wm-user-headimage";
    dom_comment_userimage.src = "wm_default_headimage.jpg";
    dom_comment_user.appendChild(dom_comment_userimage);

    // 添加评论内容
    let dom_comment_content = document.createElement("div");
    dom_comment_content.className = "wm-comment-content";

    let feedback;
    if(wm_wement.user._id != comment.wmUserid){
        feedback = `<a>回复</a>
                                    <a>赞</a>`;
    }else{
        feedback = `<a href="javascript:void(0)" onclick="wm_delComment(this, '${comment._id}')">删除</a>`;
    }
    dom_comment_content.innerHTML =
        `<div class="wm-user-name">
                             cmlanche
                        </div>
                        <div class="wm-comment-user-content">
                            <p>${content}</p>
                            <div class="wm-comment-user-content-bottom">
                                <time>2年前<time/>
                                <span>
                                    ${feedback}
                                </span>
                                <span class="wm-comment-user-content-bottom-sup">5赞</span>
                            </div>
                        </div>`;

    dom_comment_item.appendChild(dom_comment_user);
    dom_comment_item.appendChild(dom_comment_content);

    e.appendChild(dom_comment_item);
}

function wm_getWebsiteId() {
    return wm_wement.website._id;
}

function wm_autofit_textarea(elem, extra, maxHeight) {
    extra = extra || 0;
    var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
        isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
        addEvent = function (type, callback) {
            elem.addEventListener ?
                elem.addEventListener(type, callback, false) :
                elem.attachEvent('on' + type, callback);
        },
        getStyle = elem.currentStyle ? function (name) {
                var val = elem.currentStyle[name];

                if (name === 'height' && val.search(/px/i) !== 1) {
                    var rect = elem.getBoundingClientRect();
                    return rect.bottom - rect.top -
                        parseFloat(getStyle('paddingTop')) -
                        parseFloat(getStyle('paddingBottom')) + 'px';
                };

                return val;
            } : function (name) {
                return getComputedStyle(elem, null)[name];
            },
        minHeight = parseFloat(getStyle('height'));

    elem.style.resize = 'none';

    var change = function () {
        var scrollTop, height,
            padding = 0,
            style = elem.style;

        if (elem._length === elem.value.length) return;
        elem._length = elem.value.length;

        if (!isFirefox && !isOpera) {
            padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
        };
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        elem.style.height = minHeight + 'px';
        if (elem.scrollHeight > minHeight) {
            if (maxHeight && elem.scrollHeight > maxHeight) {
                height = maxHeight - padding;
                style.overflowY = 'auto';
            } else {
                height = elem.scrollHeight - padding;
                style.overflowY = 'hidden';
            };
            style.height = height + extra + 'px';
            scrollTop += parseInt(style.height) - elem.currHeight;
            document.body.scrollTop = scrollTop;
            document.documentElement.scrollTop = scrollTop;
            elem.currHeight = parseInt(style.height);
        };
    };

    addEvent('propertychange', change);
    addEvent('input', change);
    addEvent('focus', change);
    change();
};