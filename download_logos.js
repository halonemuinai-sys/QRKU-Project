const https = require('https');
const fs = require('fs');
const path = require('path');

const logos = [
    { name: 'google.png', url: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' },
    { name: 'github.png', url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' },
    { name: 'linkedin.png', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' }
];

const destDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

logos.forEach(logo => {
    const file = fs.createWriteStream(path.join(destDir, logo.name));
    https.get(logo.url, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);
            console.log(`✅ Downloaded: ${logo.name}`);
        } else {
            console.error(`❌ Failed: ${logo.name} (Status: ${response.statusCode})`);
        }
    }).on('error', (err) => {
        console.error(`🔥 Error: ${logo.name}`, err.message);
    });
});
