const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const RequestClass = require('./Request.js');
let bodyParser = require('body-parser');
const Blockchain = require('./Blockchain.js');
const requestStore = require('./RequestStore.js');
const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')
const RequestHelper = require('./RequestHelper');
/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        
        this.app = app;
        this.reqHelper = new RequestHelper();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.postRequestValidation();
        this.postSignMessage();
        this.searchBlockchainWalletAddress();
        this.searchBlockByHash();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
     async getBlockByIndex() {

        this.app.get("/block/:index", async (req, res) => {
            let blockchain = new Blockchain();
            let val = req.params.index;
            console.log("HIt",val);
            let myBlock = await blockchain.getBlockAsync(val);

            if(myBlock instanceof Error) {
                res.send({"Error": "Key not found in database"});
              } else {

                if(val > 0) {

                    var storyMsg = myBlock.body.star.story;
                    console.log("Story::--- ",  storyMsg)
                    myBlock.body.star.storyDecoded = blockchain.decodeString(storyMsg);;
                    //blockVal.body.star.story = this.decodeString(storyMsg);
                }

               res.send(myBlock);
            }
            
        });    
         
    }
  

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    async postNewBlock() {      

        this.app.post("/block", async (req, res) => {
      
            let blockchain = new Blockchain();
            console.log(" --- Adding new Block From API");
            
            if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
                
                console.log('Block missing');
                res.send({"Error": "Empty Block cannot be saved"});
            }
            else {

              let myBlockBody = req.body.body;
              if(myBlockBody != null & myBlockBody != "") {
                
                 //adding validation request for star registration
                let validity = this.reqHelper.isAddressValidated(myBlockBody.address);

                if(validity) {

                    //delete the validation request from Array 
                    this.reqHelper.removeAddressValidationRequest(myBlockBody.address);

                    let newBlock = new BlockClass.Block(myBlockBody);
                    console.log("New Block is --- ::::  ", newBlock)
                    await  blockchain.addBlock(newBlock);            
                    let myBlockHeight = await blockchain.getBlockHeightAsync();
                    myBlockHeight = myBlockHeight + 1;
  
                    console.log("New Block Height is ---", myBlockHeight)
  
                    let thisBlock = await blockchain.getBlockAsync(myBlockHeight);
                    console.log("New saved Block is --- ::::  ", thisBlock)
                    res.send(thisBlock);
                }
                else {
                    res.send({"Error": "Please make a new validation request with this wallet address for star registration"});    
                }
                  
              }
              else {
                res.send({"Error": "Empty Block cannot be saved"});
              }
            }

        });
    }

    /**
     * Implement a Post Endpoint to send the Blockchain validation message
     */
    async postRequestValidation() {

        try {
            
            this.app.post("/requestValidation", async (req, res) => {
                
                let walletAddress = req.body.address;
    
                if(walletAddress == "" || walletAddress == null) {
                    return res.send({"Error": "Wallet address cannot be empty"});
                }                   
                
                let myReq = new requestStore();
                let myReqObj = await myReq.getUserRequestAsync(walletAddress);
                            
                console.log("Wallet Address : -- ", myReqObj.address);
    
                if(myReqObj == "") {
                    let newRequest = new RequestClass.Request(walletAddress);
                    if(newRequest instanceof Error) {
                        return res.send({"Error": "There is an error"});
                    }
                    else {
    
                        let updateRequest = await myReq.saveUserRequestAsync(walletAddress, JSON.stringify(newRequest).toString());
                        return res.send(newRequest);
                    }
                }
                else{
    
                    let currentTime = new Date().getTime().toString().slice(0,-3);
                    let remainingTime = 300 - (currentTime - myReqObj.requestTimeStamp);
                    console.log("Remaining Time: ", remainingTime);
                    if(remainingTime > 0){
                        myReqObj.validationWindow = remainingTime;
                        let updateRequest = await myReq.saveUserRequestAsync(walletAddress, JSON.stringify(myReqObj).toString());
                        return res.send(myReqObj);
                    }
                    else{
                        let delRequest = await myReq.deleteUserRequestAsync(walletAddress);
                        if(delRequest == "success") {
                            console.log("Deleted validation request successfully!");
                        }
                        else {
                            console.log("Validation request delete Error");
                        }
                        
                        let newRequest = new RequestClass.Request(walletAddress);
                        if(newRequest instanceof Error) {
                            return res.send({"Error": "There is an error in making a validation request"});
                        }
                        else {
        
                            let updateRequest = await myReq.saveUserRequestAsync(walletAddress, JSON.stringify(newRequest).toString());
                            return res.send(newRequest);
                        }
                    }
                }            
            });    

        } catch (error) {
            return res.send({"Error": "There is an issue in the request object"});
        }
         
    }

    /**
     * Implement a Post Endpoint to Sign the Message
     */
    async postSignMessage() {

        this.app.post("/message-signature/validate", async (req, res) => {
            
            try {
                
                let walletAddress = req.body.address;
                let msgSignature = req.body.signature;            
    
                if(walletAddress == "" || walletAddress == null) {
                    return res.send({"Error": "Wallet address cannot be empty"});
                }                
                else if(msgSignature == "" || msgSignature == null) {
                    return res.send({"Error": "Message Signature cannot be empty"});
                }

                //updating validtion window before sending response back
                let myReq = new requestStore();
                let myReqObj = await myReq.getUserRequestAsync(walletAddress);

                if(myReqObj == "" || myReqObj == null){
                    return res.send({"Error": "Please make new validation request to verify your message!"});
                }

                let currentTime = new Date().getTime().toString().slice(0,-3);
                let remainingTime = 300 - (currentTime - myReqObj.requestTimeStamp);
                console.log("Remaining Time: ", remainingTime);
                if(remainingTime > 0){
                    myReqObj.validationWindow = remainingTime;
                    let updateRequest = await myReq.saveUserRequestAsync(walletAddress, JSON.stringify(myReqObj).toString());

                    console.log("Wallet Address : -- ", myReqObj.address);
                    let myMessage = myReqObj.message;
                    console.log("Message : -- ", myMessage);

                    let isValid = bitcoinMessage.verify(myMessage, walletAddress, msgSignature);        
                    let validity = isValid ? "valid" : "invalid";        
                    let newRequest = new RequestClass.Response(myReqObj, isValid, validity);

                    if(validity == "valid") {
                        //adding validation request for start registration
                        this.reqHelper.saveAddressValidationRequest(walletAddress, myMessage);
                        console.log("Validation Request Added")
                        console.log("Is Address Valid ----- ", this.reqHelper.isAddressValidated(walletAddress))                        
                    }

                    res.send(newRequest);
                } 
                else{
                    let delRequest = await myReq.deleteUserRequestAsync(walletAddress);
                    if(delRequest == "success"){
                        console.log("Validation request deleted successfully");
                    }
                    else{
                        console.log("Validation request delete error");
                    }
                    return res.send({"Error": "Your validation request timeout out, Please make another validation request!"});
                }               

            } catch (error) {                
                return res.send({"Error": "There is an issue with the request length"});
            }

        });    
         
    }

