<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑工序' : '新增工序'"
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
        <!-- 表单内容 -->
        <el-form-item label="工序编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入工序编号" />
        </el-form-item>
        <el-form-item label="工序名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入工序名称" />
        </el-form-item>
        <el-form-item label="所属工艺" prop="process">
          <el-select v-model="form.process" placeholder="请选择所属工艺" style="width: 100%">
            <el-option
              v-for="item in processList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="顺序" prop="order">
          <el-input-number v-model="form.order" :min="0" style="width: 100%" />
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
          <el-button type="primary" @click="handleSubmit">确认</el-button>
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
  processStep: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  processList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "save", "cancel"]);

const dialogVisible = ref(false);
const formRef = ref(null);
const loading = ref(false);

// 表单数据
const form = reactive({
  id: "",
  code: "",
  name: "",
  process: "",
  order: 0,
  status: 1,
  remark: ""
});

// 表单验证规则
const rules = {
  code: [
    { required: true, message: "请输入工序编号", trigger: "blur" },
    { max: 50, message: "长度不能超过50个字符", trigger: "blur" }
  ],
  name: [
    { required: true, message: "请输入工序名称", trigger: "blur" },
    { max: 100, message: "长度不能超过100个字符", trigger: "blur" }
  ],
  process: [
    { required: true, message: "请选择所属工艺", trigger: "change" }
  ],
  order: [
    { required: true, message: "请输入顺序", trigger: "blur" }
  ],
  status: [
    { required: true, message: "请选择状态", trigger: "change" }
  ]
};

// 监听visible属性变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
  }
);

// 监听dialogVisible变化，同步更新父组件的visible属性
watch(
  () => dialogVisible.value,
  (val) => {
    emit("update:visible", val);
  }
);

// 监听processStep属性变化
watch(
  () => props.processStep,
  (val) => {
    if (val) {
      // 复制对象，避免直接修改props
      Object.keys(form).forEach(key => {
        if (val[key] !== undefined) {
          form[key] = val[key];
        }
      });
    }
  },
  { immediate: true, deep: true }
);

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      const type = props.isEditMode ? "update" : "create";
      emit("save", type, { ...form });
      loading.value = false;
    } else {
      return false;
    }
  });
};

// 取消按钮
const handleCancel = () => {
  emit("cancel");
  dialogVisible.value = false;
};

// 关闭对话框
const handleClose = () => {
  handleCancel();
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>