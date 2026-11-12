"use client";

import { getSystemLogs } from "@/api/moderation.api";
import { apiErrorMessage } from "@/lib/apiClient";
import { useEffect, useState } from "react";

const CATEGORIES = ["error", "success", "info", "combined"];

export default function SystemLogs() {
  const [category, setCategory] = useState("error");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getSystemLogs({ category, limit: 100 });
      setEntries(result.entries ?? []);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not load system logs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [category]);

  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h2>System logs</h2>
          <p className="muted small">Latest 100 records. Access is limited to admins and moderators.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadLogs()} disabled={loading}>
          Refresh
        </button>
      </header>

      <div className="tabs" role="tablist" aria-label="Log category">
        {CATEGORIES.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="muted">Loading logs…</p> : null}
      {!loading && !error && entries.length === 0 ? <div className="empty-panel"><p>No log records in this file yet.</p></div> : null}
      {entries.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Time</th><th>Level</th><th>Event</th><th>Details</th></tr></thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={`${entry.timestamp}-${entry.requestId ?? index}`}>
                  <td className="muted small">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}</td>
                  <td><span className={`status-pill ${entry.level}`}>{entry.level}</span></td>
                  <td className="mono">{entry.event}</td>
                  <td><pre className="log-details">{JSON.stringify(entry, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
