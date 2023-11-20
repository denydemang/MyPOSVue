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
const isgrn = ref(false);
const isinoutitem = ref(false);

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
    $('.dropdwonpurchasetrans').stop(true, true).slideUp();
  }
  // SALES TRANSACTION
  // MENU TRANSACTION - SALES TRANSACTION - MASTER CUSTOMER
  if (route.name == 'mastercustomer') {
    ismastercustomer.value = true;
  } else {
    ismastercustomer.value = false;
  }
  // MENU TRANSACTION - SALES TRANSACTION - SALES
  if (route.name == 'sales') {
    issales.value = true;
  } else {
    issales.value = false;
  }
  // MENU TRANSACTION - SALES TRANSACTION - SALES
  if (route.name == 'salesreturn') {
    issalesreturn.value = true;
  } else {
    issalesreturn.value = false;
  }
  if (route.name != 'mastercustomer' && route.name != 'sales' && route.name != 'salesreturn') {
    $('.dropdwonsalestrans').stop(true, true).slideUp();
  }

  // MENU INVENTORY
  // GOODS RECEIVE NOTE
  if (route.name == 'grn') {
    isgrn.value = true;
  } else {
    isgrn.value = false;
  }
  // INVENTORY - GOODS RECEIVE NOTE
  if (route.name == 'inoutitem') {
    isinoutitem.value = true;
  } else {
    isinoutitem.value = false;
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
        <li class="nav-item dropdown" :class="{ active: ismastercustomer | issales | issalesreturn }">
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-th-large"></i> <span>Sales Transaction</span></a>
          <ul class="dropdown-menu dropdwonsalestrans">
            <li :class="{ active: ismastercustomer }"><RouterLink class="nav-link" :to="{ name: 'mastercustomer' }">Master Customer</RouterLink></li>
            <li :class="{ active: issales }"><RouterLink class="nav-link" :to="{ name: 'sales' }">Sales</RouterLink></li>
            <li :class="{ active: issalesreturn }"><RouterLink class="nav-link" :to="{ name: 'salesreturn' }">Sales Return</RouterLink></li>
          </ul>
        </li>
        <li class="menu-header">Inventory</li>
        <li class="nav-item" :class="{ active: isgrn }">
          <RouterLink :to="{ name: 'grn' }" class="nav-link"><i class="far fa-user"></i> <span>Goods Receive Notes</span></RouterLink>
        </li>
        <li class="nav-item" :class="{ active: isinoutitem }">
          <RouterLink :to="{ name: 'inoutitem' }" class="nav-link"><i class="far fa-user"></i> <span>IN OUT PRODUCT/ITEM</span></RouterLink>
        </li>
        <li class="menu-header">Reports</li>
      </ul>
    </aside>
  </div>
</template>
