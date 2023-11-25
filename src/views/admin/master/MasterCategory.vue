<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue';
import { iziInfo, iziError, iziSuccess, iziWarning } from '@/izitoast.js';
import axios from 'axios';
import Spinner from '@/components/Spinner.vue';

const apiurl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;

const token = localStorage.getItem('token');
const titleModal = ref('');
const dataCategory = ref([]);
const isFetchingdata = ref(false);
const isPostingData = ref(false);
const row = ref(null);
const selectedRow = ref();
const invalidSubmit = ref({
  name: false,
  servererror: false,
  namemessage: ''
});
const search = reactive({
  value: ''
});
const postData = reactive({
  branchcode: branch,
  name: '',
  status: 1
});
const clearData = () => {
  invalidSubmit.value.name = false;
  invalidSubmit.value.servererror = false;
  postData.name = '';
};
const getApiData = async () => {
  isFetchingdata.value = true;
  try {
    const getdatacategory = await axios.get(`${apiurl}/api/categories/list/${selectedRow.value}/${branch}`, {
      headers: {
        Authorization: token
      }
    });
    isFetchingdata.value = false;
    dataCategory.value = getdatacategory.data.data;
  } catch (error) {
    console.log(error);
  }
};
const searchApiData = async () => {
  isFetchingdata.value = true;
  try {
    const getdatacategory = await axios.get(`${apiurl}/api/categories/${branch}/search?key=${search.value}&perpage=${selectedRow.value}`, {
      headers: {
        Authorization: token
      }
    });
    isFetchingdata.value = false;
    console.log(dataCategory.value);
    dataCategory.value = getdatacategory.data.data;
  } catch (error) {
    console.log(error);
  }
};
const postApiData = async () => {
  isPostingData.value = true;
  try {
    const postdatacategory = await axios.post(`${apiurl}/api/categories`, postData, {
      headers: {
        Authorization: token
      }
    });
    isPostingData.value = false;
    iziSuccess('Success', 'Successfully Saved New Category Product');
    clearData();
    getApiData();
    $('#modalCategory').modal('hide');
  } catch (error) {
    isPostingData.value = false;
    if (error.message == 'Network Error') {
      invalidSubmit.value.servererror = true;
    } else {
      const status = error.response.status;
      if (status == 400) {
        invalidSubmit.value.name = true;
        invalidSubmit.value.namemessage = error.response.data.errors.name[0];
      }
    }
  }
};
const changeRow = async () => {
  selectedRow.value = row.value.value;
  searchApiData();
};
const changeTitleModal = (title) => {
  titleModal.value = title;
};
onMounted(async () => {
  selectedRow.value = row.value.value;
  getApiData();
});
</script>
<template>
  <!-- Main Content -->
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Master Category</h1>
        <span class=""
          ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'mastercategory' }">mastercategory</router-link>
        </span>
      </div>
      <div class="row">
        <div class="col-lg-8 col-md-8 col-12">
          <div class="card" style="max-width: 850px">
            <div class="card-body">
              <div class="float-left mr-3 pt-2">Rows</div>
              <div class="float-left">
                <select ref="row" @change="changeRow()" class="form-control">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="25">25</option>
                </select>
              </div>
              <div class="input-group col-lg-5 offset-lg-7 px-0">
                <input type="text" class="form-control" v-model="search.value" placeholder="Search" />
                <div class="input-group-append">
                  <button @click="searchApiData()" class="btn btn-primary"><i class="fas fa-search"></i></button>
                </div>
              </div>
              <div class="clearfix mb-2"></div>
              <button class="btn btn-primary mt-2 mb-3" @click="changeTitleModal('Add New Category')" data-toggle="modal" data-target="#modalCategory">
                <i class="fas fa-plus"></i> Add New
              </button>
              <div class="table-responsive" style="max-height: 50vh">
                <table class="table table-striped table-hover">
                  <thead style="position: sticky; top: 0; background-color: ghostwhite; z-index: 3; font-size: 12px; font-weight: bold">
                    <th class="text-center">
                      <input type="checkbox" style="transform: scale(1.2)" />
                    </th>
                    <th>#</th>
                    <th>Category Name</th>
                    <th>Action</th>
                  </thead>
                  <tbody>
                    <tr v-if="isFetchingdata">
                      <td colspan="4" class="text-center"><Spinner /></td>
                    </tr>
                    <template v-else>
                      <tr v-if="dataCategory.length > 0" v-for="(item, index) in dataCategory" :key="item.id">
                        <td class="text-center pt-2">
                          <input type="checkbox" style="transform: scale(1.2)" />
                        </td>
                        <td v-text="index + 1"></td>
                        <td v-text="item.name"></td>
                        <td>
                          <a class="btn btn-primary btn-action mr-1" data-toggle="tooltip" title="Edit"><i class="fas fa-pencil-alt"></i></a>
                          <a
                            class="btn btn-danger btn-action"
                            data-toggle="tooltip"
                            title="Delete"
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="alert('Deleted')"
                            ><i class="fas fa-trash"></i
                          ></a>
                        </td>
                      </tr>
                      <tr v-else>
                        <td colspan="4" class="text-center"><span>No Record Found</span></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <div class="float-right">
                <nav>
                  <ul class="pagination">
                    <li class="page-item disabled">
                      <a class="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                        <span class="sr-only">Previous</span>
                      </a>
                    </li>
                    <li class="page-item active">
                      <a class="page-link" href="#">1</a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#">2</a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#">3</a>
                    </li>
                    <li class="page-item">
                      <a class="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                        <span class="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
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
              <input :class="{ 'is-invalid': invalidSubmit.name }" v-model="postData.name" @keyup.enter="postApiData()" type="text" class="form-control" />
              <div class="invalid-feedback">{{ invalidSubmit.namemessage }}</div>
            </div>
          </div>
          <div class="modal-footer bg-whitesmoke br">
            <button type="button" @click="clearData()" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" @click="postApiData()" class="btn btn-primary">
              <div v-if="isPostingData">Processing...</div>
              <span v-else> Add New </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
