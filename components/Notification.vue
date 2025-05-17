<template>
  <div class="notification-container" v-if="visible">
    <div class="notification">
      <div v-if="title" class="notification-title">{{ title }}</div>
      <div class="notification-body">{{ body }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  }
});

const visible = ref(true);
const animationDelay = computed(() => `0s, ${props.duration - 300}ms`);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
}

.notification {
  background: #18181b;
  border: 1px solid #242424;
  border-radius: 0px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 10px;
  animation: fadeIn 0.3s, fadeOut 0.3s ease-out forwards;
  animation-delay: v-bind(animationDelay);
}

.notification-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #ffffff;
}

.notification-body {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
</style> 