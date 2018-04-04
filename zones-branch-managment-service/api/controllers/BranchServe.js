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
  createbranch: createbranch,
  deletebranch: deletebranch,
  getbranchById: getbranchById,
  addMemberTobranch: addMemberTobranch,
  removeMemberFrombranch: removeMemberFrombranch,
  getbranchDetails: getbranchDetails,
  getAllbranchs: getAllbranchs,
  leavebranch: leavebranch,
  savebranchRoles: savebranchRoles,
  injectbranchRoles: injectbranchRoles,
  updatebranch: updatebranch
};

function check_name(req, res) {
  var branchName = req.swagger.params.branchName.value;
  check_if_exist_branch(branchName)
    .then(
    function (checks) {
      console.log("checked if exists :" + checks);
      if (checks == true) {
        res.send(203, branchName + "already exists")
      };
    });

};

//add member to branch
function addMemberTobranch(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchName: req.swagger.params.branchId.value,
    authuseremail: req.swagger.params.authuseremail.value
   
  };
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      console.log("I got the Auth0ManageToken to perform ownershipanization operations");
      user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_metadata) {
          user.check_user_privilage(branchInfo.ownershipId, app_metadata)
            .then(function (privilage_levels) {
              if (privilage_levels == "admin") {
                user.getCurrentMetaDatabyEmail(Auth0ManageToken, branchInfo.authuseremail)
                  .then(function (app_user) {
                    // user.addMemberTobranch(app_user.user_id, app_user.email, app_user.name, branchInfo)
                    //   .then(function (data) {
                    //     if (data.indexOf('exists') >= 0) {
                    //       res.send(203, data);
                    //     }
                    //     else {
                    //       res.send(200, data);
                    //     }
                    //   })
                    user.addbranchTo_metadata(Auth0ManageToken, app_user.user_id, app_user.app_metadata, branchInfo)
                      .then(function (body) {
                        console.log("added meta_data :" + body);
                        res.send(200, body)
                      }).catch(function (resmsg) {
                        res.send(400, { message: resmsg })
                      })
                  }).catch(function (resmsg) {
                    res.send(400, { message: resmsg })
                  })
              } else {
                res.send(203, "you do not have permissions")
              }
            }).catch(function (resmsg) {
              res.send(400, { message: resmsg })
            });
        });
    });

};

function removeMemberFrombranch(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchName: req.swagger.params.branchId.value,
    authuseremail: req.swagger.params.authuseremail.value
  };
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_metadata) {
          user.check_user_privilage(branchInfo.ownershipId, app_metadata)
            .then(function (privilage_levels) {
              if (privilage_levels == "admin") {
                user.getCurrentMetaDatabyEmail(Auth0ManageToken, branchInfo.authuseremail)
                  .then(function (app_user) {
                    user.removebranchFrom_metadata(Auth0ManageToken, app_user.user_id, app_user.app_metadata, branchInfo)
                      .then(function (body) {
                        res.send(200, body);
                      }).catch(function (resmsg) {
                        res.send(400, { message: resmsg })
                      })
                  }).catch(function (resmsg) {
                    res.send(400, { message: resmsg })
                  })
              } else {
                res.send(203, "Insufficient permissions - Access denied")
              }
            }).catch(function (resmsg) {
              res.send(400, { message: resmsg })
            });
        });
    });

};

