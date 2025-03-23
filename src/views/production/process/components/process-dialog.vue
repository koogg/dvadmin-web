<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑工艺' : '新增工艺'"
      width="500px"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="工艺编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入工艺编号" />
        </el-form-item>
        <el-form-item label="工艺名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入工艺名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="submitForm(formRef)">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  process: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

const dialogVisible = ref(false);
const formRef = ref(null);

// 表单数据
const form = reactive({
  code: "",
  name: "",
  status: 1,
  remark: ""
});

// 表单验证规则
const rules = reactive({
  code: [
    { required: true, message: "请输入工艺编号", trigger: "blur" },
    { max: 50, message: "长度不能超过50个字符", trigger: "blur" }
  ],
  name: [
    { required: true, message: "请输入工艺名称", trigger: "blur" },
    { max: 100, message: "长度不能超过100个字符", trigger: "blur" }
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
});

// 监听visible属性变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      // 打开对话框时初始化表单数据
      Object.keys(form).forEach(key => {
        form[key] = props.process[key] !== undefined ? props.process[key] : "";
      });
    }
  }
);

// 监听dialogVisible变化，同步更新父组件的visible属性
watch(
  () => dialogVisible.value,
  (val) => {
    emit("update:visible", val);
  }
);

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return;
  
  await formEl.validate((valid, fields) => {
    if (valid) {
      // 根据编辑模式决定发送的事件类型
      const type = props.isEditMode ? "update" : "create";
      // 构造提交的数据，如果是编辑模式，需要包含ID
      const data = props.isEditMode 
        ? { ...form, id: props.process.id }
        : { ...form };
      
      emit("save", type, data);
    } else {
      // 表单验证失败
    }
  });
};

// 取消按钮
function handleCancel() {
  emit("cancel");
  dialogVisible.value = false;
}

// 关闭对话框
function handleClose() {
  handleCancel();
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>