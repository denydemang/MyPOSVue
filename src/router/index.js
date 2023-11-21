import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';

import AdminLayout from '@/views/admin/layouts/AdminLayout.vue';
import DashboardView from '@/views/admin/DashboardView';
import MasterCategory from '@/views/admin/master/MasterCategory.vue';
import MasterProduct from '@/views/admin/master/MasterProduct.vue';
import MasterUser from '@/views/admin/master/MasterUser.vue';
import RoleUser from '@/views/admin/master/RoleUser.vue';
import MasterSupplier from '@/views/admin/transaction/purchase/MasterSupplier.vue';
import Purchase from '@/views/admin/transaction/purchase/Purchase.vue';
import PurchaseReturn from '@/views/admin/transaction/purchase/PurchaseReturn.vue';
import MasterCustomer from '@/views/admin/transaction/sales/MasterCustomer.vue';
import Sales from '@/views/admin/transaction/sales/Sales.vue';
import SalesReturn from '@/views/admin/transaction/sales/SalesReturn.vue';
import GRN from '@/views/admin/inventory/GRN.vue';
import INOUTITEM from '@/views/admin/inventory/INOUTITEM.vue';
import Page404 from '@/views/Page404.vue';
import Login from '@/views/Login.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: {
      name: 'login'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    redirect: {
      name: 'admin'
    },
    children: [
      {
        path: '',
        name: 'admin',
        component: DashboardView,
        meta: { requiresAuth: true }
      },
      {
        path: 'mastercategory',
        name: 'mastercategory',
        component: MasterCategory,
        meta: { requiresAuth: true }
      },
      {
        path: 'masterproduct',
        name: 'masterproduct',
        component: MasterProduct,
        meta: { requiresAuth: true }
      },
      {
        path: 'masteruser',
        name: 'masteruser',
        component: MasterUser,
        meta: { requiresAuth: true }
      },
      {
        path: 'roleuser',
        name: 'roleuser',
        component: RoleUser,
        meta: { requiresAuth: true }
      },
      {
        path: 'mastersupplier',
        name: 'mastersupplier',
        component: MasterSupplier,
        meta: { requiresAuth: true }
      },
      {
        path: 'purchase',
        name: 'purchase',
        component: Purchase,
        meta: { requiresAuth: true }
      },
      {
        path: 'purchasereturn',
        name: 'purchasereturn',
        component: PurchaseReturn,
        meta: { requiresAuth: true }
      },
      {
        path: 'mastercustomer',
        name: 'mastercustomer',
        component: MasterCustomer,
        meta: { requiresAuth: true }
      },
      {
        path: 'sales',
        name: 'sales',
        component: Sales,
        meta: { requiresAuth: true }
      },
      {
        path: 'salesreturn',
        name: 'salesreturn',
        component: SalesReturn,
        meta: { requiresAuth: true }
      },
      {
        path: 'grn',
        name: 'grn',
        component: GRN,
        meta: { requiresAuth: true }
      },
      {
        path: 'inoutitem',
        name: 'inoutitem',
        component: INOUTITEM,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)',
    name: 'notfound',
    component: Page404
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});
// CODINGAN DIBAWAH DIMATIKAN KARENA JAVASCRIPT UNTUK SIDEBAR DAN  DROPDOWN NYA TIDAK WORK
// MAKA ALTERNATIF LAIN MENGGUNAKN BEFORE MOUNT DI ADMIN DEFAULT LAYOUT

// const apiUrl = process.env.VUE_APP_API_URL;

// const checkuser = async () => {
//   try {
//     const iduser = localStorage.getItem('id');
//     const token = localStorage.getItem('token');
//     if (!iduser || !token) {
//       return false;
//     }
//     const data = await axios.get(`${apiUrl}/api/users/checklogin/${iduser}/${token}`);
//     let getdata = data.data.data.is_login;
//     return getdata;
//   } catch (error) {
//     return false;
//   }
// };

// router.beforeResolve((to, from, next) => {
//   checkuser().then((isAuthenticated) => {
//     setInterval(function () {
//       const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
//       // const isAuthenticated = true;
//       if (requiresAuth && !isAuthenticated) {
//          next('/login');
//       } else if (to.name === 'login' && isAuthenticated) {
//         // Redirect away from the login page if already authenticated
//         next('/');
//       } else {
//         // Continue with the navigation
//         next();
//       }
//     }, 1000);
//   });
// });

// const checkuserlogin = async () => {
//   try {
//     const baseurlapi = inject('baseurlapi');
//     const iduser = localStorage.getItem('id');
//     const token = localStorage.getItem('token');
//     const BASE_URL = 'http://127.0.0.1:8000/';

//     if (!iduser || !token) {
//       return false;
//     }

//     const url = `${baseurlapi}users/checklogin/${iduser}/${token}`;
//     const response = await axios.get(url);
//     console.log(response);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// router.beforeEach(async (to, from, next) => {
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
//   const isAuthenticated = await checkuser();
//   if (requiresAuth && !isAuthenticated) {
//     window.location.href = '/login';
//   } else if (to.name === 'login' && isAuthenticated) {
//     // Redirect away from the login page if already authenticated
//     window.location.href = '/';

//     // next('/');
//   } else {
//     // Continue with the navigation
//     next();
//   }
// });

export default router;
