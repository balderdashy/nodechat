exports.message = function(client, message){
	client.send(message);
}

exports.broadcast = function(io, message){
	io.sockets.send(message);
}
