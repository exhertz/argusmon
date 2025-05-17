<template>
  <div class="notifications-wrapper">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :body="notification.body"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Notification from './Notification.vue';

const notifications = ref([]);
let nextId = 0;

// Экспортируем функцию для показа уведомления
const showNotification = (options) => {
  // Проверка на наличие обязательного поля "body"
  if (!options.body) {
    console.error('Notification body is required');
    return;
  }
  
  const notification = {
    id: nextId++,
    title: options.title || '',
    body: options.body,
    duration: options.duration || 5000
  };
  
  notifications.value.push(notification);
  
  // Автоматическое удаление уведомления после его скрытия
  setTimeout(() => {
    removeNotification(notification.id);
  }, notification.duration + 300); // Добавляем 300мс для анимации
};

// Функция для удаления уведомления по ID
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

// Экспортируем функции, чтобы их можно было использовать из других компонентов
defineExpose({
  showNotification
});
</script>

<style scoped>
.notifications-wrapper {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  pointer-events: none;
}
</style> 