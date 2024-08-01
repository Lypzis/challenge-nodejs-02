import { Readable } from 'node:stream';

class OneToHundredStream extends Readable {
  index = 1;

  // method from Readable
  _read() {
    const i = this.index++;

    setTimeout(() => {
      if (i > 5) {
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

(async () => {
  const res = await fetch('http://localhost:3334', {
    method: 'POST',
    body: new OneToHundredStream(),
    duplex: 'half',
  });

  const data = await res.text();
  console.log(data);
})();
