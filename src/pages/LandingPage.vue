<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import http from '@/api/http'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

interface Plan {
  code: string; name: string; price_monthly: number; price_yearly: number
  max_participants: number | null; max_users: number | null
  features: string[]; is_popular: boolean
}

const appName   = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'
const trialDays = ref<number | null>(null)
const plans     = ref<Plan[]>([])
const yearly    = ref(false)
const menuOpen  = ref(false)

onMounted(async () => {
  try {
    const { data } = await http.get('/public/landing')
    trialDays.value = data.trial_days
    plans.value = data.plans
  } catch { /* page still works without live pricing */ }
})

const idr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

// Mirrors config/sport.php ppi_categories
const categories = [
  { min: 90, label: 'Excellent',     color: '#1D9E75' },
  { min: 75, label: 'Good',          color: '#3B82F6' },
  { min: 60, label: 'Average',       color: '#F59E0B' },
  { min: 45, label: 'Below Average', color: '#F97316' },
  { min: 0,  label: 'Poor',          color: '#EF4444' },
]

const features = [
  { title: 'Tes Lyon dan RAST', text: 'Input lap Lyon dan sprint RAST langsung di lapangan. VO₂max, daya, dan indeks kelelahan dihitung sistem.' },
  { title: 'Benchmark kustom', text: 'Pakai standar bawaan, atau tambahkan benchmark sendiri untuk sekolah dan klub Anda.' },
  { title: 'Laporan PDF dan Excel', text: 'Unduh hasil per sesi lengkap dengan grafik, siap dibagikan ke siswa, orang tua, dan pelatih.' },
  { title: 'Peran dan akses menu', text: 'Administrator, guru PJOK, dan pelatih berbagi satu sekolah, tiap peran hanya melihat menu miliknya.' },
  { title: 'Pengingat', text: 'Notifikasi saat trial hampir berakhir, jadwal tes ulang, dan perpanjangan langganan.' },
]

const steps = [
  { title: 'Daftarkan sekolah', text: 'Buat akun sekolah atau klub, lalu undang guru dan pelatih.' },
  { title: 'Catat hasil tes', text: 'Buat sesi tes, pilih peserta, isi hasil dari ponsel atau laptop.' },
  { title: 'Pantau perkembangan', text: 'Lihat skor PPI dan grafik progres, unduh laporan kapan saja.' },
]

const components = ['Fleksibilitas', 'Keseimbangan', 'Kecepatan', 'Power tubuh atas', 'Power tubuh bawah', 'Kelincahan', 'Kekuatan inti', 'Daya tahan otot', 'Kapasitas aerobik', 'Kapasitas anaerobik']

