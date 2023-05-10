const path = require('path');

const cron = require('node-cron');
const childProcess = require('child_process');

require('dotenv').config();

async function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        let invoked = false;

        const process = childProcess.fork(scriptPath);

        process.on('error', function (err) {
            if (invoked) return;
            invoked = true;
            reject(err);
        });

        process.on('exit', function (code) {
            if (invoked) return;
            invoked = true;
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('exit code ' + code));
            }
        });
    });
}

const scriptPaths = {
    backupDatabase: path.join(__dirname, 'scripts', 'backup-database.js'),
    compress: path.join(__dirname, 'scripts', 'compress-files.js'),
    upload: path.join(__dirname, 'scripts', 'upload.js')
};

async function executeBackup() {
    await runScript(scriptPaths.backupDatabase);
    console.log(`Database backup were successful at ${new Date()}`);

    await runScript(scriptPaths.compress);
    console.log(`Files were successful compressed at ${new Date()}`);

    await runScript(scriptPaths.upload);
    console.log(`Files were uploaded successful at ${new Date()}`);
}

// Save information every day at 0:10 of the morning
cron.schedule("10 0 * * *", function () {
    console.log("Running daily backup");
    executeBackup().catch(err => console.error(err));
});

const jwt = require('jsonwebtoken');
const http = require('http');

const secret = process.env.SECRET || 'asdfasdf';

const server = http.createServer((req, res) => {
    const {url, method} = req;
    let resBody = 'Invalid credentials';
    res.setHeader('Content-Type', 'text/plain');
    console.log(`${method}: ${url}`);
    if (url === '/backup' && method === 'POST') {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const tokenInfo = jwt.verify(token, secret);
            if (tokenInfo.role === 'administrator') {
                console.log("Running manual backup");
                return executeBackup().then(() => {
                    res.statusCode = 200;
                    res.end('Backup is done');
                }).catch(err => {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('Error running the backup');
                });
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        resBody = 'Not valid url';
    }
    res.statusCode = 401;
    res.end(resBody);
});

const port = process.env.SERVICE_PORT || 6000;
server.listen(port, () => {
    console.log(`Backup service is running in port: ${port}`);
});
