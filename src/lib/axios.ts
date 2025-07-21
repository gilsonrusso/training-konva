import Axios from 'axios'
import { setInterceptors } from './interceptors'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  console.error('Environment variable REACT_APP_API_BASE_URL not set.')
  throw new Error('API Base URL is not defined. Please check your .env file.')
}

export const api = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add other common headers here, such as Authorization
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  timeout: 10000, // 10 second time limit
})

setInterceptors(api)
