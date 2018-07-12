import React, { Component } from 'react';
import { Link } from "react-router-dom";

export default class ItemList extends Component {

    render() {
        return (
            <div className="table-holder">
                <table>
                    <thead>
                        <tr>
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
                                        <Link to={"/items/" + item.id }>{item.serial_number}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/items/" + item.id }>{item.name}</Link>
                                    </td>
                                    <td>
                                        <Link to={"/items/" + item.id }>{item.price}</Link>
                                    </td>
                                </tr>
                            )
                            })
                        }
                    </tbody>
                </table>
            </div>            
        );
    }
}



