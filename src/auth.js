import axios from 'axios';
import decr from '@/myencription.js'
import checkview from '@/access.js';
import checkcompany from '@/company.js';


const apiUrl = process.env.VUE_APP_API_URL;

const checkuser = async () => {
  let iduser = null
  try {
    const encryptiduser = localStorage.getItem('id') != null && localStorage.getItem('id') != '' && localStorage.getItem('id') != undefined ? localStorage.getItem('id') : null
    const token = localStorage.getItem('token') != null && localStorage.getItem('token') != '' && localStorage.getItem('token') != undefined ? localStorage.getItem('token') : null
    const accesview = localStorage.getItem('accessview') != null && localStorage.getItem('accessview') != '' && localStorage.getItem('accessview') != undefined ? localStorage.getItem('accessview') : null
    if (encryptiduser == null|| token == null  || accesview ==  null) {
      return false;
    } else {
      
      iduser = decr.decrypt(encryptiduser, '');
    }
    
    if (!iduser || iduser == '' || iduser == null){
      return false;
    }
    const data = await axios.get(`${apiUrl}/api/users/checklogin/${iduser}/${token}`);
    // return data;
    let getdata = data.data.data.is_login;
    return getdata;
  } catch (error) {
    return false;
  }
};

const authadmin = async (menuname) =>{
  const isAuthenticated = await checkuser();
  const isExistcompany = await checkcompany();
  if (!isAuthenticated) {
    window.location.href = '/login';
  } else {
    if (!isExistcompany) {
      window.location.href = '/companyprofiles';
    } else {
      if (!checkview(menuname)) {
        window.location.href='/notfound'
      } else{
        return true
      }
    }
  }

}

export default {authadmin,checkuser};
