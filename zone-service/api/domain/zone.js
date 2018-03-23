'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    LabMetadata = require('../helpers/transformer/zoneMetadata'),
    Logger = require('bunyan');
var request = require("request");
var moment = require('moment');
var log = new Logger.createLogger({
    name: 'qloudable-training-zone',
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
zone.prototype.data = {}


function zone(data) {
    zone.prototype.data = data;
}
function replied(data) {
    replied.prototype.data = data;
}

zone.prototype.getData = function () {
    return zone.prototype.data;
}
replied.prototype.getData = function () {
    return replied.prototype.data;
}


// create new zone for owner
zone.prototype.postzone = ( cityId,traceId,userId,cb) => {
    zone.prototype.data['createdDTS'] = moment.utc().format();
    zone.prototype.data['updatedDTS'] = moment.utc().format();
    var zoneMetadata = new LabMetadata(zone.prototype.data).getData();
     insertzone();
    
//local function to insert components
    function insertzone(){
    zoneMetadata.cityId=cityId
    zoneMetadata.userId=userId
     rdb.table("zones").insert(zoneMetadata).run().then(function (zoneData) {
             var resObj = { "status": "200", "data": { "message": "Your zone is yet to publish"} }
                    
                    cb(null,resObj);
         
                }).catch(function (err) {
                    console.log("first err catch")
                    log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    var resObj = { "status": "404", "error": err }
                    cb(resObj);
                });
            


            }
        }

// update the zone
zone.prototype.replayzone = (tbodyData,componentId, userId, traceId, zoneId, userType, orgId, cb) => {
    console.log("update zone api called")
    tbodyData.updatedDTS = moment.utc().format();
    tbodyData.publisherId=userId;
    rdb.table("zonesandratings").filter({ componentId: componentId, zoneId: zoneId,status:"publish" }).run().then(function (result) {
       var publisherRepalies =result[0].publisherRepalies;
        publisherRepalies.push(tbodyData);
      rdb.table("zonesandratings").filter({ componentId: componentId, zoneId: zoneId,status:"publish" }).update({publisherRepalies:publisherRepalies}).run().then(function (updatedResult) {
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

// delete zone
zone.prototype.deletezone = (componentId, zoneId,orgId,traceId, tenantId, cb) => {
    var response = {
        message: "Cannot Delete the zone.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("zonesandratings").filter({"componentId": componentId,"zoneId":zoneId}).delete().run().then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// list all zone for admin level
zone.prototype.findAllzonesForAllcity = (traceId, startfrom,cb) => {
    var response = {
        message: "Cannot Get all zone.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("zones").filter({"zoneStatus":"inReview"}).skip(Number(startfrom)).limit(10).run().then(function (result) {
        var resObj = { "status": "200", "data": result }
        cb(null, resObj);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// Getpublished zone by cityId
zone.prototype.cityzones = (traceId, cityId, cb) => {
    rdb.table("zones").filter({ cityId: cityId,"zoneStatus":"publish"}).without("images","logo").run().then(function (result) {

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

// Getpublished zone by cityId
zone.prototype.ownerzones = (traceId, userId, cb) => {
    rdb.table("zones").filter({ userId: userId,"zoneStatus":"publish"}).without("images","logo").run().then(function (result) {

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


// Getpublished zone by cityId and zoneId
zone.prototype.getOnezone = (traceId, cityId,zoneId, cb) => {
    rdb.table("zones").filter({ cityId: cityId,zoneId:zoneId,zoneStatus:"publish" }).run().then(function (result) {

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

// Getpublished zone by zoneId
zone.prototype.cityzonesApproval = (status,traceId, cityId,zoneId, cb) => {
    rdb.table("zones").filter({ "cityId": cityId ,"zoneId":zoneId }).update({"zoneStatus":status}).run().then(function (result) {
                        var resObj = { "status": "200", "data": zoneId + "  zone  " + status }
                        cb(null, resObj);
                
      
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": err }
        cb(resObj);
    })
}

zone.prototype.userzones = (traceId, componentId, userId, cb) => {
    rdb.table("zonesandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).run().then(function (result) {
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


zone.prototype.updateUserzone = (traceId, componentId, userId, cb) => {
    zone.prototype.data['updatedDTS'] = moment.utc().format();    
    var zoneMetadata = new LabMetadata(zone.prototype.data).getData();
    rdb.table("zonesandratings").filter({ componentId: componentId, "status": "publish", userId: userId}).run().then(function (result) {
        if (result.length > 0) {
            rdb.table("zonesandratings").filter({ componentId: componentId, "status": "publish", userId: userId }).update(zoneMetadata).run().then(function (result) {
                var resObj = { "status": "200", "data": { "message": "zone updated successfully" } }
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




module.exports = zone;
