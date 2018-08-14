import React, { Component } from 'react';

export default class JobList extends Component {

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    getMessage = (job) => {
        if (job.status != "pending" && job.status != "progress") {
            return job.message
        }

        return (
            <button className="list-action" onClick={this.props.refresh}>Check Status</button>
        )
    };

    render() {
        return (
            <section className="list-table-holder">
                <table>
                    <thead>
                        <tr className="no-click">
                            <th>ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((job, index) => {
                            return (
                                <tr className="no-click" key={index}>
                                    <td className="txt-only">
                                        {job.id}
                                    </td>
                                    <td className="txt-only">
                                        {this.formatDate(job.created)}
                                    </td>
                                    <td className="txt-only">
                                        {job.status}
                                    </td>
                                    <td className="txt-only">
                                        {this.getMessage(job)}
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



