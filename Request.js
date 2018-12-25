/* ===== Request Class ==============================
|  Class with a constructor for Validation Request 			   |
|  ===============================================*/

class Request {
	constructor(addr){
		this.address = addr;
		this.requestTimeStamp = new Date().getTime().toString().slice(0,-3);
		this.message = addr + ":" + this.requestTimeStamp+":starRegistry";
		this.validationWindow = 300;
	}
}

class Response {
	constructor(req, isValid, validity){
		this.registerStar = isValid;
		this.status = {
			address : req.address,
			requestTimeStamp : req.requestTimeStamp,
			message : req.message,
			validationWindow : req.validationWindow,
			messageSignature : validity
		};		
	}
}

module.exports.Request = Request;
module.exports.Response = Response;