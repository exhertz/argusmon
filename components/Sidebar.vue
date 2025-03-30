<template>
  <div class="sidebar">
    <nav class="servers-list">
      <NuxtLink 
        v-for="server in servers" 
        :key="server.id"
        :to="`/servers/${server.id}`"
        class="server-item"
        :class="{ active: isActive(server.id) }"
      >
        <span class="status-indicator" :class="server.status"></span>
        <div class="server-info">
          <div class="server-name">{{ server.name }}</div>
          <div class="server-ip">{{ server.ip }}</div>
        </div>
      </NuxtLink>
      <NuxtLink 
        to="/api/server"
        class="server-item add-server"
        :class="{ active: route.path === '/api/server' }"
      >
        <div class="server-info">
          <div class="server-name">Add server</div>
        </div>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: servers } = await useFetch('/api/servers')

const isActive = (serverId) => {
  return route.params.id === serverId.toString()
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  width: 15rem;
  height: calc(100vh - 8rem);
  z-index: 999;
  overflow-y: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  top: 6rem;
  left: 2rem;
  padding: .5rem 0.2rem;
  background: #18181b;
  color: white;
  border: 1px solid #242424;
}

.servers-list {
  display: flex;
  flex-direction: column;
}

.server-item {
  padding: 12px 20px;
  color: #E1DFE1;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  margin: 0 10px;
}

.server-item:hover {
  background:#3f3f46;
}

.server-item.active {
  background:rgba(255, 255, 255, 0.08);
}

.status-indicator {
  width: 8px;
  height: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}

.status-indicator.online {
  background: #4CAF50;
}

.status-indicator.offline {
  background: #f44336;
}

.status-indicator.maintenance {
  background: #ff9800;
}

.server-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.server-name {
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.server-ip {
  font-size: 12px;
  opacity: 0.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-server {
  margin-top: 1rem;
  border-top: 1px solid #242424;
  padding-top: 1rem;
}
</style> 