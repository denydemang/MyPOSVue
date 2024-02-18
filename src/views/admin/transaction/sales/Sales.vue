<script setup>
// ----------------------------------------------- Import Library And Dependency
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ex from '@/exception.js';
import { iziSuccess } from '@/izitoast';
import { ElDialog, ElSkeleton } from 'element-plus';
import { formatRupiah } from '@/rupiahformatter';
import SalesTable from '@/components/SalesTable.vue';
// ----------------------------------------------- End Import Library And Dependency

// ---------------------------------------------- property
const router = useRouter();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const apiTrans = '/api/sales/';
const itemSales = ref([]);
const transSales = ref({});
const modalDetailItemVisible = ref(false);
const isfetchingdata = ref(false);
// --------------------------------------- end property

// -------------------------------------------- function and subroutine

// Get Data Click View Item from vue3 datatble and Populate to modal el skeleton
function populateModal(data) {
  let getData = data.data;
  modalDetailItemVisible.value = true;
  getApiItemSales(getData);
}

// Redirect to Page Sales Manage
function addNewView() {
  router.push({
    name: 'salescreate'
  });
}

function manageError(error) {
  isfetchingdata.value = false;
  transSales.value = {};
  itemSales.value = [];
  const exception = new ex(error);
  exception.showError();
}

function getSuccessNotifFromSession() {
  if (sessionStorage.getItem('successmessage') != null) {
    const succesUpdateMessage = sessionStorage.getItem('successmessage');
    iziSuccess('Success', succesUpdateMessage);
    sessionStorage.removeItem('successmessage');
  }
}
// -------------------------------------------- end function and subroutine

// ---------------------------------------------- api interaction
async function getApiItemSales(data) {
  isfetchingdata.value = true;
  try {
    const apiData = await axios.get(`${apiurl}${apiTrans}detail/${branch}/${data.id}`, {
      headers: {
        Authorization: token
      }
    });
    console.log(apiData);
    let dataItem = apiData.data.data.item;
    let dataTrans = apiData.data.data.sales;
    itemSales.value = dataItem;
    transSales.value = dataTrans;
    isfetchingdata.value = false;
  } catch (error) {
    manageError(error);
  }
}

// ----------------------------------------- end  api interraction

// -------------------------------------------life cyclehooks
onMounted(() => {
  getSuccessNotifFromSession();
});
// ----------------------------------------- end lifecyclehooks
</script>
<template>
  <!-- Modal Form -->
  <el-dialog v-model="modalDetailItemVisible" destroy-on-close>
    <template #header="" v-if="!isfetchingdata && transSales">
      <h5>Trans No: [{{ transSales.trans_no }}]</h5>
    </template>
    <el-skeleton :rows="3" animated v-if="isfetchingdata" />
    <table class="table table-sm table-bordered" v-if="!isfetchingdata && itemSales.length > 0">
      <thead>
        <th>Barcode</th>
        <th>Name</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>Price</th>
        <th>Sub Total</th>
        <th>Disc</th>
        <th>Grand Total</th>
      </thead>
      <tbody>
        <tr v-for="item in itemSales" :key="item.barcode">
          <td>{{ item.barcode }}</td>
          <td>{{ item.product_name }}</td>
          <td>{{ item.qty }}</td>
          <td>{{ item.unit }}</td>
          <td>{{ formatRupiah(item.price) }}</td>
          <td>{{ formatRupiah(item.total) }}</td>
          <td>{{ formatRupiah(item.discount) }}</td>
          <td class="text-center">{{ formatRupiah(item.sub_total) }}</td>
        </tr>
        <tr>
          <td colspan="7" class="text-right pr-3" style="font-weight: bold">Grand Total Item (Sum)</td>
          <td style="font-weight: bold" class="text-center">{{ formatRupiah(transSales.total_sales) }}</td>
        </tr>
      </tbody>
    </table>
  </el-dialog>

  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Sales</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'sales' }">sales</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card card-primary">
            <div class="card-body">
              <div class="d-flex">
                <button class="btn btn-primary mt-2 mb-4" @click="addNewView"><i class="fas fa-plus"></i> Add New</button>
              </div>
              <SalesTable @view-item="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
