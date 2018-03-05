'use strict';
var Logger = require('bunyan');
const request = require('request-promise');
const provider_service = process.env.PROVIDER_SERVICE_ENDPOINT;
const provider_service_basepath = '/v2/components/provider-service';

var log = new Logger.createLogger({
    name: 'upload-service',
    serializers: { req: Logger.stdSerializers.req }
});

var getProviderDetailsByOrgId = function (tokenId, orgId, provider_id,traceId, cb) {
    var uri = provider_service + provider_service_basepath + "/org/" + orgId + "/provider";
    request(
        {
            method: 'GET',
            uri: uri,
            headers: {
                'Authorization': tokenId,
                'trace-id':traceId
            }
        }
    ).then((data) => {
        cb(null, JSON.parse(data));
    }).catch((err) => {
        log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
        cb(err, "Provider-client:Unable to fetch Provider Details. Please try again later.");
    });
}
module.exports = {
    getProviderDetailsByOrgId: getProviderDetailsByOrgId
}
