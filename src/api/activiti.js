// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest,acivitiRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

export const addModel = (params) => {
    return postRequest('/activiti/add', params)
}

export const getModelListData = (params) => {
    return getRequest('/activiti/getAll', params)
}

export const deleteModel = (id,params) => {
    return postRequest(`/activiti/deleteModel/${id}`, params)
}

// 部署发布流程
export const deployModel = (id,params) => {
    return postRequest(`/activiti/deployModel/${id}`, params)
}


// 新增申请
export const insertLeave = (params) => {
    return postRequest('/leave/insert', params)
}

// 提交申请
export const applyLeave = (params) => {
    return postRequest('/leave/applyLeave', params)
}

// 申请列表
export const getLeaveList = (params) => {
    return getRequest('/leave/getAll', params)
}
// 删除申请
export const deleteLeave = (id,params) => {
    return postRequest(`/leave/deleteLeave/${id}`, params)
}


