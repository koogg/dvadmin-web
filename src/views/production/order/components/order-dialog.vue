<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑工单' : '新增工单'"
      width="650px"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="right"
      >
        <!-- 表单内容 -->
        <el-form-item label="工单编号" prop="order_number">
          <el-input v-model="form.order_number" placeholder="请输入工单编号" />
        </el-form-item>
        <el-form-item label="生产编号" prop="production_number">
          <el-input v-model="form.production_number" placeholder="请输入生产编号" />
        </el-form-item>
        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="工艺" prop="process">
          <el-select v-model="form.process" placeholder="请选择工艺" style="width: 100%">
            <el-option
              v-for="item in processList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期" prop="order_date">
          <el-date-picker
            v-model="form.order_date"
            type="date"
            placeholder="选择下单日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划开始日期" prop="planned_start_date">
          <el-date-picker
            v-model="form.planned_start_date"
            type="date"
            placeholder="选择计划开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划结束日期" prop="planned_end_date">
          <el-date-picker
            v-model="form.planned_end_date"
            type="date"
            placeholder="选择计划结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="车间" prop="workshop">
          <el-select v-model="form.workshop" placeholder="请选择车间" style="width: 100%">
            <el-option label="长江路车间" value="长江路车间" />
            <el-option label="锡山路车间" value="锡山路车间" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待生产" value="待生产" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
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
import { ElMessage } from "element-plus"; // 添加这一行导入

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
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
  order_date: "",
  order_number: "",
  production_number: "",
  product_name: "",
  process: "",
  planned_start_date: "",
  planned_end_date: "",
  workshop: "", // 默认为空
  status: "pending"
});

// 表单验证规则
const rules = {
  order_number: [
    { required: true, message: "请输入工单编号", trigger: "blur" },
    { max: 50, message: "长度不能超过50个字符", trigger: "blur" }
  ],
  production_number: [
    { required: true, message: "请输入生产编号", trigger: "blur" },
    { max: 50, message: "长度不能超过50个字符", trigger: "blur" }
  ],
  product_name: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    { max: 100, message: "长度不能超过100个字符", trigger: "blur" }
  ],
  process: [
    { required: true, message: "请选择工艺", trigger: "change" }
  ],
  order_date: [
    { required: true, message: "请选择下单日期", trigger: "change" }
  ],
  planned_start_date: [
    { required: true, message: "请选择计划开始日期", trigger: "change" }
  ],
  planned_end_date: [
    { required: true, message: "请选择计划结束日期", trigger: "change" }
  ],
  workshop: [
    { required: true, message: "请选择车间", trigger: "change" }
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

// 监听order属性变化
watch(
  () => props.order,
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

      // 验证日期逻辑
      if (new Date(form.planned_end_date) < new Date(form.planned_start_date)) {
        ElMessage.error("计划结束日期不能早于计划开始日期");
        loading.value = false;
        return false;
      }

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

/* 添加以下样式优化表单布局 */
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-input), :deep(.el-select), :deep(.el-date-editor) {
  width: 100%;
}
</style>
