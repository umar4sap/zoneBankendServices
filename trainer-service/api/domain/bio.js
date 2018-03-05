'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    LabMetadata = require('../helpers/transformer/bioMetadata'),
    AuthClient = require('../helpers/client/auth0-service-client'),
    storage = require("../domain/storage"),
    Logger = require('bunyan');
var request = require("request");
var moment = require('moment');
var log = new Logger.createLogger({
    name: 'qloudable-training-bios',
    serializers: { req: Logger.stdSerializers.req }
});
var rdb = require('rethinkdbdash')({
    pool: true,
    cursor: false,
    port: dbconfig.rethinkdb.port,
    host: dbconfig.rethinkdb.host,
    db: dbconfig.rethinkdb.db,
    buffer: dbconfig.rethinkdb.min,
    max: dbconfig.rethinkdb.max
});
const uuidv4 = require('uuid/v4');
bios.prototype.data = {}

function bios(data) {
    bios.prototype.data = data;
}

bios.prototype.getData = function () {
    return bios.prototype.data;
}
// create bio
bios.prototype.save = ( userId, traceId, tenantId, userType, orgId, cb) => {
    bios.prototype.data['createdDTS'] = moment.utc().format();
    bios.prototype.data['updatedDTS'] = moment.utc().format();
    var bioMetadata = new LabMetadata(bios.prototype.data, userId, tenantId).getData();
    bioMetadata.authorId = userId;
    bioMetadata.orgId = orgId;
    rdb.table("authorbiography").filter(
        { authorId: userId }).run().then(function (result) {
            console.log("result",result)
            if (result.length > 0) {
                var resObj = { "status": "200", "data": { "message": "publisher already exist", "authorId": result[0].authorId } }
                cb(null, resObj);
            } else {
                rdb.table("authorbiography").insert(bioMetadata).run().then(function (bioData) {
                   
                    var resObj = { "status": "200", "data": { "message": "Publisher bio created successfully", "authorId": userId } }
                    console.log("bioData:",bioData)
                    cb(null,resObj);
                }).catch(function (err) {
                    console.log("first err catch")
                    log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                    var resObj = { "status": "404", "error": err }
                    cb(resObj);
                });
            }
        }).catch(function (err) {
             console.log("second err catch")
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            var resObj = { "status": "404", "error": err }
            cb(resObj);
        })
}
// update the bio
bios.prototype.updateBio = (tokenId, userId, traceId, authorId, tenantId, userType, orgId, cb) => {
    console.log("update bio api called")
    bios.prototype.data['updatedDTS'] = moment.utc().format();
    var bioMetadata = new LabMetadata(bios.prototype.data, userId, tenantId).getData();
    bioMetadata.authorId = authorId;
    bioMetadata.orgId = orgId;
    bioMetadata.userId = userId;
    rdb.table("authorbiography").filter({ userId: userId, authorId: authorId }).run().then(function (result) {
        if (result.length != 0) {
            rdb.table("authorbiography").filter({ authorId: authorId }).update(bioMetadata).run().then(function (updatedResult) {
                var resObj = { "status": "200", "data": { "message": "Publisher bio updated successfully" } }
                cb(null, resObj);
            }).catch(function (err) {
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));

                cb(err)
            })
        }
        else {
            var resObj = { "status": "404", "data": { "message": "Lab does not exist" } }
            cb(null, resObj);
        }
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        cb(err);
    })
}

// delete bio
bios.prototype.deleteBio = (authorId, traceId, tenantId, cb) => {
    var response = {
        message: "Cannot Delete the bio.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("authorbiography").filter({ 'authorId': authorId }).delete().run().then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// list all bios for publisher
bios.prototype.findAllPublishers = (traceId, orgId, cb) => {
    var response = {
        message: "Cannot Get all bios.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("authorbiography").filter({ orgId: orgId }).orderBy(rdb.desc("createdDTS")).run().then(function (result) {
      // console.log("result:",result)
        var resObj = { "status": "200", "data": result }
        cb(null,resObj);
    }).catch(function (err) {
        //log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
        var resObj = { "status": "404", "error": response }
        cb(resObj);
    });
}

// Getpublished bio by authorId
bios.prototype.publisherDetails = (traceId, authorId, cb) => {
    rdb.table("authorbiography").filter({ authorId: authorId }).run().then(function (result) {

        if (result.length > 0) {
            AuthClient.getAuthToken("sysgain", traceId)
                .then(function (data) {
                    let token = data.replace(/["']/g, "");
                    storage.getAuthorsUrl("sysgain", "Sygain User", token, result, traceId).then(function (response) {
                        console.log(response)
                        var resObj = { "status": "200", "data": response }
                        cb(null, resObj);
                    });
                });
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

bios.prototype.publisherDetailsforUser = (traceId, authorId, cb) => {
    rdb.table("authorbiography").filter({ authorId: authorId }).run().then(function (result) {

        if (result.length > 0) {
            AuthClient.getAuthToken("sysgain", traceId)
                .then(function (data) {
                    let token = data.replace(/["']/g, "");
                    storage.getAuthorsUrl("sysgain", "Sygain User", token, result, traceId).then(function (response) {
                        console.log(response)
                        var resObj = { "status": "200", "data": response }
                        cb(null, resObj);
                    });
                });
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

module.exports = bios;
