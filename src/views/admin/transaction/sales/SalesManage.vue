<script setup>
import { onMounted, ref, reactive, toRefs, onUnmounted } from 'vue';
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
import { iziSuccess } from '@/izitoast.js';
import ModalSearchCustomer from '@/components/ModalSearchCustomer.vue';
import ModalSearchProduct from '@/components/ModalSearchProduct.vue';

// PROPERTY
// ------------------------------------
const router = useRouter();
const route = useRoute();
const Date = new MyDate();
const custname = ref(null);
const paidAmount = ref(null);
const isfetchingdata = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const iduser = myencription.decrypt(localStorage.getItem('id'));
const username = myencription.decrypt(localStorage.getItem('username'));
const role = myencription.decrypt(localStorage.getItem('role_name'));
const name = myencription.decrypt(localStorage.getItem('name'));
const token = localStorage.getItem('token');
const isPostingData = ref(false);
const updateMode = ref(false);
const ModalScCustomer = ref(null);
const ModalScProduct = ref(null);

const postSalesData = reactive({
  trans_no: 'AUTO',
  branchcode: '',
  trans_date: '',
  barcode: '',
  id_cust: '',
  cust_no: '',
  cust_name: '',
  id_user: '',
  username: '',
  name: '',
  role: '',
  notes: '',
  total: 0.0,
  other_fee: 0.0,
  ppn: 0.0,
  grand_total: 0.0,
  paid: 0.0,
  change_amount: 0.0,
  isppn: false,
  percent_ppn: '',
  is_credit: null,
  items: []
});

