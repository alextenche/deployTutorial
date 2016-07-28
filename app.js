'use strict';

var http = require('http');

// var hostname = '127.0.0.1';
var port = process.env.PORT || 1337;

http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('app deployed !\n');
}).listen(port, function(){
  console.log('server running at http://deploy_tutorial:' + port);
});
