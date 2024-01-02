<script setup>
import axios from 'axios';
import { ref, onBeforeMount, reactive } from 'vue';
import myencription from '@/myencription';
import checkcompany from '@/company.js';
import ex from '@/exception.js';
const apiurl = process.env.VUE_APP_API_URL;
const token = localStorage.getItem('token');
const branch = process.env.VUE_APP_BRANCH;
const isLoading = ref(true);
const isPostingData = ref(false);
onBeforeMount(async () => {
  const isExistcompany = await checkcompany();
  if (!isExistcompany) {
    isLoading.value = false;
  } else {
    window.location.href = '/admin';
  }
});
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
const postDATAAPI = async () => {
  isPostingData.value = true;
  try {
    clearErrorMessage();
    postDATA.app_name = postDATA.app_name ? postDATA.app_name.toUpperCase() : null;
    postDATA.profile_name = postDATA.profile_name ? postDATA.profile_name.toUpperCase() : null;
    const responseData = await axios.post(`${apiurl}/api/companyprofiles`, postDATA, {
      headers: {
        Authorization: token
      }
    });
    const dataCompany = responseData.data.data;
    localStorage.setItem('app_name', myencription.encrypt(dataCompany.app_name));
    window.location.href = '/admin';
  } catch (error) {
    console.log(error);
    clearErrorMessage();
    isPostingData.value = false;
    const exception = new ex(error);
    exception.func400 = manageerror;
    exception.showError();
  }
};
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-icon"></div>
  </div>
  <section>
    <div class="container">
      <div class="row">
        <div class="col-12" style="height: 100vh">
          <div>
            <div class="row d-lg-flex justify-content-center align-items-center" style="height: 100vh">
              <div class="card card-primary col-md-8 col-lg-7 col-12" style="margin-top: 20px">
                <div class="card-header d-flex justify-content-between">
                  <h4>Register Company</h4>
                  <i class="d-block" style="font-size: smaller"><span style="color: red">*</span> Wajib Diisi</i>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="form-group col-lg-6 col-12">
                      <label for="companyprofilename">Company Profile Name <span style="color: red">*</span></label>
                      <input
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
                      <input id="address" type="text" class="form-control" :class="{ 'is-invalid': invalidInput.address }" name="address" v-model="postDATA.address" />
                      <div class="invalid-feedback">{{ invalidInput.address }}</div>
                    </div>
                    <div class="form-group col-lg-6 col-12">
                      <label for="phone">Phone <span style="color: red">*</span></label>
                      <input
                        id="phone"
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
                      <input id="email" type="email" class="form-control" name="email" v-model="postDATA.email" :class="{ 'is-invalid': invalidInput.email }" />
                      <div class="invalid-feedback">{{ invalidInput.email }}</div>
                    </div>
                    <div class="form-group col-lg-6 col-12">
                      <label for="npwp">NPWP</label>
                      <input id="npwp" type="text" class="form-control" v-model="postDATA.npwp" name="npwp" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="form-group col-lg-6 col-12">
                      <label for="moto">Moto</label>
                      <textarea id="w3review" class="form-control" rows="4" v-model="postDATA.moto"></textarea>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <button type="submit" class="btn btn-primary btn-block d-flex justify-content-center" @click="postDATAAPI">
                        <div v-if="isPostingData" class="spinner"></div>
                        <span v-else>REGISTER</span>
                      </button>
                    </div>
                  </div>
                  <div class="row">
                    <div class="simple-footer col-12"><span>Copyright &copy; DMKCORP 2018</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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
