#!/usr/bin/env python3
"""Tic-Tac-Toe server: HTTP frontend + Socket.IO PvP on the same port."""

import asyncio
import logging
import os
from pathlib import Path

import socketio
from aiohttp import web

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
BOARD_SIZE = 15
WIN_LENGTH = 5

# In-memory rooms. Fine for a classroom/demo deployment.
rooms = {}

sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins='*',
)
app = web.Application()
sio.attach(app)


def create_empty_board():
    return [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]


def check_winner(board, row, col, symbol):
    directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
    for dr, dc in directions:
        count = 1
        r, c = row + dr, col + dc
        while 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE and board[r][c] == symbol:
            count += 1
            r += dr
            c += dc

        r, c = row - dr, col - dc
        while 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE and board[r][c] == symbol:
            count += 1
            r -= dr
            c -= dc

        if count >= WIN_LENGTH:
            return True
    return False


def is_board_full(board):
    return all(cell is not None for row in board for cell in row)


def find_player(room, sid):
    for index, player in enumerate(room['players']):
        if player['id'] == sid:
            return index, player
    return None, None


@sio.event
async def connect(sid, environ):
    logger.info('Client connected: %s', sid)


@sio.event
async def disconnect(sid):
    logger.info('Client disconnected: %s', sid)

    for room_id, room in list(rooms.items()):
        index, _ = find_player(room, sid)
        if index is None:
            continue

        room['players'].pop(index)
        if room['players']:
            room['game_started'] = False
            await sio.emit(
                'player_left',
                {
                    'message': 'Đối thủ đã rời khỏi phòng!',
                    'room_id': room_id,
                },
                room=room_id,
            )
        else:
            del rooms[room_id]
            logger.info('Removed empty room: %s', room_id)
        break


@sio.event
async def create_room(sid, data):
    data = data or {}
    room_id = str(data.get('room_id', '')).strip().upper()
    player_name = str(data.get('player_name', 'Player')).strip() or 'Player'

    if not room_id:
        await sio.emit('error', {'message': 'Room ID is required'}, to=sid)
        return
    if room_id in rooms:
        await sio.emit('error', {'message': f'Phòng {room_id} đã tồn tại!'}, to=sid)
        return

    rooms[room_id] = {
        'players': [{'id': sid, 'name': player_name, 'symbol': 'X'}],
        'board': create_empty_board(),
        'current_turn': 0,
        'game_started': False,
    }
    await sio.enter_room(sid, room_id)
    await sio.emit(
        'room_created',
        {
            'room_id': room_id,
            'symbol': 'X',
            'message': f'🏠 Phòng {room_id} đã được tạo! Đang chờ đối thủ...',
        },
        to=sid,
    )
    logger.info('Room created: %s by %s', room_id, player_name)


@sio.event
async def join_room(sid, data):
    data = data or {}
    room_id = str(data.get('room_id', '')).strip().upper()
    player_name = str(data.get('player_name', 'Player')).strip() or 'Player'

    if not room_id:
        await sio.emit('error', {'message': 'Room ID is required'}, to=sid)
        return
    if room_id not in rooms:
        await sio.emit('error', {'message': f'Không tìm thấy phòng {room_id}!'}, to=sid)
        return

    room = rooms[room_id]
    if len(room['players']) >= 2:
        await sio.emit('error', {'message': f'Phòng {room_id} đã đầy!'}, to=sid)
        return

    room['players'].append({'id': sid, 'name': player_name, 'symbol': 'O'})
    room['game_started'] = True
    room['current_turn'] = 0
    await sio.enter_room(sid, room_id)

    await sio.emit(
        'room_joined',
        {'room_id': room_id, 'symbol': 'O', 'message': f'🚪 Đã tham gia phòng {room_id}!'},
        to=sid,
    )

    creator = room['players'][0]
    await sio.emit(
        'opponent_joined',
        {'message': f'🎉 {player_name} đã tham gia! Trận đấu sắp bắt đầu...'},
        to=creator['id'],
    )

    await asyncio.sleep(0.5)
    await sio.emit(
        'game_start',
        {
            'message': f'🎮 Trận đấu bắt đầu! {creator["name"]} (X) đi trước',
            'current_player': 'X',
            'players': {'X': creator['name'], 'O': player_name},
        },
        room=room_id,
    )
    logger.info('Game started: %s (%s) vs %s (%s)', creator['name'], 'X', player_name, 'O')


