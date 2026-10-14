import http from 'http';

http.get('http://localhost:3000/src/App.tsx', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    if (res.statusCode !== 200) {
      console.log('BODY:', data);
    } else {
      console.log('BODY LENGTH:', data.length);
      console.log('PREVIEW (first 500 chars):', data.substring(0, 500));
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('ERROR FETCHING FROM PORT 3000:', err);
  process.exit(1);
});
