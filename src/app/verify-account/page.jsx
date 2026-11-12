import VerifyForm from "@/components/auth/VerifyForm";

export const metadata = {
  title: "Verify account",
  description: "Verify your email address with the OTP we sent you.",
};

export default function VerifyAccountPage() {
  return (
    <main className="auth-shell">
      <VerifyForm />
    </main>
  );
}