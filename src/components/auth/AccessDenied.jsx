import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="auth-card auth-denied">
      <h1>Access denied</h1>
      <p>Your account does not have permission to open this page.</p>
      <Link href="/" className="auth-submit">
        Back to the learning hub
      </Link>
    </div>
  );
}
