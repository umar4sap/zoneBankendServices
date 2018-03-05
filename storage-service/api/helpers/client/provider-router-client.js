'use strict';
var Logger = require('bunyan');
const request = require('request-promise');
const provider_router_service = process.env.PROVIDER_ROUTER_SERVICE_ENDPOINT;
const provider_router_basepath = '/v2/components/provider-router-service';

var log = new Logger.createLogger({
    name: 'upload-service',
    serializers: { req: Logger.stdSerializers.req }
});

var createPreAuthorizedRequest = function (providerData, accessType, objectName, traceId, cb) {
    var uri = provider_router_service + provider_router_basepath + "/CreatePreAuthorizedRequest";
    var postData =
    {
        "tenantId" : providerData.provider_details.tenancy_OCID ,
        "compartmentId" : providerData.provider_details.compartment_OCID,
        "userId" : providerData.provider_details.user_OCID,
        "fingerprint" : providerData.provider_details.fingerprint,
        "privateKey" : providerData.provider_details.private_Key_Path,
        "request" : {
            "name": objectName,
            "accessType": accessType
        }
    };
    request(
        {
            method: 'POST',
            uri: uri,
            body: {
                data: JSON.stringify(postData)
            },
            json: true,
            headers: {
                accept: 'application/json',
                'trace-id':traceId
            },
            resolveWithFullResponse: true
        }
    ).then((data) => {
        log.info("TraceId : %s, Data : %s", traceId , data.body);
        cb(null, data.body);
    }).catch((err) => {
        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
        cb(err, "Provider-router-client:Unable to connect to oracle object storage");
    });
}
module.exports = {
    createPreAuthorizedRequest: createPreAuthorizedRequest
}
