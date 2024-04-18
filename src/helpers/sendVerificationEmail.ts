import { resend } from "@/lib/resend"
import VerificationEmail from "../../emails/verificationEmail"

import { ApiResponse } from "@/types/ApiResponse"

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: " Meetopia <noreply@meetopia.vibewave.live>",
      to: email,
      subject: "Verify your email",
      react: VerificationEmail({ username, otp: verifyCode }),
    })

    return {
      success: true,
      message: "Verification email sent",
    }
  } catch (error) {
    console.error("error sending verification email: ", error)
    return {
      success: false,
      message: "Failed to send verification email",
    }
  }
}
