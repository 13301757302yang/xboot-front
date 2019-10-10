// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest,acivitiRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

export const addModel = (params) => {
    return postRequest('/activiti/add', params)
}

export const getModelListData = (params) => {
    return getRequest('/activiti/getAll', params)
}




