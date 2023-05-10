const fs = require('fs');
const path = require('path');

const archiver = require('archiver');

async function compressAction(compressFile, actions) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(compressFile);
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        actions(archive);

        archive.finalize();
    });
}

async function compressFiles(files, compressFile) {
    if (files) {
        return compressAction(compressFile, (archive) => {
            for (let file of files) {
                archive.append(fs.createReadStream(file), {name: path.basename(file)});
            }
        });
    }
    return Promise.reject();
}

async function compressDir(dir, compressFile) {
    if (dir) {
        return compressAction(compressFile, (archive) => {
            archive.directory(dir, false);
        });
    }
    return Promise.reject();
}

function fillWithZero(number, size) {
    let str = number + '';
    while (str.length < size) {
        str = '0' + str;
    }
    return str;
}

function getTimeFormat() {
    const now = new Date();
    return `${now.getFullYear()}.${fillWithZero(now.getMonth() + 1, 2)}.${fillWithZero(now.getDate(), 2)}.${fillWithZero(now.getTime(), 15)}`
}

async function createImagesZIP() {
    const files = fs.readdirSync(path.join(__dirname, 'images'));
    const images = [];
    files.forEach(file => images.push(path.join(__dirname, 'images', file)));
    const imagesBackupName = `images.${getTimeFormat()}.zip`;
    await compressFiles(images, path.join(__dirname, 'compress_files', imagesBackupName));
}

async function createBackupZIP() {
    const dirs = fs.readdirSync(path.join(__dirname, 'backups'));
    dirs.sort();
    const lastBackup = path.join(__dirname, 'backups', dirs[dirs.length - 1]);
    const databaseBackupName = `backups.${getTimeFormat()}.zip`;
    await compressDir(lastBackup, path.join(__dirname, 'compress_files', databaseBackupName))
}

function main() {
    createImagesZIP();
    createBackupZIP();
}

main();
