const test = require('ava');
const countBy = require('lodash.countby');
const puppeteer = require('puppeteer-core');
const open = require('../src');

const browserName = 'Google Chrome';
const openUrl = 'https://www.google.com/';
const openSecondUrl = 'https://stackoverflow.com/';
let chromeExecutablePath;
if (process.platform === 'darwin') {
  chromeExecutablePath = `/Applications/${browserName}.app/Contents/MacOS/${browserName}`;
} else if (process.platform === 'linux') {
  // https://github.com/mujo-code/puppeteer-headful#usage
  chromeExecutablePath = process.env.PUPPETEER_EXEC_PATH;
} else if (process.platform === 'win32') {
  chromeExecutablePath = 'Chrome';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.serial('the same tab is reused in browser on macOS', async t => {
  if (process.platform === 'darwin') {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromeExecutablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Open url with better-opn twice
    await open(openUrl);
    await open(openUrl);

    // Workaround since new pages are not avaliable immediately
    // https://github.com/puppeteer/puppeteer/issues/1992#issuecomment-444857698
    await sleep(5000);

    // Get open pages/tabs
    const openPages = (await browser.pages()).map(each => each.url());
    const openPagesCounter = countBy(openPages);
    // Expect only one page is opened
    t.is(openPagesCounter[openUrl], 1);

    // Close browser
    await browser.close();
  } else {
    // Skip for non-macOS environments
    t.pass();
  }
});

test.serial(
  'two tabs are opened when opening two different urls in browser on macOS',
  async t => {
    if (process.platform === 'darwin') {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: chromeExecutablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Open url with better-opn twice
      await open(openUrl);
      await open(openSecondUrl);

      // Workaround since new pages are not avaliable immediately
      // https://github.com/puppeteer/puppeteer/issues/1992#issuecomment-444857698
      await sleep(5000);

      // Get open pages/tabs
      const openPages = (await browser.pages()).map(each => each.url());
      const openPagesCounter = countBy(openPages);
      // Expect only one of each page is opened
      t.is(openPagesCounter[openUrl], 1);
      t.is(openPagesCounter[openSecondUrl], 1);

      // Close browser
      await browser.close();
    } else {
      // Skip for non-macOS environments
      t.pass();
    }
  }
);

test.serial('open url in browser', async t => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromeExecutablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await open(openUrl);

  // Workaround since new pages are not avaliable immediately
  // https://github.com/puppeteer/puppeteer/issues/1992#issuecomment-444857698
  await sleep(5000);

  // Get open pages/tabs
  const openPages = (await browser.pages()).map(each => each.url());
  const openPagesCounter = countBy(openPages);

  // Expect page is opened
  t.is(openPagesCounter[openUrl], 1);

  await browser.close();
});

test.serial(
  'should not open browser when process.env.BROWSER is none',
  async t => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromeExecutablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    process.env.BROWSER = 'none';

    // Open url
    await open(openUrl);

    // Get open pages/tabs
    const openPages = (await browser.pages()).map(each => each.url());
    const openPagesCounter = countBy(openPages);

    // Expect no page is opened
    t.is(openPagesCounter[openUrl], undefined);

    // Clean up
    process.env.BROWSER = browserName;
    await browser.close();
  }
);
