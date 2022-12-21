import request from '@/utils/request'

export function query(params) {
  return request({
    url: '/template/query',
    method: 'get',
    params
  })
}

export function save(params) {
  return request({
    url: '/template/save',
    method: 'post',
    data: params
  })
}

export function update(params, id) {
  return request({
    url: `/template/update/${id}`,
    method: 'put',
    data: params
  })
}

export function remove(id) {
  return request({
    url: `/template/remove/${id}`,
    method: 'delete'
  })
}

export function customFields(id) {
  return request({
    url: `/template/customFields/${id}`,
    method: 'get'
  })
}

export function updateCustomFields(params, id) {
  return request({
    url: `/template/updateCustomFields/${id}`,
    method: 'put',
    data: params
  })
}

export function select() {
  return request({
    url: '/template/select',
    method: 'get'
  })
}

export function listDetail(params) {
  return request({
    url: `/template/listDetail`,
    method: 'get',
    params
  })
}

export function saveDetail(params) {
  return request({
    url: '/template/saveDetail',
    method: 'post',
    data: params
  })
}

export function updateDetail(params, id) {
  return request({
    url: `/template/updateDetail/${id}`,
    method: 'put',
    data: params
  })
}

export function removeDetail(id) {
  return request({
    url: `/template/removeDetail/${id}`,
    method: 'delete'
  })
}
