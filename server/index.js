const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'college_db'
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- 1. API FOR COLLEGE REGISTRATION REQUEST SUBMISSION ---
app.post('/api/requests/submit', upload.fields([
  { name: 'registration_certificate', maxCount: 1 },
  { name: 'affiliation_proof', maxCount: 1 },
  { name: 'approval_letters', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 },
  { name: 'authorization_letter', maxCount: 1 }
]), (req, res) => {
  const { college_name, location, contact_email, description } = req.body;

  const sqlReq = "INSERT INTO college_requests (college_name, location, contact_email, description, status) VALUES (?, ?, ?, ?, 'pending')";

  db.query(sqlReq, [college_name, location, contact_email, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const requestId = result.insertId;
    const files = req.files;
    const docValues = [];

    Object.keys(files).forEach(key => {
      docValues.push([requestId, key, files[key][0].path]);
    });

    // આ ફંક્શન ઈમેલ મોકલવાનું કામ કરશે
    const sendPendingEmail = () => {
      const mailOptions = {
        from: '"Web Admin Team" <1032aastha@gmail.com>',
        to: contact_email,
        subject: "Update: College Registration Request Pending",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h3 style="color: #2563eb;">Dear Admin,</h3>
                <p>Thank you for submitting your request for <b>${college_name}</b>.</p>
                <p>This is to inform you that your request is currently <b>under review</b>. Our team will verify your documents and approve the request within <b>2 working days</b>.</p>
                <p>If you do not hear from us within this timeframe, please feel free to reach out at <b>1032aastha@gmail.com</b>.</p>
                <br/>
                <p>Best Regards,<br/><b>Web Admin Team</b></p>
            </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Pending Email Error:", error);
        else console.log("Pending Email Sent:", info.response);
      });
    };

    if (docValues.length > 0) {
      const sqlDocs = "INSERT INTO request_documents (college_request_id, document_type, file_path) VALUES ?";
      db.query(sqlDocs, [docValues], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        // ડોક્યુમેન્ટ્સ સેવ થયા પછી ઈમેલ મોકલો
        sendPendingEmail();
        res.json({ message: "Request and documents submitted! Notification sent.", requestId });
      });
    } else {
      // જો ડોક્યુમેન્ટ્સ ન હોય તો પણ ઈમેલ મોકલો
      sendPendingEmail();
      res.json({ message: "Request submitted without docs. Notification sent.", requestId });
    }
  });
});

// --- 2. API TO FETCH ALL PENDING COLLEGE REQUESTS ---
app.get('/api/requests', (req, res) => {
  if (req.query.user_role !== 'web_admin') return res.status(403).json({ message: "Unauthorized" });

  // ફેરફાર: માત્ર status = 'pending' હોય તેવી જ રિક્વેસ્ટ લાવવી
  const sql = "SELECT * FROM college_requests WHERE status = 'pending' ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 3. API TO GET DOCUMENTS FOR A SPECIFIC REQUEST ---
app.get('/api/requests/:id/documents', (req, res) => {
  db.query("SELECT * FROM request_documents WHERE college_request_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '1032aastha@gmail.com',
    pass: 'lbafolftxtdjyqyj'
  },
  tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
});

// --- 4. API TO APPROVE COLLEGE REQUEST AND CREATE ADMIN USER ---
app.post('/api/requests/approve-v2', (req, res) => {
  const { requestId, adminEmail, adminPassword, user_role } = req.body;
  if (user_role !== 'web_admin') return res.status(403).json({ message: "Unauthorized" });

  db.query("SELECT * FROM college_requests WHERE id = ? AND status = 'pending'", [requestId], (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: "Request not found" });

    const reqData = results[0];
    const sqlClg = "INSERT INTO colleges (name, location, description, is_profile_complete) VALUES (?, ?, ?, 0)";
    db.query(sqlClg, [reqData.college_name, reqData.location, reqData.description], (err2, clgResult) => {
      if (err2) return res.status(500).json(err2);

      const newClgId = clgResult.insertId;
      const sqlUser = "INSERT INTO users (full_name, email, password, role, college_id) VALUES (?, ?, ?, 'clg_admin', ?)";
      db.query(sqlUser, [reqData.college_name + " Admin", adminEmail, adminPassword, newClgId], (err3) => {
        if (err3) return res.status(500).json({ message: "User error" });

        db.query("UPDATE college_requests SET status = 'approved' WHERE id = ?", [requestId], () => {
          const mailOptions = {
            from: '1032aastha@gmail.com',
            to: reqData.contact_email,
            subject: 'Approved',
            html: `<p>User: ${adminEmail}</p><p>Pass: ${adminPassword}</p>`
          };
          transporter.sendMail(mailOptions, () => res.json({ message: "Approved!" }));
        });
      });
    });
  });
});

