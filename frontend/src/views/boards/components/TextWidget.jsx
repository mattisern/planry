import React from 'react';

import {observer} from "mobx-react";

import WidgetDelete from "./WidgetDelete";
import WidgetHeader from "./WidgetHeader";

const TextWidget = observer(class TextWidget extends React.Component {
    render() {
        return (
            <div className="widget text-widget">                    
                <WidgetDelete widget={this.props.widget} />
                <WidgetHeader widget={this.props.widget} />
                
                <textarea
                    className="widget-content"
                    name="text"
                    placeholder="Start typing here ..."
                    value={this.props.widget.text}
                    onChange={(e) => this.props.widget.update("text", e.target.value)}
                />
            </div>
        );
    }
})

export default TextWidget;
