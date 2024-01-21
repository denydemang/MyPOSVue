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
          <input class="form-check-input" @change="filterUser" v-model="selectedOption" type="radio" name="activeradio" id="all" value="all" checked />
          <label class="form-check-label" for="all">All</label>
        </div>
        <div class="form-check mr-2">
          <input class="form-check-input" @change="filterUser" v-model="selectedOption" type="radio" name="activeradio" id="active" value="active" />
          <label class="form-check-label" for="active">Active</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" @change="filterUser" v-model="selectedOption" type="radio" name="activeradio" id="unactive" value="unactive" />
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
        <span v-if="data.value.active" class="badge badge-sm badge-primary"> {{ data.value.active ? 'active' : 'inactive' }}</span>
        <span v-if="!data.value.active" class="badge badge-sm badge-secondary"> {{ data.value.active ? 'active' : 'inactive' }}</span>
      </template>
      <template #actions="data">
        <div>
          <button type="button" data-toggle="modal" data-target="#modalUser" class="btn btn-success btn-sm mr-1" @click="viewEdit(data.value)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm mr-1" @click="viewDelete(data.value)"><i class="fas fa-trash"></i> Delete</button>
          <button type="button" v-if="!data.value.active" class="btn btn-primary btn-sm mr-1" @click="activate(data.value)"><i class="fas fa-check"></i>Activate</button>
          <button type="button" v-if="data.value.active" class="btn btn-secondary-outline btn-sm mr-1" @click="deactivate(data.value)">
            <i class="fas fa-times-circle"></i> Deactivate
          </button>
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
import ex from '@/exception.js';

onMounted(() => {
  getUsers();
});

const emit = defineEmits(['dataUsers']);
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

const manageerror = (error, name) => {
  if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
    showerror('User ' + name + ' Already Used In Transaction Cannot Be Deleted');
  } else {
    showerror('ERROR!!! Internal Server Error');
  }
};
const getUsers = async () => {
  try {
    loading.value = true;
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
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

const deleteUser = async (id, name) => {
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}/api/users/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getUsers();
    iziSuccess('Success', 'Successfully Deleted Users ' + name);
  } catch (error) {
    isdeleting.value = false;
    const exception = new ex(error);
    exception.func500 = manageerror;
    exception.additionaldata = name;
    exception.showError();
  }
};

const filterUser = async () => {
  try {
    loading.value = true;
    let convertsearch = '';
    // convertsearch = params.search.replace(/\s/g, '%20');
    convertsearch = encodeURIComponent(params.search);
    switch (selectedOption.value) {
      case 'all':
        var responseData = await axios.get(`${apiurl}/api/users/search?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}&key=${convertsearch}`, {
          headers: {
            Authorization: token
          }
        });
        break;
      case 'active':
        var responseData = await axios.get(
          `${apiurl}/api/users/search?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}&isactive=1&key=${convertsearch}`,
          {
            headers: {
              Authorization: token
            }
          }
        );
        break;
      case 'unactive':
        var responseData = await axios.get(
          `${apiurl}/api/users/search?branchcode=${branch}&perpage=${params.pagesize}&page=${params.current_page}&isactive=0&key=${convertsearch}`,
          {
            headers: {
              Authorization: token
            }
          }
        );
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
  // if (data.change_type === 'search') {
  //   filterUser();
  // } else {
  filterUser();
  // }
};
const viewEdit = (data) => {
  emit('dataUsers', {
    id: data.id,
    username: data.username,
    id_role: data.id_role,
    name: data.name
  });
  // alert('View data \n' + data.id + ', ' + data.name);
};
const viewDelete = (data) => {
  showconfirmdelete(data.id, data.name, deleteUser, 'User With Name');
};

const activate = async (data) => {
  try {
    await axios.patch(`${apiurl}/api/users/activate/${data.id}`, '', {
      headers: {
        Authorization: token
      }
    });
    iziSuccess('Success', 'Successfully Activate ' + data.username);
    getUsers();
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }
};
const deactivate = async (data) => {
  try {
    await axios.patch(`${apiurl}/api/users/deactivate/${data.id}`, '', {
      headers: {
        Authorization: token
      }
    });
    iziSuccess('Success', 'Successfully Deactivate ' + data.username);
    getUsers();
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }
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
