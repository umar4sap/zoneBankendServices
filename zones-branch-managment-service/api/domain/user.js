'use strict';

var dbServe = require('../../api/helpers/dbServe.js');
var config = require('../../config/config.js');
var request = require("request");
var _ = require("underscore");

module.exports = {
  check_if_exist: check_if_exist,
  validate: validate,
  getManagerAccessToken: getManagerAccessToken,
  getCurrentMetaData: getCurrentMetaData,
  getCurrentMetaDatabyEmail: getCurrentMetaDatabyEmail,
  getCurrentCompleteMetaData: getCurrentCompleteMetaData,
  addOwnershipTo_metadata: addOwnershipTo_metadata,
  check_user_privilage: check_user_privilage,
  deleteLogic: deleteLogic,
  getOwnershipanizations: getOwnershipanizations,
  addbranchTo_metadata: addbranchTo_metadata,
  addMemberTobranch: addMemberTobranch,
  removebranchFrom_metadata: removebranchFrom_metadata,
  getbranchUsers: getbranchUsers,
  getAllOwnershipCreatedbranchs: getAllOwnershipCreatedbranchs,
  removebranchFromUsersMetadata: removebranchFromUsersMetadata,
  updatebranchInUsersMetadata: updatebranchInUsersMetadata
}


function check_if_exist(ownershipName) {
  return new Promise(function (resolve, reject) {
    dbServe.getbyname(ownershipName, function (err, checks) {
      if (checks.length == 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    })
  })
}

//to validate ownershipName
function validate(key) {
  return new Promise(function (resolve, reject) {
    var alphaNumericAllowed = /^[a-z0-9]+$/;
    if (alphaNumericAllowed.test(key)) {
      resolve("validate");
    } else {
      resolve(key + " is not valid");
    }
  })
}

function getManagerAccessToken() {
  return new Promise(function (resolve, reject) {
    var auth0ManageData = {
      "client_id": config.auth0.manageClientID,
      "client_secret": config.auth0.manageSecret,
      "grant_type": "client_credentials",
      "audience": "https://" + config.auth0.domain + ".auth0.com/api/v2/"
    }
    auth0ManageData = JSON.stringify(auth0ManageData);
    var options = {
      method: "POST",
      url: "https://" + config.auth0.domain + ".auth0.com/oauth/token",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: auth0ManageData
    };
    request(options, function (err, res, body) {
      if (err || res.statusCode == 401) {
        reject({ err: err, message: res.body })
      }
      if (body.access_token) {
        var datajson = body;
      } else {
        var datajson = JSON.parse(body);
      }
      var managerAccessToken = datajson.access_token
      resolve(managerAccessToken);
    })
  });
};

//get getCurrentMetaData
function getCurrentMetaData(Auth0ManageToken, userid) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + ".auth0.com/api/v2/users/" + userid,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken
      }
    };
    request(options, function (err, res, body) {

      var data = JSON.parse(body);
      resolve(data.app_metadata);
    })
  })
};

//get getCurrentMetaData
function getCurrentCompleteMetaData(Auth0ManageToken, userid) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + ".auth0.com/api/v2/users/" + userid,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken
      }
    };
    request(options, function (err, res, body) {

      var data = JSON.parse(body);
      resolve(data);
    })
  })
};

//get getCurrentMetaData from users by user email metadata object logic
function getCurrentMetaDatabyEmail(Auth0ManageToken, email) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + '.auth0.com/api/v2/users?q="' + email + '"',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken
      }
    };
    request(options, function (err, res, body) {
      if (err || res.statusCode == 401) {
        reject({ err: err, message: res.body })
      } else {
        if (body == "[]") {
          reject("User Does not exist in Auth0")
        } else {
          var data = JSON.parse(body);
          resolve(data[0]);
        }
        // for (let i = 0; i < data.length; i++) {
        //   if (data[i].identities[0].provider == "github") {
        //     resolve(data[i]);
        //   }
        // }
      }
    });
  });
};

