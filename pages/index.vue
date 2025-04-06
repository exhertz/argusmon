<script setup>
const { data: servers } = await useFetch('/api/server')
const router = useRouter()

onMounted(() => {
  if (servers.value && servers.value.length > 0) {
    router.push(`/server/${servers.value[0].id}`)
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