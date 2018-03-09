'use strict';
var Logger = require('bunyan');
const request = require('request-promise');
const storage_service = process.env.STORAGE_SERVICE_ENDPOINT;

const basePath= "/v2/components/storage-service";

var log = new Logger.createLogger({ 
name: 'storage-setup', 
serializers: { req: Logger.stdSerializers.req } 
});

var createReadPAR = function(zoneId, userId, tokenId, objectType, objectName, traceId, cb) {
   
var uri = storage_service + basePath + "/zone/" + zoneId + "/user/" + userId + "/type/oracle/par/ObjectRead/name/" + objectName;
    request(
    { 
        method: 'GET',
        uri: uri,
        headers: {
            'authorization': tokenId,
            'trace-id':traceId
        }
    }).then((data) => {
        var response = JSON.parse(data);
        var obj = {
            "id" : response.objectName,
            "url" : response.oracleBasePath + response.accessUri,
            "objectType": objectType
        };
        cb(null, obj );
    }).catch((err) => {
        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
        var e = new Error(err);
        cb(e);
    });
}
var createNewReadPAR = function(zoneId, userId, tokenId, objectType, objectName, traceId, cb) {
    return new Promise(function(resolve,reject){
        var uri = storage_service + basePath + "/zone/" + zoneId + "/user/" + userId + "/type/oracle/par/ObjectRead/name/" + objectName;
    request(
    { 
        method: 'GET',
        uri: uri,
        headers: {
            'authorization': tokenId,
            'trace-id':traceId
        }
    }).then((data) => {
        var response = JSON.parse(data);
        var obj = {
            "id" : response.objectName,
            "url" : response.oracleBasePath + response.accessUri,
            "objectType": objectType
        };
        //cb(null, obj );
        resolve(obj);
    }).catch((err) => {
        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
        var e = new Error(err);
        //cb(e);
        reject(e);
    });
    })

}
module.exports = {
    createReadPAR: createReadPAR,
    createNewReadPAR
}