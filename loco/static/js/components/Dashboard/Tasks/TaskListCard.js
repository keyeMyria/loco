import React, { Component } from 'react';
import { connect } from 'react-redux';
import TaskList from './TaskList'
import Paginator from '../Paginator'
import {getTasksInit, getTasksNext, getTasksPrev} from '../../../reducer/tasks.js'

export default class TaskListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getTasksInit();
    }

    viewListTitle = () => {
        if (this.props.listTitle) {
            return <h3 className="list-card-title">{this.props.listTitle}</h3>
        }
    };

    render() {
        let tasks = this.props.tasks;
        var content = (
            <section className="list-card-content">
                {this.viewListTitle()}
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