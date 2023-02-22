const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main(){
    const provider = new WsProvider('wss://rpc.3dpass.org');
    const api = await ApiPromise.create({ provider });

    //api.rpc.chain.getHeader().then(console.log);

    // let props = Object.getOwnPropertyNames(api.query.system.blockHash);
    // for (let prop of props) {
    //     console.log(prop);
    // }

    // let d = await api.query.system.totalIssuance();
    // console.log(d.toHuman());

    // const obj = await api.query.system.blockHash.entries();
    // //console.log(obj[2400]);
    // console.log(Buffer.from(obj[2400][1]).toString('hex'));

    // const hash = await api.rpc.chain.getBlockHash(0);
    // const apiAt = await api.at(hash);

    const users = await api.query.system.account.entries();
    for (const user of users) {
        let account = Buffer.from(user[0].slice(-32)).toString('hex');
        let balance = (user[1].data.free/1000000000000).toString();
        let transferable = ((user[1].data.free-user[1].data.reserved-Math.max(user[1].data.miscFrozen, user[1].data.feeFrozen))/1000000000000).toString();
        console.log(`0x${account}, ${balance}, ${transferable}`);
    }
}

main();