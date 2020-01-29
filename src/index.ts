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

const saveDataToTxt: (path: string, data: string[] | Object[], toJson?: boolean) => Promise<void>
= async (path, data, toJson = false) => {
    try {
        for (let item of data) {
            writeFile(path, toJson ? JSON.stringify(item, null, 2) : `${item}\n`, {flag: 'a+'}, console.log);
        }
        console.log('saved');
    } catch (err) {
        console.log(err);
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
            .map(match => {
                const getParticipant: (element: Element, home?: boolean) => string
                = (el, home = true) => el.querySelector(`.event__participant--${home ? 'home' : 'away'}`)?.textContent!;

                return ({
                home: getParticipant(match),
                away: getParticipant(match, false)
            })
        }));

    await saveDataToTxt('./data/tennisParticipantNames.txt', tennisMatchParticipants, true);
}

const paginationExample: puppeteerCallback
= async (page) => {
    await page.goto('https://blog.scrapinghub.com/')

    const postContainerSelector = '.post-listing';
    const paginationSelector = '.blog-pagination'
    
    const getPosts: () => Promise<void>
    = async () => {
        await page.waitForSelector(postContainerSelector);
        await page.waitForSelector(paginationSelector);

        const posts = await page.$eval(postContainerSelector, container => Array.from(container.children).map(post => {
            const header = post.querySelector('.post-header') as Element;
            const content = post.querySelector('.post-content') as Element;
    
            return ({
                title: header?.querySelector('h2')?.textContent,
                date: header?.querySelector('.date'),
                author: header?.querySelector('.author'),
                commentCount: parseInt(header.querySelector('.custom_listing_comments')?.textContent!),
                content: content.querySelector('p')?.textContent
            });
        }))
    
        saveDataToTxt('./data/posts.txt', posts, true);

        const nextPage = await page.$('.next-posts-link');

        if (nextPage) {
            await nextPage.click();
            await getPosts();
        }
    }
    await getPosts();
}

main(paginationExample, false);