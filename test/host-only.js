const opn = require('../src');

// Run test/open.js first, then run this to ensure tab is reused
process.env.OPEN_MATCH_HOST_ONLY = 'true';
opn('http://localhost:8000/foo');
