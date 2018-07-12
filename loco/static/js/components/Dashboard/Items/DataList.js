import React, { Component } from 'react';

export default class DataList extends Component {

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
                                    <td>{item.serial_number}</td>
                                    <td>{item.name}</td>
                                    <td>{item.price}</td>
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



