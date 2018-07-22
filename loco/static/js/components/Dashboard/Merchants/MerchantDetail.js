import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { createMerchant, getMerchantDetails, editMerchantDetails, getStates, getCities } from '../../../reducer/merchants';

class MerchantDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            address:"",
            city: "",
            name: "",
            state: "",
            create: true
        } 
    }

    componentWillMount() {
        this.props.getCities();
        if(this.props.match.params.id) {
            this.props.getMerchantDetails(this.props.match.params.id); 
            this.setState({
                create: false
            });        
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.merchantDetailsData && !this.props.merchantDetailsData) {
            this.setState({
                name: nextProps.merchantDetailsData.name,
                address: nextProps.merchantDetailsData.address,
                city: nextProps.merchantDetailsData.city,
                state: nextProps.merchantDetailsData.state,
            });
        }
    }

    onAddressChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            address: val
        });
    }

    onNameChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            name: val
        });
    }

    onCityChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            city: val
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
                // price: price,
                // serial_number : this.state.serial
            };

            this.props.createMerchant(this.props.team_id, data);
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
                    <h1 className="title">{"Merchant " + this.props.match.params.id}</h1>
                </header>
                <section className="content-scroller">
                { (props.inProgress || props.getMerchantProgress || props.editMerchantProgress)
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
                                    onChange={this.onNameChange}
                                    value={this.state.name}
                                    floatingLabelText="Name"
                                    style={{ display:"block"}}
                                    name="name" />
                                <TextField
                                    hintText=""
                                    onChange={this.onAddressChange}
                                    value={this.state.address}
                                    floatingLabelText="Address"
                                    style={{ display:"block"}}
                                    id="address" />
                                <SelectField
                                    floatingLabelText="City"
                                    value={this.state.city}
                                    onChange={this.onStateChange} >
                                    { this.props.cities.map((item, index) => {   
                                        return(
                                            <MenuItem 
                                                value={item.id} 
                                                primaryText={item.name}
                                                key={item.id} />
                                        ) 
                                    }) 
                                    }
                                </SelectField>
                                <br />

                                <RaisedButton 
                                    label="Submit" 
                                    primary={true} 
                                    style={style} 
                                    onClick={this.handleSubmit} />
                            </div>
                        </section>
                    )
                }
                { (props.createMerchantSucess || props.editMerchantSuccess) &&
                    <Redirect to="/merchants"/>
                }
                </section>
            </div>            
        );
    }
}

export default MerchantDetail = connect(
    (state) => ({ team_id: state.dashboard.team_id, inProgress: state.merchants.createMerchantProgress,
        error: state.merchants.createMerchantError, merchantDetailsData: state.merchants.merchantDetailsData,
        states: state.merchants.states, cities: state.merchants.cities,
        getMerchantProgress: state.merchants.getMerchantDetailsProgress, createMerchantSucess: state.merchants.createMerchantSucess,
        editMerchantSuccess: state.merchants.editMerchantSuccess, editMerchantProgress: state.merchants.editMerchantProgress }), 
    {createMerchant: createMerchant, getMerchantDetails: getMerchantDetails, editMerchantDetails: editMerchantDetails,
        getStates: getStates, getCities: getCities}
)(MerchantDetail)



