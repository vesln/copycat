function app(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(new Date + ' ' + Math.random());
}

module.exports = function(hydro) {
  hydro.set({
    suite: 'copycat',
    formatter: 'hydro-dot',
    plugins: [ 'hydro-minimal', 'hydro-http-server' ],
    tests: [ 'test/*.js' ],
    httpServer: {
      app: app,
      port: 5005,
    }
  });
};
