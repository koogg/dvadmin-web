<template>
  <el-dialog
    v-model="dialogVisible"
    title="报工详情"
    :width="isMobile ? '95%' : '700px'"
    :before-close="handleClose"
    :fullscreen="isMobile"
    :destroy-on-close="true"
  >
    <el-descriptions :column="isMobile ? 1 : 2" border>
      <el-descriptions-item label="工单编号">{{
        report.production_order_number
      }}</el-descriptions-item>
      <el-descriptions-item label="产品名称">{{
        report.product_name
      }}</el-descriptions-item>
      <el-descriptions-item label="工序">{{
        report.process_step_name
      }}</el-descriptions-item>
      <el-descriptions-item label="操作人">{{
        report.creator_name
      }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{
        report.start_time
      }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{
        report.end_time || "-"
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(report.status)" size="small">{{
          getStatusText(report.status)
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="车间">{{
        report.workshop || "-"
      }}</el-descriptions-item>
    </el-descriptions>

    <div class="timeline" v-if="hasTimelineEvents">
      <h3>操作记录</h3>
      <el-timeline>
        <el-timeline-item
          v-if="report.start_time"
          :timestamp="report.start_time"
          type="primary"
        >
          开始工序
        </el-timeline-item>
        <el-timeline-item
          v-if="report.pause_time"
          :timestamp="report.pause_time"
          type="warning"
        >
          暂停工序
        </el-timeline-item>
        <el-timeline-item
          v-if="report.resume_time"
          :timestamp="report.resume_time"
          type="info"
        >
          恢复工序
        </el-timeline-item>
        <el-timeline-item
          v-if="report.end_time"
          :timestamp="report.end_time"
          type="success"
        >
          完成工序
        </el-timeline-item>
      </el-timeline>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  report: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible"]);

const dialogVisible = ref(false);
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

// 是否有时间线事件
const hasTimelineEvents = computed(() => {
  return (
    props.report.start_time ||
    props.report.pause_time ||
    props.report.resume_time ||
    props.report.end_time
  );
});

// 监听visible属性变化
watch(
  () => props.visible,
  val => {
    dialogVisible.value = val;
  }
);

// 监听dialogVisible变化，同步更新父组件的visible属性
watch(
  () => dialogVisible.value,
  val => {
    emit("update:visible", val);
  }
);

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case "in_progress":
      return "进行中";
    case "paused":
      return "已暂停";
    case "completed":
      return "已完成";
    default:
      return "未知状态";
  }
}

// 获取状态类型
function getStatusType(status) {
  switch (status) {
    case "in_progress":
      return "primary";
    case "paused":
      return "warning";
    case "completed":
      return "success";
    default:
      return "info";
  }
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false;
}
</script>

<style scoped>
.timeline {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .timeline {
    max-height: calc(100vh - 350px);
    overflow-y: auto;
  }
  
  :deep(.el-timeline-item__content) {
    font-size: 14px;
  }
  
  :deep(.el-timeline-item__timestamp) {
    font-size: 12px;
  }
  
  .dialog-footer {
    justify-content: center;
    width: 100%;
  }
}
</style>
