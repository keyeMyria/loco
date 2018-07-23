import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import { createMerchant, getMerchantDetails, editMerchantDetails, getStates, getCities, clearState } from '../../../reducer/merchants';

class MerchantDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            address:"",
            city: "",
            name: "",
            state: "",
            cities: [],
            create: true
        } 
    }

    componentWillMount() {
        this.props.clearState();
        this.props.getCities();
        if(this.props.match.params.id) {
            this.props.getMerchantDetails(this.props.match.params.id); 
            this.setState({
                create: false
            });        
        }
    }

    componentWillReceiveProps(nextProps) {
        let merchant = nextProps.merchantDetailsData;
        if(merchant && !this.props.merchantDetailsData) {
            this.setState({
                name: merchant.name,
                address: merchant.address,
                city: merchant.city ? merchant.city.name : "",
                state: merchant.state,
            });
        }

        if(nextProps.cities && !this.props.cities) {
            this.setState({
                cities: nextProps.cities
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

    onCityChange = (val) => {
        this.setState({
            city: val
        });
    }

    handleSubmit = (ev) => {
        let city = "", state = "";
        if(this.props.cities && this.state.city) {
            for (var i= 0; i< this.props.cities.length; i++) {
                if(this.state.city == this.props.cities[i].name) {
                    city = this.props.cities[i].id;
                    state = this.props.cities[i].state;
                }
            }
        }

        let data = {
            id: this.props.match.params.id,
            name: this.state.name,
            address: this.state.address,
            city: city,
            state: state
        };

        if(this.state.create) {
            this.props.createMerchant(this.props.team_id, data);
        } else {
            this.props.editMerchantDetails(data)
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
        let data=[]
        for (var i= 0; i< props.cities.length; i++) {
            data.push(props.cities[i].name);
        }

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">
                    {(this.state.create) ? "New Merchant" : "Merchant " + props.match.params.id}
                    </h1>
                </header>
                { (props.createMerchantSucess || props.editMerchantSuccess) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">&#x2714; Your changes have been successfully made. It will reflect in few mins.</p>
                    </section>
                }
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
                                <AutoComplete
                                    floatingLabelText = "City"
                                    searchText = {this.state.city}
                                    filter = {AutoComplete.fuzzyFilter}
                                    dataSource = {data}
                                    maxSearchResults = {10}
                                    onUpdateInput = {(searchText, data, params) => {this.onCityChange(searchText)}}
                                    id = {"cityfilter"} />
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
        getStates: getStates, getCities: getCities, clearState: clearState}
)(MerchantDetail)



