import React from 'react';
import {observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import visitedStore from "../../stores/VisitedStore";

const Start = observer(class App extends React.Component {
    render() {
        const data = visitedStore.get();

        return (
            <div className="start">
                <h1>Welcome to Planry!</h1>
                <p className="subheader">Collaborate on small projects, without any hassle.</p>
                <ul class="list-of-boards">
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
