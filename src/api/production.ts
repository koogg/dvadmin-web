import { http } from "@/utils/http";

// 工艺管理相关类型
export type Process = {
  id: string;
  code: string;
  name: string;
  status: number;
  remark: string;
  create_time: string;
  update_time: string;
};

export type ProcessResult = {
  success: boolean;
  data: Process[];
  msg: string;
  total?: number;
  page?: number;
  limit?: number;
};

export type ProcessDetailResult = {
  success: boolean;
  data: Process;
  msg: string;
};

// 工序管理相关类型
export type ProcessStep = {
  id: string;
  code: string;
  name: string;
  process: string;
  process_name?: string;
  order: number;
  status: number;
  remark: string;
  create_time: string;
  update_time: string;
};

export type ProcessStepResult = {
  success: boolean;
  data: ProcessStep[];
  msg: string;
  total?: number;
  page?: number;
  limit?: number;
};

export type ProcessStepDetailResult = {
  success: boolean;
  data: ProcessStep;
  msg: string;
};

// 生产工单相关类型
export type ProductionOrder = {
  id: string;
  order_date: string;
  order_number: string;
  production_number: string;
  product_name: string;
  process: string;
  process_name?: string;
  planned_start_date: string;
  planned_end_date: string;
  workshop: string;
  status: string;
  create_time: string;
  update_time: string;
};

export type ProductionOrderResult = {
  success: boolean;
  data: ProductionOrder[];
  msg: string;
  total?: number;
  page?: number;
  limit?: number;
};

export type ProductionOrderDetailResult = {
  success: boolean;
  data: ProductionOrder;
  msg: string;
};

// 生产报工相关类型
export type ProductionReport = {
  id: string;
  production_order: string;
  production_order_number?: string;
  product_name?: string;
  process_step: string;
  process_step_name?: string;
  start_time: string;
  pause_time?: string;
  resume_time?: string;
  end_time?: string;
  status: string;
  creator: string;
  creator_name?: string;
  workshop?: string;
  create_time: string;
  update_time: string;
};

export type ProductionReportResult = {
  success: boolean;
  data: ProductionReport[];
  msg: string;
  total?: number;
  page?: number;
  limit?: number;
};

export type ProductionReportDetailResult = {
  success: boolean;
  data: ProductionReport;
  msg: string;
};

export type ProductionReportStatistics = {
  total_reports: number;
  completed_reports: number;
  in_progress_reports: number;
  paused_reports: number;
  total_hours: number;
  workshop_stats: Array<{
    workshop: string;
    total_reports: number;
    total_hours: number;
  }>;
  daily_stats: Array<{
    date: string;
    total_reports: number;
    total_hours: number;
  }>;
};

export type ProductionReportStatisticsResult = {
  success: boolean;
  data: ProductionReportStatistics;
  msg: string;
};

// 工艺管理接口
/** 获取工艺列表 */
export const getProcessList = (params?: object) => {
  return http.request<ProcessResult>("get", "/api/production/process/", {
    params
  });
};

/** 获取启用状态的工艺 */
export const getActiveProcesses = () => {
  return http.request<ProcessResult>(
    "get",
    "/api/production/process/active_processes/"
  );
};

/** 创建工艺 */
export const createProcess = (data: object) => {
  return http.request<ProcessDetailResult>("post", "/api/production/process/", {
    data
  });
};

/** 更新工艺 */
export const updateProcess = (id: string, data: object) => {
  return http.request<ProcessDetailResult>(
    "put",
    `/api/production/process/${id}/`,
    { data }
  );
};

/** 删除工艺 */
export const deleteProcess = (id: string) => {
  return http.request<ProcessDetailResult>(
    "delete",
    `/api/production/process/${id}/`
  );
};

/** 批量删除工艺 */
export const batchDeleteProcess = (ids: string[]) => {
  return http.request("delete", "/api/production/process/batch_delete/", {
    data: { ids }
  });
};

// 工序管理接口
/** 获取工序列表 */
export const getProcessStepList = (params?: object) => {
  return http.request<ProcessStepResult>(
    "get",
    "/api/production/process_step/",
    { params }
  );
};

/** 根据工艺获取工序列表 */
export const getStepsByProcess = (processId: string) => {
  return http.request<ProcessStepResult>(
    "get",
    "/api/production/process_step/steps_by_process/",
    {
      params: { process_id: processId }
    }
  );
};

/** 创建工序 */
export const createProcessStep = (data: object) => {
  return http.request<ProcessStepDetailResult>(
    "post",
    "/api/production/process_step/",
    { data }
  );
};

