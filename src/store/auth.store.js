import { defineStore } from "pinia";
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  "auth", ()=>{
    const id = ref('');
    const employeeCode = ref('');
    const empId = ref('');
    const auth = ref('');
    const token = ref('');

    const setUserInfo = (getId,getEmployeeCode,getEmpId,getAuth,getToken)=>{
      id.value = getId
      employeeCode.value = getEmployeeCode
      empId.value = getEmpId
      auth.value = getAuth
      token.value = getToken
    }
    return {user,token};
},
{
    persist: {
      enabled: true, //storage 저장유무
      storage: sessionStorage
    }
  }
);
