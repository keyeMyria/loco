import React, { Component } from 'react';
import { NavLink } from "react-router-dom";

export default class Sidebar extends Component {

    render() {

        return (
            <section className="sidebar-holder">
                <section className="site-label">
                    <img className="site-logo" src="/static/images/logo.png"/>
                    <p className="site-name">Anuvad</p>
                </section>
                <ul className="nav-holder">
                    <li className="nav-link">
                        <NavLink to="/tasks">Orders</NavLink>
                    </li>
                    <li className="nav-link">
                        <NavLink to="/merchants">Merchants</NavLink>
                    </li>
                    <li className="nav-link">
                        <NavLink to="/items">Items</NavLink>
                    </li>
                </ul>
            </section>        
        );
    }
}



