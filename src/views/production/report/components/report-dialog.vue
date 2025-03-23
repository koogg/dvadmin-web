<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择工序"
    :width="isMobile ? '95%' : '600px'"
    :before-close="handleClose"
    :fullscreen="isMobile"
    :destroy-on-close="true"
  >
    <div class="order-info" v-if="order">
      <el-descriptions :column="isMobile ? 1 : 2" border>
        <el-descriptions-item label="工单编号">{{
          order.order_number
        }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{
          order.product_name
        }}</el-descriptions-item>
        <el-descriptions-item label="工艺">{{
          order.process_name
        }}</el-descriptions-item>
        <el-descriptions-item label="车间">{{
          order.workshop
        }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="process-steps" v-if="processStepList.length > 0">
      <h3>请选择要开始的工序：</h3>
      <el-radio-group v-model="selectedStepId">
        <div v-for="step in processStepList" :key="step.id" class="step-item">
          <el-radio :label="step.id">
            <div class="step-info">
              <span class="step-name">{{ step.name }}</span>
              <span class="step-code">(编号: {{ step.code }})</span>
            </div>
          </el-radio>
        </div>
      </el-radio-group>
    </div>

    <div class="no-steps" v-else>
      <el-empty description="没有可用的工序" />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedStepId"
          @click="handleConfirm"
        >
          开始生产
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: () => ({})
  },
  processStepList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "start", "cancel"]);

const dialogVisible = ref(false);
const selectedStepId = ref("");
const isMobile = ref(false);

// 检测是否为移动设备
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 组件挂载时检测设备类型
onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

// 监听visible属性变化
watch(
  () => props.visible,
  val => {
    dialogVisible.value = val;
    if (val) {
      // 打开对话框时重置选择
      selectedStepId.value = "";
    }
  }
);

// 监听dialogVisible变化，同步更新父组件的visible属性
watch(
  () => dialogVisible.value,
  val => {
    emit("update:visible", val);
  }
);

// 确认按钮
function handleConfirm() {
  if (selectedStepId.value) {
    const selectedStep = props.processStepList.find(
      step => step.id === selectedStepId.value
    );
    if (selectedStep) {
      emit("start", selectedStep);
      dialogVisible.value = false; // 添加这行，确保对话框关闭
    }
  }
}

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
.order-info {
  margin-bottom: 20px;
}

.process-steps {
  margin-top: 20px;
}

.step-item {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.step-item:hover {
  background-color: #f5f7fa;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-name {
  font-weight: bold;
}

.step-code {
  font-size: 12px;
  color: #909399;
}

.no-steps {
  margin: 30px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .process-steps {
    max-height: calc(100vh - 300px);
    overflow-y: auto;
  }
  
  .dialog-footer {
    justify-content: space-between;
    width: 100%;
  }
  
  .step-item {
    margin: 15px 0;
    padding: 15px 10px;
  }
}
</style>
