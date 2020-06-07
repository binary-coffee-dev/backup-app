const fs = require('fs');
const path = require('path');

function main() {
    const {Storage} = require('@google-cloud/storage');

    const keyFile = path.join(__dirname, 'store-key.json');
    const storage = new Storage({keyFilename: keyFile, projectId: 'eternal-psyche-279612'});

    const bucketsList = {
        databases: 'bc-database-backup',
        images: 'bc-images-backup'
    };

    async function uploadFiles(bucketName, files) {
        const [buckets] = await storage.getBuckets();
        const mark = new Set();
        buckets.forEach(b => mark.add(b.id));
        if (mark.has(bucketName)) {
            for (let file of files) {
                await storage.bucket(bucketName).upload(file, {
                    gzip: true,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                    },
                });
            }
        }
    }

    async function uploadBackups() {
        const databases = fs.readdirSync(process.env['COMPRESS_FILES_PATH']).filter(file => file.startsWith('backups.'));
        const images = fs.readdirSync(process.env['COMPRESS_FILES_PATH']).filter(file => file.startsWith('images.'));

        if (databases.length > 0) {
            databases.sort();
            const databasesBackupPath = path.join(process.env['COMPRESS_FILES_PATH'], databases[databases.length - 1]);
            await uploadFiles(bucketsList.databases, [databasesBackupPath]);
        }

        if (images.length > 0) {
            images.sort();
            const imagesBackupPath = path.join(process.env['COMPRESS_FILES_PATH'], images[images.length - 1]);
            await uploadFiles(bucketsList.images, [imagesBackupPath]);
        }
    }

    uploadBackups().catch(console.error);
}

main(...process.argv.slice(2));
