<script setup>
import { ref, watch, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import myenc from '@/myencription.js';
import jquery from 'jquery';
import myencription from '@/myencription.js';
const $ = jquery;
const route = useRoute();
const branch = process.env.VUE_APP_BRANCH;
const apiurl = process.env.VUE_APP_API_URL;
const apptitle = ref('');
const appinitialtitle = ref('');
const viewmenu = ref({
  dashboard: 0,
  master_category: 0,
  master_item: 0,
  master_user: 0,
  role_user: 0,
  master_supplier: 0,
  purchase: 0,
  purchase_return: 0,
  master_customer: 0,
  sales: 0,
  sales_return: 0,
  company_profiles: 0,
  grn: 0,
  stock: 0
});

onBeforeMount(() => {
  let accessview =
    localStorage.getItem('accessview') != null && localStorage.getItem('accessview') != '' && localStorage.getItem('accessview') != undefined
      ? localStorage.getItem('accessview')
      : null;
  if (accessview != null) {
    accessview = JSON.parse(accessview);
    accessview.map((item) => {
      item.id_module = parseInt(myenc.decrypt(item.id_module));
      item.sub_menu = myenc.decrypt(item.sub_menu);
      item.xView = parseInt(myenc.decrypt(item.xView));
      return item;
    });
    for (let i = 0; i < accessview.length; i++) {
      switch (accessview[i].sub_menu) {
        case 'dashboard':
          viewmenu.value.dashboard = accessview[i].xView;
          break;
        case 'master_category':
          viewmenu.value.master_category = accessview[i].xView;
          break;
        case 'master_item':
          viewmenu.value.master_item = accessview[i].xView;
          break;
        case 'master_user':
          viewmenu.value.master_user = accessview[i].xView;
          break;
        case 'role_user':
          viewmenu.value.role_user = accessview[i].xView;
          break;
        case 'master_supplier':
          viewmenu.value.master_supplier = accessview[i].xView;
          break;
        case 'purchase':
          viewmenu.value.purchase = accessview[i].xView;
          break;
        case 'purchase_return':
          viewmenu.value.purchase_return = accessview[i].xView;
          break;
        case 'master_customer':
          viewmenu.value.master_customer = accessview[i].xView;
          break;
        case 'sales':
          viewmenu.value.sales = accessview[i].xView;
          break;
        case 'sales_return':
          viewmenu.value.sales_return = accessview[i].xView;
          break;
        case 'company_profiles':
          viewmenu.value.company_profiles = accessview[i].xView;
          break;
        case 'grn':
          viewmenu.value.grn = accessview[i].xView;
          break;
        case 'stock':
          viewmenu.value.stock = accessview[i].xView;
          break;
      }
    }
  }
});

// Sub sub menu
const isadmin = ref(false);
const ismastercategory = ref(false);
const ismasterproduct = ref(false);
const ismasterproductedit = ref(false);
const ismasterproductcreate = ref(false);
const ismasteruser = ref(false);
const isroleuser = ref(false);
const isroleusercreate = ref(false);
const isroleuseredit = ref(false);
const ismastersupplier = ref(false);
const ispurchase = ref(false);
const ispurchasecreate = ref(false);
const ispurchaseedit = ref(false);
const ispurchasereturn = ref(false);
const ismastercustomer = ref(false);
const issales = ref(false);
const issalescreate = ref(false);
const issalesedit = ref(false);
const issalesreturn = ref(false);
const isgrn = ref(false);
const isinoutitem = ref(false);
const iscompanyprofile = ref(false);
let intervalId = null;
const isActive = () => {
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
  if (route.name == 'masterproductcreate') {
    ismasterproductcreate.value = true;
  } else {
    ismasterproductcreate.value = false;
  }
  if (route.name == 'masterproductedit') {
    ismasterproductedit.value = true;
  } else {
    ismasterproductedit.value = false;
  }
  if (!ismastercategory.value && !ismasterproduct.value && !ismasterproductcreate.value && !ismasterproductedit.value) {
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
  if (route.name == 'roleusercreate') {
    isroleusercreate.value = true;
  } else {
    isroleusercreate.value = false;
  }
  if (route.name == 'roleuseredit') {
    isroleuseredit.value = true;
  } else {
    isroleuseredit.value = false;
  }
  if (!ismasteruser.value && !isroleuser.value && !isroleusercreate.value && !isroleuseredit.value) {
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
  if (route.name == 'purchasecreate') {
    ispurchasecreate.value = true;
  } else {
    ispurchasecreate.value = false;
  }
  if (route.name == 'purchaseedit') {
    ispurchaseedit.value = true;
  } else {
    ispurchaseedit.value = false;
  }
  // MENU TRANSACTION - PURCHASE TRANSACTION - PURCHASE RETURN
  if (route.name == 'purchasereturn') {
    ispurchasereturn.value = true;
  } else {
    ispurchasereturn.value = false;
  }
  if (!ismastersupplier.value && !ispurchase.value && !ispurchasecreate.value && !ispurchaseedit.value && !ispurchasereturn.value) {
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
  if (route.name == 'salescreate') {
    issalescreate.value = true;
  } else {
    issalescreate.value = false;
  }
  if (route.name == 'salesedit') {
    issalesedit.value = true;
  } else {
    issalesedit.value = false;
  }
  // MENU TRANSACTION - SALES TRANSACTION - SALES
  if (route.name == 'salesreturn') {
    issalesreturn.value = true;
  } else {
    issalesreturn.value = false;
  }
  if (!ismastercustomer.value && !issales.value && !issalesreturn.value && !issalescreate.value && !issalesedit.value) {
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

  // MENU SETTINGS
  // COMPANY PROFILES
  if (route.name == 'companyprofileadmin') {
    iscompanyprofile.value = true;
  } else {
    iscompanyprofile.value = false;
  }
};

// Memberi Nama Aplikasi Di Sidebar Atas
const getInitials = (text) => {
  let joinstring = '';
  const words = text.split(' ');
  if (words.length > 1) {
    const initials = words.map((word) => word[0]);
    joinstring = initials.join('');
  } else {
    if (text.length > 1) {
      joinstring = text.substring(0, 2);
    } else {
      joinstring = text;
    }
  }
  appinitialtitle.value = joinstring;
};
const populateappname = async () => {
  if (localStorage.getItem('app_name')) {
    const decrypt = myencription.decrypt(localStorage.getItem('app_name'));
    if (decrypt) {
      apptitle.value = decrypt.toUpperCase();
    } else {
      apptitle.value = 'MY POS VUE';
    }
  } else {
    try {
      const responseData = await axios.get(`${apiurl}/api/companyprofiles/detail/${branch}`);
      const appname = responseData.data.data.app_name;
      apptitle.value = appname.toUpperCase();
      localStorage.setItem('app_name', myencription.encrypt(apptitle.value));
    } catch (error) {
      apptitle.value = 'MY POS VUE';
    }
  }
};
//memamntau perubahan nama route yang sedang aktif
watch(
  () => route.name,
  async () => {
    isActive();
  }
);
onMounted(async () => {
  populateappname();
  intervalId = setInterval(() => {
    populateappname();
    getInitials(apptitle.value);
  }, 2000);
  isActive();
});
onBeforeUnmount(async () => {
  clearInterval(intervalId);
});
</script>
<template>
  <div class="main-sidebar sidebar-style-2">
    <aside id="sidebar-wrapper">
      <div class="sidebar-brand">
        <router-link :to="{ name: 'admin' }">{{ apptitle }}</router-link>
      </div>
      <div class="sidebar-brand sidebar-brand-sm">
        <router-link :to="{ name: 'admin' }">{{ appinitialtitle }}</router-link>
      </div>
      <ul class="sidebar-menu">
        <!-- Dashboard -->
        <li class="menu-header" v-if="viewmenu.dashboard">Dashboard</li>
        <li class="nav-item" :class="{ active: isadmin }" v-if="viewmenu.dashboard">
          <router-link class="nav-link" :to="{ name: 'admin' }"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></router-link>
        </li>
        <!-- End Dashboard -->

        <!-- Master menu -->
        <!--  Master Menu Header -->
        <li class="menu-header" v-if="viewmenu.master_category || viewmenu.master_item || viewmenu.master_user || viewmenu.role_user">Master</li>
        <!-- End Master Menu Header -->

        <!-- Master Menu - Product Management -->
        <li
          class="nav-item dropdown"
          v-if="viewmenu.master_category || viewmenu.master_item"
          :class="{ active: ismastercategory || ismasterproduct || ismasterproductcreate || ismasterproductedit }"
        >
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-cubes"></i> <span>Product Management</span></a>
          <ul class="dropdown-menu dropdownproductmanagement">
            <li :class="{ active: ismastercategory }" v-if="viewmenu.master_category">
              <router-link class="nav-link" :to="{ name: 'mastercategory' }">Master Category</router-link>
            </li>
            <li :class="{ active: ismasterproduct || ismasterproductcreate || ismasterproductedit }" v-if="viewmenu.master_item">
              <router-link class="nav-link" :to="{ name: 'masterproduct' }">Master Item/Product</router-link>
            </li>
          </ul>
        </li>
        <!-- End Master Menu - Product Management -->

        <!-- Master Menu - User Management -->
        <li class="nav-item dropdown" :class="{ active: ismasteruser || isroleuser || isroleusercreate || isroleuseredit }" v-if="viewmenu.master_user || viewmenu.role_user">
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="fas fa-user-friends"></i> <span>User Management</span></a>
          <ul class="dropdown-menu dropdownusermanagement">
            <li :class="{ active: ismasteruser }" v-if="viewmenu.master_user"><router-link class="nav-link" :to="{ name: 'masteruser' }">Master User</router-link></li>
            <li :class="{ active: isroleuser || isroleusercreate || isroleuseredit }" v-if="viewmenu.role_user">
              <router-link class="nav-link" :to="{ name: 'roleuser' }">Role User</router-link>
            </li>
          </ul>
        </li>
        <!-- End Master Menu - User Management -->
        <!-- End Master Menu -->

        <!-- Transaction Menu -->
        <!-- Transaction Menu Header -->
        <li
          class="menu-header"
          v-if="viewmenu.master_supplier || viewmenu.purchase || viewmenu.purchase_return || viewmenu.master_customer || viewmenu.sales || viewmenu.sales_return"
        >
          Transaction
        </li>
        <!-- End Transaction Menu Header -->

        <!-- Transaction Menu - Purchase-->
        <li
          class="nav-item dropdown"
          :class="{ active: ismastersupplier | ispurchase | ispurchasecreate | ispurchaseedit | ispurchasereturn }"
          v-if="viewmenu.master_supplier || viewmenu.purchase || viewmenu.purchase_return"
        >
          <a href="#" class="nav-link has-dropdown" data-toggle="dropdown"><i class="far fa-file-alt"></i> <span>Purchase Transaction</span></a>
          <ul class="dropdown-menu dropdwonpurchasetrans">
            <li :class="{ active: ismastersupplier }" v-if="viewmenu.master_supplier">
              <RouterLink class="nav-link" :to="{ name: 'mastersupplier' }">Master Supplier</RouterLink>
            </li>
            <li :class="{ active: ispurchase | ispurchasecreate | ispurchaseedit }" v-if="viewmenu.purchase">
              <RouterLink class="nav-link" :to="{ name: 'purchase' }">Purchase</RouterLink>
            </li>
            <li :class="{ active: ispurchasereturn }" v-if="viewmenu.purchase_return">
              <RouterLink class="nav-link" :to="{ name: 'purchasereturn' }">Purchase Return</RouterLink>
            </li>
          </ul>
        </li>
        <!-- End Transaction Menu - Purchase -->

        <!-- Transaction Menu - Sales -->
        <li
          class="nav-item dropdown"
          :class="{ active: ismastercustomer | issales | issalesreturn | issalescreate | issalesedit }"
          v-if="viewmenu.master_customer || viewmenu.sales || viewmenu.sales_return"
        >
          <a href="#" class="nav-link has-dropdown"><i class="fas fa-th-large"></i> <span>Sales Transaction</span></a>
          <ul class="dropdown-menu dropdwonsalestrans">
            <li :class="{ active: ismastercustomer }" v-if="viewmenu.master_customer">
              <RouterLink class="nav-link" :to="{ name: 'mastercustomer' }">Master Customer</RouterLink>
            </li>
            <li :class="{ active: issales | issalescreate | issalesedit }" v-if="viewmenu.sales"><RouterLink class="nav-link" :to="{ name: 'sales' }">Sales</RouterLink></li>
            <li :class="{ active: issalesreturn }" v-if="viewmenu.sales_return"><RouterLink class="nav-link" :to="{ name: 'salesreturn' }">Sales Return</RouterLink></li>
          </ul>
        </li>
        <!-- End Transaction Menu - Sales -->
        <!-- End Transaction Menu -->

        <!-- Inventory Menu -->
        <li class="menu-header" v-if="viewmenu.grn || viewmenu.stock">Inventory</li>
        <li class="nav-item" :class="{ active: isgrn }" v-if="viewmenu.grn">
          <RouterLink :to="{ name: 'grn' }" class="nav-link"><i class="far fa-user"></i> <span>Goods Receive Notes</span></RouterLink>
        </li>
        <li class="nav-item" :class="{ active: isinoutitem }" v-if="viewmenu.stock">
          <RouterLink :to="{ name: 'inoutitem' }" class="nav-link"><i class="far fa-user"></i> <span>IN OUT PRODUCT/ITEM</span></RouterLink>
        </li>
        <li class="menu-header" v-if="viewmenu.company_profiles">Settings</li>
        <li class="nav-item" :class="{ active: iscompanyprofile }" v-if="viewmenu.company_profiles">
          <RouterLink :to="{ name: 'companyprofileadmin' }" class="nav-link"><i class="far fa-user"></i> <span>Company Profiles</span></RouterLink>
        </li>
        <!-- End Inventory Menu -->

        <li class="menu-header">Reports</li>
      </ul>
    </aside>
  </div>
</template>
