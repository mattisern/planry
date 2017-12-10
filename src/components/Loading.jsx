import React from 'react';
import {observer} from 'mobx-react';


const Loading = observer(class Loading extends React.Component {
    render() {
        return (
            <div className="loading">
                Loading...
            </div>
        );
    }
})

export default Loading;
