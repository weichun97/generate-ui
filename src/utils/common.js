/**
 * 通用成功弹框
 *
 * @param {Object} vue vue对象
 */
export function showSuccessDialog(vue, msg = '操作成功') {
  vue.$message({
    type: 'success',
    message: msg
  })
}

/**
 * 通用删除弹框
 *
 * @param {Object} vue vue对象
 * @param {Function} callback 回调函数
 */
export function showDeleteDialog(vue, callback) {
  vue.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(callback)
}
