import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility_class.js";

export const nweUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (user) {
      res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
      });
    }

    if (!_id || !name || !email || !photo || !gender || !dob) {
      return next(new ErrorHandler("Please add all fields", 400));
    }
    user = await User.create({
      name,
      email,
      photo,
      gender,

      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `welcome ${user.name}`,
    });
  }
);

// get all user
export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});
  return res.status(200).json({
    success: true,
    users,
  });
});

// get single user
export const getSingleUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("invalid id", 400));
  }
  return res.status(200).json({
    success: true,
    user,
  });
});

// get single user
export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("invalid id", 400));
  }
  await user.deleteOne()
  return res.status(200).json({
    success: true,
    message:"user deleted successfully",
  });
});
