'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    LabMetadata = require('../helpers/transformer/ReviewMetadata'),
    Logger = require('bunyan');
var request = require("request");
var moderator = require("../domain/moderator");
var moment = require('moment');
var log = new Logger.createLogger({
    name: 'qloudable-training-review',
    serializers: { req: Logger.stdSerializers.req }
});
var rdb = require('rethinkdbdash')({
    pool: true,
    cursor: false,
    port: dbconfig.rethinkdb.port,
    host: dbconfig.rethinkdb.host,
    db: dbconfig.rethinkdb.db
});
const uuidv4 = require('uuid/v4');
review.prototype.data = {}


function review(data) {
    review.prototype.data = data;
}
function replied(data) {
    replied.prototype.data = data;
}

review.prototype.getData = function () {
    return review.prototype.data;
}
replied.prototype.getData = function () {
    return replied.prototype.data;
}


// create new Review for user
review.prototype.postReview = (userId, userType, componentId, componentType, traceId, cb) => {
    review.prototype.data['createdDTS'] = moment.utc().format();
    review.prototype.data['updatedDTS'] = moment.utc().format();
    var ReviewMetadata = new LabMetadata(review.prototype.data).getData();
    rdb.table("reviewsandratings").filter({ componentId: componentId, userId: userId }).run().then(function (result) {
        if (result.length > 0) {
            var resObj = { "status": "200", "data": { "message": "You already reviewed for this lab, if it is not visible then please wait for admin's approval" } }

            cb(null, resObj);
        } else {
            
           
            if (componentType == "labs") {

                rdb.table("labs").filter({ 'labId': componentId }).getField("status").getField("publish").pluck("authors").run().then(function (authorsList) {
                    ReviewMetadata.authors = authorsList[0].authors;
                    console.log("it has labs reviews")
                    rdb.table("labs").filter({ 'labId': componentId }).pluck("orgId").run().then(function (orgName) {
                        ReviewMetadata.orgId = orgName[0].orgId;
                        console.log("it has labs orgId")
                        insertReview();
                    })
                    
                })

            } else {
                insertReview()
            }
        }
    }).catch(function (err) {
        console.log("first err catch")
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    });


    //local function to insert components
    function insertReview() {

        // moderator.contentCheck(ReviewMetadata.reviewedMessage).then(function (data) {
        //     data = JSON.parse(data)
        //     if (data.Classification.ReviewRecommended == false) {
        //        //if you want to implement this then make it "publish"
        //         ReviewMetadata.status = "inReview";
        //         ReviewMetadata.remark = "This is auto check skipped";
        //     }
            ReviewMetadata.componentId = componentId;
            ReviewMetadata.contentType = componentType;
            rdb.table("reviewsandratings").insert(ReviewMetadata).run().then(function (ReviewData) {
                console.log(ReviewData)
                var resObj = { "status": "200", "data": { "message": "Your review is yet to publish", "componentId": componentId, reviewId: ReviewData.generated_keys[0] } }

                cb(null, resObj);

            }).catch(function (err) {
                console.log("first err catch")
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                var resObj = { "status": "404", "error": err }
                cb(resObj);
            });


        // }).catch(function () {
        //     if (data.Classification.ReviewRecommended == false) {
        //         ReviewMetadata.status = "inReview";
        //         ReviewMetadata.remark = "auto check skipped";
        //     }
        //     rdb.table("reviewsandratings").insert(ReviewMetadata).run().then(function (ReviewData) {
        //         console.log(ReviewData)
        //         var resObj = { "status": "200", "data": { "message": "Your review is yet to publish", "componentId": componentId, reviewId: ReviewData.generated_keys[0] } }

        //         cb(null, resObj);

        //     }).catch(function (err) {
        //         console.log("first err catch")
        //         log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        //         var resObj = { "status": "404", "error": err }
        //         cb(resObj);
        //     });
        // })
    }

}

// update the Review
review.prototype.replayReview = (tbodyData, componentId, userId, traceId, reviewId, userType, orgId, cb) => {
    console.log("update Review api called")
    tbodyData.updatedDTS = moment.utc().format();
    tbodyData.publisherId = userId;
    rdb.table("reviewsandratings").filter({ componentId: componentId, reviewId: reviewId, status: "publish" }).run().then(function (result) {
        var publisherRepalies = result[0].publisherRepalies;
        publisherRepalies.push(tbodyData);
        rdb.table("reviewsandratings").filter({ componentId: componentId, reviewId: reviewId, status: "publish" }).update({ publisherRepalies: publisherRepalies }).run().then(function (updatedResult) {
            var resObj = { "status": "200", "data": { "message": "Publisher replayed updated successfully" } }
            cb(null, resObj);
        }).catch(function (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));

            cb(err)
        })
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        cb(err);
    })
}

