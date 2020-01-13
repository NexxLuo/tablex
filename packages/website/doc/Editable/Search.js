import React from "react";
import Input from "antd/lib/input";
import Icon from "antd/lib/icon";
import styled from "styled-components";


const SearchIcon = styled(Icon)`
&&&&{
    cursor:pointer;
}
&:hover{
    color:#40a9ff;
}
`;
const ClearIcon = styled(Icon)`
cursor:pointer;
margin-right:5px;
color:#BFBFBF;
&:hover{
    color:#8C8C8C;
}
`;
class Search extends React.Component {

    state = {
        value: "",
        focus: false
    }

    constructor(props) {
        super(props);

        this.state = {
            value: props.value === undefined ? "" : props.value
        };
    }


    static getDerivedStateFromProps(nextProps, prevState) {

        if ('value' in nextProps) {
            return { value: nextProps.value };
        }

        return null;
    }


    onSearch = () => {
        if (typeof this.props.onSearch === "function") {
            this.props.onSearch(this.state.value)
        }

    }

    onChange = (e) => {
        let value = e.target ? e.target.value : e;


        if (!('value' in this.props)) {
            this.setState({ value });
        }


        const onChange = this.props.onChange;
        if (onChange) {
            onChange(value);
        }
    }

    onMouseEnter = () => {
        this.setState({ focus: true });
    }
    onMouseLeave = () => {
        this.setState({ focus: false });
    }
    onClear = () => {
        this.onChange('');
    }
    getSuffix = () => {
        const { allowClear} = this.props;
        const { focus, value } = this.state;
        
        return <span >
            {
                allowClear && focus && (value != null && value !== "")
                && <ClearIcon type="close-circle" theme="filled" onClick={this.onClear} />
            }
            <SearchIcon type="search" onClick={this.onSearch} />
        </span>;
    }
    render() {
        let props = Object.assign({}, this.props, {
            onChange: this.onChange,
            value: this.state.value,
            onPressEnter: this.onSearch,
            suffix: !this.props.disabled ? this.getSuffix() : null,
        });

        delete props.allowClear

        delete props.onSearch;

        const { mode } = this.props;

        const spanProps = {
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
            style: { width: '100%' }
        }

        if (mode === "choseonly") {
            return <span {...spanProps}>
                <Input
                    {...props}
                    disabled
                    _disabled={this.props.disabled ? "true" : "false"}//使用此属性，使禁用的文本框显示正常颜色的字体
                /></span>
        } else {
            return <span  {...spanProps}><Input {...props} /></span>
        }

    }
}


export default Search;
