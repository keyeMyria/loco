import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import AccountMenu from '../../common/accountMenu';
import TaskListCard from './TaskListCard';
import TaskListFilters from './TaskListFilters';

import {clearState} from '../../../reducer/tasks';
import {getTasksInit, getTasksNext, getTasksPrev} from '../../../reducer/tasks.js'

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
                    
                    <AccountMenu />
                </header>
                <section className="content-scroller">
                    <TaskListFilters />
                    <TaskListCard 
                        tasks={this.props.tasks}
                        getTasksInit={this.props.getTasksInit}
                        getTasksNext={this.props.getTasksNext} 
                        getTasksPrev={this.props.getTasksPrev} 
                    />
                </section>
            </div>            
        );
    }
}

export default Tasks = connect(
    (state) => ({team_name: state.dashboard.team_name, tasks: state.tasks}), 
    {
        clearState:clearState, 
        getTasksInit: getTasksInit, 
        getTasksNext: getTasksNext, 
        getTasksPrev:getTasksPrev
    }
)(Tasks)



