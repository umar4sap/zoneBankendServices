'use strict';

//tenantId not added to apis due to auth0 security not implemented

var bio = require('../domain/bio'),
    Logger = require('bunyan'),
    validator = require('node-validator'),
    request = require("request"),
    async = require('async'),
    _ = require("underscore");
var log = new Logger.createLogger({
    name: 'qloudable-training-bios',
    serializers: { req: Logger.stdSerializers.req }
});

module.exports = {
    createPublisherBio: createPublisherBio,
    getPublisherBio: getPublisherBio,
    getAllPublisherBios: getAllPublisherBios,
    updatePublisherBio: updatePublisherBio,
    deletePublisherBio: deletePublisherBio,
    getPublisherBYUser:getPublisherBYUser
};

// function for find the user type from token.
function currentUserType(currentPermissionsOrgs, orgId, cb) {
    _.each(currentPermissionsOrgs, function (org, key) {
        if (org[orgId]) {
            cb(org[orgId].teams[0].role)
        }
    })
}

// create a training bio
function createPublisherBio(req, res) {
    console.log("create bio api called")
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var orgId = req.swagger.params.orgId.value;
    var bodyData = req.swagger.params.body.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });

    var check = validator.isObject()
        .withRequired('fullName', validator.isString({ message: "fullName is required" }))
        .withRequired('email', validator.isString({ message: "email is required" }))
        .withRequired('orgName', validator.isString({ message: "orgName is required" }))
        .withRequired('authorImage', validator.isAnyObject({ message: "authorImage is required" }))
        .withRequired('ratings', validator.isString({ message: "ratings is required" }))
        .withRequired('designation', validator.isString({ message: "designation is required" }))
        .withRequired('bioDescription', validator.isString({ message: "bioDescription is required" }))
        .withRequired('socialLinks', validator.isAnyObject({ message: "socialLinks is required as an array" }))
        .withRequired('keySkills', validator.isAnyObject({ message: "keySkills is required as an array" }))
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
            (new bio(bodyData)).save( userId, traceId, tenantId, userType, orgId,
                function (err, content) {
                    console.log('after save...')
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

//Update a training bio
function updatePublisherBio(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var orgId = req.swagger.params.orgId.value;
    var authorId = req.swagger.params.authorId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        console.log("data", data)
        userType = data;
    });
    (new bio(req.swagger.params.body.value)).updateBio(tokenId, userId, traceId, authorId, tenantId, userType, orgId,
        function (err, content) {
            if (err) {
                res.json(err);
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            }
            res.set('Content-Type', 'application/json');
            var response = content;
            res.json(response);
        });

};

//Delete a bio
function deletePublisherBio(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var orgId = req.swagger.params.orgId.value;
    var authorId = req.swagger.params.authorId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    (new bio()).deleteBio(authorId, traceId, tenantId, function (err, result) {
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
            var resObj = { "status": "200", "data": { "message": "Publisher bio deleted successfully" } }
            res.json(resObj);
        }
    });
}

// Get all bios for publisher or admin
function getAllPublisherBios(req, res) {
    console.log("get all bios api called")
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var orgId = req.swagger.params.orgId.value;
    var tenantId = req.user.aud;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    (new bio()).findAllPublishers(traceId, orgId,
        function (err, content) {
            console.log('err', err)
            if (err) {
               // res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.json(content)
            }
        });
}

function getPublisherBio(req, res) {
    console.log("get publisher details")
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var authorId = req.swagger.params.authorId.value;
    var orgId = req.swagger.params.orgId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    (new bio()).publisherDetails(traceId, authorId,
        function (err, content) {
            if (err) {
                //res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
}

function getPublisherBYUser(req, res) {
    console.log("get publisher details")
    var tokenId = req.headers.user_access;
    var traceId = process.env.TRACE_VARIABLE;
    var authorId = req.swagger.params.authorId.value;
    if(tokenId=="true"){
            (new bio()).publisherDetailsforUser(traceId, authorId,
        function (err, content) {
            if (err) {
                //res.writeHead(err.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(err));
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            } else if (content) {
                res.set('Content-Type', 'application/json');
                res.json(content)
            }
        });
    } else {
        res.json({"status":"404","message":"Please provide a valid user access"})
    }
}
