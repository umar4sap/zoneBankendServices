var auth0 = require("auth0-js");
var Logger = require('bunyan');

var log = new Logger.createLogger({ 
    name: 'veegam-trials-auth0-client', 
    serializers: { req: Logger.stdSerializers.req } 
});

const env = {
    AUTH0_UI_CLIENT_ID: process.env.AUTH0_UI_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_ZONE_USERID: process.env.AUTH0_ZONE_USERID,
    AUTH0_ZONE_PASSWORD: process.env.AUTH0_ZONE_PASSWORD,
    AUTH0_REALM: process.env.AUTH0_CLIENT_REALM_DB
};

//setup webauth to use auth0 api
var webAuth = new auth0.WebAuth({
    domain: env.AUTH0_DOMAIN,
    clientID: env.AUTH0_UI_CLIENT_ID,
    responseType: 'code'
    //audience:'https://dhruvnewgen.auth0.com/userinfo'
});

var userToken = module.exports = {
    getToken: function (traceId, clientCallback) {
        webAuth.client.login({
            realm: env.AUTH0_REALM,
            username: env.AUTH0_ZONE_USERID,
            password: env.AUTH0_ZONE_PASSWORD,
            scope: "openid user_metadata app_metadata email"
        }, function (err, authResult) {
            // Auth tokens in the result or an error
            if (err) {
                log.error('Trace Id:' + traceId + ' Error: ' + err);
                clientCallback(err);
            }
            else {
                userDetails = authResult;
                clientCallback(null, userDetails);
            }
        });        
    }
}

