import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/user.model"
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"

export async function POST(request: Request) {
  await dbConnect()

  try {
    const { email, username, password } = await request.json()

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    })
    if (existingUserVerifiedByUsername) {
      return Response.json({
        success: false,
        message: "Username already exists",
      })
    }

    const existingUserByEmail = await UserModel.findOne({
      email,
    })

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists with this email",
          },
          {
            status: 400,
          }
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserByEmail.password = hashedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await existingUserByEmail.save()
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)

      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
      })

      await newUser.save()
    }

    //send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: "Verification email sent",
        },
        {
          status: 500,
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Signed up successfully, please verify your email",
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error("error signing up: ", error)
    return Response.json(
      {
        success: false,
        message: "Failed to sign up",
      },
      {
        status: 500,
      }
    )
  }
}