// delete Review
review.prototype.deleteReview = (componentId, reviewId, orgId, traceId, tenantId, cb) => {
    var response = {
        message: "Cannot Delete the Review.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("reviewsandratings").filter({ "componentId": componentId, "reviewId": reviewId }).delete().run().then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// list all review for admin level
review.prototype.findAllReviewsForAllComponent = (traceId, startfrom,orgId, cb) => {
    var response = {
        message: "Cannot Get all review.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("reviewsandratings").filter({ "status": "inReview" ,"orgId":orgId}).skip(Number(startfrom)).limit(10).run().then(function (result) {
        var resObj = { "status": "200", "data": result }
        cb(null, resObj);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// Getpublished Review by componentId
review.prototype.componentReviews = (traceId, componentId, cb) => {
    rdb.table("reviewsandratings").filter({ componentId: componentId, status: "publish" }).run().then(function (result) {

        if (result.length > 0) {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);

        } else {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);
        }
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

//To get labs rating
review.prototype.componentRating = (traceId, componentId, cb) => {
    rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish" }).getField('rating').count().run().then(function (result) {
        rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish" }).group("rating").count().run().then(function (result2) {

            var allRatingcount = 0;
            var allRatingMark = 0;
            var ratings;
            var OverAllStamp = [
                {
                    "group": 1,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 2,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 3,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 4,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 5,
                    "reduction": 0,
                    "percentage": 0
                },

            ]
            if (result) {
                var totalReviews = result;
                var allratings = result2;
                ratings = allratings.length - 1
                for (var i = 0; i < allratings.length; i++) {
                    var percentage = 100 * allratings[i].reduction / totalReviews;
                    allratings[i].percentage = Math.round(percentage);
                    allRatingcount = allRatingcount + allratings[i].group * allratings[i].reduction;
                    allRatingMark = allRatingMark + allratings[i].reduction;
                    _.merge(OverAllStamp[allratings[i].group - 1], allratings[i]);
                    if (i == ratings) {
                        var avgRating = allRatingcount / allRatingMark;
                        avgRating = Math.round(avgRating * 10) / 10;
                        var resObj = { "status": "200", "data": { "avgRating": avgRating, "ratedUsers": allRatingMark, "overAllRating": OverAllStamp } }
                        cb(null, resObj);
                    }
                }
            } else {
                var resObj = { "status": "200", "data": { "avgRating": 0, "ratedUsers": 0, "overAllRating": OverAllStamp } }
                cb(null, resObj);
            }
        }).catch(function (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            var resObj = { "status": "404", "error": err }
            cb(resObj);
        })
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

//to get authors rating
review.prototype.authorRating = (traceId, authorId, cb) => {
    rdb.table("reviewsandratings").filter({ "status": "publish" }).filter((row) => {
        return row('authors')('id').contains(authorId)
    }).getField('rating').count().run().then(function (result) {
        rdb.table("reviewsandratings").filter({ "status": "publish" }).filter((row) => {
            return row('authors')('id').contains(authorId)
        }).group("rating").count().run().then(function (result2) {
            var allRatingcount = 0;
            var allRatingMark = 0;
            var ratings;
            var OverAllStamp = [
                {
                    "group": 1,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 2,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 3,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 4,
                    "reduction": 0,
                    "percentage": 0
                },
                {
                    "group": 5,
                    "reduction": 0,
                    "percentage": 0
                },

            ]
            if (result) {
                var totalReviews = result;
                var allratings = result2;
                ratings = allratings.length - 1
                for (var i = 0; i < allratings.length; i++) {

                    var percentage = 100 * allratings[i].reduction / totalReviews;
                    allratings[i].percentage = Math.round(percentage);
                    allRatingcount = allRatingcount + allratings[i].group * allratings[i].reduction;
                    allRatingMark = allRatingMark + allratings[i].reduction;
                    _.merge(OverAllStamp[allratings[i].group - 1], allratings[i]);
                    if (i == ratings) {
                        var avgRating = allRatingcount / allRatingMark;
                        avgRating = Math.round(avgRating * 10) / 10;
                        var resObj = { "status": "200", "data": { "avgRating": avgRating, "ratedUsers": allRatingMark, "overAllRating": OverAllStamp } }
                        cb(null, resObj);
                    }
                }

            } else {
                var resObj = { "status": "200", "data": { "avgRating": 0, "ratedUsers": 0, "overAllRating": OverAllStamp } }
                cb(null, resObj);
            }
        }).catch(function (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            var resObj = { "status": "404", "error": err }
            cb(resObj);
        })
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}


// Getpublished Review by componentId
review.prototype.getOneReviewAndReplay = (traceId, componentId, reviewId, cb) => {
    rdb.table("reviewsandratings").filter({ componentId: componentId, reviewId: reviewId, status: "publish" }).run().then(function (result) {

        if (result.length > 0) {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);

        } else {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);
        }
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

// Getpublished Review by reviewId
review.prototype.componentReviewsApproval = (status, userId, traceId, componentId, remark, reviewId, cb) => {
    rdb.table("reviewsandratings").filter({ "componentId": componentId, "reviewId": reviewId }).update({ "status": status, "lastUpdateBy": userId, "remark": remark }).run().then(function (result) {
        var resObj = { "status": "200", "data": reviewId + " review " + status }
        cb(null, resObj);


    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

review.prototype.userReviews = (traceId, componentId, userId, cb) => {
    rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).run().then(function (result) {
        if (result.length > 0) {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);

        } else {
            var resObj = { "status": "200", "data": result }
            cb(null, resObj);
        }
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}


review.prototype.updateUserReview = (traceId, componentId, userId,componentType, cb) => {
    review.prototype.data['updatedDTS'] = moment.utc().format();
    var ReviewMetadata = new LabMetadata(review.prototype.data).getData();
    var componentType=componentType;
    // moderator.contentCheck(ReviewMetadata.reviewedMessage).then(function (data) {
    //     data = JSON.parse(data)
    //     if (data.Classification.ReviewRecommended == false) {
    //         //if you want to implement this then make it "publish"
    //         ReviewMetadata.status = "inReview";
    //         ReviewMetadata.remark = "This is auto check skipped";
    //     }

    if (componentType == "labs") {

        rdb.table("labs").filter({ 'labId': componentId }).getField("status").getField("publish").pluck("authors").run().then(function (authorsList) {
            ReviewMetadata.authors = authorsList[0].authors;
            console.log("it has labs reviews")
            rdb.table("labs").filter({ 'labId': componentId }).pluck("orgId").run().then(function (orgName) {
                ReviewMetadata.orgId = orgName[0].orgId;
                console.log("it has labs orgId")
                updateReview();
            })
            
        })

    } else {
        updateReview()
    }
    function updateReview(){
        
        rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).run().then(function (result) {
            if (result.length > 0) {
                rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).update(ReviewMetadata).run().then(function (result) {
                    var resObj = { "status": "200", "data": { "message": "Review updated successfully" } }
                    cb(null, resObj);
                }).catch(function (err) {
                    log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    var resObj = { "status": "404", "error": err }
                    cb(resObj);
                })
            } else {
                var resObj = { "status": "200", "data": { "message": "Record not found" } }
                cb(null, resObj);
            }
        }).catch(function (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            var resObj = { "status": "404", "error": err }
            cb(resObj);
        })
    }
    // }).catch(function (err) {
    //     ReviewMetadata.status = "inReview";
    //     ReviewMetadata.remark = "auto check skipped";
    //     rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).run().then(function (result) {
    //         if (result.length > 0) {
    //             rdb.table("reviewsandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).update(ReviewMetadata).run().then(function (result) {
    //                 var resObj = { "status": "200", "data": { "message": "Review updated successfully" } }
    //                 cb(null, resObj);
    //             }).catch(function (err) {
    //                 log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
    //                 var resObj = { "status": "404", "error": err }
    //                 cb(resObj);
    //             })
    //         } else {
    //             var resObj = { "status": "200", "data": { "message": "Record not found" } }
    //             cb(null, resObj);
    //         }
    //     }).catch(function (err) {
    //         log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
    //         var resObj = { "status": "404", "error": err }
    //         cb(resObj);
    //     })

    //})
}




module.exports = review;
