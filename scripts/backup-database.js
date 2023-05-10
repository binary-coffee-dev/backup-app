const path = require('path');
const mysqldump = require('mysqldump');

const {getTimeFormat, removeFilesStartWith} = require('./utils');

const rootPath = path.join(__dirname, '..');
const config = {
    databaseName: process.env.DATABASE_NAME || 'blog',
    databasePort: process.env.DATABASE_PORT || 3306,
    databaseHost: process.env.DATABASE_HOST || 'localhost',
    databaseUser: process.env.DATABASE_USER || 'root',
    databasePassword: process.env.DATABASE_PASSWORD || 'password',
};

async function execute() {
    await removeFilesStartWith('database.backup.', path.join(rootPath, 'compress_files'));

    const backupFileName = path.join(rootPath, 'compress_files', `database.backup.${config.databaseName}.${getTimeFormat()}.sql`);
    await mysqldump({
        connection: {
            host: config.databaseHost,
            port: config.databasePort,
            user: config.databaseUser,
            password: config.databasePassword,
            database: config.databaseName,
        },
        dumpToFile: backupFileName,
        compressFile: false,
    });
}

execute().then();
