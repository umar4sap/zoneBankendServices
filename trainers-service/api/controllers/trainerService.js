'use strict';

var trainer = require('../domain/trainer'),
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
    createtrainer: createtrainer,
    getAlltrainers: getAlltrainers,
    getAlltrainersForZone: getAlltrainersForZone,
    gettrainerById: gettrainerById,
    deletetrainer: deletetrainer,
    updatetrainer: updatetrainer,
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
 * create trainer
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 */
function createtrainer(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
   
    
    if (userType == "user") {
        var check = validator.isObject()
            .withRequired('name', validator.isString({ message: "Please enter trainer name" }))
            .withOptional('description', validator.isString({ message: "Please enter trainer description" }))
            .withRequired('deparment', validator.isString({ message: "Please enter trainer deparment" }))
            .withOptional('photo', validator.isAnyObject({ message: "Please enter trainer photo " }))
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (errorCount == 0) {
                //console.log('before save....')
                (new trainer(req.swagger.params.body.value)).save(tokenId, userId, traceId, tenantId, zoneId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-trainer': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else {
                            // res.set('Content-trainer', 'application/json');
                            var response = {};
                            response.status = 200;
                            response.data = {};
                            response.data.message = content.message || "trainer created successfully";
                            if (content.generated_keys) {
                                response.data.trainerId = content.generated_keys[0];
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
 * Get all trainers
 * @param {*} req 
 * @param {*} res 
 */
function getAlltrainers(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    (new trainer()).findAll(traceId, userId, tenantId, 
        function(err, content) {
            if (err) {
                var response = { "status": "400", "error": err }
                res.json(response);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content.data && content.data.length > 0) {
                var resObj = { "status": "200", "data": content.data }
                res.json(resObj);
            } else {
                var resObj = { "status": "200", "data": { "message": "no trainers found" } }
                res.json(resObj);
            }
        });
}


function getAlltrainersForZone(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    (new trainer()).findAll(traceId, userId, tenantId, skip, limit, zoneId,
        function(err, content) {
            if (err) {
                var response = { "status": "400", "error": err }
                res.json(response);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content.data && content.data.length > 0) {
                var resObj = { "status": "200", "data": content.data }
                res.json(resObj);
            } else {
                var resObj = { "status": "200", "data": { "message": "no trainers found" } }
                res.json(resObj);
            }
        });
}

/**
 * get trainer details by trainerId
 * @param {*} req 
 * @param {*} res 
 * @param {*} trainerId
 */
function gettrainerById(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var check = validator.isObject()
        .withRequired('trainerId', validator.isString({ message: "Please enter trainerId" }))
    console.log(req.swagger.params)
    validator.run(check, { "trainerId": req.swagger.params.trainerId.value }, function(errorCount, errors) {
        if (errorCount == 0) {
            (new trainer()).findtrainerById(traceId, req.swagger.params.trainerId.value, zoneId,
                function(err, content) {
                    if (err) {
                        var response = { "status": "400", "error": err }
                        res.json(response);
                        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    } else if (content.data && content.data.length > 0) {
                        var resObj = { "status": "200", "data": content.data }
                        res.json(resObj);
                    } else {
                        var resObj = { "status": "200", "data": { "message": "trainer details not found" } }
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
 * update trainer
 * @param {*} req 
 * @param {*} res
 * @param {*} name
 * @param {*} description
 * @param {*} assignedStreamId
 * @param {*} logo 
 * @param {*} trainerId
 */
function updatetrainer(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    

    if (userType == "user") {
        var check = validator.isObject()
           .withRequired('name', validator.isString({ message: "Please enter trainer name" }))
           .withOptional('description', validator.isString({ message: "Please enter trainer description" }))
           .withRequired('deparment', validator.isString({ message: "Please enter trainer deparment" }))
           .withOptional('photo', validator.isAnyObject({ message: "Please enter trainer photo " }))
        var toValidate = req.swagger.params.body.value;
        validator.run(check, toValidate, function(errorCount, errors) {
            if (!Array.isArray(req.swagger.params.body.value.logo)) {
                var logo = req.swagger.params.body.value.logo;
                req.swagger.params.body.value.logo = [];
                req.swagger.params.body.value.logo.push(logo);
            }
            if (errorCount == 0) {
                (new trainer(req.swagger.params.body.value)).updatetrainer(tokenId, userId, traceId, req.swagger.params.trainerId.value, zoneId,
                    function(err, content) {
                        if (err) {
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        }
                        res.set('Content-trainer', 'application/json');
                        var resObj = {};
                        resObj.status = 200;
                        resObj.data = {}
                        resObj.data.message = content.message || "trainer updated successfully";
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
 * delete trainer
 * @param {*} req 
 * @param {*} res
 * @param {*} trainerId 
 */
function deletetrainer(req, res) {
    var zoneId = req.swagger.params.zoneId.value;
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    
   
    if (userType == "user") {
        var check = validator.isObject()
            .withRequired('trainerId', validator.isString({ message: "Please enter trainerId" }))

        validator.run(check, { "trainerId": req.swagger.params.trainerId.value }, function(errorCount, errors) {
            if (errorCount == 0) {
                (new trainer()).deletetrainer(traceId, req.swagger.params.trainerId.value, zoneId,
                    function(err, content) {
                        if (err) {
                            // res.writeHead(err.statusCode, { 'Content-trainer': 'application/json' });
                            var response = { "status": "400", "error": err }
                            res.json(response);
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                        } else if (content) {
                            // res.set('Content-trainer', 'application/json');
                            var resObj = {};
                            resObj.status = 200;
                            resObj.data = {};
                            resObj.data.message = content.message || "trainer deleted successfully";
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