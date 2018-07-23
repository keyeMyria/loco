import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from "react-router-dom";
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { createItem, getItemDetails, editItemDetails, clearState } from '../../../reducer/items';

class ItemDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "serial":"",
            "name": "",
            "price": "",
            "create": true
        } 
    }

    componentWillMount() {
        this.props.clearState();
        if(this.props.match.params.id) {
            this.props.getItemDetails(this.props.match.params.id);    
            this.setState({
                create: false
            });        
        }
        
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.itemDetailsData && !this.props.itemDetailsData) {
            this.setState({
                name: nextProps.itemDetailsData.name,
                price: nextProps.itemDetailsData.price,
                serial: nextProps.itemDetailsData.serial_number,
            });
        }
    }

    onSerialChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "serial": val
        });
    }

    onNameChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "name": val
        });
    }

    onPriceChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "price": val
        });
    }

    handleSubmit = (ev) => {
        let price = parseFloat(this.state.price);
        if(!price) {
            price = 0;
        }

        let data = {
            name: this.state.name,
            price: price,
            serial_number : this.state.serial
        };

        if(this.state.create) {
            this.props.createItem(this.props.team_id, data);
        } else {
            data["id"] = this.props.match.params.id;
            this.props.editItemDetails(data);
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

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">
                        {(this.state.create) ? "New Item" : "Item " + this.props.match.params.id}
                    </h1>
                </header>
                { (props.createItemSucess || props.editItemSuccess) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">&#x2714; Your changes have been successfully made. It will reflect in few mins.</p>
                    </section>
                }
                <section className="content-scroller">
                { (props.inProgress || props.getItemProgress || props.editItemProgress)
                    ? (
                        <section className="detail-card">
                            <section className="detail-card-loader-holder">
                                <section className="loader detail-card-loader"></section>
                            </section>
                        </section>
                    )
                    : (
                        <section className="detail-card">
                            <div className="detail-card-content">
                                <TextField
                                    hintText=""
                                    onChange={this.onSerialChange}
                                    value={this.state.serial}
                                    floatingLabelText="Serial No."
                                    style={{ display:"block"}}
                                    id="serial" />
                                <TextField
                                    hintText=""
                                    onChange={this.onNameChange}
                                    value={this.state.name}
                                    floatingLabelText="Name"
                                    style={{ display:"block"}}
                                    name="name" />
                                <TextField
                                    hintText=""
                                    onChange={this.onPriceChange}
                                    value={this.state.price}
                                    floatingLabelText="Price"
                                    style={{ display:"block"}}
                                    name="price" />

                                <RaisedButton 
                                    label="Submit" 
                                    primary={true} 
                                    style={style} 
                                    backgroundColor = "#CB202D"
                                    onClick={this.handleSubmit} />
                            </div>
                        </section>
                    )
                }
                </section>
            </div>            
        );
    }
}

export default ItemDetail = connect(
    (state) => ({ team_id: state.dashboard.team_id, inProgress: state.items.createItemProgress,
        error: state.items.createItemError, itemDetailsData: state.items.itemDetailsData, 
        getItemProgress: state.items.getItemDetailsProgress, createItemSucess: state.items.createItemSucess,
        editItemSuccess: state.items.editItemSuccess, editItemProgress: state.items.editItemProgress }), 
    {createItem: createItem, getItemDetails: getItemDetails, editItemDetails: editItemDetails, clearState: clearState}
)(ItemDetail)



