<script setup>
import { onMounted, ref, reactive, onUnmounted, onBeforeMount, handleError } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { formatRupiah1 } from '@/rupiahformatter';
import { showerror } from '@/jqueryconfirm.js';
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css';
import myencription from '@/myencription.js';
import MyDate from '@/mydate';
import ex from '@/exception.js';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import ModalSearchSupplier from '@/components/ModalSearchSupplier.vue';

// PROPERTY
// ------------------------------------
const router = useRouter();
const route = useRoute();
const Date = new MyDate();
const isfetchingdata = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const iduser = myencription.decrypt(localStorage.getItem('id'));
const username = myencription.decrypt(localStorage.getItem('username'));
const role = myencription.decrypt(localStorage.getItem('role_name'));
const name = myencription.decrypt(localStorage.getItem('name'));
const token = localStorage.getItem('token');
const namesession = ref('');

const ModalScSupplier = ref(null);

const postPurchaseData = reactive({
  branchcode: '',
  trans_date: '',
  barcode: '',
  id_user: '',
  username: '',
  name: '',
  role: '',
  supplier_no: '',
  supplier_name: '',
  total: 0.0,
  other_fee: 0.0,
  payment_term: '',
  ppn: 0.0,
  grand_total: 0.0,
  isppn: false,
  is_credit: null,
  items: []
});

const transAmount = ref({
  total: 'Rp 0,00',
  other_fee: 'Rp 0,00',
  ppn: 'Rp 0,00',
  percent_ppn: 0,
  grand_total: 'Rp 0,00'
});
const listCacheItems = ref([]);
const validation = ref({
  trans_date: '',
  supplier_name: '',
  total: '',
  grand_total: ''
});
const interfaceitems = {
  id_product: '',
  barcode: '',
  name: '',
  category: '',
  id_unit: '',
  qty: 0,
  price: 0.0,
  total: 0.0,
  discount: 0.0,
  sub_total: 0.0,
  remaining_stock: 0
};

// Property FlatPickr
// ----------------------------------
const config = ref({
  wrap: true, // set wrap to true only when using 'input-group'
  altFormat: 'd/m/Y',
  altInput: true,
  dateFormat: 'd/m/Y'
});

// -------------------------------------

// Property  untuk vue3 Datatable
// -------------------------------------
const loading = ref(false);
const total_rows = ref(0);
const rows = ref(null);
const cols =
  ref([
    { field: 'barcode', title: 'Barcode', isUnique: true, width: '10%' },
    { field: 'name', title: 'Name', width: '19%' },
    { field: 'category', title: 'Category', width: '12%' },
    { field: 'qty', title: 'Qty', width: '4%' },
    { field: 'id_unit', title: 'Unit', width: '5%' },
    { field: 'price', title: 'Price', width: '10%' },
    { field: 'total', title: 'Total', width: '15%' },
    { field: 'discount', title: 'Discount', width: '6%' },
    { field: 'sub_total', title: 'Sub Total', width: '15%' },
    { field: 'actions', title: '#', width: '5%' }
  ]) || [];

// ---------------------------------------
// -------------------------------------------

// METHOD AND SUBROUTINE
// -------------------------------------------
function setupDefaultPostData() {
  postPurchaseData.branchcode = branch;
  postPurchaseData.trans_date = Date.getCurrentDate('DD/MM/YYYY');
  postPurchaseData.barcode = '';
  postPurchaseData.is_credit = true;
  postPurchaseData.id_user = iduser;
  postPurchaseData.username = username;
  postPurchaseData.role = role;
  postPurchaseData.name = name;
  postPurchaseData.supplier_name = '';
  postPurchaseData.total = 0.0;
  postPurchaseData.other_fee = 0.0;
  postPurchaseData.payment_term = '';
  postPurchaseData.ppn = 0.0;
  postPurchaseData.grand_total = 0.0;
  postPurchaseData.items = [];
}
function setupDefaultInterfaceItems() {
  interfaceitems.value.id_product = '';
  interfaceitems.value.barcode = '';
  interfaceitems.value.name = '';
  interfaceitems.value.category = '';
  interfaceitems.value.id_unit = '';
  interfaceitems.value.qty = 0;
  interfaceitems.value.price = 'Rp 0,00';
  interfaceitems.value.total = 'Rp 0,00';
  interfaceitems.value.discount = 'Rp 0,00';
  interfaceitems.value.sub_total = 'Rp 0,00';
  interfaceitems.value.remaining_stock = 0;
}

function populateInterfaceItems(dataItem = {}) {
  interfaceitems.id_product = dataItem.id;
  interfaceitems.barcode = dataItem.barcode;
  interfaceitems.name = dataItem.name;
  interfaceitems.category = dataItem.category;
  interfaceitems.id_unit = dataItem.unit;
  interfaceitems.qty = 1;
  interfaceitems.price = 'Rp 0,00';
  interfaceitems.total = 'Rp 0,00';
  interfaceitems.discount = 'Rp 0,00';
  interfaceitems.sub_total = 'Rp 0,00';
  interfaceitems.remaining_stock = 0.0;
}

function populatelistCacheItem(data = {}) {
  listCacheItems.value.push(data);
}

function isAlreadyCached() {
  // Cek Apa kah Item Sudah Ada DI Cache
  if (listCacheItems.value.length > 0) {
    console.log(postPurchaseData.barcode.trim());
    // Mereturn boolean
    return listCacheItems.value.some((item) => item.barcode === postPurchaseData.barcode);
  } else {
    return false;
  }
}

function clearValidation() {
  validation.value.trans_date = '';
  validation.value.supplier_name = '';
  validation.value.total = '';
  validation.value.grand_total = '';
}

function pushPostItemsPurchase(data = {}) {
  // Check Apakah postPurchaseData ada isinya
  if (postPurchaseData.items.length > 0) {
    // Check Apakah Item Sudah Ada
    const isExistItem = postPurchaseData.items.some((item) => item.barcode === data.barcode);
    if (isExistItem) {
      // Jika Ada Edit Qty
      const postPurchaseDataUpdated = postPurchaseData.items.map((item) => {
        if (item.barcode === data.barcode) {
          return { ...item, qty: parseInt(item.qty) + parseInt(data.qty) };
        } else {
          return item;
        }
      });
      postPurchaseData.items = [...postPurchaseDataUpdated];
    } else {
      // Jika Tidak Ada Langsung push item
      postPurchaseData.items.push(data);
    }
  } else {
    // Item Purchase Kosong
    postPurchaseData.items.push(data);
  }
  calculateItems();
}

function getCachedItem() {
  // Filter Data Yang Sudah Ada Dicache
  let dataFiltered = listCacheItems.value.filter((item) => {
    return item.barcode == postPurchaseData.barcode;
  });

  // Ubah Property id_product dan id Unit menjadi id dan unit dalam dataFiltered
  let newData = dataFiltered.map(({ id_product, id_unit, ...rest }) => ({ id: id_product, unit: id_unit, ...rest }));
  return newData[0];
}

function refreshGrid() {
  const Data = [...postPurchaseData.items];
  rows.value = Data;
}

function updateItems(barcode, e, columnName) {
  const amount = e.target.value || 0;
  switch (columnName) {
    case 'qty':
      const updatedtItemsQty = postPurchaseData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, qty: amount };
        } else {
          return item;
        }
      });
      postPurchaseData.items = [...updatedtItemsQty];
      break;
    case 'price':
      const updatedtItemsPrice = postPurchaseData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, price: parseToRupiah(amount) };
        } else {
          return item;
        }
      });
      postPurchaseData.items = [...updatedtItemsPrice];
      break;
    case 'discount':
      const updatedtItemsDiscount = postPurchaseData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, discount: parseToRupiah(amount) };
        } else {
          return item;
        }
      });
      postPurchaseData.items = [...updatedtItemsDiscount];
      break;
    default:
      break;
  }
  calculateItems();
  refreshGrid();
}

function onlyNumberAndDot(value) {
  return value.replace(/[^0-9.]/g, '');
}

function parseToRupiah(value) {
  return formatRupiah1(value).toString();
}