const transAmount = ref({
  total: 'Rp 0,00',
  other_fee: 'Rp 0,00',
  ppn: 'Rp 0,00',
  percent_ppn: 0,
  grand_total: 'Rp 0,00',
  paid: 'Rp 0,00',
  change_amount: 'Rp 0,00'
});
const listCacheItems = ref([]);
const validation = ref({
  trans_date: '',
  cust_name: '',
  id_cust: ''
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
const rows = ref(null);
const cols =
  ref([
    { field: 'barcode', title: 'Barcode', isUnique: true, width: '10%' },
    { field: 'name', title: 'Name', width: '24%' },
    // { field: 'category', title: 'Category', width: '12%', hide: true },
    { field: 'qty', title: 'Qty', width: '4%' },
    { field: 'id_unit', title: 'Unit', width: '5%' },
    { field: 'price', title: 'Price', width: '10%' },
    { field: 'total', title: 'Total', width: '15%' },
    { field: 'discount', title: 'Discount', width: '6%' },
    { field: 'sub_total', title: 'Sub Total', width: '17%' },
    { field: 'remaining_stock', title: 'Stock', width: '5%' },
    { field: 'actions', title: '#', width: '5%' }
  ]) || [];

// ---------------------------------------
// -------------------------------------------

// METHOD AND SUBROUTINE
// -------------------------------------------
function setupDefaultPostData() {
  postSalesData.branchcode = branch;
  postSalesData.trans_date = Date.getCurrentDate('DD/MM/YYYY');
  postSalesData.barcode = '';
  postSalesData.is_credit = false;
  postSalesData.isppn = false;
  postSalesData.id_user = iduser;
  postSalesData.username = username;
  postSalesData.role = role;
  postSalesData.name = name;
  postSalesData.id_cust = '';
  postSalesData.cust_no = '';
  postSalesData.cust_name = '';
  postSalesData.percent_ppn = 0;
  postSalesData.total = 0.0;
  postSalesData.other_fee = 0.0;
  postSalesData.ppn = 0.0;
  postSalesData.grand_total = 0.0;
  postSalesData.paid = 0.0;
  postSalesData.change_amount = 0.0;
  postSalesData.items = [];
}

function setupDefaultInterfaceItems() {
  interfaceitems.id_product = null;
  interfaceitems.barcode = '';
  interfaceitems.name = '';
  interfaceitems.category = '';
  interfaceitems.id_unit = '';
  interfaceitems.qty = 0;
  interfaceitems.price = 'Rp 0,00';
  interfaceitems.total = 'Rp 0,00';
  interfaceitems.discount = 'Rp 0,00';
  interfaceitems.sub_total = 'Rp 0,00';
  interfaceitems.remaining_stock = 0;
}

function setupDefaultAmountTrans() {
  transAmount.value.total = 'Rp 0,00';
  transAmount.value.other_fee = 'Rp 0,00';
  transAmount.value.ppn = 'Rp 0,00';
  transAmount.value.percent_ppn = 0;
  transAmount.value.grand_total = 'Rp 0,00';
  transAmount.value.paid = 'Rp 0,00';
  transAmount.value.change_amount = 'Rp 0,00';
}

function populateInterfaceItems(dataItem = {}) {
  interfaceitems.id_product = dataItem.id;
  interfaceitems.barcode = dataItem.barcode;
  interfaceitems.name = dataItem.name;
  interfaceitems.category = dataItem.category;
  interfaceitems.id_unit = dataItem.unit;
  interfaceitems.qty = 1;

  interfaceitems.price = dataItem.price.includes('Rp') ? dataItem.price : parseToRupiah(dataItem.price);
  interfaceitems.total = 'Rp 0,00';
  interfaceitems.discount = 'Rp 0,00';
  interfaceitems.sub_total = 'Rp 0,00';
  interfaceitems.remaining_stock = parseInt(dataItem.remaining_stock);
}
function populateInterfaceItemsBySession(dataItem = {}) {
  interfaceitems.id_product = dataItem.id_product;
  interfaceitems.barcode = dataItem.barcode;
  interfaceitems.name = dataItem.product_name;
  interfaceitems.category = dataItem.category_name;
  interfaceitems.id_unit = dataItem.unit;
  interfaceitems.qty = dataItem.qty;
  interfaceitems.price = parseToRupiah(parseFloat(dataItem.price));
  interfaceitems.total = parseToRupiah(parseFloat(dataItem.total));
  interfaceitems.discount = parseToRupiah(parseFloat(dataItem.discount));
  interfaceitems.sub_total = parseToRupiah(parseFloat(dataItem.sub_total));
  interfaceitems.remaining_stock = parseInt(dataItem.remaining_stock);
}

function populatelistCacheItem(data = {}) {
  listCacheItems.value.push(data);
}

function isAlreadyCached() {
  // Cek Apa kah Item Sudah Ada DI Cache
  if (listCacheItems.value.length > 0) {
    // Mereturn boolean
    return listCacheItems.value.some((item) => item.barcode === postSalesData.barcode);
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

function pushPostItemsSales(data = {}, editMode = false) {
  if (editMode) {
    postSalesData.items.push(data);
  } else {
    // Check Apakah postSalesData ada isinya
    if (postSalesData.items.length > 0) {
      // Check Apakah Item Sudah Ada
      const isExistItem = postSalesData.items.some((item) => item.barcode === data.barcode);
      if (isExistItem) {
        // Jika Ada Edit Qty
        const postSalesDataUpdated = postSalesData.items.map((item) => {
          if (item.barcode === data.barcode) {
            return { ...item, qty: parseInt(item.qty) + parseInt(data.qty) };
          } else {
            return item;
          }
        });
        postSalesData.items = [...postSalesDataUpdated];
      } else {
        // Jika Tidak Ada Langsung push item
        postSalesData.items.push(data);
      }
    } else {
      // Item sales Kosong
      postSalesData.items.push(data);
    }
    calculateItems();
  }
}

function getCachedItem() {
  // Filter Data Yang Sudah Ada Dicache
  let dataFiltered = listCacheItems.value.filter((item) => {
    return item.barcode == postSalesData.barcode;
  });

  // Ubah Property id_product dan id Unit menjadi id dan unit dalam dataFiltered
  let newData = dataFiltered.map(({ id_product, id_unit, ...rest }) => ({ id: id_product, unit: id_unit, ...rest }));
  return newData[0];
}

function refreshGrid() {
  const Data = [...postSalesData.items];
  rows.value = Data;
}

function updateItems(barcode, e, columnName) {
  resetPaidAmount();
  const amount = e.target.value || 0;
  switch (columnName) {
    case 'qty':
      const updatedtItemsQty = postSalesData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, qty: amount };
        } else {
          return item;
        }
      });
      postSalesData.items = [...updatedtItemsQty];
      break;
    case 'price':
      const updatedtItemsPrice = postSalesData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, price: parseToRupiah(amount) };
        } else {
          return item;
        }
      });
      postSalesData.items = [...updatedtItemsPrice];
      break;
    case 'discount':
      const updatedtItemsDiscount = postSalesData.items.map((item) => {
        if (item.barcode === barcode) {
          return { ...item, discount: parseToRupiah(amount) };
        } else {
          return item;
        }
      });
      postSalesData.items = [...updatedtItemsDiscount];
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
  resetPaidAmount();
  let isppn = postSalesData.isppn;

  if (!isppn) {
    transAmount.value.percent_ppn = 0;
    transAmount.value.ppn = parseToRupiah(0);
  } else {
    transAmount.value.percent_ppn = 11;
  }
  calculateAmountTrans();
}

