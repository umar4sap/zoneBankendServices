var request = require('request');
 

function contentCheck(text){

return new Promise(function (resolve, reject) {
var options = {
  method:"POST",
  url: 'https://eastus.api.cognitive.microsoft.com/contentmoderator/moderate/v1.0/ProcessText/Screen?autocorrect=True&PII=True&listId=True&classify=True&language=Eng',
  headers: {
    "Content-Type": "text/plain",
    "Ocp-Apim-Subscription-Key": "3e43d5b537d94bd0943280a47e4b5147"
  },
  body:text
};
request(options, callback);
function callback(error, response, body) {
   if(!error){
    data = JSON.parse(body)
    if(data.Classification){
    resolve(body)
    }else{
        reject(body)
    }
   }else{
    reject(error)
   }

}
})
}

module.exports={
    contentCheck:contentCheck
}

