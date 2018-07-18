import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class TaskList extends Component {

    render() {
        return (
            <section className="list-table-holder">
                <table>
                    <thead>
                        <tr>
                            <th>Serial No.</th>
                            <th>Name</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.data.map((task, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/tasks/" + task.id + "/change" }>{task.serial_number}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.id + "/change" }>{task.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/tasks/" + task.id + "/change" }>{task.price}</Link>
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



