const fs = require('fs');
const path = require('path');
const { create } = require('ipfs-http-client');


const newLocal = 'ipfs.local';
const ipfs = create({ host: newLocal, port: 5002, protocol: 'http' });

async function main() {
  const buildPath = path.join(__dirname, 'build');
  const files = [];

  const addDir = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        addDir(itemPath);
      } else {
        const content = fs.readFileSync(itemPath);
        const ipfsPath = itemPath.replace(buildPath + path.sep, '');
        const mimeType = getMimeType(ipfsPath);
        files.push({ path: ipfsPath, content, mimeType });
      }
    });
  };

  addDir(buildPath);

  for await (const file of ipfs.addAll(files, { wrapWithDirectory: true })) {
    console.log(file.path, file.cid);
  }
}

function getMimeType(filePath) {    
  const ext = path.extname(filePath);
  const mimeTypeMap = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  return mimeTypeMap[ext] || 'application/octet-stream';
}

main().catch(console.error);
