import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserList from './UserList'
import Paginator from '../Paginator'
import {getUsersInit, getUsersNext, getUsersPrev} from '../../../reducer/users.js'

export default class TaskListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getUsersInit();
    }

    viewListTitle = () => {
        if (this.props.listTitle) {
            return <h3 className="list-card-title">{this.props.listTitle}</h3>
        }
    };

    render() {
        let users = this.props.users;
        var content = (
            <section className="list-card-content">
                {this.viewListTitle()}
                <UserList data={users.data.slice(users.start, users.end)} />
                <Paginator 
                    start={users.start}
                    end={users.end}
                    limit={users.limit}
                    totalCount={users.totalCount}
                    csvURL={users.csvURL}
                    getNext={this.props.getUsersNext}
                    getPrev={this.props.getUsersPrev}/>
            </section>
        );

        if (users.inProgress) {
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