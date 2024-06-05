import mongoose from "mongoose";

interface IProduct extends Document {
  name: string;
  price: string;
  photo: string;
  stock: number;
  category: string;

  createdAt: Date;
}
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Product Name"],
    },
    price: {
      type: String,
      required: [true, "Please Enter Price"],
    },
    photo: {
      type: String,
      required: [true, "Please Enter Photo"],
    },
    stock: {
      type: Number,
      required: [true, "Please Enter Stock"],
    },
    category: {
      type: String,
      required: [true, "Please Enter Product Category"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", schema);
