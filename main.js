const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main(){
    const provider = new WsProvider('wss://rpc.3dpass.org');
    const api = await ApiPromise.create({ provider });

    var total = 0n;
    var official = 0n;
    var treasury = 0n;
    var addressCount = 0;
    var addressCountMore1 = 0;
    var addressCountMore1M = 0;
    var totalM = 0n;
    var totalTransferable = 0n;
    var list = [];

    var header = await (await api.rpc.chain.getHeader()).number;

    const users = await api.query.system.account.entries();
    for (const user of users) {
        let account = Buffer.from(user[0].slice(-32)).toString('hex');
        let balance = (user[1].data.free/1000000000000).toString();
        let transferable = Math.max(0, user[1].data.free-user[1].data.reserved-Math.max(user[1].data.miscFrozen, user[1].data.feeFrozen));
        let transferableStr = (transferable/1000000000000).toString();
        console.log(`0x${account}, ${balance}, ${transferableStr}`);

        total += BigInt(user[1].data.free);

        if (account == '608a961b5e9453cf703b18485cfcfb1ad9aed9930da3f80656f27a6ac12b135e'
         || account == 'acb2f3de93bb2e140a20306ebe37c9eca761d8414007eb7ad65917b31a584d23'
         || account == 'be37ef39e88309b8b3877509d49850342647fda107f0463c17b0b4f04d86aa1a'
         || account == '04f5ed88a931e95c38fd0477e6c52c781c6ab041d4a67b4b8663764c50813319'
         || account == '62f15fae5a1ce17dd191d8f2d19776816548d92be01ecd0570d47e47bb951f74'
         || account == '3e10c920b726d9b35181bd565ffafbbba0e8ee1612872c996043fa01fcea6375'
        )
        official += BigInt(user[1].data.free);
        else
        totalTransferable += BigInt(transferable);

        if (account == '6d6f646c70792f74727372790000000000000000000000000000000000000000'
       )
       treasury += BigInt(user[1].data.free);

       ++addressCount;
       if(user[1].data.free >= 1n)
        ++addressCountMore1;
        if(user[1].data.free >= 999000000000000000n){
        ++addressCountMore1M;
        totalM += BigInt(user[1].data.free);
        }

        list.push(BigInt(user[1].data.free));
    }

    var total99 = BigInt((parseFloat(total.toString()) * 0.99).toFixed(0).toString());
    var totalCount99 = 0n;
    var addressCount99 = 0;
    list.sort((a, b) => Number(b - a));

    for (const num of list) {
        totalCount99 += num;
        if(totalCount99 >= total99)
            break;
            addressCount99++;
    }


    console.log(`#${header}`);
    console.log(`流通数${Parse(total)}`);
    console.log(`官方账户${Parse(official)}`);
    console.log(`国库${Parse(treasury)}`);
    console.log(`官方直接控制量占总流通${(parseFloat((official+treasury).toString())/parseFloat(total.toString())*100).toFixed(2)}%`);
    console.log(`激活地址数${addressCount}`);
    console.log(`余额大于1地址数${addressCountMore1}`);
    console.log(`余额大于接近1M地址数${addressCountMore1M}`);
    console.log(`所有M大佬（前${addressCountMore1M}地址）占总流通${(parseFloat(totalM.toString())/parseFloat(total.toString())*100).toFixed(2)}%`);
    console.log(`垄断（占总流通99%）地址${addressCount99}`);
    console.log(`去除官方和有锁的流通数${Parse(totalTransferable)}`);
}

function Parse(num) {
    let numInt = num/1000000000000n;
    let numDec = num-numInt*1000000000000n;
    let numM = num/1000000000000000000n;
    let numB = numInt-numM*1000000n;
    return `${numM}M${numB.toString().padStart(6, '0')}.${numDec.toString().padStart(12, '0')}`;
}

main();
