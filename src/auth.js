import axios from 'axios';
import decr from '@/myencription.js'


const apiUrl = process.env.VUE_APP_API_URL;

const checkuser = async () => {
  try {
    const iduser = decr.decrypt(localStorage.getItem('id'), '');
    const token = localStorage.getItem('token');
    const accesview = localStorage.getItem('accessview');
    if (!iduser || !token  || !accesview) {
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

export default checkuser;
