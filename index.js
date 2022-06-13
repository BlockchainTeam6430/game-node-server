const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Web3 = require('web3')
const service = require("./src/service");
const Game = require("./src/blockchain/abis/Hipogame.json");
const AesEncryption = require('aes-encryption')

require('dotenv').config(/*{
  path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
}*/); 

const aes = new AesEncryption()
aes.setSecretKey(process.env.AES_KEY)
// Note: secretKey must be 64 length of only valid HEX characters, 0-9, A, B, C, D, E and F


const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  try{
    // const web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc'));
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://kovan.infura.io/v3/${process.env.INFRA_KEY}`));
    const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEYS);

    service.web3 = web3;
    service.account = account;
    service.gameContract = new web3.eth.Contract(Game.abi, process.env.GAME_CONTRACT_ADDR);
    const owner = await service.gameContract.methods.curRoom().call();
    console.log(owner)
  
  } catch (evt) {
    console.log(evt);
  }
})();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
      res.status(200).end()
      return;
  }
  // Pass to next layer of middleware
  next();
});

app.get("/", (req, res) => {
  return res.send("Welcome!");
});

app.post("/api/gameOver", async (req, res) => {
  const crnRoom = await service.currentRoom();
  let result = false;
  if(crnRoom)  {
    const winner = aes.decrypt(req.body.winner)

    result = await service.gameOver(crnRoom, winner);
  }
  return res.send({result});
});

app.get("/api/checkRoom", async (req, res) => {
  const roomInfo = await service.currentRoom();
  console.log(roomInfo)
  if(roomInfo) {
    return res.send({status: roomInfo.status});
  }else {
    return res.send({status: false});
  }
});

// set port, listen for requests
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
