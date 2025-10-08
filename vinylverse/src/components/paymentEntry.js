import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState({
    cardName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/purchase/shippingentry", { state: { ...location.state, paymentInfo } });
  };

  return (
    <div>
      <h1>Payment Information</h1>
      <form onSubmit={handleSubmit}>
        <label>Cardholder Name:</label>
        <input name="cardName" value={paymentInfo.cardName} onChange={handleChange} required />

        <label>Card Number:</label>
        <input name="cardNumber" value={paymentInfo.cardNumber} onChange={handleChange} required />

        <label>Expiration Date:</label>
        <input name="expiration" value={paymentInfo.expiration} onChange={handleChange} required />

        <label>CVV:</label>
        <input name="cvv" value={paymentInfo.cvv} onChange={handleChange} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PaymentEntry;
