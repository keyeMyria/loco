import React, { Component } from 'react';
import { BrowserRouter } from "react-router-dom";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Routes from "./Routes";
import UserTeams from './UserTeams';

export default class Teams extends Component {

    render()
    {
        return (
            <BrowserRouter basename={"/web/teams/"}>
                <MuiThemeProvider>
                    <Routes />
                </MuiThemeProvider>
            </BrowserRouter>
        );
    }
}