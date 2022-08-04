
const { readFileSync }  = require("fs") ;
const Arweave =require('arweave');


async function main() {
   
    await balances();
    
    const metadata = (readFileSync("assets/metadata.json"));
    await uploader(metadata,'application/json');

    const image = readFileSync("assets/foto.jpeg");
    await uploader(image,'image/jpeg');

}

async function uploader(data,type) {

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    const key = JSON.parse(readFileSync("wallets/arwallet.json").toString());

    
    let transaction = await arweave.createTransaction({ data:data }, key);    
    transaction.addTag('Content-Type', type);

    await arweave.transactions.sign(transaction, key);
    
    let uploader = await arweave.transactions.getUploader(transaction);
    
    while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }
    console.log("https://arweave.net/"+transaction.id);
}

async function balances(){

    const key = JSON.parse(readFileSync("wallets/arwallet.json").toString());
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });
    let add=await arweave.wallets.jwkToAddress(key).then((address) => {return address });
    const balance=await arweave.wallets.getBalance(add).then((balance) => {return balance});

    console.log(add,balance,arweave.ar.winstonToAr(balance))
    
}
async function example1() {

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    const key = JSON.parse(readFileSync("wallets/arwallet.json").toString());
    

    const metadataRequest = JSON.parse(readFileSync("assets/metadata.json").toString());
    console.log(metadataRequest);


    let transaction = await arweave.createTransaction({
        target: '1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY',
        quantity: arweave.ar.arToWinston('10.5')
    }, key);

    await arweave.transactions.sign(transaction, key);


    
    const metadataTransaction = await arweave.createTransaction({ data: metadataRequest });
    
    metadataTransaction.addTag('Content-Type', 'application/json');
    
    await arweave.transactions.sign(metadataTransaction, key);
    
    console.log("https://arweave.net/"+metadataTransaction.id);
    console.log(metadataTransaction)
    let response = await arweave.transactions.post(metadataTransaction);
    console.log(response);
    
}

main();
