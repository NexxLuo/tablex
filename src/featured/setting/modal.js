import React, { Component } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import InputNumber from "antd/lib/input-number";
import Radio from "antd/lib/radio";
import Switch from "antd/lib/switch";
import { saveSetting, clearSettings, treeToList } from "./utils";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import cloneDeep from "lodash/cloneDeep";
import orderBy from "lodash/orderBy";

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: 5,

  background: isDragging ? "#fce2c9" : "none",
  width: "100%",
  ...draggableStyle
});

const getListStyle = () => ({
  width: "100%"
});

class SortableItem extends Component {
  onChangeWidth = e => {
    let { onChangeWidth, data } = this.props;
    onChangeWidth(e, data);
  };

  onChangeFixed = e => {
    let { onChangeFixed, data } = this.props;
    onChangeFixed(e, data);
  };

  onToggleVisible = e => {
    let { onToggleVisible, data } = this.props;
    onToggleVisible(e, data);
  };

  render() {
    let itemStyles = {
      display: "inline-block",
      marginLeft: 10
    };

    let d = this.props.data;

    return (
      <div
        style={{
          borderBottom: "1px solid #e8e8e8",
          width: "100%",
          marginBottom: 5,
          paddingBottom: 10
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "30%",
            fontWeight: "bold",
            padding: "5px 0 0px 0px"
          }}
        >
          {d.title}
        </div>
        <div
          style={{ display: "inline-block", width: "70%", textAlign: "right" }}
        >
          <div style={itemStyles}>
            宽度：
            <InputNumber
              value={d.width}
              style={{ width: 80 }}
              onChange={this.onChangeWidth}
            />
          </div>
          <div style={itemStyles}>
            冻结：
            <RadioGroup
              size="small"
              value={d.fixed || "none"}
              onChange={this.onChangeFixed}
            >
              <RadioButton value="left">左</RadioButton>
              <RadioButton value="none">无</RadioButton>
              <RadioButton value="right">右</RadioButton>
            </RadioGroup>
          </div>

          <div style={{ ...itemStyles, position: "relative", bottom: "2px" }}>
            <Switch
              checkedChildren="显示"
              checked={!d.hidden}
              unCheckedChildren="隐藏"
              onChange={this.onToggleVisible}
            />
          </div>
        </div>
      </div>
    );
  }
}

class SortableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return { items: nextProps.items };
  }

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.props.onSort(items);
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.state.items.map((item, index) => (
                <Draggable
                  key={item.key || item.dataIndex}
                  draggableId={item.key || item.dataIndex}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <SortableItem
                        data={item}
                        onChangeWidth={this.props.onChangeWidth}
                        onChangeFixed={this.props.onChangeFixed}
                        onToggleVisible={this.props.onToggleVisible}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

class SettingModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      propsOriginal: {},
      visible: false,
      loading: false,
      resetLoading: false,
      configs: {},
      rawConfigs: {},
      columns: [],
      columnsOriginal: [],
      columnsLeafs: []
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.propsOriginal !== nextProps) {
      let nextState = {};

      nextState.propsOriginal = nextProps;

      let arr = nextProps.columns || [];

      nextState.columnsOriginal = arr;

      let columns = cloneDeep(arr);

      nextState.rawConfigs = nextProps.configs || {};
      let configs = cloneDeep(nextProps.configs || {});

      let { leafs } = treeToList(columns);

      leafs.forEach((d, i) => {
        let columnKey = d.key || d.dataIndex;
        let config = configs[columnKey] || {};
        if ("fixed" in config) {
          d.fixed = config.fixed;
        }
        if ("width" in config) {
          d.width = config.width;
        }
        if ("hidden" in config) {
          d.hidden = config.hidden;
        }

        if ("order" in config) {
          d.order = config.order;
        } else {
          d.order = i;
        }
      });

      let columnsArr = orderBy(columns, ["order"], ["asc"]);
      nextState.columns = columnsArr;

      leafs = orderBy(leafs, ["order"], ["asc"]);

      nextState.columnsLeafs = leafs;

      nextState.configs = configs;

      return nextState;
    } else {
      let nextState = {};

      let columns = prevState.columns;
      let { leafs } = treeToList(columns);
      let configs = prevState.configs;

      leafs.forEach((d, i) => {
        let columnKey = d.key || d.dataIndex;
        let config = configs[columnKey] || {};
        if ("fixed" in config) {
          d.fixed = config.fixed;
        }
        if ("width" in config) {
          d.width = config.width;
        }
        if ("hidden" in config) {
          d.hidden = config.hidden;
        }

        if ("order" in config) {
          d.order = config.order;
        } else {
          d.order = i;
        }
      });
      nextState.columnsLeafs = leafs;

      return nextState;
    }
  }

  saveSettings = () => {
    var { tableId, onSave, groupedColumnKey } = this.props;

    if (!tableId) {
      return;
    }

    this.setState({ loading: true });

    let { columns, configs } = this.state;

    saveSetting(
      tableId,
      { configs: configs, groupedColumnKey: groupedColumnKey || null },
      undefined
    ).then(d => {
      if (typeof onSave === "function") {
        onSave(configs);
      }
      this.setState({ loading: false, visible: false });
    });
  };

  reset = () => {
    var { tableId, onReset } = this.props;

    if (!tableId) {
      return;
    }

    this.setState({ resetLoading: true });

    clearSettings(tableId, undefined).then(d => {
      if (typeof onReset === "function") {
        onReset();
      }
      this.setState({ resetLoading: false });
    });
  };

  toggle = () => {
    let v = !this.state.visible;
    this.setState({ visible: v });
  };

  onOk = () => {
    this.saveSettings();
  };

  onCancel = () => {
    this.setState({
      visible: false,
      columns: cloneDeep(this.state.columnsOriginal),
      configs: cloneDeep(this.state.rawConfigs)
    });
  };

  setConfig = (column, config) => {
    let configs = this.state.configs || {};

    let columnKey = column.key || column.dataIndex;

    let prevConfig = configs[columnKey] || {};
    let nextConfig = {
      [columnKey]: Object.assign({}, prevConfig, config)
    };

    this.setState({
      configs: { ...configs, ...nextConfig }
    });
  };

  onChangeWidth = (value, column) => {
    this.setConfig(column, { width: value });
  };

  onChangeFixed = (e, column) => {
    this.setConfig(column, { fixed: e.target.value });
  };

  onToggleVisible = (bl, column) => {
    this.setConfig(column, { hidden: !bl });
  };

  onSort = items => {
    let configs = this.state.configs || {};

    items.forEach((d, index) => {
      // d.order = index;

      let columnKey = d.key || d.dataIndex;
      let config = configs[columnKey];
      if (config) {
        config.order = index;
      } else {
        configs[columnKey] = { order: index };
      }
    });

    this.setState({ columnsLeafs: items, configs });

    // this.setConfig(column, { order: destIndex });
  };

  render() {
    let { visible, columnsLeafs } = this.state;

    let leafs = columnsLeafs.filter(d => d.settable !== false);

    let attrs = {
      visible: visible,
      title: "表格配置",
      onOk: this.onOk,
      onCancel: this.onCancel,
      width: "720px",
      bodyStyle: {
        minHeight: "300px",
        maxHeight: "500px",
        overflow: "auto"
      },
      maskClosable: false,
      footer: (
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            loading={this.state.resetLoading}
            onClick={this.reset}
          >
            重置
          </Button>
          <Button
            loading={this.state.loading}
            type="primary"
            onClick={this.onOk}
            style={{ marginLeft: 20 }}
          >
            确定
          </Button>
          <Button style={{ marginLeft: 20 }} onClick={this.onCancel}>
            取消
          </Button>
        </div>
      )
    };

    return (
      <Modal {...attrs}>
        <SortableList
          items={leafs}
          onSort={this.onSort}
          onChangeWidth={this.onChangeWidth}
          onChangeFixed={this.onChangeFixed}
          onToggleVisible={this.onToggleVisible}
        />
      </Modal>
    );
  }
}

export default SettingModal;
