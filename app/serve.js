var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server);

var proc = require('child_process');


io.on('connection', socket => {
	
	bindEvents(socket);
});


function bindEvents(socket) {
	socket._process = createProcess();
	socket.on('disconnect', destroyProcess.bind(socket));
	socket.on('client.req', reqData => {
		console.log('Requesting: ', reqData);
		socket._process.stdin.write(reqData + "\n");
	});
	socket._process.stdout.on('data', (stdOut, stdErr) => {
		stdOut = stdOut.toString();
		console.log('Output: ', stdOut, stdErr);
		socket.emit('server.res', stdOut);
	});

	socket._process.stderr.on('data', stdOut => {
		stdOut = stdOut.toString();
		console.log('Output Error: ', stdOut);
		socket.emit('server.res.error', stdOut);
	});

	socket._process.on('close', code => {
		console.log(`child process exited with code ${code}`);
	});

	console.log(socket._process.stdout);


}

function createProcess() {
	return proc.spawn('bash');
}

function destroyProcess(socket) {
	console.log('destory::', socket);
	this._process.stdin.end();
}

app.use(express.static(__dirname + '/../'));
server.listen(3000,'0.0.0.0');