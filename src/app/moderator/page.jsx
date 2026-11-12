"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import SystemLogs from "@/components/SystemLogs";
import { useModerationReports, useUpdateModerationReport } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useState } from "react";

const FILTERS = ["", "OPEN", "REVIEWING", "RESOLVED", "DISMISSED"];

function ModeratorBody() {
  const { t } = useLocale();
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState("reports");
  const reports = useModerationReports(status);
  const update = useUpdateModerationReport();
  const [error, setError] = useState("");

  const setReportStatus = async (id, next) => {
    setError("");
    try {
      await update.mutateAsync({ id, payload: { status: next } });
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not update the report."));
    }
  };

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("common.moderator")}</span>
        <h1>{t("moderator.title")}</h1>
        <p className="lead">{t("admin.moderation")}</p>
      </header>

      <div className="tabs" role="tablist">
        {["reports", "logs"].map((item) => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item === "reports" ? t("admin.moderation") : "System logs"}
          </button>
        ))}
      </div>

      {tab === "logs" ? <SystemLogs /> : null}

      {tab === "reports" ? <>
      <div className="tabs" role="tablist">
        {FILTERS.map((item) => (
          <button
            key={item || "all"}
            type="button"
            role="tab"
            aria-selected={status === item}
            className={status === item ? "active" : ""}
            onClick={() => setStatus(item)}
          >
            {item || "ALL"}
          </button>
        ))}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {reports.isPending ? <p className="muted">{t("common.loading")}</p> : null}

      {!reports.isPending && (reports.data ?? []).length === 0 ? (
        <div className="empty-panel">
          <h2>{t("moderator.empty")}</h2>
        </div>
      ) : null}

      {(reports.data ?? []).length > 0 ? (
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>{t("moderator.status")}</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(reports.data ?? []).map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="mono">{report.targetType}</div>
                      <div className="muted mono small">{report.targetId}</div>
                    </td>
                    <td>
                      <div>{report.reason}</div>
                      {report.details ? (
                        <div className="muted small">{report.details}</div>
                      ) : null}
                    </td>
                    <td>
                      <span className={`status-pill ${report.status}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="muted small">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div className="topic-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setReportStatus(report.id, "REVIEWING")}
                          disabled={update.isPending}
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setReportStatus(report.id, "RESOLVED")}
                          disabled={update.isPending}
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setReportStatus(report.id, "DISMISSED")}
                          disabled={update.isPending}
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      </> : null}
    </>
  );
}

export default function ModeratorPage() {
  return (
    <RoleGuard roles={["ADMIN", "MODERATOR"]}>
      <ModeratorBody />
    </RoleGuard>
  );
}
