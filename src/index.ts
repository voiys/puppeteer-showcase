import { writeFile } from 'fs';
import puppeteer from 'puppeteer';
import { puppeteerCallback } from './types';

const main: (puppeteerCallback: (...args: any[]) => any, closeAfterCallback?: boolean) => Promise<any>
= async (puppeteerCallback, closeAfterCallback = true) => {
    const browser = await puppeteer.launch({headless: true});
    const [page] = await browser.pages();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36');
    // page.on('console', message => console.log(message));

    await puppeteerCallback(page);

    if (closeAfterCallback) await browser.close();
};

const saveDataToTxt: (path: string, data: string[] | Object[], toJson?: boolean) => void
= (path, data, toJson = false) => {
    for (let item of data) {
        writeFile(path, toJson ? JSON.stringify(item, null, 2) : `${item}\n`, {flag: 'a+'}, console.log);
    }
}

const pageScreenshotExample: puppeteerCallback
= async (page) => {
    await page.goto('https://example.com')

    await page.screenshot({path: './data/example.png'});
};

const elementScrenshotExample: puppeteerCallback
= async (page) => {
    await page.goto('https://flashscore.com/tennis');

    const selector = '.sportName.tennis'

    await page.waitForSelector(selector);

    const element = await page.$('.event__match')

    await element!.screenshot({path: './data/tennisMatch.png'})
}

const fullPageScreenshotExample: puppeteerCallback
= async (page) => {
    await page.goto('https://flashscore.com/tennis');

    const selector = '.sportName.tennis';

    await page.waitForSelector(selector);

    await page.screenshot({path: './data/tennisFullscreen.jpg', fullPage: true})
}

const PDFExample: puppeteerCallback
= async (page) => {
    await page.goto('https://flashscore.com/tennis');

    const selector = '.sportName.tennis';

    await page.waitForSelector(selector);

    await page.emulateMediaType('screen');

    await page.pdf({path: './data/tennisPdf.pdf'})
}

const scrapeMatchesExample: puppeteerCallback
= async (page) => {
    await page.goto('https://flashscore.com/tennis');

    const selector = '.sportName.tennis';

    await page.waitForSelector(selector);

    const tennisMatchParticipants: {
        home: string;
        away: string;
    }[]
    = await page
        .$eval(selector, container => 
            Array
            .from(container.children)
            .map(child => {
                const getParticipant: (element: Element, home?: boolean) => string
                = (el, home = true) => el.querySelector(`.event__participant--${home ? 'home' : 'away'}`)?.textContent!;

                return ({
                home: getParticipant(child),
                away: getParticipant(child, false)
            })
        }));

    saveDataToTxt('./data/tennisParticipantNames.txt', tennisMatchParticipants, true);
}

// const paginationExample

// const SPAExample

main(scrapeMatchesExample);