const fs = require("fs");
const path = require("path");

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

function removeFilesStartWith(filePrefix, directory) {
    const filesNames = fs.readdirSync(path.join(directory));
    const files = filesNames
        .filter(f => f !== '.gitkeep')
        .filter(f => f.startsWith(filePrefix))
        .map(file => path.join(directory, file));
    files.forEach(f => fs.unlinkSync(f));
}

module.exports = {getTimeFormat, removeFilesStartWith};