//Get all the user for the branch
function getbranchDetails(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchName: req.swagger.params.branchId.value
  };
  let response = {};
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      user.getbranchUsers(Auth0ManageToken, branchInfo) 
        .then(function (usersList) {
          response.users = [];
          _.each(usersList, function (userObj) {
            response.users.push({ email: userObj.email, name: userObj.nickname })
          })
          user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
            .then(function (app_metadata) {
              user.check_user_privilage(branchInfo.ownershipId, app_metadata)
                .then(function (privilage_levels) {
                  dbServe.getbranchDetailsBybranchName(branchInfo, function (err, result) {
                    if (privilage_levels == "admin") {
                      response.privilage = "write";
                    } else {
                      response.privilage = "branch-level";
                    }
                    if (result) {
                      response.branchInfo = result;
                    }
                    res.send(200, response);
                  })
                }).catch(function (resmsg) {
                  res.send(400, { message: resmsg })
                });
            })
        })

      // // user.getbranchUsers(Auth0ManageToken, branchInfo)
      // //   .then(function (usersList) {
      // //     res.send(200, usersList)
      // //   }).catch(function (err) {
      // //     res.send(400, err);
      // //   })
      // getAllUsersFromAuth0GithubLogins(Auth0ManageToken)
      //   .then(function (authusers) {
      //     getbranchUsersLogic(authusers, branchInfo.ownershipId, branchInfo.branchName)
      //       .then(function (usersList) {
      //         console.log("users belongs to branch :" + usersList);
      //         res.send(200, usersList)
      //       }).catch(function (resmsg) {
      //         res.send(400, resmsg)
      //       })
      //   });
    });
};

// function getbranchUsers(req, res) {
//   var branchInfo = {
//     ownershipId: req.swagger.params.ownershipId.value,
//     branchName: req.swagger.params.branchId.value
//   };
//   user.getbranchUsers(branchInfo).then(function (data) {
//     res.send(200, data);
//   }).catch(function (resmsg) {
//     res.send(400, { message: resmsg })
//   })
// }


//Create branch operation Id
function createbranch(req, res) {

  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var branchInfo = {
    branchDescription: req.swagger.params.body.value.branchDescription,
    branchName: req.swagger.params.body.value.branchName,
    branchId: "zonebranch" + Math.floor(Math.random() * 10000),
    createdBy: config.currentAuthUser,
    ownershipId: req.swagger.params.ownershipId.value,
    role: "admin"
  }
  branchInfo.branchName = branchInfo.branchName.toLowerCase();
  if (branchInfo.branchName !== "owners") {
    user.validate(branchInfo.branchName)
      .then(function (validateMessage) {
        if (validateMessage == "validate") {
          console.log("validate :" + validateMessage);
          user.getManagerAccessToken()
            .then(function (Auth0ManageToken) {
              console.log("I got the Auth0ManageToken to perform ownershipanization operations");
              user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
                .then(function (app_metadata) {
                  user.check_user_privilage(branchInfo.ownershipId, app_metadata)
                    .then(function (privilage_levels) {
                      if (privilage_levels == "admin") {
                        check_if_exist_branch(Auth0ManageToken, config.currentAuthUser, app_metadata, branchInfo)
                          .then(
                          function (checks) {
                            console.log("checked if exists :" + checks);
                            if (checks == false) {
                              addNewbranch(branchInfo)
                                .then(function (checks) {
                                  if (checks == 'exists') {
                                    res.send(203, { message: "branch already exist" });
                                  } else {
                                    res.send(200, { message: "branch created" ,data:{"ownershipName":branchInfo.ownershipId,"branchName":branchInfo.branchName}});
                                  }
                                }).catch(function (resmsg) {
                                  res.send(400, { message: resmsg })
                                })
                            } else {
                              res.send(203, { message: "branch already exist" })
                            }
                          })
                      } else {
                        res.send(203, { message: "You do not have permissions to create new branch" })
                      }
                    }).catch(function (resmsg) {
                      res.send(400, { message: resmsg })
                    })
                })
            }).catch(function (resmsg) {
              res.send(400, { message: resmsg })
            })
        } else {
          res.send(500, validateMessage)
        }
      })

    var addNewbranch = function (branchInfo) {
      return new Promise(function (resolve, reject) {
        dbServe.savebranchForOwnership(branchInfo, function (err, content) {
          if (err) { reject(err); }
          else { resolve(content); }
        })
      })
    }
  }
  else {
    res.send(400, { message: "branch already exists" });
  }
}

