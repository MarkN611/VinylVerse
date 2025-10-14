import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../styles/viewOrder.css';

const ViewOrder = () => {

    // useState holds the order details
    //navigate to this page from the orders page
    //fetch the order details from the backend using the order id

    
    const location = useLocation();
    const navigate = useNavigate();

    // Get the accumulated data from previous steps
    const orderData = location.state || {};
    
    //get order details from location state 
    const [order, setOrder] = useState({
        ...orderData  // This will merge any data passed from previous components
    });

    const handleConfirm = () => {
        navigate('/purchase/confirmation', {state: {order}});
    }

    return (
        <div>
            <h1> 
                Review Your Order
            </h1>
            <h2>
                Order Details:
            </h2>
            <p>Product 1: {order.buyQuantity[0] || 0}</p>
            <p>Product 2: {order.buyQuantity[1] || 0}</p>

            <h2>
                Payment Info:
            </h2>
            <p>Cardholder: {orderData.paymentInfo?.cardName || 'Not provided'}</p>
            <p>Card Number: {orderData.paymentInfo?.cardNumber || 'Not provided'}</p>
            <p>Expiration Date: {orderData.paymentInfo?.expiration || 'Not provided'}</p>
            <h3>
                Shipping Info:
            </h3>
            <p>{orderData.shipping?.addressLine1 || 'Not provided'}</p>
            <p>{orderData.shipping?.addressLine2 || ''}</p>
            <p>{orderData.shipping?.city || 'Not provided'}, {orderData.shipping?.state || 'Not provided'} {orderData.shipping?.zip || 'Not provided'}</p>

            <button onClick={handleConfirm}>Confirm Order</button>
        </div>
    );
};

export default ViewOrder;