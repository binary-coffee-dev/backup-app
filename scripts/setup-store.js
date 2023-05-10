const path = require('path');

const rootPath = path.join(__dirname, '..');

function main() {
    const {Storage} = require('@google-cloud/storage');

    const keyFile = path.join(rootPath, 'store-key.json');
    const storage = new Storage({keyFilename: keyFile, projectId: 'eternal-psyche-279612'});

    const bucketsList = [
        'bc-database-backup',
        'bc-images-backup'
    ];

    async function createBuckets() {
        const [buckets] = await storage.getBuckets();
        const mark = new Set();
        buckets.forEach(b => mark.add(b.id));
        for (let b of bucketsList) {
            if (!mark.has(b)) {
                await storage.createBucket(b);
            }
        }
    }

    createBuckets().catch(console.error);
}

main(...process.argv.slice(2));
