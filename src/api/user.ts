import { http } from "@/utils/http";


export type UserResult = {
  success: boolean;
  data: {
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
  msg: string;
};

export type UserListResult = {
  success: boolean;
  data: Array<object>;
  msg: string;
  total: number;
  page: number;
  limit: number;
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
  msg: string;
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/login/", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/api/token/refresh/", {
    data
  });
};



/** 获取用户数据列表 */
export const getUserList = (params?: object) => {
  return http.request<UserListResult>("get", "/api/user/", { params });
};

/** 更新用户数据 */
export const patchUser = (id?: number, data?: object) => {
  return http.request<UserResult>("patch", "/api/user/" + id + "/", { data });
};

/** 新增用户数据 */
export const postUser = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/", { data });
};

/** 删除用户数据 */
export const deleteUser = (id?: number) => {
  return http.request<UserResult>("delete", "/api/user/" + id + "/");
};

/** 获取当前用户信息（包含数据权限） */
export const getCurrentUserInfo = () => {
  return http.request<UserInfoResult>("get", "/api/user/current_user_info/");
};


/** 获取带数据权限过滤的列表 */
export const getListWithDataPermission = (resource: string, params: object = {}) => {
  const queryParams = {
    ...params,
    dept_filter: true,  // 部门数据过滤
    creator_filter: true  // 创建者数据过滤
  };
  return http.request("get", `/api/${resource}/`, { params: queryParams });
};


export type UserInfoResult = {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    avatar: string;
    nickname: string;
    status: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    create_time: string;
    role: Array<string>;
    dept: string;
    data_permission: number;
    data_permission_display: string;
    role_info: Array<{
      id: string;
      name: string;
      code: string;
      data_permission: number;
      data_permission_display: string;
    }>;
  };
  msg: string;
};

export type UserDataPermissionTestResult = {
  success: boolean;
  data: {
    user_id: string;
    username: string;
    data_permission: number;
    data_permission_display: string;
    roles: Array<{
      id: string;
      name: string;
      code: string;
      data_permission: number;
      data_permission_display: string;
    }>;
    dept: {
      id: string;
      name: string;
      code: string;
    };
  };
  msg: string;
};

/** 测试用户数据权限 */
export const testUserDataPermission = () => {
  return http.request<UserDataPermissionTestResult>("get", "/api/user/test_user_data_permission/");
};
