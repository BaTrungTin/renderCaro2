# SCRIPT THUYẾT TRÌNH DEMO CODE TRỰC TIẾP
## Đề Tài: Game Cờ Caro (Gomoku) 15x15 — Trình bày thuật toán Minimax Alpha-Beta qua code

> **Hướng dẫn:** Mở file [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js) trong trình soạn thảo, chiếu lên màn hình. Cuộn đến từng dòng được chỉ định và đọc theo script bên dưới.

---

## PHẦN 1 — Mở file và giới thiệu tổng quan

*(Mở [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js), chỉ vào thanh cuộn và nói)*

> *"Toàn bộ AI của game nằm trong một file duy nhất là **pve.js**. File này không phụ thuộc server hay thư viện ngoài — tất cả logic Minimax, lượng giá Heuristic, và tỉa nhánh Alpha-Beta chạy trực tiếp trên trình duyệt bằng JavaScript thuần. Em sẽ đi qua 4 hàm cốt lõi theo đúng thứ tự mà chương trình gọi mỗi khi Bot cần tính nước đi."*

---

## PHẦN 2 — Hàm `getCandidateMoves` (Thu hẹp tập ứng viên)

*(Cuộn đến **dòng 364** trong [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L364-L393))*

**Code trên màn hình:**
```javascript
// Dòng 364–393
function getCandidateMoves(board) {
    const moves = new Set();
    const directions = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    ...
    for (let [dr, dc] of directions) {
        let nr = r + dr, nc = c + dc;      // Bán kính 1
        ...
        let nnr = r + dr*2, nnc = c + dc*2; // Bán kính 2
        ...
    }
}
```

*(Chỉ vào 2 dòng `nr/nc` và `nnr/nnc`)*

> *"Bước đầu tiên khi Bot cần tính toán, chương trình không duyệt tất cả 225 ô trống mà gọi hàm **`getCandidateMoves`** này. Hàm quét 8 hướng xung quanh mỗi quân cờ đã có trên bàn, gom lại các ô trống ở bán kính 1 và bán kính 2. Kết quả dùng `Set` để tự động loại bỏ trùng lặp."*

> *"Thực tế chỉ còn khoảng 15 đến 20 ô được chọn thay vì hơn 200 ô — giảm hơn 90% số nhánh cần duyệt, đây là tối ưu quan trọng nhất giúp game chạy mượt trên trình duyệt."*

---

## PHẦN 3 — Hàm `evaluateLine` & `evaluateBoard` (Chấm điểm thế cờ)

*(Cuộn lên **dòng 300** trong [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L300-L319))*

**Code trên màn hình:**
```javascript
// Dòng 300–319
function evaluateLine(count, openEnds, isBot) {
    if (count >= 5) return isBot ? 1000000 : -1000000;
    
    let score = 0;
    if (count === 4) {
        if (openEnds === 2) score = 100000;
        else if (openEnds === 1) score = 10000;
    } else if (count === 3) {
        if (openEnds === 2) score = 10000;
        ...
    }
    return isBot ? score : -score;
}
```

*(Chỉ vào dòng `if (count >= 5)` trước, sau đó chỉ vào `return isBot ? score : -score`)*

> *"Hàm **`evaluateLine`** chấm điểm từng chuỗi cờ theo 2 tiêu chí: số quân liên tiếp và số đầu mở. Thang điểm tăng lũy tiến — 5 quân thẳng hàng là 1 triệu điểm, 4 quân mở 2 đầu là 100 nghìn điểm, và cứ thế giảm dần."*

> *"Dòng cuối `return isBot ? score : -score` là cơ chế cốt lõi: quân Bot mang điểm dương để Bot tấn công, còn quân người chơi mang điểm âm. Khi người chơi tạo thế nguy hiểm, điểm tổng bị kéo xuống âm nặng — và đó là lý do Bot tự động đánh chặn mà không cần lập trình luật phòng thủ riêng."*

*(Cuộn xuống một chút đến **dòng 321**, chỉ vào mảng `directions`)*

> *"Hàm **`evaluateBoard`** gọi `evaluateLine` theo 4 hướng: ngang `[0,1]`, dọc `[1,0]`, chéo chính `[1,1]`, và chéo phụ `[1,-1]` — quét toàn bộ bàn cờ để ra một con số điểm tổng đại diện cho thế cờ hiện tại."*

---

## PHẦN 4 — Hàm `minimax` (Đệ quy và Tỉa nhánh Alpha-Beta)

*(Cuộn đến **dòng 437** trong [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L437-L477))*

