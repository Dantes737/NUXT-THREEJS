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
  <div class="bg-gray-900 h-screen overflow-hidden">
    <header class="bg-indigo-950/90 sticky top-0 z-50">
      <nav
        class="mx-auto flex flex-row max-w-7xl items-center justify-between px-6 py-3 lg:px-8"
        aria-label="Global"
      >
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <img
              class="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              alt=""
            />
          </a>
        </div>
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
          <a href="#" class="text-sm font-semibold leading-6 text-white"
            >Log in <span aria-hidden="true">&rarr;</span></a
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
