import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset password",
  description: "Reset your MathPlay password with an emailed OTP.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <ForgotPasswordForm />
    </main>
  );
}