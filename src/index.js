import React from 'react';
import TableBody from './components/body';
import TableHead from './components/head';



const columns = [{
    title: 'Name',
    dataIndex: 'name',
  }, {
    title: 'Age',
    dataIndex: 'age',
  }, {
    title: 'Address',
    dataIndex: 'address',
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

            <TableHead columns={columns} ></TableHead>

            <TableBody columns={columns} dataSource={dataSource} ></TableBody>

        </div>
    }
}


export default Table;