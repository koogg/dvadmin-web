<template>
  <el-dialog
    v-model="dialogVisible"
    title="设置数据权限"
    width="500px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="角色名称">
        <el-input v-model="form.name" disabled />
      </el-form-item>
      <el-form-item label="数据权限">
        <el-select
          v-model="form.data_permission"
          placeholder="请选择数据权限"
          style="width: 100%"
        >
          <el-option
            v-for="item in dataPermissionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  getDataPermissionOptions,
  getRoleDataPermission,
  updateRoleDataPermission
} from "@/api/system";
import { message } from "@/utils/message";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible", "success"]);

const dialogVisible = ref(false);
const dataPermissionOptions = ref([]);
const form = ref({
  id: "",
  name: "",
  data_permission: 0
});

// 监听visible属性变化
watch(
  () => props.visible,
  val => {
    dialogVisible.value = val;
    if (val && props.role.id) {
      loadRoleDataPermission();
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

// 监听role属性变化
watch(
  () => props.role,
  val => {
    if (val && val.id) {
      form.value.id = val.id;
      form.value.name = val.name;
    }
  },
  { immediate: true }
);

// 加载数据权限选项
const loadDataPermissionOptions = async () => {
  try {
    const res = await getDataPermissionOptions();
    if (res.success) {
      dataPermissionOptions.value = res.data;
    }
  } catch (error) {
    console.error("获取数据权限选项失败:", error);
    message("获取数据权限选项失败", { type: "error" });
  }
};

// 加载角色的数据权限信息
const loadRoleDataPermission = async () => {
  try {
    const res = await getRoleDataPermission(props.role.id);
    if (res.success) {
      form.value.data_permission = res.data.data_permission;
    }
  } catch (error) {
    console.error("获取角色数据权限信息失败:", error);
    message("获取角色数据权限信息失败", { type: "error" });
  }
};

// 确认按钮点击事件
const handleConfirm = async () => {
  try {
    const res = await updateRoleDataPermission(form.value.id, {
      data_permission: form.value.data_permission
    });
    if (res.success) {
      message(res.msg || "更新数据权限成功", { type: "success" });
      emit("success");
      dialogVisible.value = false;
    }
  } catch (error) {
    console.error("更新数据权限失败:", error);
    message("更新数据权限失败", { type: "error" });
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

onMounted(() => {
  loadDataPermissionOptions();
});
</script>
