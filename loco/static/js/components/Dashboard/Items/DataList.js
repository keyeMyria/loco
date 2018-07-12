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
                        <tr>
                            <td>C7PL1AUH</td>
                            <td>Adagio tablets</td>
                            <td>452.5</td>
                        </tr>
                    </tbody>
                </table>
            </div>            
        );
    }
}



