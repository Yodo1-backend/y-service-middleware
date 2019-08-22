/**
 * @author XiaChengxing
 * @date 2019/8/21 5:49 PM
 */

const axios = require('axios');
const timeout = {timeout: 30000};
const common = require('./index');

var middleware = module.exports = {};
middleware.post = async function (url, params, options) {
  options = options ? Object.assign(options, timeout) : timeout;
  let instance = axios.create(options);
  return await instance.post(url, params).then(res => {
    return {
      code: res.status,
      data: res.data
    }
  }).catch (err => {
    return common.errorResult(err);
  });
}

middleware.get = async function (url, params, options) {
  options = options ? Object.assign(options, timeout) : timeout;
  let instance = axios.create(options);
  return await instance.get(url, params).then(res => {
    return {
      code: res.status,
      data: res.data
    }
  }).catch(err => {
    return common.errorResult(err);
  })
}