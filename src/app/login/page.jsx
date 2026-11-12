import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in",
  description: "Sign in to MathPlay to save bookmarks, progress and quiz settings.",
};

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <LoginForm />
    </main>
  );
}