/**
 * @author XiaChengxing
 * @date 2019/5/8 5:56 PM
 */

const poseidonClass = require('poseidon-node');
const tools = require('./index').tools;
// clients no config
var poseidonClients = {};
// clients with config
var poseidonConfigClients = {};
var serviceConfig = {};

var middleware = module.exports = {};
middleware.createClientWithConfig = function (_config, success) {
    if (!_config || !tools.isObj(_config) || Object.keys(_config).length <= 0) {
        throw new Error('Configuration must be Object and must have contents')
    }
    serviceConfig = _config;

    var typeKeys = {};
    for (var _c of Object.keys(serviceConfig)) {
        typeKeys[_c] = _c;
    }
    if (typeof success === 'function') {
        success('Plugin Poseidon configured successful with config ', _config);
    }

    var client = {};
    client.Type = function () {
        return typeKeys;
    };

    client.postTypePoseidon = async function (type, url, params) {
        if (Object.keys(typeKeys).indexOf(type) >= 0) {
            try {
                if (!poseidonConfigClients[type]) {
                    var serviceUrl = serviceConfig[type];
                    var clientInstance = poseidonClass.CreateAsTcpClient(serviceUrl);
                    poseidonConfigClients[type] = clientInstance;
                }
                var result = await poseidonConfigClients[type].InvokeService(url, params);
                if (result.responseCode === 0) {
                    if (tools.isStr(result.customReturnObj)) {
                        return JSON.parse(result.customReturnObj);
                    }
                    return result.customReturnObj;
                } else {
                    throw new Error('Poseidon Error, code: ' + result.responseCode);
                }
            } catch (err) {
                throw new Error('Poseidon catch: ', err);
            }

        } else {
            throw new Error('This type is not included in the configuration at creation time');
        }
    }
    return client;
};

middleware.createClient = function () {
    var client = {};
    client.postPoseidon = async function (domain, url, params) {
        if (!domain) {
            throw new Error('Domain can\'t be null');
        }
        try {
            if (!poseidonClients[domain]) {
                poseidonClients[domain] = poseidonClass.CreateAsTcpClient(domain);
            }
            var result = await poseidonClients[domain].InvokeService(url, params);
            if (result.responseCode === 0) {
                if (tools.isStr(result.customReturnObj)) {
                    return JSON.parse(result.customReturnObj);
                }
                return result.customReturnObj;
            } else {
                throw new Error('Poseidon Error, code: ' + result.responseCode);
            }
        } catch (err) {
            throw new Error('Poseidon catch: ', err);
        }
    }
    return client;
};