import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteDialog from '../DeleteDialog';
import TaskListCard from '../Tasks/TaskListCard';

import { 
    createItem, 
    getItemDetails, 
    editItemDetails, 
    clearState, 
    deleteItem,
    getItemTasksInit,
    getItemTasksNext,
    getItemTasksPrev, } from '../../../reducer/items';

class ItemDetail extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "serial":"",
            "name": "",
            "price": "",
            "mrp": "",
            "description": "",
            "create": true,
            nameErrorText: '',
            open: false
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
                mrp: nextProps.itemDetailsData.mrp,
                description: nextProps.itemDetailsData.description,
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
            "name": val,
            nameErrorText: ""
        });
    }

    onPriceChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "price": val
        });
    }

    onMrpChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "mrp": val
        });
    }

    onDescriptionChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "description": val
        });
    }

    handleSubmit = (ev) => {
        let price = parseFloat(this.state.price);
        if(!price) {
            price = 0;
        }

        let mrp = parseFloat(this.state.mrp);
        if(!mrp) {
            mrp = 0;
        }        

        let data = {
            name: this.state.name,
            price: price,
            mrp: mrp,
            description: this.state.description,
            serial_number : this.state.serial
        };

        if (!this.state.name) {
            this.setState({
                nameErrorText: 'Please enter a valid name.',
            })
        } else if(this.state.create) {
            this.props.createItem(this.props.team_id, data);
        } else {
            data["id"] = this.props.match.params.id;
            this.props.editItemDetails(data);
        }
    }

    openDialog = (ev) => {
        ev.preventDefault()
        this.setState({
            open: true
        });
    }

    closeDialog = (ev) => {
        this.setState({
            open: false
        });
    }

    deleteItem = () => {
        this.props.deleteItem(this.props.match.params.id);
    }

    viewItemTasks = () => {
        if (this.state.create) {
            return
        }

        return (
            <TaskListCard
                listTitle={"Orders for " + this.state.name}
                tasks={this.props.itemTasks}
                getTasksInit={() => this.props.getItemTasksInit(this.props.match.params.id)}
                getTasksNext={() => this.props.getItemTasksNext(this.props.match.params.id)} 
                getTasksPrev={() => this.props.getItemTasksPrev(this.props.match.params.id)} 
            />
        )
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
                    <section className="header-actions">
                        <p className="header-action" onClick={this.openDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">DELETE</p>
                        </p>
                    </section>
                </header>
                { (props.createItemSucess || props.editItemSuccess) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">&#x2714; Your changes have been successfully made. It will reflect in few mins.</p>
                    </section>
                }

                { props.deleteItemSuccess &&
                    <section className="success-msg-holder">
                        <p className="success-msg">&#x2714; Item has been successfully deleted. It will reflect in few mins.</p>
                    </section>
                }

                { (props.createItemSucess || props.editItemSuccess) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">&#x2714; Your changes have been successfully made. It will reflect in few mins.</p>
                    </section>
                }

                { this.state.open &&
                    <DeleteDialog 
                        title={"Delete Item" + props.match.params.id}
                        dataType="item"
                        closeDialog={this.closeDialog}
                        deleteData={this.deleteItem} />
                }

                { props.error &&
                    <section className="success-msg-holder" >
                        <p className="success-msg error-msg">{ props.error }</p>
                    </section>
                }
                <section className="content-scroller">
                { (props.inProgress || props.getItemProgress || props.editItemProgress || props.deleteItemProgress)
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
                                    errorText={this.state.nameErrorText}
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
                                <TextField
                                    hintText=""
                                    onChange={this.onMrpChange}
                                    value={this.state.mrp}
                                    floatingLabelText="MRP"
                                    style={{ display:"block"}}
                                    name="mrp" />
                                <TextField
                                    hintText=""
                                    onChange={this.onDescriptionChange}
                                    value={this.state.description}
                                    floatingLabelText="Description"
                                    style={{ display:"block"}}
                                    name="description" />
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
                {this.viewItemTasks()}
                </section>
            </div>            
        );
    }
}

export default ItemDetail = connect(
    (state) => ({ 
        team_id: state.dashboard.team_id, 
        inProgress: state.items.createItemProgress,
        error: state.items.error, 
        itemDetailsData: state.items.itemDetailsData, 
        getItemProgress: state.items.getItemDetailsProgress, 
        createItemSucess: state.items.createItemSucess,
        editItemSuccess: state.items.editItemSuccess, 
        editItemProgress: state.items.editItemProgress,
        deleteItemProgress: state.items.deleteItemProgress, 
        deleteItemSuccess: state.items.deleteItemSuccess,
        itemTasks: state.items.itemTasks,
    }), 
    {
        createItem: createItem, 
        getItemDetails: getItemDetails, 
        editItemDetails: editItemDetails, 
        clearState: clearState, 
        deleteItem: deleteItem,
        getItemTasksInit: getItemTasksInit,
        getItemTasksNext: getItemTasksNext,
        getItemTasksPrev: getItemTasksPrev,
    }
)(ItemDetail)



