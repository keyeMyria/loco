import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createItem } from '../../../reducer/items';

class ItemCSV extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
        } 
    }

    handleUpload(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.append('data', this.uploadInput.files[0]);

        fetch('http://localhost:8000/teams/61/merchants/csv', {
          method: 'POST',
          body: data,
        }).then((response) => {
          response.json().then((body) => {
            this.setState({ imageURL: `http://localhost:8000/${body.file}` });
          });
        });
    }

    render() {

        return (
        	<section className="merchant-csv-holder">
        		<section className="upload-csv">
        			<form onSubmit={this.handleUpload}>
        				<input type="file" ref={(ref) => { this.uploadInput = ref; }} />
        			</form>
        			<button className="csv-upload-action" onClick={this.handleUpload}>
                        UPLOAD
                    </button>
        			<p className="csv-helper-text">
	        			Please ensure file has columns in following sequence: name, state, city, address.
        			</p>
        			<p className="csv-helper-text">
	        			Do not include column names in the csv file.
        			</p>
        		</section>
        	</section>     
        );
    }
}

export default ItemCSV = connect(
    (state) => ({ team_id: state.dashboard.team_id, inProgress: state.dashboard.createItemItemProgress,
        error: state.dashboard.createItemError }), 
    {createItem: createItem}
)(ItemCSV)



