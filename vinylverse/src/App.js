import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Purchase from './components/purchase';
import PaymentEntry from './components/paymentEntry';
import ShippingEntry from './components/shippingEntry';
import ViewOrder from './components/viewOrder';
import Confirmation from './components/confirmation'; // or match your file name
import Header from './components/header';
import Footer from './components/footer';
import Home from './components/home';
import AboutUs from './components/aboutUs';
import Contact from './components/contactUs';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />

        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<Contact />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/purchase/paymentEntry" element={<PaymentEntry />} />
          <Route path="/purchase/shippingEntry" element={<ShippingEntry />} />
          <Route path="/purchase/viewOrder" element={<ViewOrder />} />
          <Route path="/purchase/confirmation" element={<Confirmation />} />
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
