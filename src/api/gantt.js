import { request } from '../utils/request'


export async function getListData() {
  const base = import.meta.env.BASE_URL || '/'
  const res = await request(`${base}mock.json`)

  if (res.code !== 0) {
    throw new Error(res.message || '获取数据失败')
  }

  return res.data || []
}
