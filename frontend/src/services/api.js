import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 20000 })
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getMe: () => api.get('/auth/me'),
}
export const commandeAPI = {
  create: (d) => api.post('/commandes', d),
  getAll: (p) => api.get('/commandes', { params: p }),
  getOne: (id) => api.get(`/commandes/${id}`),
  track: (n) => api.get(`/commandes/track/${n}`),
  updateStatut: (id, d) => api.put(`/commandes/${id}/statut`, d),
  updatePosition: (id, d) => api.put(`/commandes/${id}/position`, d),
  getMesCommandes: () => api.get('/commandes/mes-commandes'),
}
export const commandeAccAPI = {
  create: (d) => api.post('/commandes-accessoires', d),
  getAll: (p) => api.get('/commandes-accessoires', { params: p }),
  track: (n) => api.get(`/commandes-accessoires/track/${n}`),
  getMesCommandes: () => api.get('/commandes-accessoires/mes-commandes'),
  updateStatut: (id, d) => api.put(`/commandes-accessoires/${id}/statut`, d),
}
export const produitAPI = {
  getAll: (p) => api.get('/produits', { params: p }),
  getOne: (id) => api.get(`/produits/${id}`),
  getMarques: () => api.get('/produits/marques'),
  create: (fd) => api.post('/produits', fd, multipart),
  update: (id, fd) => api.put(`/produits/${id}`, fd, multipart),
  delete: (id) => api.delete(`/produits/${id}`),
}
export const userAPI = {
  getAll: (p) => api.get('/users', { params: p }),
  create: (d) => api.post('/users', d),
  toggle: (id) => api.put(`/users/${id}/toggle`),
}
export const statsAPI = {
  dashboard: () => api.get('/stats/dashboard'),
}
export const sliderAPI = {
  getAll: (p) => api.get('/slider', { params: p }),
  create: (fd) => api.post('/slider', fd, multipart),
  update: (id, fd) => api.put(`/slider/${id}`, fd, multipart),
  delete: (id) => api.delete(`/slider/${id}`),
  reorder: (ordres) => api.put('/slider/reorder', { ordres }),
}
export const accessoireAPI = {
  getAll: (p) => api.get('/accessoires', { params: p }),
  getOne: (id) => api.get(`/accessoires/${id}`),
  getCategories: () => api.get('/accessoires/categories'),
  create: (fd) => api.post('/accessoires', fd, multipart),
  update: (id, fd) => api.put(`/accessoires/${id}`, fd, multipart),
  delete: (id) => api.delete(`/accessoires/${id}`),
}

export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  return `${base}${path}`
}
export default api
