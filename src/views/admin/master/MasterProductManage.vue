<script setup>
import { onMounted, ref, reactive, onUnmounted, onBeforeMount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { dateNow } from '@/mytime';
import myenc from '@/myencription.js';
import axios from 'axios';
import { formatRupiah } from '@/rupiahformatter';
import ex from '@/exception.js';
import checkview from '@/access.js';
const router = useRouter();
const route = useRoute();
const isfetchingdata = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const namesession = ref('');
const isdisabledinitialstock = ref(true);
const isdisabledbuyprice = ref(true);
const isdisabledbarcode = ref(false);
const token = localStorage.getItem('token');
const inputPrice = ref(0);
const inputBuyPrice = ref(0);
const inputname = ref(null);
const inputbarcode = ref(null);
const ispostingdata = ref(false);
let paramsid = sessionStorage.getItem('paramsid');
const listcategory = ref([]);
const listunit = ref([]);
const ischeckedinitialstock = ref(false);
const ischeckedbuyprice = ref(false);

const validation = ref({
  barcode: '',
  name: '',
  brands: '',
  price: '',
  maxstock: '',
  minstock: '',
  id_category: '',
  id_unit: ''
});
const postData = reactive({
  branchcode: branch,
  barcode: '',
  name: '',
  brands: '',
  id_category: null,
  price: formatRupiah(0),
  maxstock: 0,
  minstock: 0,
  initialstock: 0,
  id_unit: null,
  buyprice: formatRupiah(0),
  status: true,
  id_product: null,
  date: dateNow()
});
onUnmounted(() => {
  sessionStorage.removeItem('paramsid');
});
onMounted(async () => {
  if ((await checksession()) == false) {
    router.push({
      name: 'masterproduct'
    });
  } else {
    if (route.name == 'masterproductcreate') {
      inputbarcode.value.focus();
    } else {
      inputname.value.focus();
    }
  }
});

const manageerror = (error) => {
  if (error.response.data.errors.hasOwnProperty('barcode')) {
    validation.value.barcode = error.response.data.errors.barcode[0];
  } else {
    validation.value.barcode = '';
  }
  if (error.response.data.errors.hasOwnProperty('name')) {
    validation.value.name = error.response.data.errors.name[0];
  } else {
    validation.value.name = '';
  }
  if (error.response.data.errors.hasOwnProperty('brands')) {
    validation.value.brands = error.response.data.errors.brands[0];
  } else {
    validation.value.brands = '';
  }
  if (error.response.data.errors.hasOwnProperty('price')) {
    validation.value.price = error.response.data.errors.price[0];
  } else {
    validation.value.price = '';
  }
  if (error.response.data.errors.hasOwnProperty('maxstock')) {
    validation.value.maxstock = error.response.data.errors.maxstock[0];
  } else {
    validation.value.maxstock = '';
  }
  if (error.response.data.errors.hasOwnProperty('minstock')) {
    validation.value.minstock = error.response.data.errors.minstock[0];
  } else {
    validation.value.minstock = '';
  }
  if (error.response.data.errors.hasOwnProperty('id_category')) {
    validation.value.id_category = error.response.data.errors.id_category[0];
  } else {
    validation.value.id_category = '';
  }
  if (error.response.data.errors.hasOwnProperty('id_unit')) {
    validation.value.id_unit = error.response.data.errors.id_unit[0];
  } else {
    validation.value.id_unit = '';
  }
};

const checksession = async () => {
  try {
    isfetchingdata.value = true;
    const responseDataCategory = await axios.get(`${apiurl}/api/categories/list/1000/${branch}`, {
      headers: {
        Authorization: token
      }
    });
    const responseDataUnit = await axios.get(`${apiurl}/api/units/default`, {
      headers: {
        Authorization: token
      }
    });
    const categoryData = responseDataCategory.data.data;
    const unitData = responseDataUnit.data.data;
    listcategory.value = categoryData;
    listunit.value = unitData;
    if (route.name == 'masterproductcreate') {
      namesession.value = 'Add New Product';
      isfetchingdata.value = false;
      return true;
    } else {
      namesession.value = 'Edit Product';

      if (paramsid) {
        paramsid = myenc.decrypt(paramsid);

        const responseDataProduct = await axios.get(`${apiurl}/api/products/detail/${branch}/${paramsid}`, {
          headers: {
            Authorization: token
          }
        });
        const responseDataInitial = await axios.get(`${apiurl}/api/stocks/initial/${branch}/${paramsid}`, {
          headers: {
            Authorization: token
          }
        });

        const productData = responseDataProduct.data.data;
        const initialstock = responseDataInitial.data.data;
        if (initialstock) {
          ischeckedinitialstock.value = true;
          ischeckedbuyprice.value = true;
          isdisabledbuyprice.value = false;
          isdisabledinitialstock.value = false;
          postData.buyprice = formatRupiah(initialstock.cogs);
          postData.initialstock = initialstock.actual_stock;
        } else {
          ischeckedinitialstock.value = false;
          ischeckedbuyprice.value = false;
          isdisabledbuyprice.value = true;
          isdisabledinitialstock.value = true;
        }
        postData.barcode = productData.barcode;
        postData.name = productData.name;
        postData.brands = productData.brands;
        postData.price = formatRupiah(productData.price);
        postData.id_category = productData.id_category;
        postData.id_unit = productData.unit;
        postData.maxstock = productData.maxstock;
        postData.minstock = productData.minstock;
        isdisabledbarcode.value = true;

        isfetchingdata.value = false;
        return true;
      }
      return false;
    }
  } catch (error) {
    return false;
  }
};

const postApiData = async () => {
  try {
    ispostingdata.value = true;
    postData.price = postData.price.replace(/\D/g, '');
    postData.buyprice = postData.buyprice.replace(/\D/g, '');
    const responseDataProduct = await axios.post(`${apiurl}/api/products`, postData, {
      headers: {
        Authorization: token
      }
    });
    if (!isdisabledinitialstock.value && !isdisabledbuyprice.value && postData.buyprice != 0 && postData.initialstock != 0 && postData.initialstock != null) {
      postData.id_product = responseDataProduct.data.data.id;
      await axios.post(`${apiurl}/api/stocks/initial/create`, postData, {
        headers: {
          Authorization: token
        }
      });
    }
    let getbarcode = responseDataProduct.data.data.barcode;
    sessionStorage.setItem('success', `Successfully Created New Product (${getbarcode})`);
    router.push({
      name: 'masterproduct'
    });
  } catch (error) {
    ispostingdata.value = false;
    postData.price = formatRupiah(postData.price);
    postData.buyprice = formatRupiah(postData.buyprice);
    const exception = new ex(error);
    exception.func400 = manageerror;
    exception.showError();
  }
};
const putApiData = async () => {
  try {
    ispostingdata.value = true;
    postData.price = postData.price.replace(/\D/g, '');
    postData.buyprice = postData.buyprice.replace(/\D/g, '');
    const responseDataProduct = await axios.put(`${apiurl}/api/products/${branch}/${paramsid}`, postData, {
      headers: {
        Authorization: token
      }
    });
    if (!isdisabledinitialstock.value && !isdisabledbuyprice.value && postData.buyprice != 0 && postData.initialstock != 0 && postData.initialstock != null) {
      await axios.put(`${apiurl}/api/stocks/initial/${branch}/${paramsid}`, postData, {
        headers: {
          Authorization: token
        }
      });
    }
    let getbarcode = responseDataProduct.data.data.barcode;
    sessionStorage.setItem('success', `Successfully Updated Product (${getbarcode})`);
    router.push({
      name: 'masterproduct'
    });
  } catch (error) {
    ispostingdata.value = false;
    postData.price = formatRupiah(postData.price);
    const exception = new ex(error);
    exception.func400 = manageerror;
    exception.showError();
  }
};
const backtomaster = () => {
  router.push({
    name: 'masterproduct'
  });
};
const ceklistinitialstock = (e) => {
  if (e.target.checked) {
    isdisabledinitialstock.value = false;
  } else {
    isdisabledinitialstock.value = true;
    postData.initialstock = 0;
  }
};
const ceklistbuyprice = (e) => {
  if (e.target.checked) {
    isdisabledbuyprice.value = false;
  } else {
    isdisabledbuyprice.value = true;
    postData.buyprice = formatRupiah(0);
  }
};
const filterinput = (price = false, buyprice = false) => {
  if (price) {
    inputPrice.value = postData.price.replace(/\D/g, '');
    postData.price = formatRupiah(inputPrice.value);
  }
  if (buyprice) {
    inputBuyPrice.value = postData.buyprice.replace(/\D/g, '');
    postData.buyprice = formatRupiah(inputBuyPrice.value);
  }
};
onBeforeMount(() => {
  if (!checkview('master_item')) {
    router.push({
      name: 'notfoundthrow'
    });
  }
});
</script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Product > {{ namesession }}</h1>
        <span v-if="route.name == 'masterproductcreate'"
          ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masterproduct' }">masterproduct</router-link> /

          <router-link :to="{ name: 'masterproductcreate' }">addnew</router-link>
        </span>
        <span v-if="route.name == 'masterproductedit'"
          ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masterproduct' }">masterproduct</router-link> /

          <router-link :to="{ name: 'masterproductedit' }">edit</router-link>
        </span>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card card-info">
            <div class="card-header">
              <h4>{{ namesession }}</h4>
            </div>
            <div class="card-body">
              <div v-if="isfetchingdata" class="loading-overlay">
                <div class="loading-icon"></div>
              </div>
              <template v-else>
                <div class="row">
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Barcode</label>
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <div class="input-group-text">
                            <i class="fas fa-barcode"></i>
                          </div>
                        </div>
                        <input
                          ref="inputbarcode"
                          :disabled="isdisabledbarcode"
                          style="font-size: 18px; font-weight: bold"
                          v-model="postData.barcode"
                          type="text"
                          class="form-control"
                          :class="{ 'is-invalid': validation.barcode }"
                          @keyup.enter="inputname.focus()"
                        />
                        <div class="invalid-feedback">{{ validation.barcode }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Name</label>
                      <input
                        ref="inputname"
                        style="font-size: 18px; font-weight: bold"
                        v-model="postData.name"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validation.name }"
                      />
                      <div class="invalid-feedback">{{ validation.name }}</div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Brands</label>
                      <input style="font-size: 18px; font-weight: bold" v-model="postData.brands" type="text" class="form-control" :class="{ 'is-invalid': validation.brands }" />
                      <div class="invalid-feedback">{{ validation.brands }}</div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Category</label>
                      <select v-model="postData.id_category" style="font-size: 15px; font-weight: bold" class="form-control" :class="{ 'is-invalid': validation.id_category }">
                        <option v-for="category in listcategory" :key="category.id" :value="category.id">{{ category.name }}</option>
                      </select>
                      <div class="invalid-feedback">{{ validation.id_category }}</div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Price</label>
                      <input
                        style="font-size: 18px; font-weight: bold"
                        @keyup="filterinput(true, false)"
                        v-model="postData.price"
                        type="text"
                        class="form-control inputprice"
                        :class="{ 'is-invalid': validation.price }"
                      />
                      <div class="invalid-feedback">{{ validation.price }}</div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Min Stock</label>
                      <input
                        style="font-size: 18px; font-weight: bold"
                        v-model="postData.minstock"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': validation.minstock }"
                      />
                      <div class="invalid-feedback">{{ validation.minstock }}</div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>MaxStock</label>
                      <input
                        style="font-size: 18px; font-weight: bold"
                        v-model="postData.maxstock"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': validation.maxstock }"
                      />
                      <div class="invalid-feedback">{{ validation.maxstock }}</div>
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label>Unit</label>
                      <select v-model="postData.id_unit" style="font-size: 15px; font-weight: bold" class="form-control" :class="{ 'is-invalid': validation.id_unit }">
                        <option v-for="unit in listunit" :key="unit.id_unit" :value="unit.id_unit">{{ unit.name }}</option>
                      </select>
                      <div class="invalid-feedback">{{ validation.id_unit }}</div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label
                        ><input @change="ceklistinitialstock" :checked="ischeckedinitialstock" :disabled="namesession == 'Edit Product'" type="checkbox" class="mr-2" />Initial
                        Stock</label
                      >
                      <i class="text-warning text-sm ml-2 d-lg-inline d-block" style="font-size: smaller">Dont Fill In If Any Purchasing Transaction</i>
                      <input style="font-size: 18px; font-weight: bold" v-model="postData.initialstock" :readonly="isdisabledinitialstock" type="number" class="form-control" />
                    </div>
                  </div>
                  <div class="col-lg-4 col-12">
                    <div class="form-group">
                      <label
                        ><input type="checkbox" class="mr-2" :checked="ischeckedinitialstock" :disabled="namesession == 'Edit Product'" @change="ceklistbuyprice" />Buy Price</label
                      >
                      <i class="text-warning ml-2 d-lg-inline d-block" style="font-size: smaller">Dont Fill In If Any Purchasing Transaction</i>
                      <input
                        style="font-size: 18px; font-weight: bold"
                        v-model="postData.buyprice"
                        @keyup="filterinput(false, true)"
                        :readonly="isdisabledbuyprice"
                        type="text"
                        class="form-control"
                      />
                    </div>
                  </div>
                  <div class="col-12 d-flex justify-content-end">
                    <button class="btn btn-danger btn-lg mr-2" @click="backtomaster()">Cancel</button>
                    <button v-if="route.name == 'masterproductcreate'" :disabled="ispostingdata" @click="postApiData" class="btn btn-primary btn-lg">
                      <span v-if="ispostingdata">Saving...</span><span v-else>Save</span>
                    </button>
                    <button v-if="route.name == 'masterproductedit'" :disabled="ispostingdata" @click="putApiData()" class="btn btn-primary btn-lg">
                      <span v-if="ispostingdata">Editing...</span><span v-else>Edit</span>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
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
