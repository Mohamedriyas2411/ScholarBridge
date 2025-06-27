import React, { useEffect, useState } from 'react';
import Sidebar from './SideBar';

const ConnectWithAlumni = () => {
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    // Static data for now, can be replaced with API call later
    const fetchData = async () => {
      const staticData = [
        {
          name: 'Priya Sharma',
          position: 'Software Engineer at Google',
          batch: 2019,
          photo: 'https://via.placeholder.com/80x80?text=Priya'
        },
        {
          name: 'Ravi Mehta',
          position: 'Product Manager at Microsoft',
          batch: 2018,
          photo: 'https://via.placeholder.com/80x80?text=Ravi'
        },
        {
          name: 'Anita Rao',
          position: 'Data Scientist at Amazon',
          batch: 2020,
          photo: 'https://via.placeholder.com/80x80?text=Anita'
        }
      ];
      setAlumni(staticData);
    };

    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', width:'100vw',color:'black' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Connect with Alumni</h2>
        <input
          type="text"
          placeholder="Search alumni by name, company, or batch..."
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {alumni.map((alum, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                width: '250px'
              }}
            >
              <img src={alum.photo} alt="Alumni Photo" style={{ width: '80px', height: '80px' }} />
              <h3 style={{ margin: '1rem 0 0.5rem' }}>{alum.name}</h3>
              <p>{alum.position}</p>
              <p>Batch: {alum.batch}</p>
              <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '5px' }}>
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectWithAlumni;
