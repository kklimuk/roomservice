import json

from flask import Flask, send_from_directory
from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler


app = Flask(__name__)
sockets = Sockets(app)


@app.route('/')
@app.route('/<room_id>')
def index(room_id=None):
	return send_from_directory('./static/html', 'index.html')


rooms = {}
@sockets.route('/rooms/')
@sockets.route('/rooms/<room_id>')
def room_id(socket, room_id='/'):
	# tell the joining user if they start the room
	if room_id not in rooms:
		rooms[room_id] = set()
		socket.send(json.dumps({
			'type': 'initiator',
			'data': True
		}))
	else:
		socket.send(json.dumps({
			'type': 'initiator',
			'data': False
		}))

	# inform all of the other people in the room about a join (if any)
	for person in rooms[room_id]:
		person.send(json.dumps({
			'type': 'join',
			'data': 'a wild one has joined the room'
		}))
	rooms[room_id].add(socket)

	# listen for messages from the socket and rebroadcast them to the room
	while True:
		message = socket.receive()
		print message, socket
		for person in rooms[room_id]:
			if person != socket:
				try:
					person.send(message)
				except Exception, e:
					rooms[room_id].remove(person)


if __name__ == '__main__':
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()