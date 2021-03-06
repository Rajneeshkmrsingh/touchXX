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

async function transferTrx(walletAddr, amount) {
  console.log("TRXXXXXX");
  const TronWeb = require("tronweb");
  const tronWeb = new TronWeb({
    // fullHost: "https://api.trongrid.io",
    fullHost: "https://api.shasta.trongrid.io/",
  });
  try {
    const addwalletAddr = "TYibhCX2kdNVjQQrv8ZMAREs5RKjKMy2R4";
    const addprivateKey =
      "38f4586b5f3acc61b5c3cc37126ce9452e3c7cba298d11b61f5ce2fdb81906d0";

    // const tradeobj = await tronWeb.transactionBuilder.sendTrx(
    //   walletAddr,
    //   amount * 1e6,
    //   // wall.walletAddr //  admin walletAddr
    //   process.env.walletAddr //  admin walletAddr
    // );
    // const signedtxn = await tronWeb.trx.sign(tradeobj, process.env.privateKey);
    // const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);

    AdminWallet.findOne({ withdrawlOnof: true, walletType: "hot_Wallet" })
    .then(async (wall) => {
      const tradeobj = await tronWeb.transactionBuilder.sendTrx(
        walletAddr,
        amount * 1e6,
        wall.walletAddr //  admin walletAddr
      );

      const signedtxn = await tronWeb.trx.sign(tradeobj, wall.privateKey);
      const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);

      if(trxreceipt.result == true){
        const revenueType = "withdrawl"
        createRevenue(wall.walletAddr,  userfreezWall.walletAddr, freezeAmt, trxreceipt.txid, revenueType )
      }
    })
 

     

    // let checkbal = await tronWeb.trx.getAccount(
    //   process.env.walletAddr,
    // );
    // console.log("TEST:: ",checkbal, tronWeb.address.fromHex(checkbal.address));
  } catch (error) {
    console.log("ERROR:: ", error);
  }
}

async function freezAmountDeduct(userfreezWall, freezeAmt) {
  const AdminWallet = require("../models/adminWallet");
  AdminWallet.findOne({ freezOnof: true })
    .then(async (wall) => {
      // console.log("wall::", wall);
      const TronWeb = require("tronweb");
      const tronWeb = new TronWeb({
        // fullHost: "https://api.trongrid.io",
        fullHost: "https://api.shasta.trongrid.io/",
      });
      const tradeobj = await tronWeb.transactionBuilder.sendTrx(
        wall.walletAddr, // reciver
        freezeAmt * 1e6,
        userfreezWall.walletAddr //  sender
      );
      const signedtxn = await tronWeb.trx.sign(
        tradeobj,
        userfreezWall.privateKey
      );
      const trxreceipt = await tronWeb.trx.sendRawTransaction(signedtxn);
      if(trxreceipt.result == true){
        const revenueType = "Freez"
        createRevenue(wall.walletAddr,  userfreezWall.walletAddr, freezeAmt, trxreceipt.txid, revenueType )
      }
      console.log("trxreceipt: ", trxreceipt.txid, trxreceipt.result)
        // console.log("Detail: ",trxreceipt)
      return trxreceipt
    })
    .catch((error) => {
      console.log("Error in freezeApi Function!", error);
    });
}
// create revenue
async function createRevenue( walletAddr, revenueFromWalletAddr, amount, trxid,  revenueType ) {
  // console.log(walletAddr, revenueFromWalletAddr, amount, revenueType)
  const Revenue = require("../models/revenueSchema");
    Revenue.create({
      uniqueId: Date.now(),
      walletAddr: walletAddr,
      revenueFromWalletAddr: revenueFromWalletAddr,
      revenueAmt: amount,
      trxId: trxid,
      revenueType: revenueType,
    }).then((error, data) => {
      if (error) console.log(error);
      if (data) console.log("revenuCreated:: ", data);
    });

}


module.exports = {
  createTRXAddress,
  freezAmountDeduct,
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


 // if(trxreceipt.result) {
      //   const transDetails = {
      //     walletAddr: wall.walletAddr,
      //     revenueFromWalletAddr: userfreezWall.walletAddr,
      //     amount: freezeAmt,
      //     revenueType: "freezRevenue",
      //     transactionAdd: trxreceipt.txid
      //   };
      //   console.log("transDetails::", transDetails)
      //   return transDetails;
      // } else {
      //   return trxreceipt.result
      // }
    
      // console.log("trxreceipt::", trxreceipt)