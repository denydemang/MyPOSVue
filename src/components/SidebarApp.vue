<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import jquery from 'jquery';
const $ = jquery;
const route = useRoute();

// Sub sub menu
const ismasterproduct = ref(false);
const ismastercategory = ref(false);
const isadmin = ref(false);
const ismasteruser = ref(false);
const isroleuser = ref(false);

const isActive = async () => {
  // $dropdown.find('.dropdown-menu').first().stop(true, true).slideUp();
  if (route.name == 'admin') {
    isadmin.value = true;
  } else {
    isadmin.value = false;
  }
  if (route.name == 'mastercategory') {
    ismastercategory.value = true;
  } else {
    ismastercategory.value = false;
  }

  if (route.name == 'masterproduct') {
    ismasterproduct.value = true;
  } else {
    ismasterproduct.value = false;
  }
  if (route.name != 'masterproduct' && route.name != 'mastercategory') {
    $('.dropdownproductmanagement').stop(true, true).slideUp();
  }
  if (route.name == 'masteruser') {
    ismasteruser.value = true;
  } else {
    ismasteruser.value = false;
  }
  if (route.name == 'roleuser') {
    isroleuser.value = true;
  } else {
    isroleuser.value = false;
  }
  if (route.name != 'masteruser' && route.name != 'roleuser') {
    $('.dropdownusermanagement').stop(true, true).slideUp();
  }
};

//memamntau perubahan nama route yang sedang aktif
watch(
  () => route.name,
  async () => {
    isActive();
  }
);
onMounted(() => {
  isActive();
});
</script>
<template>
  <div class="main-sidebar sidebar-style-2">
    <aside id="sidebar-wrapper">
      <div class="sidebar-brand">
        <a href="index.html">Stisla</a>
      </div>
      <div class="sidebar-brand sidebar-brand-sm">
        <a href="index.html">St</a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-header">Dashboard</li>
        <li class="nav-item" :class="{ active: isadmin }">
          <router-link @click="isActive()" class="nav-link" :to="{ name: 'admin' }"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></router-link>
        </li>
        <li class="menu-header">Master</li>
        <li class="nav-item dropdown" @click="isActive()" :class="{ active: ismastercategory | ismasterproduct }">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-cubes"></i> <span>Product Management</span></a>
          <ul class="dropdown-menu dropdownproductmanagement">
            <li :class="{ active: ismastercategory }"><router-link class="nav-link" :to="{ name: 'mastercategory' }">Master Category</router-link></li>
            <li :class="{ active: ismasterproduct }"><router-link class="nav-link" :to="{ name: 'masterproduct' }">Master Item/Product</router-link></li>
            <!-- <li><a class="nav-link" href="layout-top-navigation.html">Top Navigation</a></li> -->
          </ul>
        </li>
        <li class="nav-item dropdown" @click="isActive()" :class="{ active: ismasteruser | isroleuser }">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-user-friends"></i> <span>User Management</span></a>
          <ul class="dropdown-menu dropdownusermanagement">
            <li :class="{ active: ismasteruser }"><router-link class="nav-link" :to="{ name: 'masteruser' }">Master User</router-link></li>
            <li :class="{ active: isroleuser }"><router-link class="nav-link" :to="{ name: 'roleuser' }">Role User</router-link></li>
          </ul>
        </li>
        <li class="menu-header">Transaction</li>
        <!-- <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-th-large"></i> <span>Sales Transaction</span></a>
          <ul class="dropdown-menu">
            <li><RouterLink class="nav-link" to="sdfsd">Master Customer</RouterLink></li>
            <li><RouterLink class="nav-link" to="ssdfsd">Sales</RouterLink></li>
            <li><RouterLink class="nav-link" to="dss">Sales Return</RouterLink></li>
          </ul>
        </li> -->
        <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="far fa-file-alt"></i> <span>Purchase Transaction</span></a>
          <ul class="dropdown-menu">
            <li><a class="nav-link" href="forms-advanced-form.html">Master Supplier</a></li>
            <li><a class="nav-link" href="forms-advanced-form.html">Purchase</a></li>
            <li><a class="nav-link" href="forms-editor.html">Purchase Return</a></li>
          </ul>
        </li>
        <li class="menu-header">Inventory</li>
        <li class="nav-item">
          <a href="#" class="nav-link has-dropdown"><i class="far fa-user"></i> <span>Goods Receive Notes</span></a>
        </li>
        <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-exclamation"></i> <span>Errors</span></a>
          <ul class="dropdown-menu">
            <li><a class="nav-link" href="errors-503.html">503</a></li>
            <li><a class="nav-link" href="errors-403.html">403</a></li>
            <li><a class="nav-link" href="errors-404.html">404</a></li>
            <li><a class="nav-link" href="errors-500.html">500</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-bicycle"></i> <span>Features</span></a>
          <ul class="dropdown-menu">
            <li><a class="nav-link" href="features-activities.html">Activities</a></li>
            <li><a class="nav-link" href="features-post-create.html">Post Create</a></li>
            <li><a class="nav-link" href="features-posts.html">Posts</a></li>
            <li><a class="nav-link" href="features-profile.html">Profile</a></li>
            <li><a class="nav-link" href="features-settings.html">Settings</a></li>
            <li><a class="nav-link" href="features-setting-detail.html">Setting Detail</a></li>
            <li><a class="nav-link" href="features-tickets.html">Tickets</a></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-ellipsis-h"></i> <span>Utilities</span></a>
          <ul class="dropdown-menu">
            <li><a href="utilities-contact.html">Contact</a></li>
            <li><a class="nav-link" href="utilities-invoice.html">Invoice</a></li>
            <li><a href="utilities-subscribe.html">Subscribe</a></li>
          </ul>
        </li>
        <li class="nav-item active">
          <a class="nav-link" href="credits.html"><i class="fas fa-pencil-ruler"></i> <span>Credits</span></a>
        </li>
      </ul>

      <div class="mt-4 mb-4 p-3 hide-sidebar-mini">
        <a href="https://getstisla.com/docs" class="btn btn-primary btn-lg btn-block btn-icon-split"> <i class="fas fa-rocket"></i> Documentation </a>
      </div>
    </aside>
  </div>
</template>
