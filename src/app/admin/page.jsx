"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import SystemLogs from "@/components/SystemLogs";
import {
  useDeleteUser,
  useQuestionTemplates,
  useUpdateUser,
  useUsers,
} from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useState } from "react";

const TABS = ["overview", "taxonomy", "topics", "visualizations", "questions", "knowledge", "users", "logs"];

function AdminBody() {
  const { t } = useLocale();
  const [tab, setTab] = useState("overview");
  const users = useUsers({ limit: 50 }, tab === "users" || tab === "overview");
  const templates = useQuestionTemplates(tab === "questions" || tab === "overview");
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [error, setError] = useState("");

  const userRows = users.data?.users ?? [];

  const changeRole = async (id, role) => {
    setError("");
    try {
      await updateUser.mutateAsync({ id, payload: { role } });
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not update the user."));
    }
  };

  const removeUser = async (id) => {
    setError("");
    try {
      await deleteUser.mutateAsync(id);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not delete the user."));
    }
  };

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("common.admin")}</span>
        <h1>{t("admin.title")}</h1>
        <p className="lead">{t("admin.placeholder")}</p>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {t(`admin.${item}`)}
          </button>
        ))}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {tab === "overview" ? (
        <div className="stat-grid">
          <div className="stat-card">
            <strong>{users.data?.meta?.total ?? 0}</strong>
            <span>{t("admin.users")}</span>
          </div>
          <div className="stat-card">
            <strong>{templates.data?.length ?? 0}</strong>
            <span>{t("admin.questions")}</span>
          </div>
          <div className="stat-card">
            <strong>{TABS.length}</strong>
            <span>{t("admin.taxonomy")}</span>
          </div>
        </div>
      ) : null}

      {["taxonomy", "topics", "visualizations", "knowledge"].includes(tab) ? (
        <div className="empty-panel">
          <h2>{t(`admin.${tab}`)}</h2>
          <p>{t("admin.placeholder")}</p>
        </div>
      ) : null}

      {tab === "questions" ? (
        <div className="panel">
          <header className="panel-head">
            <h2>{t("admin.questions")}</h2>
            <span className="badge">{templates.data?.length ?? 0}</span>
          </header>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Generator</th>
                  <th>Difficulty</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {(templates.data ?? []).map((template) => (
                  <tr key={template.id}>
                    <td className="mono">{template.key}</td>
                    <td className="mono">{template.generator}</td>
                    <td>
                      {template.difficultyMin}–{template.difficultyMax}
                    </td>
                    <td>{template.isActive ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="panel">
          <header className="panel-head">
            <h2>{t("admin.users")}</h2>
            <span className="badge">{users.data?.meta?.total ?? 0}</span>
          </header>

          {users.isPending ? <p className="muted">{t("common.loading")}</p> : null}

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>{t("profile.role")}</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {userRows.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td className="mono">{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(event) => changeRole(user.id, event.target.value)}
                        aria-label={`${t("profile.role")} ${user.email}`}
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-pill ${user.status}`}>{user.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeUser(user.id)}
                        disabled={deleteUser.isPending}
                      >
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "logs" ? <SystemLogs /> : null}
    </>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <AdminBody />
    </RoleGuard>
  );
}
