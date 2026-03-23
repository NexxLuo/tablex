import React, { Component } from "react";

const isEmptyString = (str) => {
  if (typeof str === "number" && !Number.isNaN(str)) {
    return false;
  }
  if (typeof str === "string" && str.trim().length > 0) {
    return false;
  }
  return true;
};

class ContextMenu extends Component {
  _ref = React.createRef(null);

  state = { rowIndex: null, rowColumns: [] };

  rafId = null;
  hideTimer = null;
  leaveDelayTimer = null;

  // 内部状态，不触发 React 更新
  el = null;
  isVisible = false;

  // 当前渲染的位置
  renderX = 0;
  renderY = 0;

  // 目标位置
  targetX = 0;
  targetY = 0;

  // 是否暂停跟随（鼠标进入浮层时暂停）
  isPaused = false;

  // 偏移量配置
  static defaultProps = {
    offsetX: 10,          // 水平偏移
    offsetY: 0,           // 垂直偏移
    leaveDelay: 200,      // 鼠标离开浮层后的延迟隐藏时间(ms)
    followDelay: 150      // 位置跟随延迟(ms)，让浮层落后鼠标，便于用户移入
  };


  getRowTextContent = (rowIndex, rowColumns, activeColumn) => {
    const num = Number(rowIndex);
    if (typeof num === "number" && !Number.isNaN(num)) {
      const container = this._ref.current?.parentElement;
      if (container) {
        const columnsTitleMap = {};
        if (rowColumns instanceof Array) {
          rowColumns.map(d => {
            if (d.columnKey && d.title) {
              columnsTitleMap[d.columnKey] = d.title;
            }
          });
        }

        let rows = container.querySelectorAll(".tablex-table-row-" + num);
        let columns = [];
        for (let i = 0; i < rows.length; i++) {
          const row_element = rows[i];
          let cells = row_element.querySelectorAll(".tablex-table-row-cell");
          for (let j = 0; j < cells.length; j++) {
            const cell_element = cells[j];
            const ck = cell_element.dataset?.columnkey;
            if (ck && ck !== "__ordernumber_column") {
              const column_value = cell_element.innerText || cell_element.textContent || "";
              if (!isEmptyString(column_value)) {
                columns.push({
                  title: columnsTitleMap[ck] || ck,
                  columnKey: ck,
                  value: column_value,
                  actived: activeColumn === ck
                });
              }
            }
          }
        }
        return columns;
      }
    }
    return [];
  }

  show = ({ left, top, data }) => {
    // 1. 数据变化才触发 React 更新
    if (data?.rowIndex !== this.state.rowIndex) {
      const columns = this.getRowTextContent(data?.rowIndex, data?.rowColumns, data?.dataIndex);
      this.setState({ rowIndex: data?.rowIndex, rowColumns: columns });
    }

    // 2. 清除隐藏定时器
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // 3. 如果处于暂停状态（鼠标在浮层内），不更新位置
    if (this.isPaused) {
      return;
    }

    // 4. 更新目标位置（添加偏移量）
    this.targetX = left + (this.props.offsetX || 0);
    this.targetY = top + (this.props.offsetY || 0);

    // 5. 延迟调度位置更新（让浮层落后鼠标，用户可以从后面移入）
    this.schedulePositionUpdate();
  };

  // 调度位置更新，延迟执行让浮层落后鼠标
  schedulePositionUpdate = () => {
    if (this.rafId) return;

    const { followDelay } = this.props;

    this.rafId = setTimeout(() => {
      this.rafId = null;
      requestAnimationFrame(() => {
        this.flushPosition();
      });
    }, followDelay);
  };

  // 刷新位置到 DOM
  flushPosition = () => {
    if (!this.el) {
      this.el = this._ref.current;
      if (!this.el) return;
    }

    const el = this.el;
    const tx = Math.round(this.targetX);
    const ty = Math.round(this.targetY);

    // 首次显示
    if (!this.isVisible) {
      this.isVisible = true;
      this.renderX = this.targetX;
      this.renderY = this.targetY;

      el.style.display = "block";
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      el.style.opacity = "1";

      return;
    }

    // 计算与上次渲染位置的距离
    const dx = Math.abs(this.targetX - this.renderX);
    const dy = Math.abs(this.targetY - this.renderY);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 更新记录的位置
    this.renderX = this.targetX;
    this.renderY = this.targetY;

    // 大幅移动(>60px)无动画，小幅移动有动画
    if (distance > 60) {
      el.style.transition = "none";
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    } else {
      el.style.transition = "transform 80ms ease-out";
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
  };

  hide = () => {
    const hideDelay = 300;
    if (this.rafId) {
      clearTimeout(this.rafId);
      this.rafId = null;
    }

    const doHide = () => {
      if (!this.isPaused) {
        this.isVisible = false;
        this.isPaused = false;
        if (this.el) {
          if (this.props.hideMode === "hidden") {
            this.el.style.visibility = "hidden";
            this.el.style.height = "0px";
            this.el.style.width = "0px";
            this.el.style.overflow = "hidden";
          } else {
            this.el.style.display = "none";
          }
          this.el.style.opacity = "0";
        }
      }
    };

    if (typeof hideDelay === "number" && hideDelay > 0) {
      this.hideTimer = setTimeout(doHide, hideDelay);
    } else {
      doHide();
    }
  };

  onClick = () => {
    if (this.props.autoHideOnClick !== false) {
      this.hide();
    }
  };

  // 鼠标进入浮层时，取消延迟隐藏并暂停跟随
  handleMouseEnter = () => {
    if (this.leaveDelayTimer) {
      clearTimeout(this.leaveDelayTimer);
      this.leaveDelayTimer = null;
    }
    // 暂停位置跟随，让浮层固定
    this.isPaused = true;
  };

  // 鼠标离开浮层时，延迟隐藏
  handleMouseLeave = () => {
    const { leaveDelay } = this.props;

    this.leaveDelayTimer = setTimeout(() => {
      this.leaveDelayTimer = null;
      // 恢复跟随并隐藏
      this.isPaused = false;
      this.hide();
    }, leaveDelay);
  };

  outsideClick = (e) => {
    const container = this._ref.current;
    if (container && typeof container.contains === "function" && !container.contains(e.target)) {
      this.hide();
    }
  };

  componentWillUnmount() {
    this.isVisible = false;
    this.isPaused = false;

    if (this.rafId) {
      clearTimeout(this.rafId);
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    if (this.leaveDelayTimer) {
      clearTimeout(this.leaveDelayTimer);
    }

    this.el = null;

    if (this.props.autoHideOnBlur !== false) {
      window.document.removeEventListener("mousedown", this.outsideClick);
    }
  }

  componentDidMount() {
    this.el = this._ref.current;

    if (this.props.autoHideOnBlur !== false) {
      window.document.addEventListener("mousedown", this.outsideClick);
    }
  }

  render() {
    const { rowColumns } = this.state;

    return (
      <div
        className="tablex-row-content-tip-wrapper"
        ref={this._ref}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          display: "none",
          opacity: 0,
          willChange: "transform",
          pointerEvents: "auto",
          zIndex: 9999
        }}
      >
        {
          rowColumns.length > 0 && (
            <div className="tablex-row-content-tip">
              {rowColumns.map((column, index) => {
                return (
                  <div key={index} className="tablex-row-content-tip-item" >
                    {column.title}:{column.value}
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    );
  }
}

export default ContextMenu;
