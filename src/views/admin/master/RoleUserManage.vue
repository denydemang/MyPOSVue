<script setup>
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import checkview from '@/access.js';
import axios from 'axios';
import ex from '@/exception.js';
import { showerror } from '@/jqueryconfirm.js';

const router = useRouter();
const routes = useRoute();
const apiUrl = process.env.VUE_APP_API_URL;
const branch = process.env.VUE_APP_BRANCH;
const ispostingdata = ref(false);
const token = localStorage.getItem('token');
const namessession = ref('');
const inputdata = reactive({
  rolename: ''
});
const invalidSubmit = ref('');
const module = ref([]);

const allxView = ref(false);
const allxUpdate = ref(false);
const allxDelete = ref(false);
const allxApprove = ref(false);
const allxCreate = ref(false);

onBeforeMount(async () => {
  if (!checkview('role_user')) {
    router.push({
      name: 'notfoundthrow'
    });
  }
  if (routes.name == 'roleusercreate') {
    namessession.value = 'Add New';
    getApiModule();
  } else if (routes.name == 'roleuserupdate') {
    namessession.value = 'Edit';
  }
});

const ischeckedforallspecificmodule = () => {
  let isallxview = true;
  let isallxupdate = true;
  let isallxdelete = true;
  let isallxapprove = true;
  let isallxcreate = true;

  module.value.forEach((item) => {
    item.detail.forEach((i) => {
      if (!i.xView) {
        isallxview = false;
      }
      if (!i.xUpdate) {
        isallxupdate = false;
      }
      if (!i.xDelete) {
        isallxdelete = false;
      }
      if (!i.xApprove) {
        isallxapprove = false;
      }
      if (!i.xCreate) {
        isallxcreate = false;
      }
    });
  });

  allxView.value = isallxview;
  allxUpdate.value = isallxupdate;
  allxDelete.value = isallxdelete;
  allxApprove.value = isallxapprove;
  allxCreate.value = isallxcreate;
};

const groupByName = (data) => {
  const mappedData = {};

  data.forEach((item) => {
    const groupName = item.name;
    let detailItem = {};
    if (item.name == 'dasboard') {
      detailItem = {
        id: item.id,
        sub_name: item.sub_name,
        description: item.description,
        is_active: item.is_active,
        xView: true,
        xUpdate: true,
        xDelete: true,
        xApprove: true,
        xCreate: true
      };
    } else {
      detailItem = {
        id: item.id,
        sub_name: item.sub_name,
        description: item.description,
        is_active: item.is_active,
        xView: false,
        xUpdate: false,
        xDelete: false,
        xApprove: false,
        xCreate: false
      };
    }

    if (!mappedData[groupName]) {
      mappedData[groupName] = {
        name: groupName,
        detail: [detailItem]
      };
    } else {
      mappedData[groupName].detail.push(detailItem);
    }
  });
  //   Membuat object menjadi array
  const resultArray = Object.values(mappedData);

  return resultArray;
};
const manageerror400 = (error) => {
  if (error.response.data.errors.hasOwnProperty('name')) {
    invalidSubmit.value = 'Field Role Name Cannot Be Empty';
  } else {
    invalidSubmit.value = '';
  }
};
const manageerror500 = (error) => {
  if (error.response.data.errors.general[0].includes('Duplicate entry')) {
    invalidSubmit.value = 'The Role Name Already Exists';
  } else {
    invalidSubmit.value = '';
    showerror('You Have An Issue With Internal Server (Status 500)');
  }
};

