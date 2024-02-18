<script setup>
// ----------------------------------------------- Import Library And Dependency
import { ref, onMounted, reactive } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import { useRouter } from 'vue-router';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import { showconfirmdelete, showerror, showconfirmapprove, showconfirmbulkdelete, showconfirmbulkapprove } from '@/jqueryconfirm.js';
import { formatRupiah1 } from '@/rupiahformatter.js';
import enc from '@/myencription.js';
import ex from '@/exception.js';
import axios from 'axios';
import MyDate from '@/mydate.js';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
// theme is optional
// try more themes at - https://flatpickr.js.org/themes/
import 'flatpickr/dist/themes/material_blue.css';

// --------------------------------------------- End Import Library Dependency

// ------------------------------------------------- Property
// config untuk flatpickr datetime
const config = ref({
  wrap: true, // set wrap to true only when using 'input-group'
  altFormat: 'd/m/Y',
  altInput: true,
  dateFormat: 'd/m/Y'
});

// inisiasi function mydate
const Date = new MyDate();
// Define Emits
const emit = defineEmits(['viewItem']);

const router = useRouter();
const listSelectedSales = ref([]);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const apiTrans = '/api/sales/';
const title = 'Sales';
const token = localStorage.getItem('token');
const isdeleting = ref(false);
const enabledBulk = ref(true);
const enabledCounter = ref(true);

// Property vue 3 datatble
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
const cols =
  ref([
    { field: 'actions', title: '#', sort: false },
    { field: 'rownumber', title: 'No', isUnique: true },
    { field: 'id', title: 'ID SALES', isUnique: true, hide: true },
    { field: 'trans_no', title: 'Transaction Number', sort: true, cellClass: 'text-nowrap' },
    { field: 'trans_date', title: 'Transaction Date', sort: true, cellClass: 'text-nowrap' },
    { field: 'id_cust', title: 'Customer ID', sort: true, hide: true },
    { field: 'cust_no', title: 'Cust No', sort: true, cellClass: 'text-nowrap' },
    { field: 'cust_name', title: 'Cust Name', sort: true, cellClass: 'text-nowrap' },
    { field: 'id_user', title: 'ID User', sort: true, hide: true, cellClass: 'text-nowrap' },
    { field: 'pic_name', title: 'PIC Name', sort: true, cellClass: 'text-nowrap' },
    { field: 'total_sales', title: 'Sub Total', sort: true, cellClass: 'text-nowrap' },
    { field: 'other_fee', title: 'Other Fee', sort: true, cellClass: 'text-nowrap' },
    { field: 'sales_ppn', title: 'PPN', sort: true, cellClass: 'text-nowrap' },
    { field: 'grand_total', title: 'Grand Total', sort: true, cellClass: 'text-nowrap' },
    { field: 'paid', title: 'Paid Amount', sort: true, cellClass: 'text-nowrap' },
    { field: 'change_amount', title: 'Change Amount', sort: true, cellClass: 'text-nowrap' },
    { field: 'sales_notes', title: 'Sales Note', cellClass: 'text-nowrap' },
    { field: 'is_sales_credit', title: 'Pay Status' },
    { field: 'is_approve', title: 'Approved' }
  ]) || [];
// End property vue-3 datatable
// ---------------------------------------------- End Property

// ----------------------------------------------- Function and subroutines
function setupDefaultParam() {
  params.filterby = 'all';
  params.paystatus = 'false';
  params.is_approve = 'false';
  params.startDate = Date.getfirstdate();
  params.endDate = Date.getlastdate();
}

function erroHandle(error, additionaldata = '') {
  const exception = new ex(error);
  exception.func500 = manageerror;
  exception.additionaldata = additionaldata;
  exception.showError();
  total_rows.value = 0;
  rows.value = null;

  // Inner function
  function manageerror(error, name) {
    if (error.response.data.errors.general[0].includes('Integrity constraint violation')) {
      showerror(title + ' ' + name + ' Already Used In Transaction Cannot Be Deleted');
    } else {
      showerror('ERROR!!! Internal Server Error');
    }
  }
}

// Suppply event vue3 datatable
// Rowclick event datatable
function collectSelectedSales(data) {
  // Get Only id and trans no
  if (data.length > 0) {
    listSelectedSales.value = data.map((item) => {
      let data = {
        id: item.id,
        trans_no: item.trans_no
      };

      return data;
    });
  } else {
    listSelectedSales.value = [];
  }
}
//onchange event vue3 datatable (Jika perubahan yang terjadi pada vue 3 datatable seprti mengklik pagination / mengubah jumlah row dll)
function changeServer(data) {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.search = data.search;
  params.orderby = data.sort_column;
  params.ascdesc = data.sort_direction;

  getSearchApiSales();
}

//End Suppply event vue3 datatable

// Crud Interraction per row and chekcbox/bulk crud
function viewApprove(data) {
  showconfirmapprove(data.id, data.trans_no, approveApiSales, title);
}

