import React from 'react';
import {observer} from 'mobx-react';

const WidgetHeader = observer(class WidgetHeader extends React.Component {
    render() {
        const isDisabled = this.props.widget.isDisabled("name");

        return (
            <div className="widget-header">
                <input type="text"
                    className={"editable-header h2 " + (isDisabled ? "notify-edit" : "")}
                    placeholder="Header"
                    value={this.props.widget.name}
                    disabled={isDisabled}
                    onChange={(e) => this.props.widget.update("name", e.target.value)}
                    onFocus={(e) => this.props.widget.onStartEditing("name")}
                    onBlur={(e) => this.props.widget.onEndEditing("name")}
                />
                <button className="widget-header-toggle" type="button" onClick={this.props.onToggle}>V</button>
            </div>
        );
    }
})

export default WidgetHeader;
