import { defineStore } from "pinia";
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  "auth", ()=>{
    const id = ref('');
    const employeeCode = ref('');
    const empId = ref('');
    const auth = ref([]);
    const token = ref('');
    const name = ref('');

    const setUserInfo = (getId,getEmployeeCode,getEmpId,getName,getAuth,getToken)=>{
      id.value = getId
      employeeCode.value = getEmployeeCode
      empId.value = getEmpId
      name.value = getName
      auth.value = getAuth
      token.value = getToken
    }
    return {id,employeeCode,empId,name,auth,token,setUserInfo};
},
{
    persist: {
      enabled: true, //storage 저장유무
      storage: sessionStorage
    }
  }
);
