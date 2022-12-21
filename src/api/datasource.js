import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/datasource/list',
    method: 'get',
    params
  })
}

export function save(params) {
  return request({
    url: '/datasource/save',
    method: 'post',
    data: params
  })
}

export function remove(id) {
  return request({
    url: `/datasource/remove/${id}`,
    method: 'delete'
  })
}

export function update(params, id) {
  return request({
    url: `/datasource/update/${id}`,
    method: 'put',
    data: params
  })
}

export function test(params) {
  return request({
    url: '/datasource/test',
    method: 'post',
    data: params
  })
}
