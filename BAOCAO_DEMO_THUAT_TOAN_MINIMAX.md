# TÀI LIỆU HƯỚNG DẪN DEMO & BÁO CÁO THUẬT TOÁN AI (CHẾ ĐỘ PVE)
## Đề Tài: Game Cờ Caro (Gomoku) 15x15 Đấu Với Máy (AI Minimax Alpha-Beta)

---

## 1. HƯỚNG DẪN KHỞI CHẠY & KỊCH BẢN DEMO THỰC TẾ

### 1.1. Cách khởi chạy nhanh nhất
- **Cách 1 (Không cần cài đặt gì thêm):** 
  Nhấp đúp chuột trực tiếp mở file [index.html](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/index.html) hoặc [startGame.html](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/startGame.html) bằng bất kỳ trình duyệt nào (Chrome, Edge, Cốc Cốc, Brave).
- **Cách 2 (Chạy qua Local Server nếu muốn):**
  Mở terminal tại thư mục dự án và chạy:
  ```powershell
  python -m http.server 8000
  ```
  Sau đó truy cập: `http://localhost:8000`

---

### 1.2. Kịch bản Demo 4 bước trước giảng viên / người xem

#### Bước 1: Khởi tạo ván đấu & Giới thiệu giao diện
- **Thao tác:** 
  1. Từ trang chủ bấm **Play**.
  2. Tại trang [startGame.html](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/startGame.html), nhập tên người chơi (ví dụ: `HocVien`), chọn chế độ **PVE (Player vs Bot)** rồi bấm **Bắt đầu**.
- **Lời thuyết trình:**
  > *"Giao diện game được thiết kế chuẩn bàn cờ Caro 15x15 hiện đại (Dark Theme Glassmorphism). Âm thanh được tổng hợp trực tiếp bằng Web Audio API không phụ thuộc file tĩnh. Bảng bên phải hiển thị trạng thái lượt đi, tỉ số Người - Máy và chỉ báo trạng thái suy nghĩ của AI."*

#### Bước 2: Demo tính năng phòng thủ - Bot chặn đòn nguy hiểm
- **Thao tác trên bàn cờ:**
  1. Người chơi đánh quân **X** ở trung tâm `(7, 7)`. Máy đánh trả **O**.
  2. Người chơi lần lượt đánh tạo thành một hàng ngang hoặc dọc gồm **3 quân X liên tiếp mở 2 đầu** (ví dụ: các ô `(7, 6)`, `(7, 7)`, `(7, 8)`).
- **Kết quả quan sát:**
  - Bot sẽ lập tức đánh quân **O** chặn vào một trong hai đầu (`(7, 5)` hoặc `(7, 9)`).
- **Lời thuyết trình:**
  > *"Như thầy/cô quan sát, khi người chơi tạo ra chuỗi 3 quân mở cả 2 đầu (thế cờ đe dọa trực tiếp lên 4 quân không thể chặn), hàm lượng giá Heuristic phát hiện điểm số của người chơi tăng vọt. Nút MIN trong Minimax buộc Bot phải chọn nước đi chặn đầu để triệt tiêu mối nguy hiểm này."*

#### Bước 3: Demo tính năng tấn công - Bot kết liễu trận đấu
- **Thao tác trên bàn cờ:**
  1. Người chơi cố tình đi một nước cờ ở xa, không can thiệp vào cụm quân của Bot.
  2. Để Bot tự do phát triển từ chuỗi 3 quân lên 4 quân liên tiếp.
- **Kết quả quan sát:**
  - Khi đã có chuỗi 4 quân, Bot lập tức chọn nước đi tạo thành chuỗi **5 quân chiến thắng**, không bao giờ bỏ lỡ cơ hội dứt điểm.
- **Lời thuyết trình:**
  > *"Khi xuất hiện nước đi tạo chuỗi 5 quân, hàm Heuristic gán điểm số tuyệt đối (1.000.000 điểm), thuật toán Minimax lập tức chọn nước đi kết liễu này."*

#### Bước 4: Demo hiệu ứng chiến thắng
- **Kết quả quan sát:**
  - 5 quân cờ chiến thắng phát sáng vàng nhấp nháy nổi bật (`.win-cell`).
  - Âm thanh thông báo chiến thắng vang lên qua Web Audio API.
  - Nước đi cuối cùng luôn có viền vàng nhận diện rõ ràng.

---

## 2. CÁC ĐOẠN CODE TRỌNG TÂM CẦN MỞ RA TRÌNH CHIẾU ([pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js))

Khi giảng viên yêu cầu xem code thuật toán, bạn mở file [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js) và giải thích 4 điểm sau:

