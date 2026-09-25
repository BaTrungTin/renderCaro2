# GIẢI THÍCH CHI TIẾT BẢNG ĐIỂM HEURISTIC KÈM CODE TỪNG VÍ DỤ
## Đề Tài: Game Cờ Caro (Gomoku) 15x15 - Thuật Toán Minimax Alpha-Beta

Tài liệu này trích xuất chi tiết từng dòng code trong hàm `evaluateLine` ([pve.js dòng 300 - 319](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L300-L319)), gắn liền với **hình ảnh thế cờ minh họa thực tế** và **đoạn code xử lý tương ứng**.

---

## TỔNG THỂ ĐOẠN CODE GỐC TRONG [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L300-L319)

```javascript
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
```

---

## CHI TIẾT TỪNG VÍ DỤ VÀ ĐOẠN CODE TƯƠNG ỨNG

### VÍ DỤ 1: ĐÃ CÓ 5 QUÂN LIÊN TIẾP (THẮNG CUỘC - 1.000.000 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  . [O] [O] [O] [O] [O] .   (5 quân liên tiếp bất kể hai đầu)
  ```
* **Đoạn code xử lý (Dòng 301):**
  ```javascript
  if (count >= 5) return isBot ? 1000000 : -1000000;
  ```
* **Giải thích:**
  - `count >= 5`: Đã đủ 5 quân thẳng hàng (thắng ván cờ).
  - Điểm số: **`1.000.000`** điểm (mức trần tuyệt đối).
  - Khi phát hiện nước đi tạo ra 5 quân, hàm trả về ngay lập tức mà không cần xét các điều kiện bên dưới.

---

### VÍ DỤ 2: 4 QUÂN LIÊN TIẾP MỞ CẢ 2 ĐẦU (CHẮC THẮNG - 100.000 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  [Trống] [O] [O] [O] [O] [Trống]   (Hai đầu đều là ô trống)
  ```
* **Đoạn code xử lý (Dòng 304 - 305):**
  ```javascript
  if (count === 4) {
      if (openEnds === 2) score = 100000;
  ```
* **Giải thích:**
  - `count === 4` và `openEnds === 2`: 4 quân O và cả 2 đầu đều chưa bị ai chặn.
  - Điểm số: **`100.000`** điểm.
  - **Ý nghĩa:** Đây là thế cờ chắc chắn thắng 100%, vì đối thủ chỉ có 1 lượt đi nên chỉ chặn được một đầu, Bot sẽ đánh vào đầu còn lại ở lượt tiếp theo để tạo thành 5 quân.

---

