/*
* Database System to manage ownership billing and plan info
* Author: Umar
* Version: 0.2
* Modules
*   => initDB - Kickstart DB & Table creation if not exist
*   => createDatabase  - Create DB based on name mentioned in config file
*   => createTable - Create table based on name mentioned in config file
*   => getbyname  - get ownerships by name and urls from db
*   => getAllOwnership: -  getAllOwnership
*   => saveOwnershipDetails  - Save arm details with name and resource group and updated status
*   => updateOwnershipDetails- To store the arm info which will be scheduled for the specific time
 */
var request = require('request');
var https = require('https');
var dbconfig = require('../../config/db');
var Logger = require('bunyan');
var _ = require('underscore');
var uuid = require('uuid-v4');
var Promise = require('promise');
var Q = require('q');
var log = new Logger.createLogger({
    name: 'user-management-service',
    serializers: { req: Logger.stdSerializers.req }
});

var rdb = require('rethinkdbdash')({
    pool: true,
    cursor: false,
    port: dbconfig.rethinkdb.port,
    host: dbconfig.rethinkdb.host,
    db: dbconfig.rethinkdb.db
});

module.exports = {
    initDB: initDB,
    saveOwnershipDetails: saveOwnershipDetails,
    getbyname: getbyname,
    updateOwnershipDetails: updateOwnershipDetails,
    getAllOwnership: getAllOwnership,
    getbyId: getbyId,
    deleteByid: deleteByid,
    getbyAuthUserId: getbyAuthUserId,
    savebranchForOwnership: savebranchForOwnership,
    deletebranchForOwnership: deletebranchForOwnership,
    addMemberTobranch: addMemberTobranch,
    getbranchUsers: getbranchUsers,
    getAllbranchsForOwnership: getAllbranchsForOwnership,
    checkbranchExist: checkbranchExist,
    savebranchRoles: savebranchRoles,
    injectbranchRoles: injectbranchRoles,
    getbranchDetails: getbranchDetails,
    getbranchDetailsBybranchName: getbranchDetailsBybranchName,
    updatebranchInfo: updatebranchInfo
};
//intitialization db
var connection;
function initDB() {
    rdb.connect(dbconfig.rethinkdb, function (err, conn) {
        if (err) {
            console.log('Could not open a connection to initialize the database: ' + err.message);
        }
        else {
            console.log('I am connected to Db.');
            connection = conn;
            createDatabase(conn, dbconfig.rethinkdb.db)
                .then(function () {
                    createTable(conn, "ownershipanizations", "id");
                })
                .catch(function (err) {
                    console.log('Error creating database and/or table: ' + err);
                });
        };
    });
};

function createDatabase(conn, databaseName) {
    return rdb.dbList().run(conn).then(function (list) {
        var dbFound = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == databaseName) {
                dbFound = true;
                break;
            }
        }
        if (!dbFound) {
            console.log('I am Creating database...');
            return rdb.dbCreate(databaseName).run(conn);
        }
        else {
            console.log('Yeah! Database exists.');
            return Promise.resolve({ dbs_exists: true });
        };
    });
};

//  get files,url and information from DB
/**
 * ownershipName: ownershipName
 */
function getbyId(ownershipId, cb) {
    rdb.db(dbconfig.rethinkdb.db).table('ownershipanizations').filter({ ownershipName: ownershipId }).run(connection, function (err, cursor) {
        if (err) {
            return cb(null);
        }else{
        
            return cb(JSON.parse(JSON.stringify(cursor, null, 2)));
        }
      
    });
};


function deleteByid(ownershipId, cb) {
    rdb.db(dbconfig.rethinkdb.db).table('ownershipanizations').filter({ ownershipName: ownershipId }).delete().run(connection, function (err, cursor) {
        if (err) {
            return cb(err, null);
        };

        return cb(null, "deleted");

    });
};

function getbyname(ownershipName, cb) {
    rdb.table('ownershipanizations').filter({ ownershipName: ownershipName }).run().then(function (result) {
        if (result.length > 0) {
            cb(null, result);
        } else {
            cb(null, result);
        }
    }).catch(function (err) {
        log.error(traceId, JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    });
};

function getAllOwnership(ownershipName, res) {
    rdb.db(dbconfig.rethinkdb.db).table('ownershipanizations').run(connection, function (err, cursor) {
        if (err) throw err;
        cursor.toArray(function (err, result) {
            if (err) throw err;
            res.send(200, JSON.parse(JSON.stringify(result, null, 2)));
        });
    });
};

function saveOwnershipDetails(ownershipId, ownershipDescription, createdBy, ownershipName, cb) {
    rdb.db(dbconfig.rethinkdb.db).table('ownershipanizations').insert({
        ownershipId: ownershipId,
        ownershipName: ownershipName,
        ownershipDescription: ownershipDescription,
        createdBy: createdBy,
        updateBy: createdBy,
        lastUpdated: new Date()
    }).run(connection, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log('saved arm informations in ci db');
            cb(result.generated_keys[0]);
        }
    });
};

