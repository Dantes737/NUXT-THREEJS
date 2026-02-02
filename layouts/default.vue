<script setup>
const route = useRoute();
const routeName = computed(() => route.name);

const navigation = [
  { label: "Home", name: "index", href: "/" },
  { label: "Bounce", name: "bounce", href: "/bounce" },
  { label: "Earth", name: "earth", href: "/earth" },
];
</script>

<template>
  <div class="bg-gray-900 h-screen overflow-scroll">
    <header class="bg-indigo-950/90 sticky top-0 z-50">
      <nav
        class="mx-auto flex flex-row max-w-7xl items-center gap-10 px-4 py-3 lg:px-6"
        aria-label="Global"
      >
        <NuxtLink to="/" class="font-bold text-xl text-emerald-500"
          >Nuxt 3</NuxtLink
        >
        <div class="flex gap-x-12">
          <NuxtLink
            :to="item.href"
            v-for="item in navigation"
            :key="item.name"
            :class="[
              'font-semibold text-sm hover:drop-shadow-[0_0px_10px_rgba(255,255,255,0.95)] hover:text-white',
              routeName === item.name
                ? 'drop-shadow-[0_0px_10px_rgb(77,210,255)] text-emerald-500'
                : 'text-white/80',
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
        <div class="flex flex-1 justify-end">
          <span class="text-sm font-semibold leading-6 text-white"
            >Log in <span aria-hidden="true">&rarr;</span></span
          >
        </div>
      </nav>
    </header>
    <div>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
