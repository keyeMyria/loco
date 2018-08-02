import React, { Component } from 'react';

export default class JobList extends Component {

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    getMessage = (job) => {
        if (job.status != "pending") {
            return job.message
        }

        return (
            <button className="list-action" onClick={this.props.refresh}>Check Status</button>
        )
    };

    render() {
        return (
            <section className="list-table-holder read-only">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((job, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        {job.id}
                                    </td>
                                    <td>
                                        {this.formatDate(job.created)}
                                    </td>
                                    <td>
                                        {job.status}
                                    </td>
                                    <td>
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



