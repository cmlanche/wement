
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
    wm_wement = JSON.parse(data);
    if(wm_wement.code === -1){
        // unauth
        wm_requestAuth();
    }else{
        wm_log("success");
        document.getElementById("wm-user-info").innerText = wm_wement.data.map.user.map.nickname;
    }
}

/**
 * 添加一条评论
 */
function wm_addComment() {
    if(wm_wement){
        let content = document.getElementById("wm-content-input").value;
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
                let dom_comment = document.getElementById("wm_comments");
                for(let comment of json.data.map.comments.list){
                    wm_log(comment.map);
                    let dom_comment_item = document.createElement("div");
                    dom_comment_item.className = "wm-comment-item";
                    dom_comment_item.innerHTML = `<span>${comment.map.content}</span>`;
                    dom_comment.appendChild(dom_comment_item);
                }
                wm_log("get comments success");
            }else{
                wm_log("get comments failed, case:" + res);
            }
        });
    }
}

function wm_getWebsiteId() {
    return wm_wement.data.map.website.map._id;
}