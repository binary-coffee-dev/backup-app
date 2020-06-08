const path = require('path');

const cron = require('node-cron');
const childProcess = require('child_process');

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
    compress: path.join(__dirname, 'compress-files.js'),
    upload: path.join(__dirname, 'upload.js')
};

// Save information every day at 0:10 of the morning
cron.schedule("0 10 0 * * *", function () {
    console.log("running a task every minute");
    runScript(scriptPaths.compress)
        .then(() => {
            console.log(`compress files successful at ${new Date()}`);
            return runScript(scriptPaths.upload);
        })
        .then(() => {
            console.log(`files were uploaded successful at ${new Date()}`);
        })
        .catch(err => {
            console.error(err);
        })
});
