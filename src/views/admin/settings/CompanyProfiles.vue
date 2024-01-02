<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import { iziSuccess } from '@/izitoast';
import ex from '@/exception.js';
import myencription from '@/myencription';
const apiurl = process.env.VUE_APP_API_URL;
const token = localStorage.getItem('token');
const branch = process.env.VUE_APP_BRANCH;
const isPostingData = ref(false);
const isdisabled = ref(true);
const invalidInput = ref({
  profile_name: '',
  app_name: '',
  email: '',
  address: '',
  phone: ''
});
const postDATA = reactive({
  branchcode: branch,
  profile_name: null,
  app_name: null,
  address: null,
  phone: null,
  email: null,
  npwp: null,
  moto: null
});
const isfetchingdata = () => {
  postDATA.address = 'fetching data....';
  postDATA.app_name = 'fetching data....';
  postDATA.branchcode = branch;
  postDATA.email = 'fetching data....';
  postDATA.moto = 'fetching data....';
  postDATA.npwp = 'fetching data....';
  postDATA.phone = 'fetching data....';
  postDATA.profile_name = 'fetching data....';
};
const clearErrorMessage = () => {
  invalidInput.value.address = '';
  invalidInput.value.app_name = '';
  invalidInput.value.email = '';
  invalidInput.value.phone = '';
  invalidInput.value.profile_name = '';
};

const manageerror = (error) => {
  const errormessage = error.response.data.errors;
  if (errormessage.hasOwnProperty('profile_name')) {
    invalidInput.value.profile_name = errormessage.profile_name[0];
  }
  if (errormessage.hasOwnProperty('app_name')) {
    invalidInput.value.app_name = errormessage.app_name[0];
  }
  if (errormessage.hasOwnProperty('email')) {
    invalidInput.value.email = errormessage.email[0];
  }
  if (errormessage.hasOwnProperty('address')) {
    invalidInput.value.address = errormessage.address[0];
  }
  if (errormessage.hasOwnProperty('phone')) {
    invalidInput.value.phone = errormessage.phone[0];
  }
};
const getDATAAPI = async () => {
  isfetchingdata();
  try {
    const responseData = await axios.get(`${apiurl}/api/companyprofiles/detail/${branch}`, {
      headers: {
        Authorization: token
      }
    });
    isdisabled.value = false;
    const datacompany = responseData.data.data;
    postDATA.address = datacompany.address;
    postDATA.app_name = datacompany.app_name;
    postDATA.branchcode = datacompany.branchcode;
    postDATA.email = datacompany.email;
    postDATA.moto = datacompany.moto;
    postDATA.npwp = datacompany.npwp;
    postDATA.phone = datacompany.phone;
    postDATA.profile_name = datacompany.profile_name;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }
};
const putDATAAPI = async () => {
  isPostingData.value = true;
  try {
    clearErrorMessage();

    postDATA.app_name = postDATA.app_name ? postDATA.app_name.toUpperCase() : null;
    postDATA.profile_name = postDATA.profile_name ? postDATA.profile_name.toUpperCase() : null;
    const responseData = await axios.put(`${apiurl}/api/companyprofiles/${branch}`, postDATA, {
      headers: {
        Authorization: token
      }
    });
    iziSuccess('Success', 'Successfully Edited Company Profile');
    localStorage.setItem('app_name', myencription.encrypt(postDATA.app_name));
    isPostingData.value = false;
  } catch (error) {
    clearErrorMessage();
    isPostingData.value = false;
    const exception = new ex(error);
    exception.func400 = manageerror;
    exception.showError();
  }
};
onMounted(() => {
  getDATAAPI();
});
</script>

<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Edit Company Profile</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'companyprofileadmin' }"> companyprofile </router-link> </span>
      </div>
      <div class="card card-info" style="max-width: 1200px">
        <div class="card-body">
          <div class="row">
            <div class="form-group col-lg-6 col-12">
              <label for="companyprofilename">Company Profile Name <span style="color: red">*</span></label>
              <input
                :disabled="isdisabled"
                id="companyprofilename"
                type="text"
                v-model="postDATA.profile_name"
                class="form-control"
                name="companyprofilename"
                maxlength="30"
                :class="{ 'is-invalid': invalidInput.profile_name }"
              />
              <div class="invalid-feedback">{{ invalidInput.profile_name }}</div>
            </div>
            <div class="form-group col-lg-6 col-12">
              <label for="appname">App Name <i>(Max 10 Character)</i><span style="color: red">*</span></label>
              <input
                id="appname"
                :readonly="isdisabled"
                type="text"
                class="form-control"
                v-model="postDATA.app_name"
                name="appname"
                maxlength="10"
                :class="{ 'is-invalid': invalidInput.app_name }"
              />
              <div class="invalid-feedback">{{ invalidInput.app_name }}</div>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-lg-6 col-12">
              <label for="address">Address <span style="color: red">*</span></label>
              <input
                id="address"
                :readonly="isdisabled"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': invalidInput.address }"
                name="address"
                v-model="postDATA.address"
              />
              <div class="invalid-feedback">{{ invalidInput.address }}</div>
            </div>
            <div class="form-group col-lg-6 col-12">
              <label for="phone">Phone <span style="color: red">*</span></label>
              <input
                id="phone"
                :readonly="isdisabled"
                type="text"
                class="form-control"
                name="phone"
                v-model="postDATA.phone"
                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
                :class="{ 'is-invalid': invalidInput.phone }"
                maxlength="13"
              />
              <div class="invalid-feedback">{{ invalidInput.phone }}</div>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-lg-6 col-12">
              <label for="email">Email <span style="color: red">*</span></label>
              <input id="email" :readonly="isdisabled" type="email" class="form-control" name="email" v-model="postDATA.email" :class="{ 'is-invalid': invalidInput.email }" />
              <div class="invalid-feedback">{{ invalidInput.email }}</div>
            </div>
            <div class="form-group col-lg-6 col-12">
              <label for="npwp">NPWP</label>
              <input id="npwp" :readonly="isdisabled" type="text" class="form-control" v-model="postDATA.npwp" name="npwp" />
            </div>
          </div>
          <div class="row">
            <div class="form-group col-lg-6 col-12">
              <label for="moto">Moto</label>
              <textarea :readonly="isdisabled" id="w3review" class="form-control" rows="4" v-model="postDATA.moto"></textarea>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <button type="submit" :disabled="isPostingData || isdisabled" class="btn btn-primary" @click="putDATAAPI">
                <div v-if="isPostingData" class="spinner"></div>
                <span v-else>EDIT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.4);
  border-top: 4px solid #e6eaec;
  border-radius: 50%;
  width: 30px;
  height: 30px;
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
</style>
