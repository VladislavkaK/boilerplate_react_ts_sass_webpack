import * as React from "react";
import "../../assets/scss/App.scss";

const reactLogo = require("../../assets/img/react_logo.svg");

export interface AppProps {
}

export default class App extends React.Component<AppProps, undefined> {
    render() {
        return (
            <div className="app">
                <h1>Hello 2World2!</h1>
                <img src={reactLogo} height="100"/>
            </div>
        );
    }
}
