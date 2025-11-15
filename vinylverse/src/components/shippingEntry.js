import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../styles/shippingEntry.css';

const ShippingEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    email: ""
  });

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/purchase/viewOrder", { state: { ...location.state, shipping } });
  };

  return (
    <div className="shippingEntryBackground">
      <div className="shipping-container">
        <h1>Enter Shipping Information</h1>

        <form className="shipping-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name:</label>
          <input
            id="name"
            name="name"
            onChange={handleChange}
            value={shipping.name}
            required
          />

          <label htmlFor="address1">Address Line 1:</label>
          <input
            id="address1"
            name="address1"
            onChange={handleChange}
            value={shipping.address1}
            required
          />

          <label htmlFor="address2">Address Line 2:</label>
          <input
            id="address2"
            name="address2"
            onChange={handleChange}
            value={shipping.address2}
          />

          <label htmlFor="city">City:</label>
          <input
            id="city"
            name="city"
            onChange={handleChange}
            value={shipping.city}
            required
          />

          <label htmlFor="state">State:</label>
          <input
            id="state"
            name="state"
            onChange={handleChange}
            value={shipping.state}
            required
          />

          <label htmlFor="country">Country:</label>
          <input
            id="country"
            name="country"
            onChange={handleChange}
            value={shipping.country}
            required
          />

          <label htmlFor="zip">ZIP Code:</label>
          <input
            id="zip"
            name="zip"
            type="text"
            pattern="\d{5}"
            title="Please enter a 5-digit ZIP code"
            onChange={handleChange}
            value={shipping.zip}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            onChange={handleChange}
            value={shipping.email}
            required
          />

          <button type="submit">Next</button>
        </form>
      </div>
    </div>
  );
};

export default ShippingEntry;
