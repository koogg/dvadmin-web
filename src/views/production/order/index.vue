<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <div class="top">
      <el-form ref="formRef" :inline="true" :model="form" class="searchform">
        <el-form-item label="工单编号：" prop="order_number">
          <el-input
            v-model="form.order_number"
            placeholder="请输入工单编号"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="产品名称：" prop="product_name">
          <el-input
            v-model="form.product_name"
            placeholder="请输入产品名称"
            clearable
            class="!w-[180px]"
          />
        </el-form-item>
        <el-form-item label="工艺：" prop="process">
          <el-select
            v-model="form.process"
            placeholder="请选择工艺"
            clearable
            class="!w-[180px]"
          >
            <el-option
              v-for="item in processList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择状态"
            clearable
            class="!w-[180px]"
          >
            <el-option label="待生产" value="待生产" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围：" prop="date_range">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="!w-[260px]"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="useRenderIcon('ri:search-line')"
            :loading="loading"
            @click="onSearch"
          >
            搜索
          </el-button>
          <el-button
            :icon="useRenderIcon('ri:refresh-line')"
            @click="resetForm(formRef)"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格数据区域 -->
    <div ref="tableContainer" class="table">
      <el-table
        :data="dataList"
        style="width: 100%; margin-bottom: 20px"
        :height="tableMaxHeight"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="order_number" label="工单编号" align="center" />
        <el-table-column
          prop="production_number"
          label="生产编号"
          align="center"
        />
        <el-table-column prop="product_name" label="产品名称" align="center" />
        <el-table-column prop="process_name" label="工艺" align="center" />
        <el-table-column prop="order_date" label="下单日期" align="center" />
        <el-table-column
          prop="planned_start_date"
          label="计划开始日期"
          align="center"
        />
        <el-table-column
          prop="planned_end_date"
          label="计划结束日期"
          align="center"
        />
        <el-table-column prop="workshop" label="车间" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)"
              >{{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          min-width="200px"
        >
          <template #header>
            <el-button
              v-if="hasPermission('/api/production/production_order/:add')"
              type="primary"
              size="small"
              @click="handleCreate()"
            >
              新增
            </el-button>
            <el-button
              v-if="hasPermission('/api/production/production_order/:cancel')"
              type="warning"
              size="small"
              @click="handleBatchCancel()"
            >
              批量取消
            </el-button>
          </template>
          <template #default="{ row }">
            <div class="ellink">
              <el-link
                v-if="hasPermission('/api/production/production_order/:change')"
                :underline="false"
                type="primary"
                @click="handleEdit(row)"
              >
                编辑
              </el-link>
              <el-link
                v-if="
                  row.status === '待生产' &&
                  hasPermission('/api/production/production_order/:cancel')
                "
                :underline="false"
                type="warning"
                @click="handleCancel(row)"
              >
                取消
              </el-link>
              <el-link
                v-if="hasPermission('/api/production/production_report/:add')"
                :underline="false"
                type="success"
                @click="startProduction(row)"
              >
                开始生产
              </el-link>
              <el-link
                v-if="hasPermission('/api/production/production_report/:list')"
                :underline="false"
                type="info"
                @click="viewReports(row)"
              >
                查看报工
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="form.page"
        v-model:page-size="form.limit"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 生产工单新建/编辑弹窗 -->
    <order-dialog
      v-model:visible="isDialogVisible"
      :order="selectedOrder"
      :is-edit-mode="isEditMode"
      :process-list="processList"
      @update:visible="isDialogVisible = $event"
      @save="handleSave"
      @cancel="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from "vue";
import { useRouter } from "vue-router";
import {
  getProductionOrderList,
  createProductionOrder,
  updateProductionOrder,
  cancelProductionOrder,
  batchCancelProductionOrder
} from "@/api/production";
import { getActiveProcesses } from "@/api/production";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  initPermissions,
  hasPermission as checkPermission
} from "@/api/routes";
import OrderDialog from "./components/order-dialog.vue";

const formRef = ref(null);
const router = useRouter();

defineOptions({
  name: "productionOrder"
});

// 日期范围
const dateRange = ref([]);

// 筛选过滤器数据
const form = reactive({
  order_number: "",
  product_name: "",
  process: "",
  status: "",
  start_date: "",
  end_date: "",
  page: 1,
  limit: 10
});

// 监听日期范围变化
watch(
  () => dateRange.value,
  val => {
    if (val && val.length === 2) {
      form.start_date = val[0];
      form.end_date = val[1];
    } else {
      form.start_date = "";
      form.end_date = "";
    }
  }
);

const loading = ref(false);
const dataList = ref([]);
const processList = ref([]);
const total = ref(0);
const tableMaxHeight = ref(0); // 表格最大高度
const tableContainer = ref(null); // 表格容器
const multipleSelection = ref([]);

// 权限检查函数
const hasPermission = (permission: string): boolean => {
  return checkPermission(permission);
};

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case "待生产":
      return "待生产";
    case "生产中":
      return "生产中";
    case "已完成":
      return "已完成";
    case "已取消":
      return "已取消";
    default:
      return "未知状态";
  }
}

// 获取状态类型
function getStatusType(status) {
  switch (status) {
    case "待生产":
      return "info";
    case "生产中":
      return "primary";
    case "已完成":
      return "success";
    case "已取消":
      return "danger";
    default:
      return "info";
  }
}

