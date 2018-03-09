'use strict';
var Logger = require('bunyan');
const request = require('request-promise');
const auth0_service = process.env.AUTH0_CLIENT_SERVICE_ENDPOINT ;
const basePath = '/v2/components/auth0-client';

var log = new Logger.createLogger({ 
    name: 'sysgain-veegam-trials-storage', 
    serializers: { req: Logger.stdSerializers.req } 
});

var getAuthToken = function(zoneId,traceId) {
    console.log("called"+zoneId);
    var uri = auth0_service + basePath + "/zone/" + zoneId +"/token";
    return new Promise(function(resolve,reject){ 
        request(
        {  
            method: 'GET',
            uri: uri,
            headers:{
                'trace-id':traceId
            }
        }
     ).then((data) => {  
        //cb(null, data);
        console.log(data);
        resolve(data);
    }).catch((err) => {
        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
        var e = new Error(err);
        log.error(e);
        //cb(e);
        reject(err);
        });
    });
}


module.exports = {
    getAuthToken: getAuthToken
}