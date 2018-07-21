import React, { Component } from 'react';
import { connect } from 'react-redux';
import TaskList from './TaskList'
import Paginator from '../Paginator'
import {getTasksInit, getTasksNext, getTasksPrev} from '../../../reducer/tasks.js'

class TaskListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getTasksInit();
    }

    render() {
        let tasks = this.props.tasks;
        console.log(tasks)
        var content = (
            <section className="list-card-content">
                <TaskList data={tasks.data.slice(tasks.start, tasks.end)} />
                <Paginator 
                    start={tasks.start}
                    end={tasks.end}
                    limit={tasks.limit}
                    totalCount={tasks.totalCount}
                    csvURL={tasks.csvURL}
                    getNext={this.props.getTasksNext}
                    getPrev={this.props.getTasksPrev}/>
            </section>
        );

        if (tasks.inProgress) {
            content = (
                <section className="list-card-loader-holder">
                    <section className="loader list-card-loader"></section>
                </section>
            );
        }

        return (
            <section className="list-card merchant-list-card">
                {content}
            </section>
        );
    }

}

export default connect(
    ((state) => ({ tasks: state.tasks })) ,
    {getTasksInit: getTasksInit, getTasksNext: getTasksNext, getTasksPrev:getTasksPrev}
)(TaskListCard);



