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
        <div className="view-order-container">
            <div className="order-header">
                <h1>Review Your Order</h1>
                <p className="order-subtitle">Please review your order details before confirming</p>
            </div>

            <div className="order-content">
                <div className="order-section">
                    <h2>
                        <span className="section-icon">📦</span>
                        Order Details
                    </h2>
                    <div className="order-items">
                        <div className="order-item">
                            <span className="product-name">Vinyl Record - Product 1</span>
                            <span className="quantity">Qty: {order.buyQuantity?.[0] || 0}</span>
                        </div>
                        <div className="order-item">
                            <span className="product-name">Vinyl Record - Product 2</span>
                            <span className="quantity">Qty: {order.buyQuantity?.[1] || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="order-section">
                    <h2>
                        <span className="section-icon">💳</span>
                        Payment Information
                    </h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Cardholder Name:</label>
                            <span>{orderData.paymentInfo?.cardName || 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Card Number:</label>
                            <span>{orderData.paymentInfo?.cardNumber ? `****-****-****-${orderData.paymentInfo.cardNumber.slice(-4)}` : 'Not provided'}</span>
                        </div>
                        <div className="info-item">
                            <label>Expiration Date:</label>
                            <span>{orderData.paymentInfo?.expiration || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="order-section">
                    <h2>
                        <span className="section-icon">🚚</span>
                        Shipping Information
                    </h2>
                    <div className="shipping-address">
                        <div className="address-line">{orderData.shipping?.addressLine1 || 'Not provided'}</div>
                        {orderData.shipping?.addressLine2 && (
                            <div className="address-line">{orderData.shipping.addressLine2}</div>
                        )}
                        <div className="address-line">
                            {orderData.shipping?.city || 'Not provided'}, {orderData.shipping?.state || 'Not provided'} {orderData.shipping?.zip || 'Not provided'}
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <button className="confirm-button" onClick={handleConfirm}>
                        <span>✓</span>
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrder;