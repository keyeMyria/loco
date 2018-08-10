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
                        <tr>
                            <th>ID</th>
                            <th>Merchant</th>
                            <th>Merchant Seller</th>
                            <th>Sales Type</th>
                            <th>Created On</th>
                            <th>Created By</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((task, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.task_id}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.merchant_name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.merchant_seller_name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.sales_type}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{this.formatDate(task.created)}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.created_by_name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.task_id + "/change" }>{task.amount}</Link>
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



