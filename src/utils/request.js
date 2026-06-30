import axios from 'axios'

const DEFAULT_TIMEOUT = 3000 // 超时时间

const http = axios.create({
  timeout: DEFAULT_TIMEOUT
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }

    if (error.response) {
      return Promise.reject(new Error(`请求失败: ${error.response.status}`))
    }

    return Promise.reject(error)
  }
)

export function request(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...restOptions } = options
  return http({
    url,
    timeout,
    ...restOptions
  })
}
