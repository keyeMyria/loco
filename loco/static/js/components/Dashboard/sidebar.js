import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Items from "./Items/index";
import Merchants from "./Merchants/index";
import Orders from "./Orders/index";

export default class Sidebar extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
        } 
    }

    render() {

        return (
            <HashRouter>
                <div>
                    <div className="sidebar-holder">
                        <div className="logo-holder">
                            <img src=""/>
                        </div>
                        <ul className="nav-holder">
                            <li className="nav-link">
                                <NavLink to="/orders">Orders</NavLink>
                            </li>
                            <li className="nav-link">
                                <NavLink to="/merchants">Merchants</NavLink>
                            </li>
                            <li className="nav-link">
                                <NavLink to="/items">Items</NavLink>
                            </li>
                        </ul>
                    </div>
                    <div className="content">
                        <Route path="/orders" component={Orders}/>
                        <Route path="/merchants" component={Merchants}/>
                        <Route path="/items" component={Items}/>
                    </div>
                </div>
            </HashRouter>        
        );
    }
}



