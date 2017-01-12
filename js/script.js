var terminal = $('#terminal'),
	editor = $('#editor'),
	out = $('#output'),
	prefixer = $('#prefix'),
	myHistory = [];
	myHistory.currentIndex = 1;

var socket = io.connect("http://localhost:3000");

prefixer.text('> ');
terminal.mousedown(function(e) {
	// editor.focus();
});

editor.on('keydown', function(e) {
	var keyCode = e.keyCode || e.which;
	var text = $(this).val();
	var prevent = true;
	if(keyCode == 13) {
		if(!text) return;
		appendInput(text);
		$(this).val("");
	} else if(keyCode == 38) {
		getPreviousHistory();
	} else if(keyCode == 40) {
		getNextHistory();
	} else if(keyCode == 27) {
		$(this).val("");
	} else {
		prevent = false;
	}
	if(prevent) {
		e.preventDefault();
	}
});

function getPreviousHistory() {
	var length = myHistory.length;
	var text = myHistory[length - myHistory.currentIndex];
	if(myHistory.currentIndex < length) {
		myHistory.currentIndex++;
	}
	editor.val(text);
}

function getNextHistory() {
	var length = myHistory.length;
	if(myHistory.currentIndex > 1) {
		myHistory.currentIndex--;
	}
	var text = myHistory[length - myHistory.currentIndex];
	editor.val(text);
}

socket.on('server.res', function(data) {
	appendOutput(data);
});

socket.on('server.res.error', function(data) {
	appendOutput(data, true);
});

function appendInput(text) {
	var el = $('<div />', {text: prefixer.text() +  text});
	out.append(el);
	myHistory.push(text);
	socket.emit('client.req', text);
}

function appendOutput(text, error) {
	text = text.split("\n").join("<br>");
	var el = $('<div />', {html:text});
	if(error) {
		el.css('color', '#F00');
	}
	out.append(el);
	terminal.animate({ scrollTop: terminal.get(0).scrollHeight }, 300);
}


// UI Options

$('.clear').click(function() {
	out.html("");
	editor.focus();
});
$('[data-action]').click(function() {
	appendInput($(this).data('action'));
	editor.focus();
});
