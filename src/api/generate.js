import request from '@/utils/request'

export function tables(datasourceId) {
  return request({
    url: `/generate/tables/${datasourceId}`,
    method: 'get'
  })
}

export function generate(param) {
  return request({
    url: `/generate/generate`,
    method: 'post',
    data: param
  })
}
