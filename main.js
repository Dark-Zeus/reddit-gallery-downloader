const axios = require('axios');
const soup = require('jssoup').default;
const fs = require('fs');
const puppeteer = require('puppeteer');

//url = "https://www.reddit.com/r/OnePiece/comments/yd1g1k/one_piece_chapter_1064_colored/";
(async () => {
    const browser = await puppeteer.launch({
        headless : false
    });

       
    const page = await browser.newPage();

    const urls = fs.readFileSync('urls.csv', 'utf8').split('\n');

    for(const record of urls){
        let [chapter, url] = record.split(",");

        if(url){
            console.log("Downloading Chapter - " + chapter);
            console.log("\tat : " + url);
            await download(chapter, url, page);
            console.log("Chapter " + chapter + " downloaded")
        }
    }

    await browser.close();
})();

const download = async(chapter, url, page) => {
    fs.mkdirSync('images', { recursive: true });
    fs.mkdirSync(`images/${chapter}`, { recursive: true });
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 0});

    let gallery = await page.$x('//gallery-carousel/ul/li/img');

    console.log("\tNumber of images : " + gallery.length);
    let i = 1;
    for (const element of gallery) {
        const src = await element.evaluate(el => el.getAttribute('src'));

        //fs.appendFileSync(`images/${chapter}/urls.txt`, src + '\n');
        //get axios to retireve image and save it in a webp file
        const response = await axios({
            method: 'GET',
            url: src,
            responseType: 'stream'
        });

        response.data.pipe(fs.createWriteStream(`images/${chapter}/${i}.webp`));
        i++;
    }
    return;
}
