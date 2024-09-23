import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'Không có token, quyền truy cập bị từ chối' });
  }

  try {
    const decoded = jwt.verify(token, 'yourSecretKey');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Bạn không có quyền truy cập tài nguyên này' });
    }
    next();
  };
};