function updateOwnershipDetails(ownershipId, updateBy, billingEmail, plan, location,description, cb) {
    rdb.db(dbconfig.rethinkdb.db).table('ownershipanizations').filter({ ownershipName: ownershipId }).update({
        updateBy: updateBy,
        lastUpdated: new Date(),
        billingEmail: billingEmail,
        plan: plan,
        location: location,
        ownershipDescription: description
    }).run(connection, function (err, result) {
        if (err) {
            console.log(err);
        };
        cb('saved ownership info in ci db');

    });
};

function createTable(conn, tableName, primaryKey) {
    return rdb.tableList().run(conn).then(function (list) {
        var tableFound = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == tableName) {
                tableFound = true;
                break;
            }
        }
        if (!tableFound) {
            console.log('I am Creating table ' + tableName + '..');
            return rdb.tableCreate(tableName, { primaryKey: primaryKey }).run(conn);
        }
        else {
            console.log('yeah! Table exists.');
            return Promise.resolve({ table_exists: true });
        };
    });
};

function getbyAuthUserId(AuthUserId, cb) {
    rdb.table('ownershipanizations').filter({ createdBy: AuthUserId }).run().then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    });
};

function savebranchForOwnership(branchInfo, cb) {
    var isbranchExist = false;
    let branchId = uuid();
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result.length > 0) {
            let branchs = result[0].branchs;
            if (branchs) {
                _.each(branchs, function (branchObj) {
                    if (branchObj.branch === branchInfo.branchName) {
                        isbranchExist = true;
                    }
                });
                if (isbranchExist) {
                    cb(null, 'exists');
                } else {
                    branchs.push({ branchId: branchId, branch: branchInfo.branchName, description: branchInfo.branchDescription });
                }
            } else {
                branchs = [{ branchId: branchId, branch: branchInfo.branchName, description: branchInfo.branchDescription }];
            }
            if (!isbranchExist) {
                rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).update({
                    branchs: branchs
                }).run(connection, function (err, result) {
                    if (err) {
                        console.log(err);
                    };
                    cb(null, 'saved ownership info in ci db');
                });
            }
        } else {
            cb("Ownershipanization does not exist");
        }
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    });
}

function deletebranchForOwnership(branchInfo, cb) {
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result.length > 0) {
            let branchs = result[0].branchs;
            if (branchs) {
                let removeIndex = branchs.map(function (item) { return item.branch; }).indexOf(branchInfo.branchName);
                if (removeIndex >= 0) { branchs.splice(removeIndex, 1); }
                else { cb(null, 'not exist'); }
            }
            rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).update({
                branchs: branchs
            }).run(connection, function (err, result) {
                if (err) {
                    console.log(err);
                };
                cb(null, 'branch deleted successfully');
            });
        } else { cb(null, 'not exist') }
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    });
}

function addMemberTobranch(userId, emailId, name, branchInfo, cb) {
    let isUserExist = false;
    let isbranchExist = false;//var userbranch = null;
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result.length > 0) {
            let branchs = result[0].branchs;
            if (branchs) {
                _.each(branchs, function (branchObj) {
                    if (branchObj.branch == branchInfo.branchName) {
                        isbranchExist = true;
                        let users = branchObj.users;
                        if (users) {
                            _.each(users, function (userObj) {
                                if (userObj.email === emailId) {
                                    isUserExist = true;
                                }
                            });
                            if (!isUserExist) {
                                branchObj.users.push({ email: emailId, name: name, userId: userId });
                            }
                        }
                        else {
                            branchObj.users = [{ email: emailId, name: name, userId: userId }];
                        }
                    }
                });
                if (!isbranchExist) {
                    cb(null, 'branch does not exists');
                }
                if (isUserExist) {
                    cb(null, 'user already exists');
                }
                if (isbranchExist && !isUserExist) {
                    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).update({
                        branchs: branchs
                    }).run(connection, function (err, result) {
                        if (err) {
                            cb('cannot update the data');
                        };
                        cb(null, 'User added successfully');
                    });
                }
            }
        }
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    })
}

function getbranchUsers(branchInfo, cb) {
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result.length > 0) {
            let users = [];
            let branchs = result[0].branchs;
            if (branchs) {
                _.each(branchs, function (branchObj) {
                    if (branchObj.branch == branchInfo.branchName) {
                        if (branchObj.users) {
                            users = branchObj.users;
                        }
                    }
                });
            }
            cb(null, users);
        }
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    })
}

