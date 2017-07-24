/**
 * Created by cmlanche on 2017/7/23.
 */

let product = false;
let protocal = "http";
let product_host = "119.23.204.101";
let local_host = "localhost:9000";

/**
 * 获取主机地址
 * @returns {*}
 */
export function getHost() {
    if(product){
        return product_host;
    }else{
        return local_host;
    }
}

/**
 * 协议
 */
export function getProtocal() {
    return protocal;
}

export function getBaseUrl() {
    return `${getProtocal()}://${getHost()}`;
}