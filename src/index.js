const {execSync} = require('child_process');

const OSX_CHROME = 'google chrome';

const Actions = Object.freeze({
  NONE: 0,
  BROWSER: 1,
});

const getBrowserEnv = () => {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/open#app for documentation.
  const value = process.env.BROWSER;
  const args = process.env.BROWSER_ARGS
    ? process.env.BROWSER_ARGS.split(' ')
    : [];
  let action;
  if (!value) {
    // Default.
    action = Actions.BROWSER;
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE;
  } else {
    action = Actions.BROWSER;
  }

  return {action, value, args};
};

const normalizeURLToMatch = target => {
  // We may encounter URL parse error but want to fallback to default behavior
  try {
    // Url module is deprecated on newer version of NodeJS, only use it when URL class is not supported (like Node 8)
    const URL =
      // eslint-disable-next-line node/prefer-global/url
      typeof global.URL === 'undefined' ? require('url').URL : global.URL;
    const url = new URL(target);
    return url.origin;
  } catch {
    return target;
  }
};

// Copy from
// https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/openBrowser.js#L64
// eslint-disable-next-line unicorn/prevent-abbreviations
const startBrowserProcess = (browser, url, opts = {}, args = []) => {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === OSX_CHROME);

  if (shouldTryOpenChromiumWithAppleScript) {
    // Will use the first open browser found from list
    const supportedChromiumBrowsers = [
      'Google Chrome Canary',
      'Google Chrome',
      'Microsoft Edge',
      'Brave Browser',
      'Vivaldi',
      'Chromium',
    ];
    for (const chromiumBrowser of supportedChromiumBrowsers) {
      try {
        // Try our best to reuse existing tab
        // on OSX Chromium-based browser with AppleScript
        execSync('ps cax | grep "' + chromiumBrowser + '"');
        execSync(
          `osascript ../openChrome.applescript "${encodeURI(url)}" "${
            process.env.OPEN_MATCH_HOST_ONLY === 'true'
              ? encodeURI(normalizeURLToMatch(url))
              : encodeURI(url)
          }" "${chromiumBrowser}"`,
          {
            cwd: __dirname,
            stdio: 'ignore',
          }
        );

        return Promise.resolve(true);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Ignore errors.
        // It it breaks, it will fallback to `opn` anyway
      }
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing `open` to `opn` (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
  // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined;
  }

  // Fallback to opn
  // (It will always open new tab)
  const options = {
    app: {name: browser, arguments: args},
    wait: false,
    ...opts,
  };
  return require('open')(url, options);
};

module.exports = (target, options) => {
  const {action, value, args} = getBrowserEnv();
  switch (action) {
    case Actions.NONE:
      // Special case: BROWSER="none" will prevent opening completely.
      return false;
    case Actions.BROWSER:
      return startBrowserProcess(value, target, options, args);
    default:
      throw new Error('Not implemented.');
  }
};
