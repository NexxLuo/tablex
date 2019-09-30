import React, { memo, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

const DraggableRow = memo(({ rowProps, onRowProps, dragOptions }) => {
  const ref = useRef(null);
  let { className, style } = rowProps;
  let {
    itemKey,
    itemInfo,
    index,
    data,
    getContainer,

    useDragHandle,
    dragHandleSelector,
    allowDragLevel,

    canDrag,
    onDragBegin,
    onDragEnd,
    canDrop,
    onDropHover,
    onDrop
  } = dragOptions;

  let dragToInner = false;

  function removeClass(name) {
    let container = getContainer();

    if (container) {
      (container.querySelectorAll("." + name) || []).forEach(e => {
        e.classList.remove(name);
      });
    }
  }

  function addClass(sel, name) {
    let container = getContainer();
    if (container) {
      (container.querySelectorAll(sel) || []).forEach(e => {
        e.classList.add(name);
      });
    }
  }

  let dragInfo = {
    key: itemKey,
    index: index,
    data: data,
    info: itemInfo,
    type: "item"
  };

  if (allowDragLevel === false) {
    dragInfo.type = "depth-" + itemInfo.depth;
  }

  const [{ isDragging, height }, connectDrag, preview] = useDrag({
    item: dragInfo,
    collect: monitor => {
      const result = {
        isDragging: monitor.isDragging(),
        height: style.height
      };
      return result;
    },
    canDrag(monitor) {
      if (typeof canDrag === "function") {
        let bl = canDrag(dragInfo, monitor);
        if (bl === false) {
          return false;
        }
        return true;
      }
      return true;
    },
    begin(monitor) {
      if (typeof onDragBegin === "function") {
        return onDragBegin(dragInfo, monitor);
      }
    },
    end(item, monitor) {
      removeClass("drag-under");
      removeClass("drag-inner");
      if (typeof onDragEnd === "function") {
        return onDragEnd(monitor.getItem(), monitor);
      }
    }
  });
  const [{ isActive }, connectDrop] = useDrop({
    accept: dragInfo.type,
    collect: monitor => {
      const result = {
        isActive: monitor.canDrop() && monitor.isOver()
      };
      return result;
    },
    canDrop(item, monitor) {
      let { key: draggedId } = item;

      //不可拖动到本身
      if (draggedId === itemKey) {
        return false;
      }

      removeClass("drag-under");
      if (allowDragLevel === true) {
        removeClass("drag-inner");
      }
      if (isActive && draggedId !== itemKey) {
        let y = monitor.getClientOffset().y;
        let el = ref.current;
        if (el) {
          const hover_y = el.getBoundingClientRect().y;
          let o = y > hover_y + height / 2;
          dragToInner = false;
          if (o) {
            addClass(".tablex-table-row-" + index, "drag-under");
          } else {
            dragToInner = true;
            if (allowDragLevel === true) {
              addClass(".tablex-table-row-" + index, "drag-inner");
            }
          }
        }
      }

      if (typeof canDrop === "function") {
        let bl = canDrop(
          { source: item, target: dragInfo, isInner: dragToInner },
          monitor
        );
        if (bl === false) {
          return false;
        }
        return true;
      } else {
        if (allowDragLevel === false) {
          if (dragToInner === true) {
            return false;
          }
        }
        let targetParents = itemInfo.parents || [];
        let sourceKey = item.key;
        //控制父级无法拖动到本身的子级
        if (targetParents.indexOf(sourceKey) > -1) {
          return false;
        }
        return true;
      }
    },
    drop(item, monitor) {
      if (typeof onDrop === "function") {
        onDrop(
          {
            target: dragInfo,
            source: item,
            isInner: dragToInner
          },
          monitor
        );
      }
    },
    hover(item, monitor) {
      if (typeof onDropHover === "function") {
        return onDropHover(
          {
            target: dragInfo,
            source: item,
            isInner: dragToInner
          },
          monitor
        );
      }
    }
  });

  connectDrop(ref);

  useEffect(() => {
    let drag_el = null;

    if (useDragHandle === true) {
      if (ref.current) {
        drag_el = ref.current.querySelector(".drag-handler");
      }
      connectDrag(drag_el);
    } else {
      if (dragHandleSelector) {
        drag_el = ref.current.querySelector(dragHandleSelector);
        connectDrag(drag_el);
      } else {
        connectDrag(ref);
      }
    }
  });
  preview(ref, { captureDraggingState: true });
  let cls = [className];

  if (isDragging) {
    cls.push("dragging");
  }

  return (
    <div
      ref={ref}
      {...onRowProps}
      {...rowProps}
      className={cls.join(" ")}
    ></div>
  );
});

export default DraggableRow;
