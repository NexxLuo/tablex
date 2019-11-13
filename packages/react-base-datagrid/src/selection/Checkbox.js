import React from "react";

const Checkbox = props => {
  let { indeterminate, onChange, value, checked, disabled } = props;

  let cls = [];

  if (indeterminate === true) {
    cls = ["tablex__checkbox--indeterminate"];
  }

  if (checked === true) {
    cls = ["tablex__checkbox--checked"];
  }

  if (disabled === true) {
    cls.push("tablex__checkbox--disabled");
  }

  cls.unshift("tablex__checkbox");

  cls = cls.join(" ");

  return (
    <span
      className={cls}
      onClick={e => {
        e.stopPropagation();
        if (typeof onChange === "function" && disabled != true) {
          onChange(checked, props.value, { indeterminate: indeterminate });
        }
      }}
    >
      <input
        type="checkbox"
        value={value}
        disabled={disabled}
        className="tablex__checkbox__input"
      />
      <span className="tablex__checkbox__inner" />
      {props.children}
    </span>
  );
};

export default Checkbox;
