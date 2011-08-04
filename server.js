/**
 *   Dependencies

# Database
mongodb (http://www.mongodb.org/)

# Client libraries
backbone
underscore

# Node modules
npm install express
npm install socket.io
npm install mongoose
npm install backbone
npm install underscore
npm install googlemaps
 *
 */

// load npm libraries
var http = require('http'),
	io = require('socket.io'),
	_ = require('underscore'),
	googlemaps = require('googlemaps');

// load application modules
var database = require('./database'),
	routes = require('./routes'),
	server = routes.server,
	config = require('./config'),
	logger = require('./logger');

// Set up
io = io.listen(server);

// load server components
var	auth = require('./auth'),
	location = require('./location'),
	chat = require('./chat'),
	socketclient = require('./socketclient');

io.sockets.on('connection',function(client){
	
	client.on('message', function(message) {
		
		logger.log("received from socket:"+message);
		
		// understand json request 
		var request = "";
		try{ request = JSON.parse(message); }
		catch(e){ logger.log("Unable to parse request: "+ message); return; }
		if(!request.command) {
			logger.log("Invalid request: "+ message);  return;
		}
		
		// handle login
		if(request.command == "login") {
			logger.log("Logging in");
			auth.login(io,client,request);
		}
		// handle location check in
		else if(request.command == "checkin" && request.latlng ){
			logger.log("Checking in");
			location.checkin(io,client,request);
		}
		// handle message
		else if(request.command == "message") {
			logger.log("Message received");
			chat.talk(io,client,request);
		}
		
	});
	
	client.on('disconnect', function() { 
		// logout session when user disconnected
		database.get_user_session(client,function(session){
			if(session){
				// this is stupid.
				// TODO: Call logout_session when user logs out or based on timeout.
				database.logout_session(client, function(res){
					socketclient.broadcast(io,"<p style='color:red'>"+session.username+" is disconnected.</p>");
				});
			}
		});
		return;
	});
});

// accept interrupt broadcast
server.get('/meow/:msg', function(req,res) {
	if(req.params.msg){
		logger.log(JSON.stringify(req.params.msg));
		socketclient.broadcast(io,req.params.msg);
		res.send(JSON.stringify({status:"OK"}));
		
	}else{
		logger.log("/meow missing params");
		res.send(JSON.stringify({errors:"missing parameters"}));
	}

});

server.listen(config.serverPort);