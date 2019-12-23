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

// 新增申请
export const applyLeave = (params) => {
    return postRequest('/leave/apply', params)
}

// 申请列表
export const getLeaveList = (params) => {
    return getRequest('/leave/getAll', params)
}


