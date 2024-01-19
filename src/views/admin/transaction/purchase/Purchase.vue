<script setup>
import { reactive, ref } from 'vue';
import PurchaseTable from '@/components/PurchaseTable.vue';
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
      <div class="section-header">
        <h1>Purchase</h1>
      </div>
      <div class="row">
        <div class="col-lg-12 col-md-12 col-12">
          <div class="card card-primary">
            <div class="card-body">
              <div class="d-flex">
                <button class="btn btn-primary mt-2 mb-4" @click="addNewView('Add New Supplier')" data-toggle="modal" data-target="#modalSupplier">
                  <i class="fas fa-plus"></i> Add New
                </button>
              </div>
              <PurchaseTable />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
