<script setup>
import { ref, reactive } from 'vue';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import axios from 'axios';
import ex from '@/exception.js';
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;

const token = localStorage.getItem('token');
const loading = ref(true);
const total_rows = ref(0);
const emit = defineEmits(['modalDataCustomer']);
const rows = ref(null);

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

const getCustomer = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(`${apiurl}/api/customers/list/${branch}?page=${params.current_page}&perpage=${params.pagesize}`, {
      headers: {
        Authorization: token
      }
    });
    // Inisialisasi nilai awal untuk counter (nomor baris)
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    let dataCustomer = responseData.data.data;
    dataCustomer.forEach((obj, key) => {
      obj.no = counter++;
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataCustomer;
  } catch (error) {
    console.log(error);
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

const filterCustomer = async () => {
  try {
    loading.value = true;
    let convertsearch = '';
    // convertsearch = params.search.replace(/\s/g, '%20');
    convertsearch = encodeURIComponent(params.search);

    const responseData = await axios.get(`${apiurl}/api/customers/${branch}/search?key=${convertsearch}&perpage=${params.pagesize}&page=${params.current_page}`, {
      headers: {
        Authorization: token
      }
    });
    let dataCustomer = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    // Inisialisasi nilai awal untuk counter
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    dataCustomer.forEach((obj, key) => {
      obj.no = counter++;
    });
    rows.value = dataCustomer;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

const selectCustomer = (data) => {
  emit('modalDataCustomer', data);
  $('#modalCustomer').modal('hide');
};

$(document).ready(function () {
  $('#modalCustomer').on('hidden.bs.modal', function (e) {
    params.search = '';
  });
});
//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  filterCustomer();
};

defineExpose({
  getCustomer
});
</script>
<template>
  <div class="modal fade" id="modalCustomer" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Search Customer</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row px-3 mb-2">
            <input v-model="params.search" type="text" class="form-control col-lg-4 col-md-5 col-12" placeholder="Search..." />
          </div>
          <!-- <vue3-datatable :rows="rows" :columns="cols" :loading="loading"> </vue3-datatable> -->
          <vue3-datatable
            :rows="rows"
            :columns="cols"
            :loading="loading"
            :totalRows="total_rows"
            :isServerMode="true"
            :pageSize="params.pagesize"
            @change="changeServer"
            :search="params.search"
            noDataContent="No records found in the database."
          >
            <template #actions="data">
              <div>
                <button type="button" class="btn btn-success btn-sm" @click="selectCustomer(data.value)"><i class="fas fa-check"></i> Select</button>
              </div>
            </template>
          </vue3-datatable>
        </div>
      </div>
    </div>
  </div>
</template>
