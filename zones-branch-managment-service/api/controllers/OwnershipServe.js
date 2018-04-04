'use strict';

var util = require('util');
var request = require("request");
var https = require('https');
var config = require('../../config/config.js');
var dbServe = require('../../api/helpers/dbServe.js');
var _ = require("underscore");
var user = require('../domain/user');

module.exports = {
  check_name: check_name,
  createOwnership: createOwnership,
  updateOwnership: updateOwnership,
  readOwnership: readOwnership,
  deleteOwnership: deleteOwnership,
  AddUserToOwnership: AddUserToOwnership,
  getOwnershipanizations: getOwnershipanizations
};

function check_name(req, res) {
  var ownershipName = req.swagger.params.ownershipName.value;
  ownershipName = ownershipName.toLowerCase();
  user.check_if_exist(ownershipName)
    .then(
    function (checks) {
      if(checks==false){
        res.json(200,  {"message":false} );
      } else {
        res.json(200,   {"message":"Ownership already exists.","statusCode":401,"errorCode":"ownership_uniqueownershipname"} );
      }
      
    })
}

function getOwnershipanizations(req, res) {
  let AuthUserId = req.user.sub;
  let defaultOwnership = req.user["https://lookatgym.zones.com/app_metadata"].username;
  user.getOwnershipanizations(AuthUserId, defaultOwnership)
    .then(function (data) {
      res.json(200, { ownerships: data });
    }).catch(function (err) {
      res.send(404, err);
    })
}

function createOwnership(req, res) {
  var ownershipInfo = {
    ownershipDescription: req.swagger.params.body.value.ownershipDescription,
    ownershipName: req.swagger.params.body.value.ownershipName,
    ownershipId: "ownerships" + Math.floor(Math.random() * 1000),
    createdBy: config.currentAuthUser
  }
  ownershipInfo.ownershipName = ownershipInfo.ownershipName.toLowerCase();
  user.validate(ownershipInfo.ownershipName)
    .then(function (validateMessage) {
      if (validateMessage == "validate") {
        console.log("validate :" + validateMessage);
        user.check_if_exist(ownershipInfo.ownershipName)
          .then(
          function (checks) {
            console.log("checked if exists :" + checks);
            if (checks == false) {
              user.getManagerAccessToken()
                .then(function (Auth0ManageToken) {
                  console.log("got the Auth0ManageToken :" + Auth0ManageToken);
                  user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
                    .then(function (app_metadata) {
                      console.log("got the getCurrentMetaData :" + app_metadata);
                      addNewOwnership(ownershipInfo)
                        .then(function (idInfo) {
                          console.log("added ownership indb :" + idInfo);
                          console.log(idInfo);
                          user.addOwnershipTo_metadata(Auth0ManageToken, config.currentAuthUser, app_metadata, ownershipInfo)
                            .then(function (body) {
                              console.log("added meta_data :" + body);
                              res.send(200, { message: "success" ,data: ownershipInfo.ownershipName});
                            })
                        }).catch(function (resmsg) {
                          res.send(400, { message: resmsg })
                        })
                    });
                }).catch(function (resmsg) {
                  res.send(400, { message: resmsg })
                });
            } else {
              res.send(400, { message: "ownership already exists" });
            }
          })
      } else {
        res.send(404, validateMessage)
      }
    })

  var addNewOwnership = function (ownershipInfo) {
    return new Promise(function (resolve, reject) {
      dbServe.saveOwnershipDetails(ownershipInfo.ownershipId, ownershipInfo.ownershipDescription, ownershipInfo.createdBy, ownershipInfo.ownershipName, function (id) {
        console.log("Hey I am added this " + ownershipInfo.ownershipName + " to ownershipanization table the generated key is" + id);
        resolve("ownership added successfully to the db and the key is " + id)
      });
    });
  }
}

