import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility_class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { json } from "stream/consumers";
import { invalidateCache } from "../utils/features.js";
// import { faker } from "@faker-js/faker";

//revalidate on New,Update,Delete Product & and New Order
export const getLatestProduct = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("latestProducts")) {
    products = JSON.parse(myCache.get("latestProducts") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

    myCache.set("latestProduct", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

//revalidate on New,Update,Delete Product & and New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});

//revalidate on New,Update,Delete Product & and New Order
export const getAdminProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("AllProducts")) {
    products = JSON.parse(myCache.get("AllProducts") as string);
  } else {
    products = await Product.find({});
    myCache.set("AllProducts", JSON.stringify(products));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});

//revalidate on New,Update,Delete Product & and New Order

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) {
      return next(new ErrorHandler("Please Add Photo", 400));
    }

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted ");
      });
      return next(new ErrorHandler("Please Eneter All Fields", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

     invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product create successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  if (photo) {
    rm(product.photo, () => {
      console.log("Old Photo Deleted ");
    });
    product.photo = photo.path;
    return next(new ErrorHandler("Please Eneter All Fields", 400));
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

 invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  rm(product.photo, () => {
    console.log("Product Photo Deleted ");
  });

  await product.deleteOne();
  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Deleted successfully",
  });
});

// get all product
export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

// fake product genrate
// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\\7770ec27-886e-4185-af93-a7fadfbc13c9.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }
//   await Product.create(products);
//   console.log({ succecss: true });
// };

//  generateRandomProducts(40)

// delete random product
// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
// deleteRandomsProducts(38
