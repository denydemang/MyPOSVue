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
  getApiProduct();
});
const router = useRouter();
const route = useRoute();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const filterby = ref('all');
const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);

const params = reactive({ current_page: 1, pagesize: 10, search: '', orderby: 'id', ascdesc: 'asc' });
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
    convertsearch = params.search.replace(/\s/g, '%');
    const responseData = await axios.get(
      `${apiurl}/api/products/${branch}/search?orderby=${params.orderby}&key=${convertsearch}&ascdesc=${params.ascdesc}&perpage=${params.pagesize}&page=${params.current_page}&filterby=${filterby.value}`,
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
  showconfirmdelete(data, deleteProduct, 'Product');
};
const viewEdit = (data) => {
  router.push({
    name: 'masterproductedit'
  });
  sessionStorage.setItem('paramsid', enc.encrypt(data.id));
};
const cekvalue = (e) => {
  filterby.value = e.target.value;
  filterProduct();
};
</script>
<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div>
    <div class="row px-3">
      <div class="form-group d-flex justify-content-center">
        <label for="filterby" class="pt-2" style="width: 100px">Filter By</label>
        <select class="form-control" @change="cekvalue">
          <option value="all" selected>All</option>
          <option value="barcode">Barcode</option>
          <option value="name">Name</option>
          <option value="brands">Brands</option>
          <option value="price">Price</option>
          <option value="category">Category</option>
          <option value="unit">Unit</option>
          <option value="remaining_stock">Remaining Stock</option>
          <option value="maxstock">Maxstock</option>
          <option value="minstock">Minstock</option>
        </select>
      </div>
    </div>
    <div class="row px-3 mb-2" style="margin-top: -20px">
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
