<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <div class="top">
      <el-form ref="formRef" :inline="true" :model="form" class="searchform">
        <el-form-item label="工单编号：" prop="production_order_number">
          <el-input
            v-model="form.production_order_number"
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
        <el-form-item label="状态：" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择状态"
            clearable
            class="!w-[180px]"
          >
            <el-option label="进行中" value="in_progress" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已完成" value="completed" />
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
            @change="handleDateRangeChange"
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
          <el-button
            type="success"
            :icon="useRenderIcon('ri:add-line')"
            @click="handleStartProduction"
          >
            新增报工
          </el-button>
        </el-form-item>
      </el-form>
    </div>


    <!-- 表格区域 -->
    <div class="table" ref="tableContainer" style="height: calc(100% - 20px);">
      <div class="table-header">
        <div />
        <div class="refresh-button">
          <el-button
            size="small"
            type="info"
            plain
            :icon="useRenderIcon('ri:refresh-line')"
            @click="onSearch"
          >
            刷新数据
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="dataList"
        border
        style="width: 100%; margin-bottom: 20px"
        :height="isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 220px)'"
      >
        <el-table-column
          prop="production_order_number"
          label="工单编号"
          align="center"
          :min-width="isMobile ? 100 : 120"
        />
        <el-table-column
          prop="production_number"
          label="生产编号"
          align="center"
          :min-width="isMobile ? 100 : 120"
          v-if="!isMobile"
        />
        <el-table-column
          prop="product_name"
          label="产品名称"
          align="center"
          :min-width="isMobile ? 120 : 150"
        />
        <el-table-column
          prop="process_step_name"
          label="工序"
          align="center"
          :min-width="isMobile ? 80 : 100"
        />
        <el-table-column
          prop="start_time"
          label="开始时间"
          align="center"
          :min-width="isMobile ? 140 : 150"
          v-if="!isMobile"
        />
        <el-table-column
          prop="end_time"
          label="结束时间"
          align="center"
          :min-width="isMobile ? 140 : 150"
          v-if="!isMobile"
        />
        <el-table-column
          prop="operator_username"
          label="操作人"
          align="center"
          :min-width="isMobile ? 80 : 100"
          v-if="!isMobile"
        />
        <el-table-column
          prop="status"
          label="状态"
          align="center"
          :min-width="isMobile ? 80 : 100"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)" size="small">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          :min-width="isMobile ? 120 : 200"
        >
          <template #header>
            <el-button
              type="primary"
              size="small"
              @click="handleStartProduction"
            >
              新增
            </el-button>
          </template>
          <template #default="{ row }">
            <div class="ellink">
              <!-- 移动端显示图标按钮 -->
              <template v-if="isMobile">
                <el-button
                  v-if="!row.end_time"
                  type="warning"
                  size="small"
                  circle
                  :icon="useRenderIcon('ri:pause-line')"
                  @click="handlePause(row)"
                />
                <el-button
                  v-if="row.pause_time && !row.resume_time && !row.end_time"
                  type="primary"
                  size="small"
                  circle
                  :icon="useRenderIcon('ri:play-line')"
                  @click="handleResume(row)"
                />
                <el-button
                  v-if="!row.end_time"
                  type="success"
                  size="small"
                  circle
                  :icon="useRenderIcon('ri:check-line')"
                  @click="handleComplete(row)"
                />
                <el-button
                  type="info"
                  size="small"
                  circle
                  :icon="useRenderIcon('ri:more-fill')"
                  @click="viewDetail(row)"
                />
              </template>

              <!-- 桌面端显示文本链接 -->
              <template v-else>
                <el-link
                  v-if="!row.end_time"
                  :underline="false"
                  type="warning"
                  @click="handlePause(row)"
                >
                  暂停
                </el-link>
                <el-link
                  v-if="row.pause_time && !row.resume_time && !row.end_time"
                  :underline="false"
                  type="primary"
                  @click="handleResume(row)"
                >
                  恢复
                </el-link>
                <el-link
                  v-if="!row.end_time"
                  :underline="false"
                  type="success"
                  @click="handleComplete(row)"
                >
                  完成
                </el-link>
                <el-link
                  v-if="hasPermission('/api/production/production_report/:list')"
                  :underline="false"
                  type="info"
                  @click="viewDetail(row)"
                >
                  详情
                </el-link>
                <el-link
                  v-if="canShowDeleteButton(row) && hasPermission('/api/production/production_report/:delete')"
                  :underline="false"
                  type="danger"
                  @click="handleDelete(row)"
                >
                  删除
                </el-link>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 对话框组件 -->
    <order-dialog
      v-model:visible="isOrderDialogVisible"
      :order-list="orderList"
      @select="handleOrderSelected"
    />

    <report-dialog
      v-model:visible="isReportDialogVisible"
      :order="selectedOrder"
      :process-step-list="processStepList"
      @start="handleStartProcessStep"
    />

    <report-detail-dialog
      v-model:visible="isDetailDialogVisible"
      :report="selectedReport"
    />

    <!-- 移动端底部操作栏 -->
    <div v-if="isMobile" class="mobile-footer">
      <el-button
        type="primary"
        class="add-button"
        @click="handleStartProduction"
      >
        新增报工
      </el-button>
    </div>
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
  nextTick,
  computed
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNav } from "@/layout/hooks/useNav";
import {
  getProductionReportList,
  getMyReports,
  createProductionReport,
  pauseProcessStep,
  resumeProcessStep,
  completeProcessStep,
  getProductionReportStatistics,
  deleteProductionReport
} from "@/api/production";
import { getStepsByProcess } from "@/api/production";
import { getOrdersByWorkshop } from "@/api/production";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  initPermissions,
  hasPermission as checkPermission
} from "@/api/routes";
import OrderDialog from "./components/order-dialog.vue";
import ReportDialog from "./components/report-dialog.vue";
import ReportDetailDialog from "./components/report-detail-dialog.vue";

