<script setup>
const { data: servers } = await useFetch('/api/servers')
const router = useRouter()

// Перенаправляем на первый сервер при загрузке главной страницы
onMounted(() => {
  if (servers.value && servers.value.length > 0) {
    router.push(`/servers/${servers.value[0].id}`)
  }
})
</script>

<template>
  <div class="loading">
    Перенаправление...
  </div>
</template>

<style scoped>
.loading {
  font-size: 18px;
  color: #666;
}
</style> 