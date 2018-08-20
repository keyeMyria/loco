import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class UserLogList extends Component {

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
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((log, index) => {
                            return (
                                <tr key={index} className="no-click">
                                    <td className="txt-only">
                                        {this.formatDate(log.created)}
                                    </td>
                                    <td className="txt-only">
                                        {log.action_type}
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



