import axios from 'axios'
import responseFilter from './response'
import {Message} from "element-ui"

// create an axios instance
const service = axios.create({
  baseURL: '', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
      // 设置 token
    // do something before request is sent
    // const token = localStorage.getItem('token')
    // if (token && token !== 'undefined') {
    //   config.headers['token'] = token
    // }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    return responseFilter(response.data)
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
      console.log('123' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
