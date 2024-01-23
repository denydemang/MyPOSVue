<script setup>
import { ref, onMounted, reactive, defineExpose, defineEmits } from 'vue';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import axios from 'axios';
import ex from '@/exception.js';
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;

const token = localStorage.getItem('token');
const loading = ref(true);
const total_rows = ref(0);

const params = reactive({ current_page: 1, pagesize: 10, search: '' });
const cols =
  ref([
    { field: 'no', title: '#', isUnique: true },
    { field: 'cust_no', title: 'ID Cust', isUnique: true },
    { field: 'name', title: 'Customer Name' },
    { field: 'address', title: 'Address' },
    { field: 'phone', title: 'phone' },
    { field: 'actions', title: 'Actions' }
  ]) || [];
</script>
<template>

</template>