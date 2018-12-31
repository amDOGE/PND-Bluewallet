import { PushNotificationIOS } from 'react-native';
import PushNotification from 'react-native-push-notification';
import BackgroundTask from 'react-native-background-task';
import BackgroundFetch from 'react-native-background-fetch';


console.warn('DOESNT MATTER')
export default class Notifications {
  //   static testBackgroundFetch() {
  //     BackgroundTask.define(async () => {
  //       console.log('Hello from a background task');
  //       await Notifications.testLocalNotification();
  //       BackgroundTask.finish();
  //     });
  //     BackgroundTask.schedule();
  //   }

  static async configureBackgroundFetch() {
    await BackgroundTask.define(async () => {
        console.warn('Hello from a background task');
      PushNotificationIOS.presentLocalNotification({
        alertBody: 'hola',
        userInfo: {
          message: 'holaaaa'
        }
      });
        BackgroundTask.finish();
      });
    await BackgroundTask.schedule();

    // Optional: Check if the device is blocking background tasks or not
    //  this.checkStatus()
  }

  static async checkStatus() {
    const status = await BackgroundTask.statusAsync();

    if (status.available) {
      // Everything's fine
      return;
    }

    const reason = status.unavailableReason;
    if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
      console.log('Denied', 'Please enable background "Background App Refresh" for this app');
    } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
      console.log('Restricted', 'Background tasks are restricted on your device');
    }
  }

  static backgroundFetchAuthorizationStatus() {
    BackgroundFetch.status(status => {
      switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log('BackgroundFetch restricted');
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log('BackgroundFetch denied');
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log('BackgroundFetch is enabled');
          break;
      }
    });
  }

  static configure() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: _token => {
        console.log('Registered for notifications. We dont care about the token');
        // console.log('TOKEN:', token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: notification => {
        console.warn('NOTIFICATION:', notification);

        // process the notification

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NewData);
      },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: 'YOUR GCM (OR FCM) SENDER ID',

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true,
    });
  }
}
