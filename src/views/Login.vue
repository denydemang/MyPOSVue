<script setup>
import { ref, onBeforeMount, reactive } from 'vue';
import axios from 'axios';
// import { useRouter } from 'vue-router';
import checkuser from '@/auth.js';
import myenc from '@/myencription.js';
import ex from '@/exception.js';

// const router = useRouter();
const isLoading = ref(true);
const isFetchingdata = ref(false);
const usernameform = ref(null);
const invalidSubmit = ref({
  username: false,
  password: false,
  general: false,
  servererror: false
});
const postDATA = reactive({
  username: '',
  password: ''
});
const apiurl = process.env.VUE_APP_API_URL;

const branch = process.env.VUE_APP_BRANCH;

const manageerrorempty = (error) => {
  const dataerrors = error.response.data.errors;
  if (dataerrors.hasOwnProperty('username')) {
    invalidSubmit.value.username = true;
    invalidSubmit.value.general = false;
    invalidSubmit.value.servererror = false;
  } else {
    invalidSubmit.value.username = false;
  }
  if (dataerrors.hasOwnProperty('password')) {
    invalidSubmit.value.password = true;
    invalidSubmit.value.general = false;
    invalidSubmit.value.servererror = false;
  } else {
    invalidSubmit.value.password = false;
  }
};
const managerrorserver = (error) => {
  invalidSubmit.value.servererror = true;
  invalidSubmit.value.general = false;
  invalidSubmit.value.username = false;
  invalidSubmit.value.password = false;
};
const manageerrorinvalid = (error) => {
  invalidSubmit.value.general = true;
  invalidSubmit.value.username = false;
  invalidSubmit.value.password = false;
  invalidSubmit.value.servererror = false;
  postDATA.password = '';
  usernameform.value.focus();
};
const postUSER = async () => {
  isFetchingdata.value = true;
  try {
    const responseApi = await axios.post(`${apiurl}/api/users/login/${branch}`, postDATA);
    const userdata = responseApi.data.data;
    localStorage.setItem('id', myenc.encrypt(userdata.id.toString()));
    localStorage.setItem('branchcode', myenc.encrypt(userdata.branchcode.toString(), ''));
    localStorage.setItem('name', myenc.encrypt(userdata.name.toString(), ''));
    localStorage.setItem('role', myenc.encrypt(userdata.role.toString(), ''));
    localStorage.setItem('token', userdata.token);
    localStorage.setItem('username', myenc.encrypt(userdata.username.toString(), ''));

    window.location.href = '/admin';
  } catch (error) {
    isFetchingdata.value = false;
    const exception = new ex(error);

    exception.funcnetworkerror = managerrorserver;
    exception.func400 = manageerrorempty;
    exception.func401 = manageerrorinvalid;
    exception.func500 = managerrorserver;
    exception.showError();
    // ex(error, managerrorserver, managerrorinvalid, invaliderror, null, null, null, null, managerrorserver);
  }
};
onBeforeMount(async () => {
  const isAuthenticated = await checkuser();
  if (isAuthenticated) {
    window.location.href = '/admin';
  } else {
    isLoading.value = false;
  }
});
</script>
<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-icon"></div>
  </div>
  <div class="mycontent">
    <section class="section">
      <div class="container">
        <div class="d-flex justify-content-center align-items-center" style="height: 100vh">
          <div style="width: 400px">
            <div class="login-brand">My POS Vue</div>
            <div class="card card-primary">
              <div class="row m-0">
                <div class="col-12 col-md-12 col-lg-12 p-0">
                  <div class="card-header"><span>Please Login With Your Credential</span></div>
                  <div class="card-body">
                    <div v-if="invalidSubmit.general" class="alert alert-danger alert-has-icon py-2 pl-4">
                      <div class="alert-icon"><i class="fas fa-times-circle"></i></div>
                      <div class="alert-body pt-1">Invalid Username Or Password</div>
                    </div>
                    <div v-if="invalidSubmit.servererror" class="alert alert-danger alert-has-icon py-2 pl-4">
                      <div class="alert-icon"><i class="fas fa-times-circle"></i></div>
                      <div class="alert-body pt-1">Server Temporary Unavailable</div>
                    </div>
                    <div class="form-group floating-addon">
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <div class="input-group-text">
                            <i class="far fa-user"></i>
                          </div>
                        </div>
                        <input
                          id="name"
                          type="text"
                          ref="usernameform"
                          v-model="postDATA.username"
                          class="form-control"
                          :class="{ 'is-invalid': invalidSubmit.username }"
                          name="username"
                          autofocus
                          placeholder="username"
                        />
                        <div class="invalid-feedback">Username Cannot Be Empty</div>
                      </div>
                    </div>
                    <div class="form-group floating-addon">
                      <div class="input-group">
                        <div class="input-group-prepend">
                          <div class="input-group-text">
                            <i class="fas fa-lock"></i>
                          </div>
                        </div>
                        <input
                          id="password"
                          type="password"
                          v-model="postDATA.password"
                          class="form-control"
                          :class="{ 'is-invalid': invalidSubmit.password }"
                          name="password"
                          placeholder="password"
                          @keyup.enter="postUSER()"
                        />
                        <div class="invalid-feedback">Password Cannot Be Empty</div>
                      </div>
                    </div>
                    <div class="form-group row px-2">
                      <button type="button" @click.prevent="postUSER()" class="btn btn-round btn-lg btn-primary col-12 d-flex justify-content-center">
                        <div v-if="isFetchingdata" class="spinner"></div>
                        <span v-else>LOGIN</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="simple-footer">Copyright &copy; 2023 Deny Demang Made with Vue + Stisla Template</div>
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
.mycontent {
  height: 100vh;
  /* background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%); */
  background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
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
