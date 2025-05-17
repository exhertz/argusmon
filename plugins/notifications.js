import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  let notificationService = null;

  return {
    provide: {
      notify: {
        show(options) {
          if (notificationService) {
            notificationService.showNotification(options);
          } else {
            console.warn('Notification service is not yet available');
          }
        },
        setService(service) {
          notificationService = service;
        }
      }
    }
  }
}) 