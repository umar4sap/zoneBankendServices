'use strict';

var dbconfig = require('../../../config/db');

var rdb = require('rethinkdbdash')({
  pool: true,
  cursor: false,
  port: dbconfig.rethinkdb.port,
  host: dbconfig.rethinkdb.host,
  db: dbconfig.rethinkdb.db
});

module.exports = {
    initDB: initDB,
    createDatabase:createDatabase,
    createTable:createTable
};


function initDB() {
    createDatabase(dbconfig.rethinkdb.db)
        .then(function () {
            dbconfig.tables.forEach(function(item, index){
                createTable(item.table, item.id); 
            });
        })
        .catch(function (err) {
            console.log('Error creating database and/or table: ' + err);
        });
};
function createDatabase( databaseName) {
    return rdb.dbList().run().then(function (list) {
        var dbFound = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == databaseName) {
                dbFound = true;
                break;
            }
        }
        if (!dbFound) {
            console.log('Creating database...');
            return rdb.dbCreate(databaseName).run();
        }
        else {
            console.log('Database exists.');
            return Promise.resolve({ dbs_exists: true });
        };
    });
};

function createTable(tableName,primaryKey) {
    return rdb.tableList().run().then(function (list) {
        var tableFound = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == tableName) {
                tableFound = true;
                break;
            }
        }
        if (!tableFound) {
            console.log('Creating table '+tableName+'..');
            return rdb.tableCreate(tableName, {primaryKey: primaryKey}).run();
        }
        else {
            console.log('Table exists.');
            return Promise.resolve({ table_exists: true });
        };
    });
};
