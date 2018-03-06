'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    LabMetadata = require('../helpers/transformer/memberMetadata'),
    Logger = require('bunyan');
var request = require("request");
var moment = require('moment');
var log = new Logger.createLogger({
    name: 'member',
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
member.prototype.data = {}


function member(data) {
    member.prototype.data = data;
}
function replied(data) {
    replied.prototype.data = data;
}

member.prototype.getData = function () {
    return member.prototype.data;
}
replied.prototype.getData = function () {
    return replied.prototype.data;
}


// create new member for zone
member.prototype.postmember = ( photo,traceId,cb) => {

    member.prototype.data['createdDTS'] = moment.utc().format();
    member.prototype.data['updatedDTS'] = moment.utc().format();
    var memberMetadata = new LabMetadata(member.prototype.data).getData();
     
    var request = require('request').defaults({ encoding: 'binary' });
request.get(photo, function (err, res, body) {
      console.log("photourl"+body)
      var base64      = new Buffer(body, 'binary').toString('base64');
      memberMetadata.memberPhoto=base64
      insertmember();
});
    
//local function to insert members
    function insertmember(){
    
     rdb.table("members").insert(memberMetadata).run().then(function (memberData) {
             var resObj = { "status": "200", "data": { "message": "member is yet to approve"} }
                    
                    cb(null,resObj);
         
                }).catch(function (err) {
                    console.log("first err catch")
                    log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    var resObj = { "status": "404", "error": err }
                    cb(resObj);
                });
            


            }
        }

// update the member
member.prototype.replaymember = (tbodyData,componentId, userId, traceId, memberId, userType, orgId, cb) => {
    console.log("update member api called")
    tbodyData.updatedDTS = moment.utc().format();
    tbodyData.publisherId=userId;
    rdb.table("membersandratings").filter({ componentId: componentId, memberId: memberId,status:"publish" }).run().then(function (result) {
       var publisherRepalies =result[0].publisherRepalies;
        publisherRepalies.push(tbodyData);
      rdb.table("membersandratings").filter({ componentId: componentId, memberId: memberId,status:"publish" }).update({publisherRepalies:publisherRepalies}).run().then(function (updatedResult) {
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

// delete member
member.prototype.deletemember = (componentId, memberId,orgId,traceId, tenantId, cb) => {
    var response = {
        message: "Cannot Delete the member.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("membersandratings").filter({"componentId": componentId,"memberId":memberId}).delete().run().then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// list all member for admin level
member.prototype.findAllmembersForAllcity = (traceId, startfrom,cb) => {
    var response = {
        message: "Cannot Get all member.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("members").filter({"memberStatus":"inReview"}).skip(Number(startfrom)).limit(10).run().then(function (result) {
        var resObj = { "status": "200", "data": result }
        cb(null, resObj);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// Getpublished member by cityId
member.prototype.citymembers = (traceId, cityId, cb) => {
    rdb.table("members").filter({ cityId: cityId,"memberStatus":"active"}).run().then(function (result) {

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


// Getpublished member by cityId and memberId
member.prototype.getOnemember = (traceId, cityId,memberId, cb) => {
    rdb.table("members").filter({ cityId: cityId,memberId:memberId,memberStatus:"active" }).run().then(function (result) {

        if (result.length > 0) {
          var baseData=result[0].memberPhoto
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

// Getpublished member by memberId
member.prototype.citymembersApproval = (status,traceId, cityId,memberId, cb) => {
    rdb.table("members").filter({ "cityId": cityId ,"memberId":memberId }).update({"memberStatus":status}).run().then(function (result) {
                        var resObj = { "status": "200", "data": memberId + "  member  " + status }
                        cb(null, resObj);
                
      
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

member.prototype.usermembers = (traceId, componentId, userId, cb) => {
    rdb.table("membersandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).run().then(function (result) {
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


member.prototype.updateUsermember = (traceId, componentId, userId, cb) => {
    member.prototype.data['updatedDTS'] = moment.utc().format();    
    var memberMetadata = new LabMetadata(member.prototype.data).getData();
    rdb.table("membersandratings").filter({ componentId: componentId, "status": "publish", userId: userId}).run().then(function (result) {
        if (result.length > 0) {
            rdb.table("membersandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).update(memberMetadata).run().then(function (result) {
                var resObj = { "status": "200", "data": { "message": "member updated successfully" } }
                cb(null, resObj);
            }).catch(function (err) {
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                var resObj = { "status": "404", "error": err }
                cb(resObj);
            })
        } else {
            var resObj = { "status": "200", "data": {"message":"Record not found"} }
            cb(null, resObj);
        }
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}




module.exports = member;
