import React from "react";

const Checkbox = props => {
    let { indeterminate, onChange, value, checked, disabled } = props;

    let cls = "";

    if (indeterminate === true) {
        cls = "tablex__checkbox--indeterminate";
    }

    if (checked === true) {
        cls = "tablex__checkbox--checked";
    }

    if (disabled === true) {
        cls = "tablex__checkbox--disabled";
    }

    return (
        <span
            className={"tablex__checkbox " + cls}
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
                className="tablex__checkbox__input"
            />
            <span className="tablex__checkbox__inner" />
        </span>
    );
};

export default Checkbox;
