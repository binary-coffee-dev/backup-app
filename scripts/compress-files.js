const fs = require('fs');
const path = require('path');

const archiver = require('archiver');

const rootPath = path.join(__dirname, '..');

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

async function createZIP(folderName, prefixName) {
    const filesNames = fs.readdirSync(path.join(rootPath, folderName));
    const files = filesNames.filter(f => f !== '.gitkeep').map(file => path.join(rootPath, folderName, file));
    const imagesBackupName = `${prefixName}.${getTimeFormat()}.zip`;
    await compressFiles(files, path.join(rootPath, 'compress_files', imagesBackupName));
}

async function createImagesZIP() {
    await createZIP('images', 'images');
}

async function createBackupZIP() {
    await createZIP('backups', 'backups');
}

function cleanOldBackups() {
    const filesNames = fs.readdirSync(path.join(rootPath, 'compress_files'));
    const files = filesNames.filter(f => f !== '.gitkeep').map(file => path.join(rootPath, 'compress_files', file));
    files.forEach(f => fs.unlinkSync(f));
}

async function main() {
    await cleanOldBackups();
    await createImagesZIP();
    await createBackupZIP();
}

main().then();
