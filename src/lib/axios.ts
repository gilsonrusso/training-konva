import Axios from 'axios'
import { setInterceptors } from './interceptors'

export const api = Axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: { 'content-type': 'application/json' },
})

setInterceptors(api)
