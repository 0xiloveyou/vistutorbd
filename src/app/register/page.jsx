import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create account",
  description: "Create a MathPlay account and start learning in English or Bangla.",
};

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <RegisterForm />
    </main>
  );
}