// --- 5. API TO REJECT COLLEGE REQUEST WITH REASON ---
app.post('/api/requests/reject', (req, res) => {
  const { requestId, contact_email, reason, user_role } = req.body;

  if (user_role !== 'web_admin') return res.status(403).json({ message: "Unauthorized" });

  // ૧. ડેટાબેઝમાં સ્ટેટસ 'rejected' કરો (અથવા DELETE પણ કરી શકાય)
  const sqlUpdate = "UPDATE college_requests SET status = 'rejected' WHERE id = ?";

  db.query(sqlUpdate, [requestId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // ૨. કોલેજને રીજેક્શનનો મેઈલ મોકલો
    const mailOptions = {
      from: '1032aastha@gmail.com',
      to: contact_email,
      subject: 'Update on your College Registration Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #d32f2f;">Registration Update</h2>
          <p>We have reviewed your request for college registration on our portal.</p>
          <p>Unfortunately, your request has been <b>rejected</b> at this time.</p>
          <p><strong>Reason for rejection:</strong> ${reason || "Provided documents did not meet our criteria."}</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <br/>
          <p>Regards,<br/>Admin Team</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email Error:", error);
        return res.status(500).json({ message: "Rejected in DB, but Email failed." });
      }
      res.json({ message: "Request rejected and email sent successfully! ❌" });
    });
  });
});

// --- 6. API FOR USER SIGNUP ---
app.post('/api/signup', (req, res) => {
  const { full_name, email, password, role, college_id } = req.body;
  const sql = "INSERT INTO users (full_name, email, password, role, college_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [full_name, email, password, role, college_id || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User registered successfully." });
  });
});

// --- 7. API FOR USER LOGIN ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length > 0) { res.json(result[0]); }
    else { res.status(401).json({ message: "Invalid credentials" }); }
  });
});

