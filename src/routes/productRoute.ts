import express from "express";

import {
  deleteProduct,
  getAdminProduct,
  getAllCategories,
  getAllProducts,
  getLatestProduct,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/productController.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", adminOnly, singleUpload, newProduct);

//get all products with filter
app.get("/all", getAllProducts);
app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);
app.get("/admin-product",adminOnly, getAdminProduct);
app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default app;
