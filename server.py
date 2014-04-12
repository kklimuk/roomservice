import json

from flask import Flask, send_from_directory, render_template
from flask_sockets import Sockets
from uuid import uuid4 as uuid

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket.exceptions import WebSocketError


app = Flask(__name__)
sockets = Sockets(app)

rooms = {}

@app.route('/')
def home():	
	return render_template('home.html', rooms=rooms)
@app.route('/<room_id>')
def index(room_id=None):
	return send_from_directory('./static/html', 'index.html')


@sockets.route('/rooms/')
@sockets.route('/rooms/<room_id>')
def room_id(socket, room_id='/'):
	# clean up the room
	if room_id not in rooms:
		rooms[room_id] = set()

	# create unique id
	uid = str(uuid())

	# inform all of the other people in the room about a join (if any)
	for person in rooms[room_id]:
		try:
			person[1].send(json.dumps({
				'type': 'join',
				'data': uid
			}))
		except WebSocketError:
			continue

	# send the unique ids for the joining node
	socket.send(json.dumps({
		'type': 'joined',
		'data': {
			'id': uid,
			'nodes': [ person[0] for person in rooms[room_id] ]
		}
	}))

	# add joining node to room
	node = (uid, socket)
	rooms[room_id].add(node)

	# listen for messages from the socket and rebroadcast them to the room
	while True:
		message = socket.receive()
		if message is None:
			rooms[room_id].remove(node)
			break

		decoded = json.loads(message)
		for person in rooms[room_id]:
			if 'target' in decoded:
				if decoded['target'] == person[0]:
					person[1].send(message)
					break
			else:
				if person[1] != socket:
					try:
						person[1].send(message)
					except WebSocketError:
						continue


if __name__ == '__main__':
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()