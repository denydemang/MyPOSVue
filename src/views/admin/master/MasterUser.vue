<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { iziError, iziSuccess } from '@/izitoast.js';
import { useRouter, useRoute } from 'vue-router';
import ex from '@/exception.js';
import axios from 'axios';
import UserTable from '@/components/UserTable.vue';
import checkview from '@/access.js';
const MyChild = ref(null);
const isEdit = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const titleModal = ref('');
const roleData = ref([]);
const isPostingData = ref(false);
const router = useRouter();
const invalidSubmit = ref({
  branchcode: '',
  username: '',
  name: '',
  password: '',
  konfirmpw: '',
  id_role: '',
  servererror: ''
});
onBeforeMount(() => {
  getApiRole();
  if (!checkview('master_user')) {
    router.push({
      name: 'notfoundthrow'
    });
  }
});
const postData = reactive({
  branchcode: branch,
  username: '',
  name: '',
  password: '',
  konfirmpw: '',
  id_role: null,
  id: ''
});
const manageerror = (error) => {
  if (error.response.data.errors.hasOwnProperty('name')) {
    invalidSubmit.value.name = error.response.data.errors.name[0];
  } else {
    invalidSubmit.value.name = '';
  }
  if (error.response.data.errors.hasOwnProperty('username')) {
    invalidSubmit.value.username = error.response.data.errors.username[0];
  } else {
    invalidSubmit.value.username = '';
  }
  if (error.response.data.errors.hasOwnProperty('password')) {
    invalidSubmit.value.password = error.response.data.errors.password[0];
  } else {
    invalidSubmit.value.password = '';
  }
  if (error.response.data.errors.hasOwnProperty('id_role')) {
    invalidSubmit.value.id_role = error.response.data.errors.id_role[0];
  } else {
    invalidSubmit.value.id_role = '';
  }
};
const clearData = () => {
  invalidSubmit.value.branchcode = '';
  invalidSubmit.value.username = '';
  invalidSubmit.value.password = '';
  invalidSubmit.value.id_role = '';
  invalidSubmit.value.servererror = '';
  invalidSubmit.value.konfirmpw = '';

  postData.username = '';
  postData.name = '';
  postData.password = null;
  postData.id_role = '';
  postData.konfirmpw = '';
  postData.id = '';
};

const getApiRole = async () => {
  try {
    const response = await axios.get(`${apiurl}/api/roles/list/${branch}?perpage=1000`, {
      headers: {
        Authorization: token
      }
    });
    roleData.value = response.data.data;
  } catch (error) {
    const exception = new ex(error);
    exception.showError();
  }
};
const postApiData = async () => {
  isPostingData.value = true;
  if (postData.password != postData.konfirmpw) {
    invalidSubmit.value.konfirmpw = 'Confirm Password Not Same';
    invalidSubmit.value.branchcode = '';
    invalidSubmit.value.name = '';
    invalidSubmit.value.password = '';
    invalidSubmit.value.username = '';
    invalidSubmit.value.id_role = '';
    isPostingData.value = false;
  } else {
    invalidSubmit.value.konfirmpw = '';
    try {
      const response = await axios.post(`${apiurl}/api/users`, postData, {
        headers: {
          Authorization: token
        }
      });
      isPostingData.value = false;
      iziSuccess('Success', 'Successfully Added New Users ' + postData.username);
      clearData();
      // panggil method getCategory di component CategoryTable
      MyChild.value.getUsers();
      // Sembunyikan modal
      $('#modalUser').modal('hide');
    } catch (error) {
      isPostingData.value = false;
      const exception = new ex(error);
      exception.func400 = manageerror;
      exception.showError();
    }
  }
};
const putApiData = async () => {
  isPostingData.value = true;
  postData.password = null;
  try {
    const putdatacategory = await axios.put(`${apiurl}/api/users/${postData.id}`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Edited Users ' + postData.username);
    clearData();
    MyChild.value.getUsers();
    // Sembunyikan modal
    $('#modalUser').modal('hide');
  } catch (error) {
    isPostingData.value = false;
    const exception = new ex(error);
    exception.func400 = manageerror;
    exception.showError();
  }
};
const addNewView = (title) => {
  isEdit.value = false;
  titleModal.value = title;
};
const populateModal = (data) => {
  titleModal.value = 'Edit category';
  isEdit.value = true;
  postData.name = data.name;
  postData.username = data.username;
  postData.id = data.id;
  postData.id_role = data.id_role;
  // postData.id = data[0].id;
  // postData.name = data[0].name;
};
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master User</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'masteruser' }">masteruser</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-8">
          <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New User')" data-toggle="modal" data-target="#modalUser"><i class="fas fa-plus"></i> Add New</button>
          <UserTable ref="MyChild" @dataUsers="populateModal" />
        </div>
      </div>
    </section>
  </div>
  <!-- Modal Form -->
  <div class="modal fade" tabindex="-1" role="dialog" id="modalUser">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ titleModal }}</h5>
          <button type="button" @click="clearData()" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" :readonly="isEdit" :class="{ 'is-invalid': invalidSubmit.username }" v-model="postData.username" class="form-control" />
            <div class="invalid-feedback">{{ invalidSubmit.username }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" :class="{ 'is-invalid': invalidSubmit.name }" v-model="postData.name" class="form-control" />
            <div class="invalid-feedback">{{ invalidSubmit.name }}</div>
          </div>
          <div v-if="!isEdit" class="form-group">
            <label class="form-label">Password</label>
            <input type="password" :class="{ 'is-invalid': invalidSubmit.password }" v-model="postData.password" class="form-control" />
            <div class="invalid-feedback">{{ invalidSubmit.password }}</div>
          </div>
          <div v-if="!isEdit" class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" :hidden="isEdit" :class="{ 'is-invalid': invalidSubmit.konfirmpw }" v-model="postData.konfirmpw" class="form-control" />
            <div class="invalid-feedback">{{ invalidSubmit.konfirmpw }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Roles</label>
            <select v-model="postData.id_role" :class="{ 'is-invalid': invalidSubmit.id_role }" style="font-size: 15px; font-weight: bold" class="form-control">
              <option v-for="role in roleData" :key="role.id" :value="role.id">{{ role.name }}</option>
            </select>
            <div class="invalid-feedback">{{ invalidSubmit.id_role }}</div>
            <!-- <div class="invalid-feedback">{{ validation.id_unit }}</div> -->
          </div>
        </div>
        <div class="modal-footer bg-whitesmoke br">
          <button type="button" @click="clearData()" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button v-if="!isEdit" type="button" @click="postApiData()" class="btn btn-primary">
            <div disabled v-if="isPostingData">Processing...</div>
            <span v-else> Add New </span>
          </button>
          <button v-else type="button" @click="putApiData()" class="btn btn-primary">
            <div disabled v-if="isPostingData">Processing...</div>
            <span v-else> Edit </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