const formRef = ref(null);
const route = useRoute();
const router = useRouter();

defineOptions({
  name: "productionReport"
});

// 日期范围 - 使用显式类型并初始化为空数组
const dateRange = ref<Array<string>>([]);

// 筛选过滤器数据
const form = reactive({
  production_order_number: "",
  product_name: "",
  status: "",
  start_date: "",
  end_date: "",
  page: 1,
  limit: 10
});

// 简化的日期处理函数
function handleDateRangeChange(val: any) {
  console.log("日期范围变化:", val);

  // 重置日期
  form.start_date = "";
  form.end_date = "";

  // 安全地设置日期
  if (val && Array.isArray(val) && val.length >= 2) {
    form.start_date = val[0] || "";
    form.end_date = val[1] || "";
  }
}

const loading = ref(false);
const dataList = ref([]);
const total = ref(0);
const tableContainer = ref(null);

// 统计数据
const showStatistics = ref(true);
const statistics = ref({
  total_reports: 0,
  completed_reports: 0,
  in_progress_reports: 0,
  paused_reports: 0,
  total_hours: 0,
  workshop_stats: [],
  daily_stats: []
});

// 工单和工序数据
const orderId = computed(() => route.query.orderId as string);
const viewMode = computed(() => route.query.mode === "view");
const orderList = ref([]);
const processStepList = ref([]);

// 对话框控制变量
const isOrderDialogVisible = ref(false);
const isReportDialogVisible = ref(false);
const isDetailDialogVisible = ref(false);
const selectedOrder = ref(null);
const selectedReport = ref(null);

// 新增一个权限初始化状态标志
const permissionsInitialized = ref(false);

// 修改权限检查函数
const hasPermission = permission => {
  // 如果权限未初始化，则记录警告并继续
  if (!permissionsInitialized.value) {
    console.warn(`权限检查: ${permission}, 但权限尚未初始化`);
  }

  // 检查权限，简化逻辑
  return checkPermission(permission);
};

// 获取状态文本
function getStatusText(status) {
  // 防御检查，如果status为空则返回未知状态
  if (!status) {
    return "未知状态";
  }

  // 如果传入的是行对象，直接根据时间字段判断
  if (typeof status === 'object') {
    // 有结束时间，说明已完成
    if (status.end_time) {
      return "已完成";
    }
    // 有暂停时间，但没有恢复时间，说明是已暂停
    if (status.pause_time && !status.resume_time) {
      return "已暂停";
    }
    // 只有开始时间或有恢复时间，说明是进行中
    if (status.start_time) {
      return "进行中";
    }
    return "未知状态";
  }

  // 以下是处理直接传入状态字符串的情况
  switch (status) {
    case "in_progress":
    case "进行中":
      return "进行中";
    case "paused":
    case "已暂停":
      return "已暂停";
    case "completed":
    case "已完成":
      return "已完成";
    case "pending":
    case "待生产":
      return "待生产";
    default:
      return "未知状态";
  }
}