function eliminateNonNumerikalInput(e) {
  e.target.value = onlyNumberAndDot(e.target.value);
}

function parseToFloat(value) {
  if (typeof value == 'string') {
    // Menghapus karakter non-digit dan non-titik
    var cleanInput = value.replace(/[^\d,.]/g, '');

    // Mengganti koma menjadi titik
    var dotFormatted = cleanInput.replace(',', '.');

    // Menghapus karakter titik tambahan
    var finalResult = dotFormatted.replace(/\.(?=.*\.)/g, '');

    return parseFloat(finalResult);
  } else {
    return parseFloat(value);
  }
}

function calcPPn() {
  let other_fee = parseToFloat(transAmount.value.other_fee);
  let total = parseToFloat(transAmount.value.total);
  let totalppn = (transAmount.value.percent_ppn / 100) * (other_fee + total);

  transAmount.value.ppn = parseToRupiah(parseToFloat(totalppn));
}

function startInput(e) {
  e.target.value = parseToFloat(e.target.value) === 0 ? '' : parseToFloat(e.target.value);
}

function checklistppn() {
  let isppn = postPurchaseData.isppn;

  if (!isppn) {
    transAmount.value.percent_ppn = 0;
    transAmount.value.ppn = parseToRupiah(0);
  } else {
    transAmount.value.percent_ppn = 11;
  }
  calculateAmountTrans();
}

function deleteItem(barcode) {
  const filteredItems = [...postPurchaseData.items].filter((item) => item.barcode !== barcode);
  postPurchaseData.items = [...filteredItems];
  refreshGrid();
}

function calculateItems() {
  const calculatedItemsTotal = postPurchaseData.items.map((item) => {
    let calcTotal = parseToFloat(item.qty) * parseToFloat(item.price);
    return { ...item, total: parseToRupiah(calcTotal) };
  });

  postPurchaseData.items = [...calculatedItemsTotal];
  const calculatedItemsSubtotal = postPurchaseData.items.map((item) => {
    let calcSub_total = parseToFloat(item.total) - parseToFloat(item.discount);
    if (calcSub_total < 0) {
      calcSub_total = 0;
    }
    return { ...item, sub_total: parseToRupiah(calcSub_total) };
  });
  postPurchaseData.items = [...calculatedItemsSubtotal];
  calculateAmountTrans();
}

function updateAmountTrans(e, fieldName) {
  let value = parseFloat(e.target.value);

  switch (fieldName) {
    case 'otherfee':
      transAmount.value.other_fee = parseToRupiah(value);
      break;

    default:
      break;
  }
  calculateAmountTrans();
}

function calculateAmountTrans() {
  let total = 0;
  let other_fee = parseToFloat(transAmount.value.other_fee);
  let grand_total = 0;
  let purchaseItems = [...postPurchaseData.items];

  purchaseItems.forEach((item) => {
    total += parseToFloat(item.sub_total);
  });

  transAmount.value.total = parseToRupiah(parseToFloat(total));
  transAmount.value.other_fee = parseToRupiah(other_fee);
  calcPPn();
  let ppn = parseToFloat(transAmount.value.ppn);
  grand_total = total + other_fee + ppn;
  transAmount.value.grand_total = parseToRupiah(parseToFloat(grand_total));
}

function clearBarcode() {
  postPurchaseData.barcode = '';
}

function errorHandle(error) {
  const excpetion = new ex(error);
  excpetion.func404 = error404;
  excpetion.func405 = error404;
  excpetion.showError();
  function error404() {
    showerror('Item Is Not Found');
  }
}
function freewhitespacebarcode() {
  // Mengeliminasi white space awal dan akhir kalimat
  postPurchaseData.barcode = postPurchaseData.barcode.trim();
}

// ----------------------------------------------

