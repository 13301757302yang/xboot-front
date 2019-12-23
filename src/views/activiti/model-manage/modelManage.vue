<style lang="less">
  @import "./modelManage.less";
</style>
<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row>
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
              <Form-item label="模型名称" prop="name">
                <Input
                        type="text"
                        v-model="searchForm.name"
                        clearable
                        placeholder="请输入名称"
                        style="width: 200px"
                />
              </Form-item>
              <Form-item label="标识key" prop="key">
                <Input
                        type="text"
                        v-model="searchForm.key"
                        clearable
                        placeholder="请输入标识"
                        style="width: 200px"
                />
              </Form-item>
              <Form-item style="margin-left:-35px;" class="br">
                <Button @click="modelSearch" type="primary" icon="ios-search">搜索</Button>
                <Button @click="modelReset">重置</Button>
              </Form-item>
            </Form>
          </Row>
          <Row class="operation">
            <Button @click="add" type="primary" icon="md-add">添加空白模型</Button>
            <Button @click="delAll" icon="md-trash">批量删除</Button>
            <Button @click="delAll" icon="md-refresh">刷新</Button>
          </Row>
          <Row>
            <Alert show-icon>
              已选择
              <span class="select-count">{{selectCount}}</span> 项
              <a class="select-clear" @click="clearSelectAll">清空</a>
            </Alert>
          </Row>
          <Row>
            <Table
                    :loading="loading"
                    border
                    :columns="columns"
                    :data="data"
                    sortable="custom"
                    dataformatas="dataFormat"
                    @on-sort-change="changeSort"
                    @on-selection-change="showSelect"
                    ref="table"
            ></Table>
          </Row>
          <Row type="flex" justify="end" class="page">
            <Page
                    :current="searchForm.pageNumber"
                    :total="total"
                    :page-size="searchForm.pageSize"
                    @on-change="changePage"
                    @on-page-size-change="changePageSize"
                    :page-size-opts="[10,20,50]"
                    size="small"
                    show-total
                    show-elevator
                    show-sizer
            ></Page>
          </Row>
        </Card>
      </Col>
    </Row>

    <!-- 流程设计 -->
    <Modal v-model="design_modal" fullscreen footer-hide title="流程设计">
      <div>
        <iframe
          :src="modelerUrl"
          scrolling="auto"
          frameborder="0"
          style="height: 665px;width: 100%;"
        ></iframe>
      </div>
      <div slot="footer"></div>
    </Modal>

    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="modelForm" :model="modelForm" :label-width="80" :rules="formValidate">
        <FormItem label="名称" prop="name">
          <Input v-model="modelForm.name"/>
        </FormItem>
        <FormItem label="标识key" prop="key">
          <Input v-model="modelForm.key"/>
        </FormItem>
        <FormItem label="备注" prop="description">
          <Input v-model="modelForm.description"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="handleCancel">取消</Button>
        <Button type="primary" size="large" :loading="submitLoading" @click="modelSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
    addModel,
    deleteModel,
    getModelListData
} from "@/api/activiti.js";
import { formatDate } from "@/api/date.js";
export default{
    name: "model-manage",
    data() {
        return {
            loading: true, // 表单加载状态
            sortColumn: "createTime", // 排序字段
            sortType: "desc", // 排序方式
            modelerUrl: '',
            design_modal: false,
            modalType: 0, // 添加或编辑标识
            modalVisible: false, // 添加或编辑显示
            modalTitle: "", // 添加或编辑标题
            modelForm: {
                // 添加或编辑表单对象初始化数据
                name: "",
                key: "",
                description: ""
            },
            searchForm: {
                name: "",
                key: "",
                description: ""
            },
            // 表单验证规则
            formValidate: {
                name: [{ required: true, message: "不能为空", trigger: "blur" }],
                key: [{ required: true, message: "不能为空", trigger: "blur" }]

            },
            submitLoading: false, // 添加或编辑提交状态
            selectList: [], // 多选数据
            selectCount: 0, // 多选计数
            columns: [
                // 表头
                {
                    type: "selection",
                    width: 60,
                    align: "center",
                    fixed: "left"
                },
                {
                    type: "index",
                    width: 60,
                    align: "center",
                    fixed: "left"
                },
                {
                    title: "名称",
                    key: "name",
                    minWidth: 60,
                    sortable: true,
                    fixed: "left"
                },
                {
                    title: "标识key",
                    key: "key",
                    minWidth: 35,
                    sortable: true
                },
                {
                    title: "备注描述",
                    key: "description",
                    minWidth: 35,
                    sortable: true
                },
                {
                    title: "版本",
                    key: "version",
                    minWidth: 30,
                    sortable: true
                },
                {
                    title: "创建时间",
                    type: "date",
                    key: "createTime",
                    width: 150,
                    sortable: true,
                    sortType: "desc"
                },
                {
                    title: "更新时间",
                    key: "updateTime",
                    width: 150,
                    sortable: true
                },
                {
                    title: "操作",
                    key: "action",
                    align: "center",
                    fixed: "right",
                    width: 305,
                    render: (h, params) => {
                        return h("div", [
                            h(
                                "Button",
                                {
                                    props: {
                                        type: "warning",
                                        size: "small",
                                        icon: "md-trash"
                                    },
                                    style: {
                                        marginLeft: "0px"
                                    },
                                    on: {
                                        click: () => {
                                            this.modelerUrl = this.$config.itcloudUrl + '/modeler.html?modelId=' + params.row.id
                                            this.design_modal = true
                                        }
                                    }
                                },
                                "在线设计"
                            ),
                            h(
                                "Button",
                                {
                                    props: {
                                        type: "info",
                                        size: "small",
                                    },
                                    style: {
                                        marginLeft: "5px"
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(params.row);
                                        }
                                    }
                                },
                                "部署发布"
                            ),
                            h(
                                "Button",
                                {
                                    props: {
                                        size: "small",
                                    },
                                    style: {
                                        marginLeft: "5px"
                                    },
                                    on: {
                                        click: () => {
                                            this.edit(params.row);
                                        }
                                    }
                                },
                                "导出XML"
                            ),
                            h(
                                "Button",
                                {
                                    props: {
                                        type: "error",
                                        size: "small",
                                    },
                                    style: {
                                        marginLeft: "5px"
                                    },
                                    on: {
                                        click: () => {
                                            this.delModel(params.row);
                                        }
                                    }
                                },
                                "删除"
                            )
                        ]);
                    }
                }
            ],
            data: [], // 表单数据
            pageNumber: 1, // 当前页数
            pageSize: 10, // 页面大小
            total: 0 // 表单数据总数
        };
    },
    methods: {
        init() {
            this.getModelList();
        },
        modelSearch() {
            this.searchForm.pageNumber = 1;
            this.searchForm.pageSize = 10;
        },
        modelReset() {

        },
        modelSubmit() {
            this.$refs.modelForm.validate(valid => {
                if (valid) {
                    this.submitLoading = true;
                    if (this.modalType == 0) {
                        // 添加 避免编辑后传入id等数据 记得删除
                        delete this.modelForm.id;
                        addModel(this.modelForm).then(res => {
                            this.submitLoading = false;
                            if (res.success == true) {
                                this.$Message.success("操作成功");
                                this.getModelList();
                                this.modalVisible = false;
                            }
                        });
                    } else {
                        // 模拟请求成功
                        this.submitLoading = false;
                        this.$Message.success("操作成功");
                        this.getDataList();
                        this.modalVisible = false;
                    }
                }
            });
        },
        getModelList() {
            // 多条件搜索用户列表
            this.loading = true;
            // 避免后台默认值
            if (!this.searchForm.name) {
                this.searchForm.name = "";
            }
            if (!this.searchForm.key) {
                this.searchForm.key = "";
            }
            getModelListData(this.searchForm).then(res => {
                this.loading = false;
                if (res.success == true) {
                    var result = res.result;
                    result.forEach(item=>{
                        // 将时间格式化后重新赋值
                        let date = new Date(item.createTime);
                        item.createTime = formatDate(date,"yyyy-MM-dd hh:mm:ss")
                    });
                    this.data = result;
                    this.total = res.result.totalElements;
                }
            });
        },
        add() {
            this.modalType = 0;
            this.modalTitle = "添加空白模型";
            this.$refs.modelForm.resetFields();
            delete this.modelForm.id;
            this.modalVisible = true;
        },
        delModel(v){
            this.$Modal.confirm({
                title: "确认删除",
                // 记得确认修改此处
                content: "您确认要删除 " + v.name + " ?",
                onOk: () => {
                    // 删除
                    deleteModel(v.id).then(res => {
                      if (res.success == true) {
                        this.$Message.success("操作成功");
                        this.getModelList();
                      }
                    });
                }
            })
        },
        edit(v){
            editModel(v.id);
        },
        delAll() {

        },
        dropDown() {

        },
        dropDownContent() {

        },
        dropDownIcon() {

        },
        clearSelectAll() {

        },
        changeSort() {

        },
        showSelect() {

        },
        exportColumns() {

        },
        exportData() {

        },
        changePage() {},
        changePageSize() {},
        handleCancel() {}
    },
    mounted() {
        this.init();
    }
};
</script>
<style lang="less">
  .sorry{
    height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .text{
      font-size: 20px;
      margin: 20px 0;
    }
  }
</style>
