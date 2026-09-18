# Tic-Tac-Toe - PvP deploy Render

## Stack
- Frontend: `static/`
- PVP client: `static/client.js` (Socket.IO)
- Backend: `static/server.py` (aiohttp + python-socketio)
- HTTP + Socket.IO share the same Render port.

## Local
```bash
pip install -r requirements.txt
python static/server.py
```
Open `http://localhost:10000`.

## Render
- Build: `pip install -r requirements.txt`
- Start: `python static/server.py`
- Render supplies `PORT`; the server listens on `0.0.0.0`.

After deploy, open the Render URL on both devices. Player 1 creates a room; Player 2 joins with the 6-character room ID.