function deleteItem(barcode) {
  const filteredItems = [...postSalesData.items].filter((item) => item.barcode !== barcode);
  postSalesData.items = [...filteredItems];
  calculateItems();
  refreshGrid();
}

function calculateItems() {
  const calculatedItemsTotal = postSalesData.items.map((item) => {
    let calcTotal = parseToFloat(item.qty) * parseToFloat(item.price);
    return { ...item, total: parseToRupiah(calcTotal) };
  });

  postSalesData.items = [...calculatedItemsTotal];
  const calculatedItemsSubtotal = postSalesData.items.map((item) => {
    let calcSub_total = parseToFloat(item.total) - parseToFloat(item.discount);
    if (calcSub_total < 0) {
      calcSub_total = 0;
    }
    return { ...item, sub_total: parseToRupiah(calcSub_total) };
  });
  postSalesData.items = [...calculatedItemsSubtotal];
  calculateAmountTrans();
}

function updateAmountTrans(e, fieldName) {
  resetPaidAmount();
  let value = parseFloat(e.target.value);

  switch (fieldName) {
    case 'otherfee':
      transAmount.value.other_fee = parseToRupiah(value);
      break;
    case 'paid':
      if (value < parseToFloat(transAmount.value.grand_total)) {
        transAmount.value.paid = parseToRupiah(0);
      } else {
        transAmount.value.paid = parseToRupiah(value);
      }
      break;

    default:
      break;
  }
  calculateAmountTrans();
}

function calculateAmountTrans() {
  let total = 0;
  let other_fee = parseToFloat(transAmount.value.other_fee);
  let paid = parseToFloat(transAmount.value.paid);
  let grand_total = 0;
  let change = 0;
  let salesItems = [...postSalesData.items];

  salesItems.forEach((item) => {
    total += parseToFloat(item.sub_total);
  });

  transAmount.value.total = parseToRupiah(parseToFloat(total));
  transAmount.value.other_fee = parseToRupiah(other_fee);
  calcPPn();
  let ppn = parseToFloat(transAmount.value.ppn);
  grand_total = total + other_fee + ppn;
  if (paid > 0) {
    change = paid - grand_total;
  }
  transAmount.value.grand_total = parseToRupiah(parseToFloat(grand_total));
  transAmount.value.change_amount = parseToRupiah(parseToFloat(change));
}

function clearBarcode() {
  postSalesData.barcode = '';
}

function resetPaidAmount() {
  transAmount.value.paid = parseToRupiah(parseToFloat(0));
}

function purifySalesData() {
  let amountTrans = { ...transAmount.value };
  const salesData = JSON.parse(JSON.stringify({ ...postSalesData }));
  salesData.trans_date = Date.changeformat(salesData.trans_date, 'DD/MM/YYYY', 'YYYY-MM-DD');
  salesData.percent_ppn = parseInt(amountTrans.percent_ppn);
  salesData.total = parseToFloat(amountTrans.total);
  salesData.other_fee = parseToFloat(amountTrans.other_fee);
  salesData.ppn = parseToFloat(amountTrans.ppn);
  salesData.grand_total = parseToFloat(amountTrans.grand_total);
  salesData.paid = parseToFloat(amountTrans.paid);
  salesData.change_amount = parseToFloat(amountTrans.change_amount);

  let salesDataItemsToFloat = [...salesData.items].map((item) => {
    item.qty = parseInt(item.qty);
    item.price = parseToFloat(item.price);
    item.total = parseToFloat(item.total);
    item.discount = parseToFloat(item.discount);
    item.sub_total = parseToFloat(item.sub_total);
    return item;
  });
  salesData.items = [...salesDataItemsToFloat];
  return salesData;
}

