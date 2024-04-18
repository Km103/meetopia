import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/user.model"
import { z } from "zod"
import { verifySchema } from "@/schemas/verifySchema"

export async function POST(request: Request) {
  await dbConnect()
  try {
    const { username, code } = await request.json()
    // console.log(request)
    const decodedUsername = decodeURIComponent(username)

    // console.log(username, code)

    // const result = verifySchema.parse({ code: code })

    // if (!result) {
    //   //      const codeErrors = result.error?.format().code?._errors || []

    //   return Response.json(
    //     {
    //       success: false,
    //       message: "Invalid Code",
    //       //          codeErrors?.length > 0 ? codeErrors.join(", ") : "Invalid code ",
    //     },
    //     {
    //       status: 400,
    //     }
    //   )
    // }

    // console.log(result)
    //console.log(decodedUsername)

    const user = await UserModel.findOne({ username: decodedUsername })

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not found",
        },
        {
          status: 404,
        }
      )
    }

    const isCodeValid = user.verifyCode === code
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true
      await user.save()
      return Response.json(
        {
          success: true,
          message: "Account Verified Successsfully",
        },
        {
          status: 200,
        }
      )
    } else if (isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification Code",
        },
        {
          status: 400,
        }
      )
    }

    return Response.json(
      {
        success: false,
        message: "Code expired",
      },
      {
        status: 400,
      }
    )
  } catch (error) {
    console.log("Some error occured while verifying Code", error)
    return Response.json(
      {
        message: "Some error occured while verifying Code",
        success: false,
      },
      {
        status: 500,
      }
    )
  }
}
