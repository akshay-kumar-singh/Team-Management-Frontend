import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";

const STATUS_STYLES = {
  pending: "bg-warn-tint text-warn",
  active: "bg-success-tint text-success",
  suspended: "bg-danger-tint text-danger",
  rejected: "bg-column text-ink-subtle",
};

const FILTERS = ["all", "pending", "active", "suspended", "rejected"];

const StatusPill = ({ status }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${
      STATUS_STYLES[status] || STATUS_STYLES.rejected
    }`}
  >
    {status}
  </span>
);

/**
 * Platform console for SUPERADMIN: every organization with its numbers,
 * plus approve / decline / suspend / reactivate and plan switching.
 */
export const AdminConsole = () => {
  const { userData, logout } = useAuth();
  const [orgs, setOrgs] = useState(null);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/orgs");
      setOrgs(data);
    } catch (err) {
      toast.error(err.message);
      setOrgs([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (org, status, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(org._id);
    try {
      await api.patch(`/api/admin/orgs/${org._id}/status`, { status });
      toast.success(`${org.name} is now ${status}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const changePlan = async (org, plan) => {
    setBusyId(org._id);
    try {
      await api.patch(`/api/admin/orgs/${org._id}/plan`, { plan });
      toast.success(`${org.name} moved to the ${plan} plan`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (orgs === null) return <Loader />;

  const counts = orgs.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const visible = filter === "all" ? orgs : orgs.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-white border-b border-line px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-brand font-bold text-lg">Workzen</span>
          <span className="text-ink-subtle text-sm">· Admin console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-subtle hidden sm:block">{userData?.email}</span>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Organizations</h1>
        <p className="text-sm text-ink-subtle mb-6">
          Approve new workspaces, manage plans, and suspend misbehaving accounts.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-ink-subtle border-line hover:bg-brand-tint hover:text-brand"
              }`}
            >
              {f === "all" ? `All (${orgs.length})` : `${f} (${counts[f] || 0})`}
            </button>
          ))}
        </div>

        <div className="bg-white border border-line rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-ink-subtle border-b border-line bg-canvas">
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium text-center">Members</th>
                <th className="px-4 py-3 font-medium text-center">Projects</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-subtle">
                    No organizations {filter !== "all" ? `with status "${filter}"` : "yet"}.
                  </td>
                </tr>
              )}
              {visible.map((org) => {
                const busy = busyId === org._id;
                return (
                  <tr key={org._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{org.name}</div>
                      <div className="text-xs text-ink-subtle">
                        since {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{org.admin?.name || "—"}</div>
                      <div className="text-xs text-ink-subtle">{org.admin?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-ink">
                      {org.members}
                      <span className="text-ink-subtle">/{org.limits.maxMembers}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-ink">
                      {org.projects}
                      <span className="text-ink-subtle">/{org.limits.maxProjects}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={org.plan}
                        disabled={busy}
                        onChange={(e) => changePlan(org, e.target.value)}
                        className="border border-line rounded px-2 py-1 text-sm bg-white text-ink"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={org.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {(org.status === "pending" ||
                          org.status === "rejected" ||
                          org.status === "suspended") && (
                          <Button disabled={busy} onClick={() => changeStatus(org, "active")}>
                            {org.status === "suspended" ? "Reactivate" : "Approve"}
                          </Button>
                        )}
                        {org.status === "pending" && (
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={() =>
                              changeStatus(org, "rejected", `Decline "${org.name}"?`)
                            }
                          >
                            Decline
                          </Button>
                        )}
                        {org.status === "active" && (
                          <Button
                            variant="danger"
                            disabled={busy}
                            onClick={() =>
                              changeStatus(
                                org,
                                "suspended",
                                `Suspend "${org.name}"? Members will get read-only access.`
                              )
                            }
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
