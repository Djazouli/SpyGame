
import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./components/Home.jsx";
import GameRoom from "./components/GameRoom";


class App extends Component {
    render() {
        return (
            <Router basename={'/game'}>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path={"/:id"} component={GameRoom}/>
                </Switch>
            </Router>
        );
    }
}

export default App;
