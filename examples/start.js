
const {NodeBundlr} = require('@bundlr-network/client/build/node');
const BigNumber = require('bignumber.js')
const { readFileSync }  = require("fs") ;
const {utils} = require('ethers')

//NEVER SHARE YOUR PRIVATE, NOT EVEN WITH YOUR MOM.
const CURRENCY="matic"
let bundlr = null

const balance = async () => {
    try{
        
        const balance = await bundlr.getLoadedBalance()
        const converted = bundlr.utils.unitConverter(balance) // 0.000000109864 - traditional decimal units
        console.log('getLoadedBalance',converted.toString())
    
       
    }catch(e){
        console.log(e)
    }


}

const pricecalc = async () => {
    try{

        const size=1000
        const price=await bundlr.getPrice(size);
        const amount=utils.formatEther(price.toString())
        console.log('Price of uploading:', amount,CURRENCY)

    }catch(e){

        console.log(e)
    }

}

const upload = async (data) => {
    // Get the cost for upload
    const price = await bundlr.getPrice(data.length);
    const amount0=utils.formatEther(price.toString())
    // Get your current balance
    const balance = await bundlr.getLoadedBalance();
    const amount1=utils.formatEther(balance.toString())

    console.log('Balance and price:', amount0,amount1)

    // If you don't have enough balance for the upload
    if (!balance.isGreaterThan(price)) {
        // Fund your account with the difference
        // We multiply by 1.1 to make sure we don't run out of funds
        await bundlr.fund(balance.minus(price).multipliedBy(1.1))
    }
    
    // Create, sign and upload the transaction
    const tx = bundlr.createTransaction(data);
    const sign=await tx.sign();
    const upload= await tx.upload();
    console.log('tx: ', tx)
    console.log('sign: ', sign)
    let uri=`http://arweave.net/${upload.data.id}`
    console.log(uri)
}


const fund = async (amount) => {
    try{
        
        const amountParsed = parseInput(amount)
        console.log((amount),parseInput(amount))
        let response = await bundlr.fund(amountParsed);
        console.log(response)
    
    }catch(e){
        console.log(e)
    }
}

function parseInput (input) {
    try{

        const conv = new BigNumber(input).multipliedBy(bundlr.currencyConfig.base[1])
        if (conv.isLessThan(1)) {
          console.log('error: value too small')
          return
        } else {
          return conv
        }
    }catch(e){
        console.log(e)
    }
}

const bundlrinit = async () => {
    try{

        const privateKey = JSON.parse(readFileSync("wallets/wallet.json").toString()).private;
        bundlr = new NodeBundlr("https://node1.bundlr.network", "matic", privateKey)
        console.log("Bundlr client initialized",bundlr.address)

        return bundlr
    }catch(e){
        console.log(e)
    }
}
const main = async () => {
    try{

        await bundlrinit()

        await balance()

        await pricecalc()
        
        //await fund(0.00001)
        
        await upload ('devrel')
        
        
    }catch(e){
        console.log(e)
    }
}
main()
