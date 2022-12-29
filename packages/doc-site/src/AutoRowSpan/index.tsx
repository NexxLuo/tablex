import React, { Component } from 'react';
import { Table, unflatten } from 'tablex';
import { Button, Input, Select } from 'antd';
// @ts-ignore
import _ from 'lodash';
import 'antd/dist/antd.css';

const { Search } = Input;

class Demo extends Component {
  state = {
    loading: false,
    treeData: [],
    columns: [],
  };

  getData = () => {
    let columns = [
      {
        title: '所属阶段',
        dataIndex: 'BelongStage',
        key: 'BelongStage',
        align: 'left',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
        width: 160,
      },
      {
        title: '工作内容',
        dataIndex: 'WorkContent',
        key: 'WorkContent',
        align: 'left',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
      },
      {
        dataIndex: 'RowConfigName',
        title: '名称',
        key: 'RowConfigName',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
        width: 240,
      },
      {
        title: '是否完成',
        dataIndex: 'IsEndId',
        align: 'center',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
        editor: (value: any, row: any, index: any, onchange: any, ref: any) => {
          let strNumber: any = '';
          if (value == true) {
            strNumber = 1;
          } else if (value == false) {
            strNumber = 0;
          }
          return (
            <Input
              placeholder="请选择"
              defaultValue={strNumber}
              ref={ref}
              allowClear={true}
            ></Input>
          );
        },
        render: (value: any, row: any) => {
          return row.IsEndIdName;
        },
      },
      {
        title: '预计完成时间',
        dataIndex: 'PredictEndTime',
        align: 'center',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
        editor: (value: any, row: any, index: any, onchange: any, ref: any) => {
          let strNumber: any = '';
          if (value == true) {
            strNumber = 1;
          } else if (value == false) {
            strNumber = 0;
          }
          return (
            <Input
              placeholder="请选择"
              defaultValue={strNumber}
              ref={ref}
              allowClear={true}
            ></Input>
          );
        },
      },
      {
        title: '集团公司责任部门',
        dataIndex: 'GroupCompanyDept',
        key: 'GroupCompanyDept',
        align: 'left',
        sortable: false, //禁止排序
        dropMenu: false, //禁止下拉菜单
        width: 200,
      },
    ];
    let arr: any[] = [
      {
        RowConfigId: 'a81cec66-af87-4a28-95ef-fd1286a5995c',
        RowConfigName: '尾工施工',
        GroupCompanyDept: '工管中心',
        ListOrder: 1,
        IsEndId: false,
        IsEndIdName: '否',
        PredictEndTime: '2022-10-24 00:00:00',
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"一阶段:尾工阶段",
        WorkContent:"工程施工"
      },
      {
        RowConfigId: '01df5057-7154-4817-9665-ca24c6240c5e',
        RowConfigName: '缺陷整治',
        GroupCompanyDept: '工管中心',
        ListOrder: 2,
        IsEndId: true,
        IsEndIdName: '是',
        PredictEndTime: '2022-10-01 00:00:00',
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"一阶段:尾工阶段",
        WorkContent:"工程施工"

      },
      {
        RowConfigId: '99dee0a6-1738-4e1d-9990-428b1d8b0919',
        RowConfigName: '资料编制',
        GroupCompanyDept: '工管中心',
        ListOrder: 3,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"一阶段:尾工阶段",
        WorkContent:"工程施工"

      },
      {
        RowConfigId: 'de4fff44-e446-47ee-8046-f7a19e386354',
        RowConfigName: '竣工交验',
        GroupCompanyDept: '工管中心',
        ListOrder: 4,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"一阶段:尾工阶段",
        WorkContent:"工程施工"

      },
      {
        RowConfigId: '5cbc6bfb-90fc-4a3e-88f2-33bf8cb600b7',
        RowConfigName: '竣工结算资料编报',
        GroupCompanyDept: '工经部、双清办',
        ListOrder: 5,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"二阶段:清收阶段",
        WorkContent:"清收工作"

      },
      {
        RowConfigId: 'e2e44d27-b846-4771-a7ba-03498c48b2ba',
        RowConfigName: '竣工结算资料批复',
        GroupCompanyDept: '工经部、双清办',
        ListOrder: 6,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"二阶段:清收阶段",
        WorkContent:"清收工作"
      },
      {
        RowConfigId: '7a2b2859-018f-453c-9ab7-ce8d1263017b',
        RowConfigName: '末次计价',
        GroupCompanyDept: '工经部、双清办',
        ListOrder: 7,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"二阶段:清收阶段",
        WorkContent:"清收工作"
      },
      {
        RowConfigId: 'eea78016-ac78-4b75-9739-9b24e3b977ad',
        RowConfigName: '应收款(工程款、质保金)',
        GroupCompanyDept: '财会部、双清办',
        ListOrder: 8,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"清欠工作"
      },
      {
        RowConfigId: '2276d664-7cb5-4fbb-9801-118aad043998',
        RowConfigName: '其他应收款(备用金、押金、质保金)',
        GroupCompanyDept: '财会部、双清办',
        ListOrder: 9,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"清欠工作"
      },
      {
        RowConfigId: 'd4b6388f-ffe8-4fc1-858c-1278552214c7',
        RowConfigName: '物资清理',
        GroupCompanyDept: '物资部',
        ListOrder: 10,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"内部清理"
      },
      {
        RowConfigId: '789905e6-add5-486e-b523-dff7f8c5b513',
        RowConfigName: '设备清理',
        GroupCompanyDept: '工管中心',
        ListOrder: 11,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"内部清理"
      },
      {
        RowConfigId: 'f31072e3-9416-4b6b-a0b5-f4a145a1dabf',
        RowConfigName: '劳务结算清理',
        GroupCompanyDept: '工经部',
        ListOrder: 12,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"内部清理"
      },
      {
        RowConfigId: '04b8e8dd-aa50-4ba9-8ffb-116d371c0c97',
        RowConfigName: '实物资产清理',
        GroupCompanyDept: '财会部、物资部、办公室',
        ListOrder: 13,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"内部清理"
      },
      {
        RowConfigId: 'f0cce1bf-5609-4cc3-a16d-765484b608e9',
        RowConfigName: '其他清理',
        GroupCompanyDept: '根据部门职责分工归口办理',
        ListOrder: 14,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"内部清理"
      },
      {
        RowConfigId: '27359a14-efe0-478f-bd0d-db5b3f3a37f3',
        RowConfigName: '外部户',
        GroupCompanyDept: '财会部',
        ListOrder: 15,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"账户撤销"
      },
      {
        RowConfigId: 'ae112b82-9ee8-4f85-a0a8-2d110496fc56',
        RowConfigName: '内部户',
        GroupCompanyDept: '财会部',
        ListOrder: 16,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"三阶段:清欠阶段",
        WorkContent:"账户撤销"
      },
      {
        RowConfigId: '377144e2-e342-4907-9996-6552c73fdc90',
        RowConfigName: '机构销号',
        GroupCompanyDept: '人资部',
        ListOrder: 17,
        IsEndId: null,
        IsEndIdName: null,
        PredictEndTime: null,
        ProjectId: 'NFE_6bffcc8044d3484898717ff26f592860',
        BelongStage:"四阶段:机构销号",
        WorkContent:"机构撤销"
      },
    ];

    this.setState({ treeData: arr, columns: columns });
    console.log('columns:', columns);
  };

  actions = {};
  componentDidMount() {
    console.log('actions:', this.actions);
    this.getData();
  }

  render() {
    return (
      <div style={{ height: '600px' }}>
        <Table
          rowKey="RowConfigId"
          editable={true}
          ref="tb"
          loading={this.state.loading}
          columns={this.state.columns}
          autoRowHeight={true}
          autoRowSpanColumns={["BelongStage", "WorkContent"]}
          selectMode="multiple"
          checkStrictly={false}
          virtual={true}
          data={this.state.treeData}
          onRow={()=>{
            return {};
          }}
          orderNumber={{ resizable: true }}
          validateTrigger="onChange"
          isAppend={true}
          actions={this.actions}
        />
      </div>
    );
  }
}

export default Demo;
