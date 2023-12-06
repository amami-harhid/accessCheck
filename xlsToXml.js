const _async = require('async');
const xlsx = require('xlsx');
const fs = require('fs');
const os = require('os');
//const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core'); 
const inputPathName = "../honban.xlsx";
const DIRNAME = "../";
const urlArr = []

class UrlObj {
    constructor(rowNo, no, url, releaseDate){
        this.rowNo = rowNo;
        this.no = no;
        this.url = url;
        this.releaseDate = releaseDate;
        this.accessStatus = "";
    }
    set status(status) {
        this.accessStatus = status;
    }
    get status() {
        return this.accessStatus;
    }
}
const ReleaseNo1 = 45267;
const ReleaseNo2 = 45274;

let wb = xlsx.readFile(inputPathName);
let ws = wb.Sheets['ブラウザチェック'];
let count = 0;
for(let i=0; i<1000; i++){    
    let row = 4+i
    let cellA = ws[`A${row}`];
    let cellB = ws[`B${row}`];
    let cellD = ws[`D${row}`];
    if(cellA){
//        console.log(`${cellA.v}:${cellB.v}`)
        const obj = new UrlObj(row, cellA.v, cellB.v, cellD.v);
        urlArr.push(obj);
        count +=1;
    }
}

console.log(`count=${count}`)
console.log(`array=${urlArr.length}`)


const headless = true;
const browserExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36';
const WindowWidth = 1920;
const WindowHeight = 1080;
const viewPort = {
    width: WindowWidth, 
    height: WindowHeight, 
    deviceScaleFactor:0.85, 
    isMobile:false, 
    Mobile:false, 
    hasTouch:false, 
    isLandscape:false,
};
const NO_SANDBOX = '--no-sandbox';
const _browserOptions = {
    headless: headless,
    ignoreHTTPSErrors: true,
    executablePath: browserExecutablePath,
    defaultViewport:viewPort,
    args: ['--window-size='+WindowWidth+','+WindowHeight,'--window-position=0,0',NO_SANDBOX],
};

let browser;

const launch = async () => {
    browser = await puppeteer.launch( _browserOptions );
    return browser;
}
const puppeteerPageClose = async () =>{
    if(browser) {
        await browser.close();
    }
}


async function writeResultFile(obj){
    const result_txt_name = DIRNAME+'\\result.txt';
    let text = `Status=${obj.status},Url=${obj.url}, No=${obj.no}, Row=${obj.rowNo}`+"\n"
    fs.appendFileSync(
        result_txt_name,
        text, //result_txt,
        function(error) {
            if (error) {
                console.log(error);
            }
        }
    );    
}
const Access = async () => {
    _async.forEachSeries(
        urlArr,
        (async function(obj, callback){
            try{
                const _browser = await launch( _browserOptions );
                const page = await _browser.newPage();
//                await page.goto(obj.url,  {waitUntil: 'networkidle0'})
                await page.goto(obj.url,  {waitUntil: 'load'})
                .then(async function(response){
                    if(response==null || response === 'undefined'){
                        console.log(`エラー：${obj.rowNo}:${obj.no}:${obj.url}:${obj.releaseDate}`);             
                        return; 
                    }
                    const status = response.status();
                    obj.status = status;
                    console.log(`status=${status}`, obj); 
                    await writeResultFile(obj);           
                })
    
            }catch(e){
                console.log(e)
                console.log(`エラー：${obj.url}`);             

            }finally{
                //cb();
                await puppeteerPageClose();
                callback();
            }
        }),
        async function(err){
            console.log(err)
            if(browser !== null){
                await browser.close();
            }
        }

    );
};

const exe = async () => {
    await Access();
}
exe();