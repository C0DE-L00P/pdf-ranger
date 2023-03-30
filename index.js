const range = require('range-parser');
const fs = require('fs');
const express = require('express');
const app = express();

app.use(require('cors')())
app.use(express.static('public'))

app.get('/pdf', (req, res) => {
    console.log(req.range())
  const path = './public/long-sample.pdf';
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const rangeRequest = req.headers.range;
  if (rangeRequest) {
    const parts = range(fileSize, rangeRequest);
    if (parts === -1) {
      res.status(416).send('Requested range not satisfiable');
      return;
    }
    const start = parts[0].start;
    const end = parts[0].end;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/pdf; charset=UTF-8',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'application/pdf; charset=UTF-8',
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(7000, ()=> console.log('ranger server started'))