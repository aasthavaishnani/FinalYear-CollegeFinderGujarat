import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, BookOpen, GraduationCap, TrendingUp,
    Upload, Save, Plus, Trash2, CheckCircle, FileText, MapPin, X
} from 'lucide-react';

export default function CollegeAdminDashboard({ user }) {
    const collegeId = user?.college_id;
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [shortlistedStudents, setShortlistedStudents] = useState([]);

    // Form States
    const [profile, setProfile] = useState({
        description: '',
        location: '',
        city: '',
        type: '',
        ownership: '',
        admission_open: 1,
        highest_package: '',
        average_package: '',
        starting_fees: '',
        top_recruiters: '',
        image_url: '',
        brochure_url: ''
    });

    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        course_name: '',
        total_fees: '',
        stream: '',
        duration: ''
    });
    const [campusImg, setCampusImg] = useState(null);
    const [brochure, setBrochure] = useState(null);

    // ઇનપુટ હેન્ડલર
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            // જો ફિલ્ડ પેકેજ વાળું હોય તો તેને નંબરમાં ફેરવો, બાકી એમ જ રહેવા દો
            [name]: (name === 'highest_package' || name === 'average_package') ? parseFloat(value) || "" : value
        }));
    };

    const fetchCollegeData = () => {
        if (collegeId) {
            axios.get(`http://localhost:5000/api/colleges/full-view/${collegeId}`)
                .then(res => {
                    if (res.data.college) {
                        setProfile(prev => ({
                            ...prev,
                            ...res.data.college
                        }));
                        setCourses(res.data.courses || []);
                    }
                })
                .catch(err => console.error("Data fetch error", err));
        }
    };

    const fetchShortlistedStudents = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/college/shortlisted-students/${collegeId}`);
            setShortlistedStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        }
    };

    useEffect(() => {
        fetchCollegeData();
        if (collegeId) {
            fetchShortlistedStudents();
        }
    }, [collegeId]);

    // ૧. કોર્સ એડ કરવાનું લોજિક
    const handleAddCourse = () => {
        if (!newCourse.course_name || !newCourse.total_fees) {
            alert("Please fill course name and fees!");
            return;
        }
        setCourses([...courses, newCourse]);
        setNewCourse({
            course_name: '',
            total_fees: '',
            stream: '',
            duration: ''
        });
    };

    // ૨. કોર્સ રિમૂવ કરવાનું લોજિક (X બટન માટે)
    const removeCourse = (index) => {
        const updatedCourses = courses.filter((_, i) => i !== index);
        setCourses(updatedCourses);
    };

    const handlePublishProfile = async () => {
        setLoading(true);
        const formData = new FormData();

        // બધી પ્રોફાઈલ વેલ્યુ મોકલો, જો ખાલી હોય તો ખાલી સ્ટ્રિંગ મોકલો
        Object.keys(profile).forEach(key => {
            const value = (profile[key] === null || profile[key] === undefined) ? "" : profile[key];
            formData.append(key, value);
        });

        if (campusImg) formData.append('image', campusImg);
        if (brochure) formData.append('brochure', brochure);

        // કોર્સ ડેટા મોકલો
        formData.append('courses', JSON.stringify(courses));

        try {
            const res = await axios.put(`http://localhost:5000/api/college-admin/full-update/${collegeId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("🚀 " + res.data.message);
            fetchCollegeData(); // ડેટા રિફ્રેશ કરો
        } catch (err) {
            console.error("Publish Error:", err.response?.data || err.message);
            alert("Failed to publish profile. Check Backend Terminal.");
        }
        setLoading(false);
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <LayoutDashboard color="#6366f1" size={28} />
                    <span>College<b>Finder</b> Admin</span>
                </div>
                <nav className="admin-nav">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
                        <BookOpen size={18} /> Identity & Overview
                    </button>
                    <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
                        <GraduationCap size={18} /> Courses & Fees
                    </button>
                    <button className={activeTab === 'placement' ? 'active' : ''} onClick={() => setActiveTab('placement')}>
                        <TrendingUp size={18} /> Placements
                    </button>
                    <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>
                        <FileText size={18} /> Media Assets
                    </button>
                    <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
                        <GraduationCap size={18} /> Interested Students
                    </button>
                </nav>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                    <a
                        href={`http://localhost:5000/api/admin/export-applications/${collegeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 15px',
                            background: '#10b981', // Green color for success/leads
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginTop: '10px'
                        }}
                    >
                        <FileText size={18} /> View Applications (Text File)
                    </a>
                </div>
            </aside>

            <main className="admin-main-content">
                <header className="admin-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="text-muted">Manage your college presence (ID: {collegeId})</p>
                    </div>
                    <button className="publish-btn" onClick={handlePublishProfile} disabled={loading}>
                        <Save size={18} /> {loading ? "Processing..." : "Publish Changes"}
                    </button>
                </header>

                <div className="admin-card">
                    {/* OVERVIEW SECTION */}
                    {activeTab === 'general' && (
                        <div className="form-section">
                            <div className="input-group">
                                <label>Detailed Institute Overview</label>
                                <textarea
                                    name="description"
                                    rows="6"
                                    placeholder="Write about college history, vision, and campus..."
                                    value={profile.description || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-field">
                                    <label>Location (Area/Road)</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Kalawad Road"
                                        value={profile.location || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="input-field">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="e.g. Rajkot"
                                        value={profile.city || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Starting Fees</label>
                                    <input
                                        type="text"
                                        name="starting_fees"
                                        placeholder="e.g. 50,000"
                                        value={profile.starting_fees || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-field">
                                    <label>College Type</label>
                                    <select name="type" value={profile.type || ""} onChange={handleChange}>
                                        <option value="">Select Type</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Management">Management</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Arts/Science">Arts/Science</option>
                                    </select>
                                </div>
                                <div className="input-field">
                                    <label>Admission Status</label>
                                    <div className={`status-toggle ${profile.admission_open == 1 ? 'open' : 'closed'}`}
                                        onClick={() => setProfile({ ...profile, admission_open: profile.admission_open == 1 ? 0 : 1 })}>
                                        {profile.admission_open == 1 ? "Admissions Open" : "Admissions Closed"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COURSES SECTION */}
                    {activeTab === 'courses' && (
                        <div className="form-section">
                            <h3 style={{ marginBottom: '10px' }}>Add Academic Programs</h3>
                            <div className="course-adder">
                                <input
                                    placeholder="Course Name"
                                    value={newCourse.course_name}
                                    onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })}
                                />
                                <input
                                    placeholder="Total Fees"
                                    value={newCourse.total_fees} // ફેરફાર અહીં છે
                                    onChange={e => setNewCourse({ ...newCourse, total_fees: e.target.value })}
                                />
                                <input
                                    placeholder="Stream"
                                    value={newCourse.stream}
                                    onChange={e => setNewCourse({ ...newCourse, stream: e.target.value })}
                                />
                                <input
                                    placeholder="Duration (e.g. 3 Years)"
                                    value={newCourse.duration}
                                    onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })}
                                />
                                <button className="add-btn-circle" onClick={handleAddCourse}><Plus /></button>
                            </div>

                            {/* લિસ્ટમાં નીચે ડેટા બતાવવા માટે */}
                            <div className="course-grid">
                                {courses.map((c, idx) => (
                                    <div key={idx} className="course-tag-item">
                                        <div>
                                            <strong>{c.course_name}</strong>
                                            {/* અહીં c.total_fees અને c.stream બરાબર લખજો */}
                                            <p>{c.stream} | ₹{c.total_fees} | {c.duration}</p>
                                        </div>
                                        <X className="text-red" size={16} style={{ cursor: 'pointer' }} onClick={() => removeCourse(idx)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PLACEMENT SECTION */}
                    {activeTab === 'placement' && (
                        <div className="form-section">
                            <div className="input-row">
                                <div className="input-field">
                                    <label>Highest Package (LPA)</label>
                                    <input
                                        type="number"
                                        name="highest_package"
                                        placeholder="e.g. 45"
                                        value={profile.highest_package || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Average Package (LPA)</label>
                                    <input
                                        type="number"
                                        name="average_package"
                                        placeholder="e.g. 6.5"
                                        value={profile.average_package || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Top Recruiters (Comma separated)</label>
                                <textarea
                                    name="top_recruiters"
                                    placeholder="Google, Microsoft, TCS, Infosys..."
                                    value={profile.top_recruiters || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* MEDIA SECTION */}
                    {activeTab === 'media' && (
                        <div className="form-section">
                            <div className="upload-container">
                                <div className="upload-box">
                                    <Upload size={32} color="#6366f1" />
                                    <h4>Campus Cover Photo</h4>
                                    <input type="file" accept="image/*" onChange={e => setCampusImg(e.target.files[0])} />
                                    {profile.image_url && <p className="text-success small">✓ Image exists</p>}
                                </div>
                                <div className="upload-box">
                                    <FileText size={32} color="#6366f1" />
                                    <h4>Official Brochure (PDF)</h4>
                                    <input type="file" accept=".pdf" onChange={e => setBrochure(e.target.files[0])} />
                                    {profile.brochure_url && (
                                        <a href={`http://localhost:5000${profile.brochure_url}`} target="_blank" className="small-link">View Current Brochure</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INTERESTED STUDENTS SECTION */}
                    {activeTab === 'students' && (
                        <div className="form-section">
                            <h3 style={{ marginBottom: '20px' }}>Students who shortlisted your college</h3>
                            <div style={{ background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                            <th style={{ padding: '15px' }}>Student Name</th>
                                            <th style={{ padding: '15px' }}>Email Address</th>
                                            <th style={{ padding: '15px' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shortlistedStudents.length > 0 ? (
                                            shortlistedStudents.map((std, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '15px', fontWeight: '500' }}>{std.full_name}</td>
                                                    <td style={{ padding: '15px' }}>{std.email}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <a href={`mailto:${std.email}`} style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                                                            Contact via Mail
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                                    No students have shortlisted your college yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}