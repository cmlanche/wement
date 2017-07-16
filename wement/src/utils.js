import { LS_ACCESS_TOKEN_KEY } from './constants'

export const isString = s => toString.call(s) === '[object String]';

export function getTargetContainer(container) {
  let targetContainer
  if (container instanceof Element) {
    targetContainer = container
  } else if (isString(container)) {
    targetContainer = document.getElementById(container)
  } else {
    targetContainer = document.createElement('div')
  }

  return targetContainer
}

/**
 * 获取cookie
 * @param Name
 * @returns {string}
 */
export function wm_getCookie(Name) {
    var search = Name + "="//查询检索的值w
    var returnvalue = "";//返回值
    if (document.cookie.length > 0) {
        let sd = document.cookie.indexOf(search);
        if (sd!= -1) {
            sd += search.length;
            let end = document.cookie.indexOf(";", sd);
            if (end == -1)
                end = document.cookie.length;
            //unescape() 函数可对通过 escape() 编码的字符串进行解码。
            returnvalue=unescape(document.cookie.substring(sd, end))
        }
    }
    return returnvalue;
}

export const Query = {
  parse(search = window.location.search) {
    if (!search) return {};
    const queryString = search[0] === '?' ? search.substring(1) : search;
    const query = {};
    queryString.split('&')
      .forEach(queryStr => {
        const [key, value] = queryStr.split('=');
        if (key) query[key] = value
      });
    return query
  },
  stringify(query, prefix = '?') {
    const queryString = Object.keys(query)
      .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
      .join('&')
    return queryString ? prefix + queryString : ''
  },
}

function ajaxFactory(method) {
  return function(apiPath, data = {}, base = 'http://localhost:9000') {
    console.log(apiPath);
    const req = new XMLHttpRequest();
    const token = wm_getCookie("wm_token");

    let url = `${base}${apiPath}`;
    let body = null;
    if (method === 'GET' || method === 'DELETE') {
      url += Query.stringify(data)
    }

    const p = new Promise((resolve, reject) => {
      req.addEventListener('load', () => {
        const contentType = req.getResponseHeader('content-type');
        const res = req.responseText;
        if (!/json/.test(contentType)) {
          resolve(res);
          return
        }
        const data = JSON.parse(res);
        if (data) {
          resolve(data)
        }
      });
      req.addEventListener('error', error => reject(error))
    });
    req.open(method, url, true);

    if (token) {
      req.setRequestHeader('Authorization', `${token}`)
    }
    if (method !== 'GET' && method !== 'DELETE') {
      body = JSON.stringify(data);
      req.setRequestHeader('Content-Type', 'application/json')
    }

    req.send(body);
    return p
  }
}

export const http = {
  get: ajaxFactory('GET'),
  post: ajaxFactory('POST'),
  delete: ajaxFactory('DELETE'),
  put: ajaxFactory('PUT'),
};
