
const {NodeBundlr } = require('@bundlr-network/client/build/node');
const { readFileSync }  = require("fs") ;
const BigNumber = require('bignumber.js')

async function main() {
    // other currencies without one - set key as your private key string
    // initialise a bundlr client
    const privateKey = JSON.parse(readFileSync("wallets/wallet.json").toString()).private;
    // other currencies without one - set key as your private key string

    const bundlr = new NodeBundlr("https://node1.bundlr.network", "matic", privateKey)
    
    // get your account address (associated with your private key)
    const address = bundlr.address

    // get your accounts balance
    const balance = await bundlr.getLoadedBalance();

    // convert it into decimal units
    const decimalBalance = bundlr.utils.unitConverter(balance)

    // you should have 0 balance (unless you've funded before), so lets add some funds:
    // Reminder: this is in atomic units (see https://docs.bundlr.network/docs/faq#what-are-baseatomic-units)

    const amountParsed = parseInput(parseFloat(0.0001),bundlr.currencyConfig.base[1])
    const fundStatus = await bundlr.fund(amountParsed)
    // this will take up to an hour to show up for arweave - other currencies are faster.

    const data = "Hello, Bundlr!"

    // create a Bundlr Transaction
    const tx = bundlr.createTransaction(data)

    // want to know how much you'll need for an upload? simply:
    // get the number of bytes you want to upload
    const size = tx.size
    // query the bundlr node to see the price for that amount
    const cost = await bundlr.getPrice(size);

    // sign the transaction
    await tx.sign()
    // get the transaction's ID:
    const id = tx.id
    // upload the transaction
    const result = await tx.upload()
    // once the upload succeeds, your data will be instantly accessible at `https://arweave.net/${id}`
}


function parseInput (input,base) {
    console.log(base)
    const conv = new BigNumber(input).multipliedBy(base)
    if (conv.isLessThan(1)) {
      console.log('error: value too small')
      return
    } else {
      return conv
    }
}

main()