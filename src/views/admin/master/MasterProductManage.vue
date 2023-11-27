<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import myenc from '@/myencription.js';
import axios from 'axios';
const router = useRouter();
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
let paramsid = sessionStorage.getItem('paramsid');

onMounted(async () => {
  if ((await checkData()) == false) {
    router.push({
      name: 'masterproduct'
    });
  }
});

const checkData = async () => {
  try {
    if (paramsid) {
      paramsid = myenc.decrypt(paramsid);
      const responseData = await axios.get(`${apiurl}/api/products/detail/${branch}/${paramsid}`, {
        headers: {
          Authorization: token
        }
      });
      const productData = responseData.data.data;
      console.log(productData);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
</script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Product > Edit</h1>
        <span class=""
          ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masterproduct' }">masterproduct</router-link> /
          <router-link :to="{ name: 'masterproduct' }">addnew</router-link></span
        >
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card card-info">
            <div class="card-header">
              <h4>EDIT PRODUCT</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Barcode</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Brands</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Category</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Price</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>Min Stock</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label>MaxStock</label>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label><input type="checkbox" class="mr-2" />Initial Stock</label>
                    <i class="text-warning text-sm ml-2 d-lg-inline d-block" style="font-size: smaller">Make It Blank If Any Purchasing Transaction</i>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-12">
                  <div class="form-group">
                    <label><input type="checkbox" class="mr-2" />Buy Price</label>
                    <i class="text-warning ml-2 d-lg-inline d-block" style="font-size: smaller">Make It Blank If Any Purchasing Transaction</i>
                    <input type="text" class="form-control" />
                  </div>
                </div>
                <div class="col-lg-4 col-md-4 col-12">
                  <button class="btn btn-primary">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
