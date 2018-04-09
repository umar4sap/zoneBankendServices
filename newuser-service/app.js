'use strict';
const dotenv = require('dotenv');
dotenv.load();
//LIBS
var SwaggerRestify = require('swagger-restify-mw'),
    restify = require('restify'),
    jwt = require('restify-jwt'),
    cors = require('cors'),
   
   
    fs = require('fs'),
    _ = require('lodash');
   


//GLOBALS
var app = restify.createServer();
//var publicKey = fs.readFileSync(__dirname + '/config/sysgain.pem');


var port = "9009";
var jwt = jwt({
    //secret: publicKey,
    secret: "-QZB4_uxwVfzgDieFPdzt_ItmN74bplBHYLeE-v049nakX1ada3N2xziJeOMNthF",
    audience: "cO02S01qm4vmAp2jhUtuLI4iAfQgXNx4",//process.env.AUTH0_CLIENT_ID,
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization) {
            return req.headers.authorization.split(' ').reverse()[0];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
});

//app configs
app.use(restify.CORS());
app.use(cors());
app.use(restify.queryParser());
app.use(restify.bodyParser());
app.use(jwt);

app.listen(port);

//swagger config
var config = {
    appRoot: __dirname,
    swaggerSecurityHandlers: {
        UserSecurity: function(req, authOrSecDef, scopesOrApiKey, cb) {
            console.log(req.user)
            jwt(req, req.res, function(err) {
                if (req.user == undefined) {
                    return cb(new Error('access denied - user does not exist in auth0'));
                } else {
                    var user = req.user.sub.split("|");
                    req.userInfo = user;

                        return cb(null);
                    
                }
            });
        }
    }
};




SwaggerRestify.create(config, function(err, swaggerRestify) {
    if (err) { throw err; }
    swaggerRestify.register(app);
    if (swaggerRestify.runner.swagger.paths['/swagger']) {
        console.log('try this:\ncurl http://localhost:9009/v2/components/newuser-service', port);
    }
});

module.exports = app; // for testing