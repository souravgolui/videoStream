const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
var ffmpeg = require('fluent-ffmpeg');

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.htm'))
})

app.get('/video/:filename', function(req, res) {
  const path = `assets/${req.params.filename}.mp4`;
 
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.get('/upload_video', (req, res) => {
  const path =  __dirname;
  try{
    ffmpeg(path+'/assets/sample.mp4')
    .output('screenshot.png')
    .noAudio()
    .seek('3:00')

    .output('small.mp4')
    .audioCodec('copy')
    .size('320x200')

    .output('big.mp4')
    .audioCodec('copy')
    .size('640x480')

    .on('error', function(err) {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing finished !');
    })
    .run();

  } catch(error) {
    throw err;
  }
});

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})