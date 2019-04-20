import React from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

const Cell = ({ columnIndex, rowIndex, style }) => (

    <div style={style}>

        Item {rowIndex},{columnIndex}

    </div>

);


const columnWidths = new Array(1000)
    .fill(true)
    .map(() => 75 + Math.round(Math.random() * 50));
const rowHeights = new Array(1000)
    .fill(true)
    .map(() => 25 + Math.round(Math.random() * 50));


class TableBody extends React.Component {



    state = {
        dataSource: [],
        columns: [{

        }]
    }


    columnWidth = (index, width) => {

        let { columns, dataSource } = this.props;

        let cw = 0
        columns.forEach(d => {
            cw += (d.width || 100)
        });


        let column = columns[index];

        if (column) {
            return column.width || 100
        }

        return width - cw


    }

    renderCell = ({ columnIndex, rowIndex, style }) => {

        let { columns, dataSource } = this.props;



        let column = columns[columnIndex];

        if (column) {
            let c = column.dataIndex;
            let row = dataSource[rowIndex];

            return <div className="__cell" style={style}>

                {row[c]}

            </div>
        }

        return <div className="__cell" style={style}>


        </div>
    }


    render() {

        let { columns, dataSource } = this.props;


        let colLength = columns.length + 1;

        let columnWidth = 0;
        columns.forEach(d => {
            columnWidth += d.width || 100;
        })


        // let cols = columns.concat([{
        //   __placeholdercolumn:true
        // }])

        return <AutoSizer>
            {({ height, width }) => {

                let len = columns.length;

                if (width > columnWidth) {
                    len = len + 1;
                }

                return <Grid

                    columnCount={len}

                    columnWidth={(i) => this.columnWidth(i, width)}

                    height={height}

                    rowCount={dataSource.length}

                    rowHeight={() => 35}

                    width={width}

                >

                    {this.renderCell}

                </Grid>
            }}
        </AutoSizer>


    }
}


export default TableBody;