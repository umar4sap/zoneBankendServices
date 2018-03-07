'use strict';
var Q = require('q');

var StorageClient = require('../helpers/client/storage-service-client'),
    _ = require('lodash');
var storageType = ['images', 'videos', 'icons', 'supportingDocs', 'labImage'];
var storageTypeForIcons = ['icons', 'labImage'];

var Logger = require('bunyan');

var log = new Logger.createLogger({
    name: 'veegam-training-labs',
    serializers: { req: Logger.stdSerializers.req }
});

function createPAR(orgId, userId, token, objectType, objectName, traceId) {
    var defer = Q.defer();
    StorageClient.createReadPAR(orgId, userId, token, objectType, objectName, traceId, function(err, result) {
        if (err) {
            log.error("TraceId : %s, Error : %s", traceId, JSON.stringify(err));
            defer.reject;
        }
        defer.resolve(result);
    });
    return defer.promise;
}
var getAllUrl = function(orgId, userId, tokenId, labdata, traceId, cb) {
    console.log(labdata)
    var d = Q.defer();
    var promise = storageType.map(function(item) {
        var defer = Q.defer();
        var promises = labdata[0][item].map(function(image) {
            if (image.urlType == "dynamic") {
                return createPAR(orgId, userId, tokenId, item, image.id, traceId);
            }
        });
        Q.all(promises)
            .then(function(data) {
                _.merge(labdata[0][item], data);
                defer.resolve(labdata);
            }, function(reason) {
                log.error("TraceId : %s, Reason : %s", traceId, JSON.stringify(reason));
                cb(reason);
            })
        return defer.promise;
    })

    Q.all(promise)
        .then(function(data) {
            return data[0];
        }, function(reason) {
            log.error("TraceId : %s, Reason : %s", traceId, JSON.stringify(reason));
            cb(reason);
        }).done(
            function(data) {
                cb(null, data);
            });
}

var getIconsAndBanner = function(orgId, userId, tokenId, labdata, traceId, cb) {

    var d = Q.defer();
    var promise = storageType.map(function(item) {
        var defer = Q.defer();
        var promises = labdata[item].map(function(image) {
            if (image.urlType == "dynamic") {
                return createPAR(orgId, userId, tokenId, item, image.id, traceId);
            }
        });
        Q.all(promises)
            .then(function(data) {
                _.merge(labdata[item], data);
                defer.resolve(labdata);
            }, function(reason) {
                log.error("TraceId : %s, Reason : %s", traceId, JSON.stringify(reason));
                cb(reason);
            })
        return defer.promise;
    })

    Q.all(promise)
        .then(function(data) {
            return data[0];
        }, function(reason) {
            log.error("TraceId : %s, Reason : %s", traceId, JSON.stringify(reason));
            cb(reason);
        }).done(
            function(data) {
                cb(null, data);
            });
}
var getIconUrl = function(orgId, userId, tokenId, demolabdata, traceId, cb) {
    return new Promise(function(resolve, reject) {
        console.log("demolabdata.logo===>", demolabdata[0].logo)
        let labs = [];
        var promises = demolabdata[0].logo.map(function(item) {
            if (item.urlType == 'dynamic')
                return createPAR(orgId, userId, tokenId, "logo", item.id, traceId);
        });
        Q.all(promises)
            .then(function(data) {
                _.merge(demolabdata[0]["logo"], data);
                labs.push(demolabdata);
                cb(null, demolabdata);
            });
    });

}
module.exports = { getAllUrl, getIconUrl, getIconsAndBanner };