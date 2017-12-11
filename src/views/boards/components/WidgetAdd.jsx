import React from 'react';
import {observer} from 'mobx-react';

const WidgetAdd = observer(class WidgetAdd extends React.Component {
    render() {
        return (
            <div className="widget-add add-widget-card">
                <div className="clickable widget-add-button" onClick={() => this.props.board.addWidget("text")}><span>+ Text</span></div>
                <div className="clickable widget-add-button" onClick={() => this.props.board.addWidget("checklist")}><span>+ Checklist</span></div>
            </div>
        );
    }
})

export default WidgetAdd;
