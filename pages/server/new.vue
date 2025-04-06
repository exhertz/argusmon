<template>
    <div class="layout-topbar">
      <div class="topbar-left">
        Add Server
      </div>
    </div>
    <div class="layout-content">
      <form @submit.prevent="handleSubmit" class="server-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            required
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label for="ip">IP address</label>
          <input 
            type="text" 
            id="ip" 
            v-model="form.ip" 
            required
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label for="port">Agent port</label>
          <input 
            type="number" 
            id="port" 
            v-model="form.port" 
            required
            class="form-input"
          >
        </div>
        <button type="submit" class="submit-button">Add</button>
      </form>
    </div>
</template>

<script setup>
const form = ref({
  name: '',
  ip: '',
  port: ''
})

const handleSubmit = async () => {
  try {
    const response = await fetch('/api/server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    
    if (response.ok) {
      // Очищаем форму после успешной отправки
      form.value = {
        name: '',
        ip: '',
        port: ''
      }
    }
  } catch (error) {
    console.error('Ошибка при отправке формы:', error)
  }
}
</script>

<style scoped>

.server-form {
  max-width: 500px;
  background: #18181b;
  padding: 1rem;
  border: 1px solid #242424;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #E1DFE1;
}

.form-input {
  width: 96%;
  padding: 0.5rem;
  background: #242424;
  border: 1px solid #3f3f46;
  color: #E1DFE1;
}

.form-input:focus {
  outline: none;
  border-color: rgb(36, 75, 182);;
}

.submit-button {
  width: 100%;
  padding: 0.5rem;
  background:rgb(36, 75, 182);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background:rgb(31, 65, 156);
}

.layout-topbar {
  padding: .75rem .5rem;
  border-bottom: 1px solid #242424;
  position: static;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
}

.layout-content {
  padding-top: 2rem;
}
</style> 