import React from 'react';
import {observer} from 'mobx-react';

const WidgetAdd = observer(class WidgetAdd extends React.Component {
    render() {
        return (
            <div className="add-widget-card">
                <h3 className="add-card">ADD CARD</h3>
                <div className="add-widget-buttons">
                    <div className="clickable widget-add-button" onClick={() => this.props.board.addWidget("text")}>
                        <span class="glyphicon glyphicon-align-left" aria-hidden="true"></span>
                        <img className="add-widget-plus" src="/img/widget_text.png" /><br />
                    </div>
                    <div className="clickable widget-add-button" onClick={() => this.props.board.addWidget("checklist")}>
                        <img className="add-widget-plus" src="/img/widget_checklist.png" /><br />  
                    </div>
                </div>
            </div>
        );
    }
})

export default WidgetAdd;
