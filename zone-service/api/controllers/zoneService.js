'use strict';

//tenantId not added to apis due to auth0 security not implemented

var zone = require('../domain/zone'),
    Logger = require('bunyan'),
    validator = require('node-validator'),
    request = require("request"),
    async = require('async'),
    _ = require("underscore");
var log = new Logger.createLogger({
    name: 'qloudable-training-zones',
    serializers: { req: Logger.stdSerializers.req }
});
var URL = 'https://lookatgym.com/roles';
module.exports = {
    postzone: postzone,
    replayzone:replayzone,
    getcityzones:getcityzones,
    getOwnerZones:getOwnerZones,
    getcityzonesAll:getcityzonesAll, 
    publishzone: publishzone,
    deletezone: deletezone,
    getzone:getzone,
    updateUserzone:updateUserzone,
    getUserzone:getUserzone
};

// function for find the user type from token.
function currentUserType(currentPermissionsOrgs, orgId, cb) {
    _.each(currentPermissionsOrgs, function (org, key) {
        if (org[orgId]) {
            cb(org[orgId].teams[0].role)
        }
    })
}

// create a training zone
function postzone(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    var bodyData = req.swagger.params.body.value;
    var cityId = req.swagger.params.cityId.value;
   
    var check = validator.isObject()
        .withRequired('zoneName', validator.isString({ message: "zoneName is required" }))
        .withRequired('zoneOwnerName', validator.isString({ message: "zoneOwnerName is required" }))
        .withRequired('zoneAddress', validator.isString({ message: "zoneAddress is required" }))
        .withRequired('Country', validator.isString({ message: "Country is required" }))
        .withRequired('zoneType', validator.isString({ message: "zoneType is required" }))
        .withRequired('zoneSince', validator.isString({ message: "zoneSince is required" }))
        .withRequired('zoneEmail', validator.isString({ message: "zoneEmail is required" }))
        .withRequired('primaryContact', validator.isString({ message: "primaryContact is required" }))
        .withOptional('zoneEmail', validator.isString({ message: "zoneEmail is required" }))
        .withRequired('zoneSubcriptionDetails', validator.isAnyObject({ message: "zoneSubcriptionId is required" }))
        .withRequired('zoneMemberActivateMessage', validator.isString({ message: "zoneMemberActivateMessage is required" }))
        .withRequired('zoneMemberDeactivateMessage', validator.isString({ message: "zoneMemberDeactivateMessage is required" }))
        .withRequired('zoneMemberPlanExpireMessage', validator.isString({ message: "zoneMemberPlanExpireMessage is required" }))
        .withRequired('zonefreeTrailPerMonth', validator.isNumber({ message: "zonefreeTrailPerMonth is required" }))
        .withRequired('zonefreeTrailPerDay', validator.isNumber({ message: "zonefreeTrailPerDay is required" }))
        .withRequired('zoneTiming', validator.isAnyObject({ message: "zoneSince is required" }))
        .withRequired('zoneTrainers', validator.isAnyObject({ message: "zoneTrainers is required" }))
        .withRequired('zoneCurrentPlans', validator.isAnyObject({ message: "zoneCurrentPlans is required" }))
        .withRequired('zoneCurrentDiscounts', validator.isAnyObject({ message: "zoneCurrentDiscounts is required" }))
        .withRequired('zoneFor', validator.isAnyObject({ message: "zoneFor is required" }))
        .withRequired('images', validator.isAnyObject({ message: "images is required" }))
        .withRequired('logo', validator.isAnyObject({ message: "logo is required" }))
        .withRequired('zoneCoverImage', validator.isAnyObject({ message: "zoneCoverImage is required" }))
        .withRequired('videos', validator.isAnyObject({ message: "videos is required" }))
        .withRequired('zoneShortDescription', validator.isString({ message: "city is required" }))
        .withRequired('aboutZone', validator.isString({ message: "aboutZone is required" }))
        .withOptional('createdDTS', validator.isString())
        .withOptional('updatedDTS', validator.isString())
        .withOptional('secondaryContact', validator.isString({ message: "secondaryContact is required" }))
    validator.run(check, bodyData, function (errorCount, errors) {
        if (errorCount != 0) {
            var response = {
                "status": "failed",
                message: errors
            }
            res.status(400);
            res.json(response);

        } else {
            (new zone(bodyData)).postzone(cityId,traceId,userId,
                function (err, content) {
                    console.log('after save...'+content)
                    if (err) {
                        console.log("errrrrrrrrrrr")
                        res.send(JSON.stringify(err));
                        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    } else {
                        res.json(content);
                    }
                });
        }
    })
};

