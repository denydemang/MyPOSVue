<script setup>
import { ref, onMounted, reactive, defineExpose, defineEmits } from 'vue';
import { iziInfo, iziError, iziSuccess, iziWarning } from '@/izitoast.js';
import { useRoute, useRouter } from 'vue-router';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import { formatter } from '@/rupiahformatter.js';
import enc from '@/myencription.js';
import axios from 'axios';
onMounted(() => {
  getApiProduct();
});
const router = useRouter();
const route = useRoute();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');

const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);

const params = reactive({ current_page: 1, pagesize: 10, search: '', orderby: 'id', ascdesc: 'asc' });
const rows = ref(null);

const cols =
  ref([
    { field: 'rownumber', title: '#', isUnique: true },
    { field: 'barcode', title: 'Barcode', isUnique: true },
    { field: 'name', title: 'Name', sort: true, width: '15%' },
    { field: 'brands', title: 'Brands', sort: true },
    { field: 'category', title: 'Category', sort: true },
    { field: 'unit', title: 'Unit', sort: true },
    { field: 'price', title: 'Price', sort: true, width: '15%' },
    { field: 'maxstock', title: 'Max Stock', sort: true },
    { field: 'minstock', title: 'Min Stock', sort: true },
    { field: 'remaining_stock', title: 'Remaining Stock' },
    { field: 'actions', title: 'Actions', sort: false }
  ]) || [];

const getApiProduct = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(
      `${apiurl}/api/products/list/${params.pagesize}/${branch}?orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataProduct = responseData.data.data;
    dataProduct.map((item) => {
      return (item.price = formatter.format(item.price));
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataProduct;
  } catch (error) {
    console.log(error);
    total_rows.value = 0;
    rows.value = null;
  }

  loading.value = false;
};
const filterProduct = async () => {
  try {
    loading.value = true;
    let convertsearch = '';
    convertsearch = params.search.replace(/\s/g, '%');
    const responseData = await axios.get(`${apiurl}/api/products/${branch}/search?key=${convertsearch}&perpage=${params.pagesize}&page=${params.current_page}`, {
      headers: {
        Authorization: token
      }
    });
    let dataProduct = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;
    dataProduct.map((item) => {
      return (item.price = formatter.format(item.price));
    });
    total_rows.value = totalAllRows;
    rows.value = dataProduct;
  } catch (error) {
    console.log(error);
    total_rows.value = 0;
    rows.value = null;
  }

  loading.value = false;
};
const deleteProduct = async (id, name) => {
  console.log([id, name]);
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}/api/products/${branch}/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getApiProduct();
    iziSuccess('Success', 'Successfully Deleted Product ' + name);
  } catch (error) {
    isdeleting.value = false;
    if (error.message == 'Request failed with status code 500') {
      if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
        showerror('Product ' + name + ' Already Used In Transaction Cannot Be Deleted');
      } else {
        showerror('ERROR!!! Internal Server Error');
      }
    } else {
      showerror('ERROR!!! Internal Server Error');
    }
  }
};

//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  params.orderby = data.sort_column;
  params.ascdesc = data.sort_direction;
  if (data.change_type === 'sort') {
    getApiProduct();
  } else if (data.change_type === 'search') {
    filterProduct();
  } else {
    getApiProduct();
  }
};
const viewDelete = (data) => {
  showconfirmdelete(data, deleteProduct, 'Product');
};
const viewEdit = (data) => {
  router.push({
    name: 'masterproductedit'
  });
  sessionStorage.setItem('paramsid', enc.encrypt(data.id));
};
</script>
<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
    <div class="row px-3 mb-2">
      <input v-model="params.search" type="text" class="form-control col-lg-3 col-md-4 col-12" placeholder="Search..." />
    </div>
    <vue3-datatable
      :rows="rows"
      :columns="cols"
      :loading="loading"
      :totalRows="total_rows"
      :isServerMode="true"
      :pageSize="params.pagesize"
      @change="changeServer"
      :search="params.search"
      :sortable="true"
      :stickyHeader="true"
      height="600px"
      noDataContent="No records found in the database"
      :stickyFirstColumn="true"
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
