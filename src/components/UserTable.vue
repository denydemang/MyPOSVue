<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
    <div class="row mb-2 px-3 d-flex justify-content-between">
      <div>
        <input v-model="params.search" type="text" class="form-control" placeholder="Search..." />
      </div>
      <div class="d-flex">
        <div class="form-check mr-2">
          <input class="form-check-input" @change="getUsers" v-model="selectedOption" type="radio" name="activeradio" id="all" value="all" checked />
          <label class="form-check-label" for="all">All</label>
        </div>
        <div class="form-check mr-2">
          <input class="form-check-input" @change="getUsers" v-model="selectedOption" type="radio" name="activeradio" id="active" value="active" />
          <label class="form-check-label" for="active">Active</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" @change="getUsers" v-model="selectedOption" type="radio" name="activeradio" id="unactive" value="unactive" />
          <label class="form-check-label" for="unactive">Inactive</label>
        </div>
      </div>
    </div>
    <!-- <vue3-datatable :rows="rows" :columns="cols" :loading="loading"> </vue3-datatable> -->
    <vue3-datatable
      :rows="rows"
      :columns="cols"
      :loading="loading"
      :totalRows="total_rows"
      :isServerMode="true"
      @change="changeServer"
      :search="params.search"
      noDataContent="No records found in the database."
    >
      <template #active="data">
        <span v-if="data.value.active" class="badge badge-sm badge-warning"> {{ data.value.active ? 'active' : 'inactive' }}</span>
        <span v-if="!data.value.active" class="badge badge-sm badge-danger"> {{ data.value.active ? 'active' : 'inactive' }}</span>
      </template>
      <template #actions="data">
        <div>
          <button type="button" data-toggle="modal" data-target="#modalCategory" class="btn btn-success btn-sm" @click="viewEdit(data.value)">
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
import { iziInfo, iziError, iziSuccess, iziWarning } from '@/izitoast.js';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import axios from 'axios';
onMounted(() => {
  getUsers();
});

const emit = defineEmits(['dataUser']);
const selectedOption = ref('all');

const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;

const token = localStorage.getItem('token');
const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);

const params = reactive({ current_page: 1, pagesize: 10, search: '' });
const rows = ref(null);

const cols =
  ref([
    { field: 'no', title: '#', isUnique: true },
    { field: 'username', title: 'Username', isUnique: true },
    { field: 'name', title: 'Name' },
    { field: 'role', title: 'Role' },
    { field: 'active', title: 'Status' },
    { field: 'actions', title: 'Actions' }
  ]) || [];

const getUsers = async () => {
  try {
    loading.value = true;
    console.log(selectedOption.value);
    switch (selectedOption.value) {
      case 'all':
        var responseData = await axios.get(`${apiurl}/api/users?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}`, {
          headers: {
            Authorization: token
          }
        });
        break;
      case 'active':
        var responseData = await axios.get(`${apiurl}/api/users?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}&isactive=1`, {
          headers: {
            Authorization: token
          }
        });
        break;
      case 'unactive':
        var responseData = await axios.get(`${apiurl}/api/users?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}&isactive=0`, {
          headers: {
            Authorization: token
          }
        });
        break;
    }
    // Inisialisasi nilai awal untuk counter (nomor baris)
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    let dataUsers = responseData.data.data.data;
    dataUsers.forEach((obj, key) => {
      obj.no = counter++;
    });
    let totalAllRows = responseData.data.data.total;
    total_rows.value = totalAllRows;
    rows.value = dataUsers;
  } catch (error) {
    console.log(error);
    if (error.message == 'Network Error') {
      showerror('ERROR ! The Server Connection Cannot Be Reached');
    } else {
      showerror('Error ! Got Problem With Internal Server');
    }
  }

  loading.value = false;
};

const deleteCategory = async (id, name) => {
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}/api/categories/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getUsers();
    iziSuccess('Success', 'Successfully Deleted Category ' + name);
  } catch (error) {
    isdeleting.value = false;
    if (error.message == 'Request failed with status code 500') {
      if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
        showerror('Category ' + name + ' Already Used In Transaction Cannot Be Deleted');
      } else {
        showerror('ERROR!!! Internal Server Error');
      }
    } else {
      showerror('ERROR!!! Internal Server Error');
    }
  }
};

const filterCategory = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(`${apiurl}/api/categories/${branch}/search?key=${params.search}&perpage=${params.pagesize}&page=${params.current_page}`, {
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
    if (error.message == 'Network Error') {
      showerror('ERROR ! The Server Connection Cannot Be Reached');
    } else {
      showerror('Error ! Got Problem With Internal Server');
    }
  }

  loading.value = false;
};

//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  if (data.change_type === 'search') {
    filterCategory();
  } else {
    getUsers();
  }
};
const viewEdit = (data) => {
  emit('dataCategory', [
    {
      id: data.id,
      name: data.name
    }
  ]);
  // alert('View data \n' + data.id + ', ' + data.name);
};
const viewDelete = (data) => {
  showconfirmdelete(data, deleteCategory, 'Category');
};
//mengekspose function agar function getUsers bisa di jalankan di component parent
defineExpose({
  getUsers
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
