import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';


export default class DeleteDialog extends Component {

	constructor(props) {
        super(props);
		this.state = {
			open: true,
		};
	}

	handleOpen = () => {
		this.setState({open: true});
	};

	handleClose = () => {
		this.setState({open: false});
		this.props.closeDialog();
	};

	handleDeleteClick = () => {
		this.props.deleteData();
		this.handleClose();
	}

	render() {
		const actions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onClick={this.handleClose}
			/>,
			<FlatButton
				label="Delete"
				primary={true}
				keyboardFocused={true}
				onClick={this.handleDeleteClick}
			/>,
		];

		return (
			<div>
				<RaisedButton label="Dialog" onClick={this.handleOpen} />
				<Dialog
					title={this.props.title}
					actions={actions}
					modal={false}
					open={this.state.open}
					onRequestClose={this.handleClose}
				>
					Are you sure you want to delete the selected {this.props.dataType}?
				</Dialog>
			</div>
		);
	}
}