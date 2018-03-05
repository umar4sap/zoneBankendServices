'use strict';
var Q = require('q');

var StorageClient = require('../helpers/client/storage-service-client'),
    _ = require('lodash');

function createPAR(orgId, userId, token, objectType, objectName,traceId) {
    var defer = Q.defer();
    StorageClient.createReadPAR(orgId, userId, token, objectType, objectName, traceId, function (err, result) {
        if (err) { 
            console.log("TraceId : %s, Error : %s", traceId , JSON.stringify(err));
            defer.reject; 
        }
        defer.resolve(result);
        //console.log('result = ', result);
    });
    return defer.promise;
}

var getAuthorsUrl = function (orgId, userId, tokenId, authorData, traceId) {
    return new Promise(function (resolve, reject) {
       
        console.log(JSON.stringify(authorData));
        if(authorData[0].authorImage[0].id){
            createPAR(orgId, userId, tokenId,"authorImage" , authorData[0].authorImage[0].id, traceId).then(function(data){
              authorData[0].authorImage[0]=data;
              // console.log(JSON.stringify(authorData));
              resolve(authorData);
            })
        }else{
            resolve(authorData);
        }
      
       
             
    });
}

module.exports = { getAuthorsUrl: getAuthorsUrl };
