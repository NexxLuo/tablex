import React from "react";
import PropTypes from "prop-types";
import BaseTable, { AutoResizer, unflatten } from "react-base-table";
import cloneDeep from "lodash/cloneDeep";
import {
    treeToList,
    removeCheckedKey,
    addCheckedKeyWithDisabled
} from "./utils";
import TableHeader from "./GroupHeader";
import ExpandIcon from "./ExpandIcon";
import Checkbox from "./Checkbox";

import "./styles.css";

class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            columnList: [],
            columnDepth: 0,
            data: [],
            flatData: [],
            loadingKeys: [],
            prevProps: null,
            rowHeight: 40,
            selectedRowKeys: [],
            disabledSelectKeys: [],
            halfCheckedKeys: [],
            selectMode: "",
            rowKey: "",
            orderNumber: false,
            checkStrictly: false
        };

        if (typeof props.initRef === "function") {
            props.initRef(this);
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let {
            rowKey,
            columns,
            loading,
            selectMode,
            disabledSelectKeys,
            orderNumber,
            checkStrictly,
            resizable
        } = nextProps;

        let data = nextProps.data || nextProps.dataSource || [];

        let nextState = null;

        if (prevState.prevProps !== nextProps) {
            let columnsArr = [].concat(columns);

            //
            if (selectMode === "multiple") {
                columnsArr.unshift({
                    key: "__checkbox_column",
                    dataKey: "__checkbox_column",
                    __type: "__checkbox_column",
                    width: 50,
                    align: "center"
                });
            }

            if (orderNumber === true) {
                columnsArr.unshift({
                    key: "__ordernumber_column",
                    dataIndex: "__ordernumber_column",
                    __type: "__ordernumber_column",
                    width: 50,
                    title: "No.",
                    align: "center"
                });
            }
            //

            let { leafs: columnList, maxDepth: columnDepth, list } = treeToList(
                columnsArr
            );

            //兼容antd table column的属性
            list.forEach(d => {
                d.frozen = d.fixed;
                d.key = d.key || d.dataIndex;
                d.dataKey = d.dataIndex;

                if (!d.hasOwnProperty("resizable")) {
                    d.resizable = resizable;
                }

                if (typeof d.render === "function") {
                    d.cellRenderer = ({
                        cellData,
                        columns,
                        column,
                        columnIndex,
                        rowData,
                        rowIndex
                    }) => {
                        let r = d.render(cellData, rowData, rowIndex);

                        if (React.isValidElement(r)) {
                            return r;
                        }

                        if (r && r.children) {
                            if (React.isValidElement(r.children)) {
                                return r.children;
                            }
                        }
                        return r;
                    };
                }
            });
            //

            let { list: dataArr } = treeToList(data, rowKey);

            nextState = {
                rowKey,
                columns: columnsArr,
                columnList: columnList,
                columnDepth: columnDepth,
                data: data,
                flatData: dataArr,
                loading: !!loading,
                selectMode,
                disabledSelectKeys,
                rowKey,
                orderNumber,
                checkStrictly
            };

            if ("selectedRowKeys" in nextProps) {
                nextState.selectedRowKeys = nextProps.selectedRowKeys || [];
            }

            nextState.prevProps = nextProps;
        }

        return nextState;
    }

    getScrollbarSize = () => {
        return 6;
    };

    components = {
        ExpandIcon: ExpandIcon
    };

    expandIconProps = ({ rowData }) => {
        let rowKey = this.props.rowKey;
        let key = rowData[rowKey];

        return {
            rowKey: key,
            rowData,
            isLeaf: rowData.children instanceof Array ? false : true,
            loading: this.state.loadingKeys.indexOf(key) > -1
        };
    };

    /**
     * 行是否正在加载子级
     */
    isLoadingChildren = key => {
        let { loadingKeys } = this.state;

        return loadingKeys.indexOf(key) > -1;
    };

    /**
     * 设置行的子级加载状态
     */
    setLoadingChildren = (key, bl, callback) => {
        let { loadingKeys } = this.state;

        let i = loadingKeys.indexOf(key);

        let nextKeys = [...loadingKeys];

        if (bl === true) {
            if (i === -1) {
                nextKeys.push(key);
            }
        } else {
            if (i > -1) {
                nextKeys.splice(i, 1);
            }
        }

        this.setState({
            loadingKeys: nextKeys,
            data: cloneDeep(this.state.data)
        });
    };

    /**
     * 异步加载子级数据
     */
    loadChildrenData = (key, row) => {
        let fn = this.props.loadChildrenData;

        if (typeof fn === "function") {
            let res = fn(row);

            if (res && res.constructor.name === "Promise") {
                this.setLoadingChildren(key, true);

                res.then(childrens => {
                    this.setLoadingChildren(key, false);
                });

                res.catch(e => {
                    this.setLoadingChildren(key, false);
                });
            }
        }
    };

    onRowExpand = ({ expanded, rowData, rowIndex, rowKey }) => {
        if (
            rowData &&
            rowData.children instanceof Array &&
            rowData.children.length > 0
        ) {
            return;
        }

        if (expanded === true) {
            this.loadChildrenData(rowKey, rowData);
        }
    };

    headerRenderer = ({ cells, columns, headerIndex }) => {
        return (
            <TableHeader
                cells={cells}
                columns={this.state.columns}
                columnList={columns}
                columnDepth={this.state.columnDepth}
                headerIndex={headerIndex}
                headerHeight={this.state.rowHeight}
            />
        );
    };

    onScroll = ({ scrollLeft, horizontalScrollDirection }) => {};

    /** 通过rowKey获取数据行 */
    getRowsByKeys = (keys = []) => {
        let rows = [];
        let { rowKey, flatData: arr } = this.state;

        keys.forEach(k => {
            let row = arr.find(r => r[rowKey] === k);
            if (row != null) {
                rows.push(Object.assign({}, row));
            }
        });

        return rows;
    };

    /** 是否为单选 */
    isSingleSelect = () => {
        return this.state.selectMode === "single";
    };

    /** 是否为多选 */
    isMultipleSelect = () => {
        return this.state.selectMode === "multiple";
    };

    /** 当前行是否被禁用选择 */
    isDisabledSelect = key => {
        let bl = this.state.disabledSelectKeys.findIndex(d => d === key) > -1;
        return bl;
    };

    /** 是否为自动添加的扩展列 */
    isExtraColumn = (type = "") => {
        return ["__checkbox_column", "__ordernumber_column"].indexOf(type) > -1;
    };

    onSelectChange = rowKey => {
        let { selectedRowKeys } = this.state;
        let i = selectedRowKeys.indexOf(rowKey);
        let nextKeys = [].concat(selectedRowKeys);

        if (this.isDisabledSelect(rowKey)) {
            return;
        }

        if (this.isSingleSelect()) {
            if (i > -1) {
                nextKeys = [];
            } else {
                nextKeys = [rowKey];
            }
        } else if (this.isMultipleSelect()) {
            if (i > -1) {
                nextKeys.splice(i, 1);
            } else {
                nextKeys.push(rowKey);
            }
        } else {
            return;
        }

        if (typeof this.props.onSelectChange === "function") {
            this.props.onSelectChange(
                nextKeys,
                this.getRowsByKeys(nextKeys),
                rowKey
            );
        }

        this.setState({ selectedRowKeys: nextKeys });
    };

    rowEventHandlers = {
        onClick: ({ rowData, rowIndex, rowKey, event }) => {
            if (this.isSingleSelect()) {
                this.onSelectChange(rowKey);
            }

            if (this.isMultipleSelect()) {
                let { selectedRowKeys } = this.state;
                let isSelected = selectedRowKeys.indexOf(rowKey) > -1;
                let isEnabled = !this.isDisabledCheck(rowKey, rowData);
                isEnabled && this.onCheckChange(!isSelected, rowKey);
            }
        }
    };

    onCheckChange = (bl, value) => {
        if (this.state.checkStrictly === false) {
            this.onSelectChange(value);
        } else {
            if (bl === true) {
                this.addChecked(value);
            } else {
                this.removeChecked(value);
            }
        }
    };

    /** 添加复选行 */
    addChecked(key) {
        let {
            selectedRowKeys,
            rowKey,
            flatData,
            halfCheckedKeys,
            disabledSelectKeys
        } = this.state;

        let {
            selectedRowKeys: nextKeys,
            halfCheckedKeys: nextHalflCheckedKeys
        } = addCheckedKeyWithDisabled({
            key,
            selectedRowKeys,
            rowKey,
            flatData,
            halfCheckedKeys,
            disabledSelectKeys
        });

        if (typeof this.props.onSelectChange === "function") {
            this.props.onSelectChange(
                nextKeys,
                this.getRowsByKeys(nextKeys),
                rowKey
            );
        }

        this.setState({
            selectedRowKeys: nextKeys,
            halfCheckedKeys: nextHalflCheckedKeys,
            data: cloneDeep(this.state.data)
        });
    }

    /** 移除复选行 */
    removeChecked(key) {
        let { selectedRowKeys, rowKey, flatData, halfCheckedKeys } = this.state;

        let {
            selectedRowKeys: nextKeys,
            halfCheckedKeys: nextHalflCheckedKeys
        } = removeCheckedKey({
            key,
            selectedRowKeys,
            rowKey,
            flatData,
            halfCheckedKeys
        });

        if (typeof this.props.onSelectChange === "function") {
            this.props.onSelectChange(
                nextKeys,
                this.getRowsByKeys(nextKeys),
                rowKey
            );
        }

        this.setState({
            selectedRowKeys: nextKeys,
            halfCheckedKeys: nextHalflCheckedKeys,
            data: cloneDeep(this.state.data)
        });
    }

    onCheckAllChange = bl => {
        if (bl === true) {
            this.addAllChecked();
        } else {
            this.removeAllChecked();
        }
    };

    addAllChecked = () => {
        let { rowKey, flatData } = this.state;
        let nextSelected = [];
        let arr = [];

        flatData.forEach(d => {
            let k = d[rowKey];

            let bl = !this.isDisabledCheck(k, d);

            if (bl) {
                nextSelected.push(k);
                arr.push(d);
            }
        });

        if (typeof this.props.onSelectChange === "function") {
            this.props.onSelectChange(nextSelected, arr, "");
        }

        this.setState({
            selectedRowKeys: nextSelected,
            halfCheckedKeys: [],
            data: cloneDeep(this.state.data)
        });
    };

    removeAllChecked = () => {
        if (typeof this.props.onSelectChange === "function") {
            this.props.onSelectChange([], [], "");
        }

        this.setState({
            selectedRowKeys: [],
            halfCheckedKeys: [],
            data: cloneDeep(this.state.data)
        });
    };

    /** 判断行/行父级是否被禁用选中 */
    isDisabledCheck = (key, rowData) => {
        let arr = this.state.disabledSelectKeys;
        let bl = arr.indexOf(key) > -1;

        if (bl === false) {
            let parentKeys = rowData.__parents || [];

            for (let i = 0; i < parentKeys.length; i++) {
                const p = parentKeys[i];
                if (arr.indexOf(p) > -1) {
                    bl = true;
                    break;
                }
            }
        }
        return bl;
    };

    checkboxCellRender = ({ rowData }) => {
        let { rowKey, selectedRowKeys, halfCheckedKeys } = this.state;
        let key = rowData[rowKey];

        let attr = {};

        if (selectedRowKeys.indexOf(key) > -1) {
            attr.checked = true;
        }

        if (halfCheckedKeys.indexOf(key) > -1) {
            attr.indeterminate = true;
        }

        if (this.isDisabledCheck(key, rowData)) {
            attr.disabled = true;
        }

        return (
            <Checkbox
                rowData={rowData}
                value={key}
                onChange={this.onCheckChange}
                {...attr}
            />
        );
    };

    checkboxHeadRender = ({ rowData }) => {
        let { selectedRowKeys, halfCheckedKeys, flatData, rowKey } = this.state;

        let isCheckedAll = true;

        for (let i = 0; i < flatData.length; i++) {
            const key = flatData[i][rowKey];

            if (this.isDisabledCheck(key, flatData[i])) {
                continue;
            }

            if (selectedRowKeys.indexOf(key) === -1) {
                isCheckedAll = false;
                break;
            }
        }

        let attr = {};

        if (isCheckedAll === true) {
            attr.checked = true;
        } else {
            if (selectedRowKeys.length > 0 || halfCheckedKeys.length > 0) {
                attr.indeterminate = true;
            }
        }

        return (
            <Checkbox
                rowData={rowData}
                {...attr}
                onChange={this.onCheckAllChange}
            />
        );
    };

    orderNumberCellRender = ({ rowIndex }) => {
        return <span>{rowIndex + 1}</span>;
    };

    rowClassName = ({ rowData, rowIndex }) => {
        let { rowKey, selectedRowKeys } = this.state;
        let key = rowData[rowKey];
        let isSelected = false;

        if (selectedRowKeys.indexOf(key) > -1) {
            isSelected = true;
        }

        let cls = [];

        if (rowIndex % 2 === 0) {
            cls.push("table__row--even");
        } else {
            cls.push("table__row--odd");
        }

        if (isSelected) {
            cls.push("table__row--selected");
        }

        let tempCls = "";
        if (typeof this.props.rowClassName === "function") {
            tempCls = this.props.rowClassName(record, index);
        }

        tempCls && cls.push(tempCls);

        return cls.join(" ");
    };

    tableApi = {
        getSelectedKeys: () => {
            return this.state.selectedRowKeys;
        }
    };

    render() {
        let props = this.props;

        let expandColumnKey = this.props.expandColumnKey;

        if (!expandColumnKey && this.props.columns.length > 0) {
            expandColumnKey = this.props.columns[0].dataKey;
        }

        let { columnDepth, columnList, data, rowHeight } = this.state;

        let checkboxColumn = columnList.find(
            d => d.__type === "__checkbox_column"
        );
        let orderNumberColumn = columnList.find(
            d => d.__type === "__ordernumber_column"
        );

        if (checkboxColumn) {
            checkboxColumn.cellRenderer = this.checkboxCellRender;
            checkboxColumn.headerRenderer = this.checkboxHeadRender;
        }

        if (orderNumberColumn) {
            orderNumberColumn.cellRenderer = this.orderNumberCellRender;
        }

        return (
            <BaseTable
                {...props}
                fixed={true}
                data={data}
                columns={columnList}
                expandColumnKey={expandColumnKey}
                className="table__striped"
                classPrefix="table"
                getScrollbarSize={this.getScrollbarSize}
                expandIconProps={this.expandIconProps}
                components={this.components}
                onRowExpand={this.onRowExpand}
                rowHeight={rowHeight}
                headerHeight={[(columnDepth + 1) * rowHeight]}
                headerRenderer={this.headerRenderer}
                onScroll={this.onScroll}
                rowEventHandlers={this.rowEventHandlers}
                rowClassName={this.rowClassName}
                overscanRowCount={2}
            />
        );
    }
}