### 2.1. Hàm thu hẹp tập ứng viên `getCandidateMoves`
- **Vị trí:** Trong file [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js).
- **Mã nguồn cốt lõi:**
  ```javascript
  // Quét các ô trống trong bán kính 1 - 2 ô tính từ các quân cờ đã đánh
  for (let [dr, dc] of directions) {
      let nr = r + dr, nc = c + dc;
      if (isValid(nr, nc) && board[nr][nc] === null) candidateSet.add(`${nr},${nc}`);
      let nnr = r + dr*2, nnc = c + dc*2;
      if (isValid(nnr, nnc) && board[nnr][nnc] === null) candidateSet.add(`${nnr},${nnc}`);
  }
  ```
- **Ý nghĩa:** Bàn cờ 15x15 có 225 ô. Nếu duyệt hết thì cây đệ quy sẽ bùng nổ làm treo trình duyệt. Hàm này thu hẹp từ ~200 ô xuống chỉ còn **10 - 25 ô tiềm năng thực sự quanh vùng giao tranh**.

### 2.2. Thuật toán Minimax kết hợp Tỉa nhánh Alpha-Beta
- **Vị trí:** Hàm `minimax(board, depth, alpha, beta, isMaximizing, ...)` trong [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js).
- **Mã nguồn cốt lõi:**
  ```javascript
  if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of candidateMoves) {
          board[move.r][move.c] = botSymbol;
          let evaluation = minimax(board, depth - 1, alpha, beta, false, botSymbol, playerSymbol);
          board[move.r][move.c] = null; // Backtracking
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // TỈA NHÁNH ALPHA-BETA
      }
      return maxEval;
  }
  ```
- **Ý nghĩa:** Cắt bỏ ngay các nhánh con khi điều kiện $\beta \le \alpha$ xảy ra, giảm 50% - 80% số nút phải duyệt.

### 2.3. Bảng điểm lượng giá Heuristic (`evaluateLine`)
- Quét đủ 4 hướng: Ngang, Dọc, Chéo xuôi, Chéo ngược:
  | Hình cờ | Trạng thái đầu | Điểm số Bot | Ý nghĩa chiến lược |
  | :--- | :---: | :---: | :--- |
  | **5 quân** | Bất kỳ | `1,000,000` | Thắng ván đấu (ưu tiên tối cao) |
  | **4 quân** | Mở 2 đầu | `100,000` | Chắc chắn thắng (đối thủ chỉ chặn được 1 đầu) |
  | **4 quân** | Bị chặn 1 đầu | `10,000` | Uy hiếp mạnh, bắt buộc đối thủ phải chặn |
  | **3 quân** | Mở 2 đầu | `10,000` | Sắp phát triển thành 4 mở 2 đầu |
  | **3 quân** | Bị chặn 1 đầu | `100` | Tiềm năng tấn công |
  | **2 quân** | Mở 2 đầu | `100` | Phát triển quân ở khai cuộc |
  | **2 quân** | Bị chặn 1 đầu | `10` | Nước phụ trợ |

### 2.4. Đảm bảo UI mượt mà với `setTimeout`
- Thuật toán AI được bọc trong `setTimeout(..., 20)` để trình duyệt kịp cập nhật trạng thái *"Máy đang suy nghĩ..."*, không bị đơ giao diện hay khựng hiệu ứng.

---

## 3. NGUYÊN LÝ THUẬT TOÁN MINIMAX TRONG BÀI TOÁN CỜ CARO

### 3.1. Phân loại bài toán
1. **Đối kháng 2 người (Two-player):** Bot (AI) và Người chơi.
2. **Tổng bằng không (Zero-sum):** Lợi thế của người này chính là bất lợi của người kia.
3. **Thông tin hoàn hảo (Perfect Information):** Toàn bộ trạng thái bàn cờ đều hiển thị công khai, không có yếu tố may rủi xúc xắc hay sương mù chiến thuật.

### 3.2. Cây trò chơi và 2 vai trò
- **Nút MAX (Lượt của Bot):** Bot luôn tìm nước đi có điểm lượng giá cao nhất (`maxEval`).
- **Nút MIN (Lượt của Người chơi):** Bot giả định người chơi luôn đi nước thông minh nhất làm cho điểm của Bot thấp nhất (`minEval`).
- **Quá trình Backtracking:** Bot thử nước đi $\rightarrow$ gọi đệ quy tầng tiếp theo $\rightarrow$ hoàn tác nước đi (`board[r][c] = null`) để thử nước đi kế tiếp.

---

## 4. KỸ THUẬT TỈA NHÁNH ALPHA - BETA

