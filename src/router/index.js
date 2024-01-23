import { createRouter, createWebHistory } from 'vue-router';

import AdminLayout from '@/views/admin/layouts/AdminLayout.vue';
import DashboardView from '@/views/admin/DashboardView';
import MasterCategory from '@/views/admin/master/MasterCategory.vue';
import MasterProduct from '@/views/admin/master/MasterProduct.vue';
import MasterProductManage from '@/views/admin/master/MasterProductManage.vue';
import MasterUser from '@/views/admin/master/MasterUser.vue';
import RoleUser from '@/views/admin/master/RoleUser.vue';
import RoleUserManage from '@/views/admin/master/RoleUserManage.vue';
import MasterSupplier from '@/views/admin/transaction/purchase/MasterSupplier.vue';
import Purchase from '@/views/admin/transaction/purchase/Purchase.vue';
import PurchaseManage from '@/views/admin/transaction/purchase/PurchaseManage.vue';
import PurchaseReturn from '@/views/admin/transaction/purchase/PurchaseReturn.vue';
import MasterCustomer from '@/views/admin/transaction/sales/MasterCustomer.vue';
import Sales from '@/views/admin/transaction/sales/Sales.vue';
import SalesReturn from '@/views/admin/transaction/sales/SalesReturn.vue';
import GRN from '@/views/admin/inventory/GRN.vue';
import INOUTITEM from '@/views/admin/inventory/INOUTITEM.vue';
import Page404 from '@/views/Page404.vue';
import CompanyProfile from '@/views/CompanyProfile.vue';
import CompanyProfileAdmin from '@/views/admin/settings/CompanyProfiles.vue';
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
    component: Login,
    meta: {
      title: 'WELCOME TO MYPOSVUE'
    }
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
        meta: {
          title: 'ADMIN DASHBOARD'
        }
      },
      {
        path: 'mastercategory',
        name: 'mastercategory',
        component: MasterCategory,
        meta: {
          title: 'MASTER CATEGORY'
        }
      },
      {
        path: 'masterproduct',
        name: 'masterproduct',
        component: MasterProduct,
        meta: {
          title: 'MASTER PRODUCT/ITEM'
        }
      },
      {
        path: 'masterproduct/create',
        name: 'masterproductcreate',
        component: MasterProductManage,
        meta: {
          title: 'ADD MASTER PRODUCT/ITEM'
        }
      },
      {
        path: 'masterproduct/edit',
        name: 'masterproductedit',
        component: MasterProductManage,
        meta: {
          title: 'EDIT MASTER PRODUCT/ITEM'
        }
      },
      {
        path: 'masteruser',
        name: 'masteruser',
        component: MasterUser,
        meta: {
          title: 'MASTER USER'
        }
      },
      {
        path: 'roleuser',
        name: 'roleuser',
        component: RoleUser,
        meta: {
          title: 'ROLE USER'
        }
      },
      {
        path: 'roleuser/create',
        name: 'roleusercreate',
        component: RoleUserManage,
        meta: {
          title: 'ROLE USER CREATE'
        }
      },
      {
        path: 'roleuser/edit',
        name: 'roleuseredit',
        component: RoleUserManage,
        meta: {
          title: 'ROLE USER EDIT'
        }
      },
      {
        path: 'mastersupplier',
        name: 'mastersupplier',
        component: MasterSupplier,
        meta: {
          title: 'MASTER SUPPLIER'
        }
      },
      {
        path: 'purchase',
        name: 'purchase',
        component: Purchase,
        meta: {
          title: 'PURCHASE TRANSACTION'
        }
      },
      {
        path: 'purchase/create',
        name: 'purchasecreate',
        component: PurchaseManage,
        meta: {
          title: 'ADD NEW PURCHASE TRANSACTION'
        }
      },
      {
        path: 'purchasereturn',
        name: 'purchasereturn',
        component: PurchaseReturn,
        meta: {
          title: 'PURCHASE RETURN TRANSACTION'
        }
      },
      {
        path: 'mastercustomer',
        name: 'mastercustomer',
        component: MasterCustomer,
        meta: {
          title: 'MASTER CUSTOMER'
        }
      },
      {
        path: 'sales',
        name: 'sales',
        component: Sales,
        meta: {
          title: 'SALES TRANSACTION'
        }
      },
      {
        path: 'salesreturn',
        name: 'salesreturn',
        component: SalesReturn,
        meta: {
          title: 'SALES RETURN TRANSACTION'
        }
      },
      {
        path: 'grn',
        name: 'grn',
        component: GRN,
        meta: {
          title: 'GOODS RECEIVES NOTE'
        }
      },
      {
        path: 'inoutitem',
        name: 'inoutitem',
        component: INOUTITEM,
        meta: {
          title: 'IN OUT ITEM TRANSACTION'
        }
      },
      {
        path: 'companyprofile',
        name: 'companyprofileadmin',
        component: CompanyProfileAdmin,
        meta: {
          title: 'EDIT COMPANY PROFILES'
        }
      }
    ]
  },
  {
    path: '/companyprofiles',
    name: 'companyprofile',
    component: CompanyProfile,
    meta: {
      title: 'Register Company Profile'
    }
  },
  {
    path: '/:pathMatch(.*)',
    name: 'notfound',
    component: Page404,
    meta: {
      title: '404 NOT FOUND'
    }
  },
  {
    path: '/notfound',
    name: 'notfoundthrow',
    component: Page404,
    meta: {
      title: '404 NOT FOUND'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Membuat Judul Halaman
router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
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
