<script setup>
import { ref, onMounted, reactive } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import { useRoute, useRouter } from 'vue-router';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import { formatRupiah } from '@/rupiahformatter.js';
import enc from '@/myencription.js';
import ex from '@/exception.js';
import axios from 'axios';
onMounted(() => {
  getApiCategory();
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
const listCategory = ref([]);

const params = reactive({ current_page: 1, pagesize: 10, search: '', orderby: 'id', ascdesc: 'asc', categoryby: '', filterby: 'all' });
const rows = ref(null);
const manageerror = (error, name) => {
  if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
    showerror('Product ' + name + ' Already Used In Transaction Cannot Be Deleted');
  } else {
    showerror('ERROR!!! Internal Server Error');
  }
};
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

const getApiCategory = async () => {
  try {
    const responseDataCategory = await axios.get(`${apiurl}/api/categories/list/1000/${branch}`, {
      headers: {
        Authorization: token
      }
    });
    const categoryData = responseDataCategory.data.data;
    listCategory.value = categoryData;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
    total_rows.value = 0;
    rows.value = null;
  }
};
const getApiProduct = async () => {
  try {
    loading.value = true;

    const responseData = await axios.get(
      `${apiurl}/api/products/list/${params.pagesize}/${branch}?orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}&categoryby=${params.categoryby}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataProduct = responseData.data.data;
    dataProduct.map((item) => {
      return (item.price = formatRupiah(item.price));
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataProduct;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
    total_rows.value = 0;
    rows.value = null;
  }

  loading.value = false;
};
const filterProduct = async () => {
  try {
    loading.value = true;
    let convertsearch = '';
    // convertsearch = params.search.replace(/\s/g, '%20');
    convertsearch = encodeURIComponent(params.search);
    const responseData = await axios.get(
      `${apiurl}/api/products/${branch}/search?orderby=${params.orderby}&key=${convertsearch}&ascdesc=${params.ascdesc}&perpage=${params.pagesize}&page=${params.current_page}&filterby=${params.filterby}&categoryby=${params.categoryby}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataProduct = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;
    dataProduct.map((item) => {
      return (item.price = formatRupiah(item.price));
    });
    total_rows.value = totalAllRows;
    rows.value = dataProduct;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
    total_rows.value = 0;
    rows.value = null;
  }

  loading.value = false;
};
const deleteProduct = async (id, name) => {
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
  params.search = data.search;
  params.orderby = data.sort_column;
  params.ascdesc = data.sort_direction;
  filterProduct();
};
const viewDelete = (data) => {
  showconfirmdelete(data.id, data.name, deleteProduct, 'Product');
};
const viewEdit = (data) => {
  router.push({
    name: 'masterproductedit'
  });
  sessionStorage.setItem('paramsid', enc.encrypt(data.id));
};
const cekvalue = () => {
  params.current_page = 1;
  filterProduct();
};
</script>
<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
    <div class="row">
      <div class="col-lg-6">
        <div style="max-width: 350px">
          <div class="form-group d-lg-flex justify-content-center">
            <label for="categoryby" class="pt-2" style="width: 150px"><p style="font-weight: bold; font-size: 14px">Category By</p></label>
            <select class="form-control" v-model="params.categoryby" @change="cekvalue">
              <option value="">All</option>
              <option :value="category.id" v-for="category in listCategory" :key="category.id">{{ category.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top: -20px">
      <div class="col-lg-6">
        <div class="form-group d-lg-flex">
          <label for="searchby" class="pt-2 mr-4" style="width: 80px"><p style="font-weight: bold; font-size: 14px">Search By</p></label>
          <select class="form-control mr-2" @change="cekvalue" v-model="params.filterby" style="max-width: 100px">
            <option value="all" selected>All</option>
            <option value="barcode">Barcode</option>
            <option value="name">Name</option>
            <option value="brands">Brands</option>
            <option value="price">Price</option>
            <option value="unit">Unit</option>
            <option value="remaining_stock">Remaining Stock</option>
          </select>
          <input v-model="params.search" type="text" class="form-control" style="max-width: 400px" placeholder="Search..." />
        </div>
      </div>
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
