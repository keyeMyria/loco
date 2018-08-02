import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';

export default class Paginator extends Component {

    constructor(props) {
        super(props)
        this.state = {
            openDialog: false
        }
    }

    handleOpen = () => {
        this.setState({openDialog: true});
    };

    handleClose = () => {
        this.setState({openDialog: false});
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
                <section className="list-pager-action">
                    <span target="_blank" className="pager-action" onClick={this.handleOpen}>
                        <p className="pager-action-name">Download</p>
                    </span>
                </section>
            );
        }

        var downloadDialog = (
            <Dialog
                title="Download As"
                modal={false}
                open={this.state.openDialog}
                onRequestClose={this.handleClose} >

                <a target="_blank" className="pager-action pager-downlaod-action" href={this.props.csvURL}>
                    <i className="material-icons pager-action-icon">vertical_align_bottom</i> 
                    <p className="pager-action-name">csv</p>
                </a>

                <a target="_blank" className="pager-action pager-downlaod-action" href={this.props.csvURL.replace("format=csv", "format=xlsx")}>
                    <i className="material-icons pager-action-icon">vertical_align_bottom</i> 
                    <p className="pager-action-name">xlsx</p>
                </a>

            </Dialog>
        )

        return (
            <section className="list-pager">
                {downloadCSV}
                {downloadDialog}
                <section className="list-pager-content">
                    <p className="pager-counter">{pageCounter}</p>
                    <i className={prevClass} onClick={this.onPrevClick}>keyboard_arrow_left</i>
                    <i className={nextClass} onClick={this.onNextClick}>keyboard_arrow_right</i>
                </section>
            </section>         
        );
    }
}



