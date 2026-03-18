// Browser Notification Service for Critical Alerts

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported in this browser.');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showEmergencyNotification = (title: string, body: string) => {
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'sayrasphere-emergency',
    requireInteraction: true,
  });
};
