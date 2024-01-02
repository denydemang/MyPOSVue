<script setup>
import { ref, reactive } from 'vue';
import { iziSuccess } from '@/izitoast.js';
import { showerror } from '@/jqueryconfirm';
import ex from '@/exception.js';
import axios from 'axios';
import { useRouter } from 'vue-router';
import CategoryTable from '@/components/CategoryTable.vue';

//MyChild merupakan ref dari component MasterCategory
const MyChild = ref(null);
const isEdit = ref(false);
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const titleModal = ref('');
const isPostingData = ref(false);
const invalidSubmit = ref({
  name: false,
  namemessage: ''
});

const postData = reactive({
  branchcode: branch,
  name: '',
  id: '',
  status: 1
});
const clearData = () => {
  invalidSubmit.value.name = false;
  invalidSubmit.value.servererror = false;
  postData.name = '';
};
const manageerroinvalid = (error) => {
  invalidSubmit.value.name = true;
  invalidSubmit.value.namemessage = error.response.data.errors.name[0];
};
const manageerrorexist = (error) => {
  if (error.response.data.errors.general[0].includes('SQLSTATE[23000]')) {
    invalidSubmit.value.name = true;
    invalidSubmit.value.namemessage = 'Name Already Exists';
  } else {
    showerror('INTERNAL SERVER ERROR');
  }
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
    const exception = new ex(error);
    exception.func400 = manageerroinvalid;
    exception.showError();
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
    const exception = new ex(error);
    exception.func400 = manageerroinvalid;
    exception.func500 = manageerrorexist;
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
  postData.id = data[0].id;
  postData.name = data[0].name;
};
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Category</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'mastercategory' }">mastercategory</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-8 col-md-8 col-12">
          <div class="card" style="max-width: 850px">
            <div class="card-body">
              <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New Category')" data-toggle="modal" data-target="#modalCategory">
                <i class="fas fa-plus"></i> Add New
              </button>
              <CategoryTable ref="MyChild" @dataCategory="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Form -->
    <div class="modal fade" tabindex="-1" role="dialog" id="modalCategory">
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
              <input v-if="!isEdit" :class="{ 'is-invalid': invalidSubmit.name }" v-model="postData.name" @keyup.enter="postApiData()" type="text" class="form-control" />
              <input v-if="isEdit" :class="{ 'is-invalid': invalidSubmit.name }" v-model="postData.name" @keyup.enter="putApiData()" type="text" class="form-control" />
              <div class="invalid-feedback">{{ invalidSubmit.namemessage }}</div>
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
  </div>
</template>
<style scoped></style>
