async function createTRXAddress() {
  const TronWeb = require("tronweb");
  let wallet = TronWeb.utils.accounts.generateAccount();
  if (wallet && wallet.address && wallet.address.base58 && wallet.privateKey) {
    return {
      address: wallet.address.base58,
      privateKey: wallet.privateKey,
      type: "TRON",
      symbol: "TRX",
    };
  } else {
    return {
      address: "",
      privateKey: "",
      type: "",
      symbol: "",
    };
  }
}

async function transferTrx(walletAddr,  amount) {
  const TronWeb = require("tronweb");
  const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
  });
  if (wallet_data.wallet_type == "TRX") {
    const tradeobj = await tronWeb.transactionBuilder.sendTrx( walletAddr, amount * 1e6, process.env.walletAddr);
    const signedtxn = await tronWeb.trx.sign(tradeobj, process.env.privateKey);
    const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
    console.log(trxreceipt )
  
    
  }
}



module.exports = {
  createTRXAddress,
  transferTrx,
};


// const TronWeb = require('tronweb');
// const HttpProvider = TronWeb.providers.HttpProvider;

// const tronWeb = new TronWeb({fullHost:"https://api.satrongrid.io"});

// const privateKey = "...";
// var fromAddress = "TM2TmqauSEiRf16CyFgzHV2BVxBejY9iyR"; //address _from
// var toAddress = "TVDGpn4hCSzJ5nkHPLetk8KQBtwaTppnkr"; //address _to
// var amount = 10000000; //amount
// //Creates an unsigned TRX transfer transaction
// tradeobj = await tronWeb.transactionBuilder.sendTrx(
//       toAddress,
//       amount,
//       fromAddress
// );
// const signedtxn = await tronWeb.trx.sign(
//       tradeobj,
//       privateKey
// );
// const receipt = await tronWeb.trx.sendRawTransaction(
//       signedtxn
// );
// console.log('- Output:', receipt, '\n');