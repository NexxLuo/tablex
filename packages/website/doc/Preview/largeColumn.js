import React, { Component } from "react";
import { Table } from "tablex";
import { Input, Button } from "antd";


class Demo extends React.Component {
    generateData(columns, count = 20, prefix = 'Row') {
      return new Array(count).fill(0).map((row, rowIndex) => {
        return columns.reduce(
          (rowData, column, columnIndex) => {
            rowData[column.dataIndex] =
              prefix + ' ' + rowIndex + ' - Col ' + columnIndex
            return rowData
          },
          {
            id: prefix + rowIndex,
            parentId: null,
          },
        )
      })
    }
    constructor(props) {
      super(props)
   
  
      let columns=[];
  
  
      for (let i = 0; i < 100; i++) {
      
  
        let d={
          dataIndex: 'column-'+i,
          key:'column-'+i,
          title: 'column-'+i,
          width: 100
  
        };
  
        d.render=(value, row, index)=>{
          const obj = {
            children: value,
            props: {},
          }
  
          // if (index % 4==0) {
          //   obj.props.colSpan = 2
          //   obj.children = <div>列数据合并</div>
          // }
  
          return obj
        }
  
        columns.push(d)
        
      }
  
      let data = this.generateData(columns, 100000)
  
      this.state = {
        data: data,
        columns: columns,
      }
    }
    render() {
      let { columns, data } = this.state
      return (
     <div style={{height:600}}><Table
          rowKey="id"
          columns={columns}
          overscanCount={15}
          virtual={true}
          data={data}
          selectMode="multiple"
          orderNumber={true}
        /></div>   
      )
    }
  }

  export default Demo;
