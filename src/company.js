import axios from 'axios';
import decr from '@/myencription.js'

const apiUrl = process.env.VUE_APP_API_URL;
let isexistcompany  = false
const checkcompany = async () => {
    const encryptiduser = localStorage.getItem('id') != null && localStorage.getItem('id') != '' && localStorage.getItem('id') != undefined ? localStorage.getItem('id') : null
    const token = localStorage.getItem('token') != null && localStorage.getItem('token') != '' && localStorage.getItem('token') != undefined ? localStorage.getItem('token') : null

    if (encryptiduser == null || token == null){
         isexistcompany = true
    } else{
        const iduser = decr.decrypt(encryptiduser, '');
    
        try {
            const response = await axios.get(`${apiUrl}/api/companyprofiles/check/${iduser}`,{
                headers : {
                    Authorization : token
                }
            });
            isexistcompany = response.data.data.iscompanyexists
        } catch (error) {
            isexistcompany = true
        
        }
    }
    return isexistcompany
    
}
export default checkcompany;