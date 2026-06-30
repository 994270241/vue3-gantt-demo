import { request } from '../utils/request'


export async function getListData() {
  const res = await request('/mock.json')

  if (res.code !== 0) {
    throw new Error(res.message || '获取数据失败')
  }

  return res.data || []
}