//get branch operation ID
function getbranchById(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchId: req.swagger.params.branchId.value
  }
  dbServe.getbranchDetails(branchInfo, function (err, response) {
    if (err) {
      res.send(400, err);
    } else {
      res.send(200, response);
    }
  })
  // user.getManagerAccessToken()
  //   .then(function (Auth0ManageToken) {
  //     console.log("I got the Auth0ManageToken to perform ownershipanization operations");
  //     user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
  //       .then(function (app_metadata) {
  //         console.log("got the getCurrentMetaData :" + app_metadata);
  //         get_branch_by_id(branchInfo, app_metadata)
  //           .then(function (data) {
  //             res.send(200, data)
  //           }).catch(function (resmsg) {
  //             res.send(500, { message: resmsg })
  //           })
  //       })
  //   }).catch(function (resmsg) {
  //     res.send(500, { message: resmsg })
  //   })

}

function getAllbranchs(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
  }
  let branchs = [];
  let userbranchs = [];
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_metadata) {
          get_user_associated_branchs(branchInfo, app_metadata)
            .then(function (data) {
              branchs = data;
              user.check_user_privilage(branchInfo.ownershipId, app_metadata)
                .then(function (privilage_levels) {
                  if (privilage_levels == "admin") {
                    user.getAllOwnershipCreatedbranchs(branchInfo.ownershipId)
                      .then(function (ownershipbranchs) {
                        if (ownershipbranchs.message == 'success') {
                          userbranchs = branchs.slice(0);
                          _.each(branchs, function (associatedbranch) {
                            _.each(ownershipbranchs.data, function (ownedbranch) {
                              if (associatedbranch.branch == ownedbranch.branch) {
                                userbranchs.splice(_.indexOf(userbranchs, _.findWhere(userbranchs, { "branch": associatedbranch.branch })), 1);
                              }
                            })
                          });
                          userbranchs = userbranchs.concat(ownershipbranchs.data);
                        }
                        res.send(200, userbranchs);
                      });
                  } else {
                    res.send(200, branchs);
                  }
                });
            })
        })
    }).catch(function (resmsg) {
      res.send(400, { message: resmsg })
    })

}

// function getAllbranchs(req, res) {
//   let ownershipId = req.swagger.params.ownershipId.value;
//   user.getAllbranchs(ownershipId)
//     .then(function (data) {
//       if (data.indexOf('exists') >= 0) {
//         res.send(203, data);
//       } else {
//         res.send(200, data);
//       }
//     })
// }

//delete branch operation ID
function deletebranch(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchName: req.swagger.params.branchId.value
  }
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      console.log("got the Auth0ManageToken :" + Auth0ManageToken);
      user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_metadata) {
          console.log("I got the Auth0ManageToken to perform ownershipanization operations");
          user.check_user_privilage(branchInfo.ownershipId, app_metadata)
            .then(function (privilage_levels) {
              if (privilage_levels == "admin") {
                if (branchInfo.branchName !== "owners") {
                  user.getbranchUsers(Auth0ManageToken, branchInfo)
                    .then(function (authUsersList) {
                      branchInfo.users = authUsersList;
                      deletebranchFromDb(branchInfo)
                        .then(function (content) {
                          user.removebranchFromUsersMetadata(Auth0ManageToken, branchInfo, function (err, response) {
                            if (err) {
                              res.send(400, { message: 'Could not delete branch', error: err });
                            } else {
                              res.send(200, { message: 'branch deleted successfully' });
                            }
                          });
                        }).catch(function (resmsg) {
                          res.send(400, { message: resmsg })
                        });
                    }).catch(function (err) {
                      res.send(400, { error: err });
                    })
                } else {
                  res.send(400, { message: 'Could not delete owners branch' });
                }
              }
              else {
                res.send(200, { message: "Insufficient permissions - Access Denied" })
              }
            }).catch(function (resmsg) {
              res.send(400, { message: resmsg })
            });
        });
    }).catch(function (resmsg) {
      res.send(400, { message: resmsg })
    })

  var deletebranchFromDb = function (branchInfo) {
    return new Promise(function (resolve, reject) {
      dbServe.deletebranchForOwnership(branchInfo, function (err, content) {
        if (err) { reject(err); }
        else { resolve(content); }
      })
    })
  }
};

