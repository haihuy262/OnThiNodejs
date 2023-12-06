// Import thư viện Express
const express = require("express");
// Import thư viện body-parser
const bodyParser = require("body-parser");
// Import thư viện path để xử lý đường dẫn tệp tin
const path = require("path");
// Import thư viện multer để xử lý tải lên tệp tin
const multer = require("multer");
// Import mô hình XeMay từ tệp tin models/XeMay
const XeMay = require("./models/XeMay");
// Import thư viện mongoose để sử dụng trong kết nối cơ sở dữ liệu MongoDB
const { default: mongoose } = require("mongoose");
// Khai báo một biến port với giá trị là 5000
const port = 5000;
// Tạo một ứng dụng Express mới
const app = express();

// Kết nối với cơ sở dữ liệu MongoDB sử dụng thư viện mongoose
mongoose
  .connect("mongodb://127.0.0.1:27017/QuanLyXeMay")
  .then(() => {
    // Nếu kết nối thành công, hiển thị thông báo kết nối thành công
    console.log("Kết nối tới mongodb thành công");
  })
  .catch((err) => {
    // Nếu có lỗi trong quá trình kết nối, hiển thị thông báo lỗi
    console.error("Lỗi khi kết nối tới MongoDB " + err);
  });

// Sử dụng middleware express.json() để phân tích dữ liệu JSON từ yêu cầu HTTP và lưu vào thuộc tính body của đối tượng yêu cầu (req).
// Điều này là quan trọng khi xử lý dữ liệu được gửi lên từ client.
app.use(express.json());

// Sử dụng middleware bodyParser.urlencoded() để phân tích dữ liệu từ các biểu mẫu web (form data) trong yêu cầu HTTP và lưu vào thuộc tính body của đối tượng yêu cầu (req).
// Tham số extended: true cho phép phân tích một loại dữ liệu mở rộng.
app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng middleware bodyParser.json() để phân tích dữ liệu JSON từ yêu cầu HTTP và lưu vào thuộc tính body của đối tượng yêu cầu (req).
// Điều này cũng hữu ích khi xử lý các yêu cầu có chứa dữ liệu JSON.
app.use(bodyParser.json());

// Sử dụng middleware express.static để phục vụ các tệp tĩnh từ thư mục "public"
// app.use(express.static("public"));
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Thiết lập view engine là "ejs"
// View engine là công cụ giúp kết hợp dữ liệu và mẫu (template) để tạo ra các trang HTML dựa trên dữ liệu được truyền vào.
app.set("view engine", "ejs");

// Hàm path.join được sử dụng để kết hợp đường dẫn hiện tại (__dirname) với tên thư mục "views".
// Điều này giúp ứng dụng biết nơi tìm kiếm các file mẫu khi cần render trang web.
app.set("views", path.join(__dirname, "views"));

// Xử lý route GET "/home" để hiển thị trang chủ
app.get("/home", (req, res) => {
  // Gửi trang chủ được render từ file "Home.ejs" về client
  res.render("Home.ejs");
});

// Xử lý route GET "/addXeMay" để hiển thị trang thêm xe máy
app.get("/addXeMay", (req, res) => {
  // Gửi trang thêm xe máy được render từ file "AddXeMay.ejs" về client
  res.render("AddXeMay.ejs");
});

// Xử lý route GET "/danhSachXeMay" để hiển thị trang danh sách xe máy
app.get("/danhSachXeMay", async (req, res) => {
  // Gửi trang danh sách xe máy được render từ file "DanhSachXeMay.ejs" về client
  try {
    res.render("DanhSachXeMay.ejs");
  } catch (error) {
    console.log("Lỗi khi truy vấn sản phẩm", error);
    res.status(500).send("Lỗi khi truy vấn sản phẩm");
  }
});

app.get("/api/danhSachXeMay/xemay", async (req, res) => {
  // Gửi trang danh sách xe máy được render từ file "DanhSachXeMay.ejs" về client
  try {
    const xemays = await XeMay.find();
    res.json(xemays);
  } catch (error) {
    console.log("Lỗi khi truy vấn sản phẩm", error);
    res.status(500).send("Lỗi khi truy vấn sản phẩm");
  }
});

// Thiết lập lưu trữ cho multer để lưu trữ hình ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Đặt đường dẫn lưu trữ hình ảnh vào thư mục "src/public/images"
    cb(null, "src/public/images");
  },
  filename: (req, file, cb) => {
    // Đặt tên tệp hình ảnh với timestamp để tránh trùng lặp
    cb(null, Date.now() + "_" + file.originalname);
  },
});

// Tạo middleware multer để xử lý tải lên các tệp tin
const upload = multer({
  // Thiết lập nơi lưu trữ cho các tệp tin đã tải lên
  storage: storage,
  // Thiết lập giới hạn kích thước cho mỗi tệp tin tải lên là 1 MB
  limits: { fieldSize: 1 * 1024 * 1024 },
});

// Middleware xử lý tải lên nhiều hình ảnh với tên trường là "anhXeMay" và giới hạn là 2 hình ảnh
const uploadImagesMiddleware = (req, res, next) => {
  // Sử dụng multer để xử lý tải lên, với tên trường là "anhXeMay" và giới hạn là 2 hình ảnh
  upload.array("anhXeMay", 2)(req, res, function (err) {
    // Nếu lỗi thuộc loại MulterError, trả về lỗi 500 và thông tin lỗi
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } // Nếu có lỗi không thuộc loại MulterError, trả về lỗi 500 và thông tin lỗi
    else if (err) {
      return res.status(500).json(err);
    }
    next(); // Chuyển tiếp nếu không có lỗi
  });
};

// Controller xử lý khi đăng bài về xe máy
const postXeMay = async (req, res) => {
  // Lấy đường dẫn và tên tệp hình ảnh từ danh sách hình ảnh được tải lên
  const avatarList = req.files.map((file) => file.filename);
  // Tạo đối tượng XeMay với thông tin từ yêu cầu và danh sách hình ảnh
  const xeMays = new XeMay({
    tenXeMay: req.body.tenXeMay,
    hangSanXuat: req.body.hangSanXuat,
    anhXeMay: avatarList,
    giaTien: req.body.giaTien,
  });
  // Lưu đối tượng XeMay vào cơ sở dữ liệu
  await xeMays.save();
  // Chuyển hướng người dùng đến trang "/danhSachXeMay" sau khi lưu thành công
  res.redirect("/danhSachXeMay");
};

// Định nghĩa route POST để thêm mới thông tin về xe máy
app.post("/api/addXeMay", uploadImagesMiddleware, postXeMay);

// Lắng nghe yêu cầu trên cổng được chỉ định (port) và ghi log khi server bắt đầu lắng nghe
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
