import React from "react";

import { Menu, Checkbox } from "../widgets";

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
      class=""
      data-icon="menu"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z" />
    </svg>
  );
};

export const ColumnDropMenuButton = props => {
  return (
    <span {...props}>
      <MenuIcon />
    </span>
  );
};

class HeadDropMenu extends React.Component {
  onChange = (columnKey, config) => {
    if (typeof this.props.onChange === "function") {
      this.props.onChange(columnKey, config);
    } else {
    }
  };

  onFilterColumnChange = (checked, key) => {
    this.onChange(key, {
      hidden: !checked
    });
  };

  columnsFilter = () => {
    let { columns: arr, columnsConfig } = this.props;

    let columns = arr; //.filter(d => !!d.title)

    const columnsOptions = [];
    let defaultChecked = [];

    columns.forEach((c, i) => {
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
        <div key={i} style={{ display: "block" }}>
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
    });

    const columnsFilterItems = (
      <div style={{ marginLeft: 10 }}>{columnsOptions}</div>
    );

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

  render() {
    let styles = { height: "auto", lineHeight: "normal", padding: "0px 10px" };

    let { pinable, filterable, groupable } = this.props.options;

    return (
      <div className="tablex__column__dropMenu">
        <Menu
          forceSubMenuRender={false}
          onClick={this.handleClick}
          selectable={false}
          style={{ width: 160 }}
          mode="vertical"
        >
          {pinable && (
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
          {filterable && (
            <SubMenu
              key="sub2"
              title={this.props.intl["columnMenuVisible"]}
              onTitleClick={this.onTitleClick}
            >
              <Menu.Item key="4" style={styles}>
                {this.columnsFilter()}
              </Menu.Item>
            </SubMenu>
          )}
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
