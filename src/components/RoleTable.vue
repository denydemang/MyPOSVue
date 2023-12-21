<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
    <!-- <vue3-datatable :rows="rows" :columns="cols" :loading="loading"> </vue3-datatable> -->
    <vue3-datatable
      :rows="rows"
      :columns="cols"
      :loading="loading"
      :totalRows="total_rows"
      :isServerMode="true"
      @change="changeServer"
      noDataContent="No records found in the database."
    >
      <template #actions="data">
        <div>
          <button type="button" data-toggle="modal" data-target="#modalUser" class="btn btn-success btn-sm mr-1" @click="viewEdit(data.value)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm mr-1" @click="viewDelete(data.value)"><i class="fas fa-trash"></i> Delete</button>
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
  getRoles();
});

const emit = defineEmits(['dataRoles']);

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
    { field: 'name', title: 'Name', isUnique: true },
    { field: 'actions', title: 'Actions' }
  ]) || [];

const manageerror = (error, name) => {
  if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
    showerror('User ' + name + ' Already Used In Transaction Cannot Be Deleted');
  } else {
    showerror('ERROR!!! Internal Server Error');
  }
};
const getRoles = async () => {
  try {
    loading.value = true;
    const responseData = await axios.get(`${apiurl}/api/roles/list/${branch}`, {
      headers: {
        Authorization: token
      }
    });

    // Inisialisasi nilai awal untuk counter (nomor baris)
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    let dataRoles = responseData.data.data;
    console.log(dataRoles);
    dataRoles.forEach((obj, key) => {
      obj.no = counter++;
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataRoles;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};

const deleteRoles = async (id, name) => {
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}/api/roles/int/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getRoles();
    iziSuccess('Success', 'Successfully Deleted Roles ' + name);
  } catch (error) {
    isdeleting.value = false;
    const exception = new ex(error);
    exception.func500 = manageerror;
    exception.additionaldata = name;
    exception.showError();
  }
};

//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  getRoles();
};
// const viewEdit = (data) => {
//   emit('dataUsers', {
//     id: data.id,
//     username: data.username,
//     id_role: data.id_role,
//     name: data.name
//   });
//   // alert('View data \n' + data.id + ', ' + data.name);
// };
const viewDelete = (data) => {
  showconfirmdelete(data, deleteRoles, 'Roles With Name');
};
//mengekspose function agar function getRoles bisa di jalankan di component parent
defineExpose({
  getRoles
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
