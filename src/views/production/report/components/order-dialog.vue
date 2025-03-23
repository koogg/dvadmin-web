<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择生产工单"
    :width="isMobile ? '95%' : '800px'"
    :before-close="handleClose"
    :fullscreen="isMobile"
    :destroy-on-close="true"
  >
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入工单编号或产品名称"
        clearable
        class="search-input"
      >
        <template #append>
          <el-button :icon="Search" @click="filterOrders" />
        </template>
      </el-input>
    </div>

    <el-table
      :data="filteredOrders"
      style="width: 100%"
      :height="isMobile ? 'calc(100vh - 250px)' : '400px'"
      @row-click="handleRowClick"
      highlight-current-row
    >
      <el-table-column prop="order_number" label="工单编号" align="center" />
      <el-table-column
        prop="production_number"
        label="生产编号"
        align="center"
        v-if="!isMobile"
      />
      <el-table-column prop="product_name" label="产品名称" align="center" />
      <el-table-column prop="process_name" label="工艺" align="center" v-if="!isMobile" />
      <el-table-column prop="workshop" label="车间" align="center" v-if="!isMobile" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{
            getStatusText(row.status)
          }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedOrder"
          @click="handleConfirm"
        >
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "select", "cancel"]);

const dialogVisible = ref(false);
const searchKeyword = ref("");
const selectedOrder = ref(null);
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
      selectedOrder.value = null;
      searchKeyword.value = "";
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

// 过滤后的工单列表
const filteredOrders = computed(() => {
  if (!searchKeyword.value) {
    return props.orderList;
  }

  const keyword = searchKeyword.value.toLowerCase();
  return props.orderList.filter(
    order =>
      order.order_number.toLowerCase().includes(keyword) ||
      order.product_name.toLowerCase().includes(keyword)
  );
});

// 获取状态文本
function getStatusText(status) {
  // 如果状态已经是中文，直接返回
  if (
    status === "待生产" ||
    status === "生产中" ||
    status === "已完成" ||
    status === "已取消"
  ) {
    return status;
  }

  // 如果是英文状态码，转换为中文
  switch (status) {
    case "pending":
      return "待生产";
    case "in_progress":
      return "生产中";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return "未知状态";
  }
}

// 获取状态类型
function getStatusType(status) {
  // 根据中文或英文状态返回对应的类型
  if (status === "待生产" || status === "pending") {
    return "info";
  } else if (status === "生产中" || status === "in_progress") {
    return "primary";
  } else if (status === "已完成" || status === "completed") {
    return "success";
  } else if (status === "已取消" || status === "cancelled") {
    return "danger";
  } else {
    return "info";
  }
}

// 过滤工单
function filterOrders() {
  // 已通过计算属性实现
}

// 行点击事件
function handleRowClick(row) {
  selectedOrder.value = row;
}

// 确认按钮
function handleConfirm() {
  if (selectedOrder.value) {
    emit("select", selectedOrder.value);
    dialogVisible.value = false; // 添加这行，确保对话框关闭
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
.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .search-input {
    width: 100%;
  }
  
  .dialog-footer {
    justify-content: space-between;
    width: 100%;
  }
}
</style>
