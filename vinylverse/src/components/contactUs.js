import '../styles/contactUs.css';

export default function ContactUs() {
  return (
    <div className="contactUs">
      <h1> General Contact Information </h1>
      <div className="generalInfo">
        <p className='contactText'><b>Address:</b><br /> 
          VinylVerse Records<br />
          1234 Echo Drive, Suite 5B<br />
          Columbus, OH 43210<br />
          United States
        </p>
        <p className='contactText'><b>Email: </b> support@vinylverse.com</p>
        <p className='contactText'><b>Phone: </b> (614) 555-2746</p>
        <p className='contactText'><b>Hours: </b><br />
          Monday-Friday: 9:00 AM - 6:00 PM EST<br />
          Saturday: 10:00 AM - 4:00 PM EST<br />
          Sunday: Closed
        </p>

      </div>

      <h1> Department Contact Information </h1>

      <table className="departmentInfoTable">
        <tr>
          <th>Department</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
        <tr>
          <td>Customer Support</td>
          <td>support@vinylverse.com</td>
          <td>(614) 555-2746</td>
        </tr>
        <tr>
          <td>Sales & Orders</td>
          <td>sales@vinylverse.com</td>
          <td>(614) 555-3752</td>
        </tr>
        <tr>
          <td>Returns & Refunds</td>
          <td>returns@vinylverse.com</td>
          <td>(614) 555-4173</td>
        </tr>
        <tr>
          <td>Press Inquiries</td>
          <td>media@vinylverse.com</td>
          <td>(614) 555-4831</td>
        </tr>
        <tr>
          <td>Technical Support</td>
          <td>tech@vinylverse.com</td>
          <td>(614) 555-4120</td>
        </tr>

      </table>

    <div className="FAQSection">
      <h1> Frequently Asked Questions </h1>
      <div className= "question">
        <h3> Q1: How long does shipping take? </h3>
        <p> <b>A:</b> Standard shipping usually takes 3-5 business days within the U.S. International orders may take 7-14 business days depending on customs. </p>
      </div>

      <div className= "question">
        <h3> Q2: Can I track my order? </h3>
        <p> <b>A:</b> Yes! After your order ships, you'll receive a tracking number via email. </p>
      </div>

      <div className= "question">
        <h3> Q3: Do you offer expedited shipping? </h3>
        <p> <b>A:</b> Yes, we offer 2-day and overnight shipping options at checkout. </p>
      </div>

      <div className= "question">
        <h3> Q4: What is your return policy? </h3>
        <p> <b>A:</b> We accept returns within 30 days of purchase for items in original condition. Shipping fees are non-refundable. </p>
      </div>

      <div className= "question">
        <h3> Q5: How do I exchange an item? </h3>
        <p> <b>A:</b> Contact our Customer Support team to receive a prepaid shipping label and instructions for your exchange. </p>
      </div>

      <div className= "question">
        <h3> Q6: Are your records new or used? </h3>
        <p> <b>A:</b> All records are guaranteed authentic and can be either new or carefully graded used. Product descriptions always indicate condition. </p>
      </div>

      <div className= "question">
        <h3> Q7: How do I know if a record is in stock? </h3>
        <p> <b>A:</b> Product pages display real-time inventory status. Items marked “In Stock” are ready to ship immediately. </p>
      </div>

      <div className= "question">
        <h3> Q8: Do you offer pre-orders? </h3>
        <p> <b>A:</b> Yes! Pre-order availability is shown on product pages. Pre-orders ship as soon as the item is released. </p>
      </div>

      <div className= "question">
        <h3> Q9: I entered the wrong shipping address - what can I do? </h3>
        <p> <b>A:</b> Contact Customer Support immediately. If the order hasn’t shipped, we can update the address for you. </p>
      </div>

      <div className= "question">
        <h3> Q10: Can I purchase gift cards? </h3>
        <p> <b>A:</b> Absolutely! Gift cards are available in multiple denominations and can be delivered via email. </p>
      </div>
      
    </div>
      

    </div>
  );
}