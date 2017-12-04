import React from 'react';
import {observer} from 'mobx-react';

const WidgetHeader = observer(class WidgetHeader extends React.Component {
    render() {
        return (
            <div className="widget-header">
                <input type="text"
                    className="editable-header h2"
                    name="name"
                    placeholder="New todo widget"
                    value={this.props.widget.name}
                    onChange={(e) => this.props.widget.update("name", e.target.value)}
                />
            </div>
        );
    }
})

export default WidgetHeader;
