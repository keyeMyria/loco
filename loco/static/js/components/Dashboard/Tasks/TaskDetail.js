import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from "react-router-dom";

import { getTaskDetails, changeLocation } from '../../../reducer/tasks';

class TaskDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            created_by: "",
            merchant_name: "",
            amount: "",
            items: []
        } 
    }

    componentWillMount() {
        if(this.props.match.params.id) {
            this.props.getTaskDetails(this.props.team_id, this.props.match.params.id);        
        }
    }

    componentWillReceiveProps(nextProps) {
        let task = nextProps.taskDetailsData;
        if(task && !this.props.taskDetailsData) {
            this.setState({
                merchant_name: task.merchant_name,
                amount: task.amount,
                created_by: task.created_by_name,
                items: task.items_data
            });
        }
    }

    componentWillUnmount() {
        this.props.changeLocation();
    }

    render() {

        const style = {
            margin: 12,
            display: "block",
            width: "60px",
            marginTop: "20px"
        };

        let props = this.props;

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">{"Order " + this.props.match.params.id}</h1>
                </header>
                <section className="content-scroller">
                { (props.getTaskProgress)
                    ? (
                        <div className="list-card item-detail-holder">
                            <section className="list-card-loader-holder">
                                <section className="loader list-card-loader"></section>
                            </section>
                        </div>
                    )
                    : (
                        <section>
                            <section className="list-card item-detail-holder">
                                <article className="task-detail">
                                    <p className="detail-title">Merchant Name:</p>
                                    <p className="detail-value">{this.state.merchant_name}</p>
                                </article>
                                <article className="task-detail">
                                    <p className="detail-title">Created By:</p>
                                    <p className="detail-value">{this.state.created_by}</p>
                                </article>
                                <article className="task-detail">
                                    <p className="detail-title">Amount:</p>
                                    <p className="detail-value price">&#x20b9; {this.state.amount}</p>
                                </article>
                                <article className="task-detail">
                                    <p className="detail-title">Created On:</p>
                                    <p className="detail-value price">&#x20b9; {this.state.amount}</p>
                                </article>
                            </section>
                            <section className="list-card item-list-card">
                                { this.state.items &&
                                    <section className="list-table-holder">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Serial No.</th>
                                                    <th>Name</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.state.items.map((item, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.item.serial_number}</td>
                                                            <td>{item.item.name}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{item.item.price}</td>
                                                        </tr>
                                                    )
                                                    })
                                                }
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Total</td>
                                                    <td>{this.state.amount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </section>
                                }
                            </section>
                        </section>
                    )
                }
                </section>
            </div>            
        );
    }
}

export default TaskDetail = connect(
    (state) => ({ team_id: state.dashboard.team_id, error: state.tasks.createTaskError, 
        taskDetailsData: state.tasks.taskDetailsData, getTaskProgress: state.tasks.getTaskDetailsProgress}), 
    {getTaskDetails: getTaskDetails, changeLocation: changeLocation}
)(TaskDetail)



