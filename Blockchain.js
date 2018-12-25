const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
var bodyParser = require('body-parser');
const levelDAL = require('./levelDbHelper.js');

class Blockchain {

  //constructor(app) {   
   constructor() {   

    this.addGenesisBlock();
  }
  
  async addGenesisBlock(){    
    let blockHeight = await this.getBlockHeightAsync();
    if(blockHeight < 0){
      await this.addBlock(new BlockClass.Block("First block in the chain - Genesis block"));      
    }
  }

  async getBlockAsync(key){
    
      let blockVal;
      await levelDAL.getBlock(key).then(function(result){
        blockVal = result;
      }).catch(error => {
        blockVal = error;
      });
      return blockVal;
  }

  async getBlockByWalletAddressAsync(address){

      let blockVal;
      await levelDAL.getBlockByWalletAddress(address).then(function(result){
        blockVal = result;
      }).catch(error => {
        blockVal = error;
      });

      for (var i = 0, len = blockVal.length; i < len; i++) {
        let storyMsg = blockVal[i].body.star.story;
        blockVal[i].body.star.storyDecoded = this.decodeString(storyMsg);
      }

      return blockVal;
  }

  async getBlockByBlockHashAsync(hash){

    let blockVal;
    await levelDAL.getBlockByBlockHash(hash).then(function(result){
      blockVal = result;
    }).catch(error => {
      blockVal = error;
    });

    if(blockVal.height > 0){
      let storyMsg = blockVal.body.star.story;
      blockVal.body.star.storyDecoded = this.decodeString(storyMsg);
    }

    return blockVal;
}

  async getBlockHeightAsync() {

    let totalHeight=0;
    await levelDAL.getBlockHeight().then(function(height){
      totalHeight = height - 1;
    });
    return totalHeight;
  }

  encodeString(str) {

    let bufStr = Buffer.from(str, 'utf8');    
    let encde = bufStr.toString('hex');  
    return encde;      
  }

  decodeString(str) {

    let bufStr = Buffer.from(str, 'hex'); 
    let decde = bufStr.toString('utf8');    
    return decde;
  }

  // Add new block
  async addBlock(newBlock){
    // Block height
    newBlock.height =  await this.getBlockHeightAsync() + 1;
    console.log('Block Height is ' + newBlock.height);
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    

      if(newBlock.height > 0) {
        
        var prevBlock = newBlock.height - 1;
        console.log("Previouc Block is at::  ", prevBlock);        

        var prevBlockVal = await this.getBlockAsync(prevBlock);  
        newBlock.previousBlockHash = prevBlockVal.hash;

        console.log("New Block Story is:::",newBlock.body.star.story);
        var storyMsg = newBlock.body.star.story;        
        newBlock.body.star.story = this.encodeString(storyMsg);
      }
    
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      console.log("New Block is:::",JSON.stringify(newBlock));    
      //Adding block to level
      levelDAL.addDataToLevelDB(newBlock);
  }

  // validate block
    async validateBlock(blockHeight){
      // get block object
      
      let block = await this.getBlockAsync(blockHeight);      
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          console.log("Block " + blockHeight + " is Valid");
          return true;
        } else {
          console.log('Block # '+ blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
          return false;
      }
    }

   // Validate blockchain
    async validateChain() {

      let errorLog = [];
      // Block height
      console.log('Calling Block Height');
      let blockHeight = await this.getBlockHeightAsync();
      console.log('Block Height is ' + blockHeight);

        for (var i = 0; i <= blockHeight; i++) {
          // validate block
          let isValidBlock = await this.validateBlock(i)
          if (!isValidBlock)
              errorLog.push(i);
          // compare blocks hash link
          console.log("Matching Block hashes for Validity");
           let currentBlock= await this.getBlockAsync(i);
           let blockHash = currentBlock.hash
           console.log("Block hash = ", blockHash);
           if(i < blockHeight){
              let prev_Block = await this.getBlockAsync(i+1);
              let previousHash = prev_Block.previousBlockHash;
              console.log("Previous Block hash = ", previousHash);
              if (blockHash!==previousHash) {
                errorLog.push(i);
              }
           }
        }
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        } else {
          console.log('No errors detected');
        }      
    }
}

module.exports = Blockchain;

//var blockchain = new Blockchain();
// (async function theLoop (i) {
//   setTimeout(function () {
//       let blockTest = new Block("Test Block - " + (i + 1));
//       blockchain.addBlock(blockTest);
//       i++;
//       if (i < 10) 
//         theLoop(i);
//   }, 10000);
// })(0);
//blockchain.validateChain();