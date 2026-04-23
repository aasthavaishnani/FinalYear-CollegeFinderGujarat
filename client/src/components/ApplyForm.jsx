import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import axios from 'axios';

export default function ApplyForm({ collegeName, onClose, collegeId, courses }) {
    // LocalStorage માંથી લોગિન થયેલ યુઝરની માહિતી મેળવો
    const user = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        name: user ? user.full_name : '', // જો લોગિન હોય તો નામ પહેલેથી ભરાયેલું આવશે
        email: user ? user.email : '',    // જો લોગિન હોય તો ઈમેઈલ પહેલેથી ભરાયેલો આવશે
        phone: '',
        course: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please login first to apply! ✨");
            return;
        }

        try {
            // બેકએન્ડમાં ડેટા મોકલો
            const response = await axios.post('http://localhost:5000/api/applications/apply', {
                user_id: user.id,              // ડેટાબેઝ માટે અત્યંત જરૂરી
                college_id: collegeId,        // ડેટાબેઝ માટે અત્યંત જરૂરી
                course_name: formData.course,  // ડેટાબેઝ માટે અત્યંત જરૂરી
                student_name: formData.name,
                student_email: formData.email,
                student_phone: formData.phone,
                message: formData.message
            });
            
            if (response.status === 200) {
                alert("Your application has been submitted successfully to the college admin! ✅");
                onClose();
            }
        } catch (err) {
            console.error("Submission Error:", err);
            alert("Something went wrong. Please try again later.");
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Apply to {collegeName}</h2>
                    <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            required 
                            onChange={handleChange} 
                            placeholder="Enter your name" 
                            style={styles.input} 
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={{...styles.field, flex: 1}}>
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                required 
                                onChange={handleChange} 
                                placeholder="example@mail.com" 
                                style={styles.input} 
                            />
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                required 
                                onChange={handleChange} 
                                placeholder="98765 43210" 
                                style={styles.input} 
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label>Select Course</label>
                        <select name="course" required onChange={handleChange} style={styles.input}>
                            <option value="">-- પસંદ કરો --</option>
                            {courses.map((c, i) => (
                                <option key={i} value={c.course_name}>{c.course_name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.field}>
                        <label>Why do you want to join?</label>
                        <textarea name="message" rows="3" onChange={handleChange} placeholder="તમારો સંદેશ..." style={styles.input}></textarea>
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        <Send size={18} /> Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    title: { fontSize: '20px', color: '#333', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#666' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    field: { display: 'flex', flexDirection: 'column', gap: '5px' },
    row: { display: 'flex', gap: '15px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
    submitBtn: { background: '#00a02f', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }
};



// INSERT INTO colleges (name, location, city, type, ownership, rating, image_url, description, establishment_year, admission_open, brochure_url, highest_package, average_package, starting_fees, top_recruiters, is_profile_complete, official_website) 