/**
     * Implement a GET Endpoint to  Search by Blockchain Wallet Address
     */
    async searchBlockchainWalletAddress() {

        this.app.get("/stars/address::address", async (req, res) => {


            try {
                
                console.log("Address Block Hit");
                let blockchain = new Blockchain();
                let val = req.params.address;

                if(val == "" || val == null) {
                    return res.send({"Error": "stars address cannot be empty"});
                }

                console.log("HIt",val);
                let myBlocks = await blockchain.getBlockByWalletAddressAsync(val);
    
                if(myBlocks instanceof Error) {
                    res.send({"Error": "Wallet Address not found in database"});
                  } else {
                   res.send(myBlocks);
                }         

            } catch (error) {
                return res.send({"Error": "There is an error in the Request"});
            }

        });  
    }

    /*
    * Implement a GET Endpoint to  Search by BlockHash
    */
   async searchBlockByHash() {
       this.app.get("/stars/hash::hash", async (req, res) => {

           try {

               let blockchain = new Blockchain();
               let val = req.params.hash;

               if(val == "" || val == null) {
                    return res.send({"Error": "stars hash cannot be empty"});
               }

               console.log("HIt",val);
               let myBlocks = await blockchain.getBlockByBlockHashAsync(val);
    
               if(myBlocks instanceof Error) {
                   res.send({"Error": "Wallet Address not found in database"});
                } else {
                  res.send(myBlocks);
               }            
                
            } catch (error) {
                
                return res.send({"Error": "There is an error in the Request"});
            }
       });  
   }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */


    async initializeMockData() {

        var blockchain = new Blockchain();
    }

    

  }
/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}