<template>
  <div class="layout-wrapper">
    <Topbar />
    <Sidebar />
    <div class="layout-main-container">
      <div class="layout-main">
        <NotificationService ref="notificationService" />
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import NotificationService from '~/components/NotificationService.vue';

const { $notify } = useNuxtApp();
const notificationService = ref(null);

onMounted(() => {
  if (notificationService.value) {
    $notify.setService(notificationService.value);
  }
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  color: #E1DFE1;
  background-color: #09090b;
  font-family: Arial, sans-serif;
}

.layout-wrapper {
  min-height: 100vh;
}

.layout-main-container {
  margin-left: 17rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
  padding: 6rem 2rem 0;
  transition: margin-left 0.2s;
}

.layout-main {
  flex: 1 1 auto;
  padding-bottom: 2rem;
}

/* Анимации переходов страниц */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
