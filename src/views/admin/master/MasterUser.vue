<script setup>
import { ref, reactive } from 'vue';
import { iziError, iziSuccess } from '@/izitoast.js';
import axios from 'axios';
import UserTable from '@/components/UserTable.vue';
const MyChild = ref(null);
const isEdit = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const titleModal = ref('');
const isPostingData = ref(false);
const invalidSubmit = ref({
  branchcode: '',
  username: '',
  name: '',
  password: '',
  id_role: '',
  servererror: ''
});
const postData = reactive({
  branchcode: '',
  username: '',
  name: '',
  password: '',
  id_role: null
});
const clearData = () => {
  invalidSubmit.value.branchcode = '';
  invalidSubmit.value.username = '';
  invalidSubmit.value.password = '';
  invalidSubmit.value.id_role = '';
  invalidSubmit.value.servererror = '';

  postData.branchcode = '';
  postData.username = '';
  postData.name = '';
  postData.password = '';
  postData.id_role = '';
};

const postApiData = async () => {
  isPostingData.value = true;
  try {
    await axios.post(`${apiurl}/api/categories`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Added New Category Product');
    clearData();
    //panggil method getCategory di component CategoryTable
    MyChild.value.getCategory();
    //Sembunyikan modal
    $('#modalCategory').modal('hide');
  } catch (error) {
    isPostingData.value = false;
    if (error.message == 'Network Error') {
      iziError('Error', 'INTERNAL SERVER ERROR');
    } else {
      const status = error.response.status;
      if (status == 400) {
        invalidSubmit.value.name = true;
        invalidSubmit.value.namemessage = error.response.data.errors.name[0];
      }
    }
  }
};
const putApiData = async () => {
  isPostingData.value = true;
  try {
    const putdatacategory = await axios.put(`${apiurl}/api/categories/${postData.id}`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Edited Category Product');
    clearData();
    //panggil method get user di component CategoryTable
    MyChild.value.getCategory();
    //Sembunyikan modal
    $('#modalCategory').modal('hide');
  } catch (error) {
    isPostingData.value = false;
    if (error.message == 'Network Error') {
      iziError('Error', 'INTERNAL SERVER ERROR');
    } else {
      const status = error.response.status;
      if (status == 400) {
        invalidSubmit.value.name = true;
        invalidSubmit.value.namemessage = error.response.data.errors.name[0];
      }
      if (status == 500) {
        if (error.response.data.errors.general[0].includes('SQLSTATE[23000]')) {
          invalidSubmit.value.name = true;
          invalidSubmit.value.namemessage = 'Name Already Exists';
        } else {
          iziError('Error', 'INTERNAL SERVER ERROR');
        }
      }
    }
  }
};
const addNewView = (title) => {
  isEdit.value = false;
  titleModal.value = title;
};
const populateModal = (data) => {
  titleModal.value = 'Edit category';
  isEdit.value = true;
  postData.id = data[0].id;
  postData.name = data[0].name;
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
        <div class="col-lg-6">
          <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New User')" data-toggle="modal" data-target="#modalUser"><i class="fas fa-plus"></i> Add New</button>
          <UserTable ref="MyChild" @dataUser="populateModal" />
        </div>
      </div>
    </section>
  </div>
  <!-- Modal Form -->
  <div class="modal fade" tabindex="-1" role="dialog" id="modalUser">
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ titleModal }}</h5>
          <button type="button" @click="clearData()" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Category Name</label>
          </div>
        </div>
        <div class="modal-footer bg-whitesmoke br">
          <button type="button" @click="clearData()" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button v-if="!isEdit" type="button" @click="postApiData()" class="btn btn-primary">
            <div v-if="isPostingData">Processing...</div>
            <span v-else> Add New </span>
          </button>
          <button v-else type="button" @click="putApiData()" class="btn btn-primary">
            <div v-if="isPostingData">Processing...</div>
            <span v-else> Edit </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
