export default function AuthLoading({ label = "Checking your session..." }) {
  return (
    <div className="auth-loading">
      <span className="auth-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
