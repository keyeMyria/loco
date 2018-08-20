import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

export default class Paginator extends Component {

    constructor(props) {
        super(props)
        this.state = {
            openPopover: false
        }
    }

    handleOpen = (event) => {
        event.preventDefault();
        this.setState({
            openPopover: true,
            anchorEl: event.currentTarget 
        });
    };

    handleClose = () => {
        this.setState({openPopover: false});
    };


    onNextClick = (event) => {
        event.stopPropagation();
        if (this.props.start+this.props.limit >= this.props.totalCount) {
            return;
        }

        this.props.getNext();
    };

    onPrevClick = (event) => {
        event.stopPropagation();
        if (this.props.start == 0){
            return;
        }

        this.props.getPrev();
    };

    viewDownloadPopup = () => {
        if (!this.props.csvURL) {
            return
        }

        return (
            <Popover
                open={this.state.openPopover}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleClose} >
                
                <Menu>
                    <MenuItem 
                        value={"csv"} 
                        primaryText={"csv"} 
                        key={"csv"}
                        href={this.props.csvURL} />

                    <MenuItem 
                        value={"xlsx"} 
                        primaryText={"xlsx"} 
                        key={"xlsx"}
                        href={this.props.csvURL.replace("format=csv", "format=xlsx")} />
                </Menu>
            </Popover>
        )
    }

    render() {
        var countStart = (this.props.start+1);
        if (this.props.totalCount == 0) {
            countStart = 0;
        }

        let pageCounter = countStart + " - " + (this.props.end);
        pageCounter = pageCounter + " of " + this.props.totalCount;

        var prevClass = "material-icons pager-action";
        if (this.props.start == 0) {
            prevClass = prevClass + " disable";
        }

        var nextClass = "material-icons pager-action";
        if (this.props.start+this.props.limit >= this.props.totalCount) {
            nextClass = nextClass + " disable";
        }

        var downloadCSV;
        if (this.props.csvURL) {
            downloadCSV = (
                <section className="list-pager-action" onClick={this.handleOpen}>
                    <span target="_blank" className="pager-action">
                        <i className="material-icons pager-action-icon">vertical_align_bottom</i>
                        <p className="pager-action-name">Download</p>
                    </span>
                </section>
            );
        }

        

        return (
            <section className="list-pager">
                {downloadCSV}
                {this.viewDownloadPopup()}
                <section className="list-pager-content">
                    <p className="pager-counter">{pageCounter}</p>
                    <i className={prevClass} onClick={this.onPrevClick}>keyboard_arrow_left</i>
                    <i className={nextClass} onClick={this.onNextClick}>keyboard_arrow_right</i>
                </section>
            </section>         
        );
    }
}



