const fs = require('fs');
const express = require('express');

const app = express();

app.use(require('cors')());
app.use(express.static('public'));

app.get('/pdf', (req, res) => {
  const path = './public/long-sample.pdf';
  const stat = fs.statSync(path);
  const fileSize = stat.size;

  const options = { length: fileSize, headers: req.headers };
  const rangeRequest = req.range(options);

  if (!rangeRequest) {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'application/pdf; charset=UTF-8',
    };
    res.writeHead(206, head);
    fs.createReadStream(path).pipe(res);
  } else {
    const start = rangeRequest[0].start;
    const end = rangeRequest[0].end;
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
  }
});

app.listen(7000, () => console.log('ranger server started'));