<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import Icon from '../components/Icon.vue'
import { getCurrentUser, getMySubjects, updateProfile, uploadAvatar } from '../services/api'
import { yearsSince, pluralizeYears, formatDate } from '../utils/date'

const user = ref(null)
const subjects = ref([])
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const fileInput = ref(null)

const form = reactive({
  surname: '',
  name: '',
  patronymic: '',
  email: '',
  phone: '',
  birthDate: '',
  hireDate: '',
  department: '',
})

onMounted(async () => {
  const [userRes, subjectsRes] = await Promise.all([getCurrentUser(), getMySubjects()])
  user.value = userRes
  subjects.value = subjectsRes
  loading.value = false
})

const age = computed(() => (user.value ? yearsSince(user.value.birthDate) : null))
const experience = computed(() => (user.value ? yearsSince(user.value.hireDate) : null))

function startEditing() {
  Object.assign(form, {
    surname: user.value.surname,
    name: user.value.name,
    patronymic: user.value.patronymic,
    email: user.value.email,
    phone: user.value.phone,
    birthDate: user.value.birthDate,
    hireDate: user.value.hireDate,
    department: user.value.department,
  })
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveProfile() {
  saving.value = true
  try {
    user.value = await updateProfile({ ...form })
    isEditing.value = false
  } finally {
    saving.value = false
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Выберите файл изображения')
    return
  }
  const { url } = await uploadAvatar(file)
  user.value = { ...user.value, photo: url }
  e.target.value = ''
}
</script>

<template>
  <div v-if="!loading" class="profile">
    <div class="profile__grid">
      <section class="card profile__main">
        <div class="profile__photo-block">
          <div class="profile__avatar">
            <img v-if="user.photo" :src="user.photo" alt="" />
            <span v-else class="profile__avatar-fallback">{{ user.name.charAt(0) }}{{ user.surname.charAt(0) }}</span>
            <button class="profile__avatar-edit" type="button" @click="openFilePicker" aria-label="Изменить фото">
              <Icon name="camera" :size="14" />
            </button>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="profile__file-input" @change="onFileChange" />
          <span class="profile__photo-hint">Нажмите на фото, чтобы изменить</span>
        </div>

        <div class="profile__details">
          <template v-if="!isEditing">
            <h2>{{ user.fullName }}</h2>
            <div class="profile__role">{{ user.roleLabel }}</div>

            <dl class="profile__info">
              <div class="profile__info-row">
                <dt><Icon name="clock" :size="16" /> Возраст</dt>
                <dd>{{ pluralizeYears(age) }}</dd>
              </div>
              <div class="profile__info-row">
                <dt><Icon name="mail" :size="16" /> Email</dt>
                <dd>{{ user.email }}</dd>
              </div>
              <div class="profile__info-row">
                <dt><Icon name="phone" :size="16" /> Телефон</dt>
                <dd>{{ user.phone }}</dd>
              </div>
              <div class="profile__info-row">
                <dt><Icon name="calendar" :size="16" /> Дата рождения</dt>
                <dd>{{ formatDate(user.birthDate) }}</dd>
              </div>
              <div class="profile__info-row">
                <dt><Icon name="award" :size="16" /> Стаж работы</dt>
                <dd>{{ pluralizeYears(experience) }}</dd>
              </div>
              <div class="profile__info-row">
                <dt><Icon name="briefcase" :size="16" /> Кафедра</dt>
                <dd>{{ user.department }}</dd>
              </div>
            </dl>

            <button class="btn btn--outline" type="button" @click="startEditing">
              <Icon name="edit" :size="15" /> Редактировать профиль
            </button>
          </template>

          <template v-else>
            <h2>Редактирование профиля</h2>

            <div class="profile__form">
              <label class="field">
                <span>Фамилия</span>
                <input v-model="form.surname" type="text" />
              </label>
              <label class="field">
                <span>Имя</span>
                <input v-model="form.name" type="text" />
              </label>
              <label class="field">
                <span>Отчество</span>
                <input v-model="form.patronymic" type="text" />
              </label>
              <label class="field">
                <span>Email</span>
                <input v-model="form.email" type="email" />
              </label>
              <label class="field">
                <span>Телефон</span>
                <input v-model="form.phone" type="tel" />
              </label>
              <label class="field">
                <span>Дата рождения</span>
                <input v-model="form.birthDate" type="date" />
              </label>
              <label class="field">
                <span>Дата приёма на работу</span>
                <input v-model="form.hireDate" type="date" />
              </label>
              <label class="field field--wide">
                <span>Кафедра</span>
                <input v-model="form.department" type="text" />
              </label>
            </div>

            <div class="profile__form-actions">
              <button class="btn btn--primary" type="button" :disabled="saving" @click="saveProfile">
                <Icon name="check" :size="15" /> {{ saving ? 'Сохранение…' : 'Сохранить' }}
              </button>
              <button class="btn btn--outline" type="button" :disabled="saving" @click="cancelEditing">
                <Icon name="x" :size="15" /> Отмена
              </button>
            </div>
          </template>
        </div>
      </section>

      <section class="card profile__subjects">
        <h3>Мои дисциплины</h3>
        <div v-for="subj in subjects" :key="subj.id" class="subject-item">
          <div class="subject-item__name">{{ subj.name }}</div>
          <div class="subject-item__groups">{{ subj.groups.join(', ') }}</div>
        </div>
        <div class="profile__subjects-total">Всего дисциплин: {{ subjects.length }}</div>
      </section>
    </div>
  </div>

  <div v-else class="profile__loading">Загрузка…</div>
</template>

<style scoped>
.profile__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 24px;
}

.profile__main {
  display: flex;
  gap: 28px;
}

.profile__photo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  flex-shrink: 0;
  text-align: center;
}

.profile__avatar {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  background: #EDEFF5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile__avatar-fallback {
  font-size: 34px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.profile__avatar-edit {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile__file-input {
  display: none;
}

.profile__photo-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 10px;
}

.profile__details {
  flex: 1;
  min-width: 0;
}
.profile__details h2 {
  margin: 0 0 2px;
  font-size: 19px;
}
.profile__role {
  color: var(--color-text-muted);
  font-size: 13.5px;
  margin-bottom: 18px;
}

.profile__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 22px;
}
.profile__info-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  font-size: 13.5px;
}
.profile__info-row dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 500;
}
.profile__info-row dd {
  margin: 0;
  font-weight: 600;
}

.profile__form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  color: var(--color-text-muted);
  font-weight: 500;
}
.field--wide {
  grid-column: 1 / -1;
}
.field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  font-size: 13.5px;
  color: var(--color-text);
}
.field input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.profile__form-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border: 1px solid transparent;
}
.btn--outline {
  border-color: var(--color-border);
  background: var(--color-card);
  color: var(--color-primary);
}
.btn--outline:hover {
  background: var(--color-primary-soft);
}
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.profile__subjects h3 {
  margin: 0 0 14px;
  font-size: 14.5px;
}
.subject-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}
.subject-item:last-of-type {
  border-bottom: none;
}
.subject-item__name {
  font-size: 13.5px;
  font-weight: 600;
}
.subject-item__groups {
  font-size: 12.5px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.profile__subjects-total {
  margin-top: 12px;
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.profile__loading {
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

@media (max-width: 860px) {
  .profile__grid {
    grid-template-columns: 1fr;
  }
  .profile__main {
    flex-direction: column;
    align-items: center;
  }
  .profile__form {
    grid-template-columns: 1fr;
  }
}
</style>
