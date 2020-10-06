const googleCreds = require('./config/google-key.json');
const config = require('./config/config.json');
const parse = require('./parse.js')(googleCreds, config.spreadsheet);
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const readChunk = require('read-chunk')
const fileType = require('file-type')
let data;

(async () => {
    data = await parse.updateData();
    console.log('Ready!');
    fs.writeFile('latest.json', JSON.stringify(data), (err) => {
        if (err) {
            console.log(err);
        }
    })
})();

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/usercontent_cache/:filename', async function (req, res) {
    const filePath = path.join('./usercontent_cache/', req.params.filename);
    const buffer = readChunk.sync(filePath, 0, 4100);
    const storedMimeType = await fileType.fromBuffer(buffer);
    if (storedMimeType) {
        res.setHeader('Content-Type', storedMimeType.mime);
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.status(404).end();
    }
});

app.get('/', async function (req, res) {
    /*
    let startTime = new Date().getTime();
    data = await parse.updateData(); 
    console.log('Refreshed data in ' + (new Date().getTime() - startTime) + 'ms !')
    */
    res.render('test', {
        data: data
    });
});

app.listen(process.env.PORT || 80);