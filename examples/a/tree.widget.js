import styled from 'styled-components'

export const TreeItem = styled.span`
    padding: 5px 6px;
    border-radius: 3px;
    cursor:pointer;
    ${props => props.sel ? "background:#BAE7FF" : ""}

`