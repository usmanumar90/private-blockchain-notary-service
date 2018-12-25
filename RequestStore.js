const level = require('level');
const chainDB = './myRequestsDb';
const db = level(chainDB);


class RequestStore{

    getUserRequest(key) {  
        return new Promise((resolve, reject) => {
          db.get(key, function(err, value) {
            if (err) {
              reject("");
            }
            else{
              resolve(value);
            }  
          });
        });  
    };


    saveUserRequest(key,request) {
    
        return new Promise((resolve, reject) => {        
            db.put(key, request, function(err) {      
                if (err){
                    reject("fail");
                } 
                else{
                    resolve("success");
                }
            });
        });  
    };

    deleteUserRequest(key) {
    
        return new Promise((resolve, reject) => {        
            db.del(key, function(err) {      
                if (err){
                    reject("fail");
                } 
                else{
                    resolve("success");
                }
            });
        });  
    };

    async saveUserRequestAsync(key,request){    

        console.log("Key: ",key);
        console.log("JSON Object: ",request);

        let resultVal;
        await this.saveUserRequest(key, request).then(function(result){
            resultVal = result;
        }).catch(error => {
            resultVal = error;
        });
        return resultVal;
    }

    async getUserRequestAsync(key){    
        let resultVal;
        await this.getUserRequest(key).then(function(result){
            console.log("Getting Info based on Key:: ", result);
            resultVal =  JSON.parse(result);
        }).catch(error => {
            resultVal = error;
        });
        return resultVal;
    }

    async deleteUserRequestAsync(key){    
        let resultVal;
        await this.deleteUserRequest(key).then(function(result){
            resultVal =  result;
        }).catch(error => {
            resultVal = error;
        });
        return resultVal;
    }
}

module.exports = RequestStore;