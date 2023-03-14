const Config = require("../models/Config");
const SmsCode = require("../models/SmsCode");
const axios = require("axios");
const FormData = require("form-data");

class SendSmsService {
  #login = process.env.SMS_GATEWAY_LOGIN || "info@urgaz.com";
  #password = process.env.SMS_GATEWAY_PASSWORD || "CHtMFo2oAP0ltSpZcD7j1zX7Scy1UbTvuHeJZHoZ";

  async sendSMS(phone, template) {
    // Example: template="Your verification code is %code%. Do not give it to anyone!"

    if (!template) template = "Your verification code is %code%.";

    const config = await Config.findOne({ key: this.#login });
    let token;

    if (!config) {
      token = await this.#getTokenAndSave();
    }

    token = config.value;

    try {
      const code = Math.floor(Math.random() * 9000) + 1000;
      
      let phoneNumber = phone.replace(/\+/g, "").replace(/ /g, "");
      if (!phoneNumber.startsWith("998")) phoneNumber = "998" + phoneNumber;

      const re = /%code%/gi;
      const message = template.replace(re, code);

      const data = new FormData();
      data.append("mobile_phone", phoneNumber);
      data.append("message", message);

      const response = await axios.post(
        "http://notify.eskiz.uz/api/message/sms/send",
        data,
        {
          headers: {
            ...data.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await SmsCode.deleteOne({ phone });

      const newSmsCode = new SmsCode({
        phone,
        code,
        smsId: response.data.id,
      });
      await newSmsCode.save();

      return response.data;
    } catch (e) {
      if (e.response.statusText === "Unauthorized") {
        await this.#getTokenAndSave();
        throw new Error(
          `SMS gateway error when sending sms. Error message: ${e.message} (Unauthorized!)`
        );
      }
      throw new Error(
        `SMS gateway error when sending sms. Error message: ${e.message}`
      );
    }
  }

  async #getTokenAndSave() {
    try {
      const data = new FormData();
      data.append("email", this.#login);
      data.append("password", this.#password);

      const response = await axios.post(
        "http://notify.eskiz.uz/api/auth/login",
        data,
        {
          headers: {
            ...data.getHeaders(),
          },
        }
      );

      const config = await Config.findOne({ key: this.#login });

      if (config) {
        config.value = response.data.data.token;
        await config.save();
      } else {
        const newToken = new Config({
          key: this.#login,
          value: response.data.data.token,
        });

        await newToken.save();
      }

      return response.data.data.token;
    } catch (e) {
      throw new Error("SMS gateway error when receiving a new token!");
    }
  }
}

module.exports = new SendSmsService();
