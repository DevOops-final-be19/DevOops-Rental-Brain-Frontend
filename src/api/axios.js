import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/useToast';
import axios from 'axios'
import router from "@/router";

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL,
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

// JWT 토큰 자동 첨부
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    (e) => {
        console.log('오류: ', e.message);
        toastStore.showToast('오류가 발생했습니다: '+ e.message);
        return Promise.reject(e)
    }
)

// 토큰 재발급
api.interceptors.response.use(
    response => response,
    async (e) => {
        console.log('인터셉터 호출')
        const authStore = useAuthStore();
        
        const originalRequest = e.config;

        // 무한 루프 방지
        if (originalRequest._retry) {
            unAuth(error.message);
            return Promise.reject(e);
        }

        if (e.response?.status === 401) {
            if(e.response?.data?.message !== "access token expired"){
                unAuth(e.message);
                return Promise.reject(e);
            }
            
            console.log('엑세스 토큰 만료')
            originalRequest._retry = true;

            try {
                const response = await api.post('/auth/validate');

                const data = response.data;

                console.log("엑세스 토큰 재발급");
                authStore.token = data.accessToken;
                return api(originalRequest);
            }
            catch (error) {
                unAuth(error.message);
                return Promise.reject(error);
            }
        }
        return Promise.reject(e);
    }
)

function unAuth(message) {
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    authStore.logout();
    localStorage.clear();

    if (message) {
        toastStore.showToast(message);
    }

    router.replace("/login");  // 여기서만 이동
}

export default api