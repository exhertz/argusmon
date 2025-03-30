<template>
  <div v-if="pending" class="loading">
    Загрузка...
  </div>
  <div v-else-if="error" class="error">
    Ошибка: {{ error.message }}
  </div>
  <div v-else>
    <div class="layout-topbar">
      <div class="topbar-left">
        {{ server.name }}
      </div>
      <ul class="topbar-menu">
        <li>
          <a class="edit-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
              <path fill="#E1DFE1" d="M25 4.031c-.766 0-1.516.297-2.094.875L13 14.781l-.219.219l-.062.313l-.688 3.5l-.312 1.468l1.469-.312l3.5-.688l.312-.062l.219-.219l9.875-9.906A2.968 2.968 0 0 0 25 4.03zm0 1.938c.234 0 .465.12.688.343c.445.446.445.93 0 1.375L16 17.376l-1.719.344l.344-1.719l9.688-9.688c.222-.222.453-.343.687-.343zM4 8v20h20V14.812l-2 2V26H6V10h9.188l2-2z"/>
            </svg>
          </a>
        </li>
        <li>
          <a class="update-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="#E1DFE1" stroke-width="2" d="M1.75 16.002C3.353 20.098 7.338 23 12 23c6.075 0 11-4.925 11-11m-.75-4.002C20.649 3.901 16.663 1 12 1C5.925 1 1 5.925 1 12m8 4H1v8M23 0v8h-8"/></svg>
          </a>
        </li>
      </ul>
    </div>
    <div class="layout-content">
      <div class="server-info">
        <div class="status">
          Статус: <span :class="server.status">{{ server.status }}</span>
        </div>
      </div>
      <div class="server-info">
        <div class="ip">
          IP: {{ server.ip }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: server, pending, error } = await useFetch(`/api/servers/${route.params.id}`)
  .catch((err) => {
    console.error('Ошибка при загрузке данных сервера:', err)
    return { data: null, pending: false, error: err }
  })
</script>

<style scoped>
.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #f44336;
}

.server-info {
  background: #18181b;
  border: 1px solid #242424;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 20px 0;
  color: #fff;
}

.status, .ip {
  margin: 10px 0;
  font-size: 16px;
}

.status span {
  text-transform: capitalize;
  font-weight: bold;
}

.status span.online {
  color: #4CAF50;
}

.status span.offline {
  color: #f44336;
}

.status span.maintenance {
  color: #ff9800;
}

.layout-topbar {
  padding: .75rem .5rem;
  border-bottom: 1px solid #242424;
  position: static;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color:rgba(255, 255, 255, 0.7);
  transition: transform .4s cubic-bezier(.05,.74,.2,.99);
}

.topbar-left {
  display: flex;
  align-items: center;
}

.layout-content {
  padding-top: 2rem;
  flex: 1 1 auto;
  position: relative;
}

.topbar-menu {
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: flex;
  align-items: center;
}

ol, ul, menu {
  list-style: none;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.topbar-menu > li {
  margin-left: 0.5rem;
  position: relative;
}

.edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #18181b;
  border: 1px solid #242424;
  padding: 4px;
  transition: background-color 0.2s;
}

.update-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background:rgb(54, 54, 100);
  border: 1px solid rgb(78, 78, 134);
  padding: 4px;
  transition: background-color 0.2s;
}

.edit-button svg {
  display: block;
}
</style>