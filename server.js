const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if(req.url === '/' || req.url.match(/\.[^\/]+$/i) === null) {
    fs.readFile(path.join(__dirname, 'build', 'index.html'), 'utf8',(err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      } else {
        const modifiedData = data.replace(/\/tld/g, req.url === '/' ? '' : req.url);
        res.writeHead(200, {'Content-Type': 'text/html'});
        return res.end(modifiedData);
      }
    });
  } else {
    const filePath = path.join(__dirname, 'build', req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('File not found');
      } else {
        res.writeHead(200);
        return res.end(data);
      }
    });
  }
});
const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});