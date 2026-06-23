import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { demoNotifications } from "../../data/mockData";
import { ApiClient } from "../../services/api";
import { Notification } from "../../types";

type NotificationListProps = {
  api: ApiClient;
};

export function NotificationList({ api }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  useEffect(() => {
    api
      .get<{ notifications: Notification[] }>("/notifications")
      .then((data) => setNotifications(data.notifications))
      .catch(() => setNotifications(demoNotifications));
  }, [api]);

  return (
    <div className="notification-list">
      {notifications.map((notification) => (
        <div key={notification.id} className={notification.isRead ? "read" : ""}>
          <Bell size={18} />
          <div>
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
