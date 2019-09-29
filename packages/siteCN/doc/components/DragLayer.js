import React, { memo, useState, useEffect } from "react";
import { useDragLayer } from "react-dnd";

const styles_Box = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  cursor: "move"
};
const Box = ({ title, yellow }) => {
  const backgroundColor = yellow ? "yellow" : "white";
  return <div style={{ ...styles_Box, backgroundColor }}>{title}</div>;
};

const styles = {
  display: "inline-block",
  transform: "rotate(-7deg)",
  WebkitTransform: "rotate(-7deg)"
};
const BoxDragPreview = memo(({ title }) => {
  return (
    <div style={styles}>
      <Box title={title}  />
    </div>
  );
});

function snapToGrid(x, y) {
  const snappedX = Math.round(x / 32) * 32;
  const snappedY = Math.round(y / 32) * 32;
  return [snappedX, snappedY];
}

const ItemTypes = {
  BOX: "box"
};

const layerStyles = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%"
};
function getItemStyles(initialOffset, currentOffset, isSnapToGrid) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none"
    };
  }
  let { x, y } = currentOffset;
  if (isSnapToGrid) {
    x -= initialOffset.x;
    y -= initialOffset.y;
    [x, y] = snapToGrid(x, y);
    x += initialOffset.x;
    y += initialOffset.y;
  }
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform
  };
}
const CustomDragLayer = props => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset
  } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }));
  function renderItem() {
    return <BoxDragPreview title={item.title} />;
    switch (itemType) {
      case ItemTypes.BOX:
        return <BoxDragPreview title={item.title} />;
      default:
        return null;
    }
  }
  if (!isDragging) {
    return null;
  }

  //console.log("render CustomDragLayer:",item);
  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset, props.snapToGrid)}
      >
        {renderItem()}
      </div>
    </div>
  );
};
export default CustomDragLayer;
