import Order from "../models/OderModel.js"; // Đảm bảo đúng chính tả file
import moment from "moment";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios"; // Thêm axios để thực hiện gọi API
import qs from "qs"; // Thêm qs để serialize data cho POST request

dotenv.config();

const config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  };

class zaloController {
  // tạo mã quét zalo pay
  async createZaloPayCode(req, res) {
    const { orderId } = req.body;

      // Kiểm tra ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      // Tìm đơn hàng
      const orderDetail = await Order.findById(orderId);
      if (!orderDetail) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }
    const embed_data = {
        //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
        redirecturl: 'https://phongthuytaman.com',
      };
    
      const items = [];
      const transID = Math.floor(Math.random() * 1000000);
    
      const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: 'user123',
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: orderDetail.totalPrice.toString(),
        //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
        //Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
        callback_url: 'https://b074-1-53-37-194.ngrok-free.app/callback',
        description: `Lazada - Payment for the  #${transID}`,
        bank_code: '',
      };
    
      // appid|app_trans_id|appuser|amount|apptime|embeddata|item
      const data =
        config.app_id +
        '|' +
        order.app_trans_id +
        '|' +
        order.app_user +
        '|' +
        order.amount +
        '|' +
        order.app_time +
        '|' +
        order.embed_data +
        '|' +
        order.item;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
    
      try {
        const result = await axios.post(config.endpoint, null, { params: order });
    
        return res.status(200).json(result.data);
      } catch (error) {
        console.log(error);
      }
  }

  async callback(req, res) {
    let result = {};
  console.log(req.body);
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log('mac =', mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = 'mac not equal';
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng ở đây
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson['app_trans_id'],
      );

      result.return_code = 1;
      result.return_message = 'success';
    }
  } catch (ex) {
    console.log('lỗi:::' + ex.message);
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
  }

  async checkOrder(req, res) {
    const { app_trans_id } = req.body;

    let postData = {
      app_id: config.app_id,
      app_trans_id, // Input your app_trans_id
    };
  
    let data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  
    let postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    };
  
    try {
      const result = await axios(postConfig);
      console.log(result.data);
      return res.status(200).json(result.data);
      /**
       * kết quả mẫu
        {
          "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
          "return_message": "",
          "sub_return_code": 1,
          "sub_return_message": "",
          "is_processing": false,
          "amount": 50000,
          "zp_trans_id": 240331000000175,
          "server_time": 1711857138483,
          "discount_amount": 0
        }
      */
    } catch (error) {
      console.log('lỗi');
      console.log(error);
    }
  }
}

export default zaloController;
