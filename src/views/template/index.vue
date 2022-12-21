<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-input v-model="listParam.name" placeholder="模板组" style="width: 200px;" clearable class="filter-item" />
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
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="根目录">
        <template slot-scope="scope">
          {{ scope.row.baseDir }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="创建时间"
        width="200"
      >
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            type="text"
            size="small"
            @click="handleCustom(scope.row)"
          >自定义</el-button>
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

    <!-- 分页 -->
    <Pagination :total="total" :page.sync="listParam.current" :limit.sync="listParam.size" @pagination="fetchData" />

    <!-- 新增更新弹框 -->
    <el-dialog :title="saveOrUpdateFormTitile" :visible.sync="saveOrUpdateFormVisible">
      <el-form
        :ref="saveOrUpdateFormRef"
        :model="saveOrUpdateForm"
        status-icon
        :rules="saveOrUpdateFormRules"
        label-width="100px"
      >
        <el-form-item label="模板名" prop="name">
          <el-input
            v-model="saveOrUpdateForm.name"
            type="text"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="根目录" prop="baseDir">
          <el-input
            v-model="saveOrUpdateForm.baseDir"
            type="text"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="saveOrUpdateLoading"
            @click="saveOrUpdateTemplate()"
          >提交</el-button>
          <el-button @click="saveOrUpdateFormVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 自定义 -->
    <el-dialog :title="customFieldTableDialogTitle" :visible.sync="customFieldTableDialogVisible">
      <el-button type="primary" @click="addNewField">添加</el-button>
      <el-button type="primary" @click="editModeEnabled = true">编辑</el-button>
      <el-button type="primary" @click="saveFields">保存</el-button>
      <el-table
        :data="customFieldTableData"
        style="width: 100%"
      >
        <el-table-column
          prop="key"
          label="key"
        >
          <editable-cell
            v-model="row.key"
            slot-scope="{row}"
            :can-edit="editModeEnabled"
          >
            <span slot="content">{{ row.key }}</span>
          </editable-cell>
        </el-table-column>

        <el-table-column
          prop="value"
          label="value"
        >
          <editable-cell
            v-model="row.value"
            slot-scope="{row}"
            :can-edit="editModeEnabled"
          >
            <span slot="content">{{ row.value }}</span>
          </editable-cell>
        </el-table-column>

        <el-table-column
          v-if="editModeEnabled"
          label="操作"
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleDeleteField(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { query, save, update, remove, customFields, updateCustomFields } from '@/api/template'
import Pagination from '@/components/Pagination'
import { showDeleteDialog, showSuccessDialog } from '@/utils/common'
import EditableCell from '@/components/EditableCell'

export default {
  components: {
    Pagination,
    EditableCell
  },
  data() {
    return {
      // 分页
      total: 0,
      listParam: {
        current: 1,
        size: 10
      },
      list: [],
      listLoading: true,
      // 新增、修改
      saveOrUpdateLoading: false,
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
        ],
        baseDir: [
          { pattern: /^([a-zA-Z_]+[a-zA-Z0-9_]*[a-zA-Z_]*)*(\/?[a-zA-Z_]+[a-zA-Z0-9_]*[a-zA-Z_]*)+$/, message: '根目录格式不正确', trigger: 'blur' }
        ]
      },
      // 自定义
      customFieldTableDialogTitle: '自定义属性',
      customFieldTableDialogVisible: false,
      customFieldTableData: [],
      editModeEnabled: false,
      currentTemplateId: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 分页
    handleFilter() {
      this.fetchData()
    },
    handleResetQuery() {
      this.listParam = {
        current: 1,
        size: 10
      }
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      query(this.listParam).then((response) => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 详情
    handleDetail(row) {
      this.$router.push({
        name: 'DetailTemplate',
        params: {
          id: row.id
        }
      })
    },
    // 自定义
    handleCustom(row) {
      this.currentTemplateId = row.id
      customFields(row.id).then((res) => {
        this.customFieldTableData = res.data
        this.customFieldTableDialogVisible = true
      })
    },
    addNewField() {
      this.editModeEnabled = true
      this.customFieldTableData.push({})
    },
    handleDeleteField(row) {
      this.customFieldTableData.splice(this.customFieldTableData.findIndex(item => item.key === row.key), 1)
    },
    saveFields() {
      const updateCustomFieldsForm = { 'customField': JSON.stringify(this.customFieldTableData) }
      console.log(updateCustomFieldsForm)
      updateCustomFields(updateCustomFieldsForm, this.currentTemplateId).then(() => {
        this.customFieldTableDialogVisible = false
        this.editModeEnabled = false
        showSuccessDialog(this)
      })
    },
    // 新增、编辑
    handleEdit(row) {
      this.saveOrUpdateFormTitile = '编辑'
      this.updateId = row.id
      this.saveOrUpdateForm = row
      this.saveOrUpdateFormVisible = true
    },
    handleCreate() {
      this.saveOrUpdateFormTitile = '新增'
      this.updateId = null
      this.saveOrUpdateForm = {}
      this.saveOrUpdateFormVisible = true
    },
    updateTemplate() {
      this.saveOrUpdateLoading = true
      update(this.saveOrUpdateForm, this.updateId).then(() => {
        this.resetForm(this.saveOrUpdateFormRef)
        this.saveOrUpdateFormVisible = false
        this.fetchData()
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    saveTemplate() {
      this.saveOrUpdateLoading = true
      save(this.saveOrUpdateForm).then(() => {
        this.resetForm(this.saveOrUpdateFormRef)
        this.saveOrUpdateFormVisible = false
        this.fetchData()
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    saveOrUpdateTemplate() {
      this.$refs[this.saveOrUpdateFormRef].validate((valid) => {
        if (valid) {
          this.updateId == null ? this.saveTemplate() : this.updateTemplate()
        }
      })
    },
    // 删除
    handleDelete(row) {
      showDeleteDialog(this, () => {
        remove(row.id).then(() => {
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
