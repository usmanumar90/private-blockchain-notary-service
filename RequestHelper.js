const RequestClass = require('./Request.js');

class RequestHelper{
    
    constructor(){
        this.requests = [];
    }  
	
	addRequests(address, message) {

		this.requests.push({
            address: address,
            message: message
		});
	}

    saveAddressValidationRequest(address, message) {
        
        this.addRequests(address,message);
        let result = this.getValidatedAddress(address);
        console.log("Request Saved is ----", result);    
    }
    
    
    removeAddressValidationRequest(address) {

        for( var i = 0; i < this.requests.length; i++){ 
           if (this.requests[i].address === address) {
            this.requests.splice(i, 1); 
           }
        }
    }
    

    getValidatedAddress(address){

        for( var i = 0; i < this.requests.length; i++){ 
            if (this.requests[i].address === address) {
                console.log("Result is ", this.requests[i]);
                return this.requests[i];
            }
         }
    }

    isAddressValidated(address){
        let isValid = this.getValidatedAddress(address);
        if(isValid == "" || isValid == null){
            return false;
        }
        return true;
    }
}

module.exports = RequestHelper;
