<script setup>
import { ref, reactive } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { formatRupiah } from '@/rupiahformatter.js';
import ex from '@/exception.js';
import axios from 'axios';

const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);
const listCategory = ref([]);

const emit = defineEmits(['modalDataProduct']);
const params = reactive({ current_page: 1, pagesize: 10, search: '', orderby: 'id', ascdesc: 'asc', categoryby: '', filterby: 'barcode' });
const rows = ref(null);
const cols =
  ref([
    { field: 'actions', title: '#' },
    { field: 'barcode', title: 'Barcode', isUnique: true },
    { field: 'name', title: 'Name', sort: true },
    { field: 'brands', title: 'Brands', sort: true }
  ]) || [];

const defaultParams = () => {
  params.current_page = 1;
  params.pagesize = 10;
  params.search = '';
  params.orderby = 'id';
  params.ascdesc = 'asc';
  params.categoryby = '';
  params.filterby = 'barcode';
};
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

//Jika perubahan yang terjadi pada table seprti mengklik pagination mengubah jumlah row dll
const changeServer = (data) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  params.orderby = data.sort_column;
  params.ascdesc = data.sort_direction;
  filterProduct();
};

const cekvalue = () => {
  params.current_page = 1;
  filterProduct();
};

const loadModal = () => {
  getApiCategory();
  getApiProduct();
};

const selectProduct = (data) => {
  emit('modalDataProduct', data);
  $('#modalProduct').modal('hide');
};

$(document).ready(function () {
  $('#modalProduct').on('hidden.bs.modal', function (e) {
    defaultParams();
  });
});

defineExpose({
  loadModal
});
</script>
<template>
  <div class="modal fade" id="modalProduct" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Search Product</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-lg-6">
              <div style="max-width: 300px">
                <div class="form-group d-lg-flex justify-content-center">
                  <label for="categoryby" class="pt-2" style="width: 150px"><p style="font-size: 14px">Category By</p></label>
                  <select class="form-control" v-model="params.categoryby" @change="cekvalue">
                    <option value="">All</option>
                    <option :value="category.id" v-for="category in listCategory" :key="category.id">{{ category.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: -20px">
            <div class="col-lg-8">
              <div class="form-group d-lg-flex">
                <label for="searchby" class="pt-2 mr-3" style="width: 150px"><p style="font-size: 14px">Search By</p></label>
                <select class="form-control mr-2" @change="cekvalue" v-model="params.filterby" style="max-width: 120px">
                  <option value="barcode" selected>Barcode</option>
                  <option value="name">Name</option>
                  <option value="brands">Brands</option>
                </select>
                <input v-model="params.search" type="text" class="form-control" style="max-width: 600px" placeholder="Search..." />
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
            height="300px"
            noDataContent="No records found in the database"
            :stickyFirstColumn="true"
          >
            <template #actions="data">
              <div>
                <button type="button" class="btn btn-success btn-sm" @click="selectProduct(data.value)"><i class="fas fa-check"></i> Select</button>
              </div>
            </template>
          </vue3-datatable>
        </div>
      </div>
    </div>
  </div>
</template>