const AutoResizeTable = props => {
    return (
        <AutoResizer>
            {({ width, height }) => (
                <Table {...props} width={width} height={height} />
            )}
        </AutoResizer>
    );
};

AutoResizeTable.defaultProps = {
    rowKey: "key",
    columns: [],
    dataSource: [],
    selectMode: "single",
    selectedRowKeys: [],
    disabledSelectKeys: [],
    orderNumber: false,
    checkStrictly: true,
    resizable: true
};

AutoResizeTable.propTypes = {
    rowKey: PropTypes.string.isRequired,
    columns: PropTypes.array,
    dataSource: PropTypes.array,
    /** 选择模式：多选 单选 不可选择 */
    selectMode: PropTypes.oneOf(["multiple", "single", "none"]),
    /** 选中的行键值 */
    selectedRowKeys: PropTypes.array,
    /** 将被禁用选中的行key */
    disabledSelectKeys: PropTypes.array,
    /**
     * 行选择事件
     *  (selectedKeys,selectedRows,triggerKey) => void
     * */
    onSelectChange: PropTypes.func,
    /** 是否显示序号列 */
    orderNumber: PropTypes.bool,
    /** 列是否可设置宽度，优先级小于column.resizable */
    resizable: PropTypes.bool,
    /** 多选模式是否级联控制checkbox选中状态 */
    checkStrictly: PropTypes.bool,
    /** table实例回调
     * (ins:React.Element) => void
     */
    initRef: PropTypes.func
};

export default AutoResizeTable;
