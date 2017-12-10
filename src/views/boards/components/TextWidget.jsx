import React from 'react';

import {observer} from "mobx-react";

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

const TextWidget = observer(class TextWidget extends React.Component {
    render() {
        const isDisabled = this.props.widget.isDisabled("text");
        
        return (
            <div className="widget text-widget">                    
                <WidgetDelete widget={this.props.widget} />
                <WidgetHeader widget={this.props.widget} />
                
                <textarea
                    className={"widget-content " + (isDisabled ? "notify-edit" : "")}
                    placeholder="Start typing here ..."
                    disabled={isDisabled}
                    value={this.props.widget.text}
                    onChange={(e) => this.props.widget.update("text", e.target.value)}
                    onFocus={(e) => this.props.widget.onStartEditing("text")}
                    onBlur={(e) => this.props.widget.onEndEditing("text")}
                />
            </div>
        );
    }
})

export default TextWidget;
