<script setup>
import NavApp from '@/components/NavApp.vue';
import Sidebar from '@/components/SidebarApp.vue';
import Footer from '@/components/FooterApp.vue';
</script>

<template>
  <div class="main-wrapper">
    <div class="navbar-bg"></div>
    <NavApp />
    <Sidebar />
    <!-- Main Content -->
    <RouterView />
    <Footer />
  </div>
</template>
