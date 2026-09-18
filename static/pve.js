const boardElement = document.getElementById('board');
const status = document.getElementById('status');
const modeElement = document.getElementById('mode');
const canvas = document.getElementById('win-line-canvas');
const ctx = canvas.getContext('2d');
const BOARD_SIZE = 15;
const PLAYER_X = 'X';
const PLAYER_O = 'O';
let currentPlayer = PLAYER_X;
let botIsX = false; // Người chơi là X ban đầu
const playerName = localStorage.getItem('playerName') || 'Người chơi';
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));

modeElement.textContent = 'PVE';

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('td');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
    // Điều chỉnh kích thước canvas để khớp với bàn cờ
    const tableRect = boardElement.getBoundingClientRect();
    canvas.width = tableRect.width;
    canvas.height = tableRect.height;
    canvas.style.left = `${tableRect.left}px`;
    canvas.style.top = `${tableRect.top}px`;
}

function handleCellClick(e) {
    const playerSymbol = botIsX ? PLAYER_O : PLAYER_X;
    if (currentPlayer !== playerSymbol) {
        status.textContent = 'Chưa đến lượt bạn!';
        return;
    }
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (board[row][col]) {
        console.log('Ô đã được chọn:', row, col);
        return;
    }

    makeMove(row, col, playerSymbol);
    if (!checkWinner(board, row, col, playerSymbol) && !isBoardFull()) {
        console.log('Người chơi đã đi, đến lượt bot');
        setTimeout(() => aiMove(), 500);
    } else {
        console.log('Trò chơi kết thúc sau nước đi của người chơi');
    }
}

function makeMove(row, col, player) {
    board[row][col] = player;
    updateBoard();
    const winInfo = checkWinner(board, row, col, player);
    if (winInfo) {
        status.textContent = `${player === (botIsX ? PLAYER_O : PLAYER_X) ? playerName : 'Máy'} (${player}) thắng!`;
        highlightWinningLine(winInfo);
        disableBoard();
    } else if (isBoardFull()) {
        status.textContent = 'Hòa!';
        disableBoard();
    } else {
        currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        status.textContent = `${playerName} (Lượt của ${currentPlayer === (botIsX ? PLAYER_O : PLAYER_X) ? `bạn (${botIsX ? PLAYER_O : PLAYER_X})` : `máy (${botIsX ? PLAYER_X : PLAYER_O})`})`;
    }
}

function updateBoard() {
    const cells = boardElement.getElementsByTagName('td');
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = cells[i * BOARD_SIZE + j];
            cell.textContent = board[i][j] || '';
            cell.className = board[i][j] ? board[i][j].toLowerCase() : '';
        }
    }
}

function disableBoard() {
    const cells = boardElement.getElementsByTagName('td');
    for (let cell of cells) {
        cell.removeEventListener('click', handleCellClick);
    }
}

function checkWinner(board, row, col, player) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let [dr, dc] of directions) {
        let count = 1;
        let start = [row, col];
        let end = [row, col];
        for (let i = 1; i < 5; i++) {
            let r = row + dr * i, c = col + dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                end = [r, c];
            } else {
                break;
            }
        }
        for (let i = 1; i < 5; i++) {
            let r = row - dr * i, c = col - dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
                start = [r, c];
            } else {
                break;
            }
        }
        if (count >= 5) {
            return { direction: [dr, dc], start, end };
        }
    }
    return null;
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== null));
}

function evaluateLine(count, openEnds, isBot) {
    if (count >= 5) return isBot ? 1000000 : -1000000;
    
    let score = 0;
    if (count === 4) {
        if (openEnds === 2) score = 100000;
        else if (openEnds === 1) score = 10000;
    } else if (count === 3) {
        if (openEnds === 2) score = 10000;
        else if (openEnds === 1) score = 100;
    } else if (count === 2) {
        if (openEnds === 2) score = 100;
        else if (openEnds === 1) score = 10;
    } else if (count === 1) {
        if (openEnds === 2) score = 10;
        else if (openEnds === 1) score = 1;
    }
    
    return isBot ? score : -score;
}

function evaluateBoard(board, botSymbol, playerSymbol) {
    let score = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === null) continue;
            
            const player = board[r][c];
            const isBot = player === botSymbol;
            
            for (let [dr, dc] of directions) {
                // To avoid over-counting, only evaluate if previous cell is NOT the same player
                let prevR = r - dr, prevC = c - dc;
                if (prevR >= 0 && prevR < BOARD_SIZE && prevC >= 0 && prevC < BOARD_SIZE && board[prevR][prevC] === player) {
                    continue; 
                }
                
                let count = 1;
                let openEnds = 0;
                
                if (prevR >= 0 && prevR < BOARD_SIZE && prevC >= 0 && prevC < BOARD_SIZE && board[prevR][prevC] === null) {
                    openEnds++;
                }
                
                let r1 = r + dr, c1 = c + dc;
                while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
                    count++;
                    r1 += dr;
                    c1 += dc;
                }
                
                if (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === null) {
                    openEnds++;
                }
                
                score += evaluateLine(count, openEnds, isBot);
            }
        }
    }
    return score;
}