const joindetail = (dataitem, rolename, branch) => {
  const datajoin = {
    branchcode: branch,
    name: rolename,
    access: []
  };
  dataitem.forEach((item) => {
    item.detail.forEach((itemdetail) => {
      const dataaccess = {
        id_module: itemdetail.id,
        xView: itemdetail.xView,
        xUpdate: itemdetail.xUpdate,
        xDelete: itemdetail.xDelete,
        xApprove: itemdetail.xApprove,
        xCreate: itemdetail.xCreate
      };
      datajoin.access.push(dataaccess);
    });
  });

  return datajoin;
};
const postApiModule = async () => {
  ispostingdata.value = true;
  try {
    const postData = joindetail(module.value, inputdata.rolename, branch);

    await axios.post(`${apiUrl}/api/roles`, postData, {
      headers: {
        Authorization: token
      }
    });
    ispostingdata.value = false;
    invalidSubmit.value = '';
    sessionStorage.setItem('success', `Successfully Created New Role (${inputdata.rolename})`);
    router.push({
      name: 'roleuser'
    });
  } catch (error) {
    ispostingdata.value = false;
    const myexception = new ex(error);
    myexception.func400 = manageerror400;
    myexception.func500 = manageerror500;
    myexception.showError();
  }
};
const cancelInput = () => {
  console.log('ok');
  router.push({
    name: 'roleuser'
  });
};
const getApiModule = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/modules/list`, {
      headers: {
        Authorization: token
      }
    });
    const dataModule = response.data.data;
    const groupedData = groupByName(dataModule);
    module.value = groupedData;
    ischeckedforallspecificmodule();
  } catch (error) {
    const myexception = new ex(error);
    myexception.showError();
  }
};
const changeaccess = (iddetail, accessname, e) => {
  const status = e.target.checked;
  if (iddetail == 'all') {
    switch (accessname) {
      case 'allxView':
        module.value.forEach((item) => {
          item.detail.forEach((i) => {
            if (i.sub_name != 'dashboard') {
              i.xView = status;
            }
          });
        });
        break;
      case 'allxUpdate':
        module.value.forEach((item) => {
          item.detail.forEach((i) => {
            if (i.sub_name != 'dashboard') {
              i.xUpdate = status;
            }
          });
        });
        break;
      case 'allxDelete':
        module.value.forEach((item) => {
          item.detail.forEach((i) => {
            if (i.sub_name != 'dashboard') {
              i.xDelete = status;
            }
          });
        });
        break;
      case 'allxApprove':
        module.value.forEach((item) => {
          item.detail.forEach((i) => {
            if (i.sub_name != 'dashboard') {
              i.xApprove = status;
            }
          });
        });
        break;
      case 'allxCreate':
        module.value.forEach((item) => {
          item.detail.forEach((i) => {
            if (i.sub_name != 'dashboard') {
              i.xCreate = status;
            }
          });
        });
        break;

      default:
        break;
    }
  } else {
    module.value.forEach((item) => {
      item.detail.forEach((i) => {
        if (i.id == iddetail) {
          switch (accessname) {
            case 'all':
              i.xView = status;
              i.xUpdate = status;
              i.xDelete = status;
              i.xApprove = status;
              i.xCreate = status;
              break;
            case 'xView':
              i.xView = status;
              break;
            case 'xUpdate':
              i.xUpdate = status;
              break;
            case 'xDelete':
              i.xDelete = status;
              break;
            case 'xApprove':
              i.xApprove = status;
              break;
            case 'xCreate':
              i.xCreate = status;
              break;
          }
        }
      });
    });
  }
  ischeckedforallspecificmodule();
};
</script>
<template>
  <div class="main-content">
    <section class="section">
      <div class="section-header d-flex justify-content-between">
        <h1>Role User > {{ namessession }}</h1>
        <span class=""
          ><router-link :to="{ name: 'admin' }">admin</router-link> / <router-link :to="{ name: 'roleuser' }">roleuser</router-link> /
          <router-link v-if="namessession == 'Add New'" :to="{ name: 'roleusercreate' }">create</router-link>
          <router-link v-if="namessession == 'Edit'" :to="{ name: 'roleuseredit' }">edit</router-link>
        </span>
      </div>
      <div class="row" style="max-width: 1900px">
        <div class="col-lg-12">
          <div style="text-align: right">
            <button class="btn btn-sm btn-danger mr-2" style="font-size: 12px" @click="cancelInput()"><i class="fas fa-window-close" style="font-size: 12px"></i> Cancel</button>
            <button class="btn btn-sm btn-primary m-0" :disabled="ispostingdata" @click="postApiModule()" style="font-size: 12px">
              <i class="fas fa-save mr-1" style="font-size: 12px"></i>
              <span v-if="ispostingdata">Saving ...</span>
              <span v-else>Save Change</span>
            </button>
          </div>
          <div class="form-group col-lg-4">
            <label><b style="font-size: 18px">Role Name</b></label>
            <input type="text" class="form-control" :class="{ 'is-invalid': invalidSubmit != '' }" v-model="inputdata.rolename" style="font-size: 18px" />
            <div class="invalid-feedback">{{ invalidSubmit }}</div>
          </div>
          <div class="table-responsive col-lg-12" style="max-height: 60vh; overflow-y: scroll">
            <table class="table table-bordered">
              <thead>
                <th class="text-center" style="width: 10%">CheckRow</th>
                <th class="text-left">Module Name</th>
                <th class="text-center">View</th>
                <th class="text-center">Update</th>
                <th class="text-center">Delete</th>
                <th class="text-center">Approve</th>
                <th class="text-center">Create</th>
              </thead>
              <tbody>
                <tr>
                  <td><b>CHECK ALL ROW</b></td>
                  <td></td>
                  <td class="text-center"><input :checked="allxView" @change="changeaccess('all', 'allxView', $event)" type="checkbox" /></td>
                  <td class="text-center">
                    <input :checked="allxUpdate" @change="changeaccess('all', 'allxUpdate', $event)" type="checkbox" />
                  </td>
                  <td class="text-center">
                    <input :checked="allxDelete" @change="changeaccess('all', 'allxDelete', $event)" type="checkbox" />
                  </td>
                  <td class="text-center">
                    <input :checked="allxApprove" @change="changeaccess('all', 'allxApprove', $event)" type="checkbox" />
                  </td>
                  <td class="text-center">
                    <input :checked="allxCreate" @change="changeaccess('all', 'allxCreate', $event)" type="checkbox" />
                  </td>
                </tr>
                <template v-for="m in module" :key="m.name">
                  <template v-if="m.name == 'dasboard'">
                    <tr style="background-color: #d8d9da">
                      <td></td>
                      <td>
                        <b style="font-size: 18px">{{ m.name }}</b>
                      </td>
                      <td colspan="5"></td>
                    </tr>
                    <tr v-for="detail in m.detail" :key="detail.id">
                      <td class="text-center itemcheck"><input type="checkbox" checked disabled style="width: 15px" /></td>
                      <td class="itemcheck">
                        <p style="font-size: 18px">{{ detail.sub_name }}</p>
                      </td>
                      <td class="text-center itemcheck"><input type="checkbox" ref="view" :checked="detail.xView" disabled style="width: 15px" /></td>
                      <td class="text-center itemcheck"><input type="checkbox" ref="update" :checked="detail.xUpdate" disabled style="width: 15px" /></td>
                      <td class="text-center itemcheck"><input type="checkbox" ref="delete" :checked="detail.xDelete" disabled style="width: 15px" /></td>
                      <td class="text-center itemcheck"><input type="checkbox" ref="approve" :checked="detail.xApprove" disabled style="width: 15px" /></td>
                      <td class="text-center itemcheck"><input type="checkbox" ref="create" :checked="detail.xCreate" disabled style="width: 15px" /></td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr style="background-color: #d8d9da">
                      <td></td>
                      <td>
                        <b style="font-size: 18px">{{ m.name }}</b>
                      </td>
                      <td colspan="5"></td>
                    </tr>
                    <tr v-for="detail in m.detail" :key="detail.id">
                      <td class="text-center itemcheck">
                        <input
                          type="checkbox"
                          :checked="detail.xView || detail.xUpdate || detail.xDelete || detail.xApprove || detail.xCreate"
                          @change="changeaccess(detail.id, 'all', $event)"
                          style="width: 15px"
                        />
                      </td>
                      <td class="itemcheck">
                        <p style="font-size: 18px">{{ detail.sub_name }}</p>
                      </td>
                      <td class="text-center itemcheck">
                        <input type="checkbox" ref="view" @change="changeaccess(detail.id, 'xView', $event)" :checked="detail.xView" />
                      </td>
                      <td class="text-center itemcheck">
                        <input type="checkbox" @change="changeaccess(detail.id, 'xUpdate', $event)" :checked="detail.xUpdate" />
                      </td>
                      <td class="text-center itemcheck">
                        <input type="checkbox" @change="changeaccess(detail.id, 'xDelete', $event)" :checked="detail.xDelete" />
                      </td>
                      <td class="text-center itemcheck">
                        <input type="checkbox" @change="changeaccess(detail.id, 'xApprove', $event)" :checked="detail.xApprove" />
                      </td>
                      <td class="text-center itemcheck">
                        <input type="checkbox" @change="changeaccess(detail.id, 'xCreate', $event)" :checked="detail.xCreate" />
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
th {
  position: sticky;
  top: 0;
  color: white !important;
  background-color: black !important;
}

input[type='checkbox'] {
  margin: 0; /* Optional: Untuk menghapus margin default pada checkbox */
  width: 1rem; /* Sesuaikan ukuran sesuai kebutuhan */
  height: 1rem; /* Sesuaikan ukuran sesuai kebutuhan */
}
table > tbody > tr > td {
  font-size: larger;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
.itemcheck {
  background-color: #f5f8f6;
}
</style>
