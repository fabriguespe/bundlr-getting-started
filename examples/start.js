const {NodeBundlr} = require('@bundlr-network/client/build/node');
const BigNumber = require('bignumber.js')
const { readFileSync }  = require("fs") ;
const {utils} = require('ethers')

CURRENCY=null
let bundlr = null

const balanceOf = async () => {
    try{
        const balance = await bundlr.getLoadedBalance()
        const converted = bundlr.utils.unitConverter(balance) // 0.000000109864 - traditional decimal units
        console.log('balance',converted.toString())
        return balance
    }catch(e){
        console.log(e)
    }
}

const calculate_price = async (data) => {
    try{
        const price=await bundlr.getPrice(data.length);
        const amount=utils.formatEther(price.toString())
        console.log('Price of uploading:', amount,CURRENCY)
        return price
    }catch(e){

        console.log(e)
    }
}

const upload = async (data) => {

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

const init = async () => {
    try{

        const privateKey = JSON.parse(readFileSync("wallets/wallet.json").toString()).private;
        bundlr = new NodeBundlr("https://node1.bundlr.network", CURRENCY, privateKey)
        console.log("Bundlr client initialized",bundlr.address)

        return bundlr
    }catch(e){
        console.log(e)
    }
}
const main = async () => {
    try{

        //Init
        const data = readFileSync("assets/image.jpeg");
        CURRENCY="matic"

        await init()

        const balance=await balanceOf()
        let price=await calculate_price(data)
        
        if (!balance.isGreaterThan(price))await fund(0.0001)
        
        await upload (data)
        
    }catch(e){
        console.log(e)
    }
}
main()
