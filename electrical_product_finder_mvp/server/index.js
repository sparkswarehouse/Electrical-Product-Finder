
// Optional placeholder backend for future live API mode.
// Run with: npm run server
import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, {"content-type":"application/json"});
    res.end(JSON.stringify({ ok: true, service: "electrical-product-finder" }));
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 8787, () => {
  console.log("API placeholder running on port", process.env.PORT || 8787);
});
