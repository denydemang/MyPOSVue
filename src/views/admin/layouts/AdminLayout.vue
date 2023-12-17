<script setup>
import NavApp from '@/components/NavApp.vue';
import Sidebar from '@/components/SidebarApp.vue';
import Footer from '@/components/FooterApp.vue';
import { ref, onBeforeMount } from 'vue';
// import { useRouter } from 'vue-router';
import checkuser from '@/auth.js';

// State untuk menentukan apakah loading sedang aktif atau tidak
const isLoading = ref(true);

onBeforeMount(async () => {
  const isAuthenticated = await checkuser();
  if (!isAuthenticated) {
    window.location.href = '/login';
  } else {
    isLoading.value = false;
  }
});
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-icon"></div>
  </div>
  <div class="main-wrapper">
    <div class="navbar-bg"></div>
    <NavApp />
    <Sidebar />
    <!-- Main Content -->
    <RouterView />
    <Footer />
  </div>
</template>
<style scoped>
/* Style untuk loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999999;
}

/* Gaya untuk loading icon */
.loading-icon {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
