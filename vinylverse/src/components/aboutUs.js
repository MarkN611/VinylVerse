import '../styles/aboutUs.css';

export default function AboutUs() {
  return (
    <div className="aboutUs">
      <div className="hero-section">
        <h1>About VinylVerse</h1>
        <p className="hero-subtitle">Your premier destination for vinyl records and music culture</p>
      </div>

      <div className="content-container">
        <section className="mission-section">
          <h2>Our Mission & Vision</h2>
          <div className="mission-content">
            <div className="mission-item">
              <h3>Mission</h3>
              <p>To preserve and celebrate the timeless art of vinyl records by connecting music lovers with rare finds, classic albums, and emerging artists. We believe that vinyl isn't just music – it's a tangible piece of history and culture.</p>
            </div>
            <div className="mission-item">
              <h3>Vision</h3>
              <p>To be the world's most trusted vinyl marketplace, fostering a global community where music enthusiasts discover, collect, and share their passion for analog sound and album artistry.</p>
            </div>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Our Strategy</h2>
          <p>VinylVerse combines cutting-edge e-commerce technology with deep music industry expertise to create an unparalleled vinyl shopping experience. We partner directly with record labels, independent artists, and collectors to bring you authentic, high-quality vinyl records at competitive prices. Our platform emphasizes community engagement, expert curation, and sustainable practices in the vinyl industry.</p>
        </section>

        <section className="team-section">
          <h2>Meet Our Executives</h2>
          <div className="executives-grid">
            <div className="executive-card">
              <div className="executive-image">
                <img src="images/daanish.png" alt="Daanish Khan" className="executive-photo" />
              </div>
              <h3>Daanish Khan </h3>
              <h4>Founder</h4>
              <p><strong>Education:</strong> Bachelor of Science in Computer Science and Engineering, The Ohio State University (Class of 2026).</p>
              <p><strong>Experience:</strong> Software Engineer Intern at Cardinal Health, focusing on scalable enterprise solutions and software performance optimization. Previously contributed to cybersecurity initiatives at Ohio State’s Office of Student Life, improving security metrics by 26%. Also worked as a Quality Assurance Intern at Covance, developing medical technology for pharmaceutical partners.</p>
              <p><strong>Passion:</strong> Dedicated to building secure, impactful software that enhances both business efficiency and community well-being.</p>
            </div>

            <div className="executive-card">
              <div className="executive-image">
                <img src="images/shiva.png" alt="Shiva Nallapati" className="executive-photo" />
              </div>
              <h3>Shiva Nallapati</h3>
              <h4>Founder</h4>
              <p><strong>Education:</strong> Bachelor of Science in Computer Science and Engineering, The Ohio State University (Class of 2026).</p>
              <p><strong>Experience:</strong> Software Engineering Intern at Loop Returns, where he built a production-grade Model Context Protocol (MCP) server integrated with Loop’s return platform. Previous internships include OSA Technology Partners, CodeDay Labs, and Dynamo Surfaces, contributing to projects in full-stack web development, open-source software, and cybersecurity.</p>
              <p><strong>Passion:</strong> Driven by a passion for designing secure, efficient, and scalable systems that bridge the gap between engineering and business innovation.</p>
            </div>

            <div className="executive-card">
              <div className="executive-image">
                <img src="images/mark.png" alt="Mark Neal" className="executive-photo" />
              </div>
              <h3>Mark Neal</h3>
              <h4>Founder</h4>
              <p><strong>Education:</strong> Bachelor of Science in Computer Science and Engineering, The Ohio State University (Class of 2026).</p>
              <p><strong>Experience:</strong> Software Engineer Intern at Callidus Concepts, leading Project Acorn. Previous roles at Inflection Consulting and the Columbus Zoo & Aquarium. Skilled in Java, Unity, and full-stack software development with 3+ years of experience.</p>
              <p><strong>Passion:</strong> Dedicated to building innovative technology that connects people through music and digital experiences. Actively involved in humanitarian tech initiatives and enjoys exploring AI and sound design in his free time.</p>
            </div>

            <div className="executive-card">
              <div className="executive-image">
                <img src="images/hussam.png" alt="Hussam Mohamednour" className="executive-photo" />
              </div>
              <h3>Hussam Mohamednour</h3>
              <h4>Founder</h4>
              <p><strong>Education:</strong> Bachelor of Science in Computer Science and Engineering, The Ohio State University (Class of 2026).</p>
              <p><strong>Experience:</strong> Experienced in software development (Java, Python, JavaScript, C, C#, Ruby), cybersecurity, and networking.</p>
              <p><strong>Passion:</strong> Passionate about using technology to create real impact. Focused on building scalable, human-centered software.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}