**Code trên màn hình:**
```javascript
// Dòng 437–477
function minimax(board, depth, alpha, beta, isMaximizing, botSymbol, playerSymbol, stats) {
    const score = evaluateBoard(board, botSymbol, playerSymbol);
    if (score >= 1000000 || score <= -1000000 || depth === 0) {
        return score;  // Điều kiện dừng đệ quy
    }
    
    if (isMaximizing) {                          // Lượt Bot (MAX)
        let maxEval = -Infinity;
        for (let move of candidateMoves) {
            board[move[0]][move[1]] = botSymbol;  // Thử nước đi
            let currentEval = minimax(board, depth - 1, alpha, beta, false, ...); // Đệ quy
            board[move[0]][move[1]] = null;        // Hoàn tác (Backtracking)
            alpha = Math.max(alpha, currentEval);
            if (beta <= alpha) { break; }          // TỈA NHÁNH ALPHA-BETA
        }
    } else {                                     // Lượt Người chơi (MIN)
        ...
        if (beta <= alpha) { break; }             // TỈA NHÁNH ALPHA-BETA
    }
}
```

*(Chỉ vào dòng `if (score >= 1000000 || depth === 0)` trước)*

> *"Hàm **`minimax`** là đệ quy 2 chiều. Điều kiện dừng ở dòng 441: hoặc phát hiện thế cờ kết thúc — điểm đạt 1 triệu hoặc âm 1 triệu — hoặc đã xuống đến độ sâu tối đa là 2, thì dừng và trả về điểm lượng giá."*

*(Chỉ vào phần `isMaximizing`)*

> *"Khi `isMaximizing = true` là lượt Bot — nút MAX — Bot thử từng nước ứng viên: đặt quân xuống, gọi đệ quy xuống tầng tiếp theo với `isMaximizing = false`, sau đó **hoàn tác** nước vừa đi để thử tiếp. Đây chính là kỹ thuật Backtracking."*

*(Chỉ vào dòng `if (beta <= alpha) { break; }`)*

> *"Và đây là điều kiện **tỉa nhánh Alpha-Beta** — dòng 456. `alpha` là mức điểm tốt nhất mà nút MAX đã đảm bảo được, `beta` là mức điểm tốt nhất mà nút MIN chấp nhận. Khi `beta <= alpha`, nghĩa là nút cha đã có lựa chọn tốt hơn nhánh đang xét — dừng ngay, không duyệt tiếp. Nhờ đó cắt bỏ được 50 đến 80 phần trăm số nút cần tính."*

---

## PHẦN 5 — Hàm `aiMove` (Điểm vào chính của Bot)

*(Cuộn đến **dòng 479** trong [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L479-L560))*

**Code trên màn hình:**
```javascript
// Dòng 479–560
function aiMove() {
    setThinking(true);   // Hiện "Máy đang suy nghĩ..."
    
    const candidateMoves = getCandidateMoves(board);
    
    setTimeout(() => {              // Trì hoãn 20ms để UI kịp render
        const MAX_DEPTH = 2;
        let alpha = -Infinity, beta = Infinity;
        
        for (let move of candidateMoves) {
            board[move[0]][move[1]] = botSymbol;
            let moveValue = minimax(board, MAX_DEPTH - 1, alpha, beta, false, ...);
            board[move[0]][move[1]] = null;
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;   // Lưu nước tốt nhất
            }
        }
        
        makeMove(bestMove[0], bestMove[1], botSymbol); // Thực hiện nước đi
    }, 20);
}
```

*(Chỉ vào `setThinking(true)` và `setTimeout`)*

> *"Hàm **`aiMove`** là nơi khởi động toàn bộ quá trình. Đầu tiên bật chỉ báo 'Máy đang suy nghĩ' trên giao diện, sau đó đặt logic tính toán vào `setTimeout` 20 mili-giây. Lý do là trình duyệt đơn luồng — nếu tính toán ngay không có độ trễ, giao diện sẽ bị đơ cứng trước khi kịp render animation."*

*(Chỉ vào vòng `for` và `makeMove`)*

> *"Vòng lặp duyệt qua từng ô ứng viên, gọi `minimax` để đánh giá, rồi so sánh để giữ lại `bestMove` — nước đi có điểm cao nhất. Sau khi duyệt xong toàn bộ, `makeMove` được gọi để thực sự đặt quân xuống bàn cờ."*

---

## PHẦN 6 — Tổng kết toàn bộ luồng chạy

*(Chỉ lần lượt từng hàm trên màn hình và tóm tắt)*

> *"Tóm lại, mỗi khi người chơi đánh một nước, luồng chạy như sau:"*

```text
aiMove()
  └─► getCandidateMoves()   -- Thu hẹp từ 225 ô xuống ~15 ô
      └─► minimax()          -- Đệ quy sâu 2 tầng (MAX ↔ MIN)
           ├─► evaluateBoard()   -- Chấm điểm toàn bàn cờ
           │    └─► evaluateLine()  -- Chấm từng chuỗi cờ 4 hướng
           └─► Alpha-Beta pruning  -- Cắt nhánh khi beta <= alpha
  └─► makeMove(bestMove)     -- Thực hiện nước đi tối ưu
```

> *"Toàn bộ luồng này hoàn thành trong chưa đến 20 mili-giây, đảm bảo trải nghiệm tức thì mà không cần server, không cần GPU, không cần thư viện AI ngoài. Em xin kết thúc phần trình bày code ạ."*
