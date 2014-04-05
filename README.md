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
