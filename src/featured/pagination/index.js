import React from "react";
import PropTypes from "prop-types";

import Pagination from "antd/lib/pagination";
import Button from "antd/lib/button";
import "./styles.css";

class Pager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.current || 1,
      pageSize: props.pageSize,
      total: props.total
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if ("current" in nextProps) {
      nextState.current = nextProps.current;
    }

    if ("pageSize" in nextProps) {
      nextState.pageSize = nextProps.pageSize;
    }

    if ("total" in nextProps) {
      nextState.total = nextProps.total;
    }

    if (Object.keys(nextState).length > 0) {
      return nextState;
    }

    return null;
  }

  onShowSizeChange = (pageIndex, pageSize) => {
    if (typeof this.props.onPageChange === "function") {
      this.props.onPageChange(pageIndex, pageSize);
    }
  };

  onRefresh = () => {
    let { current, pageSize } = this.state;

    if (typeof this.props.onRefresh === "function") {
      this.props.onRefresh(current, pageSize);
    }
  };

  onPageIndexChange = (pageIndex, pageSize) => {
    if (typeof this.props.onPageChange === "function") {
      this.props.onPageChange(pageIndex, pageSize);
    }
  };

  render() {
    let { pageSize, current, total } = this.state;

    let pagerAttr = {
      ...this.props,
      showSizeChanger: true,
      onShowSizeChange: this.onShowSizeChange,
      onChange: this.onPageIndexChange,
      pageSize,
      current,
      total
    };

    let refreshButton = (
      <Button
        style={{ verticalAlign: "middle" }}
        icon="reload"
        onClick={this.onRefresh}
      />
    );

    let start = pageSize * (current - 1) + 1;
    let end = pageSize * current;
    end = end > total ? total : end;

    let totalCount = total;

    if (total <= 0) {
      start = 0;
      end = 0;
      totalCount = 0;
    }

    let totalInfo = (
      <div className="tablex__pager__count">
        显示 {start}-{end}，共 {totalCount} 条
      </div>
    );

    return (
      <div className="tablex__pager">
        <div className="table__pager__number">
          <Pagination {...pagerAttr} />
          {refreshButton}
        </div>
        {totalInfo}
      </div>
    );
  }
}

Pager.defaultProps = {
  current: 1,
  pageSize: 10,
  total: 0,
  pageSizeOptions: ["10", "20", "30", "40"],
  onPageChange: () => {}
};

Pager.propTypes = {
  /** 当前页数 */
  current: PropTypes.number.isRequired,
  /** 每页条数 */
  pageSize: PropTypes.number.isRequired,
  /** 数据总数 */
  total: PropTypes.number,
  /** 页码，页大小改变事件 */
  onPageChange: PropTypes.func,
  /** 指定每页可以显示多少条 */
  pageSizeOptions: PropTypes.array
};

export default Pager;
