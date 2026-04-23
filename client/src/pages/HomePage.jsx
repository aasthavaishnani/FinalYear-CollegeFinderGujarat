import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Star, Bell, Heart } from 'lucide-react';

export default function HomePage() {
    const [colleges, setColleges] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // State to store only the IDs of shortlisted colleges
    const [shortlistedIds, setShortlistedIds] = useState([]);

    // Get logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Fetch Colleges based on search
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/colleges?search=${search}`)
            .then((res) => {
                setColleges(res.data);
            })
            .catch((err) => console.error("Error fetching colleges:", err));
    }, [search]);

    // 2. Fetch the user's shortlist IDs when the page loads
    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:5000/api/shortlist/${user.id}`)
                .then(res => {
                    const ids = res.data.map(item => item.id);
                    setShortlistedIds(ids);
                })
                .catch(err => console.error("Error fetching shortlist IDs", err));
        }
    }, []);

    // 3. Handle Shortlist Toggle (Add / Remove)
    const handleShortlist = async (collegeId) => {
        if (!user) {
            alert("Wait! You need to login to save your favorite colleges. ✨");
            navigate('/auth');
            return;
        }

        const isAlreadyShortlisted = shortlistedIds.includes(collegeId);

        try {
            if (isAlreadyShortlisted) {
                await axios.delete(`http://localhost:5000/api/shortlist/${user.id}/${collegeId}`);
                setShortlistedIds(shortlistedIds.filter(id => id !== collegeId));
                alert("Removed from favorites! 💔");
            } else {
                await axios.post('http://localhost:5000/api/shortlist', {
                    user_id: user.id,
                    college_id: collegeId
                });
                setShortlistedIds([...shortlistedIds, collegeId]);
                alert("Added to your shortlist! ❤️");
            }
        } catch (err) {
            alert("Error updating shortlist.");
        }
    };

    return (
        <div className="app-container">
            <header className="hero-section">
                <div className="container">
                    <h1 className="title">
                        Find Top Colleges in <span>Gujarat</span>
                    </h1>
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search Colleges, Cities, or Courses (e.g. BCA, MBA)..."
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* નવું: કોલેજ રજીસ્ટ્રેશન રિક્વેસ્ટ માટેનું પ્રોમ્પ્ટ (માત્ર જે લોગિન નથી તેના માટે) */}
                    {!user && (
                        <div style={{ marginTop: '25px' }}>
                            <Link to="/register-college" className="details-btn" style={{ background: '#fff', color: '#2563eb', border: 'none' }}>
                                Are you a College Authority? List Your College
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <main className="grid-section">
                <div className="container">
                    <div className="college-grid">
                        {colleges.length > 0 ? (
                            colleges.map((clg) => {
                                const isLiked = shortlistedIds.includes(clg.id);

                                return (
                                    <div key={clg.id} className="college-card" style={{ position: 'relative' }}>
                                        {/* Heart Button */}
                                        <button
                                            className="heart-btn"
                                            onClick={() => handleShortlist(clg.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                zIndex: 10,
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            <Heart
                                                size={20}
                                                color="#ff4d4d"
                                                fill={isLiked ? "#ff4d4d" : "none"}
                                            />
                                        </button>

                                        {clg.live_event && (
                                            <div className="badge">
                                                <Bell size={12} /> {clg.live_event}
                                            </div>
                                        )}

                                        <div className="image-box">
                                            <img
                                                src={clg.image_url || '/collegeimg.png'}
                                                alt={clg.name}
                                                onError={(e) => { e.target.src = '/collegeimg.png' }}
                                            />
                                        </div>

                                        <div className="card-details">
                                            <div className="card-meta">
                                                <span className="location">
                                                    <MapPin size={14} /> {clg.location}
                                                </span>
                                                <span className="rating">
                                                    {clg.rating} <Star size={12} fill="currentColor" />
                                                </span>
                                            </div>
                                            <h3 className="college-title">{clg.name}</h3>
                                            <div className="stats-box">
                                                <div className="stat">
                                                    <small>Avg Fees</small>
                                                    <p>
                                                        {clg.starting_fees && Number(clg.starting_fees) > 0
                                                            ? Number(clg.starting_fees) >= 100000
                                                                ? `₹${(Number(clg.starting_fees) / 100000).toFixed(1)}L`
                                                                : `₹${(Number(clg.starting_fees) / 1000).toFixed(0)}K`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="stat text-right">
                                                    <small>Highest Package</small>
                                                    <p className="green-text">
                                                        {clg.highest_package ? `${clg.highest_package} LPA` : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link to={`/college/${clg.id}`} className="details-btn">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-results">
                                <h3>No colleges found matching "{search}"</h3>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}