### VÍ DỤ 3: 4 QUÂN LIÊN TIẾP BỊ CHẶN 1 ĐẦU (ĐE DỌA THẮNG - 10.000 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  [X] [O] [O] [O] [O] [Trống]   (Đầu trái bị chặn bởi X, đầu phải còn trống)
  ```
* **Đoạn code xử lý (Dòng 304 & 306):**
  ```javascript
  if (count === 4) {
      ...
      else if (openEnds === 1) score = 10000;
  ```
* **Giải thích:**
  - `count === 4` và `openEnds === 1`: Có 4 quân nhưng chỉ còn 1 đầu mở.
  - Điểm số: **`10.000`** điểm.
  - **Ý nghĩa:** Nước cờ uy hiếp trực tiếp. Nếu là của Bot thì Bot sẽ đánh vào ô trống để thắng. Nếu là của Người chơi thì Bot bắt buộc phải đánh chặn vào ô trống duy nhất đó.

---

### VÍ DỤ 4: 3 QUÂN LIÊN TIẾP MỞ CẢ 2 ĐẦU (CÔNG CỰC MẠNH - 10.000 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  [Trống] [O] [O] [O] [Trống]   (Cả 2 đầu đều thoáng)
  ```
* **Đoạn code xử lý (Dòng 307 - 308):**
  ```javascript
  } else if (count === 3) {
      if (openEnds === 2) score = 10000;
  ```
* **Giải thích:**
  - `count === 3` và `openEnds === 2`: Có 3 quân và mở 2 đầu.
  - Điểm số: **`10.000`** điểm (bằng điểm với 4 quân bị chặn 1 đầu).
  - **Ý nghĩa:** Nếu nước này không bị chặn, bên sở hữu sẽ đánh thêm 1 quân để biến thành "4 quân mở 2 đầu" (thế cờ vô địch). Do đó, Bot xem thế cờ này nguy hiểm ngang ngửa với chuỗi 4 quân.

---

### VÍ DỤ 5: 3 QUÂN LIÊN TIẾP BỊ CHẶN 1 ĐẦU (TIỀM NĂNG TRUNG BÌNH - 100 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  [X] [O] [O] [O] [Trống]   (Một đầu đã bị bịt kín bởi đối thủ)
  ```
* **Đoạn code xử lý (Dòng 307 & 309):**
  ```javascript
  } else if (count === 3) {
      ...
      else if (openEnds === 1) score = 100;
  ```
* **Giải thích:**
  - `count === 3` và `openEnds === 1`: Đã bị bịt 1 đầu, đối phương dễ dàng hóa giải bằng cách bịt nốt đầu còn lại.
  - Điểm số giảm mạnh xuống còn: **`100`** điểm.

---

### VÍ DỤ 6: 2 QUÂN LIÊN TIẾP (KHAI CUỘC / PHÁT TRIỂN QUÂN)

* **Thế cờ 2 quân mở 2 đầu:**
  ```text
  [Trống] [O] [O] [Trống]   --> 100 điểm
  ```
* **Thế cờ 2 quân bị chặn 1 đầu:**
  ```text
  [X] [O] [O] [Trống]       --> 10 điểm
  ```
* **Đoạn code xử lý (Dòng 310 - 312):**
  ```javascript
  } else if (count === 2) {
      if (openEnds === 2) score = 100;
      else if (openEnds === 1) score = 10;
  }
  ```
* **Giải thích:**
  - Được dùng ở giai đoạn đầu ván đấu để Bot chọn các nước đi liên kết các quân cờ lại với nhau thay vì đánh rải rác vô nghĩa.

---

### VÍ DỤ 7: BỊ CHẶN CẢ 2 ĐẦU (THẾ CỜ VÔ DỤNG - 0 ĐIỂM)

* **Thế cờ thực tế:**
  ```text
  [X] [O] [O] [O] [X]   (Bị chặn cả đầu trái lẫn đầu phải)
  ```
* **Đoạn code xử lý:**
  ```javascript
  let score = 0; // Khởi tạo ban đầu là 0
  // Vì openEnds = 0 nên không thỏa mãn (openEnds === 2) hay (openEnds === 1)
  // Kết quả: score vẫn giữ nguyên là 0
  ```
* **Giải thích:**
  - Chuỗi cờ dù có 3 hay 4 quân nhưng đã bị bịt cả hai đầu thì không còn khả năng phát triển thành 5 quân được nữa, điểm số trả về là **`0`**.

---

### VÍ DỤ 8: DÒNG CODE QUYẾT ĐỊNH CÔNG HAY THỦ (DÒNG 318)

* **Đoạn code xử lý (Dòng 318):**
  ```javascript
  return isBot ? score : -score;
  ```

#### Trường hợp A: Thế cờ của Bot (Tấn công)
- `isBot = true` $\rightarrow$ Trả về `+score`.
- Bot tìm nước đi có điểm dương lớn nhất để đưa lại lợi thế cao nhất cho mình.

#### Trường hợp B: Thế cờ của Người chơi (Phòng thủ / Đánh chặn)
- `isBot = false` $\rightarrow$ Trả về `-score`.
- **Ví dụ thực tế:**
  - Người chơi đánh được 3 quân mở 2 đầu: `[Trống] [X] [X] [X] [Trống]`.
  - Hàm tính ra `score = 10000`, nhưng vì là người chơi nên trả về **`-10000`** (điểm âm nặng).
  - Thuật toán Minimax không bao giờ muốn bị trừ 10.000 điểm, nên nó sẽ tìm nước đi nào có thể triệt tiêu điểm âm này. Nước đi đó chính là **đánh quân O vào 1 trong 2 đầu để bịt chuỗi cờ của người chơi lại**.

---

## TỔNG HỢP NHANH ĐỂ TRÌNH CHIẾU

```text
count >= 5                  --->  1,000,000  (Thắng cuộc)
count == 4 && openEnds == 2 --->    100,000  (Chắc thắng)
count == 4 && openEnds == 1 --->     10,000  (Uy hiếp - Bắt buộc chặn)
count == 3 && openEnds == 2 --->     10,000  (Công mạnh - Bắt buộc chặn)
count == 3 && openEnds == 1 --->        100  (Công trung bình)
count == 2 && openEnds == 2 --->        100  (Khai cuộc mở 2 đầu)
count == 2 && openEnds == 1 --->         10  (Phụ trợ)
openEnds == 0               --->          0  (Bị chặn hết, vô dụng)