function errorHandle(error) {
  const excpetion = new ex(error);
  excpetion.func404 = error404;
  excpetion.func405 = error404;
  excpetion.func500 = error500;
  excpetion.showError();
  function error404() {
    showerror('Item Is Not Found');
  }
  function error500() {
    if (error.response.data.errors.general[0].includes('Insufficient Stock Of Supplies')) {
      showerror('Minus Stock Not Allowed', 'Warning !', 'orange');
    } else {
      showerror('ERROR!!! Internal Server Error');
    }
  }
}
function freewhitespacebarcode() {
  // Mengeliminasi white space awal dan akhir kalimat
  postSalesData.barcode = postSalesData.barcode.trim();
}

function successMessage(transCode) {
  iziSuccess('Success', `Sales : ${transCode} Successfully Saved`);
}
function validate() {
  let valid = true;
  if (postSalesData.id_cust == '' || postSalesData.id_cust == null) {
    validation.value.id_cust = 'ID CUST Cannot Be Empty';
    validation.value.cust_name = 'Customer Name Cannot Be Empty';

    valid = false;
    custname.value.focus();
    return valid;
  } else {
    validation.value.id_supplier = '';
    validation.value.supplier_name = '';
  }
  if (postSalesData.items.length === 0) {
    showerror('List Items cannot Be Empty !', 'Warning !', 'orange');
    valid = false;

    return valid;
  }
  if (postSalesData.items.length > 0) {
    if (postSalesData.items.some((item) => parseInt(parseToFloat(item.price)) === 0)) {
      showerror('Price In Item List Must Greater Than 0 !', 'Warning !', 'orange');
      valid = false;
      return valid;
    }
    if (postSalesData.items.some((item) => parseInt(parseToFloat(item.qty)) === 0)) {
      showerror('Qty In Item List Must Greater Than 0 !', 'Warning !', 'orange');
      valid = false;
      return valid;
    }
  }

  if (parseToFloat(transAmount.value.paid) === 0 && !Boolean(postSalesData.is_credit)) {
    showerror('Paid Ammount Must Be Greater Than 0 In Cash Transaction', 'Warning !', 'orange');
    valid = false;
    return valid;
  }

  return valid;
}

function checkPaymentType() {
  if (postSalesData.is_credit == true) {
    resetPaidAmount();
    calculateAmountTrans();
  }
}

function clearForm() {
  setupDefaultInterfaceItems();
  setupDefaultPostData();
  refreshGrid();
  setupDefaultAmountTrans();
}

async function checksession() {
  const routername = route.name;

  if (routername == 'salesedit') {
    if (sessionStorage.getItem('paramsid')) {
      const idSession = myencription.decrypt(sessionStorage.getItem('paramsid'));
      if (!idSession) {
        router.push({ name: 'sales' });
        return;
      }
      updateMode.value = true;
      const { item, sales } = await getApiSalesDataByID(idSession);

      const itemwithstock = [];

      // menambah property remaining stock
      for (const x of item) {
        let stock = await getApiStockByBarcode(x.barcode);
        stock = parseInt(stock) + x.qty;
        itemwithstock.push({ ...x, remaining_stock: parseInt(stock) });
      }
      isfetchingdata.value = false;
      populateSalesData(itemwithstock, sales);
    } else {
      router.push({ name: 'sales' });
    }
  }
}

function populateSalesData(dataItem, dataSales) {
  postSalesData.trans_no = dataSales.trans_no;
  postSalesData.trans_date = Date.changeformat(dataSales.trans_date, 'YYYY-MM-DD', 'DD/MM/YYYY');
  postSalesData.id_cust = dataSales.id_cust;
  postSalesData.cust_no = dataSales.cust_no;
  postSalesData.cust_name = dataSales.cust_name;
  postSalesData.is_credit = Boolean(dataSales.is_sales_credit);
  postSalesData.isppn = Boolean(dataSales.percent_ppn != 0);
  postSalesData.notes = dataSales.sales_notes;
  transAmount.value.total = parseToRupiah(parseFloat(dataSales.total_sales));
  transAmount.value.other_fee = parseToRupiah(parseFloat(dataSales.other_fee));
  transAmount.value.ppn = parseToRupiah(parseFloat(dataSales.sales_ppn));
  transAmount.value.percent_ppn = dataSales.percent_ppn;
  transAmount.value.grand_total = parseToRupiah(parseFloat(dataSales.grand_total));
  transAmount.value.paid = parseToRupiah(parseFloat(dataSales.paid));
  transAmount.value.change_amount = parseToRupiah(parseFloat(dataSales.change_amount));
  dataItem.forEach((data) => {
    populateInterfaceItemsBySession(data);
    populatelistCacheItem({ ...interfaceitems });
    pushPostItemsSales({ ...interfaceitems }, true);
  });
  refreshGrid();
}

