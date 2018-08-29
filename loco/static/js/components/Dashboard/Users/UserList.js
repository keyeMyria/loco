import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class TaskList extends Component {

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    render() {
        return (
            <section className="list-table-holder">
                <table>
                    <thead>
                        <tr className="no-click">
                            <th>Name</th>
                            <th>Role</th>
                            <th>Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((user, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/users/" + user.user_id + "/profile" }>{user.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/users/" + user.user_id + "/profile" }>{user.role}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/users/" + user.user_id + "/profile" }>{user.action}</Link>
                                    </td>
                                </tr>
                            )
                            })
                        }
                    </tbody>
                </table>
            </section>            
        );
    }
}



