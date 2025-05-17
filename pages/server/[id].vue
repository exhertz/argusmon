<template>
  <div v-if="pending" class="loading">
    Loading...
  </div>
  <div v-else-if="error" class="error">
    Ошибка: {{ error.message }}
  </div>
  <div v-else>
    <div class="layout-topbar">
      <div class="topbar-left">
        {{ server.hostname }}
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
          <a class="update-button" @click="refreshData">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="#E1DFE1" stroke-width="2" d="M1.75 16.002C3.353 20.098 7.338 23 12 23c6.075 0 11-4.925 11-11m-.75-4.002C20.649 3.901 16.663 1 12 1C5.925 1 1 5.925 1 12m8 4H1v8M23 0v8h-8"/></svg>
          </a>
        </li>
        <li>
          <a v-if="!server.active" class="up-button" @click="activateServer">

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#E1DFE1" d="M8 5v14l11-7z"/>
            </svg>
          </a>
        </li>
      </ul>
    </div>
    <div class="layout-content">
      <div class="server-info">
        <div class="status">
          Статус: <span :class="server.status">{{ server.active ? "Active" : "DOWN" }}</span>
        </div>
      </div>
      <div class="server-info">
        <div class="ip">
          IP: {{ server.ip }}
        </div>
      </div>
      
      <div class="server-info">
        <div class="metrics-header">
          <h2>CPU</h2>
          <MetricsDropdown 
            :interval="intervals?.cpu || 60000" 
            @interval-click="openIntervalModal('cpu')" 
          />
        </div>
        <div v-if="!cpuMetrics?.data?.length" class="no-data">
          Not data!
        </div>
        <table v-else class="metrics-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>СPU usage (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in cpuMetrics.data" :key="metric.timestamp">
              <td>{{ formatDate(metric.timestamp) }}</td>
              <td>{{ calculateCpuUsage(metric.cpu_total, metric.cpu_idle).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="server-info">
        <div class="metrics-header">
          <h2>Disk</h2>
          <MetricsDropdown 
            :interval="intervals?.disk || 300000" 
            @interval-click="openIntervalModal('disk')" 
          />
        </div>
        <div v-if="!diskMetrics?.data?.length" class="no-data">
          Not data!
        </div>
        <table v-else class="metrics-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Total (GB)</th>
              <th>Free (GB)</th>
              <th>Usage (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in diskMetrics.data" :key="metric.timestamp">
              <td>{{ formatDate(metric.timestamp) }}</td>
              <td>{{ (metric.disk_total / 1024 / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ (metric.disk_free / 1024 / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ ((metric.disk_total - metric.disk_free) / metric.disk_total * 100).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="server-info">
        <div class="metrics-header">
          <h2>RAM</h2>
          <MetricsDropdown 
            :interval="intervals?.ram || 60000" 
            @interval-click="openIntervalModal('ram')" 
          />
        </div>
        <div v-if="!ramMetrics?.data?.length" class="no-data">
          Not data!
        </div>
        <table v-else class="metrics-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Total (GB)</th>
              <th>Used (GB)</th>
              <th>Available (GB)</th>
              <th>Usage (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in ramMetrics.data" :key="metric.timestamp">
              <td>{{ formatDate(metric.timestamp) }}</td>
              <td>{{ (metric.ram_total / 1024 / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ (metric.ram_usage / 1024 / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ (metric.ram_available / 1024 / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ (metric.ram_usage / metric.ram_total * 100).toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="server-info">
        <div class="metrics-header">
          <h2>Network</h2>
          <MetricsDropdown 
            :interval="intervals?.net || 60000" 
            @interval-click="openIntervalModal('net')" 
          />
        </div>
        <div v-if="!netMetrics?.data?.length" class="no-data">
          Not data!
        </div>
        <table v-else class="metrics-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Download (MB/s)</th>
              <th>Upload (MB/s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(metric, index) in netMetrics.data" :key="metric.timestamp">
              <td>{{ formatDate(metric.timestamp) }}</td>
              <td>{{ index === 0 ? '0.00' : calcSpeed(metric, netMetrics.data[index-1], 'download') }}</td>
              <td>{{ index === 0 ? '0.00' : calcSpeed(metric, netMetrics.data[index-1], 'upload') }}</td>
              <!--
              <td>{{ (metric.net_download / 1024 / 1024).toFixed(2) }}</td>
              <td>{{ (metric.net_upload / 1024 / 1024).toFixed(2) }}</td>
              -->
            </tr>
          </tbody>
        </table>
      </div>

      <div class="server-info">
        <div class="metrics-header">
          <h2>Logs</h2>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import MetricsDropdown from '~/components/MetricsDropdown.vue'

const route = useRoute()
const { data: server, pending, error, refresh: refreshServer } = await useFetch(`/api/server/${route.params.id}`)
  .catch((err) => {
    console.error('Ошибка при загрузке данных сервера:', err)
    return { data: null, pending: false, error: err }
  })

const { data: intervals } = await useFetch(`/api/server/${route.params.id}/intervals`)
  .catch((err) => {
    console.error('Ошибка при загрузке интервалов:', err)
    return { data: null }
  })

const { data: cpuMetrics, refresh: refreshCpu } = await useFetch(`/api/server/${route.params.id}/cpu`)
  .catch((err) => {
    console.error('Ошибка при загрузке CPU метрик:', err)
    return { data: { success: true, data: [] } }
  })

const { data: diskMetrics, refresh: refreshDisk } = await useFetch(`/api/server/${route.params.id}/disk`)
  .catch((err) => {
    console.error('Ошибка при загрузке Disk метрик:', err)
    return { data: { success: true, data: [] } }
  })

const { data: ramMetrics, refresh: refreshRam } = await useFetch(`/api/server/${route.params.id}/ram`)
  .catch((err) => {
    console.error('Ошибка при загрузке RAM метрик:', err)
    return { data: { success: true, data: [] } }
  })

const { data: netMetrics, refresh: refreshNet } = await useFetch(`/api/server/${route.params.id}/net`)
  .catch((err) => {
    console.error('Ошибка при загрузке Network метрик:', err)
    return { data: { success: true, data: [] } }
  })

const { $notify } = useNuxtApp()

const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString()
}

function calcSpeed(current, previous, type) {
    if (!previous) return 0;
    const bytesDiff = current[`net_${type}`] - previous[`net_${type}`];
    const timeDiff = (current.timestamp - previous.timestamp) / 1000;
    return (bytesDiff / timeDiff / (1024*1024)).toFixed(2);
  }

const calculateCpuUsage = (total, idle) => {
  return 100 - (idle / total * 100)
}

const refreshData = async () => {
  try {
    await Promise.all([
      refreshServer(),
      refreshCpu(),
      refreshDisk(),
      refreshRam(),
      refreshNet()
    ])
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error)
  }
}

const openIntervalModal = (metricType) => {
  // Здесь будет логика открытия модального окна для настройки интервала
  console.log(`Открыть модальное окно для ${metricType}`)
}

const activateServer = async () => {
  $notify.show({
        title: 'Попытка активации',
        body: 'Пытаемся подключиться к серверу. Подождите...'
  });
  try {
    const result = await collectServerMetrics();
    
    if (result && result.success) {
      $notify.show({
        title: 'Сервер активирован',
        body: 'Сервер успешно активирован и метрики собраны'
      });
    } else if (result) {
      $notify.show({
        title: 'Ошибка активации',
        body: result.message || 'Не удалось активировать сервер',
        duration: 7000
      });
    }
  } catch (error) {
    console.error('Ошибка при активации сервера:', error);
    $notify.show({
      title: 'Ошибка',
      body: 'Произошла ошибка при активации сервера',
      duration: 7000
    });
  }
}

const collectServerMetrics = async () => {
  try {
    const result = await $fetch(`/api/server/${route.params.id}/activate`, {
      method: 'POST'
    });
    
    if (result.success) {
      await refreshServer();
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при сборе метрик:', error);
    return { success: false, message: 'Ошибка при подключении к серверу' };
  }
}
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
  cursor: pointer;
}

.update-button:hover {
  background: rgb(78, 78, 134);
}

.up-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background:rgb(54, 100, 64);
  border: 1px solid rgb(70, 133, 84);
  padding: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.up-button:hover {
  background: rgb(70, 133, 84);
}

.edit-button svg {
  display: block;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.metrics-table th,
.metrics-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #242424;
}

.metrics-table th {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

h2 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
}

.metrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>