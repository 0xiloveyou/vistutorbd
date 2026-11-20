import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in",
  description: "Sign in to VizTutorBD or use a judge demo account.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <LoginForm />
    </main>
  );
}