// API CALLER
// ---------------------------------------------
async function getApiProductbyBarcode() {
  // Mengeliminasi white space awal dan akhir kalimat
  freewhitespacebarcode();

  if (isAlreadyCached()) {
    // Jika Items Sudah Ada Di Cached
    populateInterfaceItems(getCachedItem());
    pushPostItemsPurchase({ ...interfaceitems });
    refreshGrid();
  } else {
    // Jika Items belum Ada Di Cached
    try {
      loading.value = true;
      const response = await axios.get(`${apiurl}/api/products/detail/${branch}/${postPurchaseData.barcode}`, {
        headers: {
          Authorization: token
        }
      });
      loading.value = false;
      let dataProduct = response.data.data;
      populateInterfaceItems(dataProduct);
      // Masukkan item ke cache
      populatelistCacheItem({ ...interfaceitems });
      // --------------
      pushPostItemsPurchase({ ...interfaceitems });
      refreshGrid();
    } catch (error) {
      loading.value = false;
      errorHandle(error);
    }
  }
  clearBarcode();
}
// ---------------------------------------------

// Event dan Method relasi child dan parent
// ---------------------------------------------
function showFormSearch() {
  ModalScSupplier.value.getSupplier();
}

function populateFieldSupplier(supplierData) {
  postPurchaseData.supplier_no = supplierData.number_id;
  postPurchaseData.supplier_name = supplierData.name;
}
function getDataModal(data) {
  populateFieldSupplier(data);
}

// ----------------------------------------------

// Life Cycle Hooks
// --------------------------------------------

onMounted(() => {
  setupDefaultPostData();
});

