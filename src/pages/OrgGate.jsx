import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { Button } from "../components/common/Button";

/**
 * Full-screen gate shown while the organization is not usable yet:
 * pending (awaiting superadmin approval) or rejected (with re-apply).
 */
export const OrgGate = () => {
  const { userData, refreshUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const status = userData?.teamId?.status;
  const orgName = userData?.teamId?.name || "Your workspace";
  const isRejected = status === "rejected";
  const isOrgAdmin = userData?.role === "ADMIN";

  const checkStatus = async () => {
    setBusy(true);
    const fresh = await refreshUser();
    setBusy(false);
    const s = fresh?.teamId?.status;
    if (s === "active") {
      toast.success("Your workspace was approved — welcome in!");
    } else if (s === status) {
      toast("No change yet — we'll email you as soon as it's reviewed.");
    }
  };

  const reapply = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/api/users/team/reapply");
      toast.success(data.message);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="bg-white border border-line rounded-lg shadow-sm max-w-md w-full p-8 text-center animate-fadeIn">
        <h1 className="text-brand font-bold text-xl mb-6">Workzen</h1>

        <div
          className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
            isRejected ? "bg-danger-tint" : "bg-warn-tint"
          }`}
        >
          {isRejected ? "🚫" : "⏳"}
        </div>

        {isRejected ? (
          <>
            <h2 className="text-lg font-semibold text-ink mb-2">
              Workspace request declined
            </h2>
            <p className="text-sm text-ink-subtle mb-6">
              We couldn't approve <strong>{orgName}</strong> this time. If you
              think this is a mistake, request a re-review below or contact
              support.
            </p>
            <div className="flex flex-col gap-2">
              {isOrgAdmin && (
                <Button onClick={reapply} disabled={busy}>
                  Request re-review
                </Button>
              )}
              <Button variant="ghost" onClick={logout} disabled={busy}>
                Log out
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink mb-2">
              Awaiting approval
            </h2>
            <p className="text-sm text-ink-subtle mb-6">
              <strong>{orgName}</strong> has been registered and is waiting for
              approval by the Workzen team. We'll email{" "}
              <strong>{userData?.email}</strong> as soon as it's reviewed —
              usually within a day.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={checkStatus} disabled={busy}>
                {busy ? "Checking..." : "Check status"}
              </Button>
              <Button variant="ghost" onClick={logout} disabled={busy}>
                Log out
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
