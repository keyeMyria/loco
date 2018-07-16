import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { createItem } from '../../../reducer/items';

class MerchantDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "itemData": [],
            "serial":"",
            "name": "",
            "price": 0,
            create: true
        } 
    }

    componentWillMount() {
        if(this.props.match.params.id) {
            // this.props.getMerchantDetails(this.props.match.params.id);    
            this.setState({
                create: false
            });        
        }
    }

    componentWillReceiveProps(nextProps) {
        
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
        if(this.state.create) {
            let price = parseFloat(price);
            if(!price) {
                price = 0;
            }

            let data = {
                name: this.state.name,
                price: price,
                serial_number : this.state.serial
            };

            this.props.createItem(this.props.team_id, data);
        }
    }

    render() {

        const style = {
            margin: 12,
            display: "block",
            width: "60px",
            marginTop: "20px"
        };

        return (
            <div>
                <header className="header">
                    <h1 className="title">Item Detail</h1>
                </header>
                <div className="item-detail-holder">
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
                        onClick={this.handleSubmit} />
                </div>
            </div>            
        );
    }
}

export default MerchantDetail = connect(
    (state) => ({ team_id: state.dashboard.team_id, inProgress: state.dashboard.createItemItemProgress,
        error: state.dashboard.createItemError }), 
    {createItem: createItem}
)(MerchantDetail)



