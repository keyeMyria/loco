import React, { Component } from 'react';
import { Route } from "react-router-dom";

import Merchants from "./Merchants/index";
import MerchantDetail from "./Merchants/MerchantDetail";
import MerchantCSV from "./Merchants/MerchantCSV";
import Items from "./Items/index";
import ItemDetail from "./Items/ItemDetail";
import ItemCSV from "./Items/ItemCSV";
import Tasks from "./Tasks/index";
import TaskDetail from "./Tasks/TaskDetail"
import Users from "./Users/index";
import UserDetail from "./Users/UserDetail";

export default class Routes extends Component {

    render() {

        return (
            <div className="content">
                <Route exact path="/" component={Tasks}/>
                <Route exact path="/tasks" component={Tasks}/>
                <Route exact path="/tasks/:id/change" component={TaskDetail}/>
                
                <Route exact path="/merchants" component={Merchants}/>
                <Route exact path="/merchants/create" component={MerchantDetail}/>
                <Route exact path="/merchants/upload" component={MerchantCSV}/>
                <Route exact path="/merchants/:id/change" component={MerchantDetail}/>
                
                <Route exact path="/items" component={Items}/>
                <Route exact path="/items/create" component={ItemDetail}/>
                <Route exact path="/items/upload" component={ItemCSV}/>
                <Route exact path="/items/:id/change" component={ItemDetail}/>

                <Route exact path="/users" component={Users}/>
                <Route exact path="/users/:id/profile" component={UserDetail}/>
            </div>
        );
	}
}