//get getCurrentMetaData for branch members to be added logic
var getAuth0UserId = function (Auth0ManageToken, username) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + ".auth0.com/api/v2/users/",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken

      }
    };
    request(options, function (err, res, body) {
      var data = JSON.parse(body);
      resolve(data);
      _.each(data, function (usersdata, key1) {
        if (usersdata.nickname == username) {
          resolve(user_id);
        }
      });
    });
  });
};

//get getCurrentMetaData for branch members to be added logic
var getAuth0UserId = function (Auth0ManageToken, username) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + ".auth0.com/api/v2/users/",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken

      }
    };
    request(options, function (err, res, body) {
      var data = JSON.parse(body);
      resolve(data);
      _.each(data, function (usersdata, key1) {
        if (usersdata.nickname == username) {
          resolve(user_id);
        }
      });
    });
  });
};

//check branch if exist
var check_if_exist_branch = function (Auth0ManageToken, userid, currentMetaData, branchInfo) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = currentMetaData.permissions.ownerships
    _.each(currentPermissionsOwnerships, function (ownership) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        _.each(ownership[branchInfo.ownershipId].branchs, function (branch) {
          if (branch.branch == branchInfo.branchName) {
            console.log("branch:" + branch)
            resolve("already exists");
          }
        })
        resolve(false);
      }
    })
  })
}

//Delete branch from users meta data logic
var deleteLogic = function (Auth0ManageToken, userid, currentMetaData, branchInfo) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = currentMetaData.permissions.ownerships
    _.each(currentPermissionsOwnerships, function (ownership, key) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        _.each(ownership[branchInfo.ownershipId].branchs, function (branch, key1) {
          if (branch) {
            if (branch.branch == branchInfo.branchId) {
              console.log("branch:" + branch)
              var branchs = currentPermissionsOwnerships[key][branchInfo.ownershipId].branchs;
              branchs.splice(key1);
              currentPermissionsOwnerships[key][branchInfo.ownershipId].branchs = branchs
            }
          }
        })
      }
    })
    currentMetaData.permissions.ownerships = currentPermissionsOwnerships;
    var updateMetaData = currentMetaData;
    var options = {
      method: "PATCH",
      url: "https://" + config.auth0.domain + ".auth0.com/api/v2/users/" + userid,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken

      },
      json: { app_metadata: updateMetaData }
    };
    request(options, function (err, res, body) {
      if (err) {
        console.log(err)
      }
      resolve(body);
    })
  })
};

//get branch by id logic
var get_branch_by_id = function (branchInfo, app_metadata) {
  var isbranch = false;
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = app_metadata.permissions.ownerships
    _.each(currentPermissionsOwnerships, function (ownership) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        _.each(ownership[branchInfo.ownershipId].branchs, function (branch) {
          if (branch) {

            if (branch.branch == branchInfo.branchId) {
              isbranch = true;
              console.log("branch:" + branch)
              resolve(branch);
            }
          }
        })

      }
    })
    if (isbranch == false) {
      reject("branch " + branchInfo.branchId + " not exist");
    }
  })
}

//All branchs logic
var get_user_associated_branchs = function (branchInfo, app_metadata) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = app_metadata.permissions
    _.each(currentPermissionsOwnerships, function (ownership) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        resolve(ownership[branchInfo.ownershipId].branchs);
      }

    })
  })
}

