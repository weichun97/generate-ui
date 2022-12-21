<template>
  <div class="app-container">
    <el-backtop />
    <div v-if="loading">生成中...</div>
    <div v-else>
      <el-container>
        <el-aside>
          <el-button
            icon="el-icon-download"
            type="text"
            @click="downloadAll"
          >下载全部</el-button>
          <el-input
            v-show="treeData.length > 0"
            v-model="filterText"
            prefix-icon="el-icon-search"
            placeholder="搜索"
            size="mini"
            clearable
            style="margin-bottom: 10px;"
          />
          <el-tree
            ref="tree"
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            node-key="id"
            default-expand-all
            highlight-current
            @current-change="onTreeSelect"
          />
        </el-aside>
        <el-main v-show="fileInfo.content.length > 0">
          <el-button
            type="text"
            icon="el-icon-document-copy"
            :data-clipboard-text="fileInfo.content"
            class="copyBtn"
            @click="copy(fileInfo.content)"
          >复制代码</el-button>
          <el-button
            icon="el-icon-download"
            type="text"
            @click="downloadText(fileInfo.fileName, fileInfo.content)"
          >下载当前文件</el-button>
          <Codemirror :code.sync="fileInfo.content" />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script>
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { generate } from '@/api/generate'
import { showSuccessDialog } from '@/utils/common'
import Codemirror from '@/components/Codemirror'
export default {
  components: {
    Codemirror
  },
  data() {
    return {
      loading: true,
      clientParam: {
        datasourceConfigId: '',
        tableNames: [],
        templateConfigIdList: [],
        packageName: ''
      },
      treeData: [],
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'dirOrFileName'
      },
      content: '',
      fileInfo: {
        content: '',
        fileName: ''
      },
      cmOptions: {
        value: '',
        mode: 'text/x-java',
        theme: 'neat',
        readOnly: true
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    const param = JSON.parse(localStorage.getItem('generateForm'))
    generate(param).then((res) => {
      this.loading = false
      this.treeData = res.data
    })
  },
  methods: {
    // 树搜索
    filterNode(value, data) {
      if (!value) return true
      return data.dirOrFileName.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    buildTreeData(rows) {
      const treeData = []
      const codeMap = {}
      // 把列表数据转换到map中,key为模板名
      // value是个List
      for (let i = 0, len = rows.length; i < len; i++) {
        const row = rows[i]
        const folder = row.folder
        let list = codeMap[folder]
        if (!list) {
          list = []
          codeMap[folder] = list
        }
        list.push(row)
      }
      // 把这个map对象转成tree格式数据
      for (const folder in codeMap) {
        const codeFileArr = codeMap[folder]
        // 父节点
        const treeElement = {
          fileName: folder,
          children: this.buildChildren(codeFileArr)
        }

        treeData.push(treeElement)
      }
      return treeData
    },
    buildChildren(codeFileArr) {
      const children = []
      for (let i = 0, len = codeFileArr.length; i < len; i++) {
        const codeFile = codeFileArr[i]
        const child = {
          fileName: codeFile.fileName,
          content: codeFile.content
        }
        children.push(child)
      }
      return children
    },
    onTreeSelect(data) {
      if (data.children && data.children.length > 0) {
        return
      }
      console.log(data)
      this.fileInfo = { content: data.content, fileName: data.dirOrFileName }
    },
    getSuffix(fileName) {
      const index = fileName.lastIndexOf('.')
      if (index === -1) {
        return 'js'
      }
      return fileName.substring(index + 1, fileName.length)
    },
    downloadText(name, content) {
      var blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, name)
    },
    // 下载zip
    downloadAll() {
      const data = this.treeData
      const zip = new JSZip()
      this.createZip(zip, data)
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        // see FileSaver.js
        saveAs(content, `code-${new Date().getTime()}.zip`)
      })
    },
    createZip(zip, data) {
      console.log(data)
      if (data == null) {
        return
      }
      data.forEach(row => {
        const isFolder = row.children != null && row.children.length > 0
        if (isFolder) {
          const folderZip = zip.folder(row.dirOrFileName)
          this.createZip(folderZip, row.children)
        } else {
          zip.file(row.dirOrFileName, row.content)
        }
      })
    },
    copy(code) {
      this.$copyText(code).then(e => {
        showSuccessDialog(this, '复制成功')
      })
    }
  }
}
</script>