function getAllbranchsForOwnership(ownershipId, cb) {
    let branchs = [];
    rdb.table('ownershipanizations').filter({ ownershipName: ownershipId }).run().then(function (result) {
        if (result[0] && result[0].branchs && result[0].branchs.length > 0) {
            _.each(result[0].branchs, function (branch) {
                branchs.push({ branch: branch.branch, description: branch.description, branchId: branch.branchId });
            })
            cb(null, { message: 'success', data: branchs });
        } else {
            cb(null, 'branch does not exists')
        }
    }).catch(function (err) {
        log.error(JSON.stringify(err));
        var response = {
            message: "Cannot Get data.",
            statusCode: 404,
            errorCode: "code1"
        }
        cb(response);
    });
}

function checkbranchExist(branchInfo, cb) {
    let branchExist = false;
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result[0].branchs) {
            _.each(result[0].branchs, function (branch) {
                if (branch.branch == branchInfo.branchName) {
                    branchExist = true;
                }
            })
        }
        if (branchExist) { cb(true); }
        else { cb(false); }
    });
}

function savebranchRoles(branchInfo, roles) {
    return new Promise(function (resolve, reject) {
        rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
            if (result[0].branchs && result[0].branchs.length > 0) {
                _.each(result[0].branchs, function (branch) {
                    if (branch.branch == branchInfo.branchId) {
                        branch.roles = roles;
                     
                    }
                });
                rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).update({
                    branchs: result[0].branchs
                }).run(connection, function (err, result) {
                    if (err) {
                        reject('cannot update the data');
                    };
                    resolve('branch roles updated successfully');
                });
                
            }
        });
    })
}

function injectbranchRoles(permissions, cb) {
    Promise.all(permissions.ownerships.map(function (ownership) {
        return Promise.all(Object.keys(ownership).map(function (ownershipName) {
            if (ownership[ownershipName].branchs && ownership[ownershipName].branchs.length > 0) {
                return Promise.all(ownership[ownershipName].branchs.map(function (authbranch) {
                    return new Promise(function (resolve, reject) {
                        rdb.table('ownershipanizations').filter({ ownershipName: ownershipName }).run().then(function (result) {
                            if (result[0] && result[0].branchs && result[0].branchs.length > 0) {
                                _.each(result[0].branchs, function (dbbranch) {
                                    _.each(ownership[ownershipName].branchs, function (authbranch) {
                                        if (authbranch.branch == dbbranch.branch) {
                                            authbranch.roles = dbbranch.roles;
                                        }
                                        resolve('added');
                                    });
                                });
                            }
                            else { resolve('not exist'); }
                        });
                    })
                }))
            } else {
                resolve('not exist');
            }
        }))
    })).then(function (data) {
        cb(null, permissions);
    }).catch(function (err) {
        cb(err);
    });
}

function getbranchDetails(branchInfo, cb) {
    let branchDetails;
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result[0].branchs && result[0].branchs.length > 0) {
            _.each(result[0].branchs, function (branch) {
                if (branch.branchId = branchInfo.branchId) {
                    branchDetails = branch;
                }
            })
            cb(null, branchDetails);
        }
        else ({ message: 'branch does not exist' });
    }).catch(function (err) {
        cb('Could not get branch details');
    });
}

function getbranchDetailsBybranchName(branchInfo, cb) {
    let branchInfoDetails = {};
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result[0].branchs && result[0].branchs.length > 0) {
            _.each(result[0].branchs, function (branch) {
                if (branch.branch == branchInfo.branchName) {
                    branchInfoDetails = branch;
                }
            })
            cb(null, branchInfoDetails);
        }
        else {
            cb("branch does not exist");
        }
    }).catch(function (err) {
        cb('Could not get branch details');
    });
}

function updatebranchInfo(branchInfo, cb) {
    let existingbranchName;
    rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).run().then(function (result) {
        if (result[0].branchs && result[0].branchs.length > 0) {
            _.each(result[0].branchs, function (branch) {
                if (branch.branchId == branchInfo.branchId) {
                    existingbranchName = branch.branch;
                    if (branchInfo.branchName) {
                        branch.branch = branchInfo.branchName;
                    }
                    if (branchInfo.branchDescription) {
                        branch.description = branchInfo.branchDescription;
                    }
                }
            });
            rdb.table('ownershipanizations').filter({ ownershipName: branchInfo.ownershipId }).update({
                branchs: result[0].branchs
            }).run(connection, function (err, result) {
                if (err) {
                    cb({ message: 'cannot update the data' });
                };
                cb(null, { message: 'branch updated', existingbranchName: existingbranchName });
            });
        }
    });
}