<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  title: { type: String, required: true },
  filterOptions: { type: Object, required: true },
  modelValue: { type: Object, required: true }, // { mode, group, subject }
  visibleFilters: { type: Array, default: () => ['mode', 'group', 'subject'] },
})
const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="topbar__menu" type="button" aria-label="Меню">
        <Icon name="menu" :size="20" />
      </button>
      <h1>{{ title }}</h1>
    </div>

    <div class="topbar__filters">
      <label class="filter" v-if="visibleFilters.includes('mode')">
        <span class="filter__label">Режим:</span>
        <select :value="modelValue.mode" @change="update('mode', $event.target.value)">
          <option v-for="opt in filterOptions.modes" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="filter" v-if="visibleFilters.includes('group')">
        <span class="filter__label">Группа:</span>
        <select :value="modelValue.group" @change="update('group', $event.target.value)">
          <option v-for="opt in filterOptions.groups" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>

      <label class="filter" v-if="visibleFilters.includes('subject')">
        <span class="filter__label">Дисциплина:</span>
        <select :value="modelValue.subject" @change="update('subject', $event.target.value)">
          <option v-for="opt in filterOptions.subjects" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar__menu {
  border: none;
  background: transparent;
  color: var(--color-text);
  display: flex;
}

.topbar h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.topbar__filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  background: var(--color-card);
}

.filter__label {
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.filter select {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.filter select:focus {
  outline: none;
}
</style>
