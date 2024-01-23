<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PurchaseTable from '@/components/PurchaseTable.vue';
import axios from 'axios';
import ex from '@/exception.js';
import { iziSuccess } from '@/izitoast';
import { ElDialog, ElSkeleton } from 'element-plus';
import { formatRupiah } from '@/rupiahformatter';

const router = useRouter();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const itemPurchase = ref([]);
const transPurchase = ref({});
const isPostingData = ref(false);
const modalDetailItemVisible = ref(false);
const isfetchingdata = ref(false);

const populateModal = async (data) => {
  let getData = data.data;
  modalDetailItemVisible.value = true;
  getApiItemPurchase(getData);
};
const addNewView = () => {
  router.push({
    name: 'purchasecreate'
  });
};

const getApiItemPurchase = async (data) => {
  isfetchingdata.value = true;
  try {
    const apiData = await axios.get(`${apiurl}/api/purchases/detail/${branch}/${data.id}`, {
      headers: {
        Authorization: token
      }
    });
    let dataItem = apiData.data.data.item;
    let dataTrans = apiData.data.data.purchase;
    itemPurchase.value = dataItem;
    transPurchase.value = dataTrans;
    isfetchingdata.value = false;
  } catch (error) {
    isfetchingdata.value = false;
    transPurchase.value = {};
    itemPurchase.value = [];
    const exception = new ex(error);
    exception.showError();
  }
};
</script>
<template>
  <!-- Modal Form -->
  <el-dialog v-model="modalDetailItemVisible" destroy-on-close>
    <template #header="" v-if="!isfetchingdata && transPurchase">
      <h5>Trans No: [{{ transPurchase.trans_no }}]</h5>
    </template>
    <el-skeleton :rows="3" animated v-if="isfetchingdata" />
    <table class="table table-sm table-bordered" v-if="!isfetchingdata && itemPurchase.length > 0">
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
        <tr v-for="item in itemPurchase" :key="item.barcode">
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
          <td style="font-weight: bold" class="text-center">{{ formatRupiah(transPurchase.total_purchase) }}</td>
        </tr>
      </tbody>
    </table>
  </el-dialog>

  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header">
        <h1>Purchase</h1>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card card-primary">
            <div class="card-body">
              <div class="d-flex">
                <button class="btn btn-primary mt-2 mb-4" @click="addNewView()" data-toggle="modal" data-target="#modalSupplier"><i class="fas fa-plus"></i> Add New</button>
              </div>
              <PurchaseTable @view-item="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped></style>
