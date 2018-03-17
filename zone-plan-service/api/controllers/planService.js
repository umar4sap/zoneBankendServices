'use strict';

var plan = require('../domain/plan'),
    Logger = require('bunyan');
var validator = require('node-validator');
var log = new Logger.createLogger({
    name: 'qloudable-training-labs',
    serializers: { req: Logger.stdSerializers.req }
});
var _ = require('lodash');

var URL = 'https://lookatgym.com/roles';
var admin = 'admin';
var publisher = 'owner';
module.exports = {
    createplan: createplan,
    getAllplans: getAllplans,
    getAllplansForZone: getAllplansForZone,
    getplanById: getplanById,
    deleteplan: deleteplan,
    updateplan: updateplan,
};
/**
 * Get logged in user permission details.
 * @param {*} currentPermissionsOrgs 
 * @param {*} zoneId 
 * @param {*} cb 
 */
function currentUserType(currentPermissionsOrgs, zoneId, cb) {
    _.each(currentPermissionsOrgs, function(zone, key) {
        if (zone[zoneId]) {
            cb(zone[zoneId].teams[0].role)
        }
    })
}
/**
 * create plan
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 */
function createplan(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
   
    
    if (userType == "user") {
        var check = validator.isObject()
            .withRequired('planName', validator.isString({ message: "Please enter Plan Name " }))
            .withOptional('zoneName', validator.isString({ message: "Please enter zone Name " }))
            .withRequired('planFee', validator.isNumber({ message: "Please enter Plan Fee" }))
            .withRequired('aboutPlan', validator.isString({ message: "Please enter aboutPlan" }))
            .withRequired('planMonth', validator.isNumber({ message: "Please enter plan Month" }))
            .withRequired('planOffer', validator.isString({ message: "Please enter plan offer" }))
            .withRequired('offerValidity', validator.isString({ message: "Please enter offer validity" }))
            
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (errorCount == 0) {
                //console.log('before save....')
                (new plan(req.swagger.params.body.value)).save(tokenId, userId, traceId, tenantId, zoneId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-plan': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else {
                            // res.set('Content-plan', 'application/json');
                            var response = {};
                            response.status = 200;
                            response.data = {};
                            response.data.message = content.message || "plan created successfully";
                            if (content.generated_keys) {
                                response.data.planId = content.generated_keys[0];
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
 * Get all plans
 * @param {*} req 
 * @param {*} res 
 */
function getAllplans(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    (new plan()).findAll(traceId, userId, tenantId, 
        function(err, content) {
            if (err) {
                var response = { "status": "400", "error": err }
                res.json(response);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content.data && content.data.length > 0) {
                var resObj = { "status": "200", "data": content.data }
                res.json(resObj);
            } else {
                var resObj = { "status": "200", "data": { "message": "no plans found" } }
                res.json(resObj);
            }
        });
}


function getAllplansForZone(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var traceId = "test";
    //var tenantId = req.user.aud;
    (new plan()).findAllForZone(traceId,  zoneId,
        function(err, content) {
            if (err) {
                var response = { "status": "400", "error": err }
                res.json(response);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content.data && content.data.length > 0) {
                var resObj = { "status": "200", "data": content.data }
                res.json(resObj);
            } else {
                var resObj = { "status": "200", "data": { "message": "no plans found" } }
                res.json(resObj);
            }
        });
}

/**
 * get plan details by planId
 * @param {*} req 
 * @param {*} res 
 * @param {*} planId
 */
function getplanById(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var check = validator.isObject()
        .withRequired('planId', validator.isString({ message: "Please enter planId" }))
    console.log(req.swagger.params)
    validator.run(check, { "planId": req.swagger.params.planId.value }, function(errorCount, errors) {
        if (errorCount == 0) {
            (new plan()).findplanById(traceId, req.swagger.params.planId.value, zoneId,
                function(err, content) {
                    if (err) {
                        var response = { "status": "400", "error": err }
                        res.json(response);
                        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    } else if (content.data && content.data.length > 0) {
                        var resObj = { "status": "200", "data": content.data }
                        res.json(resObj);
                    } else {
                        var resObj = { "status": "200", "data": { "message": "plan details not found" } }
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
 * update plan
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 * @param {*} planId
 */
function updateplan(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    

    if (userType == "user") {
        var check = validator.isObject()
           .withRequired('name', validator.isString({ message: "Please enter plan name" }))
           .withOptional('description', validator.isString({ message: "Please enter plan description" }))
           .withRequired('deparment', validator.isString({ message: "Please enter plan deparment" }))
           .withOptional('photo', validator.isAnyObject({ message: "Please enter plan photo " }))
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (!Array.isArray(req.swagger.params.body.value.logo)) {
                var logo = req.swagger.params.body.value.logo;
                req.swagger.params.body.value.logo = [];
                req.swagger.params.body.value.logo.push(logo);
            }
            if (errorCount == 0) {
                (new plan(req.swagger.params.body.value)).updateplan(tokenId, userId, traceId, req.swagger.params.planId.value, zoneId,
                    function(err, content) {
                        if (err) {
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        }
                        res.set('Content-plan', 'application/json');
                        var resObj = {};
                        resObj.status = 200;
                        resObj.data = {}
                        resObj.data.message = content.message || "plan updated successfully";
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
 * delete plan
 * @param {*} req 
 * @param {*} res
 * @param {*} planId 
 */
function deleteplan(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    
   
    if (userType == "user") {
        var check = validator.isObject()
            .withRequired('planId', validator.isString({ message: "Please enter planId" }))

        validator.run(check, { "planId": req.swagger.params.planId.value }, function(errorCount, errors) {
            if (errorCount == 0) {
                (new plan()).deleteplan(traceId, req.swagger.params.planId.value, zoneId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-plan': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else if (content) {
                            // res.set('Content-plan', 'application/json');
                            var resObj = {};
                            resObj.status = 200;
                            resObj.data = {};
                            resObj.data.message = content.message || "plan deleted successfully";
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