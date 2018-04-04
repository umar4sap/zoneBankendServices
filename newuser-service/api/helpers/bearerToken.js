var request = require("request");
var Logger = require('bunyan');

var log = new Logger.createLogger({ 
    name: 'veegam-trials-auth0-client', 
    serializers: { req: Logger.stdSerializers.req } 
});

const env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET
};

var bearerToken = module.exports = {
    token: "",
    getToken: function(traceId, clientCallback) {
        console.log("env"+JSON.stringify(env))
        var options = { method: 'POST',
        url: 'https://' + env.AUTH0_DOMAIN + '/oauth/token',
        headers: { 'content-type': 'application/json' },
        body: 
        { grant_type: 'client_credentials',
            client_id: env.AUTH0_CLIENT_ID,
            client_secret: env.AUTH0_CLIENT_SECRET,
            audience: 'https://' + env.AUTH0_DOMAIN + '/api/v2/' },
        json: true };

        request(options, function (error, response, body) {
        if (error){
            
             log.error('Trace Id:' + traceId + ' Error: ' + err);
             throw new Error(error);
        }
        console.log(JSON.stringify(response,error))
        bearerToken.token = body.access_token;
        
        clientCallback();
        });
    }
}