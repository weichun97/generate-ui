<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="1"></el-col>
      <el-col :span="11" :offset="11">
          <el-button @click="showGenerateDialogForm()" type="primary">生成代码</el-button>
      </el-col>
    </el-row>
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      max-height="700"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="表名">
        <template slot-scope="scope">{{ scope.row.tableName }}</template>
      </el-table-column>
      <el-table-column prop="tableComment" label="表备注"> </el-table-column>
      <el-table-column prop="engine" label="引擎" show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="tableCollation"
        label="字符集"
        show-overflow-tooltip
      >
      </el-table-column>
    </el-table>

    <el-dialog title="生成文件" :visible.sync="generateDialogForm.visible">
      <el-form :model="generateDialogForm.form">
        <el-form-item label="模块名" :label-width="generateDialogForm.formLabelWidth">
          <el-input v-model="generateDialogForm.form.module"></el-input>
        </el-form-item>

        <el-form-item label="文件类型" :label-width="generateDialogForm.formLabelWidth">
          <el-row :gutter="20">
            <el-col :span="1">
              <el-checkbox :indeterminate="generateDialogForm.isIndeterminate" v-model="generateDialogForm.checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            </el-col>
            <el-col :span="11">
              <el-checkbox-group v-model="generateDialogForm.form.types">
                <el-checkbox v-for="i in types" :key="i" :label="i"></el-checkbox>
              </el-checkbox-group>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="generateDialogForm.visible = false">取 消</el-button>
        <el-button type="primary" @click="generate()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// @ is an alias to /src
import { $indexApi } from "@/api/index.js";

export default {
  data() {
    return {
      types: [],
      tableData: [],
      generateDialogForm: {
        checkAll: false,
        isIndeterminate: true,

        visible: false,
        formLabelWidth: "120px",
        form: {
          tableNames: [],
          types: [],
          module: null
        }
      }
    };
  },
  created() {
    $indexApi.tables().then(response => {
      this.tableData = response.data;
    });
    $indexApi.types().then(response => {
      this.types = response.data;
    });
  },
  methods: {
    // 多选
    handleSelectionChange(val) {
      this.generateDialogForm.form.tableNames = [];
      val.forEach(v => {
        this.generateDialogForm.form.tableNames.push(v.tableName);
      });
    },

    // 生成代码
    showGenerateDialogForm() {
      if (this.generateDialogForm.form.tableNames.length <= 0) {
        this.$message({
          message: "请至少选择一张表",
          type: "warning"
        });
        return;
      }
      this.generateDialogForm.visible = true;
    },
    handleCheckAllChange(val){
      this.generateDialogForm.form.types = val ? this.types : [];
      this.isIndeterminate = false;
    },
    generate() {
      if (this.generateDialogForm.form.types.length <= 0) {
        this.$message({
          message: "请至少选择一种生成文件",
          type: "warning"
        });
        return;
      }
      $indexApi.generate(this.generateDialogForm.form).then(() => {
        this.$message({
          message: "生成成功",
          type: "success"
        });
        this.generateDialogForm.visible = false
      });
    }
  },
  name: "home"
};
</script>