### 4.1. Bản chất hai cận $\alpha$ và $\beta$
- **$\alpha$ (Alpha):** Điểm số tối thiểu mà nút MAX chắc chắn có thể đạt được (khởi tạo $-\infty$).
- **$\beta$ (Beta):** Điểm số tối đa mà nút MIN chấp nhận cho đối phương đạt được (khởi tạo $+\infty$).

### 4.2. Điều kiện cắt tỉa ($\beta \le \alpha$)
- Khi duyệt một nhánh, nếu phát hiện $\beta \le \alpha$, thuật toán dừng ngay lập tức việc duyệt các nút con còn lại (`break`).
- **Đặc tính quan trọng:** Tỉa nhánh Alpha-Beta **không làm thay đổi kết quả nước đi tối ưu** so với Minimax thuần túy, nhưng giúp tăng tốc độ tính toán gấp nhiều lần.

---

## 5. BỘ CÂU HỎI & TRẢ LỜI VẤN ĐÁP BẢO VỆ ĐỒ ÁN (CHẾ ĐỘ PVE)

### Câu 1: Thuật toán Minimax hoạt động như thế nào trong bài cờ Caro này?
> **Trả lời:**
> "Dạ, Minimax xây dựng cây trò chơi đối kháng. Bot đóng vai trò nút MAX tìm cách tối đa hóa điểm số, còn người chơi đóng vai trò nút MIN tìm cách hạ thấp điểm số của Bot. Quá trình đệ quy qua lại giữa MAX và MIN đến độ sâu chỉ định (`depth = 2`), sau đó dùng hàm Heuristic để chấm điểm thế cờ và truyền giá trị ngược lên gốc để chọn ra nước đi tốt nhất."

### Câu 2: Tỉa nhánh Alpha-Beta giúp ích gì và nguyên lý cắt tỉa là gì?
> **Trả lời:**
> "Dạ, tỉa nhánh Alpha-Beta giúp loại bỏ các nhánh con không cần thiết mà vẫn đảm bảo chọn đúng nước đi tối ưu. Thuật toán duy trì hai giá trị $\alpha$ (cận dưới của MAX) và $\beta$ (cận trên của MIN). Ngay khi phát hiện điều kiện $\beta \le \alpha$, ta ngắt duyệt nhánh đó ngay vì đối thủ sẽ không bao giờ cho phép thế cờ đó xảy ra."

### Câu 3: Bàn cờ 15x15 có tới 225 ô, làm sao để thuật toán chạy tức thì trên trình duyệt mà không đơ máy?
> **Trả lời:**
> "Dạ, nhóm tối ưu bằng 3 giải pháp:
> 1. **Thu hẹp ứng viên (`getCandidateMoves`):** Chỉ xét các ô trống quanh các quân cờ đã đánh bán kính 1-2 ô, giảm từ 225 ô xuống còn khoảng 15 ô.
> 2. **Tỉa nhánh Alpha-Beta:** Cắt bỏ 50% - 80% số nút tính toán.
> 3. **Chọn độ sâu hợp lý (`MAX_DEPTH = 2`):** Máy nhìn trước 1 nước của mình và 1 nước phản đòn của đối thủ, thời gian phản hồi chỉ dưới 100ms."

### Câu 4: Bot nhận biết và ưu tiên phòng thủ thế cờ nguy hiểm của người chơi bằng cách nào?
> **Trả lời:**
> "Dạ, hàm Heuristic tính điểm cho cả hai bên. Khi người chơi tạo thế 3 quân mở 2 đầu hoặc 4 quân mở 1 đầu, điểm thế cờ của người chơi rất cao, khiến điểm của Bot bị âm nặng. Ở lượt MIN, thuật toán bắt buộc Bot phải chọn nước đi chặn đứng chuỗi quân đó để tránh bị trừ điểm."

### Câu 5: Nếu muốn nâng cấp cho Bot tính sâu hơn (độ sâu 4 hoặc 6) thì cần làm gì?
> **Trả lời:**
> "Dạ, nếu tăng độ sâu lên 4-6, ta cần áp dụng thêm:
> 1. **Web Worker:** Đưa luồng tính toán AI ra chạy nền riêng biệt để không ảnh hưởng UI.
> 2. **Sắp xếp nước đi (Move Ordering):** Ưu tiên duyệt các nước đi có điểm Heuristic cao trước để kích hoạt tỉa Alpha-Beta sớm hơn.
> 3. **Bảng chuyển vị (Transposition Table) kết hợp Zobrist Hashing:** Lưu lại các thế cờ đã từng tính toán để tránh tính lại."