// ----------------------------------------------

// API CALLER
// ---------------------------------------------
async function getApiProductbyBarcode() {
  // Mengeliminasi white space awal dan akhir kalimat input barcode
  freewhitespacebarcode();

  // Reset Amount paid ke 0 menjaga agar change amout tidak minus
  resetPaidAmount();

  if (isAlreadyCached()) {
    // Jika Items Sudah Ada Di Cached
    populateInterfaceItems(getCachedItem());
    pushPostItemsSales({ ...interfaceitems });
    refreshGrid();
  } else {
    // Jika Items belum Ada Di Cached
    try {
      loading.value = true;
      const response = await axios.get(`${apiurl}/api/products/detail/${branch}/${postSalesData.barcode}`, {
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
      pushPostItemsSales({ ...interfaceitems });
      refreshGrid();
    } catch (error) {
      loading.value = false;
      errorHandle(error);
    }
  }
  clearBarcode();
}

async function getApiSalesDataByID(ID) {
  try {
    isfetchingdata.value = true;
    const response = await axios.get(`${apiurl}/api/sales/detail/${branch}/${ID}`, {
      headers: {
        Authorization: token
      }
    });

    isfetchingdata.value = false;
    return response.data.data;
  } catch (error) {
    isPostingData.value = false;
    const nullData = {
      item: [],
      sales: null
    };
    console.log(error);
    return nullData;
  }
}

async function postApiSalesData() {
  if (validate()) {
    let postData = purifySalesData();
    if (updateMode.value) {
      try {
        isPostingData.value = true;
        const response = await axios.put(`${apiurl}/api/sales/${branch}/${postSalesData.trans_no}`, postData, {
          headers: {
            Authorization: token
          }
        });
        let trans_no = response.data.data.sales.trans_no;
        sessionStorage.setItem('successmessage', `Successfully Updated Sales Transaction : ${trans_no}`);
        router.push({ name: 'sales' });
      } catch (error) {
        errorHandle(error);
      } finally {
        isPostingData.value = false;
      }
    } else {
      try {
        isPostingData.value = true;
        const response = await axios.post(`${apiurl}/api/sales`, postData, {
          headers: {
            Authorization: token
          }
        });

        let trans_no = response.data.data.sales.trans_no;
        successMessage(trans_no);
        clearForm();
      } catch (error) {
        console.log(error);
        errorHandle(error);
      } finally {
        isPostingData.value = false;
      }
    }
  }
}

async function getApiStockByBarcode(Barcode) {
  try {
    let stock = 0;
    isfetchingdata.value = true;
    const response = await axios.get(`${apiurl}/api/products/detail/${branch}/${Barcode}`, {
      headers: {
        Authorization: token
      }
    });
    stock = parseInt(response.data.data.remaining_stock);
    return stock;
  } catch (error) {
    isfetchingdata.value = false;
    errorHandle(error);
    return stock;
  }
}

// ---------------------------------------------

// Event dan Method relasi child dan parent
// ---------------------------------------------
function showFormSearchCust() {
  ModalScCustomer.value.getCustomer();
}
function showFormSearchProduct() {
  ModalScProduct.value.loadModal();
}

function populateFieldCustomer(customerData) {
  postSalesData.id_cust = customerData.id;
  postSalesData.cust_no = customerData.cust_no;
  postSalesData.cust_name = customerData.name;
  validation.value.cust_name = '';
}
function populateBarcode(productData) {
  postSalesData.barcode = productData.barcode;
}
function getDataModalCustomer(data) {
  populateFieldCustomer(data);
}
function getDataModalProduct(data) {
  populateBarcode(data);
}

// ----------------------------------------------

// Life Cycle Hooks
// --------------------------------------------
onMounted(() => {
  setupDefaultPostData();
  checksession();
});
onUnmounted(() => {
  sessionStorage.removeItem('paramsid');
});

// ------------------------------------------
</script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <template v-if="route.name == 'salesedit'">
          <h1>Sales > Edit sales</h1>
          <span class=""
            ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'sales' }">sales</router-link> /
            <router-link :to="{ name: 'salesedit' }">edit</router-link>
          </span>
        </template>
        <template v-else>
          <h1>Sales > Add New Sales</h1>
          <span class=""
            ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'sales' }">sales</router-link> /
            <router-link :to="{ name: 'salescreate' }">create</router-link>
          </span>
        </template>
      </div>
      <!--LOADING SPINNER  -->
      <template v-if="isfetchingdata">
        <div class="row">
          <div class="col-lg-12">
            <div class="card-body">
              <div class="loading-overlay">
                <div class="loading-icon"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- END LOADING SPINNER -->
      <template v-else>
        <div class="row">
          <div class="col-lg-6">
            <div class="card card-secondary">
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="trans_no">Transaction Number</label>
                      <input type="text" class="form-control defaultInptStyle" id="trans_no" v-model="postSalesData.trans_no" disabled />
                    </div>
                    <div class="form-group">
                      <label for="trans_date">Transaction Date</label>
                      <flatPickr class="form-control defaultInptStyle" :config="config" v-model="postSalesData.trans_date"></flatPickr>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="Supplier">ID Cust</label>
                      <div class="input-group">
                        <div class="input-group-append">
                          <input type="text" class="form-control defaultInptStyle" readonly id="Supplier" v-model="postSalesData.cust_no" />
                          <button
                            class="input-group-text"
                            style="cursor: pointer"
                            @click="showFormSearchCust"
                            title="Search Customer"
                            data-toggle="modal"
                            data-target="#modalCustomer"
                          >
                            <i class="fas fa-search"></i>
                          </button>
                          <button class="input-group-text" style="cursor: pointer" title="Add New Customer" @click="router.push({ name: 'mastercustomer' })">
                            <i class="fas fa-user-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="customer">Customer Name *</label>
                      <input
                        type="text"
                        ref="custname"
                        class="form-control defaultInptStyle"
                        :class="{ 'is-invalid': validation.cust_name }"
                        readonly
                        id="customer"
                        v-model="postSalesData.cust_name"
                      />
                      <div class="invalid-feedback">{{ validation.cust_name }}</div>
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
                      <input type="text" class="form-control defaultInptStyle" id="username" v-model="postSalesData.username" disabled />
                    </div>
                    <div class="form-group">
                      <label for="pic_name">Pic Name</label>
                      <input type="text" class="form-control defaultInptStyle" disabled v-model="postSalesData.name" id="pic_name" />
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label for="role">Role</label>
                      <input type="text" class="form-control defaultInptStyle" disabled id="role" v-model="postSalesData.role" />
                    </div>
                    <div class="form-group">
                      <label for=""> Payment</label>
                      <div class="d-flex pt-2">
                        <div class="form-check mr-2">
                          <input
                            class="form-check-input"
                            type="radio"
                            v-model="postSalesData.is_credit"
                            @change="checkPaymentType()"
                            name="radiopayment"
                            id="kredit"
                            :value="true"
                          />
                          <label class="form-check-label" style="font-weight: 400; font-size: larger" for="kredit">Kredit</label>
                        </div>
                        <div class="form-check mr-2">
                          <input
                            class="form-check-input"
                            type="radio"
                            @change="checkPaymentType()"
                            v-model="postSalesData.is_credit"
                            name="radiopayment"
                            id="cash"
                            :value="false"
                          />
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
                  <label for="barcode">Barcode</label>
                  <div class="input-group row">
                    <div class="input-group-prepend col-lg-8">
                      <div class="input-group-text">
                        <i class="fas fa-barcode"></i>
                      </div>
                      <input type="text" class="form-control defaultInptStyle" style="width: 100%" v-model="postSalesData.barcode" @keyup.enter="getApiProductbyBarcode" />
                      <button type="button" class="btn" title="Add Item" @click="getApiProductbyBarcode"><i class="fas fa-cart-plus"></i></button>
                      <button type="button" class="btn" @click="showFormSearchProduct" title="Search Product" data-toggle="modal" data-target="#modalProduct">
                        <i class="fas fa-search"></i>
                      </button>
                      <button type="button" class="btn" title="Add New Item" @click="router.push({ name: 'masterproductcreate' })"><i class="fas fa-plus"></i></button>
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
                  <label class="col-lg-4 d-flex justify-content-between" style="font-size: 30px; font-weight: bold">Grand Total <span>:</span></label>
                  <label class="text-primary col-lg-6" style="font-size: 30px; font-weight: bold">{{ transAmount.grand_total }}</label>
                </div>
                <div class="form-group row" style="margin-top: -20px">
                  <label class="col-lg-4 d-flex justify-content-between" style="font-size: 30px; font-weight: bold">Paid <span>:</span></label>
                  <div class="col-lg-6">
                    <input
                      ref="paidAmount"
                      type="text"
                      class="form-control text-warning"
                      style="font-size: 30px; font-weight: bold; margin-left: -10px"
                      v-model="transAmount.paid"
                      :disabled="Boolean(postSalesData.is_credit)"
                      @keyup="eliminateNonNumerikalInput($event)"
                      @focusin="startInput($event)"
                      @focusout="updateAmountTrans($event, 'paid')"
                      @abort="updateAmountTrans($event, 'paid')"
                    />
                  </div>
                </div>
                <div class="form-group row" style="margin-top: -20px">
                  <label class="col-lg-4 d-flex justify-content-between" style="font-size: 30px; font-weight: bold">Change <span>:</span></label>
                  <label class="text-success col-lg-6" style="font-size: 30px; font-weight: bold">{{ transAmount.change_amount }}</label>
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
                <h5 class="card-title">ITEMS LIST *</h5>
              </div>
              <div class="card-body">
                <!-- Slots Vue 3 Datatabble -->
                <vue3-datatable :loading="loading" :rows="rows" :columns="cols" height="300px" :stickyHeader="true" :showNumbers="false">
                  <template #qty="data">
                    <input
                      type="number"
                      min="1"
                      :value="data.value.qty"
                      @focusin="startInput($event)"
                      style="max-width: 60px !important"
                      @focusout="updateItems(data.value.barcode, $event, 'qty')"
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
          <div class="col-lg-7">
            <div class="form-group row">
              <label style="font-size: large; font-family: Arial, Helvetica, sans-serif" class="col-lg-1">Notes</label>
              <textarea v-model="postSalesData.notes" class="form-control col-lg-11" style="font-size: 16px; font-weight: bold" rows="3"></textarea>
            </div>
          </div>
          <div class="col-lg-5">
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
                    >Ppn <input type="checkbox" v-model="postSalesData.isppn" @change="checklistppn()"
                  /></label>
                  <input
                    type="number"
                    class="form-control col-lg-2 defaultInptStyle"
                    @change="calculateAmountTrans()"
                    style="font-size: 18px; font-weight: bold"
                    :readonly="!postSalesData.isppn"
                    v-model="transAmount.percent_ppn"
                  />
                  <label class="col-lg-1 pt-1" style="font-size: 18px">%</label>
                  <input type="text" class="form-control col-lg-6 defaultInptStyle" readonly v-model="transAmount.ppn" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary mr-2" @click="postApiSalesData()">
          <div v-if="isPostingData" style="display: flex; justify-content: center; padding-top: 5px; padding-bottom: 5px">
            <div class="spinner" style="display: inline-block"></div>
          </div>
          <span v-else><i class="fas fa-save mr-2"> </i>Save</span>
        </button>
        <button class="btn btn-success mr-2" v-if="!updateMode" @click="clearForm"><i class="fas fa-sync-alt"></i> Clear</button>
        <button class="btn btn-danger mr-2" @click="router.push({ name: 'sales' })"><i class="fas fa-arrow-alt-circle-left"></i> Back</button>
      </template>
    </section>
  </div>

  <!-- Modal Form -->
  <ModalSearchCustomer ref="ModalScCustomer" @modalDataCustomer="getDataModalCustomer" />
  <ModalSearchProduct ref="ModalScProduct" @modalDataProduct="getDataModalProduct" />
</template>

<style scoped>
.defaultInptStyle {
  font-size: 18px;
  font-weight: bold;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.4);
  border-top: 4px solid #e6eaec;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spinnn 1s linear infinite;
}

@keyframes spinnn {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Style untuk loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999999;
}

/* Gaya untuk loading icon */
.loading-icon {
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
