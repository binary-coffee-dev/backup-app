const fs = require('fs');
const path = require('path');

const archiver = require('archiver');
const {getTimeFormat, removeFilesStartWith} = require('./utils');

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

async function createImagesZIP() {
    const filesNames = fs.readdirSync(path.join(rootPath, 'images'));
    const files = filesNames.filter(f => f !== '.gitkeep')
      .map(file => path.join(rootPath, 'images', file));
    const imagesBackupName = `images.backup.${getTimeFormat()}.zip`;
    await compressFiles(files, path.join(rootPath, 'compress_files', imagesBackupName));
}

async function createBackupZIP() {
    const filesNames = fs.readdirSync(path.join(rootPath, 'compress_files'));
    const fileName = filesNames
      .filter(f => f !== '.gitkeep')
      .filter(f => f.endsWith('.sql'))
      .filter(f => f.startsWith('database.backup'))[0];
    const filePath = path.join(rootPath, 'compress_files', fileName);
    const compressedFilePath = path.join(rootPath, 'compress_files', `${fileName}.zip`);
    if (fs.existsSync(compressedFilePath)) {
        fs.unlinkSync(compressedFilePath);
    }
    await compressFiles([filePath], compressedFilePath);
    fs.unlinkSync(path.join(rootPath, 'compress_files', fileName));
}

async function main() {
    await removeFilesStartWith('images.', path.join(rootPath, 'compress_files'));
    await createImagesZIP();
    await createBackupZIP();
}

main().then();
