const mongoose = require("mongoose");
const xeMaySchema = new mongoose.Schema({
  tenXeMay: String,
  hangSanXuat: String,
  anhXeMay: [],
  giaTien: String,
});
const xeMay = mongoose.model("XeMay", xeMaySchema);
module.exports = xeMay;