return isBot ? score : -score;   ---> Điểm dương cho Bot, Điểm âm phạt Bot khi Người chơi mạnh
```

---

## SCRIPT THUYẾT TRÌNH – GIẢI THÍCH HÀM `evaluateLine` TRƯỚC GIẢNG VIÊN

> **Hướng dẫn sử dụng:** Bạn mở file [pve.js](file:///d:/spiderman/CaroGame-main/CaroGame-main/project-tic-tac-toe/static/pve.js#L300-L319) và cuộn đến **dòng 300**. Đọc script theo từng bước kết hợp chỉ tay vào dòng code tương ứng.

---

### 🎤 MỞ ĐẦU — Giới thiệu hàm

*(Chỉ tay vào tên hàm `evaluateLine` ở dòng 300)*

> *"Thưa thầy/cô, đây là hàm **`evaluateLine`** — trái tim của toàn bộ hệ thống lượng giá thế cờ. Hàm này nhận vào 3 tham số: `count` là số quân cờ liên tiếp cùng màu, `openEnds` là số đầu mở của chuỗi cờ đó, và `isBot` để phân biệt đây là quân của Bot hay của Người chơi."*

---

### 🎤 BƯỚC 1 — Điều kiện thắng tuyệt đối (Dòng 301)

*(Chỉ vào dòng 301: `if (count >= 5) return isBot ? 1000000 : -1000000;`)*

> *"Điều kiện đầu tiên và quan trọng nhất ở dòng 301. Nếu phát hiện chuỗi cờ đã đạt 5 quân liên tiếp, hàm **trả về ngay lập tức** điểm **1 triệu điểm** — mức điểm tuyệt đối cao nhất trong toàn hệ thống, đồng nghĩa với chiến thắng. Hàm không cần xét thêm bất kỳ điều kiện nào bên dưới vì đây là kết quả cuối cùng của ván đấu."*

---

### 🎤 BƯỚC 2 — Thế cờ 4 quân (Dòng 304–306)

*(Chỉ vào khối `if (count === 4)` ở dòng 304–306)*

> *"Khi chuỗi có 4 quân, có 2 trường hợp:"*
>
> *"Trường hợp thứ nhất ở dòng 305 — **mở cả 2 đầu, 100 nghìn điểm**. Đây là thế cờ **chắc chắn thắng** vì đối thủ trong một lượt chỉ chặn được một đầu, Bot sẽ đánh vào đầu còn lại ngay lượt tiếp theo."*
>
> *"Trường hợp thứ hai ở dòng 306 — **bị chặn một đầu, 10 nghìn điểm**. Dù bị chặn một đầu, chuỗi 4 quân vẫn là mối đe dọa thắng trực tiếp, bắt buộc đối thủ phải chặn ngay lập tức hoặc thua."*

---

### 🎤 BƯỚC 3 — Thế cờ 3 quân (Dòng 307–309)

*(Chỉ vào khối `else if (count === 3)` ở dòng 307–309)*

> *"Dòng 308 — 3 quân mở 2 đầu được chấm **10 nghìn điểm**, bằng với 4 quân bị chặn 1 đầu. Lý do là nếu không bị chặn, chuỗi 3 quân mở 2 đầu sẽ ngay lập tức phát triển thành '4 quân mở 2 đầu' — một thế cờ vô địch. Đây là điểm then chốt thể hiện sự thông minh của hàm lượng giá: nó **nhìn trước một nước** và đánh giá tiềm năng phát triển của thế cờ."*
>
> *"Còn dòng 309 — 3 quân bị chặn 1 đầu chỉ còn 100 điểm vì đã bị hạn chế khả năng phát triển."*

---

### 🎤 BƯỚC 4 — Thế cờ 2 quân (Dòng 310–312)

*(Chỉ vào khối `else if (count === 2)` ở dòng 310–312)*

> *"Các thế cờ 2 quân ở giai đoạn khai cuộc được chấm từ 10 đến 100 điểm. Mức điểm thấp này khuyến khích Bot phát triển các quân cờ ra vùng trung tâm và tạo liên kết thay vì đánh rải rác vô nghĩa."*

---

### 🎤 BƯỚC 5 — Trường hợp bị chặn cả 2 đầu (0 điểm)

*(Chỉ vào dòng `let score = 0;` ở dòng 303)*

> *"Điểm được khởi tạo là 0. Khi `openEnds === 0` — tức là chuỗi cờ bị bịt cả hai đầu bởi đối thủ hoặc chạm mép bàn cờ — không có điều kiện `if` nào thỏa mãn, hàm trả về đúng 0. Đây là cách code biểu đạt rằng: thế cờ bị chặn cả hai đầu dù có bao nhiêu quân cũng **hoàn toàn vô dụng** về mặt chiến thuật."*

---

### 🎤 BƯỚC 6 — Dòng quan trọng nhất: Cơ chế công & thủ (Dòng 318)

*(Chỉ vào dòng 318: `return isBot ? score : -score;`)*

> *"Và đây là dòng code quan trọng nhất — dòng 318. Chỉ một dòng ngắn gọn nhưng quyết định toàn bộ khả năng **tấn công lẫn phòng thủ** của AI."*
>
> *"Nếu chuỗi cờ là của Bot — `isBot = true` — trả về điểm **dương**, Bot sẽ tìm cách tối đa hóa điểm này để tấn công."*
>
> *"Nếu chuỗi cờ là của Người chơi — `isBot = false` — trả về điểm **âm**. Ví dụ: người chơi tạo được 3 quân mở 2 đầu thì điểm thế cờ bị tính là âm 10 nghìn, làm tổng điểm bàn cờ bị kéo xuống rất thấp. Thuật toán Minimax tại nút MAX sẽ chủ động tránh trạng thái bị trừ điểm nặng này bằng cách **chọn nước chặn** chuỗi quân đó. Đây chính là cơ chế tự động phòng thủ của Bot mà không cần lập trình riêng luật phòng thủ."*

---

### 🎤 CHỐT LẠI

> *"Tóm lại, hàm `evaluateLine` là hệ thống phán xét chiến lược đa cấp: điểm số tăng lũy tiến theo từng bậc từ 1 đến 1 triệu, phản ánh mức độ nguy hiểm tương ứng của từng thế cờ. Kết hợp với cơ chế điểm âm ở dòng 318, thuật toán Minimax không cần phân biệt công và thủ — nó **tự nhiên hành xử tối ưu nhất** trong mọi tình huống thưa thầy/cô."*
