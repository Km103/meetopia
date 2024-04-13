import mongoose, { Schema, Document } from "mongoose"

interface User extends Document {
  name: string
  username: string
  email: string
  password: string
  verifyCode: string
  verifyCodeExpiry: Date
  isVerified: boolean
}

const UserSchema: Schema<User> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: [true, "Verification code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verification code expiry date is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema)

export default UserModel
