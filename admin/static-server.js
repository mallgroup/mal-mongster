var finalHandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

// Serve up public/ftp folder
var serve = serveStatic('dist/spa', { 'index': ['index.html'] })

// Create server
var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalHandler(req, res))
})

// Listen
server.listen(80)
