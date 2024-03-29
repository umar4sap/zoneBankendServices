'use strict';

//LIBS
var SwaggerRestify = require('swagger-restify-mw'),
    restify = require('restify'),
    jwt = require('restify-jwt'),
    Logger = require('bunyan'),
    fs = require('fs'),
    _ = require('lodash'),
    log = new Logger.createLogger({ 
      name: 'project-service', 
      serializers: { req: Logger.stdSerializers.req } 
    });
    
  const dotenv = require('dotenv');
//GLOBALS
var app = restify.createServer({ log: log });
var publicKey = fs.readFileSync(__dirname+'/config/sysgain.pem');

dotenv.load();
var port = process.env.PORT || 7071;
var jwt = jwt({
    secret: publicKey,
    //secret: new Buffer(config.auth0.secret, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID,
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
app.opts(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});
app.use(restify.queryParser());
app.use(restify.bodyParser());
app.use(jwt);
app.pre(function (req, res, next) { 
  req.log.info({ req: req }, 'REQUEST'); 
  next(); 
});
app.listen(port);

//swagger config
var config = {
  appRoot: __dirname,
  swaggerSecurityHandlers: {
    UserSecurity: function (req, authOrSecDef, scopesOrApiKey, cb) {
      jwt(req, req.res, function(err) {
        if (req.user == undefined) {
          return cb(new Error('access denied - user does not exist in auth0'));
        }
        else {
          var user = req.user.sub.split("|");
          req.userInfo = user;
          
          if(validateOrganization(req)) {
              return cb(null);  
          }else{
            return cb(new Error('Access denied - User does not have access to this organization'));
          }
        }
      });
    }
  }
};

function validateOrganization(req) {
  var orgs = [];
  orgs = req.user["https://sysgain.newgen.com/app_metadata"].permissions.orgs;
  var data = {};
  _.each(orgs, function (item) {
    if (_.isEmpty(data)) {
      data = _.find(item, function (o) {
        return Object.keys(item)[0] === req.swagger.params.orgId.value;
      });
    }
  });
  return data;
}

SwaggerRestify.create(config, function(err, swaggerRestify) {
  if (err) { throw err; }
  swaggerRestify.register(app);
  if (swaggerRestify.runner.swagger.paths['/swagger']) {
    console.log('try this:\ncurl http://127.0.0.1:%d/v2/components/storage-service/swagger', port);
  }
});

module.exports = app; // for testing
