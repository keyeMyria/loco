import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class ItemDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "itemData": []
        } 
    }

    componentWillMount() {
        console.log(this.props.match.params.id);
        console.log(this.props);
    }

    componentWillReceiveProps(nextProps) {
        
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
                    <p>Serial No.:</p>
                    <TextField
                        hintText=""
                        onChange={this.onChange}
                    />
                    <p>Name</p>
                    <TextField
                        hintText=""
                        onChange={this.onChange}
                    />
                    <p>Price</p>
                    <TextField
                        hintText=""
                        onChange={this.onChange}
                    />

                    <RaisedButton label="Submit" primary={true} style={style} />
                </div>
            </div>            
        );
    }
}

export default ItemDetail = connect(
    (state) => ({ }), 
    {}
)(ItemDetail)



