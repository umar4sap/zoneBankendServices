//import { request } from '../../../../../../Library/Caches/typescript/2.6/node_modules/@types/spdy';

'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    PlanMetadata = require('../helpers/transformer/planMetadata'),
    AuthClient = require('../helpers/client/auth0-service-client'),
    storage = require("../domain/storage"),
    Logger = require('bunyan');

var log = new Logger.createLogger({
    name: 'test',
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

plan.prototype.data = {}

function plan(data) {
    plan.prototype.data = data;
}

plan.prototype.getData = function() {
    return plan.prototype.data;
}

plan.prototype.get = function(name) {
    return this.data[name];
}

plan.prototype.set = function(name, value) {
    this.data[name] = value;
}

/**
 * save plan details
 */
plan.prototype.save = (tokenId, userId, traceId, tenantId, zoneId, cb) => {
    var planMetadata = new PlanMetadata(plan.prototype.data, userId, tenantId, zoneId).getData();
    planMetadata.userId=userId;
    rdb.table("plans").filter({ "planName": planMetadata.planName, "zoneId": zoneId }).count().run().then(function(result) {
        if (result) {
            cb(null, { "message": "plan Name exist" });
        } else {
            planMetadata.createdDTS = new Date();
            rdb.table("plans").insert(planMetadata).run().then(function(planMetadata) {
                cb(null, planMetadata);
            }).catch(function(e) {
                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(e));
                cb(e);
            })
        }
    }).catch(function(e) {
        log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(e));
        cb(e);
    })
}

/**
 * get all plans list
 */
plan.prototype.findAll = (traceId, userId, tenantId,  cb) => {
    var response = {
        message: "Cannot Get all plans.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("plans")
        .filter({ 'userId': userId })
        .orderBy('planId')
        .run().then(function(result) {
            if (result.length > 0) {
               
                           
                                var resObj = { "status": "200", "data": result }
                                cb(null, resObj);
            }else{
                var resObj = { "status": "200", "data": result }
                cb(null, resObj);
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

plan.prototype.findAllForZone = (traceId, zoneId, cb) => {
    var response = {
        message: "Cannot Get all plans.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("plans")
        .filter({ 'zoneId': zoneId })
        .orderBy('planId')
        .run().then(function(result) {
            if (result.length > 0) {
               
                           
                                var resObj = { "status": "200", "data": result }
                                cb(null, resObj);
            }else{
                var resObj = { "status": "200", "data": result }
                cb(null, resObj);
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

/**
 * get plan details by planId
 */
plan.prototype.findplanById = (traceId, planId, zoneId, cb) => {
    var response = {
        message: "Cannot Get plan by plan Id" + planId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("plans")
        .filter({ 'planId': planId, 'zoneId': zoneId })
        .run()
        .then(function(result) {
            if (result.length > 0) {
                var resObj = { "status": "200", "data": result }
                cb(null, resObj);
            }else{
                var resObj = { "status": "200", "data": result }
                cb(null, resObj);
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

/**
 * update plan details
 */
plan.prototype.updateplan = (tokenId, userId, traceId, planId, zoneId, cb) => {
    var planMetadata = new PlanMetadata(plan.prototype.data, userId).getData();
    planMetadata.updatedDTS = new Date();
    rdb.table("plans").filter({ 'planId': planId, 'zoneId': zoneId })
        .update(planMetadata).run().then(function(result) {
            cb(null, result);
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(err);
        })
}

/**
 * delete plan details
 */
plan.prototype.deleteplan = (traceId, planId, zoneId, cb) => {
    var response = {
        message: "Cannot delete plan by planId" + planId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("plans")
        .filter({ 'planId': planId, 'zoneId': zoneId })
        .delete({ "returnChanges": true })
        .run()
        .then(function(result) {
            if (result.changes) {
                if (result.changes['0'] && result.changes['0'].old_val && result.changes['0'].old_val.connectionIds && result.changes['0'].old_val.connectionIds.length > 0) {
                    rdb.table("connections")
                        .getAll(rdb.args(result.changes['0'].old_val.connectionIds))
                        .update(function(row) {
                            return {
                                // Get all the plans, expect the one we want to update
                                plans: row('plans').filter(function(plan) {
                                        return plan('planId').ne(planId)
                                    })
                                    .default([])
                            };
                        })
                        .run()
                        .then(function(connectionsUpdate) {
                            cb(null, connectionsUpdate)
                        })
                        .catch(function(err) {
                            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                            cb(response);
                        });
                } else {
                    cb(null, new plan(result));
                }
            } else {
                cb(null, { "message": "planId doesnot exist" });
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

module.exports = plan;





