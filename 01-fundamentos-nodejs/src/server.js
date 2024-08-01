// CommonJs => require
// ESModule => import/export
// type: "module" in package.json
import http from 'node:http';

import json from './middlewares/json.js';
import { routes } from './routes.js';
import { extractQueryParams } from './utils/extract-query-params.js';

// request/response
// http methods: GET, POST, PUT, PATCH, DELETE
// GET => Buscar recurso
// POST => Criar recurso
// PUT => Atualizar recurso
// PATCH => Atualizar recurso específico
// DELETE => Deletar recurso

// Stateful - saved in local memory / data is lost when app restarts
// Stateless - saved in external dbs or files... / data is consolidated

// JSON - Javascript Object Notation

// Headers (req/res) => metadata

// HTTP status code

// types of data sent from frontend:
// Query parameters : URL stateful => filters, pagination, optional : localhost:3333/users?userId=1&name=john
// Route parameters : Resource Identifier : localhost:3333/users/1
// Request body : Form Data (HTTPS) : localhost:3333/users

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // req keeps reference
  await json(req, res);

  const route = routes.find(
    route => route.method === method && route.path.test(url)
  );

  if (route) {
    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    req.params = params;
    req.query = query ? extractQueryParams(query) : {};

    return route.handler(req, res);
  }

  // escape route, route not found
  return res.writeHead(404).end();
});

// localhost port 3333
server.listen(3333);
