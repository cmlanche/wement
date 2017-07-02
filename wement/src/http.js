/**
 * Created by cmlanche on 2017/6/12.
 */

let server = "http://localhost:9000";

let api_test = getAPI("/test");
let api_get_github_auth_url = getAPI("/login/github");
let api_github_oauth = getAPI("/oauth/github/code");

function getAPI(url) {
    return server  + url;
}

// test http connection
let p = new Promise((resolve, reject)=>$.get(api_test, resolve, "json"));
p.then(function (resp) {
    console.log(resp.usertype);
}).catch(function (err) {
    console.log("error");
});

export let github = new Promise((resolve, reject) => {
    $.get(api_get_github_auth_url, resolve, "json")
});

