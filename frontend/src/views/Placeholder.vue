<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="placeholder">
    <div class="placeholder__icon">🛠</div>
    <h2>{{ route.meta.title }}</h2>
    <p>Этот раздел ещё в разработке.</p>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  color: var(--color-text-muted);
}
.placeholder__icon {
  font-size: 32px;
  margin-bottom: 12px;
}
.placeholder h2 {
  margin: 0 0 4px;
  color: var(--color-text);
}
.placeholder p {
  margin: 0;
}
</style>
