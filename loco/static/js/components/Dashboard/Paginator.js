import React, { Component } from 'react';

export default class Paginator extends Component {

    constructor(props) {
        super(props)
    }

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
                    <a target="_blank" className="pager-action" href={this.props.csvURL}>
                        <i className="material-icons pager-action-icon">vertical_align_bottom</i> 
                        <p className="pager-action-name">Download CSV</p>
                    </a>
                </section>
            );
        }

        return (
            <section className="list-pager">
                {downloadCSV}
                <section className="list-pager-content">
                    <p className="pager-counter">{pageCounter}</p>
                    <i className={prevClass} onClick={this.onPrevClick}>keyboard_arrow_left</i>
                    <i className={nextClass} onClick={this.onNextClick}>keyboard_arrow_right</i>
                </section>
            </section>         
        );
    }
}



