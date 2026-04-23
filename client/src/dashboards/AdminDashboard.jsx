import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus, Trash2, Edit, Save, X, Star, ShieldCheck, LayoutDashboard,
    Eye, FileSearch, CheckCircle, Send, UploadCloud, MapPin,
    GraduationCap, Mail, Building2, Info, TrendingUp, IndianRupee, Globe, Calendar, Link, Award, FileText
} from 'lucide-react';

// --- ૧. FormField Component ---
const FormField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, isRequired = false, accept }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '5px' }}>
            {Icon && <Icon size={14} />} {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
        </label>
        {type === "textarea" ? (
            <textarea
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', height: '80px', fontSize: '14px', fontFamily: 'inherit' }}
                value={value || ''}
                placeholder={placeholder}
                onChange={onChange}
                required={isRequired}
            />
        ) : type === "select" ? ( // નવું logic
            <select
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', fontSize: '14px' }}
                value={value || ''}
                onChange={onChange}
                required={isRequired}
            >
                <option value="">Select Option</option>
                {accept.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', fontSize: '14px' }}
                type={type}
                {...(type !== 'file' ? { value: value || '' } : {})}
                placeholder={placeholder}
                onChange={onChange}
                required={isRequired}
                accept={accept}
            />
        )}
    </div>
);

const initialFormState = {
    name: '', location: '', city: '', type: '', ownership: '', rating: '5',
    image_url: '', description: '', establishment_year: '', admission_open: 1,
    brochure_url: '', highest_package: '', average_package: '', starting_fees: '',
    top_recruiters: '', is_profile_complete: 1, official_website: '',
    image_file: null, brochure_file: null,
    courses: [{ course_name: '', total_fees: '', duration: '', stream: '' }]
};

export default function AdminDashboard({ user }) {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('listings');
    const [selectedDocs, setSelectedDocs] = useState(null); // ડોક્યુમેન્ટ મોડલ માટે
    const [approvalForm, setApprovalForm] = useState({ requestId: null, email: '', password: '', college_name: '' }); // એપ્રુવલ ફોર્મ માટે
    const [showDirectAdd, setShowDirectAdd] = useState(false);

    const [directFormData, setDirectFormData] = useState(initialFormState);
    const [editingCollege, setEditingCollege] = useState(null);
    const [editFormData, setEditFormData] = useState(initialFormState);
    const [previews, setPreviews] = useState({ image: null, brochure: null });

    const isWebsiteAdmin = user?.role === 'web_admin';

    useEffect(() => {
        fetchColleges();
        if (isWebsiteAdmin) fetchRequests();
    }, [isWebsiteAdmin]);

    const fetchColleges = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/colleges', {
                params: { user_role: user.role }
            });
            setColleges(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/requests?user_role=${user.role}`);
            setRequests(res.data);
        } catch (err) {
            console.error("Requests fetch error:", err);
        }
    };

    // const createFormData = (data) => {
    //     const formData = new FormData();
    //     Object.keys(data).forEach(key => {
    //         if (key === 'image_file' && data[key]) formData.append('image', data[key]);
    //         else if (key === 'brochure_file' && data[key]) formData.append('brochure', data[key]);
    //         // કોર્સિસને સ્ટ્રિંગમાં ફેરવો
    //         else if (key === 'courses') formData.append('courses', JSON.stringify(data[key]));
    //         else if (data[key] !== null && data[key] !== undefined) formData.append(key, data[key]);
    //     });
    //     return formData;
    // };

    const handleDirectAdd = async (e) => {
        e.preventDefault();
        try {
            // backend મુજબ હવે image_file ની જગ્યાએ image_name અને brochure_file ની જગ્યાએ brochure_name મોકલવું
            const finalData = {
                ...directFormData,
                image_name: directFormData.image_file ? directFormData.image_file.name : 'default-college.png',
                brochure_name: directFormData.brochure_file ? directFormData.brochure_file.name : ''
            };

            // ડાયરેક્ટ JSON મોકલો, FormData નહિ
            await axios.post('http://localhost:5000/api/admin/add-college', finalData);

            alert("Official College Added Successfully!");
            setShowDirectAdd(false);
            setDirectFormData(initialFormState);
            fetchColleges();
        } catch (err) {
            alert("Error adding college");
            console.error(err);
        }
    };

    const handleEditClick = async (college) => {
        try {
            // ૧. પેલા બેઝિક વિગતો સેટ કરી દો
            setEditingCollege(college.id);
            setEditFormData({
                ...initialFormState,
                ...college,
                image_file: null,
                brochure_file: null
            });

            // ૨. હવે તે કોલેજના કોર્સિસ ફેચ કરો (તમારા full-view API નો ઉપયોગ કરીને)
            const res = await axios.get(`http://localhost:5000/api/colleges/full-view/${college.id}`);

            // ૩. જો કોર્સિસ મળે, તો તેને editFormData માં અપડેટ કરો
            if (res.data.courses) {
                setEditFormData(prev => ({
                    ...prev,
                    courses: res.data.courses
                }));
            }
        } catch (err) {
            console.error("Error fetching courses for edit:", err);
            alert("Could not load courses for editing.");
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalUpdateData = {
                ...editFormData,
                // જો નવી ફાઈલ સિલેક્ટ કરી હોય તો તેનું નામ, નહીતર જૂની URL
                image_url: editFormData.image_file ? editFormData.image_file.name : editFormData.image_url,
                brochure_url: editFormData.brochure_file ? editFormData.brochure_file.name : editFormData.brochure_url
            };

            await axios.put(`http://localhost:5000/api/college-admin/full-update/${editingCollege}`, finalUpdateData);

            alert("College Updated Successfully!");
            setEditingCollege(null);
            fetchColleges();
        } catch (err) {
            alert("Update failed");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await axios.delete(`http://localhost:5000/api/colleges/${id}?user_role=${user.role}`);
                fetchColleges();
            } catch (err) { alert("Delete failed"); }
        }
    };

    // --- એપ્રુવલ સબમિટ લોજિક (User ID/Password સાથે) ---
    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/requests/approve-v2', {
                requestId: approvalForm.requestId,
                email: approvalForm.email,
                password: approvalForm.password
            });
            alert("College Approved & Login details sent via Mail!");
            setApprovalForm({ requestId: null, email: '', password: '', college_name: '' });
            fetchRequests();
            fetchColleges();
        } catch (err) { alert("Approval failed"); }
    };

    // --- રિક્વેસ્ટ રીજેક્ટ લોજિક ---
    const handleReject = async (requestId, email) => {
        const reason = window.prompt("Enter reason for rejection:", "Documents are incomplete.");
        if (reason === null) return;

        if (window.confirm("Are you sure you want to reject?")) {
            try {
                await axios.post('http://localhost:5000/api/requests/reject', {
                    requestId,
                    contact_email: email,
                    reason: reason,
                    user_role: user.role
                });
                alert("Rejected and email sent!");
                fetchRequests();
            } catch (err) {
                alert("Failed: " + (err.response?.data?.message || "Error"));
            }
        }
    };

    const handleViewDocs = async (req) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/requests/documents/${req.id}`);
            setSelectedDocs({ ...req, docsList: res.data }); // docsList માં ડેટા સ્ટોર થશે
        } catch (err) {
            console.error("Docs fetch error:", err);
            alert("Error loading documents");
        }
    };

    // ફાઈલ ચેન્જ હેન્ડલર
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setDirectFormData({ ...directFormData, [`${field}_file`]: file });
            setPreviews({ ...previews, [field]: URL.createObjectURL(file) });
        }
    };

    // કોર્સની વિગતો અપડેટ કરવા માટે
    const handleCourseChange = (index, field, value, isEdit = false) => {
        const targetState = isEdit ? editFormData : directFormData;
        const setTargetState = isEdit ? setEditFormData : setDirectFormData;

        const updatedCourses = [...targetState.courses];
        updatedCourses[index][field] = value;
        setTargetState({ ...targetState, courses: updatedCourses });
    };

    // નવો કોર્સ લિસ્ટમાં ઉમેરવા માટે
    const addCourseField = (isEdit = false) => {
        const targetState = isEdit ? editFormData : directFormData;
        const setTargetState = isEdit ? setEditFormData : setDirectFormData;

        setTargetState({
            ...targetState,
            courses: [...targetState.courses, { course_name: '', total_fees: '', duration: '', stream: '' }]
        });
    };

    // કોર્સ લિસ્ટમાંથી કાઢી નાખવા માટે
    const removeCourseField = (index, isEdit = false) => {
        const targetState = isEdit ? editFormData : directFormData;
        const setTargetState = isEdit ? setEditFormData : setDirectFormData;

        const updatedCourses = targetState.courses.filter((_, i) => i !== index);
        setTargetState({ ...targetState, courses: updatedCourses });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '20px', position: 'fixed', height: '100vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                    <ShieldCheck size={28} color="#38bdf8" />
                    <h2 style={{ fontSize: '18px' }}>Admin Dashboard</h2>
                </div>
                <nav>
                    <button onClick={() => setActiveTab('listings')} style={{ width: '100%', padding: '12px', marginBottom: '10px', background: activeTab === 'listings' ? '#334155' : 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard size={18} /> College Listings
                    </button>
                    {isWebsiteAdmin && (
                        <button onClick={() => setActiveTab('requests')} style={{ width: '100%', padding: '12px', background: activeTab === 'requests' ? '#334155' : 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileSearch size={18} /> Pending Requests ({requests.length})
                        </button>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', color: '#1e293b', fontWeight: 'bold' }}>
                        {activeTab === 'listings' ? 'College Management' : 'Pending Registration Requests'}
                    </h1>
                    {activeTab === 'listings' && isWebsiteAdmin && (
                        <button onClick={() => setShowDirectAdd(!showDirectAdd)} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            {showDirectAdd ? <X size={18} /> : <Plus size={18} />}
                            {showDirectAdd ? 'Cancel' : 'Add Official College'}
                        </button>
                    )}
                </div>

                {activeTab === 'listings' ? (
                    <div>
                        {showDirectAdd && (
                            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Building2 size={20} color="#2563eb" /> Add New Official College</h3>
                                <form onSubmit={handleDirectAdd}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <FormField label="College Name" icon={GraduationCap} value={directFormData.name} onChange={(e) => setDirectFormData({ ...directFormData, name: e.target.value })} isRequired />
                                        <FormField label="City" icon={MapPin} value={directFormData.city} onChange={(e) => setDirectFormData({ ...directFormData, city: e.target.value })} isRequired />
                                        <FormField label="Location" icon={MapPin} value={directFormData.location} onChange={(e) => setDirectFormData({ ...directFormData, location: e.target.value })} />
                                        <FormField
                                            label="Type"
                                            type="select"
                                            accept={['Private', 'Government', 'Autonomous']}
                                            value={directFormData.type}
                                            onChange={(e) => setDirectFormData({ ...directFormData, type: e.target.value })}
                                        />
                                        <FormField
                                            label="Ownership"
                                            type="select"
                                            accept={['Trust', 'Individual', 'PPP']}
                                            value={directFormData.ownership}
                                            onChange={(e) => setDirectFormData({ ...directFormData, ownership: e.target.value })}
                                        />
                                        <FormField label="Rating" icon={Star} type="number" value={directFormData.rating} onChange={(e) => setDirectFormData({ ...directFormData, rating: e.target.value })} />
                                        <FormField label="Est. Year" icon={Calendar} value={directFormData.establishment_year} onChange={(e) => setDirectFormData({ ...directFormData, establishment_year: e.target.value })} />
                                        <FormField label="Website" icon={Globe} value={directFormData.official_website} onChange={(e) => setDirectFormData({ ...directFormData, official_website: e.target.value })} />
                                        <FormField label="Admission (1/0)" icon={CheckCircle} type="number" value={directFormData.admission_open} onChange={(e) => setDirectFormData({ ...directFormData, admission_open: e.target.value })} />
                                        <FormField label="Highest Package" icon={Award} value={directFormData.highest_package} onChange={(e) => setDirectFormData({ ...directFormData, highest_package: e.target.value })} />
                                        <FormField label="Avg Package" icon={TrendingUp} value={directFormData.average_package} onChange={(e) => setDirectFormData({ ...directFormData, average_package: e.target.value })} />
                                        <FormField label="Fees" icon={IndianRupee} value={directFormData.starting_fees} onChange={(e) => setDirectFormData({ ...directFormData, starting_fees: e.target.value })} />
                                        <FormField label="Recruiters" icon={Building2} value={directFormData.top_recruiters} onChange={(e) => setDirectFormData({ ...directFormData, top_recruiters: e.target.value })} />
                                        <FormField
                                            label="Profile Status"
                                            icon={CheckCircle}
                                            type="select"
                                            accept={['1', '0']}
                                            value={directFormData.is_profile_complete}
                                            onChange={(e) => setDirectFormData({ ...directFormData, is_profile_complete: e.target.value })}
                                        />
                                        <FormField label="Upload Image" icon={UploadCloud} type="file" onChange={(e) => setDirectFormData({ ...directFormData, image_file: e.target.files[0] })} />
                                        <FormField label="Upload Brochure" icon={UploadCloud} type="file" onChange={(e) => setDirectFormData({ ...directFormData, brochure_file: e.target.files[0] })} />
                                    </div>
                                    {/* Courses Section for Adding */}
                                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h4 style={{ fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <GraduationCap size={18} /> Courses Offered
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => addCourseField(false)}
                                                style={{ padding: '5px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                            >
                                                + Add Course
                                            </button>
                                        </div>

                                        {directFormData.courses.map((course, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                <input placeholder="Course Name (e.g. BE IT)" value={course.course_name} onChange={(e) => handleCourseChange(index, 'course_name', e.target.value, false)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Fees" value={course.total_fees} onChange={(e) => handleCourseChange(index, 'total_fees', e.target.value, false)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Duration" value={course.duration} onChange={(e) => handleCourseChange(index, 'duration', e.target.value, false)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Stream" value={course.stream} onChange={(e) => handleCourseChange(index, 'stream', e.target.value, false)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <button type="button" onClick={() => removeCourseField(index, false)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <FormField label="Description" type="textarea" value={directFormData.description} onChange={(e) => setDirectFormData({ ...directFormData, description: e.target.value })} />
                                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save College</button>
                                </form>
                            </div>
                        )}

                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f1f5f9' }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>College Name</th>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>City</th>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {colleges.map(col => (
                                        <tr key={col.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>{col.name}</td>
                                            <td style={{ padding: '15px' }}>{col.city}</td>
                                            <td style={{ padding: '15px' }}>
                                                {col.is_profile_complete === 1 ? (
                                                    <span style={{
                                                        color: '#22c55e',
                                                        backgroundColor: '#f0fdf4',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ● Live
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        color: '#ef4444',
                                                        backgroundColor: '#fef2f2',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ● Offline / Incomplete
                                                    </span>
                                                )}
                                            </td>                                            <td style={{ padding: '15px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => handleEditClick(col)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={18} /></button>
                                                    {isWebsiteAdmin && <button onClick={() => handleDelete(col.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {editingCollege && (
                            <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '2px solid #2563eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h3>Editing: {editFormData.name}</h3>
                                    <button onClick={() => setEditingCollege(null)}><X /></button>
                                </div>
                                <form onSubmit={handleUpdateSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <FormField label="College Name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} isRequired />
                                        <FormField label="City" value={editFormData.city} onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })} isRequired />
                                        <FormField label="Location" value={editFormData.location} onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })} />
                                        <FormField
                                            label="Type"
                                            type="select"
                                            accept={['Private', 'Government', 'Autonomous']}
                                            value={editFormData.type}
                                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                        />
                                        <FormField
                                            label="Ownership"
                                            type="select"
                                            accept={['Trust', 'Individual', 'PPP']}
                                            value={editFormData.ownership}
                                            onChange={(e) => setEditFormData({ ...editFormData, ownership: e.target.value })}
                                        />
                                        <FormField label="Rating" type="number" value={editFormData.rating} onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })} />
                                        <FormField label="Admission (1/0)" type="number" value={editFormData.admission_open} onChange={(e) => setEditFormData({ ...editFormData, admission_open: e.target.value })} />
                                        <FormField label="Website" value={editFormData.official_website} onChange={(e) => setEditFormData({ ...editFormData, official_website: e.target.value })} />
                                        <FormField label="Highest Package" value={editFormData.highest_package} onChange={(e) => setEditFormData({ ...editFormData, highest_package: e.target.value })} />
                                        <FormField label="Avg Package" value={editFormData.average_package} onChange={(e) => setEditFormData({ ...editFormData, average_package: e.target.value })} />
                                        <FormField label="Fees" value={editFormData.starting_fees} onChange={(e) => setEditFormData({ ...editFormData, starting_fees: e.target.value })} />
                                        <FormField label="Recruiters" value={editFormData.top_recruiters} onChange={(e) => setEditFormData({ ...editFormData, top_recruiters: e.target.value })} />
                                        <FormField
                                            label="Profile Status"
                                            icon={CheckCircle}
                                            type="select"
                                            accept={['1', '0']}
                                            value={editFormData.is_profile_complete !== null ? editFormData.is_profile_complete.toString() : '0'}
                                            onChange={(e) => setEditFormData({ ...editFormData, is_profile_complete: e.target.value })}
                                        />
                                        <FormField label="New Image" type="file" onChange={(e) => setEditFormData({ ...editFormData, image_file: e.target.files[0] })} />
                                        <FormField label="New Brochure" type="file" onChange={(e) => setEditFormData({ ...editFormData, brochure_file: e.target.files[0] })} />
                                    </div>
                                    {/* Courses Section for Editing */}
                                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f1f5f9', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h4 style={{ fontSize: '15px', color: '#1e293b' }}>Edit Courses</h4>
                                            <button
                                                type="button"
                                                onClick={() => addCourseField(true)}
                                                style={{ padding: '5px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                            >
                                                + Add Course
                                            </button>
                                        </div>

                                        {editFormData.courses && editFormData.courses.map((course, index) => (
                                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                <input placeholder="Course Name" value={course.course_name} onChange={(e) => handleCourseChange(index, 'course_name', e.target.value, true)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Fees" value={course.total_fees} onChange={(e) => handleCourseChange(index, 'total_fees', e.target.value, true)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Duration" value={course.duration} onChange={(e) => handleCourseChange(index, 'duration', e.target.value, true)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <input placeholder="Stream" value={course.stream} onChange={(e) => handleCourseChange(index, 'stream', e.target.value, true)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }} />
                                                <button type="button" onClick={() => removeCourseField(index, true)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <FormField label="Description" type="textarea" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} />
                                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Update College</button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                    /* --- Pending Requests UI --- */
                    <div>
                        {requests.length === 0 ? <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No pending requests.</p> : (
                            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                                        <tr>
                                            <th style={{ padding: '15px', textAlign: 'left' }}>College Name</th>
                                            <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Documents</th>
                                            <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(req => (
                                            <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '15px', fontWeight: '600' }}>{req.college_name}</td>
                                                <td style={{ padding: '15px' }}>{req.contact_email}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <button onClick={() => handleViewDocs(req)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}>
                                                        <Eye size={14} /> View Docs
                                                    </button>
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => setApprovalForm({ requestId: req.id, email: req.contact_email, password: '', college_name: req.college_name })}
                                                            style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id, req.contact_email)} // અહિયાં handleReject અને બે પેરામીટર આપો
                                                            style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- ૧. Document Viewer Modal --- */}
                {selectedDocs && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} color="#2563eb" /> Attached Documents</h3>
                                <button onClick={() => setSelectedDocs(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedDocs.docsList && selectedDocs.docsList.length > 0 ? (
                                    selectedDocs.docsList.map((doc, i) => (
                                        <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
                                                {doc.document_type.replace(/_/g, ' ')}
                                            </span>
                                            <a
                                                href={`http://localhost:5000/${doc.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}
                                            >
                                                View File
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#64748b' }}>No documents uploaded for this request.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ૨. Approval Form Modal (Credentials) --- */}
                {approvalForm.requestId && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1002 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Approve: {approvalForm.college_name}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Enter the login credentials. These will be sent to the college via email.</p>
                            <form onSubmit={handleApproveSubmit}>
                                <FormField label="Admin User ID (Email)" icon={Mail} value={approvalForm.email} onChange={(e) => setApprovalForm({ ...approvalForm, email: e.target.value })} isRequired />
                                <FormField label="Setup Password" type="password" icon={ShieldCheck} value={approvalForm.password} onChange={(e) => setApprovalForm({ ...approvalForm, password: e.target.value })} isRequired />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Send size={16} /> Confirm & Send
                                    </button>
                                    <button type="button" onClick={() => setApprovalForm({ requestId: null, email: '', password: '', college_name: '' })} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}