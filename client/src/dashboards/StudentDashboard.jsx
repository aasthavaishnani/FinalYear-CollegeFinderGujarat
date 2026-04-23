import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ExternalLink, GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard({ user }) {
    const [shortlist, setShortlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    // 1. Fetch the shortlist on load
    useEffect(() => {
        fetchShortlist();
        fetchApplications();
    }, []);

    const fetchShortlist = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/shortlist/${user.id}`);
            setShortlist(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching shortlist", err);
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/student/applications/${user.id}`);
            setApplications(res.data); // API માંથી આવેલો ડેટા સ્ટેટમાં સેવ થશે
        } catch (err) {
            console.error("Error fetching applications", err);
        }
    };

    // 2. Handle Removing from Shortlist
    const handleRemove = async (collegeId) => {
        try {
            await axios.delete(`http://localhost:5000/api/shortlist/${user.id}/${collegeId}`);
            // Update UI immediately
            setShortlist(shortlist.filter(item => item.id !== collegeId));
        } catch (err) {
            alert("Error removing college");
        }
    };

    return (
        <div className="student-dashboard">
            <div className="info-card-premium">
                <h1>Welcome, {user.full_name}</h1>
                <p className="role-tag">Student Account</p>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div className="stat-card" style={{ padding: '20px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e3ff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <GraduationCap size={20} color="#0066ff" />
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Applications</h3>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#0066ff' }}>{applications.length}</p>
                    </div>

                    <div className="stat-card" style={{ padding: '20px', background: '#fff0f0', borderRadius: '12px', border: '1px solid #ffdada' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Heart size={20} color="#ff4d4d" />
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Shortlisted</h3>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#ff4d4d' }}>{shortlist.length}</p>
                    </div>
                </div>
            </div>

            <div className="info-card-premium" style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px' }}>Your Shortlisted Colleges</h2>
                    <span style={{ fontSize: '14px', color: '#666' }}>{shortlist.length} saved</span>
                </div>

                {loading ? (
                    <p>Loading your list...</p>
                ) : shortlist.length > 0 ? (
                    <div className="shortlist-list">
                        {shortlist.map((clg) => (
                            <div key={clg.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                border: '1px solid #eee',
                                borderRadius: '10px',
                                marginBottom: '12px',
                                background: '#fcfcfc'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{clg.name}</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>📍 {clg.city}, Gujarat</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/college/${clg.id}`} className="nav-link" style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <ExternalLink size={16} /> View
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(clg.id)}
                                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Trash2 size={16} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <Heart size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                        <p>No colleges in your shortlist yet.</p>
                        <Link to="/" style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>Start Exploring</Link>
                    </div>
                )}
            </div>

            <div className="info-card-premium" style={{ marginTop: '30px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Applications</h2>
                {applications.length > 0 ? (
                    <div className="applications-list">
                        {applications.map((app, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '15px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                marginBottom: '12px',
                                background: '#f8fafc'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0' }}>{app.college_name}</h4>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                        Course: <b>{app.course_name}</b>
                                    </p>
                                </div>
                                <div style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                                    ✓ Submitted
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#999' }}>No applications yet.</p>
                )}
            </div>
        </div>
    );
}   