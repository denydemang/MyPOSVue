<script setup></script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Product</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masterproduct' }">masterproduct</router-link> </span>
      </div>
      <div class="row">
        <h5>ADD NEW PRODUCT</h5>
      </div>
    </section>
  </div>
</template>
