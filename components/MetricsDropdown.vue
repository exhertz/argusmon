<template>
  <div class="dropdown">
    <button class="dropdown-toggle">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10 10h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4z"/></svg>
    </button>
    <div class="dropdown-menu">
      <button @click="$emit('interval-click')">
        Интервал обновления ({{ formatInterval(interval) }})
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  interval: {
    type: Number,
    required: true
  }
})

defineEmits(['interval-click'])

const formatInterval = (ms) => {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-toggle:hover {
  color: #fff;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #222225;
  border: 1px solid #242424;
  min-width: 160px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #36363A;
  color: #fff;
}
</style> 