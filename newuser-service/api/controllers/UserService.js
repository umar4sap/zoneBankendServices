'use strict';

var url = require('url');
var User = require('../domain/User'),
    Logger = require('bunyan');

var log = new Logger.createLogger({ 
    name: 'veegam-trials-auth0-client', 
    serializers: { req: Logger.stdSerializers.req } 
});

module.exports.createUser = function createUser (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.createUser(req.swagger.params, res, next, traceId);
};

module.exports.getAllPendingUsers = function getAllPendingUsers (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.getAllPendingUsers(req.swagger.params, res, next, traceId);
};

module.exports.searchUserByUserEmail = function searchUserByUserEmail (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.searchUserByUserEmail(req.swagger.params, res, next, traceId);
};

module.exports.searchUserByUsername = function searchUserByUsername (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.searchUserByUsername(req.swagger.params, res, next, traceId);
};

module.exports.updateUserStatus = function updateUserStatus (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.updateUserStatus(req.swagger.params, res, next, traceId);
};

module.exports.getUserToken = function getUserToken (req, res, next) {
  log.info("in controller ");
  var traceId = req.headers[process.env.TRACE_VARIABLE];
  User.getUserToken(req.swagger.params, res, next, traceId);
};

