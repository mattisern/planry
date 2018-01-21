import React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import visitedStore from "../../stores/VisitedStore";

const Start = observer(class App extends React.Component {
    render() {
        const data = visitedStore.get();

        return (
            <div className="start">
                <h1>PLANRY</h1>
                <div className="subheader">Visit one of your previously seen boards or create a new one</div>
                <ul>
                    <li className="new"><Link to="/boards">+ Create new</Link></li>
                    {
                        data.reverse().map((visited) => {
                            return <li key={visited.identifier}><Link to={"/boards/" + visited.identifier}>{ visited.name ? visited.name : <em>Unknown</em> }</Link></li>
                        })
                    }
                </ul>
            </div>
        );
    }
})

export default Start;
