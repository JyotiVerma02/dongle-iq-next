const fetch = require('node:http');

const req = fetch.get('http://localhost:3000/admin/dashboard', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body length:', data.length);
    // Write first 1000 chars to check if redirecting
    console.log('Snippet:', data.substring(0, 1000));
  });
});

req.on('error', (err) => {
  console.error('Error fetching:', err);
});
