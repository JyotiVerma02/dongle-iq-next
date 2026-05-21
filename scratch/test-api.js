const http = require('node:http');

function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`URL: ${url}`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`Body:`, data.substring(0, 500));
        console.log('-----------------------------------');
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error fetching ${url}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  await testUrl('http://localhost:3000/api/get-user-data');
  await testUrl('http://localhost:3000/api/get-admin');
}

run();
