<template>
  <div class="app-container" height="800px">
    <el-form
      :ref="saveOrUpdateFormRef"
      :model="saveOrUpdateForm"
      :rules="saveOrUpdateFormRules"
      label-position="top"
      label-width="80px"
    >
      <el-row :gutter="20">
        <!-- 左侧 -->
        <el-col :span="16">
          <el-button-group>
            <el-button type="primary" :loading="saveOrUpdateLoading" @click="saveOrUpdate()">保存</el-button>
            <el-button plain @click="$router.back()">返回</el-button>
          </el-button-group>
          <el-form-item label="模板组" prop="templateId">
            <el-select v-model="saveOrUpdateForm.templateId" size="mini" placeholder="模板组">
              <el-option
                v-for="item in templates"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="模板名" prop="name">
            <el-input v-model="saveOrUpdateForm.name" size="mini" />
          </el-form-item>
          <el-form-item label="目录" prop="dir">
            <el-input v-model="saveOrUpdateForm.dir" size="mini" />
          </el-form-item>
          <el-form-item label="文件名" prop="fileName">
            <el-input v-model="saveOrUpdateForm.fileName" size="mini" />
          </el-form-item>
          <el-form-item label="模板内容" prop="content">
            <el-link type="primary" :underline="false" href="http://freemarker.foofun.cn/ref_directive_if.html" target="_blank">freemark语法</el-link>
            <Codemirror :code.sync="saveOrUpdateForm.content" />
          </el-form-item>
        </el-col>

        <!-- 右侧 -->
        <el-col :span="8">
          <div :class="{ 'hasFix': needFix }" style="font-size: 14px;">
            <h4 style="margin: 5px 0">
              变量
              <span class="velocity-tip">
                点击变量复制
              </span>
            </h4>
            <el-tabs v-model="activeName" @tab-click="onTabClick">
              <el-tab-pane v-for="item in langTypes" :key="item.value" :label="item.label" :name="item.value" :content="item.value" />
            </el-tabs>
            <div class="velocity-var">
              <el-tree
                :data="treeData"
                :props="defaultProps"
                :indent="4"
                accordion
              >
                <span slot-scope="{ data }">
                  <span v-if="data.children">{{ data.expression }}</span>
                  <span v-else>
                    <a @click="onExpressionClick(data.expression)">{{ data.expression }}</a>：{{ data.text }}
                  </span>
                </span>
              </el-tree>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import Codemirror from '@/components/Codemirror'
import varJson from '/public/var.json'
import { select, saveDetail, updateDetail, customFields } from '@/api/template'
import { LANG_TYPE } from '@/constant/select'
import { showSuccessDialog } from '@/utils/common'

export default {
  components: {
    Codemirror
  },
  data() {
    return {
      // 保存
      templates: [],
      updateId: null,
      saveOrUpdateLoading: false,
      saveOrUpdateFormRef: 'saveOrUpdateFormRef',
      saveOrUpdateForm: {

      },
      saveOrUpdateFormRules: {
        templateId: [
          { required: true, message: '请选择模板组', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入模板名', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        fileName: [
          { required: true, message: '请输入文件名', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入模板内容', trigger: 'blur' }
        ]
      },
      // 变量
      activeName: '1',
      langTypes: LANG_TYPE,
      collapseActiveName: '0',
      treeData: [],
      velocityConfig: [],
      defaultProps: {
        children: 'children',
        label: 'expression'
      },
      needFix: false,
      keywordHelpShow: false
    }
  },
  watch: {
    'activeName': function(val) {
      this.load(val)
    },
    'saveOrUpdateForm.templateId': function(val) {
      this.loadCustomFields()
    }
  },
  created() {
    this.initData()
    this.templateSelect()
    this.load(this.activeName)
    this.loadCustomFields()
  },
  methods: {
    initData() {
      this.updateId = this.$route.query.id
      if (this.updateId) {
        this.saveOrUpdateForm = JSON.parse(localStorage.getItem('templateDetailEditForm'))
      }
    },
    // 右侧变量
    onTabClick(tab) {
      this.load(tab.name)
    },
    onExpressionClick(exp) {
      this.$copyText(exp).then(e => {
        showSuccessDialog(this, '复制成功')
      })
    },
    load(type) {
      this.treeData = varJson[type]
    },
    loadCustomFields() {
      if (this.saveOrUpdateForm.templateId == null) {
        this.treeData[0].children = []
        return
      }
      customFields(this.saveOrUpdateForm.templateId).then((result) => {
        const data = []
        result.data.forEach(field => {
          data.push({ 'expression': `\$\{custom\.${field.key}\}`, 'text': field.value })
        })
        this.treeData[0].children = data
        console.log(this.treeData[0].children)
      })
    },
    // 新增、保存
    templateSelect() {
      select().then((res) => {
        this.templates = res.data
      })
    },
    updateTemplateDetail() {
      this.saveOrUpdateLoading = true
      updateDetail(this.saveOrUpdateForm, this.updateId).then(() => {
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    saveTemplateDetail() {
      this.saveOrUpdateLoading = true
      saveDetail(this.saveOrUpdateForm).then(() => {
        showSuccessDialog(this)
        this.saveOrUpdateLoading = false
      }).catch(() => {
        this.saveOrUpdateLoading = false
      })
    },
    saveOrUpdate() {
      this.$refs[this.saveOrUpdateFormRef].validate((valid) => {
        if (valid) {
          this.updateId == null ? this.saveTemplateDetail() : this.updateTemplateDetail()
        }
      })
    }
  }
}
</script>
<style scoped>
/deep/ .el-form-item{
  margin-bottom:0px !important;
}
/deep/ .el-form--label-top .el-form-item__label{
  padding: 0 !important;
}
/deep/ .el-form-item__error{
  padding-top: 0px
}
.el-form-item--mini .el-form-item__content,
  .el-form-item--mini .el-form-item__label,
  .el-form-item__content {
   line-height: 20px;
  }
  .velocity-tip {
    color: #606266;
    font-size: 13px;
    font-weight: normal;
  }
  .velocity-var {
  }
  .velocity-var li {
    font-size: 14px;
    color: #606266;
    line-height: 26px;
  }
  .velocity-var a {
    color: #409EFF;
    font-weight: 500;
  }
  .velocity-var a:hover {
    color: rgba(64, 158, 255, 0.75);
  }
  .hasFix {
    position: fixed;
    top: 0;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  span.split {
    color: #ccc;
    margin: 0 3px;
  }
</style>
