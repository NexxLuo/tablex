import React from "react";

const Column = ({ title, width }) => {
  return (
    <div className="tablex-head-cell" style={{ width: width || 100 }}>
      <div className="tablex-head-cell-title">{title}</div>
    </div>
  );
};

const ColumnGroup = ({ title, children }) => {
  return (
    <div className="tablex-head-group">
      <div className="tablex-head-group-cell">
        <div className="tablex-head-group-title">{title}</div>
      </div>
      <div className="tablex-head-group-children">{children}</div>
    </div>
  );
};

const renderColumns = columns => {
  return columns.map((d, i) => {
    if (d.children instanceof Array && d.children.length > 0) {
      return (
        <ColumnGroup key={d.dataIndex || i} {...d}>
          {renderColumns(d.children)}
        </ColumnGroup>
      );
    }

    return <Column key={d.dataIndex || i} {...d} />;
  });
};

class TableHead extends React.Component {
  state = {
    columns: []
  };

  render() {
    let { columns } = this.props;

    return <>{renderColumns(columns)} </>;
  }
}

export default TableHead;