function addOwnershipTo_metadata(Auth0ManageToken, userid, currentMetaData, ownershipInfo) {
  var currentPermissionsOwnerships;
  return new Promise(function (resolve, reject) {
    
     currentPermissionsOwnerships = currentMetaData.permissions.ownerships
    var ownership_info = {
      [ownershipInfo.ownershipName]: {
        "branchs": [{
          "branch": "owners",
          "role": "admin",
          "subscriptions":[{
            "planName":"freeZoneListing",
            "expireAt":"21 june 2018"
          },{
            "planName":"zoneStudio",
            "expireAt":"20 may 2018"
          }]
        }]
      }
    }
    currentPermissionsOwnerships.push(ownership_info);
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

function check_user_privilage(ownershipName, app_metadata) {
  var isAdmin = false;
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = app_metadata.permissions.ownerships
    _.each(currentPermissionsOwnerships, function (ownership) {
      if (ownership.hasOwnProperty(ownershipName)) {
        _.each(ownership[ownershipName].branchs, function (branch) {
          if (branch.branch == "owners") {
            console.log("branch:" + branch)
            isAdmin = true;
            resolve(branch.role);
          }
        })
      }
    })
    if (isAdmin == false) {
      resolve("Read access only");
    }
  })
}

function deleteLogic(Auth0ManageToken, userid, currentMetaData, ownershipName) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = currentMetaData.permissions
    for (var i = 0; i < currentPermissionsOwnerships.ownerships.length; i++) {
      if (currentPermissionsOwnerships.ownerships[i][ownershipName]) {
        currentMetaData.permissions.ownerships.splice(i, 1);
      }
    }
    currentMetaData.permissions.ownerships = currentPermissionsOwnerships.ownerships;
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
      if (err || res.statusCode == 401) {
        console.log(err)
        reject({ err: err, message: res.body });
      }
      resolve(body);
    })
  })
};


function getOwnershipanizations(AuthUserId, defaultOwnership) {
  return new Promise(function (resolve, reject) {
    dbServe.getbyAuthUserId(AuthUserId, function (err, res) {
      if (err) {
        reject(err);
      } else {
        if (res.length > 0) {
          let ownerships = [];
          _.each(res, function (ownership) {
            if (ownership.ownershipName != defaultOwnership) {
              ownerships.push({ ownershipName: ownership.ownershipName, ownershipDescription: ownership.ownershipDescription });
            }
            resolve(ownerships);
          })
        }
        else resolve(res)
      }
    });
  })
}

//add branch info to users metadata logic and lets add users to branch 
function addbranchTo_metadata(Auth0ManageToken, userid, currentMetaData, branchInfo) {
  let role;
  if (branchInfo.branchName == "owners") {
    role = "admin";
  }else{
    role = "manager"
  }
  var currentPermissionsOwnerships
  return new Promise(function (resolve, reject) {
    dbServe.checkbranchExist(branchInfo, function (status) {
      if (status || branchInfo.branchName == "owners") {
        currentPermissionsOwnerships = currentMetaData.permissions.ownerships
        var ownershipavailbale = false;
        var branchstatus = false;
        _.each(currentPermissionsOwnerships, function (ownership, key) {
          if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
            ownershipavailbale = true
            _.each(ownership[branchInfo.ownershipId].branchs, function (branch, key1) {
              if (branch.branch == branchInfo.branchName) {
                branchstatus = true;
                console.log("branch:" + branch)
                resolve("already exists");
              }
            });
            if (branchstatus == false) {
              currentPermissionsOwnerships[key][branchInfo.ownershipId].branchs.push({ "branch": branchInfo.branchName, "role": role });
            }
          }
        });
        if (ownershipavailbale == false) {
          var ownershipCreateAndbranchPush =
            {
              [branchInfo.ownershipId]: {
                "branchs": [{
                  "branch": branchInfo.branchName,
                  "role": role
                  //"branchDescription": branchInfo.branchDescription
                }]
              }
            }
          currentPermissionsOwnerships.push(ownershipCreateAndbranchPush);
        }
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
      } else { reject("branch does not exist"); }
    });
  });
};

