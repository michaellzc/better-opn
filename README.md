# better-opn

> A better opn. Reuse the same tab on Chrome for 👨‍💻. Inspire by [create-react-app](https://github.com/facebook/create-react-app)

## Install

`opn` is a peer dependency, make sure you install it as well.

```bash
yarn add opn better-opn
```

```bash
npm install opn better-opn
```

## Usage

If you wish to overwrite the default browser, override `BROWSER` environment variable to your desire browser name (name is platform dependent).

```js
const opn = require('better-opn');

opn('http://localhost:3000');
```

## Author

- [Michael Lin](mailto:linzichunzf@hotmail.com)