// 获取状态类型
function getStatusType(status) {
  // 如果传入的是行对象，直接根据时间字段判断
  if (typeof status === 'object') {
    // 有结束时间，说明已完成
    if (status.end_time) {
      return "success";
    }
    // 有暂停时间，但没有恢复时间，说明是已暂停
    if (status.pause_time && !status.resume_time) {
      return "warning";
    }
    // 只有开始时间或有恢复时间，说明是进行中
    if (status.start_time) {
      return "primary";
    }
    return "info";
  }

  // 以下是处理直接传入状态字符串的情况
  switch (status) {
    case "in_progress":
    case "进行中":
      return "primary";
    case "paused":
    case "已暂停":
      return "warning";
    case "completed":
    case "已完成":
      return "success";
    case "pending":
    case "待生产":
      return "info";
    default:
      return "info";
  }
}

// 根据状态判断按钮显示
function canShowPauseButton(row) {
  // 修改逻辑：只要有开始时间且没有结束时间就显示暂停按钮，无论是否已暂停
  const hasStartTime = Boolean(row.start_time);
  const hasEndTime = Boolean(row.end_time);

  // 已完成的不显示暂停按钮
  if (hasEndTime) return false;

  // 其他情况只要有开始时间就显示暂停按钮，不管是否已暂停
  return hasStartTime;
}

function canShowResumeButton(row) {
  // 正常逻辑：仅已暂停状态显示恢复按钮
  // 已暂停状态：有暂停时间，但没有最新的恢复时间和结束时间
  const hasPauseTime = Boolean(row.pause_time);
  const hasResumeTime = Boolean(row.resume_time);
  const hasEndTime = Boolean(row.end_time);

  // 已完成的不显示恢复按钮
  if (hasEndTime) return false;

  // 如果有暂停时间但没有恢复时间，说明是已暂停状态，显示恢复按钮
  return hasPauseTime && !hasResumeTime;
}

function canShowCompleteButton(row) {
  // 修改逻辑：只要有开始时间且没有结束时间就显示完成按钮
  const hasStartTime = Boolean(row.start_time);
  const hasEndTime = Boolean(row.end_time);

  // 已完成的不显示完成按钮
  if (hasEndTime) return false;

  // 所有未完成的任务（进行中或已暂停）都显示完成按钮
  return hasStartTime;
}

function canShowDeleteButton(row) {
  // 正常逻辑：已完成状态不显示删除按钮
  const hasEndTime = Boolean(row.end_time);

  // 已完成的不显示删除按钮
  return !hasEndTime;
}

// 单独提取数据加载逻辑到独立函数
async function initData() {
  try {
    console.log("开始加载数据...");

    // 加载工单列表
    await loadOrderList();

    // 如果有工单ID，加载该工单对应工艺的工序列表
    if (orderId.value) {
      const order = orderList.value.find(item => item.id === orderId.value);
      if (order && order.process) {
        await loadProcessStepList(order.process);
      }
    }

    // 加载报工数据，无论是移动端还是桌面端，都加载
    await onSearch();

    // 手动检查一下关键权限，确保UI能正确显示
    console.log("数据加载完成，权限检查完毕");
  } catch (error) {
    console.error("数据加载失败:", error);
    message("数据加载失败", { type: "error" });
  }
}

// 添加加载我的报工记录的函数
async function loadMyReports() {
  loading.value = true;
  try {
    console.log("加载我的报工记录...");
    const res = await getMyReports({
      page: form.page,
      limit: form.limit
    });

    // 确保正确解析返回的数据
    if (res && res.success) {
      // 格式化时间字段
      dataList.value = formatDateFields(res.data || []);
      total.value = res.total || 0;

      // 打印返回的数据，用于调试
      console.log(`我的报工数据数量: ${dataList.value.length}`);
    } else {
      message(res?.msg || "获取我的报工记录失败", { type: "error" });
      dataList.value = [];
      total.value = 0;
    }

    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error("加载我的报工记录失败:", error);
    message("加载我的报工记录失败", { type: "error" });
  }
}

