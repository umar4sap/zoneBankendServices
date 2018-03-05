'use strict';

var Upload = require('../domain/upload'),
    Logger = require('bunyan');

var log = new Logger.createLogger({ 
    name: 'training-storage-service', 
    serializers: { req: Logger.stdSerializers.req } 
});

module.exports = {
    createPAR : createPAR
};

function createPAR(req, res) {
    var token = req.headers.authorization;
    var providerType = req.swagger.params.providerType.value;
    var accessType = req.swagger.params.accessType.value;
    var objectName = req.swagger.params.objectName.value;
    var traceId = req.headers[process.env.TRACE_VARIABLE];
    (new Upload()).createPAR(token,providerType,accessType,objectName,traceId,
        function(err, content) {
            if(err) {
                 res.json(err);
                 log.error("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
            }
            else res.json(content);
    }); 
}