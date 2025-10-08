import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ShippingEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/purchase/viewOrder", { state: { ...location.state, shipping } });
  };

  return (
    <div>
      <h2>Enter Shipping Information</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input name="name" onChange={handleChange} value={shipping.name} required />

        <label>Address Line 1:</label>
        <input name="addressLine1" onChange={handleChange} value={shipping.addressLine1} required />

        <label>Address Line 2:</label>
        <input name="addressLine2" onChange={handleChange} value={shipping.addressLine2} />

        <label>City:</label>
        <input name="city" onChange={handleChange} value={shipping.city} required />

        <label>State:</label>
        <input name="state" onChange={handleChange} value={shipping.state} required />

        <label>ZIP:</label>
        <input name="zip" onChange={handleChange} value={shipping.zip} required />

        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default ShippingEntry;
