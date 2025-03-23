<template>
  <div class="maincontent">
    <!-- 筛选搜索区域 -->
    <div class="top">
      <el-form ref="formRef" :inline="true" :model="form" class="searchform">
        <el-form-item label="工艺编号：" prop="code">
          <el-input v-model="form.code" placeholder="请输入工艺编号" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="工艺名称：" prop="name">
          <el-input v-model="form.name" placeholder="请输入工艺名称" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="form.status" placeholder="请选择" clearable class="!w-[180px]">
            <el-option label="已启用" :value="1" />
            <el-option label="已禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">
            搜索
          </el-button>
          <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm(formRef)">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格数据区域 -->
    <div ref="tableContainer" class="table">
      <el-table :data="dataList" style="width: 100%; margin-bottom: 20px" :height="tableMaxHeight">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="code" label="工艺编号" align="center" />
        <el-table-column prop="name" label="工艺名称" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? "已启用" : "已禁用" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip />
        <el-table-column prop="create_time" label="创建时间" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" min-width="200px">
          <template #header>
            <el-button v-if="hasPermission('/api/production/process/:add')" type="primary" size="small" @click="handleCreate()">
              新增
            </el-button>
            <el-button v-if="hasPermission('/api/production/process/:delete')" type="danger" size="small" @click="handleBatchDelete()">
              批量删除
            </el-button>
          </template>
          <template #default="{ row }">
            <div class="ellink">
              <el-link v-if="hasPermission('/api/production/process/:change')" :underline="false" type="primary" @click="handleEdit(row)">
                编辑
              </el-link>
              <el-link v-if="hasPermission('/api/production/process_step/:list')" :underline="false" type="primary" @click="viewProcessSteps(row)">
                查看工序
              </el-link>
              <el-link v-if="hasPermission('/api/production/process/:delete')" :underline="false" type="danger" @click="handleDelete(row)">
                删除
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
    <!-- 工艺新建/编辑弹窗 -->
    <!-- 工艺新建/编辑弹窗 -->
    <process-dialog
      v-model:visible="isDialogVisible"
      :process="selectedProcess"
      :is-edit-mode="isEditMode"
      @update:visible="isDialogVisible = $event"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { getProcessList, createProcess, updateProcess, deleteProcess, batchDeleteProcess } from "@/api/production";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { initPermissions, hasPermission as checkPermission } from "@/api/routes";
import ProcessDialog from "./components/process-dialog.vue";
import { formatDateTime as formatDate } from "@/utils/formatTime"; // 添加时间格式化工具

const formRef = ref(null);
const router = useRouter(); // 添加这一行

defineOptions({
  name: "process"
});

// 时间格式化函数
const formatDateTime = (time) => {
  if (!time) return '';
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
};

// 筛选过滤器数据
const form = reactive({
  code: "",
  name: "",
  status: "",
  page: 1,
  limit: 10
});

const loading = ref(false);
const dataList = ref([]);
const total = ref(0);
const tableMaxHeight = ref(0); // 表格最大高度
const tableContainer = ref(null); // 表格容器
const multipleSelection = ref([]);

// 权限检查函数
const hasPermission = (permission: string): boolean => {
  return checkPermission(permission);
};

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
  form.page = 1;
  form.limit = 10;
  onSearch();
};

// 搜索数据函数
async function onSearch() {
  loading.value = true;
  try {
    const res = await getProcessList(form);
    dataList.value = res.data;
    total.value = res.total || 0;
    loading.value = false;
  } catch (error) {
    console.error("获取工艺列表失败:", error);
    message("获取工艺列表失败", { type: "error" });
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

// 编辑工艺点击事件函数
function handleEdit(row) {
  selectedProcess.value = { ...row };
  isEditMode.value = true;
  isDialogVisible.value = true;
}

// 新增工艺点击事件函数
function handleCreate() {
  // 新增工艺默认值
  selectedProcess.value = {
    code: "",
    name: "",
    status: 1,
    remark: ""
  };
  isEditMode.value = false;
  isDialogVisible.value = true;
}

// 删除工艺点击事件函数
function handleDelete(row) {
  ElMessageBox.confirm("工艺：" + row.name + " 将被永久删除，请谨慎操作！", "警告", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteProcess(row.id)
        .then(res => {
          onSearch();
          message(res.msg || "删除成功", { type: "success" });
        })
        .catch(error => {
          message("删除工艺失败", { type: "error" });
        });
    })
    .catch(() => {
      // 用户取消删除操作
    });
}

// 批量删除工艺
function handleBatchDelete() {
  if (multipleSelection.value.length === 0) {
    message("请至少选择一条记录", { type: "warning" });
    return;
  }
  
  const ids = multipleSelection.value.map(item => item.id);
  
  ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 条记录吗？`, "警告", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      batchDeleteProcess(ids)
        .then(res => {
          onSearch();
          message(res.msg || "批量删除成功", { type: "success" });
        })
        .catch(error => {
          console.error("批量删除工艺失败:", error);
          message("批量删除工艺失败", { type: "error" });
        });
    })
    .catch(() => {
      console.log("批量删除工艺", "已取消");
    });
}

// 查看工序
function viewProcessSteps(row) {
  // 跳转到工序管理页面，并传递工艺ID
  router.push({
    path: "/production/process-step",
    query: { processId: row.id }
  });
}

// 弹窗相关
const isDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedProcess = ref({});

// 编辑/新增工艺数据过滤函数
function processFilter(data) {
  const filteredData = { ...data };
  delete filteredData.id;
  
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
    const newdata = processFilter(data);
    
    updateProcess(id, newdata)
      .then(res => {
        onSearch();
        message(res.msg || "更新成功", { type: "success" });
        isDialogVisible.value = false;
      })
      .catch(error => {
        message("更新工艺失败", { type: "error" });
      });
  } else if (type === "create") {
    const newdata = processFilter(data);
    
    createProcess(newdata)
      .then(res => {
        onSearch();
        message(res.msg || "创建成功", { type: "success" });
        isDialogVisible.value = false;
      })
      .catch(error => {
        message("创建工艺失败", { type: "error" });
      });
  }
}

function handleCancel() {
  isDialogVisible.value = false;
}

onMounted(async () => {
  // 初始化权限信息
  await initPermissions();
  
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