function removebranchFrom_metadata(Auth0ManageToken, userid, currentMetaData, branchInfo) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = currentMetaData.permissions.ownerships
    var ownershipavailbale = false;
    var branchstatus = false;
    var removeOwnership = true;
    _.each(currentPermissionsOwnerships, function (ownership, key) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        ownershipavailbale = true;
        let removeIndex = -1;
        _.each(ownership[branchInfo.ownershipId].branchs, function (branch, key1) {
          if (branch.branch == branchInfo.branchName) {
            removeIndex = ownership[branchInfo.ownershipId].branchs.map(function (item) { return item.branch; }).indexOf(branch.branch);
          }
          else { removeOwnership = false; }
        });
        if (removeIndex >= 0) { ownership[branchInfo.ownershipId].branchs.splice(removeIndex, 1); }
        if (removeOwnership) {
          currentPermissionsOwnerships = currentPermissionsOwnerships.filter(function (obj) {
            return !obj.hasOwnProperty(branchInfo.ownershipId);
          });
        }
      }
    });
    if (ownershipavailbale) {
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
        resolve({ message: 'success' });
      })
    }
    else { reject('ownershipanization/branch does not exist'); }
  })
};

function addMemberTobranch(userId, emailId, name, branchInfo) {
  return new Promise(function (resolve, reject) {
    dbServe.addMemberTobranch(userId, emailId, name, branchInfo, function (err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

function getbranchUsers(Auth0ManageToken, branchInfo) {
  var searchEngine="v3"
  return new Promise(function (resolve, reject) {
    var options = {
      method: "GET",
      url: "https://" + config.auth0.domain + '.auth0.com/api/v2/users?q=app_metadata.permissions.ownerships.' + branchInfo.ownershipId + '.branchs.branch:"' + branchInfo.branchName + '"&search_engine=' + searchEngine,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'bearer ' + Auth0ManageToken
      }
    };

    request(options, function (err, res, body) {
      if (err || res.statusCode == 401) {
        reject({ err: err, message: res.body })
      } else {
        if (body == "[]") {
          resolve([]);
        } else {
          resolve(JSON.parse(body));
        }
      }
    });
  });
}

function getAllOwnershipCreatedbranchs(ownershipId) {
  return new Promise(function (resolve, reject) {
    dbServe.getAllbranchsForOwnership(ownershipId, function (err, content) {
      if (err) { reject(err); }
      else { resolve(content); }
    })
  })
}

function removebranchFromUsersMetadata(Auth0ManageToken, branchInfo, cb) {
  Promise.all(branchInfo.users.map(function (user) {
    return new Promise(function (resolve, reject) {
      // getCurrentMetaDatabyEmail(Auth0ManageToken, user.email)
      //   .then(function (app_user) {
      removebranchFrom_metadata(Auth0ManageToken, user.user_id, user.app_metadata, branchInfo)
        .then(function (result) {
          resolve('success');
        }).catch(function (error) {
          reject(error);
        })
      // }).catch(function (error) {
      //   reject(error);
      // })
    })
  })).then(function (data) {
    cb(null, data);
  }).catch(function (err) {
    cb(err);
  })
}

function updatebranchInMetadata(Auth0ManageToken, userid, currentMetaData, existingName, branchInfo) {
  return new Promise(function (resolve, reject) {
    var currentPermissionsOwnerships = currentMetaData.permissions.ownerships
    var ownershipAvailable = false;
    var branchstatus = false;
    _.each(currentPermissionsOwnerships, function (ownership, key) {
      if (ownership.hasOwnProperty(branchInfo.ownershipId)) {
        ownershipAvailable = true;
        _.each(ownership[branchInfo.ownershipId].branchs, function (branch) {
          if (branch.branch == existingName) {
            branchstatus = true;
            branch.branch = branchInfo.branchName;
          }
        });
      }
    });
    if (ownershipAvailable && branchstatus) {
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
        resolve({ message: 'success' });
      })
    }
    else { reject('ownershipanization/branch does not exist'); }
  })
};

function updatebranchInUsersMetadata(Auth0ManageToken, existingName, branchInfo, cb) {
  Promise.all(branchInfo.users.map(function (user) {
    return new Promise(function (resolve, reject) {
      getCurrentMetaDatabyEmail(Auth0ManageToken, user.email)
        .then(function (app_user) {
          updatebranchInMetadata(Auth0ManageToken, app_user.user_id, app_user.app_metadata, existingName, branchInfo)
            .then(function (res1) {
              resolve('success');
            }).catch(function (error) {
              reject(error);
            })
        }).catch(function (error) {
          reject(error);
        })
    });
  })).then(function (data) {
    cb(null, data);
  }).catch(function (err) {
    cb(err);
  });
}