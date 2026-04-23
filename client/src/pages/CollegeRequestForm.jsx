import React, { useState } from 'react';
import axios from 'axios';
import { FileText, CheckCircle, UploadCloud, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollegeRequestForm() {
    const [status, setStatus] = useState('idle');
    const [formData, setFormData] = useState({
        college_name: '',
        location: '',
        contact_email: '',
        description: ''
    });

    // State for files
    const [files, setFiles] = useState({
        registration_certificate: null,
        affiliation_proof: null,
        approval_letters: null,
        address_proof: null,
        authorization_letter: null
    });

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ફાઈલો ચેક કરવા માટે (ઓછામાં ઓછી ૨ મુખ્ય ફાઈલો જરૂરી રાખવી હોય તો)
        if(!files.registration_certificate || !files.affiliation_proof) {
            alert("Please upload at least Registration Certificate and Affiliation Proof.");
            return;
        }

        setStatus('loading');

        const data = new FormData();
        data.append('college_name', formData.college_name);
        data.append('location', formData.location);
        data.append('contact_email', formData.contact_email);
        data.append('description', formData.description);

        // Append all files
        Object.keys(files).forEach(key => {
            if (files[key]) data.append(key, files[key]);
        });

        try {
            // બેકએન્ડ API કોલ
            await axios.post('http://localhost:5000/api/requests/submit', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            alert("Submission failed. Please try again later.");
        }
    };

    // Success Message UI
    if (status === 'success') {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="info-card-premium" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <CheckCircle size={60} color="#22c55e" style={{ marginBottom: '20px' }} />
                    <h2 style={{ color: '#22c55e' }}>Application Submitted!</h2>
                    <p className="description-text">
                        Thank you for your interest. Your documents are now in the <b>Verification Queue</b>. 
                        Our team will review them shortly.
                    </p>
                    <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '20px'}}>
                        Credentials and approval status will be sent to: <br/>
                        <strong>{formData.contact_email}</strong>
                    </p>
                    <Link to="/" className="details-btn" style={{textDecoration: 'none', display: 'inline-block'}}>
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            {/* Back Button */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#64748b', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Search
            </Link>

            <div className="magic-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '850px', margin: '0 auto' }}>
                <div className="info-card-premium" style={{boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
                    <div className="card-header" style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{background: '#eff6ff', padding: '10px', borderRadius: '12px'}}>
                                <FileText className="icon-blue" size={32} />
                            </div>
                            <div>
                                <h2 style={{margin: 0}}>College Registration Request</h2>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                                    Provide institutional details for platform onboarding.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        
                        {/* Section 1: Basic Info */}
                        <div>
                            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '15px', borderLeft: '4px solid #2563eb', paddingLeft: '10px' }}>
                                1. Institutional Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label style={{fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>College Full Name</label>
                                    <input type="text" placeholder="e.g. L.D. College of Engineering" required 
                                        onChange={e => setFormData({ ...formData, college_name: e.target.value })} 
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                </div>
                                <div className="input-group">
                                    <label style={{fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Official Admin Email</label>
                                    <input type="email" placeholder="admin@college.edu" required 
                                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })} 
                                        style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                                </div>
                            </div>
                            <div className="input-group" style={{marginTop: '15px'}}>
                                <label style={{fontSize: '0.85rem', marginBottom: '5px', display: 'block'}}>Campus Location (City, State)</label>
                                <input type="text" placeholder="e.g. Ahmedabad, Gujarat" required 
                                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                                    style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                            </div>
                        </div>

                        {/* Section 2: Document Upload */}
                        <div>
                            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '15px', borderLeft: '4px solid #2563eb', paddingLeft: '10px' }}>
                                2. Verification Documents (PDF/Images)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                                {[
                                    { name: 'registration_certificate', label: 'Registration Certificate *' },
                                    { name: 'affiliation_proof', label: 'University Affiliation *' },
                                    { name: 'approval_letters', label: 'AICTE/UGC Approval' },
                                    { name: 'address_proof', label: 'Campus Address Proof' },
                                    { name: 'authorization_letter', label: 'Authorization Letter' }
                                ].map((doc) => (
                                    <div key={doc.name} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            {doc.label}
                                        </label>
                                        <input 
                                            type="file" 
                                            name={doc.name} 
                                            required={doc.name.includes('registration') || doc.name.includes('affiliation')} 
                                            onChange={handleFileChange} 
                                            style={{ fontSize: '0.75rem', width: '100%' }} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Overview */}
                        <div>
                            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '10px', borderLeft: '4px solid #2563eb', paddingLeft: '10px' }}>
                                3. Additional Information
                            </h3>
                            <textarea 
                                style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', outline: 'none' }}
                                placeholder="Briefly describe your institution's history and key achievements..." required
                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="apply-now-btn" 
                            disabled={status === 'loading'}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                padding: '16px',
                                fontSize: '1rem',
                                marginTop: '10px'
                            }}
                        >
                            {status === 'loading' ? (
                                'Uploading Documents...'
                            ) : (
                                <><UploadCloud size={20} /> Submit for Verification</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}