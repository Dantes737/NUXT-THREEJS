<script setup>
import { ref } from "vue";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Test Shape", href: "/icosahedron" },
  { name: "Earth", href: "/earth" },
  { name: "Three City", href: "/city" },
];
</script>

<template>
  <div class="bg-gray-900 h-dvh">
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
            class="text-sm font-semibold leading-6 text-white"
            >{{ item.name }}</NuxtLink
          >
        </div>
        <div class="flex flex-1 justify-end">
          <a href="#" class="text-sm font-semibold leading-6 text-white"
            >Log in <span aria-hidden="true">&rarr;</span></a
          >
        </div>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
