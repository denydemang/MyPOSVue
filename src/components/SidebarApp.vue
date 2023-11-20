<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import jquery from 'jquery';
const $ = jquery;
const route = useRoute();

// Sub sub menu
const isadmin = ref(false);
const ismastercategory = ref(false);
const ismasterproduct = ref(false);
const ismasteruser = ref(false);
const isroleuser = ref(false);
const ismastersupplier = ref(false);
const ispurchase = ref(false);
const ispurchasereturn = ref(false);
const ismastercustomer = ref(false);
const issales = ref(false);
const issalesreturn = ref(false);

const isActive = async () => {
  // ADMIN MENU/DASHBOARD
  if (route.name == 'admin') {
    isadmin.value = true;
  } else {
    isadmin.value = false;
  }

  // MASTER MENU
  // MASTER MENU - PRODUCT MANAGEMENT
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
  // MASTER MENU - USER MANAGEMENT
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

  // MENU TRANSACTION
  // PURCHASE TRANSACTION
  // MENU TRANSACTION - PURCHASE TRANSACTION - MASTER SUPPLIER
  if (route.name == 'mastersupplier') {
    ismastersupplier.value = true;
  } else {
    ismastersupplier.value = false;
  }
  // MENU TRANSACTION - PURCHASE TRANSACTION - PURCHASE
  if (route.name == 'purchase') {
    ispurchase.value = true;
  } else {
    ispurchase.value = false;
  }
  // MENU TRANSACTION - PURCHASE TRANSACTION - PURCHASE RETURN
  if (route.name == 'purchasereturn') {
    ispurchasereturn.value = true;
  } else {
    ispurchasereturn.value = false;
  }
  if (route.name != 'mastersupplier' && route.name != 'purchase' && route.name != 'purchasereturn') {
    $('.dropdwonsalestrans').stop(true, true).slideUp();
  }
  // SALES TRANSACTION
  // MENU TRANSACTION - SALES TRANSACTION - MASTER CUSTOMER
  if (route.name == 'mastercustomer') {
    ismastercustomer.value = true;
  } else {
    ismastercustomer.value = false;
  }
  if (route.name == 'sales') {
    issales.value = true;
  } else {
    issales.value = false;
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
          <router-link class="nav-link" :to="{ name: 'admin' }"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></router-link>
        </li>
        <li class="menu-header">Master</li>
        <li class="nav-item dropdown" :class="{ active: ismastercategory | ismasterproduct }">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-cubes"></i> <span>Product Management</span></a>
          <ul class="dropdown-menu dropdownproductmanagement">
            <li :class="{ active: ismastercategory }"><router-link class="nav-link" :to="{ name: 'mastercategory' }">Master Category</router-link></li>
            <li :class="{ active: ismasterproduct }"><router-link class="nav-link" :to="{ name: 'masterproduct' }">Master Item/Product</router-link></li>
            <!-- <li><a class="nav-link" href="layout-top-navigation.html">Top Navigation</a></li> -->
          </ul>
        </li>
        <li class="nav-item dropdown" :class="{ active: ismasteruser | isroleuser }">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-user-friends"></i> <span>User Management</span></a>
          <ul class="dropdown-menu dropdownusermanagement">
            <li :class="{ active: ismasteruser }"><router-link class="nav-link" :to="{ name: 'masteruser' }">Master User</router-link></li>
            <li :class="{ active: isroleuser }"><router-link class="nav-link" :to="{ name: 'roleuser' }">Role User</router-link></li>
          </ul>
        </li>
        <li class="menu-header">Transaction</li>
        <li class="nav-item dropdown" :class="{ active: ismastersupplier | ispurchase | ispurchasereturn }">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="far fa-file-alt"></i> <span>Purchase Transaction</span></a>
          <ul class="dropdown-menu dropdwonpurchasetrans">
            <li :class="{ active: ismastersupplier }"><RouterLink class="nav-link" :to="{ name: 'mastersupplier' }">Master Supplier</RouterLink></li>
            <li :class="{ active: ispurchase }"><RouterLink class="nav-link" :to="{ name: 'purchase' }">Purchase</RouterLink></li>
            <li :class="{ active: ispurchasereturn }"><RouterLink class="nav-link" :to="{ name: 'purchasereturn' }">Purchase Return</RouterLink></li>
          </ul>
        </li>
        <li class="nav-item dropdown">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-th-large"></i> <span>Sales Transaction</span></a>
          <ul class="dropdown-menu dropdwonsalestrans">
            <li><RouterLink class="nav-link" :to="{ name: 'masteruser' }">Master Customer</RouterLink></li>
            <li><RouterLink class="nav-link" :to="{ name: 'masteruser' }">Sales</RouterLink></li>
            <li><RouterLink class="nav-link" :to="{ name: 'masteruser' }">Sales Return</RouterLink></li>
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
