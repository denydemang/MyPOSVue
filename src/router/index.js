import { createRouter, createWebHistory } from 'vue-router';

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

const routes = [
  { 
    path: '/',
    name: 'home',
    component: AdminLayout,
    redirect: {
      name: 'admin'
    },
    children: [
      {
        path: 'admin',
        name: 'admin',
        component: DashboardView
      },
      {
        path: '/admin/mastercategory',
        name: 'mastercategory',
        component: MasterCategory
      },
      {
        path: '/admin/masterproduct',
        name: 'masterproduct',
        component: MasterProduct
      },
      {
        path: '/admin/masteruser',
        name: 'masteruser',
        component: MasterUser
      },
      {
        path: '/admin/roleuser',
        name: 'roleuser',
        component: RoleUser
      },
      {
        path: '/admin/mastersupplier',
        name: 'mastersupplier',
        component: MasterSupplier
      },
      {
        path: '/admin/purchase',
        name: 'purchase',
        component: Purchase
      },
      {
        path: '/admin/purchasereturn',
        name: 'purchasereturn',
        component: PurchaseReturn
      },
      {
        path: '/admin/mastercustomer',
        name: 'mastercustomer',
        component: MasterCustomer
      },
      {
        path: '/admin/sales',
        name: 'sales',
        component: Sales
      },
      {
        path: '/admin/salesreturn',
        name: 'salesreturn',
        component: SalesReturn
      },
      {
        path: '/admin/grn',
        name: 'grn',
        component: GRN
      },
      {
        path: '/admin/inoutitem',
        name: 'inoutitem',
        component: INOUTITEM
      },
    ]
  },
  {
    path: '/:pathMatch(.*)',
    name: 'notfound',
    component: Page404
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