// --- 8. API TO SEARCH COLLEGES WITH FILTERS ---
app.get('/api/colleges', (req, res) => {
  const search = `%${req.query.search || ''}%`;
  const user_role = req.query.user_role; // ફ્રન્ટએન્ડ માંથી રોલ મોકલવો પડશે

  // બેઝ ક્વેરી - જેમાં ફિલ્ટર્સ છે
  let sql = `
    SELECT DISTINCT c.*, 
    (SELECT COUNT(*) FROM users u WHERE u.college_id = c.id AND u.role = 'clg_admin') as admin_count
    FROM colleges c 
    LEFT JOIN courses crs ON c.id = crs.college_id
    WHERE (
      c.name LIKE ? OR 
      c.location LIKE ? OR 
      c.city LIKE ? OR 
      crs.course_name LIKE ? OR 
      crs.stream LIKE ?
    )`;

  // જો જોનાર વ્યક્તિ 'web_admin' ના હોય, તો જ ફિલ્ટર લગાવો (માત્ર Live કોલેજ બતાવો)
  // જો એડમિન હોય, તો તેને બધી જ કોલેજો દેખાશે
  if (user_role !== 'web_admin') {
    sql += ` AND c.is_profile_complete = 1 `;
  }

  sql += ` ORDER BY c.id DESC`; // નવી કોલેજ ઉપર આવે તે માટે

  db.query(sql, [search, search, search, search, search], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 9. API TO GET DETAILED COLLEGE INFO BY ID ---
app.get('/api/colleges/:id', (req, res) => {
  const sql = `
        SELECT c.*, MAX(p.highest_package) as highest_package, MAX(p.average_package) as average_package 
        FROM colleges c 
        LEFT JOIN placements p ON c.id = p.college_id 
        WHERE c.id = ?
        GROUP BY c.id`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// --- 10. API TO DELETE A COLLEGE RECORD ---
app.delete('/api/colleges/:id', (req, res) => {
  if (req.query.user_role !== 'web_admin') return res.status(403).json({ message: "Unauthorized" });
  db.query("DELETE FROM colleges WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "College record removed." });
  });
});

// --- 11. API TO ADD COLLEGE TO SHORTLIST ---
app.post('/api/shortlist', (req, res) => {
  const { user_id, college_id } = req.body;
  db.query("INSERT INTO shortlists (user_id, college_id) VALUES (?, ?)", [user_id, college_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Shortlisted!" });
  });
});

// --- 12. API TO GET COLLEGE PROFILE WITH COURSES ---
app.get('/api/colleges/full-view/:id', (req, res) => {
  const id = req.params.id;

  const sqlClg = `SELECT * FROM colleges WHERE id = ?`; // સાદી ક્વેરી

  db.query(sqlClg, [id], (err, clgRes) => {
    if (err) return res.status(500).json(err);

    // જો કોલેજ ન મળે તો 404 મોકલો
    if (clgRes.length === 0) {
      return res.status(404).json({ message: "College not found in database" });
    }

    db.query("SELECT * FROM courses WHERE college_id = ?", [id], (err2, courseRes) => {
      if (err2) return res.status(500).json(err2);
      res.json({ college: clgRes[0], courses: courseRes });
    });
  });
});

// --- 13. API TO GET LIST OF STUDENTS WHO SHORTLISTED A COLLEGE ---
app.get('/api/college/shortlisted-students/:collegeId', (req, res) => {
  const { collegeId } = req.params;
  const sql = `
    SELECT u.full_name, u.email, s.id as shortlist_id 
    FROM shortlists s
    JOIN users u ON s.user_id = u.id
    WHERE s.college_id = ?`;

  db.query(sql, [collegeId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// --- 14. API FOR COLLEGE ADMIN TO BUILD INITIAL PROFILE ---
app.put('/api/colleges/build-profile/:id', (req, res) => {
  const { name, location, description, rating, highest_package, fees, image_name } = req.body;

  // image_name માં ફ્રન્ટએન્ડથી માત્ર "iima.jpg" જેવું નામ મોકલવું
  const sql = `
    UPDATE colleges 
    SET name=?, location=?, description=?, rating=?, highest_package=?, fees=?, image_url=?, is_profile_complete=1 
    WHERE id=?
  `;

  db.query(sql, [name, location, description, rating, highest_package, fees, image_name, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database Error", error: err });
    res.json({ message: "Profile updated using local public assets!" });
  });
});

// --- 15. API TO FETCH APPLICATIONS SUBMITTED BY A STUDENT ---
app.get('/api/student/applications/:userId', (req, res) => {
  const userId = req.params.userId;
  // અહી તમારી ટેબલના નામ મુજબ ફેરફાર કરજો (દા.ત. applications ટેબલ)
  const sql = `
    SELECT a.*, c.name as college_name 
    FROM applications a
    JOIN colleges c ON a.college_id = c.id
    WHERE a.user_id = ?
    ORDER BY a.applied_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// --- 16. API FOR STUDENT TO APPLY TO A COLLEGE ---
app.post('/api/applications/apply', (req, res) => {
  const { user_id, college_id, course_name } = req.body;

  const sql = "INSERT INTO applications (user_id, college_id, course_name) VALUES (?, ?, ?)";
  db.query(sql, [user_id, college_id, course_name], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Application submitted successfully!" });
  });
});

// --- 17. API TO GET DOCUMENTS BY REQUEST ID ---
app.get('/api/requests/documents/:requestId', (req, res) => {
  const requestId = req.params.requestId;
  const sql = "SELECT * FROM request_documents WHERE college_request_id = ?";

  db.query(sql, [requestId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// --- 18. API TO SET ALL COLLEGES AS LIVE ---
app.put('/api/admin/make-all-live', (req, res) => {
  db.query("UPDATE colleges SET is_profile_complete = 1 WHERE is_profile_complete = 0", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Colleges live!" });
  });
});

// --- 19. API TO GET ALL SHORTLISTED COLLEGES FOR A USER ---
app.get('/api/shortlist/:userId', (req, res) => {
  db.query(`SELECT c.* FROM colleges c JOIN shortlists s ON c.id = s.college_id WHERE s.user_id = ? GROUP BY c.id`, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// --- 20. API TO ADD OFFICIAL COLLEGE DIRECTLY BY WEB ADMIN ---
app.post('/api/admin/add-college', (req, res) => {
  const {
    name, location, city, type, ownership, rating, description,
    establishment_year, admission_open, highest_package,
    average_package, starting_fees, top_recruiters,
    is_profile_complete, official_website, 
    image_name, brochure_name, 
    courses 
  } = req.body;

  let final_image = image_name || 'default-college.png';
  let final_brochure = brochure_name || '';

  const sqlInsert = `INSERT INTO colleges (name, location, city, type, ownership, rating, image_url, description, establishment_year, admission_open, brochure_url, highest_package, average_package, starting_fees, top_recruiters, is_profile_complete, official_website) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [name, location, city, type, ownership, rating, final_image, description, establishment_year, admission_open, final_brochure, highest_package, average_package, starting_fees, top_recruiters, is_profile_complete, official_website];

  db.query(sqlInsert, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const newCollegeId = result.insertId;

    if (courses) {
      try {
        const coursesArray = typeof courses === 'string' ? JSON.parse(courses) : courses;
        if (coursesArray.length > 0) {
          const courseValues = coursesArray.map(c => [newCollegeId, c.course_name, c.total_fees, c.duration, c.stream]);
          const sqlCourse = "INSERT INTO courses (college_id, course_name, total_fees, duration, stream) VALUES ?";
          db.query(sqlCourse, [courseValues], (err2) => {
            if (err2) console.error("Course Insert Error:", err2);
          });
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    }
    res.json({ message: "Official College Added Successfully using Public Assets!", id: newCollegeId });
  });
});

// --- 21. API TO UPDATE FULL COLLEGE DETAILS ---
app.put('/api/college-admin/full-update/:collegeId', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'brochure', maxCount: 1 }
]), (req, res) => {
  const collegeId = req.params.collegeId;
  const {
    name, location, city, type, ownership, rating, description,
    establishment_year, admission_open, highest_package,
    average_package, starting_fees, top_recruiters,
    is_profile_complete, official_website, image_url, brochure_url,
    courses // અપડેટ માટેના નવા કોર્સિસ
  } = req.body;

  let final_image = (req.files && req.files['image'])
    ? `/uploads/${req.files['image'][0].filename}`
    : image_url;

  let final_brochure = (req.files && req.files['brochure'])
    ? `/uploads/${req.files['brochure'][0].filename}`
    : brochure_url;

  const sqlUpdate = `UPDATE colleges SET 
    name=?, location=?, city=?, type=?, ownership=?, rating=?, image_url=?, 
    description=?, establishment_year=?, admission_open=?, brochure_url=?, 
    highest_package=?, average_package=?, starting_fees=?, top_recruiters=?, 
    is_profile_complete=?, official_website=? WHERE id=?`;

  const values = [
    name, location, city, type, ownership, rating, final_image,
    description, establishment_year, admission_open, final_brochure,
    highest_package, average_package, starting_fees, top_recruiters,
    Number(is_profile_complete), official_website, collegeId
  ];

  db.query(sqlUpdate, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // કોર્સિસ અપડેટ કરવા માટે: પહેલા જૂના ડીલીટ કરો, પછી નવા ઇન્સર્ટ કરો
    if (courses) {
      db.query("DELETE FROM courses WHERE college_id = ?", [collegeId], (errDel) => {
        if (errDel) return console.error("Delete Courses Error:", errDel);
        
        try {
          const coursesArray = JSON.parse(courses);
          if (coursesArray.length > 0) {
            const courseValues = coursesArray.map(c => [collegeId, c.course_name, c.total_fees, c.duration, c.stream]);
            const sqlCourseInsert = "INSERT INTO courses (college_id, course_name, total_fees, duration, stream) VALUES ?";
            db.query(sqlCourseInsert, [courseValues], (errIns) => {
              if (errIns) console.error("Insert Courses Error:", errIns);
            });
          }
        } catch (e) {
          console.error("JSON Parse Error (Update Courses):", e);
        }
      });
    }

    res.json({ message: "College Updated Successfully! ✅" });
  });
});

// --- 22. API TO HANDLE APPLY NOW FORM SUBMISSIONS (STORE IN JSON) ---
app.post('/api/applications/apply', (req, res) => {
  try {
    const { collegeId, collegeName, name, email, phone, course, message } = req.body;

    // Create new application object
    const newApplication = {
      applicationId: Date.now(),
      collegeId,
      collegeName,
      studentName: name,
      email,
      phone,
      course,
      message,
      appliedAt: new Date().toISOString()
    };

    const filePath = path.join(__dirname, 'data', 'applications.json');

    // Ensure the directory exists
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'));
    }

    // Read existing data
    let applications = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      applications = JSON.parse(fileData || "[]");
    }

    // Add new application to the array
    applications.push(newApplication);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    res.status(200).json({ success: true, message: "Application submitted successfully." });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

// --- 23. API FOR ADMIN TO VIEW APPLICATIONS FROM JSON FILE ---
app.get('/api/admin/applications/:collegeId', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'applications.json');

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const allApps = JSON.parse(fileData || "[]");

    // Filter applications by collegeId
    const collegeApps = allApps.filter(app => app.collegeId == req.params.collegeId);
    res.status(200).json(collegeApps);
  } else {
    res.status(200).json([]);
  }
});

// --- 24. API TO EXPORT APPLICATIONS TO TEXT FORMAT ---
app.get('/api/admin/export-applications/:collegeId', (req, res) => {
  const collegeId = req.params.collegeId;
  const filePath = path.join(__dirname, 'data', 'applications.json');

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const allApplications = JSON.parse(fileData || "[]");

    // ફક્ત લોગિન થયેલ કોલેજ એડમિનનો ડેટા ફિલ્ટર કરો
    const collegeApps = allApplications.filter(app => String(app.collegeId) === String(collegeId));

    if (collegeApps.length === 0) {
      return res.status(200).send(`--- NO APPLICATIONS FOUND FOR COLLEGE ID: ${collegeId} ---`);
    }

    // JSON ડેટાને મસ્ત Text ફોર્મેટમાં ફેરવો
    let textContent = `--- STUDENT APPLICATIONS LIST (COLLEGE ID: ${collegeId}) ---\n`;
    textContent += `Generated on: ${new Date().toLocaleString()}\n`;
    textContent += `====================================================\n\n`;

    collegeApps.forEach((app, index) => {
      textContent += `Application #${index + 1}\n`;
      textContent += `Student Name : ${app.studentName}\n`;
      textContent += `Email        : ${app.email}\n`;
      textContent += `Phone        : ${app.phone}\n`;
      textContent += `Course       : ${app.course}\n`;
      textContent += `Message      : ${app.message || 'No message provided'}\n`;
      textContent += `Applied Date : ${new Date(app.appliedAt).toLocaleString()}\n`;
      textContent += `----------------------------------------------------\n\n`;
    });

    // Response as Plain Text
    res.setHeader('Content-Type', 'text/plain');
    res.send(textContent);
  } else {
    res.status(404).send("Error: Applications data file not found.");
  }
});

// --- 25. API TO REMOVE COLLEGE FROM SHORTLIST ---
app.delete('/api/shortlist/:userId/:collegeId', (req, res) => {
  db.query("DELETE FROM shortlists WHERE user_id = ? AND college_id = ?", [req.params.userId, req.params.collegeId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Removed." });
  });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000/api/colleges/"));