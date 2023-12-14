import React from "react";

import { Menu, Checkbox } from "../widgets";
import { treeForEach } from "./setting/utils";

const SubMenu = Menu.SubMenu;

const MenuBar = () => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      focusable="false"
      class=""
      data-icon="bars"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 1 0 112 0 56 56 0 1 0-112 0zm0 284a56 56 0 1 0 112 0 56 56 0 1 0-112 0zm0 284a56 56 0 1 0 112 0 56 56 0 1 0-112 0z" />
    </svg>
  );
};

const MenuIcon = () => {
  return (
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"></path>
    </svg>
  );
};

export const ColumnDropMenuButton = props => {
  return (
    <span {...props} className="tablex__head__cell__title__dropdown">
      <MenuIcon />
    </span>
  );
};

class HeadDropMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: []
    };
    this.stateRef = React.createRef(null);
    this.stateRef.current = {
      isOnClick: false
    };
  }

  onChange = (columnKey, config) => {
    if (typeof this.props.onChange === "function") {
      this.props.onChange(columnKey, config);
    }
  };

  onFilterColumnChange = (checked, key) => {

    if (typeof this.props.onHiddenChange === "function") {
      this.props.onHiddenChange(key, !checked);
    }

    if (this.props.hiddenControled !== true) {
      this.onChange(key, {
        hidden: !checked
      });
    }

  };

  columnsFilter = () => {
    let { columns: arr, columnsConfig, getColumns } = this.props;

    let columns = [];

    if (arr instanceof Array) {
      columns = arr.filter(d => { return d.settable !== false && d.visibleSettable !== false });
    }

    let _columns = columns;

    if (typeof getColumns === "function") {
      let __columns = getColumns(arr, columns);
      if (__columns instanceof Array) {
        _columns = __columns;
      }
    }

    const columnsOptions = [];
    let defaultChecked = [];

    if (_columns instanceof Array) {

      treeForEach(_columns, (c, i, o) => {
        let columnKey = c.key || c.dataIndex;

        let isHide = false;

        let config = (columnsConfig || {})[columnKey] || {};

        isHide = !!config.hidden;

        if ("hidden" in config) {
          isHide = !!config.hidden;
        } else {
          isHide = !!c.hidden;
        }

        if (isHide === false) {
          defaultChecked.push(columnKey);
        }

        let TitleComponent = c.title;
        let titleElement = null;

        if (typeof TitleComponent === "function") {
          titleElement = <TitleComponent column={c} />;
        } else {
          titleElement = c.title;
        }

        columnsOptions.push(
          <div key={columnKey} style={{ display: "block", marginLeft: o.depth * 24 }}>
            <Checkbox
              checked={!isHide}
              value={columnKey}
              onChange={e => {
                this.onFilterColumnChange(e.target.checked, columnKey);
              }}
            >
              {titleElement}
            </Checkbox>
          </div>
        );
      })

    }
    let columnsFilterItems = null;
    if (columnsOptions.length > 0) {
      columnsFilterItems = (
        <div style={{ marginLeft: 10 }}>{columnsOptions}</div>
      );
    }

    return columnsFilterItems;
  };

  handleClick = ({ item, key, keyPath, domEvent }) => {
    let { columnKey } = this.props;

    let config = {
      1: {
        fixed: "left"
      },
      2: {
        fixed: "right"
      },
      3: {
        fixed: false
      },
      6: {
        grouped: true
      },
      7: {
        grouped: false
      },
      8: {
        grouped: "none"
      }
    }[key];

    config && this.onChange(columnKey, config);

    domEvent.stopPropagation();
  };

  onTitleClick({ key, domEvent }) {
    domEvent.stopPropagation();
  }

  onItemClick = () => {
    this.stateRef.current.isOnClick = true;
  };

  render() {
    let styles = { height: "auto", lineHeight: "normal", padding: "0px 10px" };

    let { fixable, filterable, groupable } = this.props.options;

    let filterableColumns = this.columnsFilter();

    return (
      <div className="tablex__column__dropMenu">
        <Menu
          forceSubMenuRender={false}
          onClick={this.handleClick}
          selectable={false}
          style={{ width: 160 }}
          mode="vertical"
          openKeys={this.state.openKeys}
          onOpenChange={keys => {
            if (this.stateRef.current.isOnClick === true && keys.length === 0) {
              this.stateRef.current.isOnClick = false;
              return;
            }
            this.stateRef.current.isOnClick = false;
            this.setState({ openKeys: keys });
          }}
        >
          {fixable && (
            <SubMenu
              key="sub1"
              title={this.props.intl["columnMenuFixed"]}
              onTitleClick={this.onTitleClick}
            >
              <Menu.Item key="1" style={styles}>
                {this.props.intl["columnMenuFixedLeft"]}
              </Menu.Item>
              <Menu.Item key="2" style={styles}>
                {this.props.intl["columnMenuFixedRight"]}
              </Menu.Item>
              <Menu.Item key="3" style={styles}>
                {this.props.intl["columnMenuFixedReset"]}
              </Menu.Item>
            </SubMenu>
          )}
          {(filterable && filterableColumns !== null) ? (
            <SubMenu
              key="sub2"
              title={this.props.intl["columnMenuVisible"]}
              onTitleClick={this.onTitleClick}
            >
              <Menu.Item key="4" style={styles} onClick={this.onItemClick}>
                {filterableColumns}
              </Menu.Item>
            </SubMenu>
          ) : null}
          {groupable && (
            <SubMenu
              key="sub3"
              title={this.props.intl["columnMenuGroup"]}
              onTitleClick={this.onTitleClick}
            >
              <Menu.Item key="6" style={styles}>
                {this.props.intl["columnMenuGroupAdd"]}
              </Menu.Item>
              <Menu.Item key="7" style={styles}>
                {this.props.intl["columnMenuGroupRemove"]}
              </Menu.Item>
              <Menu.Item key="8" style={styles}>
                {this.props.intl["columnMenuGroupReset"]}
              </Menu.Item>
            </SubMenu>
          )}
        </Menu>
      </div>
    );
  }
}

HeadDropMenu.defaultProps = {
  intl: {
    settingTitle: "表格配置",
    settingReset: "重置",
    settingOk: "确定",
    settingWidth: "宽度：",
    settingFixed: "冻结：",
    settingFixedLeft: "左",
    settingFixedNone: "无",
    settingFixedRight: "右",
    settingVisible: "显示",
    settingHidden: "隐藏",
    settingFixedNone: "表格配置"
  }
};

export default HeadDropMenu;
