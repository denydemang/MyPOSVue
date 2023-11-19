import { createRouter, createWebHistory } from 'vue-router';

import AdminLayout from '@/views/admin/layouts/AdminLayout.vue';
import DashboardView from '@/views/admin/DashboardView';
import MasterCategory from '@/views/admin/master/MasterCategory.vue';
import MasterProduct from '@/views/admin/master/MasterProduct.vue';
import MasterUser from '@/views/admin/master/MasterUser.vue';
import RoleUser from '@/views/admin/master/RoleUser.vue';

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
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