//logic for getting all users for the branch
var getbranchUsersLogic = function (authusers, lookingForOwnership, LookingForbranch) {
  var branchUsers = [];
  var LookingForbranch;
  var lookingForOwnership;
  var isOwnership = false;
  return new Promise(function (resolve, reject) {
    _.each(authusers, function (authuser) {
      if (authuser.hasOwnProperty("app_metadata")) {
        var currentPermissionsOwnerships = authuser.app_metadata.permissions.ownerships
        _.each(currentPermissionsOwnerships, function (ownership, key) {

          if (ownership.hasOwnProperty(lookingForOwnership)) {
            isOwnership = true;
            _.each(ownership[lookingForOwnership].branchs, function (branch, key1) {
              if (branch) {
                if (branch.branch == LookingForbranch) {
                  console.log("branch:" + branch)
                  branchUsers.push(authuser.nickname)
                }
              }
            })

            resolve(branchUsers);
          }
        })
      }
    })
    if (isOwnership == false) {
      reject("No users");
    }
  })
}

//get getCurrentMetaData from users by user email metadata object logic
var getAllUsersFromAuth0GithubLogins = function (Auth0ManageToken) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + '.auth0.com/api/v2/users?q="github"',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken
      }
    };
    request(options, function (err, res, body) {
      if (err) {
        console.log(err)
      } else {
        var data = JSON.parse(body);
        resolve(data);
      }
    });
  });
};

function leavebranch(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchName: req.swagger.params.branchName.value
  }
  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      console.log("got the Auth0ManageToken :" + Auth0ManageToken);
      user.getCurrentCompleteMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_user) {
          user.removebranchFrom_metadata(Auth0ManageToken, app_user.user_id, app_user.app_metadata, branchInfo)
            .then(function (body) {
              res.send(200, body);
            }).catch(function (resmsg) {
              res.send(400, { message: resmsg })
            })
        });
    }).catch(function (resmsg) {
      res.send(400, { message: resmsg })
    })
};

function savebranchRoles(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchId: req.swagger.params.branchId.value
  };
  var roles = req.swagger.params.body.value;
  dbServe.savebranchRoles(branchInfo, roles)
    .then(function (data) {
      res.send(200, {"message":data,"branch":branchInfo.branchId})
    }).catch(function (err) {
      res.send(400, err);
    })
}

function injectbranchRoles(req, res) {
  var permissions = req.swagger.params.body.value;
  dbServe.injectbranchRoles(permissions, function (err, result) {
    if (err) {
      res.send(400, err);;
    } else {
      res.send(200, result);
    }
  });
}

function updatebranch(req, res) {
  var branchInfo = {
    ownershipId: req.swagger.params.ownershipId.value,
    branchId: req.swagger.params.branchId.value,
    branchName: req.swagger.params.body.value.branchName,
    branchDescription: req.swagger.params.body.value.branchDescription,
    users: req.swagger.params.body.value.users
  };

  user.getManagerAccessToken()
    .then(function (Auth0ManageToken) {
      user.getCurrentMetaData(Auth0ManageToken, config.currentAuthUser)
        .then(function (app_metadata) {
          user.check_user_privilage(branchInfo.ownershipId, app_metadata)
            .then(function (privilage_levels) {
              if (privilage_levels == "admin") {
                updatebranchInfoInDb(branchInfo)
                  .then(function (branch_data) {
                    user.updatebranchInUsersMetadata(Auth0ManageToken, branch_data.existingbranchName, branchInfo, function (err, response) {
                      if (err) {
                        res.send(400, { message: "could not update branch", error: err })
                      } else {
                        res.send(200, { message: "branch updated successfully" })
                      }
                    });
                  }).catch(function (err) {
                    res.send(400, { message: "could not update branch", error: err })
                  })
              }
            })
        })
    })

  var updatebranchInfoInDb = function (branchInfo) {
    return new Promise(function (resolve, reject) {
      dbServe.updatebranchInfo(branchInfo, function (err, content) {
        if (err) { reject(err); }
        else { resolve(content); }
      })
    })
  }
}