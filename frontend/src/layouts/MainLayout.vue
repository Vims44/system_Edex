<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import Topbar from '../components/Topbar.vue'
import { getFilterOptions } from '../services/api'

const route = useRoute()
const filterOptions = ref({ modes: [], groups: [], subjects: [] })
const filters = ref({ mode: 'teacher', group: '', subject: '' })

onMounted(async () => {
  filterOptions.value = await getFilterOptions()
  filters.value = {
    mode: filterOptions.value.modes[0]?.value ?? '',
    group: filterOptions.value.groups[0]?.value ?? '',
    subject: filterOptions.value.subjects[0]?.value ?? '',
  }
})
</script>

<template>
  <div class="layout">
    <Sidebar />
    <div class="layout__main">
      <Topbar
        :title="route.meta.title"
        :filter-options="filterOptions"
        v-model="filters"
      />
      <main class="layout__content">
        <!-- filters доступны через provide, если понадобятся дочерним экранам -->
        <router-view :filters="filters" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.layout__content {
  flex: 1;
  padding: 24px 28px 40px;
}
</style>
