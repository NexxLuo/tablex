import React from "react";
import PropTypes from "prop-types";
import { Pagination, Button } from "../../widgets";
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
    if (typeof this.props.onShowSizeChange === "function") {
      this.props.onShowSizeChange(pageIndex, pageSize);
    } else {
      if (typeof this.props.onPageChange === "function") {
        this.props.onPageChange(pageIndex, pageSize);
      }
    }
  };

  onRefresh = () => {
    let { current, pageSize } = this.state;
    if (typeof this.props.onRefresh === "function") {
      this.props.onRefresh(current, pageSize);
    }
    if (typeof this.props.onPageChange === "function") {
      this.props.onPageChange(current, pageSize);
    }
  };

  onPageIndexChange = (pageIndex, pageSize) => {
    if (typeof this.props.onChange === "function") {
      this.props.onChange(pageIndex, pageSize);
    } else {
      if (typeof this.props.onPageChange === "function") {
        this.props.onPageChange(pageIndex, pageSize);
      }
    }
  };

  render() {
    let { pageSize, current, total } = this.state;
    let { showRefresh } = this.props;
    let pagerAttr = {
      ...this.props,
      onShowSizeChange: this.onShowSizeChange,
      onChange: this.onPageIndexChange,
      pageSize,
      current,
      total
    };

    let refreshButton =
      showRefresh === true ? (
        <Button
          className="tablex-pagination-refresh"
          icon="reload"
          onClick={this.onRefresh}
        />
      ) : null;

    let start = pageSize * (current - 1) + 1;
    let end = pageSize * current;
    end = end > total ? total : end;

    let totalCount = total;

    if (total <= 0) {
      start = 0;
      end = 0;
      totalCount = 0;
    }

    let intlStr = this.props.intl.totalInfo;

    intlStr = intlStr
      .replace("{0}", start)
      .replace("{1}", end)
      .replace("{2}", totalCount);

    let totalInfo = <div className="tablex__pager__count">{intlStr}</div>;

    return (
      <div className="tablex__pager">
        <div className="tablex__pager__number">
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
  pageSizeOptions: ["10", "20", "30", "50", "100", "200"],
  showSizeChanger: true,
  showRefresh: true,
  onPageChange: () => {},
  intl: {
    totalInfo: "显示 {0}-{1}，共 {2} 条"
  }
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
  pageSizeOptions: PropTypes.array,
  /** 是否显示刷新按钮 */
  showRefresh: PropTypes.bool
};

export default Pager;
