# Node ExpressJS framework used
# Endpoint documentation

In this exercise you will practice how a Private Blockchain Notary Service is created and works.

## Steps to follow

1. Install the NodeJs framework on local system
2. Open the terminal and install the packages: `npm install`.
3. Run your application `node app.js`
4. Tested Endpoints with Postman.


# Project Title

Build a Private Blockchain Notary Service

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

step 1: download node for Windows/Mac/Linux based on your OS from nodejs.org and run the package to install on your local system
step 2: Remember to add the node into environment variables while installing the node
step3: install VS Code from https://code.visualstudio.com/ since I am using this for node development

### Installing

A step by step series of examples that tell you how to get a development env running

step 1: open the project zip folder, this folder contains all the project files
step 2: open the node terminal and run the command "npm install" this will install all the packages required to run this project

##Note Issue of bitcoinjs-lib installation: 
If the  bitcoinjs-lib is not being installed on your system after running the command please apply the below command after your other packages are installed

npm i --ignore-scripts bitcoinjs-lib --save


## Running the tests

Explain how to run the tests for this system

step 1: "nodemon app.js" run this command which will start the node server and it will start listening on Port 8000 as this project is configured to use the port 8000.

step 2: Set the request type to Get in Postmain and add this URL given below : 

http://localhost:8000/requestValidation 

Actually this is calling our API to give response which proves the users blockchain identity and after validation of this identity, the user is granted access to register a single star with a validation window. It returns the following sort of response in JSON

    {
        "address": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
        "requestTimeStamp": "1542101541",
        "message": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4:1542101541:starRegistry",
        "validationWindow": 293
    }

step 3: Select the request type as POST then give this as your url for POST request: http://localhost:8000/message-signature/validate

     click on the "Headers" tab and add Key as "ContentType" and Value should be "application/json"
     click on "Body" tab and select "raw" option from radio button  add the following sort of request based on your own signature specific to your message and wallet address, This was my own signature specific to my message and wallet address

    {
        "address":"1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
        "messageSignature": "IEgTqXo4PiEMZ3zrT7HG4NXezDTYJZeAVxqDHmAj0qLGQzZklOCF/RujQqEwaa1FfR7yVRlxZAsRk1ywNMukcLI="
    }        
    
    now click on "Send" button to send the request to API to validate the message signature, once the request is sent then response is telling whether it was valid or invalid as shown below:
        {
            "registerStar": false,
            "status": {
                "address": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
                "requestTimeStamp": "1542101541",
                "message": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4:1542101541:starRegistry",
                "validationWindow": 293,
                "messageSignature": "invalid"
            }
        }


step 4: Now select the request type as POST then give this as your url for POST request: http://localhost:8000/block

     click on the "Headers" tab and add Key as "ContentType" and Value should be "application/json"
     click on "Body" tab and select "raw" option from radio button  add the following request
        {
        "body": {
                "address": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
                "star": {
                    "dec": "-26° 29' 24.9",
                    "ra": "16h 29m 1.0s",
                    "story": "Found star using https://www.google.com/sky/"
                    }
                }
        }
    
    now click on "Send" button to send the request to API to save the Block, for each validation request user is able to register only one start if user wants to register another start with the same address user has to make another validation request. Before saving the block the star's story will be encoded and once the Block is saved it will send back the same Block data in JSON as well. e.g. as shown below:
        {
            "hash": "22d55626c6c60564639d3fdbb7a9a03cd7a6a0dee0ca9789838fd870d0a6270d",
            "height": 4,
            "body": {
                "address": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
                "star": {
                    "dec": "-26° 29' 24.9",
                    "ra": "16h 29m 1.0s",
                    "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
                }
            },
            "time": "1542099980",
            "previousBlockHash": "ac0ff18ddafd9737761f2066325dad374173669023e93448f3ae99b0c1226dde"
        }

step 5: Set the request type to Get in Postmain and add this URL given below : 

http://localhost:8000/stars/hash:[HASH] 

whereas [HASH] is your own block hash to search the block via its hash address from leveldb. Response will be a single block based on a valid hash value as shown below:

{
    "hash": "5568dee26bed77bc05e69d0d5fe50f64b4af344e95a0f7eaf50b3a48627f494f",
    "height": 1,
    "body": {
        "address": "1Bc6Nc7DSM3Puo1xkMjojvprADJevfWmt4",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1542084751",
    "previousBlockHash": "86efe34bc0eeb90e50ab941ba5d2d5c252a4aa4e5831d531a422df605ff1561b"
}


step 6: Set the request type to Get in Postmain and add this URL given below : 

http://localhost:8000/stars/address:[ADDRESS] 

whereas [ADDRESS] is your wallet address and there Can be multiple blocks against one start wallet address.



step 7: Set the request type to Get in Postmain and add this URL given below : 

http://localhost:8000/block/[HEIGHT]

whereas [HEIGHT] is the block height to search a block with a specific block height.


## Built With

* [ExpressJS](https://expressjs.com/) - The nodejs framework used in this project


## Authors]

* **Usman Umer** 