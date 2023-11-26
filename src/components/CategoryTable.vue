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
  getCategory();
});

const emit = defineEmits(['dataCategory']);

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
    { field: 'id', title: 'ID', isUnique: true, hide: true },
    { field: 'name', title: 'Name', sort: true },
    { field: 'actions', title: 'Actions' }
  ]) || [];

const getCategory = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(`${apiurl}/api/categories/list/${params.pagesize}/${branch}?page=${params.current_page}`, {
      headers: {
        Authorization: token
      }
    });
    // Inisialisasi nilai awal untuk counter (nomor baris)
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    let dataCategory = responseData.data.data;
    dataCategory.forEach((obj, key) => {
      obj.no = counter++;
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataCategory;
    console.log(dataCategory);
  } catch (error) {
    console.log(error);
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
    getCategory();
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
    console.log(dataCategory);
    rows.value = dataCategory;
  } catch (error) {
    console.log(error);
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
    getCategory();
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
  showconfirmdelete(data, deleteCategory);
};
//mengekspose function agar function getCategory bisa di jalankan di component parent
defineExpose({
  getCategory
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
