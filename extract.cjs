const fs = require('fs');
const text = fs.readFileSync('main.js', 'utf8');

const regex = /["']([^"']+\.(png|jpg|jpeg|webp))["']/gi;
let match;
const urls = new Set();
while ((match = regex.exec(text)) !== null) {
  urls.add(match[1]);
}

console.log(Array.from(urls));
