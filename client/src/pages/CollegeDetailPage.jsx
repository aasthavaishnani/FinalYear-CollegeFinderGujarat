import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Building2, GraduationCap, TrendingUp,
    FileText, IndianRupee, Download, Star, Info, MessageSquare, Heart
} from 'lucide-react';
import ApplyForm from '../components/ApplyForm';

export default function CollegeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [college, setCollege] = useState(null);
    const [courses, setCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);

    // HomePage જેવું જ logic: IDs સ્ટોર કરવા માટે
    const [shortlistedIds, setShortlistedIds] = useState([]);

    // LocalStorage માંથી યુઝર લો
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/colleges/full-view/${id}`);
                setCollege(res.data.college);
                setCourses(res.data.courses || []);

                // જો યુઝર હોય તો એનું લિસ્ટ ફેચ કરો (HomePage મુજબ)
                if (user) {
                    const favRes = await axios.get(`http://localhost:5000/api/shortlist/${user.id}`);
                    const ids = favRes.data.map(item => item.id);
                    setShortlistedIds(ids);
                }
                setLoading(false);

            } catch (err) {
                console.error("Error fetching details", err);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // શોર્ટલિસ્ટ હેન્ડલ કરવા માટેનું ફંક્શન (બેઠું HomePage જેવું)
    const handleToggleShortlist = async () => {
        if (!user) {
            alert("Wait! You need to login to save your favorite colleges. ✨");
            navigate('/auth');
            return;
        }

        const collegeId = parseInt(id);
        const isAlreadyShortlisted = shortlistedIds.includes(collegeId);

        try {
            if (isAlreadyShortlisted) {
                // Delete API call (સેમ HomePage મુજબ)
                await axios.delete(`http://localhost:5000/api/shortlist/${user.id}/${collegeId}`);
                setShortlistedIds(shortlistedIds.filter(sid => sid !== collegeId));
                alert("Removed from favorites! 💔");
            } else {
                // Post API call (સેમ HomePage મુજબ)
                await axios.post('http://localhost:5000/api/shortlist', {
                    user_id: user.id,
                    college_id: collegeId
                });
                setShortlistedIds([...shortlistedIds, collegeId]);
                alert("Added to your shortlist! ❤️");
            }
        } catch (err) {
            console.error("Shortlist Toggle Error:", err);
            alert("Error updating shortlist.");
        }
    };

    const handleDownload = () => {
        if (college.brochure_url) {
            window.open(`http://localhost:5000${college.brochure_url}`, '_blank');
        }
    };

    const handleApply = () => {
        // જો કોલેજ પાસે પોતાની official_website હોય (જે web_admin એ નાખી હોય)
        if (college.official_website && college.official_website.trim() !== "") {
            // સીધી નવી ટેબમાં વેબસાઈટ ખોલો
            window.open(college.official_website, '_blank');
        } else {
            // નહીતર તારું બનાવેલું ApplyForm (Popup) ખોલો
            setShowApplyForm(true);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    if (!college) return <div style={{ textAlign: 'center', padding: '50px' }}>College Not Found</div>;

    // ચેક કરો કે આ કોલેજ લાઈક કરેલી છે?
    const isLiked = shortlistedIds.includes(parseInt(id));

    const s = {
        main: { background: '#f5f7f9', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
        bannerContainer: { position: 'relative', background: '#fff' },
        bannerImg: { width: '100%',maxWidth: '1500px', height: '550px',display: 'block', margin: '20px auto', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
        profileSection: { maxWidth: '1200px', margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px', gap: '20px', marginTop: '-80px' },
        logoBox: { width: '130px', height: '130px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #ddd' },
        headerContent: { flex: 1, paddingBottom: '10px' },
        title: { fontSize: '26px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#333', textShadow: '0 1px 2px rgba(255,255,255,0.8)' },
        btnGroup: { display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' },
        actionBtn: { padding: '10px 22px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' },
        applyBtn: { background: '#00a02f', color: 'white', border: 'none' },
        tabContainer: { maxWidth: '1200px', margin: '20px auto', borderBottom: '1px solid #ddd', display: 'flex', gap: '30px', padding: '0 20px', background: 'white', overflowX: 'auto' },
        tab: (active) => ({ padding: '15px 0', cursor: 'pointer', fontWeight: 'bold', color: active ? '#ff7900' : '#666', borderBottom: active ? '3px solid #ff7900' : 'none', fontSize: '14px', whiteSpace: 'nowrap' }),
        contentArea: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '25px', padding: '20px' },
        card: { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '20px' },
        courseRow: { display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #eee' },
        statBox: { flex: 1, padding: '15px', borderRadius: '8px', textAlign: 'center' }
    };

    return (
        <div style={s.main}>
            <div style={s.bannerContainer}>
                <img
                    style={s.bannerImg}
                    src={
                        college.image_url
                            ? (college.image_url.startsWith('http') ? college.image_url : `/${college.image_url}`)
                            : '/collegeimg.png'
                    }
                    alt="banner"
                    onError={(e) => { e.target.src = '/collegeimg.png'; }}
                />
                <div style={s.profileSection}>
                    <div style={s.logoBox}>
                        <img
                            src={
                                college.image_url
                                    ? (college.image_url.startsWith('http') ? college.image_url : `/${college.image_url}`)
                                    : '/collegeimg.png'
                            }
                            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                            alt="logo"
                            onError={(e) => { e.target.src = '/collegeimg.png'; }}
                        />
                    </div>
                    <div style={s.headerContent}>
                        <h1 style={s.title}>{college.name}</h1>
                        <div style={{ display: 'flex', gap: '15px', color: '#444', fontSize: '15px', fontWeight: '500' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {college.city}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={16} fill="#ff7900" color="#ff7900" /> {college.rating} / 5</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={16} /> {college.type} University</span>
                        </div>
                    </div>
                    <div style={s.btnGroup}>
                        {/* હાર્ટ બટન - HomePage જેવું જ ફોર્મેટ */}
                        <button
                            onClick={handleToggleShortlist}
                            style={{
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '50%',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                outline: 'none'
                            }}
                        >
                            <Heart
                                size={24}
                                color="#ff4d4d"
                                fill={isLiked ? "#ff4d4d" : "none"}
                            />
                        </button>
                        <button
                            onClick={handleApply}
                            style={{ ...s.actionBtn, ...s.applyBtn }}>Apply Now</button>
                        {college.brochure_url && (
                            <button onClick={handleDownload} style={{ ...s.actionBtn, background: '#ff7900', color: 'white', border: 'none' }}>
                                <Download size={18} /> Brochure
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div style={s.tabContainer}>
                {['info', 'courses', 'reviews', 'placements'].map(tab => (
                    <div key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                        {tab === 'info' ? 'College Info' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                ))}
            </div>

            <div style={s.contentArea}>
                <div className="left-side">
                    {activeTab === 'info' && (
                        <div style={s.card}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', marginBottom: '20px' }}><Info size={22} /> About {college.name}</h3>
                            <p style={{ lineHeight: '1.8', color: '#444', fontSize: '15px' }}>{college.description || "No description available."}</p>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div style={s.card}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', marginBottom: '20px' }}>
                                <GraduationCap size={22} /> Offered Courses & Fees
                            </h3>
                            {courses.length > 0 ? courses.map((c, i) => (
                                <div key={i} style={s.courseRow}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#004e92' }}>{c.course_name}</div>
                                        <div style={{ fontSize: '14px', color: '#ff7900', fontWeight: '600' }}>
                                            Stream: {c.stream || 'General'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Duration: {c.duration}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                            <IndianRupee size={15} /> {c.total_fees}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#777' }}>total course fees</div>
                                    </div>
                                </div>
                            )) : <p>No courses listed.</p>}
                        </div>
                    )}

                    {activeTab === 'placements' && (
                        <div style={s.card}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', marginBottom: '20px' }}>
                                <TrendingUp size={22} /> Placement Statistics
                            </h3>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>

                                {/* Highest Package */}
                                <div style={{ ...s.statBox, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold', marginBottom: '5px' }}>HIGHEST PACKAGE</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                                        {/* અહિયાં check કરો કે વેલ્યુ undefined કે null તો નથી ને */}
                                        {college.highest_package !== undefined && college.highest_package !== null
                                            ? `${college.highest_package} LPA`
                                            : 'N/A'}
                                    </div>
                                </div>

                                {/* Average Package */}
                                <div style={{ ...s.statBox, background: '#fff7ed', border: '1px solid #ffedd5' }}>
                                    <div style={{ fontSize: '13px', color: '#9a3412', fontWeight: 'bold', marginBottom: '5px' }}>AVERAGE PACKAGE</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2410c' }}>
                                        {college.average_package !== undefined && college.average_package !== null
                                            ? `${college.average_package} LPA`
                                            : 'N/A'}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={s.card}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', marginBottom: '20px' }}><MessageSquare size={22} /> Student Reviews</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '25px 0', padding: '20px', background: '#fdf7f2', borderRadius: '10px' }}>
                                <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#ff7900' }}>{college.rating}</div>
                                <div>
                                    <div style={{ display: 'flex', marginBottom: '5px' }}>{[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.floor(college.rating) ? "#ff7900" : "none"} color="#ff7900" />)}</div>
                                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Based on student ratings</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="right-side">
                    <div style={{ ...s.card, borderTop: '5px solid #ff7900' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Admission 2026</h4>
                        <div style={{
                            fontSize: '14px',
                            color: college.admission_open ? '#059669' : '#dc2626',
                            fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                            <span style={{ fontSize: '18px' }}>●</span>
                            {college.admission_open ? 'Admissions are Open' : 'Admissions are Closed'}
                        </div>
                        <button
                            onClick={handleApply}
                            style={{ ...s.actionBtn, ...s.applyBtn, width: '100%', justifyContent: 'center', fontSize: '16px' }}>
                            {college.official_website ? 'Apply via Official Site' : 'Apply Now'}
                        </button>
                    </div>

                    <div style={s.card}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '17px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Quick Info</h4>
                        <div style={{ fontSize: '14px', lineHeight: '2.5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>University Type:</span>
                                <strong style={{ color: '#333' }}>{college.type}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#666' }}>Location:</span>
                                <strong style={{ color: '#333' }}>{college.city}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showApplyForm && (
                <ApplyForm
                    collegeName={college.name}
                    collegeId={id}
                    courses={courses}
                    user={user}
                    onClose={() => setShowApplyForm(false)}
                />
            )}
        </div>
    );
}