@sio.event
async def make_move(sid, data):
    data = data or {}
    room_id = str(data.get('room_id', '')).strip().upper()

    if room_id not in rooms:
        await sio.emit('error', {'message': 'Không tìm thấy phòng!'}, to=sid)
        return

    room = rooms[room_id]
    player_index, player = find_player(room, sid)
    if player is None:
        await sio.emit('error', {'message': 'Không tìm thấy người chơi!'}, to=sid)
        return

    if len(room['players']) < 2 or not room['game_started']:
        await sio.emit('error', {'message': 'Game chưa bắt đầu!'}, to=sid)
        return

    if player_index != room['current_turn']:
        await sio.emit('error', {'message': 'Chưa đến lượt bạn!'}, to=sid)
        return

    try:
        row = int(data.get('row'))
        col = int(data.get('col'))
    except (TypeError, ValueError):
        await sio.emit('error', {'message': 'Vị trí nước đi không hợp lệ!'}, to=sid)
        return

    if not (0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE):
        await sio.emit('error', {'message': 'Vị trí nước đi không hợp lệ!'}, to=sid)
        return
    if room['board'][row][col] is not None:
        await sio.emit('error', {'message': 'Ô đã được chọn!'}, to=sid)
        return

    symbol = player['symbol']
    room['board'][row][col] = symbol

    if check_winner(room['board'], row, col, symbol):
        room['game_started'] = False
        await sio.emit(
            'game_over',
            {
                'winner': player['name'],
                'symbol': symbol,
                'row': row,
                'col': col,
                'message': f'🎉 {player["name"]} ({symbol}) thắng!',
            },
            room=room_id,
        )
    elif is_board_full(room['board']):
        room['game_started'] = False
        await sio.emit(
            'game_over',
            {
                'winner': None,
                'symbol': symbol,
                'row': row,
                'col': col,
                'message': '🤝 Hòa!',
            },
            room=room_id,
        )
    else:
        room['current_turn'] = 1 - room['current_turn']
        next_player = room['players'][room['current_turn']]
        await sio.emit(
            'move_made',
            {
                'row': row,
                'col': col,
                'symbol': symbol,
                'current_player': next_player['symbol'],
                'message': f'{next_player["name"]} ({next_player["symbol"]}) lượt đi',
            },
            room=room_id,
        )


@sio.event
async def restart_game(sid, data):
    data = data or {}
    room_id = str(data.get('room_id', '')).strip().upper()

    if room_id not in rooms:
        await sio.emit('error', {'message': 'Không tìm thấy phòng!'}, to=sid)
        return

    room = rooms[room_id]
    if len(room['players']) < 2:
        await sio.emit('error', {'message': 'Cần đủ 2 người chơi để chơi lại!'}, to=sid)
        return

    room['board'] = create_empty_board()
    room['current_turn'] = 0
    room['game_started'] = True

    # Keep the original project's replay behavior: swap X/O.
    for player in room['players']:
        player['symbol'] = 'O' if player['symbol'] == 'X' else 'X'

    first_player = room['players'][0]
    await sio.emit(
        'game_restarted',
        {
            'message': f'🔄 Chơi lại! {first_player["name"]} ({first_player["symbol"]}) đi trước',
            'current_player': first_player['symbol'],
            'players': {p['symbol']: p['name'] for p in room['players']},
        },
        room=room_id,
    )


async def health(request):
    return web.json_response({'status': 'ok', 'rooms': len(rooms)})


app.router.add_get('/health', health)
app.router.add_static('/', path=BASE_DIR, index='index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '10000'))
    logger.info('HTTP + Socket.IO server listening on 0.0.0.0:%s', port)
    web.run_app(app, host='0.0.0.0', port=port)
