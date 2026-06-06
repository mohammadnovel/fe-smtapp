<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()
const appName  = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'

const form     = ref({ email: '', password: '' })
const loading  = ref(false)
const error    = ref('')
const showPass = ref(false)

async function submit() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.value)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Login gagal. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="root">

    <!-- Left brand panel — hidden on mobile -->
    <aside class="brand-panel">
      <div class="brand-inner">
        <div class="brand-logo">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L13.5 7H17L14 11.5L15.5 17L10 14L4.5 17L6 11.5L3 7H6.5L10 2Z" fill="white"/>
            </svg>
          </div>
          <span>{{ appName }}</span>
        </div>

        <div class="brand-copy">
          <h1>Asesmen Kebugaran<br>Jasmani Siswa</h1>
          <p>Catat, analisis, dan laporkan hasil tes kebugaran seluruh siswa dari satu platform.</p>
        </div>

        <ul class="brand-features">
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            5 komponen tes TKJI terstandar
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Laporan otomatis per siswa & kelas
          </li>
          <li>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Akses multi-guru dalam satu sekolah
          </li>
        </ul>
      </div>
    </aside>

    <!-- Right form panel -->
    <main class="form-panel">
      <div class="form-inner">

        <!-- Mobile-only logo -->
        <div class="mobile-logo">
          <div class="brand-icon sm">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L13.5 7H17L14 11.5L15.5 17L10 14L4.5 17L6 11.5L3 7H6.5L10 2Z" fill="white"/>
            </svg>
          </div>
          <span>{{ appName }}</span>
        </div>

        <div class="form-heading">
          <h2>Masuk ke akun</h2>
          <p>Gunakan email dan password yang terdaftar</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="alert-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="11" r=".75" fill="currentColor"/>
          </svg>
          <span>{{ error }}</span>
          <button type="button" @click="error = ''" aria-label="Tutup">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="submit" novalidate>
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="guru@sekolah.id"
              autocomplete="email"
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="pass-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                placeholder="Masukkan password"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="eye-btn"
                :aria-label="showPass ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPass = !showPass"
              >
                <svg v-if="!showPass" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke-linecap="round"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke-linecap="round"/>
                  <path d="M3 3l18 18" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <svg v-if="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" class="spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            {{ loading ? 'Memproses…' : 'Masuk' }}
          </button>
        </form>

        <p class="register-link">
          Belum punya akun?
          <RouterLink to="/register">Daftar sekolah</RouterLink>
        </p>
      </div>
    </main>

  </div>
</template>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.root {
  display: flex;
  min-height: 100vh;
}

/* ─── Brand panel ─── */
.brand-panel {
  display: none;
  width: 420px;
  flex-shrink: 0;
  background-color: #0d2b20;
  color: #fff;
}

@media (min-width: 1024px) {
  .brand-panel { display: flex; align-items: center; justify-content: center; }
}

.brand-inner {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 340px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: .625rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -.01em;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #059669;
  border-radius: .4375rem;
  flex-shrink: 0;
}

.brand-icon.sm {
  width: 1.625rem;
  height: 1.625rem;
}

.brand-copy h1 {
  font-size: 1.625rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -.02em;
  color: #fff;
  margin: 0 0 .75rem;
}

.brand-copy p {
  font-size: .875rem;
  line-height: 1.65;
  color: rgba(255,255,255,.55);
  margin: 0;
}

.brand-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: .625rem;
  font-size: .8125rem;
  color: rgba(255,255,255,.6);
}

.brand-features li svg {
  color: #34d399;
  flex-shrink: 0;
}

/* ─── Form panel ─── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 2rem 1.25rem;
}

.form-inner {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Mobile logo */
.mobile-logo {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .9375rem;
  font-weight: 700;
  color: #0d2b20;
}

@media (min-width: 1024px) {
  .mobile-logo { display: none; }
}

/* Form heading */
.form-heading h2 {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -.02em;
  color: #111827;
  margin: 0 0 .25rem;
}

.form-heading p {
  font-size: .875rem;
  color: #6b7280;
  margin: 0;
}

/* Error alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem .875rem;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: .5rem;
  color: #b91c1c;
  font-size: .8125rem;
}

.alert-error button {
  margin-left: auto;
  color: #f87171;
  cursor: pointer;
  padding: .125rem;
  display: flex;
  transition: color .15s;
}

.alert-error button:hover { color: #b91c1c; }

/* Fields */
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: .375rem;
}

.field label {
  font-size: .8125rem;
  font-weight: 500;
  color: #374151;
}

.field input,
.pass-wrap input {
  width: 100%;
  padding: .625rem .75rem;
  border: 1px solid #d1d5db;
  border-radius: .4375rem;
  font-size: .9375rem;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}

.field input::placeholder,
.pass-wrap input::placeholder {
  color: #9ca3af;
}

.field input:focus,
.pass-wrap input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, .1);
}

.pass-wrap {
  position: relative;
}

.pass-wrap input {
  padding-right: 2.75rem;
}

.eye-btn {
  position: absolute;
  right: .625rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  padding: .25rem;
  cursor: pointer;
  transition: color .15s;
}

.eye-btn:hover { color: #4b5563; }

/* Submit button */
.btn-submit {
  width: 100%;
  margin-top: .25rem;
  padding: .6875rem 1rem;
  background: #059669;
  color: #fff;
  font-size: .9375rem;
  font-weight: 600;
  border-radius: .4375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: background-color .15s;
}

.btn-submit:hover:not(:disabled) { background: #047857; }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; }

/* Spinner */
.spin {
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Register link */
.register-link {
  text-align: center;
  font-size: .875rem;
  color: #6b7280;
  margin: 0;
}

.register-link a {
  color: #059669;
  font-weight: 500;
  text-decoration: none;
  margin-left: .25rem;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
