import http from 'node:http';
import { Transform } from 'node:stream';

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(-chunk.toString()); // to negative number

    console.log(transformed);

    // first param is error, second is the Buffer data
    callback(null, Buffer.from(String(transformed)));
  }
}

// req => ReadableStream
// res => WriteableStream

const server = http.createServer(async (req, res) => {
  const buffers = [];

  // for with await :D
  // stream needs to be finished(all data) before continuing the code
  for await (const chunk of req) {
    buffers.push(chunk);
  }

  // partial data is only good for movies, music...

  const fullStreamContent = Buffer.concat(buffers).toString();

  console.log(fullStreamContent);

  return res.end(fullStreamContent);

  //   return req.pipe(new InverseNumberStream()).pipe(res);
});

server.listen(3334);
