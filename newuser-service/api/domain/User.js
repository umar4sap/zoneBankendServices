'use strict';

var BearerToken = require('../helpers/bearerToken.js');
var ManagementClient = require('auth0').ManagementClient;
var userToken = require('../helpers/userToken');
var Logger = require('bunyan');

var log = new Logger.createLogger({ 
    name: 'veegam-trials-auth0-client', 
    serializers: { req: Logger.stdSerializers.req } 
});
exports.createUser = function (args, res, next, traceId) {
  /**
   * Creates a user in Auth0 as a part of publisher onboarding
   * 
   *
   * body Body Publisher details that need to be added to the system. (optional)
   * returns Object
   **/
  BearerToken.getToken(traceId, function (users) {

    var management = new ManagementClient({
      token: BearerToken.token,
      domain: process.env.AUTH0_DOMAIN
    });
    
    management.createUser(args.body.value)
      .then(function (user) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
        res.end();
      })
      .catch(function (err) {
        log.error('Trace Id:' + traceId + ' Error: ' + err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = err.statusCode;
        res.end(JSON.stringify(err));
        res.end();
      });
  });
}

exports.getUserToken = function (args, res, next, traceId) {
  userToken.getToken(traceId, function (error, content) {
    if (error) {
      log.error('Trace Id:' + traceId + ' Error: ' + error);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = error.statusCode;
      res.end(JSON.stringify(error));
      res.end();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(content.idToken));
      res.end();
    }
  });
}

exports.getAllPendingUsers = function (args, res, next, traceId) {
  /**
   * returns all the users with a status pending
   * returns all the users with a status pending
   *
   * returns List
   **/  
  BearerToken.getToken(traceId, function (users) {

    var management = new ManagementClient({
      token: BearerToken.token,
      domain: process.env.AUTH0_DOMAIN
    });

    var query = {}
    query.q = "user_metadata.status:\"" + args.userstatus.value + "\"" + " AND " + "identities.connection:\"" + process.env.AUTH0_CLIENT_REALM_DB +"\"";
    management.getUsers(query)
      .then(function (users) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(users));
        res.end();
      })
      .catch(function (err) {
        log.error('Trace Id:' + traceId + ' Error: ' + err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = err.statusCode;
        res.end(JSON.stringify(err));
        res.end();
      });
  });
}

exports.searchUserByUserEmail = function (args, res, next, traceId) {
  /**
   * Checks for an existing user with the same email
   * Checks for an existing user with the same email
   *
   * userEmail String email of user that has to be checked
   * returns Boolean
   **/

  BearerToken.getToken(traceId, function (users) {

    var management = new ManagementClient({
      token: BearerToken.token,
      domain: process.env.AUTH0_DOMAIN
    });
    log.info("BearerToken.token", BearerToken.token);
    var query = {}
    query.q = "email:\"" + args.useremail.value + "\""  + " AND " + "identities.connection:\"" + process.env.AUTH0_CLIENT_REALM_DB +"\"";
    log.info("args.useremail.value", args.useremail.value);
    log.info("process.env.AUTH0_CLIENT_REALM_DB",process.env.AUTH0_CLIENT_REALM_DB)
    management.getUsers(query)
      .then(function (user) {
        log.info("user",user);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
        res.end();
      })
      .catch(function (err) {
        log.error('Trace Id:' + traceId + ' Error: ' + err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = err.statusCode;
        res.end(JSON.stringify(err));
        res.end();
      });
  });
}

exports.searchUserByUsername = function (args, res, next, traceId) {
  /**
   * Checks for an existing user with the same username
   * Checks for an existing user with the same username
   *
   * username String username of user that has to be checked
   * returns Boolean
   **/
  BearerToken.getToken(traceId, function (users) {

    var management = new ManagementClient({
      token: BearerToken.token,
      domain: process.env.AUTH0_DOMAIN
    });

    var query = {}
    query.q = "app_metadata.username:\"" + args.username.value + "\""  + " AND " + "identities.connection:\"" + process.env.AUTH0_CLIENT_REALM_DB +"\"";
    management.getUsers(query)
      .then(function (user) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(user));
        res.end();
      })
      .catch(function (err) {
        log.error('Trace Id:' + traceId + ' Error: ' + err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = err.statusCode;
        res.end(JSON.stringify(err));
        res.end();
      });
  });
}

exports.updateUserStatus = function (args, res, next, traceId) {
  /**
   * updating a user status to blocked/ unblocked
   * updating a user status to blocked/ unblocked
   *
   * body Body_1  (optional)
   * returns Object
   **/

  BearerToken.getToken(traceId, function (users) {

    var management = new ManagementClient({
      token: BearerToken.token,
      domain: process.env.AUTH0_DOMAIN
    });

    var query = {}
    query.q = "email:\"" + args.body.value.email + "\""  + " AND " + "identities.connection:\"" + process.env.AUTH0_CLIENT_REALM_DB +"\"";

    management.getUsers(query)
      .then(function (user) {
        if (user.length > 0) {
          var userId = user[0].user_id;
          var updateDataValue = args.body.value.updateData;
          var updateDataObj = {};
          updateDataObj.id = userId;
          management.updateUser(updateDataObj, updateDataValue)
            .then(function (user) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(user));
              res.end();
            })
            .catch(function (err) {
              log.error('Trace Id:' + traceId + ' Error: ' + err);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err));
              res.end();
            });
        } else {
          var response = {
            "message": "No users found",
            "statusCode": 404,
            "errorCode": "auth0-service_1" 
          }
          res.end(response);
        }
      })
      .catch(function (err) {
        log.error('Trace Id:' + traceId + ' Error: ' + err);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = err.statusCode;
        res.end(JSON.stringify(err));
        res.end();
      });
  });
}
