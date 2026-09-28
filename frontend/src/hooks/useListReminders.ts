import { useEffect } from "react";
import type { TaskList } from "../types";

export function useListReminders(lists: TaskList[]) {
  useEffect(() => {
    function checkReminders() {
      if (Notification.permission !== "granted") {
        return;
      }

      const now = new Date();

      lists.forEach((list) => {
        if (!list.reminder) return;

        const reminderTime = new Date(list.reminder);

        const key = `list-reminder-${list.id}-${list.reminder}`;

        const alreadyShown = localStorage.getItem(key);

        if (
          reminderTime <= now &&
          !alreadyShown
        ) {
          new Notification("Drift Reminder 🔔", {
            body: `${list.name} is due soon`,
          });

          localStorage.setItem(key, "shown");
        }
      });
    }

    checkReminders();

    const interval = window.setInterval(
      checkReminders,
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [lists]);
}