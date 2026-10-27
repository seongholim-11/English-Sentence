import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type Reminder = { on: boolean; hour: number; minute: number };

export const defaultReminder = (): Reminder => ({ on: false, hour: 20, minute: 0 });

// 웹에서는 예약 알림을 지원하지 않는다
export const reminderSupported = Platform.OS !== 'web';

// 앱이 켜져 있을 때도 알림을 보여 준다
if (reminderSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const CHANNEL = 'daily-review';

export const timeLabel = (r: Pick<Reminder, 'hour' | 'minute'>) => {
  const h12 = r.hour % 12 === 0 ? 12 : r.hour % 12;
  return `${r.hour < 12 ? '오전' : '오후'} ${h12}:${String(r.minute).padStart(2, '0')}`;
};

// 매일 같은 시각에 알림을 예약한다. 권한이 없으면 false
export async function applyReminder(r: Reminder): Promise<boolean> {
  if (!reminderSupported) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!r.on) return true;

  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: '복습 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: '다시봄', body: '오늘 복습할 카드가 기다리고 있어요.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: r.hour,
      minute: r.minute,
      channelId: CHANNEL,
    },
  });
  return true;
}
