<script setup>
import { ref, onMounted, reactive } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import { useRouter } from 'vue-router';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror } from '@/jqueryconfirm.js';
import { formatRupiah } from '@/rupiahformatter.js';
import enc from '@/myencription.js';
import ex from '@/exception.js';
import axios from 'axios';
import MyDate from '@/mydate.js';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
// theme is optional
// try more themes at - https://flatpickr.js.org/themes/
import 'flatpickr/dist/themes/material_blue.css';

// config untuk flatpickr datetime
const config = ref({
  wrap: true, // set wrap to true only when using 'input-group'
  altFormat: 'd/m/Y',
  altInput: true,
  dateFormat: 'd/m/Y'
});
// inisiasi function mydate
const Date = new MyDate();

const router = useRouter();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const isdeleting = ref(false);
const loading = ref(true);
const total_rows = ref(0);
const params = reactive({
  current_page: 1,
  pagesize: 10,
  search: '',
  orderby: 'id',
  ascdesc: 'asc',
  startDate: '',
  endDate: '',
  paystatus: null,
  is_approve: null,
  filterby: ''
});
const rows = ref(null);
const setupDefault = () => {
  params.filterby = 'all';
  params.paystatus = 'true';
  params.is_approve = false;
  params.startDate = Date.getfirstdate();
  params.endDate = Date.getlastdate();
};
const manageerror = (error, name) => {
  if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
    showerror('Product ' + name + ' Already Used In Transaction Cannot Be Deleted');
  } else {
    showerror('ERROR!!! Internal Server Error');
  }
};
const cols =
  ref([
    { field: 'actions', title: '#', sort: false },
    { field: 'rownumber', title: 'No', isUnique: true },
    { field: 'id', title: 'ID SALES', isUnique: true, hide: true },
    { field: 'trans_no', title: 'Transaction Number', sort: true, cellClass: 'text-nowrap' },
    { field: 'trans_date', title: 'Transaction Date', sort: true, cellClass: 'text-nowrap' },
    { field: 'id_supplier', title: 'Supplier ID', sort: true, hide: true },
    { field: 'number_id_supplier', title: 'ID Supplier', sort: true, cellClass: 'text-nowrap' },
    { field: 'supplier_name', title: 'Supplier Name', sort: true, cellClass: 'text-nowrap' },
    { field: 'id_user', title: 'ID User', sort: true, hide: true, cellClass: 'text-nowrap' },
    { field: 'total_purchase', title: 'Sub Total', sort: true, cellClass: 'text-nowrap' },
    { field: 'other_fee', title: 'Other Fee', sort: true, cellClass: 'text-nowrap' },
    { field: 'ppn', title: 'PPN', sort: true, cellClass: 'text-nowrap' },
    { field: 'grand_total', title: 'Grand Total', sort: true, cellClass: 'text-nowrap' },
    { field: 'payment_term', title: 'Payment Term', cellClass: 'text-nowrap' },
    { field: 'is_approve', title: 'Approved' },
    { field: 'is_credit', title: 'Pay Status' },
    { field: 'pic_name', title: 'Pic Name', sort: true, cellClass: 'text-nowrap' }
  ]) || [];

