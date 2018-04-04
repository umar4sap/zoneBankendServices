'use strict';
var config={}
config.rethinkdb = {
//host: "127.0.0.1",
host: process.env.DB_HOST || "159.65.15.180",
//db host
port: process.env.DB_PORT || 28015,
authKey: "",
db: "zones_customerDB",
};

config.auth0 = {}; 
// config.currentAuthUser="";
// config.auth0.secret  =  process.env.auth0Secret 
// config.auth0.clientID = process.env.auth0ClientID
// config.auth0.manageSecret  = process.env.auth0ManageSecret
// config.auth0.manageClientID =process.env.auth0ManageClientID 
// config.auth0.domain =process.env.domain 
config.currentAuthUser="";
config.auth0.secret  = "-QZB4_uxwVfzgDieFPdzt_ItmN74bplBHYLeE-v049nakX1ada3N2xziJeOMNthF";
config.auth0.clientID = "cO02S01qm4vmAp2jhUtuLI4iAfQgXNx4";
config.auth0.manageSecret  = "kLWJWfW_IskdAwW-ye3gdeReUoVX6HA5vniIyrTnKAHn1OrcN-hQaS0p59QFoTan";
config.auth0.manageClientID = "cnFzgKqtXuTaGCMT8CS3LJ6849eAQj2C";
config.auth0.domain = "zones";
module.exports = config
