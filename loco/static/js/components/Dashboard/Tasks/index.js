import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import TaskListCard from './TaskListCard';
import TaskListFilters from './TaskListFilters';

import {clearState} from '../../../reducer/tasks';

class Tasks extends Component {
    
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.clearState();
    }

    render() {

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">Orders</h1>
                    <a className="header-team" href="/web/teams">
                        <p className="header-team-name">{this.props.team_name}</p>
                        <i className="material-icons header-team-icon">arrow_drop_down</i>
                    </a>
                    
                    <section className="profile-menu">
                        <img src="/static/images/person_white.png" />
                    </section>
                </header>
                <section className="content-scroller">
                    <TaskListFilters />
                    <TaskListCard />
                </section>
            </div>            
        );
    }
}

export default Tasks = connect(
    (state) => ({team_name: state.dashboard.team_name}), 
    {clearState:clearState}
)(Tasks)



