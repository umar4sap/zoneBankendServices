'use strict';


var fs = require('fs'),
    ProviderClient = require('../helpers/client/provider-client'),
    ProviderRouterClient = require('../helpers/client/provider-router-client'),
    AuthClient = require('../helpers/client/auth0-service-client'),
    flag= 0,
    organization = process.env.ORGANIZATION;
var Q = require('q');
uploads.prototype.data = {}
var Logger = require('bunyan');
var log = new Logger.createLogger({ 
    name: 'sysgain-training-storage', 
    serializers: { req: Logger.stdSerializers.req } 
});

function uploads(data) {
    uploads.prototype.data = data;
}

uploads.prototype.getData = function () {
    return uploads.prototype.data;
}

uploads.prototype.get = function (name) {
    return this.data[name];
}

uploads.prototype.set = function (name, value) {
    this.data[name] = value;
}

uploads.prototype.createPAR = (token, providerType, accessType, objectName, traceId, cb) => {
    flag=1;
    if (!fs.existsSync('./api/domain/uploadToken.txt')) {
        fs.writeFileSync('./api/domain/uploadToken.txt', "");
    }
    if(fs.existsSync('./api/domain/uploadToken.txt')){
        var globalToken = fs.readFileSync('./api/domain/uploadToken.txt');
        if(globalToken.length > 0){
            getProviderDetailsAndCreatePAR(globalToken, organization, providerType, accessType, objectName, traceId, flag, cb);
            }else{
                getAuthorizationToken(organization,traceId)
                .then(function(data){
                    var newToken= data;
                    flag = 0;
                    getProviderDetailsAndCreatePAR(newToken, organization, providerType, accessType, objectName, traceId, flag, cb);
                }).catch(function(err){
                    sendErrorResponse("Cannot get authorization token for sysgain", 404, "Auth 0 client error", cb);
                });
            }
    }
       
   
   
}

function getProviderDetailsAndCreatePAR(tokenId, orgId, providerType, accessType, objectName, traceId, flag, cb) {         
    ProviderClient.getProviderDetailsByOrgId(tokenId, orgId, providerType, traceId, function (err, content) {
                if (err) {
                    var errorResponse=JSON.parse(err.error);
                    if(flag==1 && errorResponse.statusCode == 403){
                        getAuthorizationToken(orgId,traceId)
                        .then(function(data){
                            var newToken= data;
                            flag = 0;
                            getProviderDetailsAndCreatePAR(newToken, orgId, providerType, accessType, objectName,traceId, flag, cb);
                        }).catch(function(err){
                            log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
                            sendErrorResponse("Cannot get authorization token for sysgain", 404, "Auth-0ClientError", cb);
                        });
                    }else{
                        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
                        sendErrorResponse(content, 404, "providerDetailsError", cb);
                    }
                    
                } else {
                    if (content.length > 0) {
                        content = content.filter(function (o) {
                            return (o.provider_details.providerType === providerType);
                        });
                        ProviderRouterClient.createPreAuthorizedRequest(content[0], accessType, objectName, traceId, function (err, result) {
                            if (err) { 
                                log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
                                sendErrorResponse("Provider Id specified does not exist.", 404, "errorCreationPARRequest", cb); 
                            }
                            else
                            { result["oracleBasePath"] = "https://objectstorage.us-phoenix-1.oraclecloud.com"; }
                            cb(null, result);
                        });
                    } else {
                        sendErrorResponse("Provider Id specified does not exist.", 404, "errorProviderDoesNotExists", cb);
                    }
                }
            });
}

function sendErrorResponse(message, statusCode, errorCode, cb) {
    //console.log(message);
    log.info(message);
    var response = {
        message: message,
        statusCode: statusCode,
        errorCode: errorCode
    }
    cb(null, response);
}

function getAuthorizationToken(orgId,traceId){
    return new Promise(function(resolve,reject){
        let token;
        AuthClient.getAuthToken(orgId,traceId)
            .then(function (data) {
                token= data.replace(/["']/g, "");
                fs.writeFileSync('./api/domain/uploadToken.txt', token);
                resolve(token); 
            }).catch(function(err){
                log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
                reject(err);
            });
    });
    
}
module.exports = uploads;
