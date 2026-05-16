const https = require('https');
const fs = require('fs');
const path = require('path');

const logos = [
    { name: 'bvlgari.png', url: 'https://www.vectorlogo.zone/logos/bulgari/bulgari-ar21.png' },
    { name: 'omega.png', url: 'https://www.vectorlogo.zone/logos/omega/omega-ar21.png' },
    { name: 'cartier.png', url: 'https://www.vectorlogo.zone/logos/cartier/cartier-ar21.png' }
];

const destDir = path.join(__dirname, 'uploads');

async function download(logo) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(destDir, logo.name));
        https.get(logo.url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(file);
                file.on('finish', () => resolve(logo.name));
            } else {
                reject(new Error(`Status ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function start() {
    for (const logo of logos) {
        try {
            await download(logo);
            console.log(`✅ Downloaded: ${logo.name}`);
        } catch (e) {
            console.error(`❌ Failed: ${logo.name}`, e.message);
        }
    }
}

start();
