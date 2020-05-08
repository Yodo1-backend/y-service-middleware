/**
 * @author XiaChengxing
 * @date 2019/5/8 5:56 PM
 */

const bluebird = require('bluebird');
const redis = require('redis');

var expireTime = 2 * 3600;
const common = require('./index');
const tools = common.tools;

function isServerError (obj) {
    return (tools.isJson(obj) && (obj.code === 'NR_FATAL' || obj.code === 'NR_CLOSED' || obj.code === 'CONNECTION_BROKEN' || obj.code === 'UNCERTAIN_STATE'));
}

function handleError (err) {
    if (isServerError(err)) {
        return common.errorResult('Redis Server Error');
    } else {
        return common.inCorrectResult('Code Error')
    }
}

var middleware = module.exports = {};
middleware.createClient = function ({port, host, password, db, time, name = 'Redis', errListener, success}) {
    if (!port || !host) {
        throw new Error('port or host can\'t be null');
    }
    db = db | 0;
    expireTime = time | expireTime;
    const client = redis.createClient(port, host, {
        retry_strategy: function (options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        }
    });

    client.auth(password, function (err) {
        if (!err) {
            client.select(db);
            if (typeof success === 'function') {
                success('Plugin ' + name + ' init successful with config ', {
                    port: port,
                    host: host,
                    pass: password,
                    expireTime: expireTime,
                    db: db
                })
            }
        } else {
            throw new Error('Plugin Redis init failed, err: ', err);
        }
    });
    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    client.on('error', function (err) {
        if (errListener && typeof errListener === 'function') {
            errListener(err);
        }
    });

    var redisImp = {};
    redisImp.getClient = function () {
        return client;
    };

    redisImp.updateExpireTime = function (key, exTime = expireTime) {
        client.expire(key, exTime);
    };

    redisImp.expired = function (key) {
        client.expire(key, 1);
    };

    redisImp.hSet = async function (key, params, exTime = expireTime) {
        var error = '';
        var result = await client.hmsetAsync(key, params).then(async function (replay) {
            client.expire(key, exTime);
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }

    redisImp.hSetForever = async function (key, params) {
        var error = '';
        var result = await client.hmsetAsync(key, params).then(async function (replay) {
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }

    redisImp.hGet = async function (key, value) {
        if (!tools.isStrNull(key) || !tools.isStrNull(value)) {
            var error;
            var result = await client.hmgetAsync(key, value).then(async function (replay) {
                return replay[0];
            }).catch(err => {
                error = err;
            })
            if (error) {
                return handleError(error);
            } else {
                return common.correctResult(result);
            }
        } else {
            return common.inCorrectResult('key or value is null');
        }
    }

    redisImp.hGetAll = async function (key) {
        if (!tools.isStrNull(key)) {
            var error;
            var result = await client.hgetallAsync(key).then(async function (replay) {
                return replay;
            }).catch(err => {
                error = err;
            })
            if (error) {
                return handleError(error);
            } else {
                return common.correctResult(result);
            }
        } else {
            return common.inCorrectResult('key is null');
        }
    }

    redisImp.hDel = async function (key, value) {
        var error;
        let result = await client.hdelAsync(key, value).then(async function (replay) {
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }

    redisImp.set = async function (key, value, exTime = expireTime) {
        var error;
        let result = await client.setAsync(key, value).then(async function (replay) {
            client.expire(key, exTime);
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }

    redisImp.setForever = async function (key, value) {
        var error;
        let result = await client.setAsync(key, value).then(async function (replay) {
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }


    redisImp.get = async function (key) {
        if (!tools.isStrNull(key)) {
            var error;
            let result = await client.getAsync(key).then(async function (replay) {
                return replay;
            }).catch(err => {
                error = err;
            })
            if (error) {
                return handleError(error);
            } else {
                return common.correctResult(result);
            }
        } else {
            return common.inCorrectResult('key is null');
        }
    }

    redisImp.del = async function (key) {
        var error;
        let result = await client.delAsync(key).then(async function (replay) {
            return replay;
        }).catch(err => {
            error = err;
        })
        if (error) {
            return handleError(error);
        } else {
            return common.correctResult(result);
        }
    }

    redisImp.keys = async function (pattern) {
        return await client.keysAsync(pattern).then(async function (replay) {
            return common.correctResult(replay);
        }).catch(err => {
            return common.errorResult(err);
        })
    }

    redisImp.multiFnc = async function (list, fnc) {
        var error = '';
        if (list.length > 0) {
            var params = [];
            var commond = [];
            for (let para of list) {
                commond.push([fnc, para[0], para[1]]);
                params.push(para);
            }
            var result = await client.multi(commond).execAsync().then(async function (replay) {
                return replay;
            }).catch(err => {
                error = err;
            })
            if (error) {
                return handleError(error);
            } else {
                return common.correctResult(result);
            }
        } else {
            return common.inCorrectResult('list can\'t be empty');
        }
    }

    redisImp.lRange = async function (key) {
        return await client.llenAsync(key).then(async function (len) {
            return await client.lrangeAsync(key, 0, len).then(async function (replay) {
                return common.correctResult(replay);
            }).catch(err => {
                return common.errorResult(err);
            });
        }).catch(err => {
            return common.errorResult(err);
        });
    }

    return redisImp;
};
