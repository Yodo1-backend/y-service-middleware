/**
 * @author XiaChengxing
 * @date 2019/5/8 5:56 PM
 */

var mongodb = require('mongodb');
var acl = require('acl');
var common = require('./index');

var middleware = module.exports = {};
/**
 * @param name
 * @param url
 */
middleware.createClient = (name, url, success) => {
    if (!name || !url) {
        throw new Error('You must set mongodb name and url')
    }
    mongodb.connect(url, function (error, db) {
        if (error) {
            throw new Error('Plugin Acl init failed, err: ', error);
        } else {
            if (typeof success === 'function') {
                success('Plugin Acl init successful, mongodb url: ' + url);
            }
            acl = new acl(new acl.mongodbBackend(db, name, true));
            acl.allow([
                {
                    roles: 'rAdmin',
                    allows: [
                        {
                            resources: '*',
                            permissions: '*'
                        }
                    ]
                }
            ]);
        }
    });
    var aclImp = {};
    aclImp.getUserResources = async (user) => {
        var userRoles, result;
        await acl.userRoles(user, async function (err, roles) {
            if (!err) {
                userRoles = roles;
            } else {
                result = common.inCorrectResult(err);
            }
        }).catch(error => {
            result = common.errorResult(error);
        })
        if (userRoles) {
            await acl.whatResources(userRoles[0], async function (err, replay) {
                if (!err) {
                    result = common.correctResult(replay);
                } else {
                    result = common.inCorrectResult(err);
                }
            }).catch(error => {
                result = common.errorResult(err);
            })
        }
        return result;
    }

    aclImp.getUserRoles = async (user) => {
        var result;
        await acl.userRoles(user, async function (err, roles) {
            if (err) {
                result = common.inCorrectResult(err);
            } else {
                result = common.correctResult(roles);
            }
        }).catch(error => {
            result = common.errorResult(error);
        })
        return result;
    }

    aclImp.setRoleAllow = async (allow, role) => {
        var _result;
        var roleResource = await aclImp.getRoleResources(role);
        if (roleResource.code === common.correctCode()) {
            for (var resource in roleResource.data) {
                await acl.removeAllow(role, resource, result[result]).then(() => {
                }).catch(err => {
                    _result = common.errorResult(err);
                })
            }
            await acl.allow(allow).then(() => {
                _result = common.correctResult();
            }).catch(error => {
                _result = common.errorResult(error);
            })
        }
        return _result;
    }

    aclImp.getRoleResources = async (role) => {
        var result;
        await acl.whatResources(role, async function (err, resources) {
            if (err) {
                result = common.inCorrectResult(err);
            } else {
                result = common.correctResult(resources);
            }
        }).catch(error => {
            result = common.errorResult(error);
        })
        return result;
    }

    aclImp.removeRole = async (role) => {
        var result;
        await acl.removeRole(role).then(() => {
            result = common.correctResult();
        }).catch(error => {
            result = common.errorResult(error);
        })
        return result;
    }

    aclImp.addUserRole = async (user, role) => {
        var result;
        await acl.addUserRoles(user, role).then(() => {
            result = common.correctResult();
        }).catch(error => {
            result = common.errorResult(error);
        })
        return result;
    }

    aclImp.removeUserRole = async (user, role) => {
        var result;
        await acl.removeUserRoles(user, role).then(() => {
            result = common.correctResult();
        }).catch(error => {
            result = common.errorResult(error);
        })
        return result;
    }

    aclImp.modifyUserRole = async (user, role) => {
        var oldRole = await aclImp.getUserRoles(user);
        if (oldRole.code === common.correctCode()) {
            await aclImp.removeUserRole(user, oldRole.data);
            return await aclImp.addUserRole(user, role);
        } else {
            return await aclImp.addUserRole(user, role);
        }
    }

    return aclImp;
}
