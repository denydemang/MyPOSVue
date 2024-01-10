<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import CustomerTable from '@/components/CustomerTable.vue';
import axios from 'axios';
import ex from '@/exception.js';
import { iziSuccess } from '@/izitoast';

const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const token = localStorage.getItem('token');
const titleModal = ref('');
const autoid = ref(false);
const MyChild = ref(null);
const isEdit = ref(false);
const isPostingData = ref(false);

$(document).ready(function () {
  $('#modalCustomer').on('hidden.bs.modal', function (e) {
    clearData();
  });
});
const invalidInput = ref({
  cust_no: '',
  name: '',
  address: '',
  phone: ''
});

const postData = reactive({
  id: null,
  branchcode: branch,
  cust_no: null,
  name: null,
  address: null,
  phone: null
});
const IDAuto = (e) => {
  const checked = e.target.checked;

  if (checked) {
    autoid.value = true;
    postData.cust_no = 'AUTO';
  } else {
    autoid.value = false;
    postData.cust_no = null;
  }
};
const clearData = () => {
  clearInvalid();
  autoid.value = false;
  isEdit.value = false;
  postData.cust_no = null;
  postData.name = null;
  postData.phone = null;
  postData.address = null;
  postData.id = null;
};
const clearInvalid = () => {
  invalidInput.value.cust_no = '';
  invalidInput.value.name = '';
  invalidInput.value.address = '';
  invalidInput.value.phone = '';
};
const manageerror400 = (error) => {
  const errorresponsedata = error.response.data.errors;
  if (errorresponsedata.hasOwnProperty('name')) {
    invalidInput.value.name = errorresponsedata.name[0];
  } else {
    invalidInput.value.name = '';
  }
  if (errorresponsedata.hasOwnProperty('cust_no')) {
    invalidInput.value.cust_no = errorresponsedata.cust_no[0];
  } else {
    invalidInput.value.cust_no = '';
  }
  if (errorresponsedata.hasOwnProperty('address')) {
    invalidInput.value.address = errorresponsedata.address[0];
  } else {
    invalidInput.value.contact = '';
  }
  if (errorresponsedata.hasOwnProperty('phone')) {
    invalidInput.value.phone = errorresponsedata.phone[0];
  } else {
    invalidInput.value.phone = '';
  }
};
const addNewView = (titleName) => {
  titleModal.value = titleName;
  isEdit.value = false;
};
const populateModal = (data) => {
  isEdit.value = true;
  titleModal.value = 'Edit Customer';
  postData.id = data.id;
  postData.cust_no = data.cust_no;
  postData.address = data.address;
  postData.phone = data.phone;
  postData.name = data.name;
};
const postApiData = async () => {
  isPostingData.value = true;
  clearInvalid();
  if (autoid.value == false && postData.cust_no == null) {
    invalidInput.value.cust_no = 'ID Cust Is Required';
    isPostingData.value = false;
  } else {
    invalidInput.value.cust_no = '';
    if (autoid.value == true) {
      postData.cust_no = null;
    }
    try {
      await axios.post(`${apiurl}/api/customers`, postData, {
        headers: {
          Authorization: token
        }
      });
      isPostingData.value = false;
      iziSuccess('Success', 'Successfully Add New Customer: ' + postData.name);
      $('#modalCustomer').modal('hide');
      MyChild.value.getCustomer();
    } catch (error) {
      if (autoid.value == true) {
        postData.cust_no = 'AUTO';
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
    await axios.put(`${apiurl}/api/customers/${branch}/${postData.id}`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Edited Customer: ' + postData.name);
    $('#modalCustomer').modal('hide');
    MyChild.value.getCustomer();
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
      <div class="section-header d-flex justify-content-between">
        <h1>Master Customer</h1>
        <span class=""><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'mastercustomer' }">mastercustomer</router-link> </span>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card" style="max-width: 1200px">
            <div class="card-body">
              <button class="btn btn-primary mt-2 mb-3" @click="addNewView('Add New Customer')" data-toggle="modal" data-target="#modalCustomer">
                <i class="fas fa-plus"></i> Add New
              </button>
              <CustomerTable ref="MyChild" @dataCustomer="populateModal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Modal Form -->
  <div class="modal fade" tabindex="-1" role="dialog" id="modalCustomer">
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
              >ID Customer <span v-if="!isEdit">(Auto)</span> * <input v-if="!isEdit" :checked="autoid" type="checkbox" @change="IDAuto" class="ml-1" />
            </label>
            <input type="text" :readonly="autoid" :class="{ 'is-invalid': invalidInput.cust_no }" v-model="postData.cust_no" class="form-control" />
            <div class="invalid-feedback">{{ invalidInput.cust_no }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Name Customer *</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.name }" v-model="postData.name" />
            <div class="invalid-feedback">{{ invalidInput.name }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.address }" v-model="postData.address" />
            <div class="invalid-feedback">{{ invalidInput.address }}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidInput.phone }" v-model="postData.phone" />
            <div class="invalid-feedback">{{ invalidInput.phone }}</div>
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
