<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import checkview from '@/access.js';
import RoleTable from '@/components/RoleTable.vue';

const router = useRouter();
onBeforeMount(() => {
  if (!checkview('role_user')) {
    router.push({
      name: 'notfoundthrow'
    });
  }
});
const addNewView = () => {
  router.push({
    name: 'roleusercreate'
  });
};
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Role User</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'roleuser' }">roleuser</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <button class="btn btn-primary mt-2 mb-3" @click="addNewView()"><i class="fas fa-plus"></i> Add New</button>
          <RoleTable />
        </div>
      </div>
    </section>
  </div>
</template>
