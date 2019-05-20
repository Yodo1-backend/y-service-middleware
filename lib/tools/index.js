/**
 * @author XiaChengxing
 * @date 2019/5/17 11:24 AM
 */

var tools = require('y-server-tools');
var index = module.exports = {};

index.tools = tools;

index.correctResult = function (data) {
    if (!data) {
        return {code: 200}
    }
    return {code: 200, data: data}
};

index.inCorrectResult = function (msg) {
    return {code: 210, msg: msg}
};

index.errorResult = function (err) {
    return {code: 500, err: err}
};

index.correctCode = function () {
    return 200;
};

index.inCorrectCode = function () {
    return 210;
};

index.errorCode = function () {
    return 500;
};