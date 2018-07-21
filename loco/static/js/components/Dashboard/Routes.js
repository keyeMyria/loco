import React, { Component } from 'react';
import { Route } from "react-router-dom";

import Merchants from "./Merchants/index";
import MerchantDetail from "./Merchants/MerchantDetail";
import Items from "./Items/index";
import ItemDetail from "./Items/ItemDetail";
import Orders from "./Orders/index";
import OrderDetail from "./Orders/OrderDetail";

export default class Routes extends Component {

    render() {

        return (
            <div className="content">
                <Route exact path="/" component={Orders}/>
                <Route exact path="/orders" component={Orders}/>
                <Route exact path="/orders/create" component={OrderDetail}/>
                <Route exact path="/orders/:id/change" component={OrderDetail}/>
                
                <Route exact path="/merchants" component={Merchants}/>
                <Route exact path="/merchants/create" component={MerchantDetail}/>
                <Route exact path="/merchants/:id/change" component={MerchantDetail}/>
                
                <Route exact path="/items" component={Items}/>
                <Route exact path="/items/create" component={ItemDetail}/>
                <Route exact path="/items/:id/change" component={ItemDetail}/>
            </div>
        );
	}
}


