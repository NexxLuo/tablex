import React, { Component } from "react";
import BaseTable from "../src/BaseTable";

const generateColumns = (count = 10, prefix = "column-", props) =>
    new Array(count).fill(0).map((column, columnIndex) => ({
        ...props,
        key: `${prefix}${columnIndex}`,
        dataIndex: `${prefix}${columnIndex}`,
        title: `Column ${columnIndex}`,
        width: 150
    }));

const generateData = (columns, count = 20, prefix = "row-") =>
    new Array(count).fill(0).map((row, rowIndex) => {
        return columns.reduce(
            (rowData, column, columnIndex) => {
                rowData[
                    column.dataIndex
                ] = `Row ${rowIndex} - Col ${columnIndex}`;

                if (rowIndex === 0) {
                    rowData.children = [];
                }

                return rowData;
            },
            {
                id: `${prefix}${rowIndex}`,
                parentId: null
            }
        );
    });

const columns = generateColumns(10);
const data = generateData(columns, 100);

let fixedColumns = columns.map((column, columnIndex) => {
    let fixed;
    if (columnIndex < 2) fixed = "left";
    if (columnIndex > 8) fixed = "right";

    return { ...column, resizable: true, fixed };
});

fixedColumns = [
    {
        dataIndex: "column-1",
        key: "column-1",
        title: "number",
        width: 200,
        resizable: true
    },
    {
        title: "appellation",
        width: 150,
        key: "column-11",
        children: [
            {
                dataIndex: "column-2",
                title: "name",
                key: "column-2",

                width: 150,
                resizable: true
            },
            {
                dataIndex: "column-3",
                key: "column-3",
                title: "nick name",
                width: 150,
                resizable: true,
                children: [
                    {
                        dataIndex: "column-21",
                        title: "nick-1",
                        key: "column-21",
                        maxWidth: 300,
                        width: 150,
                        resizable: true
                    },
                    {
                        dataIndex: "column-31",
                        key: "column-31",
                        title: "nick-2",
                        width: 150,
                        resizable: true
                    }
                ]
            }
        ]
    },
    {
        dataIndex: "column-4",
        key: "column-4",
        title: "age",
        width: 150,
        resizable: true
    }
];

function createData(level, parentKey, maxLevel, index) {
    if (level > maxLevel) {
        return;
    }

    let l = level;
    let data = [];
    for (let i = 0; i < 3; i++) {
        let k = parentKey + "-" + level + "-" + i;
        let d = {
            id: k,
            "column-1": "Edward King " + k,
            age: 32,
            address: "London, Park Lane no. " + i
        };

        if (i === 2) {
            d.children = createData(l + 1, k, maxLevel, i);
        }

        data.push(d);
    }
    return data;
}

function createTreeData() {
    let data = [];
    for (let i = 0; i < 10; i++) {
        data.push({
            id: "" + i,
            level: 0,
            "column-1": "Edward King " + i,
            age: 32,
            address: "London, Park Lane no. " + i,
            children: createData(0, i, 2)
        });
    }

    return data;
}

class baseTable extends Component {
    state = {
        data: []
    };

    componentDidMount() {
        this.setState({
            data: createTreeData()
        });
    }

    loadChildrenData = record => {
        return new Promise((resolve, reject) => {
            let rows = this.state.data;

            setTimeout(() => {
                let childrens = [
                    { id: "123123123", "column-0": "children async" }
                ];
                // record.isLoading=false;
                record.children = childrens;
                //rows[0] = Object.assign({}, record, { children: childrens });

                this.setState({
                    data: rows
                });

                resolve();
            }, 1300);
        });
    };

    render() {
        return (
            <BaseTable
                rowKey="id"
                expandColumnKey="column-1"
                loadChildrenData={this.loadChildrenData}
                columns={fixedColumns}
                selectMode="multiple"
                data={this.state.data}
                orderNumber={true}
                disabledSelectKeys={[]}
                onSelectChange={(keys, rows) => {
                    console.log("onSelectChange:", rows);
                }}
            />
        );
    }
}

export default baseTable;
