# Landing page “Hội khóa 20 năm – hội ngộ và tiến bước”

Landing page HTML/CSS/JavaScript thuần cho chương trình Hội khóa 20 năm của cựu học sinh Trường TH&THCS Hải Thượng, niên khóa 2002-2006.

## Cấu trúc

```txt
reunion_landing_page/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Cách chạy

Mở trực tiếp `index.html` bằng trình duyệt, hoặc deploy thư mục này lên Netlify, Vercel, GitHub Pages, Cloudflare Pages, hosting tĩnh bất kỳ.

## Cấu hình Formspree

Mở `script.js` và sửa phần đầu file:

```js
const FORM_ENDPOINTS = {
  memory: "https://formspree.io/f/mpqbvwqr",
  message: "https://formspree.io/f/mvzlegzb",
  performance: "https://formspree.io/f/xwvjrnoq"
};
```

## Cấu hình Cloudinary cho upload ảnh

Form “Ảnh & kỷ niệm” cho phép chọn ảnh từ thiết bị. JavaScript sẽ tải ảnh lên Cloudinary trước, sau đó gửi các URL ảnh vào Formspree thay vì gửi file trực tiếp.

Trong Cloudinary, tạo một unsigned upload preset cho ảnh. Sau đó mở `script.js` và sửa:

```js
const CLOUDINARY_CONFIG = {
  cloudName: "dauhqkpzj",
  uploadPreset: "rdm15sl5",
  folder: "20-nam-hoi-ngo"
};
```

`cloudName` và `uploadPreset` đã được cấu hình theo Cloudinary hiện tại.

Không đưa API key hoặc API secret của Cloudinary vào frontend. Với website tĩnh, API secret sẽ bị lộ công khai nếu đặt trong `script.js`.

Khi submit form có ảnh thành công, Formspree chỉ nhận thêm một trường `cloudinary_images`, gồm danh sách URL ảnh, mỗi URL một dòng. JavaScript không gửi file gốc, JSON metadata, tên file, số lượng ảnh, hoặc các field rỗng để giảm khả năng bị Formspree đánh dấu spam do payload chứa quá nhiều URL/metadata.

## Thông tin chương trình đã cấu hình

- Tên chương trình: Hội khóa “20 năm – hội ngộ và tiến bước”.
- Đơn vị: cựu học sinh Trường TH&THCS Hải Thượng, niên khóa 2002-2006.
- Thời gian: 08:00, Chủ nhật ngày 14/6/2026.
- Địa điểm: Trường Tiểu học và THCS Hải Thượng, xã Hải Lăng, tỉnh Quảng Trị.

Vị trí còn nên cập nhật trước khi public: `[Tên người liên hệ] – [Số điện thoại/Zalo]` trong `index.html`.

## Ghi chú riêng tư

Trang không hiển thị danh sách người đăng ký công khai và không đưa nội dung nội bộ như ngân sách, phân công ban tổ chức, checklist chuẩn bị, danh sách đóng góp hoặc thông tin cá nhân chưa được đồng ý công khai.
