<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import GRNTable from '@/components/GRNTable.vue';
import axios from 'axios';
import ex from '@/exception.js';
import { iziSuccess } from '@/izitoast';
import { ElDialog, ElSkeleton } from 'element-plus';
import { formatRupiah } from '@/rupiahformatter';

const router = useRouter();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const itemgrns = ref([]);
const transgrns = ref({});
const modalDetailItemVisible = ref(false);
const isfetchingdata = ref(false);

const populateModal = async (data) => {
  let getData = data.data;
  modalDetailItemVisible.value = true;
  getApiItemgrns(getData);
};
const addNewView = () => {
  router.push({
    name: 'grnscreate'
  });
};

const getApiItemgrns = async (data) => {
  isfetchingdata.value = true;
  try {
    const apiData = await axios.get(`${apiurl}/api/grns/detail/${branch}/${data.id}`, {
      headers: {
        Authorization: token
      }
    });
    let dataItem = apiData.data.data.item;
    let dataTrans = apiData.data.data.grns;
    itemgrns.value = dataItem;
    transgrns.value = dataTrans;
    isfetchingdata.value = false;
  } catch (error) {
    isfetchingdata.value = false;
    transgrns.value = {};
    itemgrns.value = [];
    const exception = new ex(error);
    exception.showError();
  }
};
onMounted(() => {
  if (sessionStorage.getItem('successmessage') != null) {
    const succesUpdateMessage = sessionStorage.getItem('successmessage');
    iziSuccess('Success', succesUpdateMessage);
    sessionStorage.removeItem('successmessage');
  }
});
</script>
<template>
  <!-- Modal Form -->
  <el-dialog v-model="modalDetailItemVisible" destroy-on-close>
    <template #header="" v-if="!isfetchingdata && transgrns">
      <h5>Trans No: [{{ transgrns.trans_no }}]</h5>
    </template>
    <el-skeleton :rows="3" animated v-if="isfetchingdata" />
    <table class="table table-sm table-bordered" v-if="!isfetchingdata && itemgrns.length > 0">
      <thead>
        <th>Barcode</th>
        <th>Name</th>
        <th>Qty</th>
        <th>Bonus Qty</th>
        <th>Unit</th>
        <th>Unit Bonus</th>
        <th>Price</th>
        <th>Sub Total</th>
        <th>Disc</th>
        <th>Grand Total</th>
      </thead>
      <tbody>
        <tr v-for="item in itemgrns" :key="item.barcode">
          <td>{{ item.barcode }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.qty }}</td>
          <td>{{ item.bonusqty }}</td>
          <td>{{ item.id_unit }}</td>
          <td>{{ item.unitbonusqty }}</td>
          <td>{{ formatRupiah(item.price) }}</td>
          <td>{{ formatRupiah(item.total) }}</td>
          <td>{{ formatRupiah(item.discount) }}</td>
          <td class="text-center">{{ formatRupiah(item.sub_total) }}</td>
        </tr>
        <tr>
          <td colspan="9" class="text-right pr-3" style="font-weight: bold">Grand Total Item (Sum)</td>
          <td style="font-weight: bold" class="text-center">{{ formatRupiah(transgrns.total_purchase) }}</td>
        </tr>
      </tbody>
    </table>
  </el-dialog>

  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>GRN (Goods Receive Notes)</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'grn' }">grn</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card card-primary">
            <div class="card-body">
              <div class="d-flex">
                <button class="btn btn-primary mt-2 mb-4" @click="addNewView"><i class="fas fa-plus"></i> Add New</button>
              </div>
              <GRNTable @view-item="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped></style>
