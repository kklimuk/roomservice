# RoomService
## Getting Started
1. Clone this repository.
2. Setup virtual environment for python in the local repo:
    - If you don't have `virtualenv`, then first do `pip install virtualenv`.
    - `virtualenv env/`
    - `source env/bin/activate` - this will enter the virtual environment
3. Install the packages:
    - `pip install -r requirements.txt`
    - Flask-Sockets might fail on Mac because the new clang compiler is weird. Use this to install:
        - `ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future pip install Flask-Sockets`
4. Launch the server:
    - `python server.py`

## Super Useful Readings to Have Open While Developing
I realize it is a desperate time when we have to read the spec. But since the techs are so new, it's actually pretty handy to do that.

### WebRTC
- [WebRTC Spec (with Examples)](http://dev.w3.org/2011/webrtc/editor/webrtc.html#examples-and-call-flows)
- [Getting Started with WebRTC](http://www.html5rocks.com/en/tutorials/webrtc/basics/)
- [Working with DataChannels](http://www.html5rocks.com/en/tutorials/webrtc/datachannels/)

### WebSockets
- [WebSockets Spec](http://dev.w3.org/html5/websockets/)
- [Introducing WebSockets](http://www.html5rocks.com/en/tutorials/websockets/basics/)
