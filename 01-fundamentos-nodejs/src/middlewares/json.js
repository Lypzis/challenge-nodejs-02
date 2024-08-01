const json = async (req, res) => {
  const buffers = [];

  // reads the entire body of the request
  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    // parse the body to the js
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch (err) {
    req.body = null;
  }

  // data will always be sent in json from this middleware
  res.setHeader('Content-type', 'application/json');
};

export default json;
