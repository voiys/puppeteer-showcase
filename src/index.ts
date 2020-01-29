import puppeteer from 'puppeteer';

const main: (puppeteerCallback: (...args: any[]) => any, closeAfterCallback?: boolean) => Promise<any>
= async (puppeteerCallback, closeAfterCallback = true) => {
    const browser = await puppeteer.launch({headless: true});
    const [page] = await browser.pages();

    await puppeteerCallback(page);

    if (closeAfterCallback) await browser.close();
};

