const http = require('http');

http.get('http://127.0.0.1:4000/api/courts', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Body:', data);
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