function getCandidateMoves(board) {
    const moves = new Set();
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let hasPiece = false;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== null) {
                hasPiece = true;
                for (let [dr, dc] of directions) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
                        moves.add(`${nr},${nc}`);
                    }
                    let nnr = r + dr*2, nnc = c + dc*2;
                    if (nnr >= 0 && nnr < BOARD_SIZE && nnc >= 0 && nnc < BOARD_SIZE && board[nnr][nnc] === null) {
                        moves.add(`${nnr},${nnc}`);
                    }
                }
            }
        }
    }
    
    if (!hasPiece) return [[Math.floor(BOARD_SIZE/2), Math.floor(BOARD_SIZE/2)]];
    
    return Array.from(moves).map(str => {
        const [r, c] = str.split(',');
        return [parseInt(r), parseInt(c)];
    });
}

function minimax(board, depth, alpha, beta, isMaximizing, botSymbol, playerSymbol) {
    const score = evaluateBoard(board, botSymbol, playerSymbol);
    // If win/loss found or depth limit reached
    if (score >= 1000000 || score <= -1000000 || depth === 0) {
        return score;
    }
    
    const candidateMoves = getCandidateMoves(board);
    if (candidateMoves.length === 0) return 0; // Draw
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let move of candidateMoves) {
            board[move[0]][move[1]] = botSymbol;
            let currentEval = minimax(board, depth - 1, alpha, beta, false, botSymbol, playerSymbol);
            board[move[0]][move[1]] = null;
            maxEval = Math.max(maxEval, currentEval);
            alpha = Math.max(alpha, currentEval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of candidateMoves) {
            board[move[0]][move[1]] = playerSymbol;
            let currentEval = minimax(board, depth - 1, alpha, beta, true, botSymbol, playerSymbol);
            board[move[0]][move[1]] = null;
            minEval = Math.min(minEval, currentEval);
            beta = Math.min(beta, currentEval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function aiMove() {
    console.log('Bot đang tính toán bằng Alpha-Beta Pruning...');
    const botSymbol = botIsX ? PLAYER_X : PLAYER_O;
    const playerSymbol = botIsX ? PLAYER_O : PLAYER_X;
    
    const candidateMoves = getCandidateMoves(board);
    
    // Nước cờ đầu tiên nếu bàn trống
    if (candidateMoves.length === 1 && !board[7][7]) {
        makeMove(7, 7, botSymbol);
        return;
    }

    let bestMove = null;
    let bestValue = -Infinity;
    const MAX_DEPTH = 2; // Độ sâu 2 là đủ để chặn và nhìn trước 1 bước mà không giật
    let alpha = -Infinity;
    let beta = Infinity;
    
    for (let move of candidateMoves) {
        board[move[0]][move[1]] = botSymbol;
        let moveValue = minimax(board, MAX_DEPTH - 1, alpha, beta, false, botSymbol, playerSymbol);
        board[move[0]][move[1]] = null;
        
        // Cập nhật nước đi tốt nhất
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
        alpha = Math.max(alpha, moveValue);
    }
    
    if (bestMove) {
        console.log(`Bot chọn nước đi: [${bestMove}] với điểm: ${bestValue}`);
        makeMove(bestMove[0], bestMove[1], botSymbol);
    } else {
        console.error('Không còn ô trống để bot đi!');
    }
}

function highlightWinningLine(winInfo) {
    const { direction, start, end } = winInfo;
    const [dr, dc] = direction;
    const cellWidth = canvas.width / BOARD_SIZE;
    const cellHeight = canvas.height / BOARD_SIZE;

    // Tính tọa độ trung tâm của ô bắt đầu và kết thúc
    const startX = start[1] * cellWidth + cellWidth / 2;
    const startY = start[0] * cellHeight + cellHeight / 2;
    const endX = end[1] * cellWidth + cellWidth / 2;
    const endY = end[0] * cellHeight + cellHeight / 2;

    // Vẽ đường thắng
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 5;
    ctx.stroke();
}

function replayGame() {
    botIsX = !botIsX; // Đảo vai trò X/O
    const botSymbol = botIsX ? PLAYER_X : PLAYER_O;
    const playerSymbol = botIsX ? PLAYER_O : PLAYER_X;
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    currentPlayer = PLAYER_X; // X luôn đi trước
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa đường thắng
    createBoard();
    status.textContent = `${playerName} (Bạn là ${playerSymbol}, ${botIsX ? 'Máy (X)' : 'Bạn (X)'} đi trước)`;
    if (botIsX) {
        setTimeout(() => aiMove(), 500); // Bot đi trước nếu là X
    }
}

// Khởi tạo trò chơi, người chơi (X) đi trước
status.textContent = `${playerName} (Bạn là ${PLAYER_X}, Bạn (X) đi trước)`;
createBoard();