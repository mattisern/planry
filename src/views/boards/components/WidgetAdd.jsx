import React from 'react';
import {observer} from 'mobx-react';

const WidgetAdd = observer(class WidgetAdd extends React.Component {
    render() {
        return (
            <div className="add-widget-card">
                <div className="clickable widget-add-button" onClick={() => this.props.board.addWidget("checklist")}>
                  <span>
                    <img className="add-widget-plus" src="/img/plus.png" /><br />
                    ADD CARD
                  </span>
                </div>
            </div>
        );
    }
})

export default WidgetAdd;