// 修改onSearch函数来支持移动端
async function onSearch() {
  loading.value = true;
  try {
    console.log("开始搜索报工数据...");
    // 如果URL中有orderId参数，优先使用它
    let res;
    if (orderId.value) {
      console.log(`搜索特定工单的报工记录，工单ID: ${orderId.value}`);
      // 获取特定工单的报工记录
      res = await getProductionReportList({
        ...form,
        production_order: orderId.value
      });
    } else {
      // 无论是移动端还是桌面端，都加载报工记录
      console.log("搜索我的报工记录");
      res = await getMyReports(form);
    }

    // 打印原始返回数据
    console.log("API返回数据:", res);

    // 确保我们正确解析返回的数据
    if (res && res.success) {
      // 格式化时间字段
      dataList.value = formatDateFields(res.data || []);
      total.value = res.total || 0;

      // 打印返回的数据，用于调试
      console.log(`报工数据数量: ${dataList.value.length}`);

      // 检查状态值
      if (dataList.value.length > 0) {
        dataList.value.forEach(item => {
          const status = getActualStatus(item);
          console.log(`工单 ${item.production_order_number} 工序 ${item.process_step_name} 计算状态: ${status}`);
        });
      } else {
        console.log("没有找到任何报工数据");
      }
    } else {
      message(res?.msg || "获取报工记录失败", { type: "error" });
      dataList.value = [];
      total.value = 0;
    }

    // 加载统计数据
    if (showStatistics.value) {
      await loadStatistics();
    }

    loading.value = false;
  } catch (error) {
    console.error("获取生产报工列表失败:", error);
    message("获取生产报工列表失败", { type: "error" });
    loading.value = false;
    dataList.value = [];
    total.value = 0;
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

// 开始生产
function handleStartProduction() {
  loading.value = true;
  loadOrderList().then(() => {
    loading.value = false;
    isOrderDialogVisible.value = true;
  }).catch(error => {
    loading.value = false;
    console.error("获取工单列表失败:", error);
    message("获取工单列表失败", { type: "error" });
  });
}

// 选择工单后的回调
function handleOrderSelected(order) {
  console.log("选择的工单:", order);
  selectedOrder.value = order;
  isOrderDialogVisible.value = false;

  // 加载该工单对应工艺的工序列表
  if (order.process) {
    loading.value = true;
    loadProcessStepList(order.process).then(() => {
      loading.value = false;
      // 加载完工序列表后再打开工序选择对话框
      isReportDialogVisible.value = true;
    }).catch(error => {
      loading.value = false;
      console.error("获取工序列表失败:", error);
      message("获取工序列表失败", { type: "error" });
    });
  } else {
    message("选择的工单没有关联的工艺！", { type: "warning" });
  }
}

// 获取用户信息
const { username } = useNav();

// 开始生产工序
async function handleStartProcessStep(processStep) {
  try {
    if (!selectedOrder.value.id || !processStep.id) {
      message("请选择有效的工单和工序", { type: "warning" });
      return;
    }

    loading.value = true;

    // 获取当前时间，格式化为YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const startTime = now.toISOString().slice(0, 19).replace('T', ' ');

    // 创建报工数据
    const data = {
      production_order: selectedOrder.value.id,
      process_step: processStep.id,
      operator_username: username.value, // 使用当前登录用户名
      start_time: startTime,
      status: "in_progress" // 添加状态字段
    };

    const res = await createProductionReport(data);

    loading.value = false;

    if (res.success) {
      isReportDialogVisible.value = false;
      message(res.msg || "工序已开始", { type: "success" });
      // 刷新数据
      await onSearch();
    } else {
      message(res.msg || "开始工序失败", { type: "error" });
    }
  } catch (error) {
    loading.value = false;
    console.error("开始工序失败:", error);
    message("开始工序失败", { type: "error" });
  }
}

// 查看详情
function viewDetail(row) {
  selectedReport.value = row;
  isDetailDialogVisible.value = true;
}

// 暂停工序
async function handlePause(row) {
  console.log("暂停工序，当前行数据:", row);
  try {
    await ElMessageBox.confirm("确定要暂停该工序吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;

    // 检查报工记录ID是否存在
    if (!row.id) {
      throw new Error("报工记录ID不存在");
    }

    console.log(`发送暂停请求，ID: ${row.id}`);
    
    // 发送暂停请求，捕获并处理可能的错误
    try {
      const res = await pauseProcessStep(row.id);
      console.log("API响应:", res);
      
      if (res && res.success) {
        message(res.msg || "工序已暂停", { type: "success" });
        // 更新列表数据
        await onSearch();
      } else {
        // 处理API返回的错误信息
        const errorMsg = res?.msg || "暂停工序失败";
        console.error("API错误:", errorMsg);
        message(errorMsg, { type: "error" });
        
        // 如果是特定错误（记录不存在），尝试刷新数据
        if (errorMsg.includes("No ProductionReport matches")) {
          console.log("报工记录不存在，刷新数据列表");
          await onSearch();
        }
      }
    } catch (apiError) {
      console.error("API调用异常:", apiError);
      message("API调用失败: " + (apiError.message || String(apiError)), { type: "error" });
    }
    
    loading.value = false;
  } catch (error) {
    loading.value = false;
    if (error !== "cancel") {
      console.error("暂停工序失败:", error);
      message("暂停工序失败: " + (error.message || String(error)), { type: "error" });
    }
  }
}

// 恢复工序
async function handleResume(row) {
  try {
    await ElMessageBox.confirm("确定要恢复该工序吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;

    // 检查报工记录ID是否存在
    if (!row.id) {
      throw new Error("报工记录ID不存在");
    }

    console.log(`发送恢复请求，ID: ${row.id}`);
    
    try {
      const res = await resumeProcessStep(row.id);
      console.log("API响应:", res);
      
      if (res && res.success) {
        message(res.msg || "工序已恢复", { type: "success" });
        // 更新列表数据
        await onSearch();
      } else {
        // 处理API返回的错误信息
        const errorMsg = res?.msg || "恢复工序失败";
        console.error("API错误:", errorMsg);
        message(errorMsg, { type: "error" });
        
        // 如果是特定错误（记录不存在），尝试刷新数据
        if (errorMsg.includes("No ProductionReport matches")) {
          console.log("报工记录不存在，刷新数据列表");
          await onSearch();
        }
      }
    } catch (apiError) {
      console.error("API调用异常:", apiError);
      message("API调用失败: " + (apiError.message || String(apiError)), { type: "error" });
    }
    
    loading.value = false;
  } catch (error) {
    loading.value = false;
    if (error !== "cancel") {
      console.error("恢复工序失败:", error);
      message("恢复工序失败: " + (error.message || String(error)), { type: "error" });
    }
  }
}

// 完成工序
async function handleComplete(row) {
  try {
    await ElMessageBox.confirm("确定要完成该工序吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;

    // 检查报工记录ID是否存在
    if (!row.id) {
      throw new Error("报工记录ID不存在");
    }

    console.log(`发送完成请求，ID: ${row.id}`);
    
    try {
      const res = await completeProcessStep(row.id);
      console.log("API响应:", res);
      
      if (res && res.success) {
        message(res.msg || "工序已完成", { type: "success" });
        // 更新列表数据
        await onSearch();
      } else {
        // 处理API返回的错误信息
        const errorMsg = res?.msg || "完成工序失败";
        console.error("API错误:", errorMsg);
        message(errorMsg, { type: "error" });
        
        // 如果是特定错误（记录不存在），尝试刷新数据
        if (errorMsg.includes("No ProductionReport matches")) {
          console.log("报工记录不存在，刷新数据列表");
          await onSearch();
        }
      }
    } catch (apiError) {
      console.error("API调用异常:", apiError);
      message("API调用失败: " + (apiError.message || String(apiError)), { type: "error" });
    }
    
    loading.value = false;
  } catch (error) {
    loading.value = false;
    if (error !== "cancel") {
      console.error("完成工序失败:", error);
      message("完成工序失败: " + (error.message || String(error)), { type: "error" });
    }
  }
}

// 修改报工记录
async function handleEdit(row) {
  try {
    // 这里可以打开编辑对话框或跳转到编辑页面
    // 暂时使用提示信息
    message("修改功能待实现", { type: "info" });
    // TODO: 实现修改功能
  } catch (error) {
    console.error("修改报工记录失败:", error);
    message("修改报工记录失败", { type: "error" });
  }
}

// 删除报工记录
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm("确定要删除该报工记录吗?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    loading.value = true;
    // 调用删除API
    const res = await deleteProductionReport(row.id);
    loading.value = false;

    if (res && res.success) {
      message(res.msg || "报工记录已删除", { type: "success" });
      // 更新列表数据
      await onSearch();
    } else {
      message(res?.msg || "删除失败", { type: "error" });
    }
  } catch (error) {
    loading.value = false;
    if (error !== "cancel") {
      console.error("删除报工记录失败:", error);
      message("删除报工记录失败", { type: "error" });
    }
  }
}

// 重置表单函数
const resetForm = formEl => {
  if (!formEl) return;
  formEl.resetFields();

  // 重置日期范围
  dateRange.value = [];
  form.start_date = "";
  form.end_date = "";

  form.page = 1;
  form.limit = 10;
  onSearch();
};

// 检测是否为移动设备
const isMobile = ref(false);

// 检测设备类型的函数 - 增强版
const checkDevice = () => {
  const width = window.innerWidth;
  isMobile.value = width <= 768;
  console.log(`设备宽度: ${width}px, 是否移动设备: ${isMobile.value}`);

  // 设备类型变化时尝试刷新数据
  if (dataList.value.length === 0) {
    console.log("检测到移动设备且数据为空，尝试加载数据");
    onSearch();
  }
};

// 计算表格高度的函数
const calculateTableHeight = () => {
  nextTick(() => {
    if (tableContainer.value) {
      // 获取父容器的高度
      const parentHeight = tableContainer.value.clientHeight;
      // 如果显示统计卡片，需要减去卡片高度
      const statisticsHeight = showStatistics.value ? 150 : 0;
      tableMaxHeight.value = parentHeight - 60 - statisticsHeight; // 设置表格最大高度，减去分页器高度和统计卡片高度
    }
  });
};

// 定义错误处理函数
const handleDateRangeError = event => {
  if (event.error && event.error.toString().includes("Cannot read properties of undefined")) {
    console.warn("检测到undefined访问错误，确保dateRange为数组");
    if (!Array.isArray(dateRange.value)) {
      dateRange.value = [];
    }
  }
};

// 加载统计数据
async function loadStatistics() {
  try {
    const params = {
      start_date: form.start_date || "",
      end_date: form.end_date || "",
      workshop: ""
    };

    const res = await getProductionReportStatistics(params);
    if (res && res.data) {
      statistics.value = res.data;
    } else {
      statistics.value = {
        total_reports: 0,
        completed_reports: 0,
        in_progress_reports: 0,
        paused_reports: 0,
        total_hours: 0,
        workshop_stats: [],
        daily_stats: []
      };
    }
  } catch (error) {
    console.error("获取统计数据失败:", error);
    // 设置默认统计数据
    statistics.value = {
      total_reports: 0,
      completed_reports: 0,
      in_progress_reports: 0,
      paused_reports: 0,
      total_hours: 0,
      workshop_stats: [],
      daily_stats: []
    };
  }
}

// 加载工单列表
async function loadOrderList() {
  try {
    // 获取状态为待生产和生产中的工单
    const res = await getOrdersByWorkshop("", "待生产,生产中");
    orderList.value = res.data || [];
  } catch (error) {
    console.error("获取工单列表失败:", error);
  }
}

// 加载工序列表
async function loadProcessStepList(processId) {
  if (!processId) return;

  try {
    const res = await getStepsByProcess(processId);
    processStepList.value = res.data || [];
  } catch (error) {
    console.error("获取工序列表失败:", error);
  }
}

// 修改时间字段格式化来确保兼容性
function formatDateFields(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(item => {
    // 确保所有时间字段都有合适的格式
    if (item.start_time && typeof item.start_time === 'string') {
      // 确保是标准格式
      item.start_time = item.start_time.trim();
    }

    if (item.pause_time && typeof item.pause_time === 'string') {
      item.pause_time = item.pause_time.trim();
    }

    if (item.resume_time && typeof item.resume_time === 'string') {
      item.resume_time = item.resume_time.trim();
    }

    if (item.end_time && typeof item.end_time === 'string') {
      item.end_time = item.end_time.trim();
    }

    return item;
  });
}

// 添加getActualStatus函数
function getActualStatus(row) {
  // 有结束时间，说明已完成
  if (row.end_time) {
    return 'completed';
  }
  // 有恢复时间，说明是进行中
  if (row.resume_time) {
    return 'in_progress';
  }
  // 有暂停时间，但没有恢复时间，说明是已暂停
  if (row.pause_time && !row.resume_time) {
    return 'paused';
  }
  // 只有开始时间，说明是进行中
  if (row.start_time) {
    return 'in_progress';
  }
  // 默认状态（未知）
  return null;
}

onMounted(async () => {
  try {
    console.log("组件正在挂载...");

    // 确保dateRange总是有效数组
    if (!Array.isArray(dateRange.value)) {
      console.warn("dateRange不是数组，正在重置为空数组");
      dateRange.value = [];
    }

    // 确保其他关键引用类型已初始化
    if (!dataList.value) dataList.value = [];

    // 添加错误处理函数，捕获可能的错误
    window.addEventListener("error", handleDateRangeError);

    // 立即检测设备类型并设置响应式布局
    checkDevice();

    // 注册事件监听器
    window.addEventListener("resize", checkDevice);
    window.addEventListener("resize", calculateTableHeight);

    // 先初始化权限，然后再加载数据
    console.log("初始化权限中...");
    try {
      await initPermissions();
      permissionsInitialized.value = true;
      console.log("权限初始化完成");
      
      // 权限初始化后，检查新增按钮权限
      const addPerm = hasPermission('/api/production/production_report/:add');
      console.log("新增报工权限: ", addPerm);
    } catch (error) {
      console.error("权限初始化失败:", error);
      permissionsInitialized.value = true;
    }

    // 延迟加载数据
    setTimeout(() => {
      initData();

      // 确保移动端数据加载
      if (isMobile.value && dataList.value.length === 0) {
        console.log("移动端环境，确保数据加载");
        loadMyReports();
      }
    }, 200);
  } catch (error) {
    console.error("组件挂载错误:", error);
    // 确保基本变量已初始化
    dateRange.value = [];
    dataList.value = [];
  }
});

// 在组件卸载前移除监听器
onBeforeUnmount(() => {
  // 确保这些代码在组件实例存在的情况下执行
  window.removeEventListener("resize", calculateTableHeight);
  window.removeEventListener("resize", checkDevice);

  // 移除我们添加的错误处理监听器
  window.removeEventListener("error", handleDateRangeError);
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

.statistics-cards {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;

    .number {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-color-primary);
      margin-right: 5px;
    }

    .unit {
      font-size: 14px;
      color: #909399;
    }
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

// 移动端适配样式
@media screen and (max-width: 768px) {
  .maincontent {
    height: calc(100vh - 100px);
  }

  .searchform {
    .el-form-item {
      margin: 5px;
      width: 100%;
    }
  }

  .el-form {
    display: flex;
    flex-direction: column;

    :deep(.el-form-item) {
      width: 100% !important;
      margin-right: 0;

      .el-input,
      .el-select,
      .el-date-editor {
        width: 100% !important;
      }
    }

    :deep(.el-form-item__content) {
      flex-wrap: wrap;
      justify-content: space-between;

      .el-button {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  }

  .ellink {
    flex-direction: column;
    gap: 5px;
    align-items: center;

    .el-link {
      font-size: 14px;
      margin: 2px 0;
    }
  }

  // 移动端下表格操作列样式
  :deep(.el-table) {
    .cell {
      padding: 5px !important;
    }

    .el-button {
      font-size: 12px;
      padding: 5px 10px;
    }
  }

  // 移动端底部操作栏样式
  .mobile-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    background-color: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    z-index: 100;

    .add-button {
      width: 90%;
      font-size: 16px;
      padding: 10px;
    }
  }

  // 为底部留出空间
  .maincontent {
    padding-bottom: 6px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.refresh-button {
  text-align: right;
}
</style>

