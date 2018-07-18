import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class MerchantList extends Component {

    render() {
        return (
            <section className="list-table-holder">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>State</th>
                            <th>City</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.merchantsData.map((merchant, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.state}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.city}</Link>
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



