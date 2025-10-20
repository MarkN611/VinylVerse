import React from "react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import '../styles/purchase.css';

const Purchase = () => {
    const [order, setOrder] = useState({
        buyQuantity: [0,0,0,0,0], credit_card_number: '', expir_date: '', cvvCode: '', 
        card_holder_name: '', address_1: '', address_2: '', city: '', state: '', zip: '',   
    });
    const navigate = useNavigate();const handleSubmit = (e) => {
        navigate('/purchase/paymentEntry', {state: order, setOrder: setOrder});}

    console.log('order: ', order);

    return (
        <div className="purchase">
            <h1>Enter Product Quantities</h1>
            <form onSubmit={handleSubmit}> 
                <div className="form-row">
                    <label>Pink Floyd The Dark Side of the Moon Original 1973: </label>
                    <input
                        type="number"
                        required
                        onChange={(e) => 
                            {order.buyQuantity[0] = e.target.value;}}
                    />
                    <br/>
                </div>

                <div className="form-row">
                    <label>The Beatles Abbey Road Anniversary Edition LP: </label>
                    <input
                        type="number"
                        required
                        onChange={(e) => 
                            {order.buyQuantity[1] = e.target.value;}}
                    />
                    <br/>
                </div>

                <div className="form-row">
                    <label>Prince Purple Rain Vinyl (Limited Edition 40th Anniversary - Purple Splatter 140g): </label>
                    <input
                        type="number"
                        required
                        onChange={(e) => 
                            {order.buyQuantity[1] = e.target.value;}}
                    />
                    <br/>
                </div>

                <div className="form-row">
                    <label>Michael Jackson Thriller (25th Anniversary Edition) [2LP]: </label>
                    <input
                        type="number"
                        required
                        onChange={(e) => 
                            {order.buyQuantity[1] = e.target.value;}}
                    />
                    <br/>
                </div>
                <button className='button'>Pay</button>
            </form>
        </div>
    );
};

export default Purchase;