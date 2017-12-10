import React from 'react';
import {observer} from 'mobx-react';

const WidgetDelete = observer(class WidgetDelete extends React.Component {
    render() {
        return <span className="clickable delete-widget" onClick={() => this.props.widget.delete()}>x</span>;
    }
})

export default WidgetDelete;