// ------------------------------------------
</script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Purchase > Add New Purchase</h1>
        <span>admin / purchase / create </span>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <div class="card card-secondary">
            <div class="card-body">
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="trans_no">Transaction Number</label>
                    <input type="text" class="form-control defaultInptStyle" id="trans_no" value="AUTO" disabled />
                  </div>
                  <div class="form-group">
                    <label for="trans_date">Transaction Date</label>
                    <flatPickr class="form-control defaultInptStyle" :config="config" v-model="postPurchaseData.trans_date"></flatPickr>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="Supplier">ID Supplier</label>
                    <div class="input-group">
                      <div class="input-group-append">
                        <input type="text" class="form-control defaultInptStyle" readonly id="Supplier" v-model="postPurchaseData.supplier_no" />
                        <button class="input-group-text" style="cursor: pointer" @click="showFormSearch" title="Search Supplier" data-toggle="modal" data-target="#modalSupplier">
                          <i class="fas fa-search"></i>
                        </button>
                        <button class="input-group-text" style="cursor: pointer" title="Add New Supplier" @click="router.push({ name: 'mastersupplier' })">
                          <i class="fas fa-user-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="Supplier">Supplier Name</label>
                    <input type="text" class="form-control defaultInptStyle" readonly id="Supplier" v-model="postPurchaseData.supplier_name" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card card-secondary">
            <div class="card-body">
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="username">Pic User</label>
                    <input type="text" class="form-control defaultInptStyle" id="username" v-model="postPurchaseData.username" disabled />
                  </div>
                  <div class="form-group">
                    <label for="pic_name">Pic Name</label>
                    <input type="text" class="form-control defaultInptStyle" disabled v-model="postPurchaseData.name" id="pic_name" />
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label for="role">Role</label>
                    <input type="text" class="form-control defaultInptStyle" disabled id="role" v-model="postPurchaseData.role" />
                  </div>
                  <div class="form-group">
                    <label for=""> Payment</label>
                    <div class="d-flex pt-2">
                      <div class="form-check mr-2">
                        <input class="form-check-input" type="radio" name="radiopayment" id="kredit" checked />
                        <label class="form-check-label" style="font-weight: 400; font-size: larger" for="kredit">Kredit</label>
                      </div>
                      <div class="form-check mr-2">
                        <input class="form-check-input" type="radio" name="radiopayment" id="cash" />
                        <label class="form-check-label" style="font-weight: 400; font-size: larger" for="cash">Cash</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6">
          <div class="card card-secondary">
            <div class="card-body py-0">
              <div class="form-group mt-2">
                <label for="">Barcode</label>
                <div class="input-group row">
                  <div class="input-group-prepend col-lg-8">
                    <div class="input-group-text">
                      <i class="fas fa-barcode"></i>
                    </div>
                    <input type="text" class="form-control defaultInptStyle" style="width: 100%" v-model="postPurchaseData.barcode" @keyup.enter="getApiProductbyBarcode" />
                    <button type="button" class="btn btn--primary" @click="getApiProductbyBarcode"><i class="fas fa-cart-plus"></i></button>
                    <button type="button" class="btn btn--primary"><i class="fas fa-search"></i></button>
                    <button type="button" class="btn btn--primary"><i class="fas fa-plus"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card card-secondary">
            <div class="card-body py-0">
              <div class="form-group row mt-3">
                <label class="mr-5" style="font-size: 30px; font-weight: bold">Grand Total :</label>
                <label class="text-primary" style="font-size: 30px; font-weight: bold">{{ transAmount.grand_total }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- ITEMS SECTION -->
      <div class="row">
        <div class="col-lg-12">
          <div class="card card-success">
            <div class="card-header">
              <h5 class="card-title">ITEMS LIST</h5>
            </div>
            <div class="card-body">
              <!-- Slots Vue 3 Datatabble -->
              <vue3-datatable :loading="loading" :rows="rows" :columns="cols" height="300px" :stickyHeader="true" :showNumbers="false">
                <template #qty="data">
                  <input
                    type="number"
                    :value="data.value.qty"
                    @focusin="startInput($event)"
                    style="max-width: 60px !important"
                    @focusout="updateItems(data.value.barcode, $event, 'qty')"
                  />
                </template>
                <template #price="data">
                  <input
                    style="max-width: 120px"
                    type="text"
                    :value="data.value.price"
                    @focusin="startInput($event)"
                    @keyup="eliminateNonNumerikalInput($event)"
                    @focusout="updateItems(data.value.barcode, $event, 'price')"
                  />
                </template>
                <template #discount="data">
                  <input
                    type="text"
                    style="max-width: 100px"
                    :value="data.value.discount"
                    @focusin="startInput($event)"
                    @keyup="eliminateNonNumerikalInput($event)"
                    @focusout="updateItems(data.value.barcode, $event, 'discount')"
                  />
                </template>
                <template #actions="data">
                  <button class="btn btn-danger" @click="deleteItem(data.value.barcode)">X</button>
                </template>
              </vue3-datatable>
            </div>
          </div>
        </div>
      </div>
      <!-- END ITEMS SECTION -->
      <div class="row">
        <div class="col-lg-5 offset-lg-7">
          <div class="card card-danger">
            <div class="card-body">
              <div class="form-group row">
                <label style="font-size: large; font-family: Arial, Helvetica, sans-serif" class="col-lg-3">Total</label>
                <input type="text" class="form-control col-lg-9 defaultInptStyle" :value="transAmount.total" readonly />
              </div>
              <div class="form-group row">
                <label style="font-size: large; font-family: Arial, Helvetica, sans-serif" class="col-lg-3">Other Fee</label>
                <input
                  type="text"
                  class="form-control col-lg-9 defaultInptStyle"
                  v-model="transAmount.other_fee"
                  @keyup="eliminateNonNumerikalInput($event)"
                  @focusin="startInput($event)"
                  @focusout="updateAmountTrans($event, 'otherfee')"
                  @abort="updateAmountTrans($event, 'otherfee')"
                />
              </div>
              <div class="form-group row">
                <label style="font-size: large; font-family: Arial, Helvetica, sans-serif" class="col-lg-3"
                  >Ppn <input type="checkbox" v-model="postPurchaseData.isppn" @change="checklistppn()"
                /></label>
                <input
                  type="number"
                  class="form-control col-lg-2 defaultInptStyle"
                  @change="calculateAmountTrans()"
                  style="font-size: 18px; font-weight: bold"
                  :readonly="!postPurchaseData.isppn"
                  v-model="transAmount.percent_ppn"
                />
                <label class="col-lg-1 pt-1" style="font-size: 18px">%</label>
                <input type="text" class="form-control col-lg-6 defaultInptStyle" readonly v-model="transAmount.ppn" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Modal Form -->
  <ModalSearchSupplier ref="ModalScSupplier" @modalDataSupplier="getDataModal" />
</template>

<style scoped>
.defaultInptStyle {
  font-size: 18px;
  font-weight: bold;
}
</style>
