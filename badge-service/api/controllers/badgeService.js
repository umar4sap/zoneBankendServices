'use strict';

var Badge = require('../domain/badge'),
    Logger = require('bunyan');
var validator = require('node-validator');
var log = new Logger.createLogger({
    name: 'qloudable-training-labs',
    serializers: { req: Logger.stdSerializers.req }
});
var _ = require('lodash');

var sysgainURL = 'https://sysgain.newgen.com/app_metadata';
var admin = 'admin';
var publisher = 'publisher';
module.exports = {
    createBadge: createBadge,
    getAllBadges: getAllBadges,
    getBadgeById: getBadgeById,
    deleteBadge: deleteBadge,
    updateBadge: updateBadge,
};
/**
 * Get logged in user permission details.
 * @param {*} currentPermissionsOrgs 
 * @param {*} orgId 
 * @param {*} cb 
 */
function currentUserType(currentPermissionsOrgs, orgId, cb) {
    _.each(currentPermissionsOrgs, function(org, key) {
        if (org[orgId]) {
            cb(org[orgId].teams[0].role)
        }
    })
}
/**
 * create badge
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 */
function createBadge(req, res) {
    var orgId = req.swagger.params.orgId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var currentPermissionsOrgs = req.user[sysgainURL].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function(data) {
        userType = data;
    })
    if (userType == admin) {
        var check = validator.isObject()
            .withRequired('name', validator.isString({ message: "Please enter Badge name" }))
            .withOptional('description', validator.isString({ message: "Please enter Badge description" }))
            .withRequired('assignedStreamId', validator.isString({ message: "Please enter Badge assignedStreamId" }))
            .withOptional('logo', validator.isAnyObject({ message: "Please enter Badge log" }))
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (!Array.isArray(req.swagger.params.body.value.logo)) {
                var logo = req.swagger.params.body.value.logo;
                req.swagger.params.body.value.logo = [];
                req.swagger.params.body.value.logo.push(logo);
            }
            if (errorCount == 0) {
                //console.log('before save....')
                (new Badge(req.swagger.params.body.value)).save(tokenId, userId, traceId, tenantId, orgId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-Badge': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else {
                            // res.set('Content-Badge', 'application/json');
                            var response = {};
                            response.status = 200;
                            response.data = {};
                            response.data.message = content.message || "Badge created successfully";
                            if (content.generated_keys) {
                                response.data.badgeId = content.generated_keys[0];
                            }
                            res.json(response);
                        }
                    });
            } else {
                var response = { "status": "400", "error": errors }
                res.json(response);
            }
        });
    } else {
        var response = { "status": "400", "message": "user not authorised" }
        res.json(response);
    }
};
/**
 * Get all badges
 * @param {*} req 
 * @param {*} res 
 */
function getAllBadges(req, res) {
    var orgId = req.swagger.params.orgId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var limit = req.limit ? req.limit : 10;
    var page = req.page ? req.page : 1
    var skip = (page - 1) * limit;
    (new Badge()).findAll(traceId, userId, tenantId, skip, limit, orgId,
        function(err, content) {
            if (err) {
                var response = { "status": "400", "error": err }
                res.json(response);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content.data && content.data.length > 0) {
                var resObj = { "status": "200", "data": content.data }
                res.json(resObj);
            } else {
                var resObj = { "status": "200", "data": { "message": "no badges found" } }
                res.json(resObj);
            }
        });
}

/**
 * get badge details by badgeId
 * @param {*} req 
 * @param {*} res 
 * @param {*} badgeId
 */
function getBadgeById(req, res) {
    var orgId = req.swagger.params.orgId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var check = validator.isObject()
        .withRequired('badgeId', validator.isString({ message: "Please enter badgeId" }))
    console.log(req.swagger.params)
    validator.run(check, { "badgeId": req.swagger.params.badgeId.value }, function(errorCount, errors) {
        if (errorCount == 0) {
            (new Badge()).findBadgeById(traceId, req.swagger.params.badgeId.value, orgId,
                function(err, content) {
                    if (err) {
                        var response = { "status": "400", "error": err }
                        res.json(response);
                        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    } else if (content.data && content.data.length > 0) {
                        var resObj = { "status": "200", "data": content.data }
                        res.json(resObj);
                    } else {
                        var resObj = { "status": "200", "data": { "message": "badge details not found" } }
                        res.json(resObj);
                    }
                });
        } else {
            var response = { "status": "400", "error": err }
            res.json(response);
        }
    });
}

/**
 * update badge
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 * @param {*} badgeId
 */
function updateBadge(req, res) {
    var orgId = req.swagger.params.orgId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var currentPermissionsOrgs = req.user[sysgainURL].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function(data) {
        userType = data;
    })
    if (userType == admin) {
        var check = validator.isObject()
            .withRequired('name', validator.isString({ message: "Please enter Badge name" }))
            .withOptional('description', validator.isString({ message: "Please enter Badge description" }))
            .withRequired('assignedStreamId', validator.isString({ message: "Please enter Badge assignedStreamId" }))
            .withOptional('logo', validator.isAnyObject({ message: "Please enter Badge log" }))
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (!Array.isArray(req.swagger.params.body.value.logo)) {
                var logo = req.swagger.params.body.value.logo;
                req.swagger.params.body.value.logo = [];
                req.swagger.params.body.value.logo.push(logo);
            }
            if (errorCount == 0) {
                (new Badge(req.swagger.params.body.value)).updateBadge(tokenId, userId, traceId, req.swagger.params.badgeId.value, orgId,
                    function(err, content) {
                        if (err) {
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        }
                        res.set('Content-Badge', 'application/json');
                        var resObj = {};
                        resObj.status = 200;
                        resObj.data = {}
                        resObj.data.message = content.message || "Badge updated successfully";
                        res.json(resObj);
                    });
            } else {
                var response = { "status": "400", "error": errors }
                res.json(response);
            }
        });
    } else {
        var response = { "status": "400", "message": "user not authorised" }
        res.json(response);
    }
};

/**
 * delete badge
 * @param {*} req 
 * @param {*} res
 * @param {*} badgeId 
 */
function deleteBadge(req, res) {
    var orgId = req.swagger.params.orgId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var currentPermissionsOrgs = req.user[sysgainURL].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function(data) {
        userType = data;
    })
    if (userType == admin) {
        var check = validator.isObject()
            .withRequired('badgeId', validator.isString({ message: "Please enter badgeId" }))

        validator.run(check, { "badgeId": req.swagger.params.badgeId.value }, function(errorCount, errors) {
            if (errorCount == 0) {
                (new Badge()).deleteBadge(traceId, req.swagger.params.badgeId.value, orgId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-Badge': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else if (content) {
                            // res.set('Content-Badge', 'application/json');
                            var resObj = {};
                            resObj.status = 200;
                            resObj.data = {};
                            resObj.data.message = content.message || "Badge deleted successfully";
                            res.json(resObj);
                        }
                    });
            } else {
                var response = { "status": "400", "error": err }
                res.json(response);
            }
        });
    } else {
        var response = { "status": "400", "message": "user not authorised" }
        res.json(response);
    }
}