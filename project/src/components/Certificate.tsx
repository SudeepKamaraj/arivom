import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Award, Download, ArrowLeft, Calendar, Star, Share2, CheckCircle } from 'lucide-react';

interface CertificateProps {
  course: any;
  onBack: () => void;
}

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  score: number;
  courseDuration: string;
  skills: string[];
  certificateUrl?: string;
}

const Certificate: React.FC<CertificateProps> = ({ course, onBack }) => {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user && course) {
      generateCertificateData();
    }
  }, [user, course]);

  const generateCertificateData = async () => {
    if (!user || !course) return;
    
    console.log('Generating certificate data for:', { user, course });
    
    try {
      // Get actual assessment score and completion data from backend
      const token = localStorage.getItem('authToken');
      const courseId = course._id || course.id;
      
      let actualScore = 95; // Default score
      let completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
      
      // Try to fetch actual completion data
      if (token && courseId) {
        try {
          const statusResponse = await fetch(`http://localhost:5001/api/courses/${courseId}/status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('Course status data:', statusData);
            
            // Get actual assessment score if available
            if (statusData.assessmentScore) {
              actualScore = Math.round(statusData.assessmentScore);
            }
            
            // Get actual completion date if available
            if (statusData.completionDate) {
              completionDate = new Date(statusData.completionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            }
          }
        } catch (statusError) {
          console.log('Could not fetch course status, using defaults:', statusError);
        }
      }
      
      // Generate certificate data with real information
      const data: CertificateData = {
        certificateId: `ARIVOM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Student',
        courseTitle: course.title || 'Course',
        completionDate,
        score: actualScore,
        courseDuration: course.duration || '2 hours',
        skills: course.skills || course.tags || ['Programming', 'Web Development'],
        certificateUrl: ''
      };
      
      console.log('Generated certificate data:', data);
      setCertificateData(data);
      
      // Save certificate to MongoDB
      await saveCertificateToDatabase(data);
      
    } catch (error) {
      console.error('Error generating certificate data:', error);
      
      // Fallback data if API calls fail
      const fallbackData: CertificateData = {
        certificateId: `ARIVOM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Student',
        courseTitle: course.title || 'Course',
        completionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        score: 95,
        courseDuration: course.duration || '2 hours',
        skills: course.skills || course.tags || ['Programming', 'Web Development'],
        certificateUrl: ''
      };
      
      console.log('Using fallback certificate data:', fallbackData);
      setCertificateData(fallbackData);
    }
  };

  const saveCertificateToDatabase = async (data: CertificateData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          courseId: course._id,
          certificateData: data,
          issuedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setCertificateData(prev => ({ ...prev!, certificateUrl: result.certificateUrl }));
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !certificateData) {
      console.error('Certificate data or element not available');
      return;
    }

    setIsGenerating(true);
    try {
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;

      // Wait briefly for fonts/images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // PDF generation options
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${certificateData.studentName.replace(/\s+/g, '_')}-${certificateData.courseTitle.replace(/\s+/g, '_')}-Certificate.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,   // balanced quality and size
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape' as const
        }
      };

      // Render and download the PDF
      await html2pdf()
        .set(options)
        .from(certificateRef.current)
        .save();

      console.log('Certificate PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Something went wrong while generating your certificate.');
    } finally {
      setIsGenerating(false);
    }
  };

    const handleShare = async () => {
    // Share functionality can be implemented later if needed
    console.log('Share functionality not yet implemented');
  };

  if (!certificateData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Congratulations! 🎉
        </h1>
        <p className="text-gray-600">
          You have successfully completed the course and earned your certificate
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-auto mx-auto" style={{ maxWidth: '1000px' }}>
        {/* Certificate */}
        <div
          ref={certificateRef}
          style={{ 
            backgroundColor: '#f5f3ff',
            padding: '30px',
            textAlign: 'center',
            border: '8px solid #8b5cf6',
            position: 'relative',
            width: '900px',
            height: '650px',
            fontFamily: 'serif',
            margin: '0 auto',
            boxSizing: 'border-box',
            overflow: 'visible'
          }}
        >
          {/* Decorative Border Pattern */}
          <div style={{ 
            position: 'absolute', 
            inset: '10px', 
            border: '3px solid #a855f7',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 8px, #e0e7ff 8px, #e0e7ff 16px)',
            opacity: '0.3'
          }}></div>
          
          {/* Inner Certificate Area */}
          <div style={{ 
            border: '2px solid #7c3aed', 
            backgroundColor: '#fefbff',
            padding: '35px', 
            height: 'calc(100% - 60px)', 
            margin: '30px',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: '10'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              {/* Certificate Number */}
              <div style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '8px 20px',
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'serif'
              }}>
                No: {certificateData.certificateId.slice(-12)}
              </div>
              
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: 'bold', 
                color: '#4c1d95', 
                marginBottom: '8px',
                fontFamily: 'serif',
                letterSpacing: '2px'
              }}>
                Certificate of Completion
              </h1>
            </div>

            {/* Main Content */}
            <div style={{ textAlign: 'center', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ 
                fontSize: '16px', 
                color: '#6b7280', 
                marginBottom: '20px',
                fontFamily: 'serif'
              }}>This is to proudly certify that</p>
              
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                fontStyle: 'italic',
                color: '#4c1d95', 
                marginBottom: '20px',
                fontFamily: 'serif',
                textDecoration: 'underline',
                textDecorationColor: '#8b5cf6'
              }}>
                {certificateData.studentName}
              </h2>
              
              <p style={{ 
                fontSize: '16px', 
                color: '#6b7280', 
                marginBottom: '8px',
                fontFamily: 'serif'
              }}>
                Graduated from the <strong style={{ color: '#4c1d95' }}>{certificateData.courseTitle}</strong> course.
              </p>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                fontFamily: 'serif',
                lineHeight: '1.6',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                Ability to assess candidates' hard skills and understand the requirements of hiring managers.
              </p>
            </div>

            {/* Footer Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '30px'
            }}>
              <div style={{ textAlign: 'left', flex: '1' }}>
                <div style={{ fontWeight: 'bold', color: '#4c1d95', fontFamily: 'serif', fontSize: '16px' }}>
                  Score: {certificateData.score}%
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'serif' }}>Assessment Score</div>
              </div>
              
              <div style={{ textAlign: 'center', flex: '1' }}>
                <div style={{ 
                  width: '80px', 
                  height: '50px',
                  backgroundColor: '#4c1d95',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  position: 'relative'
                }}>
                  <div style={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    fontFamily: 'serif'
                  }}>A</div>
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '50%'
                  }}></div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#4c1d95', fontFamily: 'serif', fontSize: '18px' }}>ARIVOM</div>
                <div style={{ fontSize: '12px', fontFamily: 'serif' }}>Online Learning Platform</div>
              </div>
              
              <div style={{ textAlign: 'right', flex: '1' }}>
                <div style={{ fontWeight: 'bold', color: '#4c1d95', fontFamily: 'serif', fontSize: '16px' }}>
                  {certificateData.completionDate}
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'serif' }}>Certified on</div>
              </div>
            </div>
            
            {/* Certificate ID */}
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'serif' }}>
                Certificate ID: {certificateData.certificateId}
              </div>
            </div>


          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Download Certificate'}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Achievement</span>
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Share your achievement on social media or add it to your professional profile
            </p>
          </div>
        </div>
      </div>

      {/* Course Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Course Completed</h3>
          <p className="text-sm text-gray-600">All lessons and assessments passed</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Final Score</h3>
          <p className="text-sm text-gray-600">{certificateData.score}%</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Skills Mastered</h3>
          <p className="text-sm text-gray-600">{certificateData.skills.length} skills</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Time Invested</h3>
          <p className="text-sm text-gray-600">{certificateData.courseDuration}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
