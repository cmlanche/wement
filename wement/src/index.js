
import {http, wm_getCookie} from './utils.js'
import * as autosize from './autosize.js';

function init() {
    let userinput = wm_getUserInputHtml();
    let html = `<div class="wm-comment-header">
        </div>
        ${userinput}
        <div class="wm-seperator">
        </div>
        <div class="wm-comment-item">
        </div>`;
    let wm_comment = document.getElementById("wm_comment");
    wm_comment.innerHTML = html;
    let wm_inputs = wm_comment.querySelectorAll(".wm-input");
    for(let e of wm_inputs){
        wm_init_input(e, true); // return the first wm_input element
    }
}

function wm_init_input(wm_input, isRoot) {
    let wm_textarea = wm_input.querySelector(".wm-content-textarea");
    let wm_commit = wm_input.querySelector(".wm-commit-btns");
    if(isRoot){
        wm_commit.style.display = "none";
    }

    wm_textarea.onfocus = function () {
        if(wm_commit.style.display == "none"){
            wm_commit.style.display = "inline-block";
        }
    };

    if(wm_wement != undefined && wm_wement != null){
        wm_input.querySelector(".wm-user-headimage").src = wm_wement.user.headimage;
    }

    let wm_cancel_comment_btn = wm_input.querySelector(".wm-cancel-comment-btn");
    wm_cancel_comment_btn.onclick = function () {
        if(isRoot){
            wm_commit.style.display = "none";
        }else{
            wm_input.parentNode.parentNode.removeChild(wm_input.parentNode);
        }
    };
    wm_input.querySelector(".wm-add-comment-btn").onclick = function (e) {
        wm_log("commit btn clicked");
        wm_addComment(e);
    };

    autosize(wm_textarea);
}

function wm_getUserInputHtml() {
    return `<div class="wm-input">
            <div class="wm-user">
                <img class="wm-user-headimage" src="wm_default_headimage.jpg">
            </div>
            <div class="wm-textarea">
                   <textarea class="wm-content-textarea" rows="1" placeholder="写下你的评论..."></textarea>     
                   <div class="wm-commit-btns">
                        <button class="wm-cancel-comment-btn" type="button">取消</button>
                        <button class="wm-add-comment-btn" type="button">提交</button>
                   </div>
            </div>
        </div>`;
}

let wm_debug = true;
let wm_wement;
let wm_appid;

init();
wm_run();

function wm_run() {
    let hash = window.location.hash;
    if(hash != undefined && hash != ""){
        hash = hash.substring(1, hash.length);
        localStorage.setItem("wm-token", hash);
        location.replace(location.pathname + location.search);
        return
    }

    let wm_token = localStorage.getItem("wm-token");

    wm_log(wm_token);

    if((typeof wement) == "undefined" || (wm_token == undefined)
        || (typeof wement.appid) == "undefined" || wement.appid == ""){
        wm_appid = undefined;
    }else{
        wm_appid = wement.appid;
    }

    if(wm_appid != undefined){
        // check token
        if(wm_token){
            wm_log("i got token, it is " + wm_token);
            wm_getWementInfo();
        } else {
            wm_log("no token yet, request it");
            wm_requestAuth();
        }
    }else{
        alert("请设置wement.io的appid");
    }
}

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
 * @param data
 */
function wm_setWementInfo(data) {
    if(data.code == -1){
        // unauth
        wm_requestAuth();
    }else if(data.code == 0){
        wm_log("success");
        wm_wement = data;
        document.querySelector(".wm-user-headimage").src = wm_wement.user.headimage;
        wm_getComments();
    } else {
        wm_log(data.message);
    }
}

/**
 * 添加一条评论
 */
function wm_addComment(e) {
    if(wm_wement){
        let dom_editor = e.target.parentNode.parentNode.querySelector(".wm-content-textarea");
        let content = dom_editor.value;
        let which = e.target.parentNode.parentNode.parentNode.parentNode;
        let id = null;
        if(which.className == "feedback"){
            id = which.parentNode.parentNode.id;
        }
        if(content.trim() == "") {
            alert("评论内容不能为空");
            return
        }
        http.post("/comment/add", {
            "websiteId": wm_getWebsiteId(),
            "domain": document.location.host,
            "postUrl": document.location.href,
            "content": content,
            "parent": id
        }).then(res=>{
            if(res.code == 0){
                wm_log("add comment success");
                dom_editor.value = "";
                autosize.update(dom_editor);
                wm_ui_addcomment(document.getElementById("wm_comment"), res);
            }else{
                wm_log("add comment failed, case:" + res);
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
            "id": id
        }).then(res=>{
            if(res.code == 0){
                let dom_comment = document.getElementById("wm_comment");
                if(dom_comment){
                    dom_comment.removeChild(document.getElementById(id));
                }
                wm_log("delete comment success");
            }else{
                wm_log("delete comment failed, case: " + res);
            }
        });
    }else{
    }
};

/**
 * 回复
 * @param e
 * @param id
 */
window.wm_feedback = function (e, id) {
    let wm_comment_content = e.parentNode.parentNode.parentNode.parentNode;
    let feedback = wm_comment_content.querySelector(".feedback");
    if(feedback == null){
        let feedback = document.createElement("div");
        feedback.className = "feedback";
        feedback.innerHTML = wm_getUserInputHtml();
        wm_comment_content.appendChild(feedback);
        wm_init_input(wm_comment_content.querySelector(".wm-input"));
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
            if(res.code == 0){
                let dom_comment = document.getElementById("wm_comment");
                for(let comment of res.comments){
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
    dom_comment_item.id = comment.id;

    // 添加头像
    let dom_comment_user = document.createElement("div");
    dom_comment_user.className = "wm-user";
    dom_comment_user.innerHTML = `<a href="${comment.homepage}" target="_blank"><img class="wm-user-headimage" src="${comment.headimage}"></a>`;

    // 添加评论内容
    let dom_comment_content = document.createElement("div");
    dom_comment_content.className = "wm-comment-content";

    let feedback;
    if(wm_wement.user.id == comment.userid){
        feedback = `<a href="javascript:void(0)" onclick="wm_feedback(this, '${comment.id}')">回复</a>`;
    }else{
        feedback = `<a href="javascript:void(0)" onclick="wm_delComment(this, '${comment.id}')">删除</a>`;
    }
    let homepagehost = "";
    if(comment.homepage && comment.homepagehost != ""){
        homepagehost = `<a href='${comment.homepage}' target="_blank">${comment.homepagehost}</a>`;
    }
    dom_comment_content.innerHTML =
        `<div class="wm-user-name">
                             cmlanche ${homepagehost}
                        </div>
                        <div class="wm-comment-user-content">
                            <p>${content}</p>
                            <div class="wm-comment-user-content-bottom">
                                <time>${comment.createdtime}</time>
                                <span>
                                    ${feedback}
                                </span>
                                <span class="wm-comment-user-content-bottom-sup"></span>
                            </div>
                        </div>`;

    dom_comment_item.appendChild(dom_comment_user);
    dom_comment_item.appendChild(dom_comment_content);

    e.appendChild(dom_comment_item);
}

function wm_getWebsiteId() {
    return wm_wement.website.id;
}