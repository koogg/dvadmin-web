import { http } from "@/utils/http";
// depart数据列表type
export type DepartResult = {
  success: boolean;
  data: [];
  msg: string;
};

export type Depart = {
  id: string;
  name: string;
  code: string;
  rank: number;
  type: number;
  parent: string;
  status: boolean;
  roles: [];
};

export type newDepartResult = {
  success: boolean;
  data: object;
  msg: string;
};

export type Role = {
  id: number;
  name: string;
  code: string;
  status: boolean;
  parent: string;
  create_time: string;
  update_time: string;
};

export type RolesResult = {
  success: boolean;
  data: [];
  msg: string;
};

export type NewRoleResult = {
  success: boolean;
  data: Role;
  msg: string;
};

export type MenuMeta = {
  id: string;
  title: string;
  icon: string;
  r_svg_name: string;
  is_show_menu: boolean;
  is_show_parent: boolean;
  is_keepalive: boolean;
  frame_url: string;
  frame_loading: boolean;
  transition_enter: string;
  transition_leave: string;
  is_hidden_tag: boolean;
  fixed_tag: boolean;
  dynamic_level: number;
};

export type Menu = {
  id: string;
  parent: string;
  menu_type: number;
  name: string;
  rank: number;
  path: string;
  component: string;
  status: boolean;
  meta: MenuMeta;
};

export type MenusResult = {
  success: boolean;
  data: [];
  msg: string;
};

export type NewMenuResult = {
  success: boolean;
  data: Menu;
  msg: string;
};

/** 获取部门数据列表 */
export const getDepartList = (params?: object) => {
  return http.request<DepartResult>("get", "/api/system/dept/", { params });
};

/** 新增部门 */
export const postDepart = (data?: object) => {
  return http.request<newDepartResult>("post", "/api/system/dept/", { data });
};

/** 删除部门 */
export const deleteDepart = (id?: number) => {
  return http.request<newDepartResult>("delete", "/api/system/dept/" + id + "/");
};

/** 部分更新部门数据 */
export const patchDepart = (id?: number, data?: object) => {
  return http.request<newDepartResult>("patch", "/api/system/dept/" + id + "/", { data });
};

/** 获取角色数据列表 */
export const getRoleList = (params?: object) => {
  return http.request<RolesResult>("get", "/api/system/role/", { params });
};

/** 新增角色 */
export const postRole = (data?: object) => {
  return http.request<NewRoleResult>("post", "/api/system/role/", { data });
};

/** 删除角色 */
export const deleteRole = (id?: number) => {
  return http.request<NewRoleResult>("delete", "/api/system/role/" + id + "/");
};

/** 部分更新角色数据 */
export const patchRole = (id?: number, data?: object) => {
  return http.request<NewRoleResult>("patch", "/api/system/role/" + id + "/", { data });
};

/** 获取菜单数据列表 */
export const getMenuList = (params?: object) => {
  return http.request<MenusResult>("get", "/api/system/menu/", { params });
};

/** 新增菜单 */
export const postMenu = (data?: object) => {
  return http.request<NewMenuResult>("post", "/api/system/menu/", { data });
};

/** 删除菜单 */
export const deleteMenu = (id?: number) => {
  return http.request<NewMenuResult>("delete", "/api/system/menu/" + id + "/");
};

/** 部分更新菜单数据 */
export const patchMenu = (id?: number, data?: object) => {
  return http.request<NewMenuResult>("patch", "/api/system/menu/" + id + "/", { data });
};


// 数据权限选项类型
export type DataPermissionOption = {
  value: number;
  label: string;
};

// 数据权限选项结果类型
export type DataPermissionOptionsResult = {
  success: boolean;
  data: DataPermissionOption[];
  msg: string;
};

// 角色数据权限类型
export type RoleDataPermission = {
  id: string;
  name: string;
  code: string;
  data_permission: number;
  data_permission_display: string;
};

// 角色数据权限结果类型
export type RoleDataPermissionResult = {
  success: boolean;
  data: RoleDataPermission;
  msg: string;
};

/** 获取部门树（基于数据权限） */
export const getDeptTree = () => {
  return http.request<DepartResult>("get", "/api/system/dept/dept_tree/");
};

/** 获取用户可访问的部门列表 */
export const getAccessibleDepts = () => {
  return http.request("get", "/api/system/dept/accessible_depts/");
};

/** 获取数据权限选项 */
export const getDataPermissionOptions = () => {
  return http.request<DataPermissionOptionsResult>("get", "/api/system/role/data_permission_options/");
};

/** 获取角色的数据权限信息 */
export const getRoleDataPermission = (roleId: string) => {
  return http.request<RoleDataPermissionResult>("get", `/api/system/role/${roleId}/role_data_permission/`);
};

/** 更新角色的数据权限 */
export const updateRoleDataPermission = (roleId: string, data: { data_permission: number }) => {
  return http.request("put", `/api/system/role/${roleId}/update_data_permission/`, { data });
};

/** 测试部门数据权限 */
export const testDeptDataPermission = () => {
  return http.request("get", "/api/system/dept/test_data_permission/");
};
