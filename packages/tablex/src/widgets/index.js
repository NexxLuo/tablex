import React from "react";
import AButton from "antd/lib/button";
import AModal from "antd/lib/modal";
import AMenu from "antd/lib/menu";
import ACheckbox from "antd/lib/checkbox";
import ATooltip from "antd/lib/tooltip";
import APagination from "antd/lib/pagination";

import AInputNumber from "antd/lib/input-number";
import ARadio from "antd/lib/radio";
import ASwitch from "antd/lib/switch";
import Amessage from "antd/lib/message";
import APopconfirm from "antd/lib/popconfirm";
import ADropdown from "antd/lib/dropdown";
import AIcon from "antd/lib/icon";
import ASpin from "antd/lib/spin";
import APopover from "antd/lib/popover";
import ASelect from "antd/lib/select";

import "./style.css";

import "antd/lib/select/style/css"; // 加载 CSS
import "antd/lib/popconfirm/style/css"; // 加载 CSS


function Button(props) {
  return <AButton {...props} />;
}

function Modal(props) {
  return <AModal {...props} />;
}
function Menu(props) {
  return <AMenu {...props} />;
}

Menu.SubMenu = AMenu.SubMenu;
Menu.Item = AMenu.Item;

function Checkbox(props) {
  return <ACheckbox {...props} />;
}
function Tooltip(props) {
  return <ATooltip {...props} />;
}
function Pagination(props) {
  return <APagination {...props} />;
}
function InputNumber(props) {
  return <AInputNumber {...props} />;
}
function Radio(props) {
  return <ARadio {...props} />;
}

function RadioGroup(props) {
  return <ARadio.Group {...props} />;
}

function RadioButton(props) {
  return <ARadio.Button {...props} />;
}



Radio.Group = RadioGroup;
Radio.Button = RadioButton;

function Switch(props) {
  return <ASwitch {...props} />;
}

function message(props) {
  return <Amessage {...props} />;
}

message.error = Amessage.error;
message.warn = Amessage.warn;
message.info = Amessage.info;

function Popconfirm(props) {
  return <APopconfirm {...props} />;
}

function Dropdown(props) {
  return <ADropdown {...props} />;
}

function Icon(props) {
  return <AIcon {...props} />;
}

function Spin(props) {
  return <ASpin {...props} />;
}

function Popover(props) {
  return <APopover {...props} />;
}

function Select(props) {
  return <ASelect {...props} />;
}

RadioGroup.defaultProps = {
  prefixCls: "tablex-radio"
};

RadioButton.defaultProps = {
  prefixCls: "tablex-radio-button"
};

Button.defaultProps = {
  prefixCls: "tablex-btn"
};

Modal.defaultProps = {
  prefixCls: "tablex-modal"
};

Menu.defaultProps = {
  prefixCls: "tablex-menu"
};

Checkbox.defaultProps = {
  prefixCls: "tablex-checkbox"
};

Tooltip.defaultProps = {
  prefixCls: "tablex-tooltip"
};

Pagination.defaultProps = {
  prefixCls: "tablex-pagination"
};

InputNumber.defaultProps = {
  prefixCls: "tablex-input-number"
};

Radio.defaultProps = {
  prefixCls: "tablex-radio"
};

Switch.defaultProps = {
  prefixCls: "tablex-switch"
};

message.defaultProps = {
  prefixCls: "tablex-message"
};

// Popconfirm.defaultProps = {
//   prefixCls: "tablex-popconfirm"
// };

Dropdown.defaultProps = {
  prefixCls: "tablex-dropdown"
};

Spin.defaultProps = {
  prefixCls: "tablex-spin"
};

Popover.defaultProps = {
  prefixCls: "tablex-popover"
};

Select.defaultProps = {
  prefixCls: "tablex-select"
};

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
  Popover
};
