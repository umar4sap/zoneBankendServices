'use strict';
var Q = require('q');
var _ = require('lodash'),
    dbconfig = require('../../config/db'),
    dbUtils = require('../helpers/db/db'),
    BadgeMetadata = require('../helpers/transformer/badgeMetadata'),
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

badge.prototype.data = {}

function badge(data) {
    badge.prototype.data = data;
}

badge.prototype.getData = function() {
    return badge.prototype.data;
}

badge.prototype.get = function(name) {
    return this.data[name];
}

badge.prototype.set = function(name, value) {
    this.data[name] = value;
}

/**
 * save badge details
 */
badge.prototype.save = (tokenId, userId, traceId, tenantId, orgId, cb) => {
    var badgeMetadata = new BadgeMetadata(badge.prototype.data, userId, tenantId, orgId).getData();
    rdb.table("badges").filter({ "name": badgeMetadata.name, "orgId": orgId }).count().run().then(function(result) {
        if (result) {
            cb(null, { "message": "badge Name exist" });
        } else {
            badgeMetadata.createdDTS = new Date();
            rdb.table("badges").insert(badgeMetadata).run().then(function(badgeMetadata) {
                cb(null, badgeMetadata);
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
 * get all badges list
 */
badge.prototype.findAll = (traceId, userId, tenantId, skip, limit, orgId, cb) => {
    var response = {
        message: "Cannot Get all badges.",
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("badges")
        .filter({ 'orgId': orgId })
        .orderBy('badgeId')
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
 * get badge details by badgeId
 */
badge.prototype.findBadgeById = (traceId, badgeId, orgId, cb) => {
    var response = {
        message: "Cannot Get badge by badge Id" + badgeId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("badges")
        .filter({ 'badgeId': badgeId, 'orgId': orgId })
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
 * update badge details
 */
badge.prototype.updateBadge = (tokenId, userId, traceId, badgeId, orgId, cb) => {
    var badgeMetadata = new BadgeMetadata(badge.prototype.data, userId).getData();
    badgeMetadata.updatedDTS = new Date();
    rdb.table("badges").filter({ 'badgeId': badgeId, 'orgId': orgId })
        .update(badgeMetadata).run().then(function(result) {
            cb(null, result);
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(err);
        })
}

/**
 * delete badge details
 */
badge.prototype.deleteBadge = (traceId, badgeId, orgId, cb) => {
    var response = {
        message: "Cannot delete badge by badgeId" + badgeId,
        statusCode: 404,
        errorCode: "code1"
    }
    rdb.table("badges")
        .filter({ 'badgeId': badgeId, 'orgId': orgId })
        .delete({ "returnChanges": true })
        .run()
        .then(function(result) {
            if (result.changes) {
                if (result.changes['0'] && result.changes['0'].old_val && result.changes['0'].old_val.connectionIds && result.changes['0'].old_val.connectionIds.length > 0) {
                    rdb.table("connections")
                        .getAll(rdb.args(result.changes['0'].old_val.connectionIds))
                        .update(function(row) {
                            return {
                                // Get all the badges, expect the one we want to update
                                badges: row('badges').filter(function(badge) {
                                        return badge('badgeId').ne(badgeId)
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
                    cb(null, new badge(result));
                }
            } else {
                cb(null, { "message": "badgeId doesnot exist" });
            }
        }).catch(function(err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            cb(response);
        });
}

module.exports = badge;