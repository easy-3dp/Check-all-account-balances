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
        let { free, reserved, miscFrozen, feeFrozen } = user[1].data;
        free = BigInt(free);
        reserved   = BigInt(reserved);
        miscFrozen = BigInt(miscFrozen);
        feeFrozen  = BigInt(feeFrozen);

        let balance = free+reserved;
        let transferable = free-(miscFrozen > feeFrozen ? miscFrozen : feeFrozen);
        transferable = 0n > transferable ? 0n : transferable;
        console.log(`0x${account}, ${balance.toString()/1000000000000}, ${transferable.toString()/1000000000000}`);

        total += balance;
        totalTransferable += transferable;

        if (account == '608a961b5e9453cf703b18485cfcfb1ad9aed9930da3f80656f27a6ac12b135e' //Marketing budget
         || account == '62f15fae5a1ce17dd191d8f2d19776816548d92be01ecd0570d47e47bb951f74' //Private sale
         || account == '3e10c920b726d9b35181bd565ffafbbba0e8ee1612872c996043fa01fcea6375'
         || account == '04f5ed88a931e95c38fd0477e6c52c781c6ab041d4a67b4b8663764c50813319'
         || account == '52b9d3d72ca1f13c80413a8df2de1df2248896ca46910c7ceb9c0ee5afc4c763'
         || account == 'c27e8fc505b3b14f64b4158f39ebbb761d4f91f74ff0280127d668cbe9954e54'
         || account == 'be37ef39e88309b8b3877509d49850342647fda107f0463c17b0b4f04d86aa1a'
         || account == '80353aeab8323b23fc9e5f975f675957765aefd09b9be9b9eefe8c199000bc65'
         || account == 'c669ce7c53a881d0a6e8f92cf2f41be1827947f79aa31ca39019cc9524f37623'
         || account == 'acb2f3de93bb2e140a20306ebe37c9eca761d8414007eb7ad65917b31a584d23'
         || account == 'da0153d9e10c805a739c40b14091186a0c92239ee414b24a6d19e89db8736a4e'
         || account == 'fa343005718eb4c78a10e6e4515726ad0d870f268a10dbf799e9c81db66fb344'
        )
        official += balance;

        if (account == '6d6f646c70792f74727372790000000000000000000000000000000000000000')
        treasury += balance;

       ++addressCount;
       if(balance >= 1000000000000n)
        ++addressCountMore1;
        if(balance >= 999000000000000000n){
        ++addressCountMore1M;
        totalM += balance;
        }

        list.push(balance);
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

    const value = await extractUsdValue();

    console.log(`${date()} #${header}`);
    console.log(`总流通数${Parse(total)}，市值$${(parseFloat((total).toString())*value/1000000000000)}`);
    console.log(`无锁流通数${Parse(totalTransferable)}，市值$${(parseFloat((totalTransferable).toString())*value/1000000000000)}`);
    console.log(`官方账户${Parse(official)}，占总流通${(parseFloat((official).toString())/parseFloat(total.toString())*100).toFixed(2)}%`);
    console.log(`国库${Parse(treasury)}，占总流通${(parseFloat((treasury).toString())/parseFloat(total.toString())*100).toFixed(2)}%`);
    console.log(`激活地址数${addressCount}`);
    console.log(`余额大于1地址数${addressCountMore1}`);
    console.log(`余额大于接近1M地址数${addressCountMore1M}`);
    console.log(`所有M大佬（前${addressCountMore1M}地址）占总流通${(parseFloat(totalM.toString())/parseFloat(total.toString())*100).toFixed(2)}%`);
    console.log(`垄断（占总流通99%）地址${addressCount99}`);
}

function Parse(num) {
    let numInt = num/1000000000000n;
    let numDec = num-numInt*1000000000000n;
    let numM = num/1000000000000000000n;
    let numB = numInt-numM*1000000n;
    return `${numM}M${numB.toString().padStart(6, '0')}.${numDec.toString().padStart(12, '0')}`;
}

const fetch = require('node-fetch');

async function downloadPage(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(`Error downloading the page: ${error}`);
  }
}

async function extractUsdValue() {
    let page = await downloadPage('https://xeggex.com/asset/P3D');
    const regex = /usdValue: '([\d.]+)'/;
    const match = page.match(regex);
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return null;
}

function date(){
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
}



main();