// Sample values for the hero preview, shown to the visitor as an example
const bars = [['Kecepatan', 90], ['Kelincahan', 78], ['Power tubuh bawah', 84], ['Kapasitas aerobik', 69]] as const
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 antialiased">
    <!-- Nav -->
    <header class="bg-primary-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#top" class="flex items-center gap-2.5 text-white">
          <span class="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center font-black text-xs text-primary-900">SA</span>
          <span class="font-bold">{{ appName }}</span>
        </a>
        <nav class="hidden md:flex items-center gap-8 text-sm text-emerald-100/80">
          <a href="#fitur" class="hover:text-white">Fitur</a>
          <a href="#cara-kerja" class="hover:text-white">Cara kerja</a>
          <a href="#harga" class="hover:text-white">Harga</a>
        </nav>
        <div class="hidden md:flex items-center gap-2">
          <ThemeToggle on-dark />
          <RouterLink to="/login" class="text-sm font-medium text-white/90 hover:text-white px-3 py-2">Masuk</RouterLink>
          <RouterLink to="/register" class="inline-flex items-center rounded-md bg-primary-500 hover:bg-emerald-400 text-primary-900 text-sm font-semibold px-4 py-2 transition-colors">Coba gratis</RouterLink>
        </div>
        <button class="md:hidden p-2 text-white" @click="menuOpen = !menuOpen" aria-label="Menu" :aria-expanded="menuOpen">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      <div v-if="menuOpen" class="md:hidden px-4 pb-4 space-y-1 text-sm text-white" @click="menuOpen = false">
        <a href="#fitur" class="block py-2">Fitur</a>
        <a href="#cara-kerja" class="block py-2">Cara kerja</a>
        <a href="#harga" class="block py-2">Harga</a>
        <RouterLink to="/login" class="block py-2 font-medium">Masuk</RouterLink>
        <RouterLink to="/register" class="inline-flex w-full items-center justify-center rounded-md bg-primary-500 text-primary-900 font-semibold px-4 py-2.5">Coba gratis</RouterLink>
      </div>
    </header>

    <!-- Hero -->
    <section id="top" class="bg-primary-900 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div class="min-w-0">
          <h1 class="text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Kebugaran siswa dan atlet,<br />
            <span class="text-emerald-300">terukur jelas.</span>
          </h1>
          <p class="mt-6 text-lg text-emerald-50/80 max-w-xl leading-relaxed">
            Catat hasil tes, hitung skor PPI otomatis, bandingkan dengan benchmark, dan cetak laporan. Semuanya di satu tempat untuk sekolah dan klub olahraga.
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <RouterLink to="/register" class="inline-flex items-center justify-center rounded-md bg-primary-500 hover:bg-emerald-400 text-primary-900 font-bold px-7 py-3.5 transition-colors">
              {{ trialDays ? `Coba gratis ${trialDays} hari` : 'Coba gratis' }}
            </RouterLink>
            <RouterLink to="/login" class="inline-flex items-center justify-center rounded-md border border-white/30 hover:bg-white/10 font-semibold px-7 py-3.5 transition-colors">Masuk</RouterLink>
          </div>
        </div>

        <!-- Example result card -->
        <figure class="min-w-0">
          <div class="rounded-xl bg-white text-gray-900 p-6 sm:p-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm text-gray-500">Skor PPI</p>
                <p class="text-5xl font-extrabold leading-none mt-1">82</p>
              </div>
              <span class="badge-good">Good</span>
            </div>
            <div class="mt-7 space-y-4">
              <div v-for="b in bars" :key="b[0]">
                <div class="flex justify-between text-sm mb-1.5"><span class="text-gray-600">{{ b[0] }}</span><span class="font-semibold">{{ b[1] }}</span></div>
                <div class="h-2 rounded-sm bg-gray-100"><div class="h-2 rounded-sm bg-primary-500" :style="{ width: b[1] + '%' }" /></div>
              </div>
            </div>
          </div>
          <figcaption class="mt-3 text-xs text-emerald-100/80">Contoh tampilan hasil tes, bukan data peserta sebenarnya.</figcaption>
        </figure>
      </div>
    </section>

    <!-- What gets measured -->
    <section class="border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:flex gap-8 items-baseline">
        <p class="font-semibold flex-shrink-0 mb-2 sm:mb-0">10 komponen yang diukur</p>
        <p class="text-gray-600 leading-relaxed">{{ components.join(' · ') }}</p>
      </div>
    </section>

    <!-- Features -->
    <section id="fitur" class="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Satu skor untuk membaca hasil tes</h2>
          <p class="mt-4 text-gray-600 leading-relaxed max-w-lg">
            Nilai tiap tes dibandingkan dengan benchmark sesuai usia dan jenis kelamin, lalu dirangkum menjadi skor PPI. Guru dan pelatih langsung tahu siapa yang perlu perhatian lebih.
          </p>
        </div>
        <ul class="divide-y divide-gray-200 border-y border-gray-200">
          <li v-for="c in categories" :key="c.label" class="flex items-center justify-between py-3.5">
            <span class="flex items-center gap-3 font-medium"><span class="h-3 w-3 rounded-sm" :style="{ background: c.color }" />{{ c.label }}</span>
            <span class="text-sm text-gray-500">skor {{ c.min === 0 ? 'di bawah 45' : c.min + ' ke atas' }}</span>
          </li>
        </ul>
      </div>

      <dl class="mt-20 grid sm:grid-cols-2 gap-x-16 gap-y-10">
        <div v-for="f in features" :key="f.title">
          <dt class="text-lg font-bold">{{ f.title }}</dt>
          <dd class="mt-2 text-gray-600 leading-relaxed">{{ f.text }}</dd>
        </div>
      </dl>
    </section>

    <!-- How it works -->
    <section id="cara-kerja" class="bg-primary-900 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Dari daftar sampai laporan pertama</h2>
        <ol class="divide-y divide-white/15 border-y border-white/15">
          <li v-for="(s, i) in steps" :key="s.title" class="flex gap-5 py-6">
            <span class="text-2xl font-extrabold text-emerald-300 w-8 flex-shrink-0">{{ i + 1 }}</span>
            <div>
              <h3 class="text-lg font-bold">{{ s.title }}</h3>
              <p class="mt-1 text-emerald-50/75">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Pricing -->
    <section id="harga" class="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-xl">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Harga</h2>
          <p class="mt-3 text-gray-600">
            <template v-if="trialDays">Sekolah baru mendapat akses gratis selama {{ trialDays }} hari. </template>Pilih paket saat Anda siap.
          </p>
        </div>
        <div class="inline-flex rounded-md bg-gray-100 p-1 text-sm font-medium" role="group" aria-label="Periode tagihan">
          <button @click="yearly = false" :aria-pressed="!yearly" :class="['px-4 py-1.5 rounded transition', !yearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500']">Bulanan</button>
          <button @click="yearly = true" :aria-pressed="yearly" :class="['px-4 py-1.5 rounded transition', yearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500']">Tahunan</button>
        </div>
      </div>

      <div v-if="plans.length" class="mt-10 grid md:grid-cols-3 gap-5">
        <div v-for="p in plans" :key="p.code"
          :class="['flex flex-col rounded-lg p-7', p.is_popular ? 'bg-primary-900 text-white' : 'border border-gray-200']">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">{{ p.name }}</h3>
            <span v-if="p.is_popular" class="text-xs font-semibold text-emerald-300">Paling banyak dipilih</span>
          </div>
          <p class="mt-5 flex items-baseline gap-1">
            <span class="text-3xl font-extrabold">{{ idr(yearly ? p.price_yearly : p.price_monthly) }}</span>
            <span :class="p.is_popular ? 'text-emerald-100/70' : 'text-gray-500'" class="text-sm">/{{ yearly ? 'tahun' : 'bulan' }}</span>
          </p>
          <ul class="mt-6 space-y-2.5 flex-1">
            <li v-for="f in p.features" :key="f" class="text-sm" :class="p.is_popular ? 'text-emerald-50/90' : 'text-gray-700'">{{ f }}</li>
          </ul>
          <RouterLink to="/register"
            :class="['mt-8 inline-flex items-center justify-center rounded-md font-semibold px-5 py-3 transition-colors',
              p.is_popular ? 'bg-primary-500 hover:bg-emerald-400 text-primary-900' : 'border border-gray-300 hover:bg-gray-50']">
            Mulai gratis
          </RouterLink>
        </div>
      </div>
      <p v-else class="mt-10 text-sm text-gray-500">Daftar harga belum dapat dimuat. Muat ulang halaman, atau lihat paket setelah masuk.</p>
    </section>

    <!-- Closing -->
    <section class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-14 flex flex-wrap items-center justify-between gap-6">
        <p class="text-2xl font-bold max-w-lg">Catat tes pertama sekolah Anda hari ini.</p>
        <RouterLink to="/register" class="inline-flex items-center justify-center rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold px-7 py-3.5 transition-colors">
          {{ trialDays ? `Coba gratis ${trialDays} hari` : 'Coba gratis' }}
        </RouterLink>
      </div>
    </section>

    <footer class="border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
        <span>© {{ new Date().getFullYear() }} {{ appName }}</span>
        <div class="flex gap-6">
          <RouterLink to="/login" class="hover:text-gray-900">Masuk</RouterLink>
          <RouterLink to="/register" class="hover:text-gray-900">Daftar</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>
