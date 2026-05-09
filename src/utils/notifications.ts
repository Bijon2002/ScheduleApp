import * as Notifications from 'expo-notifications';
import { ScheduleBlock, timeToMinutes } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleBlockNotification(block: ScheduleBlock): Promise<string | null> {
  try {
    const [h, m] = block.startTime.split(':').map(Number);
    const trigger: Notifications.NotificationTriggerInput = block.recurring
      ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextOccurrenceDate(h, m) };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${block.label}`,
        body: block.subLabel || `${block.startTime} – ${block.endTime}`,
        sound: true,
        data: { blockId: block.id },
      },
      trigger,
    });
    return id;
  } catch {
    return null;
  }
}

function nextOccurrenceDate(hour: number, minute: number): Date {
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hour, minute, 0, 0);
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  return scheduled;
}

export async function cancelBlockNotification(notifId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notifId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleAll(blocks: ScheduleBlock[], notifMap: Record<string, string>): Promise<Record<string, string>> {
  await cancelAllNotifications();
  const newMap: Record<string, string> = {};
  for (const block of blocks) {
    if (block.notify) {
      const id = await scheduleBlockNotification(block);
      if (id) newMap[block.id] = id;
    }
  }
  return newMap;
}
