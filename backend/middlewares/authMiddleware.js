import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Authorization header missing' 
    });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Token missing' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Invalid or expired token' 
      });
    }
    
    // Verify admin role
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin privileges required'
      });
    }
    
    req.admin = decoded;
    next();
  });
};
