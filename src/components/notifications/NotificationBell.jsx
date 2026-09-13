import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, UserPlus, AtSign, MessageSquare, ArrowRightCircle, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { useSocket } from "../../hooks/useSocket";

const TYPE_ICONS = {
  assigned: { Icon: UserPlus, classes: "bg-brand-tint text-brand" },
  mentioned: { Icon: AtSign, classes: "bg-purple-100 text-purple-700" },
  comment: { Icon: MessageSquare, classes: "bg-gray-100 text-ink-subtle" },
  status: { Icon: ArrowRightCircle, classes: "bg-success-tint text-success" },
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/api/notifications?limit=20&cursor=${nextCursor}`);
      setNotifications((prev) => [...prev, ...data.notifications]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Live pushes from the server (personal socket room)
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) fetchNotifications();
  };

  const handleClick = async (notification) => {
    setOpen(false);
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      api.patch(`/api/notifications/${notification._id}/read`).catch(() => {});
    }
    if (notification.taskKey) {
      navigate(`/browse/${notification.taskKey}`);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    api.patch("/api/notifications/read-all").catch(() => {});
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded transition-colors"
        title="Notifications"
      >
        <Bell size={16} className="text-ink-subtle" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-away catcher */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-line rounded-lg shadow-xl z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-brand hover:underline font-medium"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-ink-subtle">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">
                    Assignments, mentions and status changes show up here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { Icon, classes } = TYPE_ICONS[n.type] || TYPE_ICONS.comment;
                  return (
                    <button
                      key={n._id}
                      onClick={() => handleClick(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-line last:border-b-0 hover:bg-gray-50 transition-colors ${
                        n.read ? "" : "bg-brand-tint/40"
                      }`}
                    >
                      <span className={`mt-0.5 w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${classes}`}>
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-snug ${n.read ? "text-ink-subtle" : "text-ink font-medium"}`}>
                          {n.message}
                        </span>
                        {n.taskTitle && (
                          <span className="block text-xs text-ink-subtle truncate mt-0.5">
                            {n.taskTitle}
                          </span>
                        )}
                        <span className="block text-[11px] text-ink-subtle mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 w-2 h-2 bg-brand rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full text-center text-xs text-brand hover:underline disabled:opacity-50 py-3 border-t border-line"
                >
                  {loadingMore ? "Loading…" : "Load older notifications"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
