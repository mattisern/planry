import React from 'react';
import {observer} from 'mobx-react';

import Footer from "../components/Footer";

const Main = observer(class Main extends React.Component {
    render() {
        return (
            <div className="main-container">
                {this.props.children}
                <Footer />
            </div>
        );
    }
})

export default Main;
