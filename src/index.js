import React from 'react';
import TableBody from './components/body';
import TableHead from './components/head';
import "./index.css"



const columns = [{
    title: 'Name',
    dataIndex: 'name',
    width:200
  }, {
    title: 'Age',
    dataIndex: 'age',
    width:200
  }, {
    title: 'Address',
    dataIndex: 'address',
    width:200
  }];
  
  const data = [];
  for (let i = 0; i < 46; i++) {
    data.push({
      key: i, 
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`,
    });
  }



class Table extends React.Component {



    state = {
        columns:columns,
        dataSource: data
    }



    render() {


        let { columns, dataSource } = this.state;


        return <div style={{height:400,width:600}}>

        <div className="tablex">
            {/* <TableHead columns={columns} ></TableHead> */}

            <TableBody columns={columns} dataSource={dataSource} ></TableBody>
            </div>

        </div>
    }
}


export default Table;