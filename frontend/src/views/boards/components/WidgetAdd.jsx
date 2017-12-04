import React from 'react';
import {observer} from 'mobx-react';

const WidgetAdd = observer(class WidgetAdd extends React.Component {
    render() {
        return (
            <div className="widget-add">
                <button type="button" onClick={() => this.props.board.addWidget("text")}>Text</button>
                <button type="button" onClick={() => this.props.board.addWidget("checklist")}>Checklist</button>
            </div>
        );
    }
})

export default WidgetAdd;