//update ownershipanization function
function updateOwnership(req, res) {
  var ownershipInfo = {
    ownershipDescription: req.swagger.params.body.value.ownershipDescription,
    plan: req.swagger.params.body.value.plan,
    location: req.swagger.params.body.value.location,
    billingEmail: req.swagger.params.body.value.billingEmail,
    ownershipId: req.swagger.params.ownershipId.value,
    updateBy: config.currentAuthUser
  }
  dbServe.getbyId(ownershipInfo.ownershipId, function (data) {
    var ownershipName = data[0].ownershipName;
    user.getManagerAccessToken()
      .then(function (Auth0ManageToken) {
        console.log("I got the Auth0ManageToken to perform ownershipanization operations");
        user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
          .then(function (app_metadata) {
            console.log("got the getCurrentMetaData :" + app_metadata);
            user.check_user_privilage(ownershipName, app_metadata)
              .then(function (privilage_levels) {
                if (privilage_levels == "admin") {
                  updateOwnershipDetailsInDb(ownershipInfo)
                    .then(function (msg) {
                      console.log(msg)
                      res.send(200, { message: "success" ,data: ownershipInfo.ownershipId});
                    })
                } else {
                  res.send(500, "user does have permissions to update ownership")
                }
              }).catch(function (resmsg) {
                res.send(500, { message: resmsg })
              })

          });
      });
  });

  //update ownershipnization details in db
  var updateOwnershipDetailsInDb = function (ownershipInfo) {
    return new Promise(function (resolve, reject) {
      dbServe.updateOwnershipDetails(ownershipInfo.ownershipId, ownershipInfo.updateBy, ownershipInfo.billingEmail, ownershipInfo.plan, ownershipInfo.location,ownershipInfo.ownershipDescription, function (id) {
        console.log("Hey I am added this " + ownershipInfo.ownershipName + " to ownershipanization table the generated key is" + id);
        resolve("ownership added successfully to the db and the key is " + id)
      });
    });
  }
}

//get ownership details operation
function readOwnership(req, res) {
  var ownershipId = req.swagger.params.ownershipId.value;

  dbServe.getbyId(ownershipId, function (data) {
    if (data.length > 0) {
      var ownershipName = data[0].ownershipName;
      user.getManagerAccessToken()
        .then(function (Auth0ManageToken) {
          console.log("I got the Auth0ManageToken to perform ownershipanization operations");
          user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
            .then(function (app_metadata) {
              console.log("got the getCurrentMetaData ");
              user.check_user_privilage(ownershipName, app_metadata)
                .then(function (privilage_levels) {
                  if (privilage_levels == "admin") {
                    res.send(200, data[0])
                  }
                  else {
                    res.send(200, { ownershipName: data[0].ownershipName, myRole: privilage_levels })
                  }
                }).catch(function (resmsg) {
                  res.send(400, resmsg)
                })
            })
        }).catch(function (resmsg) {
          res.send(500, { message: resmsg })
        })
    } else {
      res.send(405, "ownership is not exists")
    }
  })
}

//delete ownership operation Id
function deleteOwnership(req, res) {
  var ownershipId = req.swagger.params.ownershipId.value;
  dbServe.getbyId(ownershipId, function (data) {
    if (data.length > 0) {
      var ownershipName = data[0].ownershipName;
      dbServe.deleteByid(ownershipId, function (data) {
        console.log("ownership is deleted from db")
        user.getManagerAccessToken()
          .then(function (Auth0ManageToken) {
            console.log("I got the Auth0ManageToken to perform ownershipanization operations");
            user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
              .then(function (app_metadata) {
                console.log("got the getCurrentMetaData :" + app_metadata);
                user.check_user_privilage(ownershipName, app_metadata)
                  .then(function (privilage_levels) {
                    if (privilage_levels == "admin") {
                      user.deleteLogic(Auth0ManageToken, config.currentAuthUser, app_metadata, ownershipName)
                        .then(function (data) {
                          res.send(200, { message: "ownership deleted successfully", profile: data })
                        }).catch(function (resmsg) {
                          res.send(400, { message: resmsg })
                        })
                    }
                    else {
                      res.send(300, { message: "you do not have permissions to delete ownership" })
                    }
                  })
              })
          }).catch(function (resmsg) {
            res.send(500, { message: resmsg })
          })
      })
    } else {
      res.send(400, { message: "This ownershipanization does not exist" })
    }
  })

}

function AddUserToOwnership(req, res) {
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);
  res.json(hello);
}