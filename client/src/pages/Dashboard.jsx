import React from 'react';
import AdminDashboard from '../dashboards/AdminDashboard';
import StudentDashboard from '../dashboards/StudentDashboard';
import CollegeAdminDashboard from '../dashboards/CollegeAdminDashboard';

export default function Dashboard({ user }) {
    if (!user) {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <p>Loading user profile...</p>
            </div>
        );
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'web_admin':
                return <AdminDashboard user={user} />;
            
            case 'clg_admin':
                return <CollegeAdminDashboard user={user} />;
            
            case 'student':
                return <StudentDashboard user={user} />;
            
            default:
                return (
                    <div className="info-card-premium">
                        <h1>Welcome, {user.full_name || 'User'}</h1>
                        <p>Access Level: {user.role?.replace('_', ' ')}</p>
                        <p style={{marginTop: '10px', color: '#666'}}>
                            Please contact support if you don't see your specific tools here.
                        </p>
                    </div>
                );
        }
    };

    return (
    <div className="container" style={{ padding: '60px 0' }}>
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
            <span className="role-tag" style={{ 
                background: '#eff6ff', 
                color: '#2563eb', 
                padding: '5px 15px', 
                borderRadius: '20px', 
                fontSize: '0.8rem', 
                fontWeight: 'bold', 
                textTransform: 'uppercase' 
            }}>
                {user.full_name ? `${user.full_name}` : user.role?.replace('_', ' ')} Portal
            </span>
        </div>
        
        {renderDashboard()}
    </div>
);
}