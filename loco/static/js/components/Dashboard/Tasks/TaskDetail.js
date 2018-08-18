import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import { getTaskDetails, clearState } from '../../../reducer/tasks';

class TaskDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            created_by: "",
            merchant_name: "",
            amount: "",
            items: [],
            created: "",
            task_id: "",
            sales_type: "",
            merchant_seller_name: "",
        } 
    }

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    componentWillMount() {
        this.props.clearState();
        if(this.props.match.params.id) {
            this.props.getTaskDetails(this.props.team_id, this.props.match.params.id);        
        }
    }

    componentWillReceiveProps(nextProps) {
        let task = nextProps.taskDetailsData;
        if(task && !this.props.taskDetailsData) {
            this.setState({
                merchant_name: task.merchant_name,
                merchant_id: task.merchant_id,
                amount: task.amount,
                created_by: task.created_by_name,
                created_by_id: task.created_by,
                items: task.items_data,
                task_id: task.task_id,
                created: this.formatDate(task.created),
                description: task.description,
                sales_type: task.sales_type,
                merchant_seller_name: task.merchant_seller_name,
                merchant_seller_id: task.merchant_seller_id
            });
        }
    }

    render() {

        const style = {
            margin: 12,
            display: "block",
            width: "60px",
            marginTop: "20px"
        };

        let props = this.props;
        let pdfLink = '/tasks/' + this.state.task_id + '/pdf';

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">{"Order " + this.props.match.params.id}</h1>
                </header>

                { props.error &&
                    <section className="success-msg-holder" >
                        <p className="success-msg error-msg">{ props.error }</p>
                    </section>
                }
                
                <section className="content-scroller">
                { (props.getTaskProgress)
                    ? (
                        <div className="detail-card">
                            <section className="detail-card-loader-holder">
                                <section className="loader detail-card-loader"></section>
                            </section>
                        </div>
                    )
                    : (
                        <section>
                            <section className="detail-card">
                                <article className="detail">
                                    <p className="detail-title">Order for</p>
                                    <p className="detail-value">
                                        <Link className="detail-link" to={"/merchants/" + this.state.merchant_id + "/change"}>{this.state.merchant_name}</Link>
                                    </p>
                                </article>
                                <article className="detail">
                                    <p className="detail-title">Order procured by</p>
                                    <p className="detail-value">
                                        <Link 
                                            className="detail-link" 
                                            to={"/merchants/" + this.state.merchant_seller_id + "/change"}
                                        >
                                            {this.state.merchant_seller_name}
                                        </Link>
                                    </p>
                                </article>
                                <article className="detail">
                                    <p className="detail-title">Created By</p>
                                    <Link 
                                        className="detail-link" 
                                        to={"/users/" + this.state.created_by_id + "/profile"}
                                    >
                                        {this.state.created_by}
                                    </Link>
                                </article>
                                <article className="detail">
                                    <p className="detail-title">Amount</p>
                                    <p className="detail-value price">&#x20b9; {this.state.amount}</p>
                                </article>
                                <article className="detail">
                                    <p className="detail-title">Created On</p>
                                    <p className="detail-value">{this.state.created}</p>
                                </article>
                                { this.state.description && 
                                    <article className="detail">
                                        <p className="detail-title">Description</p>
                                        <p className="detail-value">{this.state.description}</p>
                                    </article>
                                }
                                <article className="detail">
                                    <a className="detail-link" target="_blank" href={pdfLink}>PDF</a>
                                </article>
                            </section>
                            { !!(this.state.items && this.state.items.length > 0) &&
                                <section className="list-card">
                                    <section className="list-table-holder">
                                        <table>
                                            <thead>
                                                <tr className="no-click">
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
                                                            <td>
                                                                <Link to={"/items/" + item.item.id + "/change" }>{item.item.serial_number}</Link>
                                                            </td>
                                                            <td>
                                                                <Link to={"/items/" + item.item.id + "/change" }>{item.item.name}</Link>
                                                            </td>
                                                            <td>
                                                                <Link to={"/items/" + item.item.id + "/change" }>{item.quantity}</Link>
                                                            </td>
                                                            <td>
                                                                <Link to={"/items/" + item.item.id + "/change" }>{item.item.price}</Link>
                                                            </td>
                                                        </tr>
                                                    )
                                                    })
                                                }
                                                <tr className="no-click">
                                                    <td></td>
                                                    <td></td>
                                                    <td className="txt-only">Total</td>
                                                    <td className="txt-only">{this.state.amount}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </section>
                                </section>
                            }
                        </section>
                    )
                }
                </section>
            </div>            
        );
    }
}

export default TaskDetail = connect(
    (state) => ({ team_id: state.dashboard.team_id, error: state.tasks.error, 
        taskDetailsData: state.tasks.taskDetailsData, getTaskProgress: state.tasks.getTaskDetailsProgress}), 
    {getTaskDetails: getTaskDetails, clearState: clearState}
)(TaskDetail)