// 计算表格高度的函数
const calculateTableHeight = () => {
  nextTick(() => {
    if (tableContainer.value) {
      // 获取父容器的高度
      const parentHeight = tableContainer.value.clientHeight;
      tableMaxHeight.value = parentHeight - 60; // 设置表格最大高度，减去分页器高度
    }
  });
};

// 重置表单函数
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();
  dateRange.value = [];
  form.page = 1;
  form.limit = 10;
  onSearch();
};

// 加载工艺列表
async function loadProcessList() {
  try {
    const res = await getActiveProcesses();
    processList.value = res.data || [];
  } catch (error) {
    console.error("获取工艺列表失败:", error);
    message("获取工艺列表失败", { type: "error" });
  }
}

// 搜索数据函数
async function onSearch() {
  loading.value = true;
  try {
    const res = await getProductionOrderList(form);
    dataList.value = res.data || [];
    total.value = res.total || 0;
    loading.value = false;
  } catch (error) {
    console.error("获取生产工单列表失败:", error);
    message("获取生产工单列表失败", { type: "error" });
    loading.value = false;
  }
}

// 处理页码变化
function handleCurrentChange(val) {
  form.page = val;
  onSearch();
}

// 处理每页条数变化
function handleSizeChange(val) {
  form.limit = val;
  form.page = 1;
  onSearch();
}

// 多选变化事件
function handleSelectionChange(val) {
  multipleSelection.value = val;
}

// 编辑工单点击事件函数
function handleEdit(row) {
  selectedOrder.value = { ...row };
  isEditMode.value = true;
  isDialogVisible.value = true;
}

// 新增工单点击事件函数
function handleCreate() {
  // 新增工单默认值
  const today = new Date().toISOString().split("T")[0];
  selectedOrder.value = {
    order_date: today,
    order_number: "",
    production_number: "",
    product_name: "",
    process: "",
    planned_start_date: "",
    planned_end_date: "",
    workshop: "",
    status: "待生产"
  };
  isEditMode.value = false;
  isDialogVisible.value = true;
}

// 将第二个handleCancel函数重命名为closeDialog
function closeDialog() {
  isDialogVisible.value = false;
}

// 批量取消工单
function handleBatchCancel() {
  if (multipleSelection.value.length === 0) {
    message("请至少选择一条记录", { type: "warning" });
    return;
  }

  // 检查是否有不能取消的工单（已完成或已取消）
  const invalidOrders = multipleSelection.value.filter(
    item => item.status === "completed" || item.status === "cancelled"
  );

  if (invalidOrders.length > 0) {
    message("已完成或已取消的工单不能再次取消", { type: "warning" });
    return;
  }

  const ids = multipleSelection.value.map(item => item.id);

  ElMessageBox.confirm(`确定要取消选中的 ${ids.length} 条工单吗？`, "警告", {
    confirmButtonText: "确认取消",
    cancelButtonText: "返回",
    type: "warning"
  })
    .then(() => {
      batchCancelProductionOrder(ids)
        .then(res => {
          onSearch();
          message(res.msg || "批量取消成功", { type: "success" });
        })
        .catch(error => {
          console.error("批量取消工单失败:", error);
          message("批量取消工单失败", { type: "error" });
        });
    })
    .catch(() => {
      console.log("批量取消工单", "已取消");
    });
}

// 开始生产
function startProduction(row) {
  // 跳转到生产报工页面，并传递工单ID
  router.push({
    path: "/production/report",
    query: { orderId: row.id }
  });
}

// 查看报工
function viewReports(row) {
  // 跳转到生产报工页面，并传递工单ID和查看模式
  router.push({
    path: "/production/report",
    query: { orderId: row.id, mode: "view" }
  });
}

// 弹窗相关
const isDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref({});

// 编辑/新增工单数据过滤函数
function orderFilter(data) {
  const filteredData = { ...data };
  delete filteredData.id;
  delete filteredData.process_name;

  // 上传时将各种类型空值转化成NaN
  return Object.fromEntries(
    Object.entries(filteredData).map(([key, value]) => {
      return [key, isAllEmpty(value) ? NaN : value];
    })
  );
}

function handleSave(type, data) {
  if (type === "update") {
    const id = data.id;
    const newdata = orderFilter(data);

    updateProductionOrder(id, newdata)
      .then(res => {
        onSearch();
        message(res.msg || "更新成功", { type: "success" });
        isDialogVisible.value = false;
      })
      .catch(error => {
        message("更新工单失败", { type: "error" });
      });
  } else if (type === "create") {
    const newdata = orderFilter(data);

    createProductionOrder(newdata)
      .then(res => {
        onSearch();
        message(res.msg || "创建成功", { type: "success" });
        isDialogVisible.value = false;
      })
      .catch(error => {
        message("创建工单失败", { type: "error" });
      });
  }
}

onMounted(async () => {
  // 初始化权限信息
  await initPermissions();

  // 加载工艺列表
  await loadProcessList();

  // 计算表格高度的函数并挂载监听事件
  calculateTableHeight();
  window.addEventListener("resize", calculateTableHeight);

  // 初始化表格数据
  onSearch();
});

// 在组件卸载前移除监听器
onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateTableHeight);
});
</script>

<style lang="scss" scoped>
::v-deep(.el-table .cell) {
  overflow: hidden; // 溢出隐藏
  text-overflow: ellipsis; // 溢出用省略号显示
  white-space: nowrap; // 规定段落中的文本不进行换行
}

.maincontent {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 141px);
}

.searchform {
  background-color: var(--el-bg-color);

  .el-form-item {
    margin: 10px;
  }
}

.table {
  flex: 1;
  overflow: auto;
}

.ellink {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
