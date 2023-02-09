import http from "node:http";

import { routes } from "./routes.js";
import { extractQueryParams } from "./utils/extract-query-params.js";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  const route = routes.find(
    (route) =>
      route.method === method && (route.path === url || route.path.test(url))
  );

  if (route) {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    console.log({ query, params });

    req.query = query ? extractQueryParams(query) : {};
    req.params = params;
    req.content = Buffer.concat(buffers);

    try {
      req.body = JSON.parse(Buffer.concat(buffers).toString());
    } catch {
      req.body = null;
    }

    res.setHeader("Content-Type", "application/json");

    return route.handler(req, res);
  }

  return res.writeHead(404).end('{"error": "Not found"}');
});

server.listen(3000);
