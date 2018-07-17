import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class MerchantList extends Component {

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
                        { this.props.merchantsData.map((merchant, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.serial_number}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/merchants/" + merchant.id + "/change" }>{merchant.price}</Link>
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



