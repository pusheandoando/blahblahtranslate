// download-lib.js
const fs = require('fs');
const path = require('path');
const https = require('https');





const LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/google-translate-unofficial/dist/google-translate-unofficial.global.js';
const DESTINATION = path.join(__dirname, 'blahblahtranslate', 'lib', 'google-translate-unofficial.global.js');
const MAX_REDIRECTS = 5;





function download(url, redirectsLeft) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const { statusCode, headers } = response;

            if (statusCode >= 300 && statusCode < 400 && headers.location) {
                response.resume();

                if (redirectsLeft === 0) {
                    reject(new Error('Too many redirects'));
                    return;
                }

                resolve(download(new URL(headers.location, url).toString(), redirectsLeft - 1));
                return;
            }

            if (statusCode !== 200) {
                response.resume();

                reject(new Error('HTTP ' + statusCode));
                return;
            }

            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        })
            .on('error', reject);
    });
}


async function main() {
    const content = await download(LIBRARY_URL, MAX_REDIRECTS);

    if (content.length === 0) {
        throw new Error('Downloaded file is empty');
    }

    fs.mkdirSync(path.dirname(DESTINATION), { recursive: true });
    fs.writeFileSync(DESTINATION, content);
    console.log('Library saved to ' + DESTINATION);
}





main().catch((error) => {
    console.error('Download failed: ' + error.message);
    process.exit(1);
});