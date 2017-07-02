/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(1);



// http.get('/test').then(data=>{
//     console.log(data)
// });

let wm_token = __WEBPACK_IMPORTED_MODULE_0__utils_js__["b" /* wm_getCookie */]("wm_token");
let wm_debug = true;
let wm_wement;
let wm_appid = "8659f72674440553f1ee7890cc25a4b1";

// check token

if (wm_token) {
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
    __WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* http */].get(`/login/github/` + encodeURIComponent("http://localhost:63343/wement/index.html")).then(authurl => {
        window.location.href = authurl;
    });
}

/**
 * 获取用户信息
 */
function wm_getWementInfo() {
    __WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* http */].post("/wementinfo", { "appid": wm_appid, "domain": document.location.host }).then(data => {
        if (data) {
            wm_setWementInfo(data);
        }
        wm_log(data);
    });
}

function wm_log(msg) {
    if (wm_debug) {
        console.log(msg);
    }
}

/**
 * 设置用户的信息
 * @param userinfo
 */
function wm_setWementInfo(data) {
    wm_wement = JSON.parse(data);
    if (wm_wement.code === -1) {
        // unauth
        wm_requestAuth();
    } else {
        wm_log("success");
        document.getElementById("wm-user-info").innerText = wm_wement.data.map.user.map.nickname;
    }
}

/**
 * 添加一条评论
 */
function wm_addComment() {
    if (wm_wement) {
        let content = document.getElementById("wm-content-input").value;
        __WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* http */].post("/comment/add", {
            "websiteId": wm_wement.data.map.website.map._id,
            "domain": document.location.host,
            "postUrl": document.location.href,
            "content": content
        }).then(res => {
            if (res) {
                let json = JSON.parse(res);
                if (json.code == 0) {
                    wm_log("add comment success");
                } else {
                    wm_log("add comment failed, case:" + res);
                }
            }
        });
    } else {
        log("you are not login yet.");
    }
}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export getTargetContainer */
/* harmony export (immutable) */ __webpack_exports__["b"] = wm_getCookie;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(2);


const isString = s => toString.call(s) === '[object String]';
/* unused harmony export isString */


function getTargetContainer(container) {
  let targetContainer;
  if (container instanceof Element) {
    targetContainer = container;
  } else if (isString(container)) {
    targetContainer = document.getElementById(container);
  } else {
    targetContainer = document.createElement('div');
  }

  return targetContainer;
}

/**
 * 获取cookie
 * @param Name
 * @returns {string}
 */
function wm_getCookie(Name) {
  var search = Name + "="; //查询检索的值w
  var returnvalue = ""; //返回值
  if (document.cookie.length > 0) {
    let sd = document.cookie.indexOf(search);
    if (sd != -1) {
      sd += search.length;
      let end = document.cookie.indexOf(";", sd);
      if (end == -1) end = document.cookie.length;
      //unescape() 函数可对通过 escape() 编码的字符串进行解码。
      returnvalue = unescape(document.cookie.substring(sd, end));
    }
  }
  return returnvalue;
}

const Query = {
  parse(search = window.location.search) {
    if (!search) return {};
    const queryString = search[0] === '?' ? search.substring(1) : search;
    const query = {};
    queryString.split('&').forEach(queryStr => {
      const [key, value] = queryStr.split('=');
      if (key) query[key] = value;
    });
    return query;
  },
  stringify(query, prefix = '?') {
    const queryString = Object.keys(query).map(key => `${key}=${encodeURIComponent(query[key] || '')}`).join('&');
    return queryString ? prefix + queryString : '';
  }
};
/* unused harmony export Query */


function ajaxFactory(method) {
  return function (apiPath, data = {}, base = 'http://localhost:9000') {
    console.log(apiPath);
    const req = new XMLHttpRequest();
    const token = wm_getCookie("wm_token");

    let url = `${base}${apiPath}`;
    let body = null;
    if (method === 'GET' || method === 'DELETE') {
      url += Query.stringify(data);
    }

    const p = new Promise((resolve, reject) => {
      req.addEventListener('load', () => {
        const contentType = req.getResponseHeader('content-type');
        const res = req.responseText;
        if (!/json/.test(contentType)) {
          resolve(res);
          return;
        }
        const data = req.responseText ? JSON.parse(res) : {};
        if (data.message) {
          reject(new Error(data.message));
        } else {
          resolve(data);
        }
      });
      req.addEventListener('error', error => reject(error));
    });
    req.open(method, url, true);

    if (token) {
      req.setRequestHeader('Authorization', `${token}`);
    }
    if (method !== 'GET' && method !== 'DELETE') {
      body = JSON.stringify(data);
      req.setRequestHeader('Content-Type', 'application/json');
    }

    req.send(body);
    return p;
  };
}

const http = {
  get: ajaxFactory('GET'),
  post: ajaxFactory('POST'),
  delete: ajaxFactory('DELETE'),
  put: ajaxFactory('PUT')
};
/* harmony export (immutable) */ __webpack_exports__["a"] = http;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const LS_ACCESS_TOKEN_KEY = 'wement-token';
/* unused harmony export LS_ACCESS_TOKEN_KEY */


/***/ })
/******/ ]);