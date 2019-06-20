import React from "react";

const Checkbox = props => {
    let { indeterminate, onChange, value, checked, disabled } = props;

    let cls = "";

    if (indeterminate === true) {
        cls = "table__checkbox--indeterminate";
    }

    if (checked === true) {
        cls = "table__checkbox--checked";
    }

    if (disabled === true) {
        cls = "table__checkbox--disabled";
    }

    return (
        <span
            className={"table__checkbox " + cls}
            onClick={e => {
                e.stopPropagation();
                if (typeof onChange === "function" && disabled != true) {
                    onChange(!checked, props.value);
                }
            }}
        >
            <input
                type="checkbox"
                value={value}
                disabled={disabled}
                className="table__checkbox__input"
            />
            <span className="table__checkbox__inner" />
        </span>
    );
};

export default Checkbox;
