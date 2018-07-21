import React, { Component } from 'react';

export default class JobList extends Component {

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    render() {
        return (
            <section className="list-table-holder">
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
                                        {job.message}
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



