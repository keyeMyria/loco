import React, { Component } from 'react';

export default class Paginator extends Component {

    constructor(props) {
        super(props)
    }

    onNextClick = () => {
        if (this.props.start+this.props.limit >= this.props.totalCount) {
            return;
        }

        this.props.getNext('61', 
            this.props.start, 
            this.props.limit,
            this.props.currentCount);
    };

    onPrevClick = () => {
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

        return (
            <section className="list-pager">
            	<section className="list-pager-content">
            		<p className="pager-counter">{pageCounter}</p>
            		<i className={prevClass} onClick={this.onPrevClick}>keyboard_arrow_left</i>
            		<i className={nextClass} onClick={this.onNextClick}>keyboard_arrow_right</i>
            	</section>
            </section>         
        );
    }
}



