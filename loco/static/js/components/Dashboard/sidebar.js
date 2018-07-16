import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Items from "./Items/index";
import ItemDetail from "./Items/ItemDetail";
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
                <div className="dashboard-holder">
                    <section className="sidebar-holder">
                        <section className="site-label">
                            <img className="site-logo" src="/static/images/logo.png"/>
                            <p className="site-name">Anuvad</p>
                        </section>
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
                    </section>
                    <div className="content">
                        <Route exact path="/orders" component={Orders}/>
                        <Route exact path="/merchants" component={Merchants}/>                        
                        <Route exact path="/items" component={Items}/>
                        <Route exact path="/items/create" component={ItemDetail}/>
                        <Route exact path="/items/:id/change" component={ItemDetail}/>
                    </div>
                </div>
            </HashRouter>        
        );
    }
}