function viewBulkApprove() {
  showconfirmbulkapprove(listSelectedSales.value, bulkApproveApiSales, title);
}
function viewDelete(data) {
  showconfirmdelete(data.id, data.trans_no, deleteApiSales, title);
}
function viewBulkDelete() {
  showconfirmbulkdelete(listSelectedSales.value, bulkApiDeleteSales, title);
}
function viewEdit(data) {
  sessionStorage.setItem('paramsid', enc.encrypt(data.id));
  router.push({
    name: 'salesedit'
  });
}

// End Crud Interraction per row and checkbox/bulk crud

// Filter interraction
function checkAproval() {
  if (params.is_approve == 'false') {
    enabledBulk.value = true;
    enabledCounter.value = true;
  } else {
    enabledBulk.value = false;
    enabledCounter.value = false;
  }
}

function changeValue() {
  getSearchApiSales();
  checkAproval();
}

// End Filter Interraction

// ---------------------------------------------- End Function and subroutines

// --------------------------------------------- Api Interraction
async function getApiSales() {
  try {
    loading.value = true;
    const paystatusboolean = JSON.parse(params.paystatus.toLowerCase());
    const convertstartdate = Date.changeformat(params.startDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
    const convertenddate = Date.changeformat(params.endDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
    const responseData = await axios.get(
      `${apiurl}${apiTrans}list/${branch}?orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}&perpage=${params.pagesize}&startdate=${convertstartdate}&enddate=${convertenddate}&isapprove=${params.is_approve}&iscredit=${paystatusboolean}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataSales = responseData.data.data;
    dataSales.map((item) => {
      item.total_sales = formatRupiah1(parseFloat(item.total_sales));
      item.other_fee = formatRupiah1(parseFloat(item.other_fee));
      item.sales_ppn = formatRupiah1(parseFloat(item.sales_ppn));
      item.grand_total = formatRupiah1(parseFloat(item.grand_total));
      item.paid = formatRupiah1(parseFloat(item.paid));
      item.change_amount = formatRupiah1(parseFloat(item.change_amount));
      item.trans_date = Date.changeformat(item.trans_date, 'YYYY-MM-DD', 'DD/MM/YYYY');
      return item;
    });
    loading.value = false;
    let totalAllRows = responseData.data.meta.total;
    total_rows.value = totalAllRows;
    rows.value = dataSales;
  } catch (error) {
    loading.value = false;
    erroHandle(error);
  }
}

async function getSearchApiSales() {
  loading.value = true;
  const paystatusboolean = JSON.parse(params.paystatus.toLowerCase());
  const convertstartdate = Date.changeformat(params.startDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
  const convertenddate = Date.changeformat(params.endDate, 'DD/MM/YYYY', 'YYYY-MM-DD');
  const convertsearch = encodeURIComponent(params.search);
  try {
    const responseData = await axios.get(
      `${apiurl}${apiTrans}${branch}/search?key=${convertsearch}&filterby=${params.filterby}&orderby=${params.orderby}&ascdesc=${params.ascdesc}&page=${params.current_page}&perpage=${params.pagesize}&startdate=${convertstartdate}&enddate=${convertenddate}&isapprove=${params.is_approve}&iscredit=${paystatusboolean}`,
      {
        headers: {
          Authorization: token
        }
      }
    );
    let dataSales = responseData.data.data;
    let totalAllRows = responseData.data.meta.total;

    // Format value purchase data
    dataSales.map((item) => {
      item.total_sales = formatRupiah1(parseFloat(item.total_sales));
      item.other_fee = formatRupiah1(parseFloat(item.other_fee));
      item.sales_ppn = formatRupiah1(parseFloat(item.sales_ppn));
      item.grand_total = formatRupiah1(parseFloat(item.grand_total));
      item.paid = formatRupiah1(parseFloat(item.paid));
      item.change_amount = formatRupiah1(parseFloat(item.change_amount));
      item.trans_date = Date.changeformat(item.trans_date, 'YYYY-MM-DD', 'DD/MM/YYYY');
      return item;
    });
    total_rows.value = totalAllRows;
    rows.value = dataSales;
  } catch (error) {
    erroHandle(error);
  }

  loading.value = false;
}
async function deleteApiSales(id, name) {
  try {
    isdeleting.value = true;
    await axios.delete(`${apiurl}${apiTrans}${branch}/${id}`, {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getApiSales();
    iziSuccess('Success', `Successfully Deleted ${title} ${name}`);
  } catch (error) {
    isdeleting.value = false;
    erroHandle(error, name);
  }
}

async function bulkApiDeleteSales(listSales = []) {
  let countDeleted = 0;
  let maxlooping = listSales.length;
  for (let i = 0; i < listSales.length; i++) {
    try {
      isdeleting.value = true;
      await axios.delete(`${apiurl}${apiTrans}${branch}/${listSales[i].id}`, {
        headers: {
          Authorization: token
        }
      });
      countDeleted++;
    } catch (error) {
      erroHandle(error, listSales[i].trans_no);
      isdonedelete();
      break;
    }
    if (i == maxlooping - 1) {
      isdonedelete();
    }
  }

  // inner function
  function isdonedelete() {
    isdeleting.value = false;
    if (countDeleted == maxlooping) {
      // Jika Berhasil Menghapus Semua Purchase
      iziSuccess('Success', `Successfully Deleted All Selected ${title} (${countDeleted} Records) `);
      getApiSales();
    } else if (countDeleted > 0 && countDeleted < maxlooping) {
      iziSuccess('Success', `Successfully Deleted (${countDeleted}) of (${maxlooping}) Selected ${title}`);
      getApiSales();
    } else {
      getApiSales();
    }
  }
}

async function approveApiSales(id, name) {
  try {
    isdeleting.value = true;
    await axios.patch(`${apiurl}${apiTrans}${branch}/${id}`, '', {
      headers: {
        Authorization: token
      }
    });
    isdeleting.value = false;
    getApiSales();
    iziSuccess('Success', `Successfully Approved ${title} ${name}`);
  } catch (error) {
    isdeleting.value = false;
    erroHandle(error);
  }
}

async function bulkApproveApiSales(listSales = []) {
  let countApproved = 0;
  let maxlooping = listSales.length;
  for (let i = 0; i < listSales.length; i++) {
    try {
      isdeleting.value = true;
      await axios.patch(`${apiurl}${apiTrans}${branch}/${listSales[i].id}`, '', {
        headers: {
          Authorization: token
        }
      });
      countApproved++;
    } catch (error) {
      erroHandle(error);
      isdoneapprove();
      break;
    }
    if (i == maxlooping - 1) {
      isdoneapprove();
    }
  }

  // inner function
  function isdoneapprove() {
    isdeleting.value = false;
    if (countApproved == maxlooping) {
      // Jika Berhasil Mengapprove Semua Sales
      iziSuccess('Success', `Successfully Approved ALL Selected ${title} (${countApproved} Records)`);
      getApiSales();
    } else if (countApproved > 0 && countApproved < maxlooping) {
      iziSuccess('Success', `Successfully Approved (${countApproved}) of (${maxlooping}) Selected ${title}`);
      getApiSales();
    } else {
      getApiSales();
    }
  }
}

// ------------------------------------------------------------End Api Interraction

// ----------------------------------------------Interraction with el -dialog
const viewItem = (data) => {
  emit('viewItem', {
    data
  });
};
// -----------------------------------------------end interraction with el-dialog

// ----------------------------------LifeCycleHooks
onMounted(() => {
  setupDefaultParam();
  getApiSales();
  checkAproval();
});
// ---------------------------------End Lifecyclehooks
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
          <option value="cust_no">Cust No</option>
          <option value="cust_name">Cust Name</option>
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

  <!-- Bulk Button -->
  <span class="badge badge-primary py-1 px-2 mr-3 ml-2" v-if="enabledCounter" style="font-size: 18px">{{ listSelectedSales.length }}</span>
  <button class="btn btn-danger mr-2" @click="viewBulkDelete" v-if="listSelectedSales.length > 0"><i class="fas fa-trash"></i> Delete Selected</button>
  <button class="btn btn-warning mr-2" @click="viewBulkApprove" v-if="listSelectedSales.length > 0"><i class="fas fa-check"></i> Approve Selected</button>

  <!-- Table Purchase -->
  <div class="mt-2">
    <vue3-datatable
      :rows="rows"
      :columns="cols"
      :loading="loading"
      :totalRows="total_rows"
      :isServerMode="true"
      :pageSize="params.pagesize"
      @change="changeServer"
      :hasCheckbox="enabledBulk"
      :search="params.search"
      :sortable="true"
      :stickyHeader="true"
      height="600px"
      @rowSelect="collectSelectedSales"
      noDataContent="No records found in the database"
      :stickyFirstColumn="true"
    >
      <!-- Slot vue3-datatable -->
      <template #is_approve="data">
        <span v-if="data.value.is_approve" class="badge badge-sm badge-primary">Approved</span>
        <span v-if="!data.value.is_approve" class="badge badge-sm badge-secondary">Not Approved</span>
      </template>
      <template #is_sales_credit="data">
        <span v-if="data.value.is_credit" class="badge badge-sm badge-secondary">Kredit</span>
        <span v-if="!data.value.is_credit" class="badge badge-sm badge-success">Cash</span>
      </template>
      <template #actions="data">
        <div class="d-lg-flex">
          <button type="button" v-if="!data.value.is_approve" title="Edit" class="btn btn-success btn-sm mr-1" @click="viewEdit(data.value)">
            <i class="fas fa-edit"></i></button
          ><br />
          <button type="button" v-if="!data.value.is_approve" class="btn btn-danger btn-sm mr-1" title="Delete" @click="viewDelete(data.value)">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button type="button" v-if="!data.value.is_approve" @click="viewApprove(data.value)" class="btn btn-warning btn-sm mr-1" title="Approve">
            <i class="fas fa-check"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="viewItem(data.value)" title="Detail Item">
            <i class="fas fa-eye"></i>
          </button>
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
