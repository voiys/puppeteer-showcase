import { Page } from 'puppeteer';

export type puppeteerCallback = (page: Page) => Promise<any>