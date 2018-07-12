import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

class SearchText extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "value": ""
        } 
    }

    onChange = (ev, val) => {
        this.setState({
            "value": val
        })
    } 

    render() {
        return(
            <TextField
              hintText="Search"
              onChange={this.onChange}
            />      
        );
    }
}