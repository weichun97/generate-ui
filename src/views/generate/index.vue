<template>
  <div class="app-container">
    <!-- <el-tabs v-model="activeName" type="card"> -->
    <!-- <el-tab-pane name="first"> -->
    <!-- <span slot="label"><i class="el-icon-edit-outline" /> 生成代码</span> -->
    <div class="generate">
      <!-- 生成代码表单 -->
      <el-form
        :ref="generateFormRef"
        :model="generateForm"
        :rules="generateFormRules"
        size="mini"
        label-width="150px"
      >

        <el-form-item label="选择数据源" prop="datasourceId">
          <el-select
            v-model="generateForm.datasourceId"
            placeholder="选择数据源"
          >
            <el-option
              v-for="item in datasourceConfigList"
              :key="item.id"
              :label="getDatasourceLabel(item)"
              :value="item.id"
            >
              <span style="float: left">{{ getDatasourceLabel(item) }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                <el-tooltip placement="top" content="Duplicate">
                  <el-link type="primary" icon="el-icon-document-copy" style="margin-right: 20px;" @click.stop="handleCopy(item)" />
                </el-tooltip>
                <el-link type="primary" icon="el-icon-edit" style="margin-right: 20px;" @click.stop="handleEdit(item)" />
                <el-link type="danger" icon="el-icon-delete" @click.stop="handleDelete(item)" />
              </span>
            </el-option>

          </el-select>
          <el-button type="text" @click="handleCreate">新建数据源</el-button>
        </el-form-item>
        <!-- 数据表 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>选择表</h4>
            <el-input
              v-model="tableSearch"
              prefix-icon="el-icon-search"
              clearable
              size="mini"
              placeholder="过滤表"
              style="margin-bottom: 10px;width: 100%;"
            />
            <el-table
              :data="tableListData"
              :row-class-name="tableRowClassName"
              @selection-change="onTableListSelect"
            >
              <el-table-column
                type="selection"
              />
              <el-table-column
                prop="name"
                label="表名"
              />
              <el-table-column
                prop="comment"
                label="备注"
              />
            </el-table>
          </el-col>
          <!-- 模板 -->
          <el-col id="templateSelect" :span="12">
            <h4>选择模板</h4>
            <el-select
              v-model="templateId"
              placeholder="选择模板所在组"
              size="mini"
              style="margin-bottom: 10px; width: 100%;"
              @change="onTemplateGroupChange"
            >
              <el-option
                v-for="item in templateGroups"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                {{ item.name }}
              </el-option>
            </el-select>
            <el-table
              ref="templateListSelect"
              :data="templateListData"
              @selection-change="onTemplateListSelect"
            >
              <el-table-column
                type="selection"
              />
              <el-table-column
                prop="name"
                label="模板名称"
              >
                <span slot-scope="scope">
                  <!--              {{scope.row.groupName}}-{{scope.row.name}}-->
                  {{ scope.row.name }}
                </span>
              </el-table-column>
            </el-table>
            <el-button type="primary" @click="onGenerate">生成代码</el-button>
          </el-col>
        </el-row>

        <!-- 新增编辑 -->
        <el-dialog
          :title="saveOrUpdateFormTitle"
          :visible.sync="saveOrUpdateFormVisible"
          :close-on-press-escape="false"
          :close-on-click-modal="false"
        >
          <el-form
            :ref="saveOrUpdateFormRef"
            :model="saveOrUpdateForm"
            :rules="saveOrUpdateFormRules"
            size="mini"
            label-width="120px"
          >
            <el-form-item label="数据库类型" prop="dbType">
              <el-select
                v-model="saveOrUpdateForm.dbType"
                filterable
                default-first-option
              >
                <el-option
                  v-for="item in dbTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Host" prop="host">
              <el-input v-model="saveOrUpdateForm.host" placeholder="地址" show-word-limit maxlength="100" />
            </el-form-item>
            <el-form-item label="Port" prop="port">
              <el-input v-model="saveOrUpdateForm.port" placeholder="端口" show-word-limit maxlength="10" />
            </el-form-item>
            <el-form-item label="dbName" prop="dbName">
              <el-input v-model="saveOrUpdateForm.dbName" placeholder="数据库名" show-word-limit maxlength="64" />
            </el-form-item>
            <el-form-item label="Username" prop="username">
              <el-input v-model="saveOrUpdateForm.username" placeholder="用户名" show-word-limit maxlength="100" />
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input v-model="saveOrUpdateForm.password" type="password" placeholder="密码" show-word-limit maxlength="100" />
            </el-form-item>
            <el-form-item label="删除前缀" prop="delPrefix">
              <el-input v-model="saveOrUpdateForm.delPrefix" placeholder="删除前缀（表名sys_user删除前缀sys_对应bean为User）多前缀逗号隔开" show-word-limit maxlength="200" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" :loading="testConnectLoading" @click="testConnect">测试连接</el-button>
              <el-button type="primary" :loading="saveOrUpdateLoading" @click="saveOrUpdate">保存</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>

      </el-form></div>
    <!-- </el-tab-pane> -->
    <!-- <el-tab-pane name="second">
        <span slot="label"><i class="el-icon-date" /> 生成历史</span> -->
    <!-- <generate-history /> -->
    <!-- </el-tab-pane> -->
    <!-- </el-tabs> -->
  </div>
</template>
<script>
import { DB_TYPE } from '@/constant/select'
import { list, save, update, remove, test } from '@/api/datasource'
import { tables } from '@/api/generate'
import { select, listDetail } from '@/api/template'
import { showDeleteDialog, showSuccessDialog } from '@/utils/common'
// import GenerateConfig from './GenerateConfig'
// import GenerateHistory from './GenerateHistory'
export default {
  name: 'GenerateConfig',
  data() {
    return {
      // 其他
      activeName: 'first',
      // 新增、更新、复制、测试连接
      dbTypes: DB_TYPE,
      updateId: null,
      saveOrUpdateFormTitle: '新建连接',
      saveOrUpdateFormVisible: false,
      saveOrUpdateLoading: false,
      saveOrUpdateForm: {},
      saveOrUpdateFormRef: 'saveOrUpdateFormRef',
      saveOrUpdateFormRules: {
        dbType: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        host: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        dbName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      testConnectLoading: false,
      // 生成代码
      templateId: null,
      datasourceConfigList: [],
      generateFormRef: 'generateFormRef',
      generateForm: {
        datasourceId: null,
        tableNames: null,
        templateIds: null
      },
      generateFormRules: {
        datasourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
        ]
      },
      // 表
      tableSearch: '',
      tableListData: [],
      // 模板
      templateGroups: [],
      templateListData: [],
      templateListSelect: [],

      groupId: '',

      // add datasource
      dbTypeConfig: []
    }
  },
  watch: {
    'generateForm.datasourceId': function(val) {
      this.showTables()
    }
  },
  created() {
    this.loadDataSource()
    this.loadTemplate()
  },
  methods: {
    // 生成代码
    loadDataSource() {
      list().then(resp => {
        this.datasourceConfigList = resp.data
        this.generateForm.datasourceId = this.updateId != null ? this.updateId : this.datasourceConfigList.length > 0 ? this.datasourceConfigList[0].id : null
        if (this.generateForm.datasourceId) {
          this.showTables()
        }
      })
    },
    getDatasourceLabel(item) {
      const schema = item.schemaName ? `/${item.schemaName}` : ''
      const dbDesc = item.dbDesc ? item.dbDesc + '   ' : ''
      return `${dbDesc}${item.dbName}${schema} (${item.host}) - ${item.username}`
    },
    onGenerate(target) {
      this.$refs.generateFormRef.validate((valid) => {
        if (valid) {
          if (this.generateForm.tableNames == null || this.generateForm.tableNames.length === 0) {
            this.$message({
              type: 'error',
              message: '请选择表'
            })
          }
          if (this.generateForm.templateIds == null || this.generateForm.templateIds.length === 0) {
            this.$message({
              type: 'error',
              message: '请选择模板'
            })
          }
          localStorage.setItem('generateForm', JSON.stringify(this.generateForm))
          this.$router.push({ name: 'ResultGenerate' })
        }
      })
    },
    // 表
    showTables() {
      tables(this.generateForm.datasourceId).then((res) => {
        this.tableListData = res.data
      })
    },
    onTableListSelect(selectedRows) {
      this.generateForm.tableNames = selectedRows
        .filter(row => row.hidden === undefined || row.hidden === false)
        .map(row => row.name)
    },
    tableRowClassName: function({ row, index }) {
      row.hidden = false
      if (this.tableSearch.length === 0) {
        return ''
      }
      if (!(row.name && row.name.toLowerCase().indexOf(this.tableSearch.toLowerCase()) > -1)) {
        row.hidden = true
        return 'hidden-row'
      }
      return ''
    },
    // 模板
    loadTemplate() {
      select().then((res) => {
        this.templateGroups = res.data
        this.templateId = this.templateGroups.length > 0 ? this.templateGroups[0].id : null
        listDetail({ id: this.templateId }).then((res) => {
          this.templateListData = res.data
        })
      })
    },
    onTemplateGroupChange() {
      // 切换模板下拉框  清除先前被选中的模板
      listDetail({ id: this.templateId }).then((res) => {
        this.templateListData = res.data
      })
    },
    onTemplateListSelect(selectedRows) {
      this.generateForm.templateIds = selectedRows
        .filter(row => row.hidden === undefined || row.hidden === false)
        .map(row => row.id)
    },
    // 新增、更新、复制、测试连接
    testConnect() {
      this.$refs.saveOrUpdateFormRef.validate((valid) => {
        if (valid) {
          this.testConnectLoading = true
          test(this.saveOrUpdateForm).then(() => {
            showSuccessDialog(this, '连接数据库成功')
            this.testConnectLoading = false
          }).catch(() => {
            console.log(123)
            this.testConnectLoading = false
          })
        }
      })
    },
    handleCreate() {
      this.saveOrUpdateFormTitle = '新建连接'
      this.saveOrUpdateForm = {}
      this.saveOrUpdateFormVisible = true
      this.updateId = null
    },
    handleCopy(item) {
      this.saveOrUpdateFormTitle = `${item.host} 复制`
      this.saveOrUpdateForm = Object.assign({}, this.saveOrUpdateForm, item)
      this.updateId = null
      this.saveOrUpdateFormVisible = true
    },
    handleEdit(item) {
      this.saveOrUpdateFormTitle = '修改连接'
      this.saveOrUpdateForm = Object.assign({}, this.saveOrUpdateForm, item)
      this.updateId = item.id
      this.saveOrUpdateFormVisible = true
    },
    saveOrUpdate() {
      this.$refs.saveOrUpdateFormRef.validate((valid) => {
        if (valid) {
          this.updateId == null ? this.saveDatasource() : this.updateDataSource()
        }
      })
    },
    saveDatasource() {
      this.saveOrUpdateLoading = true
      save(this.saveOrUpdateForm).then(() => {
        this.resetForm(this.saveOrUpdateFormRef)
        this.loadDataSource()
        this.saveOrUpdateFormVisible = false
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    updateDataSource() {
      this.saveOrUpdateLoading = true
      update(this.saveOrUpdateForm, this.updateId).then(() => {
        this.resetForm(this.saveOrUpdateFormRef)
        this.loadDataSource()
        this.saveOrUpdateFormVisible = false
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    // 删除
    handleDelete(row) {
      showDeleteDialog(this, () => {
        remove(row.id).then(() => {
          this.loadDataSource()
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
<style lang="scss">
  .generate {
    margin: 0 auto;
    width: 70%;
      .el-row h4 {
        text-align: center;
      }
      .el-row .el-button {
        margin-top: 20px;
      }
  }
  .generate .el-input {
    width: 450px;
  }
  .el-table .hidden-row {
    display: none;
  }
  #templateSelect {
    .el-input { width: 100%;}
  }
</style>