//Update a training zone
function replayzone(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var bodyData = req.swagger.params.body.value;
    var tenantId = req.user.aud;
    var cityId = req.swagger.params.cityId.value;
    var orgId = req.swagger.params.orgId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        console.log("data", data)
        userType = data;
    });var check = validator.isObject()
    .withRequired('publisherName', validator.isString({ message: "publisherName is required" }))
    .withRequired('publisherEmail', validator.isString({ message: "publisherEmail is required" }))
    .withRequired('repaliedMessage', validator.isString({ message: "repaliedMessage is required" }))
    .withOptional('createdDTS', validator.isString())
    .withOptional('updatedDTS', validator.isString())
validator.run(check, bodyData, function (errorCount, errors) {
    if (errorCount != 0) {
        var response = {
            "status": "failed",
            message: errors
        }
        res.status(400);
        res.json(response);

    } else {
    (new zone(req.swagger.params.body.value)).replayzone(bodyData,cityId, userId, traceId, zoneId, userType, orgId,
        function (err, content) {
            if (err) {
                res.json(err);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            }
            res.set('Content-Type', 'application/json');
            var response = content;
            res.json(response);
        });
    }
    })

};

//Delete a zone
function deletezone(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var orgId = req.swagger.params.orgId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var cityId = req.swagger.params.cityId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    if(userType=="admin"){
    (new zone()).deletezone(cityId, zoneId,orgId,traceId, tenantId, function (err, result) {
        if (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            throw err;
        }
        if (result.deleted == 0) {
            var resObj = { "status": "200", "data": { "message": "Publisher does not exist" } }
            res.set('Content-Type', 'application/json');
            res.json(resObj);
        } else {
            res.set('Content-Type', 'application/json');
            var resObj = { "status": "200", "data": { "message": "user's zone deleted successfully" } }
            res.json(resObj);
        }
    });
}else{
    var resObj = { "status": "400", "data": { "message": "You dont have permission" } }
    res.set('Content-Type', 'application/json');
    res.json(resObj);
}
}


// Get all zones for publisher or admin
function getcityzonesAll(req, res) {
    var traceId = "test"
    var startfrom = req.swagger.params.startfrom.value;
    var userType="admin";
    if(userType=="admin"){
    (new zone()).findAllzonesForAllcity(traceId, startfrom,
        function (err, content) {
            console.log('err', err)
            if (err) {
                res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.json(content)
            }
        });
    }else{
        var resObj = { "status": "400", "data": { "message": "You dont have permission" } }
        res.set('Content-Type', 'application/json');
        res.json(resObj);
    }
}


//Pull city's all zones and theirs replies
function getcityzones(req, res) {
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var traceId = process.env.TRACE_VARIABLE|| "my test";
    (new zone()).cityzones(traceId, cityId,
        function (err, content) {
            if (err) {
              
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}

//Pull city's all zones and theirs replies
function getOwnerZones(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1];
    var traceId = "test";
    var tenantId = req.user.aud;
    var userType= req.user[URL].userType;
    var traceId = process.env.TRACE_VARIABLE|| "my test";
    (new zone()).ownerzones(traceId, userId,
        function (err, content) {
            if (err) {
              
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}



//publish or reject zone
function publishzone(req, res) {
    var cityId = req.swagger.params.cityId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var bodyData = req.swagger.params.body.value;
    var userType="admin";
    var check = validator.isObject()
    .withRequired('status', validator.isString({ message: "status is required" }))
    .withOptional('createdDTS', validator.isString())
    .withOptional('updatedDTS', validator.isString())
    if(userType=="admin"){
validator.run(check, bodyData, function (errorCount, errors) {
    if (errorCount != 0) {
        var response = {
            "status": "failed",
            message: errors
        }
        res.status(400);
        res.json(response);
    
    }else{
    (new zone()).cityzonesApproval(bodyData.status,"test", cityId,zoneId,
        function (err, content) {
            if (err) {
              
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
    }

})
    }else{
        var resObj = { "status": "400", "data": { "message": "You dont have permission" } }
        res.set('Content-Type', 'application/json');
        res.json(resObj);
    }
}

//get zone
function getzone(req, res) {
    var cityId = req.swagger.params.cityId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var traceId = process.env.TRACE_VARIABLE|| "test";
    (new zone()).getOnezone(traceId, cityId,zoneId,
        function (err, content) {
            if (err) {
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}

// Get user zones
function getUserzone(req, res) {
    console.log("get user zone called")
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new zone()).userzones(traceId, cityId,userId,
        function (err, content) {
            if (err) {
              
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}

// Update user zone
function updateUserzone(req, res) {
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    var bodyData = req.swagger.params.body.value;
    (new zone(bodyData)).updateUserzone(traceId, cityId,userId,
        function (err, content) {
            if (err) {
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}