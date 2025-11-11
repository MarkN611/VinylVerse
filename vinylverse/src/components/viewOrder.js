import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../styles/viewOrder.css';
import { orderAPI } from '../services/api';

const ViewOrder = () => {

    // useState holds the order details
    //navigate to this page from the orders page
    //fetch the order details from the backend using the order id

    
    const location = useLocation();
    const navigate = useNavigate();

    // Get the accumulated data from previous steps
    const orderData = location.state || {};
    
    //get order details from location state 
    const [order] = useState({
        ...orderData  // This will merge any data passed from previous components
    });

    // Calculate total price
    const calculateTotal = () => {
        if (!orderData.products || !orderData.buyQuantity) return 0;
        return orderData.products.reduce((total, product, index) => {
            const quantity = orderData.buyQuantity[index] || 0;
            return total + (product.price * quantity);
        }, 0);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        
        try {
            // Prepare order data for API
            const items = orderData.products
                .map((product, index) => {
                    const quantity = orderData.buyQuantity[index] || 0;
                    if (quantity > 0) {
                        return {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            qty: quantity
                        };
                    }
                    return null;
                })
                .filter(item => item !== null);

            const orderPayload = {
                items: items,
                customer: {
                    name: orderData.shipping?.name || '',
                    email: orderData.shipping?.email || ''
                },
                shipping: {
                    address1: orderData.shipping?.addressLine1 || '',
                    address2: orderData.shipping?.addressLine2 || '',
                    city: orderData.shipping?.city || '',
                    state: orderData.shipping?.state || '',
                    country: 'USA',
                    postalCode: orderData.shipping?.zip || '',
                    email: orderData.shipping?.email || ''
                },
                payment: {
                    cardName: orderData.paymentInfo?.cardName || '',
                    cardNumber: orderData.paymentInfo?.cardNumber || '',
                    expiration: orderData.paymentInfo?.expiration || ''
                },
                total: calculateTotal()
            };

            // Submit order to API
            const response = await orderAPI.createOrder(orderPayload);
            console.log('Order API Response:', response);

            // Response may be a string (plain confirmation id) or an object
            let confirmationId = null;
            let orderId = null;

            if (typeof response === 'string') {
                // backend returned plain text confirmation id
                confirmationId = response;
            } else if (response && typeof response === 'object') {
                confirmationId = response.confirmationId || response.confirmation || response.id || response.body?.confirmationId || response.body?.confirmation || null;
                orderId = response.orderId || response.id || response.body?.orderId || null;
                // Some backends return a nested 'body' string
                if (!confirmationId && typeof response.body === 'string') {
                    confirmationId = response.body;
                }
            }

            // Navigate to confirmation with the API response
            navigate('/purchase/confirmation', {
                state: {
                    order: order,
                    orderResponse: response,
                    confirmationId,
                    orderId
                }
            });
        } catch (err) {
            console.error('Error submitting order:', err);
            // Prefer a helpful message from the server if present
            let userMessage = 'Failed to submit order. Please try again.';
            if (err && err.body) {
                try {
                    // If body is an object with message
                    if (typeof err.body === 'object' && err.body.message) {
                        userMessage = `${err.body.message}`;
                    } else if (typeof err.body === 'string') {
                        userMessage = `${err.body}`;
                    }
                } catch (e) {
                    // fall back
                }
            } else if (err && err.status) {
                userMessage = `Server returned ${err.status}. Please try again.`;
            }

            setError(userMessage);
            setIsSubmitting(false);
            // Keep a debug console spot for raw error
            console.debug('Raw order submit error:', err);
        }
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
                        {orderData.products && orderData.buyQuantity ? (
                            orderData.products.map((product, index) => {
                                const quantity = orderData.buyQuantity[index] || 0;
                                if (quantity > 0) {
                                    return (
                                        <div key={product.id} className="order-item">
                                            <span className="product-name">{product.name}</span>
                                            <span className="quantity">Qty: {quantity}</span>
                                            <span className="price">${(product.price * quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })
                        ) : (
                            <div className="order-item">
                                <span className="product-name">No products selected</span>
                            </div>
                        )}
                    </div>
                    
                    {orderData.products && orderData.buyQuantity && (
                        <div className="order-total">
                            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                        </div>
                    )}
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

                {error && (
                    <div className="error-message" style={{color: 'red', padding: '10px', margin: '10px 0'}}>
                        {error}
                    </div>
                )}
                <div className="order-actions">
                    <button 
                        className="confirm-button" 
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        <span>✓</span>
                        {isSubmitting ? 'Submitting Order...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrder;