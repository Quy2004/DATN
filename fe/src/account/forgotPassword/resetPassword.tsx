import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/reset-password', { token, newPassword });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
        }
    };

    return (
        <div className="reset-password">
            <h2>Đặt Lại Mật Khẩu</h2>
            <form onSubmit={handleResetPassword}>
                <label>Mật khẩu mới:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button type="submit">Xác nhận</button>
                <p>{message}</p>
            </form>
        </div>
    );
};

export default ResetPassword;