/** 更新工序 */
export const updateProcessStep = (id: string, data: object) => {
  return http.request<ProcessStepDetailResult>(
    "put",
    `/api/production/process_step/${id}/`,
    { data }
  );
};

/** 删除工序 */
export const deleteProcessStep = (id: string) => {
  return http.request<ProcessStepDetailResult>(
    "delete",
    `/api/production/process_step/${id}/`
  );
};

/** 批量删除工序 */
export const batchDeleteProcessStep = (ids: string[]) => {
  return http.request("delete", "/api/production/process_step/batch_delete/", {
    data: { ids }
  });
};

// 生产工单接口
/** 获取生产工单列表 */
export const getProductionOrderList = (params?: object) => {
  return http.request<ProductionOrderResult>(
    "get",
    "/api/production/production_order/",
    { params }
  );
};

/** 根据车间获取生产工单 */
export const getOrdersByWorkshop = (workshop: string, status?: string) => {
  return http.request<ProductionOrderResult>(
    "get",
    "/api/production/production_order/orders_by_workshop/",
    {
      params: { workshop, status }
    }
  );
};

/** 创建生产工单 */
export const createProductionOrder = (data: object) => {
  return http.request<ProductionOrderDetailResult>(
    "post",
    "/api/production/production_order/",
    { data }
  );
};

/** 更新生产工单 */
export const updateProductionOrder = (id: string, data: object) => {
  return http.request<ProductionOrderDetailResult>(
    "put",
    `/api/production/production_order/${id}/`,
    { data }
  );
};

/** 删除生产工单 */
export const deleteProductionOrder = (id: string) => {
  return http.request<ProductionOrderDetailResult>(
    "delete",
    `/api/production/production_order/${id}/`
  );
};

/** 取消生产工单 */
export const cancelProductionOrder = (id: string) => {
  return http.request<ProductionOrderDetailResult>(
    "post",
    `/api/production/production_order/${id}/cancel/`
  );
};

/** 批量取消生产工单 */
export const batchCancelProductionOrder = (ids: string[]) => {
  return http.request(
    "post",
    "/api/production/production_order/batch_cancel/",
    { data: { ids } }
  );
};

/** 导出生产工单 */
export const exportProductionOrder = (params?: object) => {
  return http.request("get", "/api/production/production_order/export/", {
    params,
    responseType: "blob"
  });
};

// 生产报工接口
/** 获取生产报工列表 */
export const getProductionReportList = (params?: object) => {
  return http.request<ProductionReportResult>(
    "get",
    "/api/production/production_report/",
    { params }
  );
};

/** 获取我的报工列表 */
export const getMyReports = (params?: object) => {
  return http.request<ProductionReportResult>(
    "get",
    "/api/production/production_report/my_reports/",
    { params }
  );
};

/** 创建生产报工 */
export const createProductionReport = (data: {
  production_order: string;
  process_step: string;
  operator_username?: string;
  start_time?: string;
  status?: string;
}) => {
  return http.request<ProductionReportDetailResult>(
    "post",
    "/api/production/production_report/",
    { data }
  );
};

/** 暂停报工 */
export const pauseProcessStep = (id: string, data?: object) => {
  return http.request<ProductionReportDetailResult>(
    "post",
    `/api/production/production_report/${id}/pause/`,
    { data }
  );
};

/** 恢复报工 */
export const resumeProcessStep = (id: string, data?: object) => {
  return http.request<ProductionReportDetailResult>(
    "post",
    `/api/production/production_report/${id}/resume/`,
    { data }
  );
};

/** 完成报工 */
export const completeProcessStep = (id: string, data?: object) => {
  return http.request<ProductionReportDetailResult>(
    "post",
    `/api/production/production_report/${id}/complete/`,
    { data }
  );
};

/** 更新生产报工 */
export const updateProductionReport = (id: string, data: object) => {
  return http.request<ProductionReportDetailResult>(
    "put",
    `/api/production/production_report/${id}/`,
    { data }
  );
};

/** 删除生产报工 */
export const deleteProductionReport = (id: string) => {
  return http.request<ProductionReportDetailResult>(
    "delete",
    `/api/production/production_report/${id}/`
  );
};
/** 获取生产报工统计 */
export const getProductionReportStatistics = (params?: {
  start_date?: string;
  end_date?: string;
  workshop?: string;
}) => {
  return http.request<ProductionReportStatisticsResult>(
    "get",
    "/api/production/production_report/statistics/",
    { params }
  );
};
