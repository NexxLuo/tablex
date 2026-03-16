import React from "react";
import {
  Button as AButton,
  Modal as AModal,
  Menu as AMenu,
  Checkbox as ACheckbox,
  Tooltip as ATooltip,
  Pagination as APagination,
  InputNumber as AInputNumber,
  Radio as ARadio,
  Switch as ASwitch,
  message as Amessage,
  Popconfirm as APopconfirm,
  Dropdown as ADropdown,
  Spin as ASpin,
  Popover as APopover,
  Select as ASelect
} from "antd";

import * as Icons from "@ant-design/icons";

import "./style.css";

// Icon 组件从 @ant-design/icons 导入
const Icon = (props) => {
  const { type, ...rest } = props;
  const IconComponent = Icons[type];
  if (IconComponent) {
    return <IconComponent {...rest} />;
  }
  return null;
};

function Button(props) {
  const { prefixCls = "tablex-btn", ...rest } = props;
  return <AButton {...rest} prefixCls={prefixCls} />;
}

function Modal(props) {
  const { prefixCls = "tablex-modal", ...rest } = props;
  return <AModal {...rest} prefixCls={prefixCls} />;
}

function Menu(props) {
  const { prefixCls = "tablex-menu", ...rest } = props;
  return <AMenu {...rest} prefixCls={prefixCls} />;
}

Menu.SubMenu = AMenu.SubMenu;
Menu.Item = AMenu.Item;

function Checkbox(props) {
  const { prefixCls = "tablex-checkbox", ...rest } = props;
  return <ACheckbox {...rest} prefixCls={prefixCls} />;
}

function Tooltip(props) {
  const { prefixCls = "tablex-tooltip", ...rest } = props;
  return <ATooltip {...rest} prefixCls={prefixCls} />;
}

function Pagination(props) {
  const { prefixCls = "tablex-pagination", ...rest } = props;
  return <APagination {...rest} prefixCls={prefixCls} />;
}

function InputNumber(props) {
  const { prefixCls = "tablex-input-number", ...rest } = props;
  return <AInputNumber {...rest} prefixCls={prefixCls} />;
}

function Radio(props) {
  const { prefixCls = "tablex-radio", ...rest } = props;
  return <ARadio {...rest} prefixCls={prefixCls} />;
}

function RadioGroup(props) {
  const { prefixCls = "tablex-radio", ...rest } = props;
  return <ARadio.Group {...rest} prefixCls={prefixCls} />;
}

function RadioButton(props) {
  const { prefixCls = "tablex-radio-button", ...rest } = props;
  return <ARadio.Button {...rest} prefixCls={prefixCls} />;
}

Radio.Group = RadioGroup;
Radio.Button = RadioButton;

function Switch(props) {
  const { prefixCls = "tablex-switch", ...rest } = props;
  return <ASwitch {...rest} prefixCls={prefixCls} />;
}

function message(props) {
  return <Amessage {...props} />;
}

message.error = Amessage.error;
message.warn = Amessage.warning; // antd v6 中使用 warning 代替 warn
message.info = Amessage.info;
message.success = Amessage.success;

function Popconfirm(props) {
  return <APopconfirm {...props} />;
}

function Dropdown(props) {
  const { prefixCls = "tablex-dropdown", ...rest } = props;
  return <ADropdown {...rest} prefixCls={prefixCls} />;
}

function Spin(props) {
  const { prefixCls = "tablex-spin", ...rest } = props;
  return <ASpin {...rest} prefixCls={prefixCls} />;
}

function Popover(props) {
  const { prefixCls = "tablex-popover", ...rest } = props;
  return <APopover {...rest} prefixCls={prefixCls} />;
}

function Select(props) {
  const { prefixCls = "tablex-select", ...rest } = props;
  return <ASelect {...rest} prefixCls={prefixCls} />;
}

export {
  Button,
  Modal,
  Menu,
  Checkbox,
  Tooltip,
  Pagination,
  InputNumber,
  Radio,
  Switch,
  message,
  Popconfirm,
  Dropdown,
  Icon,
  Spin,
  Popover,
  Select
};
