import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="big" aria-hidden="true">
        404
      </span>
      <h1>Page not found</h1>
      <p className="muted">
        The class, chapter or topic you are looking for is not part of MathPlay yet.
      </p>
      <Link href="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  );
}