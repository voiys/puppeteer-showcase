import puppeteer from 'puppeteer';
import { puppeteerCallback } from './types';

const main: (puppeteerCallback: (...args: any[]) => any, closeAfterCallback?: boolean) => Promise<any>
= async (puppeteerCallback, closeAfterCallback = true) => {
    const browser = await puppeteer.launch({headless: true});
    const [page] = await browser.pages();

    await puppeteerCallback(page);

    if (closeAfterCallback) await browser.close();
};

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

// const fullPageScreenshotExample: puppeteerCallback
// = async (page) => {
//     await page.goto()
}

// const PDFExample

// const scrapePostsExample

// const paginationExample

// const SPAExample

main(fullPageScreenshotExample);