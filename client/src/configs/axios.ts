
import axios from 'axios';


const api = axios.create({
<<<<<<< HEAD
    baseURL: import.meta.env.VITE_BASEURL || 'https://ai-site-builder-zeta.vercel.app',
=======
    baseURL: import.meta.env.VITE_BASEURL || 'https://ai-site-builder-saua.onrender.com/',
>>>>>>> a718e5a (final backend fix)
    withCredentials: true


})

export default api
