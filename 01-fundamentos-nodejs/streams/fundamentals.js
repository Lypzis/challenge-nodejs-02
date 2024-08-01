// Netflix & Spotfy - Writable Streams

// Importação de clientes via CSV (Excel)
// 1gb - 1.000.000 linhas
// POST  /upload import.csv

// 10mb/s - 100s

// 100s => db insertion

// 10mb/s - 10.000 linhas

// Stream - files can be read while being uploaded - Readable Streams

// Streams => everything incoming (stdin - read) is being output (stdout - write)
// process.stdin.pipe(process.stdout);

import { Readable, Writable, Transform } from 'node:stream';

class OneToHundredStream extends Readable {
  index = 1;

  // method from Readable
  _read() {
    const i = this.index++;

    setTimeout(() => {
      if (i > 100) {
        this.push(null); // null, means,  nothing else left to send
      } else {
        // Convert i to Buffer
        const buf = Buffer.from(String(i));

        // will output a Buffer 'buf'(the i) every second
        this.push(buf);
      }
    }, 1000);
  }
}

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(-chunk.toString()); // to negative number

    // first param is error, second is the Buffer data
    callback(null, Buffer.from(String(transformed)));
  }
}

class MultiplyByTenStream extends Writable {
  // method from Writable
  // chunk => a buffer incoming from the 'push'
  _write(chunk, encoding, callback) {
    // chunk converted back to String then to Number * 10
    // to be written :D
    console.log(Number(chunk.toString()) * 10);

    callback();
  }
}

// new OneToHundredStream().pipe(process.stdout);
new OneToHundredStream()
  .pipe(new InverseNumberStream())
  .pipe(new MultiplyByTenStream());
