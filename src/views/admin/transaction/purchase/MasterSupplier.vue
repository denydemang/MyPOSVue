<script setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import SupplierTable from '@/components/SupplierTable.vue';
import checkview from '@/access.js';
import axios from 'axios';
import ex from '@/exception.js';
import { iziSuccess } from '@/izitoast';
const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const titleModal = ref('');
const MyChild = ref(null);
const autoid = ref(false);
const isEdit = ref(false);
const isPostingData = ref(false);
const router = useRouter();

$(document).ready(function () {
  $('#modalSupplier').on('hidden.bs.modal', function (e) {
    clearData();
  });
});
const invalidInput = ref({
  number_id: '',
  name: '',
  address: '',
  contact: ''
});
const postData = reactive({
  branchcode: branch,
  id: null,
  number_id: null,
  name: null,
  address: null,
  contact: null,
  active: 1
});
const IDAuto = (e) => {
  const checked = e.target.checked;

  if (checked) {
    autoid.value = true;
    postData.number_id = 'AUTO';
  } else {
    autoid.value = false;
    postData.number_id = null;
  }
};

const clearData = () => {
  clearInvalid();
  autoid.value = false;
  isEdit.value = false;
  postData.number_id = null;
  postData.name = null;
  postData.contact = null;
  postData.address = null;
};
const clearInvalid = () => {
  invalidInput.value.name = '';
  invalidInput.value.number_id = '';
  invalidInput.value.address = '';
  invalidInput.value.contact = '';
};

const manageerror400 = (error) => {
  const errorresponsedata = error.response.data.errors;
  if (errorresponsedata.hasOwnProperty('name')) {
    invalidInput.value.name = errorresponsedata.name[0];
  } else {
    invalidInput.value.name = '';
  }
  if (errorresponsedata.hasOwnProperty('number_id')) {
    invalidInput.value.number_id = errorresponsedata.number_id[0];
  } else {
    invalidInput.value.number_id = '';
  }
  if (errorresponsedata.hasOwnProperty('address')) {
    invalidInput.value.address = errorresponsedata.address[0];
  } else {
    invalidInput.value.contact = '';
  }
  if (errorresponsedata.hasOwnProperty('contact')) {
    invalidInput.value.contact = errorresponsedata.contact[0];
  } else {
    invalidInput.value.contact = '';
  }
  console.log(error);
};
const addNewView = (titleName) => {
  titleModal.value = titleName;
  isEdit.value = false;
};
const populateModal = (data) => {
  isEdit.value = true;
  titleModal.value = 'Edit Supplier';
  postData.id = data.id;
  postData.number_id = data.number_id;
  postData.address = data.address;
  postData.contact = data.contact;
  postData.name = data.name;
};
const postApiData = async () => {
  isPostingData.value = true;
  clearInvalid();
  if (autoid.value == false && postData.number_id == null) {
    invalidInput.value.number_id = 'ID Number Is Required';
    isPostingData.value = false;
  } else {
    invalidInput.value.number_id = '';
    if (autoid.value == true) {
      postData.number_id = null;
    }
    try {
      await axios.post(`${apiurl}/api/suppliers`, postData, {
        headers: {
          Authorization: token
        }
      });
      isPostingData.value = false;
      iziSuccess('Success', 'Successfully Add New Supplier: ' + postData.name);
      $('#modalSupplier').modal('hide');
      MyChild.value.getSupplier();
    } catch (error) {
      if (autoid.value == true) {
        postData.number_id = 'AUTO';
      }
      isPostingData.value = false;
      const exception = new ex(error);
      exception.func400 = manageerror400;
      exception.showError();
    }
  }
};
const putApiData = async () => {
  isPostingData.value = true;
  clearInvalid();
  autoid.value = false;
  try {
    await axios.put(`${apiurl}/api/suppliers/${branch}/${postData.id}`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Edited Supplier: ' + postData.name);
    $('#modalSupplier').modal('hide');
    MyChild.value.getSupplier();
  } catch (error) {
    isPostingData.value = false;
    const exception = new ex(error);
    exception.func400 = manageerror400;
    exception.showError();
  }
};
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-lg-flex justify-content-between">
        <h1>Master Supplier</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'mastersupplier' }">mastersupplier</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card" style="max-width: 1200px">
            <div class="card-body">
              <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New Supplier')" data-toggle="modal" data-target="#modalSupplier">
                <i class="fas fa-plus"></i> Add New
              </button>
              <SupplierTable ref="MyChild" @dataSupplier="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Modal Form -->
  <div class="modal fade" tabindex="-1" role="dialog" id="modalSupplier">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ titleModal }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label d-flex"
              >ID Supplier <span v-if="!isEdit">(Auto)</span> * <input v-if="!isEdit" :checked="autoid" type="checkbox" @change="IDAuto" class="ml-1" />
            </label>
            <input type="text" :readonly="autoid" :class="{ 'is-invalid': invalidInput.number_id }" v-model="postData.number_id" class="form-control" />
            <div class="invalid-feedback">{{ invalidInput.number_id }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Name Supplier *</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.name }" v-model="postData.name" />
            <div class="invalid-feedback">{{ invalidInput.name }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.address }" v-model="postData.address" />
            <div class="invalid-feedback">{{ invalidInput.address }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Contact</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.contact }" v-model="postData.contact" />
            <div class="invalid-feedback">{{ invalidInput.contact }}</div>
          </div>
        </div>
        <div class="modal-footer bg-whitesmoke br">
          <button type="button" :disabled="isPostingData" class="btn btn-danger" data-dismiss="modal">Close</button>
          <button v-if="!isEdit" type="button" @click="postApiData()" class="btn btn-primary">
            <div v-if="isPostingData">Processing...</div>
            <span v-else> Add New </span>
          </button>
          <button v-else :disabled="isPostingData" type="button" @click="putApiData()" class="btn btn-primary">
            <div v-if="isPostingData">Processing...</div>
            <span v-else> Edit </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
