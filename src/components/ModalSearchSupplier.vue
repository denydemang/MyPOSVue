<script setup>
import { ref, onMounted, reactive, defineExpose, defineEmits } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import axios from 'axios';
import ex from '@/exception.js';
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
    { field: 'number_id', title: 'ID Number', isUnique: true },
    { field: 'name', title: 'Supplier Name' },
    { field: 'address', title: 'Address' },
    { field: 'contact', title: 'Contact' },
    { field: 'actions', title: 'Actions' }
  ]) || [];

const getSupplier = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(`${apiurl}/api/suppliers/list/${branch}?page=${params.current_page}&perpage=${params.pagesize}`, {
      headers: {
        Authorization: token
      }
    });
    // Inisialisasi nilai awal untuk counter (nomor baris)
    let counter = params.current_page * params.pagesize - params.pagesize + 1;

    // Menambahkan properti 'no' dengan nilai increment pada setiap objek
    let dataSupplier = responseData.data.data;
    dataSupplier.forEach((obj, key) => {
      obj.no = counter++;
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataSupplier;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }

  loading.value = false;
};
</script>
<template>
  <div class="modal fade" id="modalSupplier" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
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
                <button type="button" data-toggle="modal" data-target="#modalSupplier" class="btn btn-success btn-sm"><i class="fas fa-edit"></i> Pilih</button>
              </div>
            </template>
          </vue3-datatable>
        </div>
      </div>
    </div>
  </div>
</template>
