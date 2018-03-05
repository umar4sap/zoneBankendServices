'use strict';

//tenantId not added to apis due to auth0 security not implemented

var review = require('../domain/review'),
    Logger = require('bunyan'),
    validator = require('node-validator'),
    request = require("request"),
    async = require('async'),
    _ = require("underscore");
var log = new Logger.createLogger({
    name: 'qloudable-training-reviews',
    serializers: { req: Logger.stdSerializers.req }
});

module.exports = {
    postReview: postReview,
    replayReview:replayReview,
    getComponentReviews:getComponentReviews,
    getComponentRatings:getComponentRatings,
    getAuthorRatings:getAuthorRatings,
    getComponentsReviewsAll:getComponentsReviewsAll, 
    publishReview: publishReview,
    deleteReview: deleteReview,
    getReview:getReview,
    updateUserReview:updateUserReview,
    getUserReview:getUserReview
};

// function for find the user type from token.
function currentUserType(currentPermissionsOrgs, orgId, cb) {
    _.each(currentPermissionsOrgs, function (org, key) {
        if (org[orgId]) {
            cb(org[orgId].teams[0].role)
        }
    })
}

// create a training review
function postReview(req, res) {
    console.log("create review api called")
    var tokenId = req.headers.user_access;
    var bodyData = req.swagger.params.body.value;
    var componentId = req.swagger.params.componentId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceid";
    var check = validator.isObject()
        .withRequired('reviewedMessage', validator.isString({ message: "reviewedMessage is required" }))
        .withRequired('rating', validator.isNumber({ message: "rating is required" }))
        .withRequired('userName', validator.isString({ message: "userName is required" }))
        .withRequired('userId', validator.isString({ message: "userId is required" }))
        .withRequired('userEmail', validator.isString({ message: "userEmail is required" }))
        .withRequired('componentType', validator.isString({ message: "componentType is required" }))
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
            (new review(bodyData)).postReview(bodyData.userId, "traineeUser",componentId,bodyData.componentType,traceId,
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

//Update a training review
function replayReview(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var bodyData = req.swagger.params.body.value;
    var tenantId = req.user.aud;
    var componentId = req.swagger.params.componentId.value;
    var orgId = req.swagger.params.orgId.value;
    var reviewId = req.swagger.params.reviewId.value;
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
    (new review(req.swagger.params.body.value)).replayReview(bodyData,componentId, userId, traceId, reviewId, userType, orgId,
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

//Delete a review
function deleteReview(req, res) {
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var tenantId = req.user.aud;
    var orgId = req.swagger.params.orgId.value;
    var reviewId = req.swagger.params.reviewId.value;
    var componentId = req.swagger.params.componentId.value;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    if(userType=="admin"){
    (new review()).deleteReview(componentId, reviewId,orgId,traceId, tenantId, function (err, result) {
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
            var resObj = { "status": "200", "data": { "message": "user's review deleted successfully" } }
            res.json(resObj);
        }
    });
}else{
    var resObj = { "status": "400", "data": { "message": "You dont have permission" } }
    res.set('Content-Type', 'application/json');
    res.json(resObj);
}
}


// Get all reviews for publisher or admin
function getComponentsReviewsAll(req, res) {
    console.log("get all reviews api called")
    var tokenId = req.headers.authorization;
    var userId = req.user.sub.split("|")[1]
    var traceId = process.env.TRACE_VARIABLE;
    var startfrom = req.swagger.params.startfrom.value;
    var orgId = req.swagger.params.orgId.value;
    var tenantId = req.user.aud;
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    if(userType=="admin"){
    (new review()).findAllReviewsForAllComponent(traceId, startfrom,orgId,
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


//Pull Component's all reviews and theirs replies
function getComponentReviews(req, res) {
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new review()).componentReviews(traceId, componentId,
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

//Pull Component's all ratings 
function getComponentRatings(req, res) {
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new review()).componentRating(traceId, componentId,
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

//Pull Authors's all ratings 
function getAuthorRatings(req, res) {
    var tokenId = req.headers.user_access;
    var authorId = req.swagger.params.authorId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new review()).authorRating(traceId, authorId,
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


//publish or reject review
function publishReview(req, res) {
    console.log("publish review api called")
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var reviewId = req.swagger.params.reviewId.value;
    var orgId = req.swagger.params.orgId.value;
    var bodyData = req.swagger.params.body.value;
    var userId = req.user.sub.split("|")[1];
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    var currentPermissionsOrgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
    var userType;
    currentUserType(currentPermissionsOrgs, orgId, function (data) {
        userType = data;
    });
    var check = validator.isObject()
    .withRequired('status', validator.isString({ message: "status is required" }))
    .withOptional('remark', validator.isString({ message: "remark is required" }))
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
    (new review()).componentReviewsApproval(bodyData.status,userId,traceId, componentId,bodyData.remark,reviewId,
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

//get review
function getReview(req, res) {
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var reviewId = req.swagger.params.reviewId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new review()).getOneReviewAndReplay(traceId, componentId,reviewId,
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

// Get user reviews
function getUserReview(req, res) {
    console.log("get user review called")
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    (new review()).userReviews(traceId, componentId,userId,
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

// Update user review
function updateUserReview(req, res) {
    var tokenId = req.headers.user_access;
    var componentId = req.swagger.params.componentId.value;
    var userId = req.swagger.params.userId.value;
    var traceId = process.env.TRACE_VARIABLE|| "traceID";
    var bodyData = req.swagger.params.body.value;
    (new review(bodyData)).updateUserReview(traceId, componentId,userId,bodyData.componentType,
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