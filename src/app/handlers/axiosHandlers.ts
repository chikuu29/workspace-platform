import axios, { AxiosResponse, AxiosError } from 'axios';
import { RootState, store } from '../store';
// import { useSelector } from 'react-redux';
// const BASE_URL = import.meta.env.VITE_API_END_POINT;
// const BASE_URL = import.meta.env.VITE_API_END_POINT;
// const BASE_URL='/api'
console.log("%c" + `===🎉${import.meta.env.MODE.toUpperCase()}🎉MODE ACTIVE=== `, "color:green");

const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

function getCRSFToken() {
    let token = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('csrftoken='));
    if (token) {
        return token.split('=')[1];
    }
    return '';
}

// const BASE_URL = '/api';
const privateAPI = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        'X-Client-ID': import.meta.env.VITE_X_Client_ID,
        'X-CSRFToken':getCRSFToken()
    },
    timeout: 30000

})

const publicAPI = axios.create({
    baseURL: BASE_URL,
    // timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        'X-Client-ID': import.meta.env.VITE_X_Client_ID,
        'X-CSRFToken':getCRSFToken()
    },
    timeout: 30000
})
// Request interceptor to add Authorization header
privateAPI.interceptors.request.use(
    (config) => {
        const authState: RootState = store.getState()
        console.log("authState",authState);
        
        if (authState && authState.auth && authState.auth.isAuthenticated) {
            if (config.data instanceof FormData) {
                config.headers['Content-Type'] = 'multipart/form-data';
            } else if (config.data && typeof config.data === 'object') {
                // If the data is an object, we use application/json
                config.headers['Content-Type'] = 'application/json';
            } else {
                // You can set any other default Content-Type if needed
                config.headers['Content-Type'] = 'text/plain';
            }
            const { access_token } = authState.auth
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${access_token}`;
        }
        
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }

);

// Response interceptor to handle 401 errors and refresh token
privateAPI.interceptors.response.use(

    (response: AxiosResponse) => {
        return response
    },
    (error: AxiosError) => {
        const { config } = error
        const originalRequest: any = config;

        if (error?.response?.status === 403 && !originalRequest?.sent) {
            originalRequest.sent = true;
            // const newAccessToken = await refresh();
            const newAccessToken = "newtoken_" + Math.random()
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return privateAPI(originalRequest);
        }
        return Promise.reject(error)
    }

)


export { privateAPI, publicAPI };
