<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
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
          <button type="button" data-toggle="modal" data-target="#modalCustomer" class="btn btn-success btn-sm" @click="viewEdit(data.value)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="viewDelete(data.value)"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive, defineExpose, defineEmits } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import axios from 'axios';
import ex from '@/exception.js';
onMounted(() => {
  getCustomer();
});

const emit = defineEmits(['dataCustomer']);

const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;

const token = localStorage.getItem('token');
const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);

const params = reactive({ current_page: 1, pagesize: 10, search: '' });
const rows = ref(null);
const manageerror = (error, name) => {
  if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
    showerror('Customer ' + name + ' Already Used In Transaction Cannot Be Deleted');
  } else {
    showerror('ERROR!!! Internal Server Error');
  }
};
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
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

const deleteCustomer = async (id, name) => {
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}/api/customers/${branch}/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    filterCustomer();
    iziSuccess('Success', 'Successfully Deleted Customer ' + name);
  } catch (error) {
    isdeleting.value = false;
    const exception = new ex(error);
    exception.func500 = manageerror;
    exception.additionaldata = name;
    exception.showError();
  }
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
    let dataCategory = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    // Inisialisasi nilai awal untuk counter
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    dataCategory.forEach((obj, key) => {
      obj.no = counter++;
    });
    rows.value = dataCategory;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  filterCustomer();
};
const viewEdit = (data) => {
  emit('dataCustomer', {
    id: data.id,
    name: data.name,
    cust_no: data.cust_no,
    address: data.address,
    phone: data.phone
  });
  // alert('View data \n' + data.id + ', ' + data.name);
};
const viewDelete = (data) => {
  showconfirmdelete(data, deleteCustomer, 'Customer');
};
//mengekspose function agar function getCustomer bisa di jalankan di component parent
defineExpose({
  getCustomer
});
</script>
<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* Warna latar belakang transparan */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Pastikan lebih tinggi dari elemen lain di halaman */
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
