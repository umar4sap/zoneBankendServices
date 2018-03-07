'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    trainerMetadata = require('../helpers/transformer/trainerMetadata'),
    AuthClient = require('../helpers/client/auth0-service-client'),
    storage = require("../domain/storage"),
    Logger = require('bunyan');

var log = new Logger.createLogger({
    name: 'qloudable-training-labs',
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

trainer.prototype.data = {}

function trainer(data) {
    trainer.prototype.data = data;
}

trainer.prototype.getData = function() {
    return trainer.prototype.data;
}

trainer.prototype.get = function(name) {
    return this.data[name];
}

trainer.prototype.set = function(name, value) {
    this.data[name] = value;
}

/**
 * save trainer details
 */
trainer.prototype.save = (tokenId, userId, traceId, tenantId, orgId, cb) => {
    var trainerMetadata = new trainerMetadata(trainer.prototype.data, userId, tenantId, orgId).getData();
    rdb.table("trainers").filter({ "name": trainerMetadata.name, "orgId": orgId }).count().run().then(function(result) {
        if (result) {
            cb(null, { "message": "trainer Name exist" });
        } else {
            trainerMetadata.createdDTS = new Date();
            rdb.table("trainers").insert(trainerMetadata).run().then(function(trainerMetadata) {
                cb(null, trainerMetadata);
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
 * get all trainers list
 */
trainer.prototype.findAll = (traceId, userId, tenantId, skip, limit, orgId, cb) => {
    var response = {
        message: "Cannot Get all trainers.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("trainers")
        .filter({ 'orgId': orgId })
        .orderBy('trainerId')
        .run().then(function(result) {
            if (result.length > 0) {
                AuthClient.getAuthToken("sysgain", traceId)
                    .then(function(data) {
                        let token = data.replace(/["']/g, "");
                        storage.getIconUrl("sysgain", "Sygain User", token, result, traceId, function(err, response) {
                            if (err) {
                                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                            } else {
                                var resObj = { "status": "200", "data": response }
                                cb(null, resObj);
                            }
                        });
                    });
            } else {
                cb(null, result);
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

/**
 * get trainer details by trainerId
 */
trainer.prototype.findtrainerById = (traceId, trainerId, orgId, cb) => {
    var response = {
        message: "Cannot Get trainer by trainer Id" + trainerId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("trainers")
        .filter({ 'trainerId': trainerId, 'orgId': orgId })
        .run()
        .then(function(result) {
            if (result.length > 0) {
                AuthClient.getAuthToken("sysgain", traceId)
                    .then(function(data) {
                        let token = data.replace(/["']/g, "");
                        storage.getIconUrl("sysgain", "Sygain User", token, result, traceId, function(err, response) {
                            if (err) {
                                log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
                            } else {
                                var resObj = { "status": "200", "data": response }
                                cb(null, resObj);
                            }
                        });
                    });
            } else {
                cb(null, result);
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

/**
 * update trainer details
 */
trainer.prototype.updatetrainer = (tokenId, userId, traceId, trainerId, orgId, cb) => {
    var trainerMetadata = new trainerMetadata(trainer.prototype.data, userId).getData();
    trainerMetadata.updatedDTS = new Date();
    rdb.table("trainers").filter({ 'trainerId': trainerId, 'orgId': orgId })
        .update(trainerMetadata).run().then(function(result) {
            cb(null, result);
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(err);
        })
}

/**
 * delete trainer details
 */
trainer.prototype.deletetrainer = (traceId, trainerId, orgId, cb) => {
    var response = {
        message: "Cannot delete trainer by trainerId" + trainerId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("trainers")
        .filter({ 'trainerId': trainerId, 'orgId': orgId })
        .delete({ "returnChanges": true })
        .run()
        .then(function(result) {
            if (result.changes) {
                if (result.changes['0'] && result.changes['0'].old_val && result.changes['0'].old_val.connectionIds && result.changes['0'].old_val.connectionIds.length > 0) {
                    rdb.table("connections")
                        .getAll(rdb.args(result.changes['0'].old_val.connectionIds))
                        .update(function(row) {
                            return {
                                // Get all the trainers, expect the one we want to update
                                trainers: row('trainers').filter(function(trainer) {
                                        return trainer('trainerId').ne(trainerId)
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
                    cb(null, new trainer(result));
                }
            } else {
                cb(null, { "message": "trainerId doesnot exist" });
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

module.exports = trainer;