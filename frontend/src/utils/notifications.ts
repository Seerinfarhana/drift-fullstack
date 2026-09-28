export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notifications are not supported on this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
}