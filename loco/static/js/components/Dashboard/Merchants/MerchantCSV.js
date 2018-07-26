import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import { uploadMerchant, getMerchantUploads } from '../../../reducer/merchants';
import JobListCard from '../JobListCard';

class MerchantCSV extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
        } 
    }

    handleUpload = (ev) => {
        ev.preventDefault();

        if (this.props.inProgress || !this.uploadInput.files[0]) {
        	return;
        }

        this.props.uploadMerchant(this.uploadInput.files[0]);
    }

    render() {

    	var buttonContent = "UPLOAD";
    	if (this.props.inProgress) {
    		buttonContent = <div className="loader teams-loader"></div>;
    	}

    	var error;
    	if (this.props.error) {
    		error = (
    			<p className="upload-csv-error">
    				Error uploading csv. Please try again in sometime.
    			</p>
			);
    	}

        return (
        	<section className="content-holder merchant-csv-holder">
        		<header className="header">
        		    <h1 className="title">Upload merchant CSV</h1>
        		    <a className="header-team" href="/web/teams">
        		        <p className="header-team-name">{this.props.team_name}</p>
        		        <i className="material-icons header-team-icon">arrow_drop_down</i>
        		    </a>
        		    <section className="header-actions">
        		        <Link to="/merchants/create" className="header-action">
        		            <i className="material-icons header-action-icon">create</i>
        		            <p className="header-action-name">NEW</p>
        		        </Link>
        		        <Link to="/merchants/csv" className="header-action">
        		            <i className="material-icons header-action-icon">vertical_align_top</i>
        		            <p className="header-action-name">UPLOAD</p>
        		        </Link>
        		    </section>
        		    <section className="profile-menu">
        		        <img src="/static/images/person_white.png" />
        		    </section>
        		</header>
        		<section className="content-scroller csv-upload-holder">
	        		<section className="upload-csv">
	        			<ul className="upload-csv-helpers">
		        			<li className="upload-csv-helper">
			        			- Please use a CSV file.
		        			</li>
                            <li className="upload-csv-helper">
                                - Ensure file has columns in following sequence: *name, state, city, address, phone and merchant-type(wholesale OR retail).
                            </li>
                            <li className="upload-csv-helper">
                                - Values marked with * are must.
                            </li>
		        			<li className="upload-csv-helper">
			        			- Do not include column names in the csv file.
		        			</li>
		        		</ul>
		        		{error}
	        			<form className="upload-csv-form" onSubmit={this.handleUpload}>
	        				<input className="upload-csv-input" type="file" 
		        				ref={(ref) => { this.uploadInput = ref; }} />
		        			<button className="upload-csv-action" onClick={this.handleUpload}>
		        				{buttonContent}
		        			</button>
	        			</form>
	        		</section>

                    <JobListCard 
                    data={this.props.uploads}
                    inProgress={this.props.getUploadsProgress}
                    getUploads={this.props.getMerchantUploads} />
        		</section>
        	</section>     
        );
    }
}

export default MerchantCSV = connect(
    (state) => ({ team_id: state.dashboard.team_id,
	    team_name: state.dashboard.team_name, 
	    inProgress: state.merchants.uploadProgress,
        error: state.merchants.uploadError,
        uploads: state.merchants.uploads,
        getUploadsProgress: state.merchants.getUploadsProgress,
    }), 
    {uploadMerchant: uploadMerchant, getMerchantUploads: getMerchantUploads}
)(MerchantCSV)



