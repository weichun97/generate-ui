<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-select v-model="listParam.id" placeholder="模板组" style="width: 200px;" clearable class="filter-item">
        <el-option
          v-for="item in templates"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-input v-model="listParam.name" placeholder="模板名" style="width: 200px;" clearable class="filter-item" />

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleResetQuery">
        重置
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="模板组">
        <template slot-scope="scope">
          {{ scope.row.templateName }}
        </template>
      </el-table-column>
      <el-table-column label="模板名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="目录">
        <template slot-scope="scope">
          {{ scope.row.dir }}
        </template>
      </el-table-column>
      <el-table-column label="文件名">
        <template slot-scope="scope">
          {{ scope.row.fileName }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleCopy(scope.row)"
          >复制</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { listDetail, removeDetail, select } from '@/api/template'
import { showDeleteDialog, showSuccessDialog } from '@/utils/common'

export default {
  data() {
    return {
      // 分页
      templates: [],
      listParam: {
        id: 0
      },
      list: [],
      listLoading: true,
      // 新增、修改
      saveOrUpdateFormRef: 'saveOrUpdateFormRef',
      saveOrUpdateFormTitile: '新增',
      saveOrUpdateFormVisible: false,
      updateId: null,
      saveOrUpdateForm: {
        name: null
      },
      saveOrUpdateFormRules: {
        name: [
          { required: true, message: '请输入模板名', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.listParam.id = this.$route.params.id
    select().then((res) => {
      this.templates = res.data
    })
    this.fetchData()
  },
  methods: {
    // 分页
    handleFilter() {
      this.fetchData()
    },
    handleResetQuery() {
      this.listParam = {
        id: 0,
        current: 1,
        size: 10
      }
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      listDetail(this.listParam, this.listParam.templateId).then((response) => {
        this.list = response.data
        this.listLoading = false
      })
    },
    // 新增、编辑、复制
    handleCopy(row) {
      row.id = null
      this.$router.push({
        name: 'EditTemplate',
        params: row
      })
    },
    handleEdit(row) {
      this.$router.push({
        name: 'EditTemplate',
        params: row
      })
    },
    handleCreate() {
      this.$router.push({
        name: 'EditTemplate',
        params: {
          templateId: this.listParam.id
        }
      })
    },
    // 删除
    handleDelete(row) {
      showDeleteDialog(this, () => {
        removeDetail(row.id).then(() => {
          this.fetchData()
          showSuccessDialog(this)
        })
      })
    },
    // 通用
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
