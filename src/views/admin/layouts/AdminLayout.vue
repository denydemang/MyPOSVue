<script setup>
import NavApp from '@/components/NavApp.vue';
import Sidebar from '@/components/SidebarApp.vue';
import Footer from '@/components/FooterApp.vue';
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import auth from '@/auth.js';
// import checkcompany from '@/company.js';

// State untuk menentukan apakah loading sedang aktif atau tidak
const isLoading = ref(true);

const route = useRoute();
const checkauth = async (nameroute) => {
  let name = '';
  switch (nameroute) {
    case 'admin':
      name = 'dashboard';
      break;
    case 'mastercategory':
      name = 'master_category';
      break;
    case 'mastercategory':
      name = 'master_category';
    case 'masterproduct':
      name = 'master_item';
      break;
    case 'masterproductcreate':
      name = 'master_item';
      break;
    case 'masterproductedit':
      name = 'master_item';
      break;
    case 'masteruser':
      name = 'master_user';
      break;
    case 'roleuser':
      name = 'role_user';
      break;
    case 'roleusercreate':
      name = 'master_item';
      break;
    case 'roleuseredit':
      name = 'master_item';
      break;
    case 'mastersupplier':
      name = 'master_supplier';
      break;
    case 'purchase':
      name = 'purchase';
      break;
    case 'purchasereturn':
      name = 'purchase_return';
      break;
    case 'mastercustomer':
      name = 'master_customer';
      break;
    case 'sales':
      name = 'sales';
      break;
    case 'salesreturn':
      name = 'sales_return';
      break;
    case 'grn':
      name = 'grn';
      break;
    case 'inoutitem':
      name = 'stock';
      break;
    default:
      break;
  }
  const isvaliduser = await auth.authadmin(name);
  return isvaliduser;
};
watch(
  () => route.name,
  async () => {
    await checkauth(route.name);
  }
);
onBeforeMount(async () => {
  const isvaliduser = await checkauth(route.name);
  if (isvaliduser) {
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
  z-index: 9999999999999;
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
