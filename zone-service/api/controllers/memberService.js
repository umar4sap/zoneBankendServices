'use strict';

//tenantId not added to apis due to auth0 security not implemented

var member = require('../domain/member'),
    Logger = require('bunyan'),
    validator = require('node-validator'),
    request = require("request"),
    async = require('async'),
    _ = require("underscore");
var log = new Logger.createLogger({
    name: 'training-members',
    serializers: { req: Logger.stdSerializers.req }
});

module.exports = {
    createMember: createMember,
    getMember:getMember,
    getAllMembers:getAllMembers, 
    activateMember: activateMember,
    deActivateMember: deActivateMember,
    updateMember:updateMember,
    requestToJoin:requestToJoin
    
};

// function for find the user type from token.
// function currentUserType(currentPermissionsOrgs, orgId, cb) {
//     _.each(currentPermissionsOrgs, function (org, key) {
//         if (org[orgId]) {
//             cb(org[orgId].teams[0].role)
//         }
//     })
// }

// createMember
function createMember(req, res) {
    console.log("create member api called")
    var tokenId = "test"
    var bodyData = req.swagger.params.body.value;
    var cityId = req.swagger.params.cityId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var ownerId = req.swagger.params.ownerId.value;
    var signupBy = "app login";
    var traceId = process.env.TRACE_VARIABLE|| "traceid";
    var check = validator.isObject()
        .withRequired('memberName', validator.isString({ message: "memberName is required" }))
        .withRequired('zoneName', validator.isString({ message: "zoneName is required" }))
        .withRequired('memberAge', validator.isString({ message: "memberOwnerName is required" }))
        .withRequired('memberCity', validator.isString({ message: "memberAddress is required" }))
        .withOptional('memberWeight', validator.isString({ message: "MemberWeight is required" }))
        .withOptional('memberheight', validator.isString({ message: "Memberheight is required" }))
        .withOptional('memberPhoto', validator.isAnyObject({ message: "MemberPhoto is required" }))
        .withRequired('memberStartDate', validator.isString({ message: "memberStartDate is required" }))
        .withRequired('primaryContact', validator.isString({ message: "primaryContact is required" }))
        .withRequired('memberEmail', validator.isString({ message: "memberEmail is required" }))
        .withRequired('shiftTiming', validator.isAnyObject({ message: "shiftTiming is required" }))
        .withRequired('plans', validator.isAnyObject({ message: "planDetails is required" }))
        .withRequired('paymentStatus', validator.isString({ message: "paymentStatus is required" }))
        .withOptional('billAmount', validator.isString({ message: "billAmount is required" }))
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
            (new member(bodyData)).postmember(zoneId,bodyData.memberPhoto,ownerId,signupBy,traceId,
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

//Update a training member
function requestToJoin(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = "test";
    var bodyData = req.swagger.params.body.value;
    var tenantId = req.user.aud;
    var cityId = req.swagger.params.cityId.value;
    var zoneId = req.swagger.params.zoneId.value;
    var ownerId = req.swagger.params.ownerId.value;
    var picture = req.user.picture;
    var signupBy = "facebook login";
    var userType;
    var check = validator.isObject()
        .withRequired('memberName', validator.isString({ message: "memberName is required" }))
        .withRequired('zoneName', validator.isString({ message: "zoneName is required" }))
        .withRequired('memberAge', validator.isString({ message: "memberOwnerName is required" }))
        .withRequired('memberCity', validator.isString({ message: "memberAddress is required" }))
        .withOptional('memberWeight', validator.isString({ message: "memberWeight is required" }))
        .withOptional('memberheight', validator.isString({ message: "Memberheight is required" }))
        .withRequired('memberStartDate', validator.isString({ message: "memberStartDate is required" }))
        .withRequired('primaryContact', validator.isString({ message: "primaryContact is required" }))
        .withRequired('memberEmail', validator.isString({ message: "memberEmail is required" }))
        .withRequired('shiftTiming', validator.isAnyObject({ message: "shiftTiming is required" }))
        .withRequired('plans', validator.isAnyObject({ message: "planDetails is required" }))
        .withRequired('paymentStatus', validator.isString({ message: "paymentStatus is required" }))
        .withOptional('billAmount', validator.isString({ message: "billAmount is required" }))
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
    (new member(req.swagger.params.body.value)).requestToJoin(bodyData,picture,zoneId,cityId, userId,ownerId,signupBy, traceId,
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

//Delete a member
function getMember(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var zoneId = req.swagger.params.orgId.value;
    var memberId = req.swagger.params.memberId.value;
    var cityId = req.swagger.params.cityId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    if(userType=="admin"){
    (new member()).deletemember(cityId, memberId,orgId,traceId, tenantId, function (err, result) {
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
            var resObj = { "status": "200", "data": { "message": "user's member deleted successfully" } }
            res.json(resObj);
        }
    });
}else{
    var resObj = { "status": "400", "data": { "message": "You dont have permission" } }
    res.set('Content-Type', 'application/json');
    res.json(resObj);
}
}


// Get all members for publisher or admin
function getAllMembers(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = "test";
    var status = req.swagger.params.status.value;
    var tenantId = req.user.aud;
    var traceId = process.env.TRACE_VARIABLE|| "traceid";
    var userType="admin";
    if(userType=="admin"){
    (new member()).findAllmembersForAllcity(traceId, userId,status,
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


//Pull city's all members and theirs replies
function getcitymembers(req, res) {
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var traceId = process.env.TRACE_VARIABLE|| "my test";
    (new member()).citymembers(traceId, cityId,
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





//publish or reject member
function deActivateMember(req, res) {
    var cityId = req.swagger.params.cityId.value;
    var memberId = req.swagger.params.memberId.value;
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
    (new member()).citymembersApproval(bodyData.status,"test", cityId,memberId,
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

//get member
function getmember(req, res) {
    var cityId = req.swagger.params.cityId.value;
    var memberId = req.swagger.params.memberId.value;
    var traceId = process.env.TRACE_VARIABLE|| "test";
    (new member()).getOnemember(traceId, cityId,memberId,
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

// Get user members
function activateMember(req, res) {
    console.log("get user member called")
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new member()).usermembers(traceId, cityId,userId,
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

// Update user member
function updateMember(req, res) {
    var tokenId = req.headers.user_access;
    var cityId = req.swagger.params.cityId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    var bodyData = req.swagger.params.body.value;
    (new member(bodyData)).updateUsermember(traceId, cityId,userId,
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