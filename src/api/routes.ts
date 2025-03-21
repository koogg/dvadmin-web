import { http } from "@/utils/http";
import { useUserStoreHook } from "@/store/modules/user";

type Result = {
  success: boolean;
  data: Array<any>;
  msg: string;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "api/system/asyncroutes/");
};

// 存储当前用户的权限列表
let userPermissions: string[] = [];

// 从路由数据中提取权限信息
export const extractPermissions = (routes: any[]): string[] => {
  let permissions: string[] = [];
  
  const extractFromRoute = (route: any) => {
    // 提取当前路由的权限
    if (route.meta?.auths && Array.isArray(route.meta.auths)) {
      permissions = [...permissions, ...route.meta.auths];
    }
    
    // 递归提取子路由的权限
    if (route.children && Array.isArray(route.children)) {
      route.children.forEach(extractFromRoute);
    }
  };
  
  routes.forEach(extractFromRoute);
  return permissions;
};

// 初始化权限信息
export const initPermissions = async (): Promise<string[]> => {
  try {
    const res = await getAsyncRoutes();
    if (res.success && Array.isArray(res.data)) {
      userPermissions = extractPermissions(res.data);
      
      // 将提取的权限同步到用户store中
      const userStore = useUserStoreHook();
      if (userStore && userStore.SET_AUTHS) {
        userStore.SET_AUTHS(userPermissions);
      }
      
      return userPermissions;
    }
    return [];
  } catch (error) {
    console.error("初始化权限信息失败:", error);
    return [];
  }
};

// 检查是否有指定权限
export const hasPermission = (permission: string): boolean => {
  // 优先从store中获取权限，如果store中没有，则使用本地缓存的权限
  const userStore = useUserStoreHook();
  const storeAuths = userStore?.auths || [];
  
  const allPerms = storeAuths.length > 0 ? storeAuths : userPermissions;
  
  // 如果权限列表为空，返回false
  if (!allPerms || allPerms.length === 0) return false;
  
  // 检查是否有全部权限标识
  if (allPerms.includes("*:*:*") || allPerms.includes("*")) return true;
  
  return allPerms.includes(permission);
};

// 获取当前用户的所有权限
export const getUserPermissions = (): string[] => {
  const userStore = useUserStoreHook();
  const storeAuths = userStore?.auths || [];
  return storeAuths.length > 0 ? [...storeAuths] : [...userPermissions];
};
