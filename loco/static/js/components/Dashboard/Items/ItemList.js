import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class ItemList extends Component {

    render() {
        return (
            <section className="list-table-holder">
                <table>
                    <thead>
                        <tr className="no-click">
                            <th>Serial No.</th>
                            <th>Name</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.itemsData.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={"/items/" + item.id + "/change" }>{item.serial_number}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/items/" + item.id + "/change" }>{item.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/items/" + item.id + "/change" }>{item.price}</Link>
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