const getApiPurchase = async () => {
  try {
    loading.value = true;
    const paystatusboolean = JSON.parse(params.paystatus.toLowerCase());
    const convertstartdate = Date.changeformat(params.startDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
    const convertenddate = Date.changeformat(params.endDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
    const responseData = await axios.get(
      `${apiurl}/api/purchases/list/${branch}?orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}&perpage=${params.pagesize}&startdate=${convertstartdate}&enddate=${convertenddate}&isapprove=${params.is_approve}&iscredit=${paystatusboolean}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataPurchase = responseData.data.data;
    dataPurchase.map((item) => {
      item.total_purchase = formatRupiah(item.total_purchase);
      item.other_fee = formatRupiah(item.other_fee);
      item.ppn = formatRupiah(item.ppn);
      item.grand_total = formatRupiah(item.grand_total);
      item.trans_date = Date.changeformat(item.trans_date, 'YYYY-MM-DD', 'DD/MM/YYYY');
      item.payment_term = item.payment_term || '-';
      return item;
    });
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataPurchase;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
    total_rows.value = 0;
    rows.value = null;
  }

  loading.value = false;
};
const getSearchApiPurchase = async () => {
  loading.value = true;
  const paystatusboolean = JSON.parse(params.paystatus.toLowerCase());
  const convertstartdate = Date.changeformat(params.startDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
  const convertenddate = Date.changeformat(params.endDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
  const convertsearch = encodeURIComponent(params.search);
  try {
    const responseData = await axios.get(
      `${apiurl}/api/purchases/${branch}/search?key=${convertsearch}&filterby=${params.filterby}&orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}&perpage=${params.pagesize}&startdate=${convertstartdate}&enddate=${convertenddate}&isapprove=${params.is_approve}&iscredit=${paystatusboolean}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataPurchase = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;
    dataPurchase.map((item) => {
      item.total_purchase = formatRupiah(item.total_purchase);
      item.other_fee = formatRupiah(item.other_fee);
      item.ppn = formatRupiah(item.ppn);
      item.grand_total = formatRupiah(item.grand_total);
      item.trans_date = Date.changeformat(item.trans_date, 'YYYY-MM-DD', 'DD/MM/YYYY');
      item.payment_term = item.payment_term || '-';
      return item;
    });
    total_rows.value = totalAllRows;
    rows.value = dataPurchase;
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
    getApiPurchase();
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

  getSearchApiPurchase();
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
const changeValue = () => {
  getSearchApiPurchase();
};
onMounted(() => {
  setupDefault();
  getApiPurchase();
});
</script>
<template>
  <div v-if="isdeleting" class="loading-overlay">
    <div class="loader"></div>
  </div>
  <div class="row" style="margin-bottom: -20px">
    <div class="col-lg-6">
      <div style="max-width: 350px">
        <div class="form-group d-flex justify-content-center">
          <label for="filterby" class="pt-2" style="width: 150px"><p style="font-weight: bold; font-size: 14px">Pay Status</p></label>
          <select class="form-control" v-model="params.paystatus" @change="changeValue">
            <option value="false">Cash</option>
            <option value="true">Credit</option>
          </select>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="d-lg-flex justify-content-end">
        <div class="form-group d-lg-flex justify-content-between">
          <label for="date" class="mr-3 pt-2"><p style="font-weight: bold; font-size: 14px">Date</p></label>
          <div class="input-group mr-3">
            <flatPickr id="datepicker" v-model="params.startDate" :config="config" class="form-control" @on-change="changeValue"></flatPickr>
            <div class="input-group-prepend">
              <div class="input-group-text">
                <i class="fas fa-calendar-alt"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group d-lg-flex justify-content-between">
          <label for="date" class="mr-3 pt-2"><p style="font-weight: bold; font-size: 14px">To</p></label>
          <div class="input-group mr-3">
            <flatPickr id="datepicker" v-model="params.endDate" :config="config" class="form-control" @on-change="changeValue"></flatPickr>
            <div class="input-group-prepend">
              <div class="input-group-text">
                <i class="fas fa-calendar-alt"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-6">
      <div class="form-group d-lg-flex">
        <label for="filterby" class="pt-2 mr-1" style="width: 100px"><p style="font-weight: bold; font-size: 14px">Filter By</p></label>
        <select class="form-control mr-2" @change="changeValue" style="width: 180px" v-model="params.filterby">
          <option value="all" selected>All</option>
          <option value="trans_no">Transaction Number</option>
          <option value="number_id_supplier">ID Supplier</option>
          <option value="supplier_name">Supplier Name</option>
          <option value="pic_name">Pic Name</option>
        </select>
        <input v-model="params.search" type="text" class="form-control" placeholder="Search..." style="max-width: 400px" />
      </div>
    </div>
    <div class="col-lg-6">
      <div class="d-flex justify-content-end mb-2 mr-4">
        <div class="form-check mr-2">
          <input class="form-check-input" @change="changeValue" v-model="params.is_approve" type="radio" name="radioapprove" id="unapprove" value="false" checked />
          <label class="form-check-label" style="font-weight: 400; font-size: larger" for="unapprove">Unapprove</label>
        </div>
        <div class="form-check mr-2">
          <input class="form-check-input" @change="changeValue" v-model="params.is_approve" type="radio" name="radioapprove" id="approve" value="true" />
          <label class="form-check-label" style="font-weight: 400; font-size: larger" for="approve">Approve</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" @change="changeValue" v-model="params.is_approve" type="radio" name="radioapprove" id="all" value="" />
          <label class="form-check-label" style="font-weight: 400; font-size: larger" for="all">All</label>
        </div>
      </div>
    </div>
  </div>

  <div>
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
      <template #is_approve="data">
        <span v-if="data.value.is_approve" class="badge badge-sm badge-primary">Approved</span>
        <span v-if="!data.value.is_approve" class="badge badge-sm badge-secondary">Not Approved</span>
      </template>
      <template #is_credit="data">
        <span v-if="data.value.is_credit" class="badge badge-sm badge-secondary">Kredit</span>
        <span v-if="!data.value.is_credit" class="badge badge-sm badge-success">Cash</span>
      </template>
      <template #actions="data">
        <div class="d-lg-flex">
          <button type="button" title="Edit" class="btn btn-success btn-sm mr-1" @click="viewEdit(data.value)">
            <i class="fas fa-edit"></i></button
          ><br />
          <button type="button" class="btn btn-danger btn-sm mr-1" title="Delete" @click="viewDelete(data.value)"><i class="fas fa-trash-alt"></i></button>
          <button type="button" class="btn btn-warning btn-sm mr-1" title="Approve" @click="viewDelete(data.value)"><i class="fas fa-check"></i></button>
          <button type="button" class="btn btn-primary btn-sm" title="Detail Item" @click="viewDelete(data.value)"><i class="fas fa-eye"></i></button>
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
.coba {
  color: #3498db;
  background-color: aqua;
}
.mypointer:hover {
  cursor: pointer;
}
</style>
