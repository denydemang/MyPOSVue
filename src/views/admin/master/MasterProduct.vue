<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { iziError, iziSuccess } from '@/izitoast.js';
import axios from 'axios';
import ProductTable from '@/components/ProductTable.vue';

const router = useRouter();

const addNewView = () => {
  router.push({
    name: 'masterproductcreate'
  });
};
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Product</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masterproduct' }">masterproduct</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-12" style="min-height: 100vh">
          <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New Category')"><i class="fas fa-plus"></i> Add New</button>
          <ProductTable />
        </div>
      </div>
    </section>
  </div>
</template>
