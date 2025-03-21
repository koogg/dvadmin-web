<template>
  <el-drawer
    v-model="drawerVisible"
    title="角色权限设置"
    direction="rtl"
    size="500px"
    :before-close="handleClose"
  >
    <!-- 移除 el-tabs，直接显示菜单权限树 -->
    <div v-if="menuList.length > 0">
      <el-tree
        ref="treeRef"
        :data="menuList"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedKeys"
        @check="handleCheck"
      />
    </div>
    <div v-else class="empty-data">
      <el-empty description="暂无菜单数据" />
    </div>

    <div class="drawer-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getMenuList } from "@/api/system";
import { message } from "@/utils/message";
import { handleTree } from "@/utils/tree";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:isVisible", "confirm"]);

const drawerVisible = ref(false);
const menuList = ref([]);
const checkedKeys = ref([]);
const defaultProps = {
  children: "children",
  label: "name"
};
const treeRef = ref(null);

// 监听isVisible属性变化
watch(
  () => props.isVisible,
  val => {
    drawerVisible.value = val;
    if (val && props.role.id) {
      loadMenuList();
    }
  }
);

// 监听drawerVisible变化，同步更新父组件的isVisible属性
watch(
  () => drawerVisible.value,
  val => {
    emit("update:isVisible", val);
  }
);

// 加载菜单列表
const loadMenuList = async () => {
  try {
    const res = await getMenuList();
    if (res.success) {
      // 使用handleTree处理菜单数据，确保树形结构正确
      menuList.value = handleTree(res.data, "id", "parent", "children");
      // 设置已选中的菜单
      if (props.role.menu) {
        checkedKeys.value = props.role.menu;
      } else {
        checkedKeys.value = [];
      }
    }
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    message("获取菜单列表失败", { type: "error" });
  }
};

// 树节点选择事件
const handleCheck = (data, checked) => {
  console.log("选中的节点:", checked.checkedKeys);
  checkedKeys.value = checked.checkedKeys;
};

// 关闭抽屉
const handleClose = () => {
  drawerVisible.value = false;
};

// 确认按钮点击事件
const handleConfirm = () => {
  const updateData = {
    menu: checkedKeys.value
  };
  emit("confirm", props.role.id, updateData);
  drawerVisible.value = false;
};
</script>

<style scoped>
.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.drawer-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
