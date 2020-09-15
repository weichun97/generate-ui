const responseFilter = (response) => {
  console.log(response)
  if (response.code) {
    if (response.code === 200) {
      return response
    } else {
      // 非正常处理
      return Promise.reject(new Error(response.message || 'Error'))
    }
  } else {
    return response
  }
}

export default responseFilter
